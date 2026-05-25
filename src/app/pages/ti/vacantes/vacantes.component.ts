import { Component, OnDestroy, OnInit } from '@angular/core';
import { SiguService } from '../../../services/sigu.service';
import { JobService, JobResponse } from '../../../services/job.service';
import { NzMessageService } from 'ng-zorro-antd/message';

import {
  Subscription,
  interval,
  switchMap,
  takeWhile,
  catchError,
  of,
} from 'rxjs';

interface Vacante {
  n_codper: number;
  c_codfac: string;
  c_codesp: string; // especialidad
  c_codcur: string; // codigo curso
  c_nomcur: string;
  c_grpcur: string;
  c_codmod: string; // modalidad (1,2,...)
  n_codpla: number;
  c_sedcod: string;

  n_vactot: number;
  n_vacmax: number;
  n_vacmat: number;

  n_ciclo?: number;
}

@Component({
  selector: 'app-vacantes',
  standalone: false,
  templateUrl: './vacantes.component.html',
  styleUrl: './vacantes.component.css',
})
export class VacantesComponent implements OnInit, OnDestroy {
  loading = false;

  // data
  allVacantes: Vacante[] = [];
  filteredVacantes: Vacante[] = [];
  pageData: Vacante[] = [];

  // pagination
  total = 0;
  pageIndex = 1;
  pageSize = 10;

  // filters
  searchCodCur = '';
  selectedEspecialidad: string | null = null;
  selectedModalidad: string | null = null;
  selectedCiclo: number | null = null;

  // options
  especialidades: string[] = [];
  modalidades: string[] = [];
  ciclos: number[] = [];

  // ---- edición ----
  editId: string | null = null;
  editCache: Record<string, Vacante> = {};

  // ---- JOB / polling ----
  private jobPollingSub?: Subscription;

  savingJobId: string | null = null;
  savingRowId: string | null = null;

  // snapshot para revertir si falla
  beforeSaveSnapshot: Record<string, Vacante> = {};

  constructor(
    private siguServices: SiguService,
    private jobService: JobService,
    private msg: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.getVacantes();
  }

  ngOnDestroy(): void {
    this.jobPollingSub?.unsubscribe();
  }

  getVacantes() {
    this.loading = true;

    this.siguServices.getVacantes().subscribe({
      next: (data: any) => {
        this.allVacantes = Array.isArray(data) ? (data as Vacante[]) : [];
        this.buildFilterOptions();
        this.applyFilters(true);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error vacantes =>', err);
        this.allVacantes = [];
        this.filteredVacantes = [];
        this.pageData = [];
        this.total = 0;
        this.loading = false;
      },
    });
  }

  private buildFilterOptions() {
    const espSet = new Set<string>();
    const modSet = new Set<string>();
    const cicloSet = new Set<number>();

    for (const v of this.allVacantes) {
      if (v.c_codesp) espSet.add(v.c_codesp);
      if (v.c_codmod) modSet.add(String(v.c_codmod));
      if (typeof v.n_ciclo === 'number') cicloSet.add(v.n_ciclo);
    }

    this.especialidades = Array.from(espSet).sort();
    this.modalidades = Array.from(modSet).sort((a, b) => Number(a) - Number(b));
    this.ciclos = Array.from(cicloSet).sort((a, b) => a - b);
  }

  applyFilters(resetPage = false) {
    if (resetPage) this.pageIndex = 1;

    const termRaw = this.searchCodCur.trim().toUpperCase();
    const terms = termRaw ? termRaw.split(/\s+/).filter(Boolean) : [];

    this.filteredVacantes = this.allVacantes.filter((v) => {
      const cod = (v.c_codcur || '').toUpperCase();
      const nom = (v.c_nomcur || '').toUpperCase();

      const matchSearch = terms.length
        ? terms.every((t) => cod.includes(t) || nom.includes(t))
        : true;

      const matchEsp = this.selectedEspecialidad
        ? v.c_codesp === this.selectedEspecialidad
        : true;

      const matchMod = this.selectedModalidad
        ? String(v.c_codmod) === String(this.selectedModalidad)
        : true;

      const matchCiclo =
        this.selectedCiclo !== null
          ? typeof v.n_ciclo === 'number' && v.n_ciclo === this.selectedCiclo
          : true;

      return matchSearch && matchEsp && matchMod && matchCiclo;
    });

    this.total = this.filteredVacantes.length;
    this.refreshPageData();
  }

  refreshPageData() {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pageData = this.filteredVacantes.slice(start, end);
  }

  onPageIndexChange(pi: number) {
    this.pageIndex = pi;
    this.refreshPageData();
  }

  onPageSizeChange(ps: number) {
    this.pageSize = ps;
    this.pageIndex = 1;
    this.refreshPageData();
  }

  clearFilters() {
    this.searchCodCur = '';
    this.selectedEspecialidad = null;
    this.selectedModalidad = null;
    this.selectedCiclo = null;
    this.applyFilters(true);
  }

  disponibles(v: Vacante): number {
    return (v.n_vacmax ?? 0) - (v.n_vacmat ?? 0);
  }

  // ============ helpers ============

  getRowId(v: Vacante): string {
    return [
      v.n_codper,
      v.c_codfac,
      v.c_codcur,
      v.c_grpcur,
      v.c_codmod,
      v.c_codesp,
      v.n_codpla,
    ].join('|');
  }

  isRowBusy(v: Vacante): boolean {
    return this.loading && this.savingRowId === this.getRowId(v);
  }

  // ============ edición ============

  startEdit(v: Vacante) {
    if (this.loading) return;

    const id = this.getRowId(v);
    this.editId = id;
    this.editCache[id] = { ...v };
  }

