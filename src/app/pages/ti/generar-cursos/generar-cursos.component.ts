import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams, NzTableSortOrder } from 'ng-zorro-antd/table';

import { TurnoService } from '../../../services/turno.service';
import { HR_Turno } from '../../../interfaces/hr/hr_turno';
import { HR_Plan_Estudio_Curso } from '../../../interfaces/hr/hr_plan_estudio_curso';
import { HR_Curso } from '../../../interfaces/hr/hr_curso';

type FilaCursoPlan = HR_Plan_Estudio_Curso & { cursoGenerado: HR_Curso | null };

@Component({
  selector: 'app-generar-cursos',
  standalone: false,
  templateUrl: './generar-cursos.component.html',
  styleUrl: './generar-cursos.component.css',
})
export class GenerarCursosComponent implements OnInit {
  turno_id!: number;
  turno!: HR_Turno;

  // Datos
  listOfData: FilaCursoPlan[] = [];
  displayData: FilaCursoPlan[] = [];

  cursosPlan: HR_Plan_Estudio_Curso[] = [];
  cursos: HR_Curso[] = [];

  // UI state
  loading = false;

  // Filtros/orden
  searchText = '';
  estadoFiltro: 'generado' | 'pendiente' | null = null;
  sortKey: keyof FilaCursoPlan | null = null;
  sortDirection: NzTableSortOrder = null;

  // Modal
  cursoSeleccionado!: HR_Plan_Estudio_Curso;
  isVisible = false;
  vacantes = 20;

  constructor(
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.turno_id = Number(this.route.snapshot.paramMap.get('turno_id'));
    this.getTurno();
    this.getDataTable();
  }

  getTurno() {
    this.turnoService.getTurno(this.turno_id).subscribe((data) => {
      this.turno = data;
    });
  }

  getDataTable() {
    this.loading = true;
    forkJoin({
      plan: this.turnoService.getCursosPlanTurno(this.turno_id),
      turno: this.turnoService.getTurno(this.turno_id),
    }).subscribe({
      next: ({ plan, turno }) => {
        this.turno = turno;
        const generados: HR_Curso[] = turno?.cursos ?? [];

        this.cursosPlan = plan ?? [];
        this.cursos = generados;

        this.listOfData = this.cursosPlan.map((cursoPlan) => {
          const yaGenerado =
            generados.find((c) => c?.plan?.id === cursoPlan.id) ?? null; // <-- AQUÍ
          return { ...cursoPlan, cursoGenerado: yaGenerado };
        });

        this.displayData = [...this.listOfData];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.message.error('No se pudo cargar la tabla.');
        console.error(err);
      },
    });
  }

  // ✅ Tipado oficial de ng-zorro
  onQueryParamsChange(params: NzTableQueryParams): void {
    const sorters = params.sort ?? [];
    const current = sorters.find(
      (s) => s.value === 'ascend' || s.value === 'descend'
    );
    if (current) {
      this.onSort(current.key as keyof FilaCursoPlan, current.value);
    } else {
      this.sortKey = null;
      this.sortDirection = null;
      this.applyFilters();
    }
  }

  applyFilters(): void {
    const texto = this.searchText.trim().toLowerCase();
    const estado = this.estadoFiltro;

    let data = [...this.listOfData];

    if (texto) {
      data = data.filter(
        (d) =>
          d.c_nomcur?.toLowerCase().includes(texto) ||
          d.c_codcur?.toLowerCase().includes(texto)
      );
    }

    if (estado === 'generado') {
      data = data.filter((d) => !!d.cursoGenerado);
    } else if (estado === 'pendiente') {
      data = data.filter((d) => !d.cursoGenerado);
    }

    if (
      this.sortKey &&
      (this.sortDirection === 'ascend' || this.sortDirection === 'descend')
    ) {
      data = this.sortData(data, this.sortKey, this.sortDirection);
    }

    this.displayData = data;
  }

  resetFilters(): void {
    this.searchText = '';
    this.estadoFiltro = null;
    this.sortKey = null;
    this.sortDirection = null;
    this.displayData = [...this.listOfData];
  }

  onSort(key: keyof FilaCursoPlan, dir: NzTableSortOrder): void {
    this.sortKey = key ?? null;
    this.sortDirection = dir;

    if (!key || !(dir === 'ascend' || dir === 'descend')) {
      this.applyFilters();
      return;
    }
    this.displayData = this.sortData([...this.displayData], key, dir);
  }

  private sortData<T extends Record<string, any>>(
    data: T[],
    key: keyof T,
    dir: 'ascend' | 'descend'
  ): T[] {
    const factor = dir === 'ascend' ? 1 : -1;
    return data.sort((a, b) => {
      const va = a?.[key];
      const vb = b?.[key];

      const na = Number(va);
      const nb = Number(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return (na - nb) * factor;
      }
      return (
        String(va ?? '').localeCompare(String(vb ?? ''), 'es', {
          sensitivity: 'base',
        }) * factor
      );
    });
  }

  trackByCur = (_: number, item: FilaCursoPlan) =>
    item.c_codcur ?? (item as any).id ?? _;

  // --- Modal generar ---
  showModal(
    curso: HR_Plan_Estudio_Curso & { cursoGenerado?: HR_Curso | null }
  ): void {
    if (curso.cursoGenerado) return;
    this.cursoSeleccionado = curso;
    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;

    const newCurso: Partial<HR_Curso> = {
      turno_id: this.turno_id,
      plan_id: Number(this.cursoSeleccionado.id),
      c_alu: Number(this.vacantes),
    };

    this.loading = true;
    this.turnoService.generarCurso(newCurso).subscribe({
      next: () => {
        this.message.success('Curso generado correctamente.');
        this.getDataTable();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.message.error('No se pudo generar el curso.');
        console.error(err);
      },
    });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  // --- Eliminar curso (con confirm) ---
  eliminarCurso(fila: FilaCursoPlan) {
    if (!fila.cursoGenerado?.id) return;

    this.loading = true;

    // TODO: Reemplaza por tu endpoint real
    // this.turnoService.eliminarCurso(fila.cursoGenerado.id).subscribe({
    //   next: () => {
    //     this.message.success('Curso eliminado.');
    //     this.getDataTable();
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     this.loading = false;
    //     this.message.error('No se pudo eliminar el curso.');
    //     console.error(err);
    //   }
    // });

    // Simulación temporal
    setTimeout(() => {
      this.loading = false;
      this.message.info(
        'Implementa turnoService.eliminarCurso(id) para completar la acción.'
      );
    }, 400);
  }
}
