import { Component, OnInit } from '@angular/core';
import { SiguService } from '../../../services/sigu.service';

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

  // si existe en tu API:
  n_ciclo?: number; // ciclo
}

@Component({
  selector: 'app-vacantes',
  standalone: false,
  templateUrl: './vacantes.component.html',
  styleUrl: './vacantes.component.css',
})
export class VacantesComponent implements OnInit {
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

  // options (se llenan desde la data)
  especialidades: string[] = [];
  modalidades: string[] = [];
  ciclos: number[] = [];

  constructor(private siguServices: SiguService) {}

  ngOnInit(): void {
    this.getVacantes();
  }

  getVacantes() {
    this.loading = true;

    this.siguServices.getVacantes().subscribe({
      next: (data: any) => {
        // tu API trae data cruda: aquí la guardamos y listo
        this.allVacantes = Array.isArray(data) ? (data as Vacante[]) : [];

        // construir combos (especialidad, modalidad, ciclo si existe)
        this.buildFilterOptions();

        // aplicar filtros + paginar en frontend
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

  // se llama cuando cambias buscador/filtros
  applyFilters(resetPage = false) {
    if (resetPage) this.pageIndex = 1;

    const termRaw = this.searchCodCur.trim().toUpperCase();
    const terms = termRaw ? termRaw.split(/\s+/).filter(Boolean) : [];

    this.filteredVacantes = this.allVacantes.filter((v) => {
      const cod = (v.c_codcur || '').toUpperCase();
      const nom = (v.c_nomcur || '').toUpperCase();

      // buscador por código y nombre (soporta múltiples palabras)
      const matchSearch = terms.length
        ? terms.every((t) => cod.includes(t) || nom.includes(t))
        : true;

      // filtros
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

  // helper: vacantes disponibles
  disponibles(v: Vacante): number {
    // si tu lógica real es distinta, ajusta aquí
    return (v.n_vacmax ?? 0) - (v.n_vacmat ?? 0);
  }

  // ---- edición ----
  editId: string | null = null;
  editCache: Record<string, Vacante> = {};

  getRowId(v: Vacante): string {
    // clave compuesta (única)
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

  startEdit(v: Vacante) {
    const id = this.getRowId(v);
    this.editId = id;
    // clonar para no tocar la tabla hasta guardar
    this.editCache[id] = { ...v };
  }

  cancelEdit(v: Vacante) {
    const id = this.getRowId(v);
    delete this.editCache[id];
    this.editId = null;
  }

  onChangeVacantes(v: Vacante, value: number) {
    const id = this.getRowId(v);
    const row = this.editCache[id];
    if (!row) return;

    const val = Number(value) || 0;

    // ambos siempre iguales
    row.n_vactot = val;
    row.n_vacmax = val;
  }

  saveEdit(v: Vacante) {
    const id = this.getRowId(v);
    const row = this.editCache[id];
    if (!row) return;

    // 1) Actualiza el array local con lo editado
    const idx = this.allVacantes.findIndex((x) => this.getRowId(x) === id);
    if (idx !== -1) {
      this.allVacantes[idx] = { ...this.allVacantes[idx], ...row };
    }

    // 2) Refresca UI
    this.applyFilters(false);

    // 3) Imprime WHERE con el row actualizado (sin hardcode)
    this.printWhere(row);

    // 4) Envía a la API con el row actualizado (NO con v)
    this.siguServices
      .updateVacante({
        n_codper: 20261,
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
        next: (res) => console.log('Actualizado', res),
        error: (err) => console.error(err),
      });

    // 5) Cierra edición
    delete this.editCache[id];
    this.editId = null;
  }

  printWhere(v: Vacante) {
    const where = `
      n_codper = 20252
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