  cancelEdit(v: Vacante) {
    const id = this.getRowId(v);
    if (this.isRowBusy(v)) return;

    delete this.editCache[id];
    this.editId = null;
  }

  onChangeVacantes(v: Vacante, value: number) {
    const id = this.getRowId(v);
    const row = this.editCache[id];
    if (!row) return;

    const val = Number(value) || 0;
    row.n_vactot = val;
    row.n_vacmax = val;
  }

  // ============ Guardar con polling ============

  saveEdit(v: Vacante) {
    const id = this.getRowId(v);
    const row = this.editCache[id];
    if (!row) return;
    if (this.loading) return;

    // 1) Snapshot del original (para revertir si falla)
    const original = this.allVacantes.find((x) => this.getRowId(x) === id);
    if (original) this.beforeSaveSnapshot[id] = { ...original };

    // 2) Optimistic UI (se ve el cambio, pero NO confirmas éxito aún)
    const idx = this.allVacantes.findIndex((x) => this.getRowId(x) === id);
    if (idx !== -1) {
      this.allVacantes[idx] = { ...this.allVacantes[idx], ...row };
    }
    this.applyFilters(false);

    // 3) Cierra edición
    delete this.editCache[id];
    this.editId = null;

    // 4) Loader + lock fila
    this.loading = true;
    this.savingRowId = id;

    // 5) enqueue al backend (Nest)
    this.siguServices
      .updateVacante({
        n_codper: 20262, // aquí tu periodo fijo (si aplica)
        c_codfac: row.c_codfac,
        c_codcur: row.c_codcur,
        c_grpcur: row.c_grpcur,
        c_codmod: row.c_codmod,
        c_codesp: row.c_codesp,
        n_codpla: row.n_codpla,
        n_vactot: row.n_vactot,
        n_vacmax: row.n_vacmax,
      })
      .subscribe({
        next: (res: any) => {
          const jobId = res?.jobId ? String(res.jobId) : null;

          if (!jobId) {
            this.onJobFailed(id, 'No se recibió jobId del backend.');
            return;
          }

          this.savingJobId = jobId;
          this.startPollingJob(jobId, id);
        },
        error: (err) => {
          console.error(err);
          this.onJobFailed(id, 'Error al encolar el job.');
        },
      });
  }

  private startPollingJob(jobId: string, rowId: string) {
    // corta polling anterior
    this.jobPollingSub?.unsubscribe();

    const startedAt = Date.now();
    const TIMEOUT_MS = 30_000; // 30s

    // mensaje fijo (sin duración)
    this.msg.loading('Procesando actualización...', { nzDuration: 0 });

    this.jobPollingSub = interval(2000)
      .pipe(
        switchMap(() =>
          this.jobService.getJobById(jobId).pipe(
            catchError((err) => {
              console.error('Job status error =>', err);
              return of(null as unknown as JobResponse);
            }),
          ),
        ),
        // seguimos mientras no sea completed/failed; el true hace que emita el último estado también
        takeWhile((job) => {
          if (!job) return true;
          return job.state !== 'completed' && job.state !== 'failed';
        }, true),
      )
      .subscribe((job) => {
        // timeout manual
        const elapsed = Date.now() - startedAt;
        if (elapsed > TIMEOUT_MS) {
          this.msg.remove();
          this.loading = false;
          this.savingJobId = null;
          this.savingRowId = null;
          this.msg.warning(
            'Sigue procesándose en segundo plano. Refresca en unos segundos.',
          );
          this.jobPollingSub?.unsubscribe();
          return;
        }

        if (!job) return;

        if (job.state === 'completed') {
          this.msg.remove();
          this.loading = false;
          this.savingJobId = null;
          this.savingRowId = null;

          const affected = job?.returnvalue?.affectedRows ?? 0;
          if (affected <= 0) {
            this.onJobFailed(
              rowId,
              'El worker terminó pero no afectó filas (affectedRows=0).',
            );
            this.jobPollingSub?.unsubscribe();
            return;
          }

          // ya fue confirmado
          delete this.beforeSaveSnapshot[rowId];
          this.msg.success('Actualizado correctamente ✅');
          this.jobPollingSub?.unsubscribe();
          return;
        }

        if (job.state === 'failed') {
          this.msg.remove();
          const reason = job.failedReason || 'Job failed';
          this.onJobFailed(rowId, reason);
          this.jobPollingSub?.unsubscribe();
          return;
        }
      });
  }

  private onJobFailed(rowId: string, reason: string) {
    this.loading = false;
    this.savingJobId = null;
    this.savingRowId = null;

    // Revertir en UI usando snapshot
    const snapshot = this.beforeSaveSnapshot[rowId];
    if (snapshot) {
      const idx = this.allVacantes.findIndex((x) => this.getRowId(x) === rowId);
      if (idx !== -1) this.allVacantes[idx] = { ...snapshot };
      delete this.beforeSaveSnapshot[rowId];
      this.applyFilters(false);
    } else {
      // si no hay snapshot, puedes refrescar (opcional)
      // this.getVacantes();
    }

    this.msg.error(`Falló la actualización ❌ (${reason})`);
  }

  // solo debug
  printWhere(v: Vacante) {
    const where = `
      n_codper = ${v.n_codper}
      AND c_codfac = '${v.c_codfac}'
      AND c_codcur = '${v.c_codcur}'
      AND c_grpcur = '${v.c_grpcur}'
      AND c_codmod = '${v.c_codmod}'
      AND c_codesp = '${v.c_codesp}'
      AND n_codpla = ${v.n_codpla}
    `.trim();

    console.log(where);
  }
}
