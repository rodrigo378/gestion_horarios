import { Component, OnInit } from '@angular/core';
import { ContadorResult } from '../../../interfaces/hr/hr_contador';
import { ContadorService } from '../../../services/contador.service';
import { AlertService } from '../../../services/alert.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SincronizarService } from '../../../services/sincronizar.service';

type Especialidad = { codfac: string; codesp: string; nomesp: string };

@Component({
  selector: 'app-sincronizar',
  standalone: false,
  templateUrl: './sincronizar.component.html',
  styleUrl: './sincronizar.component.css',
})
export class SincronizarComponent implements OnInit {
  contador: ContadorResult[] = [];
  contadorFiltrado: ContadorResult[] = [];
  search = '';

  // ✅ Periodo (n_codper)
  periodos = [
    { label: '20261 (Activo)', value: 20261 },
    { label: '20252', value: 20252 },
    { label: '20251', value: 20251 },
  ];
  selectedPeriodo: number = 20261;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  // ✅ selección
  selectedCourseIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  // ✅ filtros
  selectedFacultad: string = '';
  selectedEspecialidad: string = '';
  selectedCiclo: string = '';

  facultades = [
    { label: 'Todas', value: '' },

    { label: 'DIPLOMADOS (D)', value: 'D' },
    { label: 'INGENIERIA Y NEGOCIOS (E)', value: 'E' },
    { label: 'SEGUNDA ESPECIALIDAD FARMACIA Y BIOQUÍMICA (F)', value: 'F' },
    { label: 'POSGRADO (G)', value: 'G' },
    { label: 'SEGUNDA ESPECIALIDAD PSICOLOGÍA (L)', value: 'L' },
    { label: 'SEGUNDA ESPECIALIDAD ENFERMERÍA (P)', value: 'P' },
    { label: 'CIENCIAS DE LA SALUD (S)', value: 'S' },
    { label: 'TALLERES EXTRACURRICULARES (T)', value: 'T' },
  ];

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.ordenarDatos();
  }

  private ordenarDatos() {
    const dir = this.sortDirection === 'asc' ? 1 : -1;

    this.contadorFiltrado = [...this.contadorFiltrado].sort(
      (a: any, b: any) => {
        const valA = this.getSortValue(a, this.sortColumn);
        const valB = this.getSortValue(b, this.sortColumn);

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      },
    );
  }

  private getSortValue(item: any, column: string): any {
    switch (column) {
      case 'courseid_temp':
        return this.toNumber(item.courseid_temp);

      case 'c_nomcur':
        return String(item.c_nomcur ?? '').toLowerCase();

      case 'c_codcur':
        return String(item.c_codcur ?? '').toLowerCase();

      case 'c_codfac':
        return String(item.c_codfac ?? '').toLowerCase();

      case 'c_codesp':
        return String(item.c_codesp ?? '').toLowerCase();

      case 'secciones':
        return String(item.secciones ?? '').toLowerCase();

      case 'total_vacantes_tot':
        return this.toNumber(item.total_vacantes_tot);

      case 'total_vacantes_matriculados':
        return this.toNumber(item.total_vacantes_matriculados);

      case 'n_ciclo':
        return this.toNumber(item.n_ciclo);

      default:
        return '';
    }
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
  ciclos = Array.from({ length: 10 }, (_, i) => String(i + 1));

  especialidades: Especialidad[] = [
    // D - Diplomados
    {
      codfac: 'D',
      codesp: 'AS',
      nomesp: 'DIPLOMADO EN ASUNTOS REGULATORIOS DEL SECTOR FARMACÉUTICO',
    },
    {
      codfac: 'D',
      codesp: 'DA',
      nomesp: 'DIPLOMADO INTERNACIONAL EN GESTIÓN DE NEGOCIOS GLOBALES',
    },
    {
      codfac: 'D',
      codesp: 'DC',
      nomesp: 'DIPLOMADO INTERNACIONAL EN GESTIÓN CONTABLE Y FINANCIERA',
    },
    {
      codfac: 'D',
      codesp: 'DM',
      nomesp: 'DIPLOMADO INTERNACIONAL EN GESTIÓN DE MARKETING ESTRATÉGICO',
    },
    {
      codfac: 'D',
      codesp: 'DP',
      nomesp: 'DIPLOMADO EN PSICOLOGÍA CLÍNICA COGNITIVO CONDUCTUAL',
    },

    // E - Ingeniería y Negocios
    {
      codfac: 'E',
      codesp: 'E1',
      nomesp: 'ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
    },
    { codfac: 'E', codesp: 'E2', nomesp: 'ADMINISTRACIÓN Y MARKETING' },
    { codfac: 'E', codesp: 'E3', nomesp: 'CONTABILIDAD Y FINANZAS' },
    {
      codfac: 'E',
      codesp: 'E4',
      nomesp: 'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES',
    },
    { codfac: 'E', codesp: 'E5', nomesp: 'INGENIERÍA INDUSTRIAL' },
    {
      codfac: 'E',
      codesp: 'E6',
      nomesp: 'INGENIERÍA DE INTELIGENCIA ARTIFICIAL',
    },
    { codfac: 'E', codesp: 'E7', nomesp: 'INGENIERÍA DE SISTEMAS' },
    { codfac: 'E', codesp: 'E8', nomesp: 'ADMINISTRACIÓN DE EMPRESAS' },
    { codfac: 'E', codesp: 'E9', nomesp: 'DERECHO' },

    // F - Segunda Especialidad FBQ
    {
      codfac: 'F',
      codesp: 'F1',
      nomesp:
        'SEGUNDA ESPECIALIDAD EN ASUNTOS REGULATORIOS EN EL SECTOR FARMACEUTICO',
    },

    // G - Posgrado
    {
      codfac: 'G',
      codesp: 'DT',
      nomesp:
        'DIPLOMADO INTERNACIONAL DE ESPECIALIZACIÓN DE TOXICOLOGÍA AMBIENTAL Y SEGURIDAD',
    },
    {
      codfac: 'G',
      codesp: 'MA',
      nomesp: 'MAESTRÍA EN ADMINISTRACIÓN DE EMPRESAS',
    },
    { codfac: 'G', codesp: 'MS', nomesp: 'MAESTRÍA EN SALUD PÚBLICA' },

    // L - Segunda Especialidad Psicología
    {
      codfac: 'L',
      codesp: 'P1',
      nomesp: 'SEGUNDA ESPECIALIDAD EN PSICOLOGÍA CLÍNICA',
    },

    // P - Segunda Especialidad Enfermería
    {
      codfac: 'P',
      codesp: 'EC',
      nomesp:
        'SEGUNDA ESPECIALIDAD PROFESIONAL EN ENFERMERÍA EN CUIDADO INTEGRAL INFANTIL CON MENCIÓN EN CRECIMIENTO Y DESARROLLO',
    },
    {
      codfac: 'P',
      codesp: 'ED',
      nomesp:
        'SEGUNDA ESPECIALIDAD PROFESIONAL EN ENFERMERÍA EN EMERGENCIAS Y DESASTRES',
    },
    {
      codfac: 'P',
      codesp: 'EI',
      nomesp:
        'SEGUNDA ESPECIALIDAD PROFESIONAL EN ENFERMERÍA EN CUIDADOS INTENSIVOS',
    },
    {
      codfac: 'P',
      codesp: 'EO',
      nomesp:
        'SEGUNDA ESPECIALIDAD PROFESIONAL EN ENFERMERÍA EN SALUD OCUPACIONAL',
    },
    {
      codfac: 'P',
      codesp: 'EQ',
      nomesp:
        'SEGUNDA ESPECIALIDAD PROFESIONAL EN ENFERMERÍA EN CENTRO QUIRÚRGICO',
    },
    {
      codfac: 'P',
      codesp: 'ES',
      nomesp:
        'SEGUNDA ESPECIALIDAD PROFESIONAL EN ENFERMERÍA EN SALUD FAMILIAR Y COMUNITARIA',
    },
    {
      codfac: 'P',
      codesp: 'EU',
      nomesp: 'SEGUNDA ESPECIALIDAD PROFESIONAL EN ENFERMERÍA EN UROLOGÍA',
    },

    // S - Ciencias de la Salud
    { codfac: 'S', codesp: 'S1', nomesp: 'ENFERMERÍA' },
    { codfac: 'S', codesp: 'S2', nomesp: 'FARMACIA Y BIOQUÍMICA' },
    { codfac: 'S', codesp: 'S3', nomesp: 'NUTRICIÓN Y DIETÉTICA' },
    { codfac: 'S', codesp: 'S4', nomesp: 'PSICOLOGÍA' },
    {
      codfac: 'S',
      codesp: 'S5',
      nomesp: 'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN',
    },
    {
      codfac: 'S',
      codesp: 'S6',
      nomesp: 'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA',
    },
    { codfac: 'S', codesp: 'S7', nomesp: 'MEDICINA HUMANA' },
    { codfac: 'S', codesp: 'S8', nomesp: 'TECNOLOGÍA MÉDICA EN OPTOMETRÍA' },

    // T - Talleres
    { codfac: 'T', codesp: 'T1', nomesp: 'TALLERES FCE' },
    { codfac: 'T', codesp: 'T2', nomesp: 'TALLER IDIOMAS' },
    { codfac: 'T', codesp: 'T3', nomesp: 'TALLER FBQ' },
    { codfac: 'T', codesp: 'T4', nomesp: 'TALLER PSI' },
    { codfac: 'T', codesp: 'T5', nomesp: 'TALLER ENF' },
    { codfac: 'T', codesp: 'T6', nomesp: 'TALLER NUTRICION' },
    { codfac: 'T', codesp: 'T7', nomesp: 'TALLERES TMT' },
    { codfac: 'T', codesp: 'T8', nomesp: 'TALLERES TML' },
  ];

  get especialidadesFiltradas(): Especialidad[] {
    const fac = (this.selectedFacultad ?? '').trim();
    if (!fac) return [];
    return this.especialidades.filter((e) => e.codfac === fac);
  }

  constructor(
    private contadorService: ContadorService,
    private alertService: AlertService,
    private sincService: SincronizarService,
  ) {}

  ngOnInit(): void {
    this.getContador();
  }

  private toNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  // ✅ carga por periodo
  getContador() {
    this.contadorService.getContador(this.selectedPeriodo).subscribe((data) => {
      this.contador = data ?? [];
      this.aplicarFiltros();
    });
  }

  // ✅ cuando cambia periodo
  onPeriodoChange() {
    this.selectedCourseIds.clear();
    this.allChecked = false;
    this.indeterminate = false;
    this.getContador();
  }

  // ✅ búsqueda
  filtrar() {
    this.aplicarFiltros();
  }

  // ✅ filtros
  onFacultadChange() {
    // al cambiar facultad, especialidad se reset
    this.selectedEspecialidad = '';
    this.aplicarFiltros();
  }

  onEspecialidadChange() {
    this.aplicarFiltros();
  }

  onCicloChange() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const term = (this.search ?? '').toLowerCase().trim();

    this.contadorFiltrado = (this.contador ?? []).filter((item) => {
      const courseid = String((item as any).courseid_temp ?? '').toLowerCase();
      const curso = String((item as any).c_nomcur ?? '').toLowerCase();
      const codigo = String((item as any).c_codcur ?? '').toLowerCase();

      const pasaTexto =
        !term ||
        courseid.includes(term) ||
        curso.includes(term) ||
        codigo.includes(term);

      const facRaw = String((item as any).c_codfac ?? '').trim();
      const espRaw = String((item as any).c_codesp ?? '').trim();
      const cicloRaw = String((item as any).n_ciclo ?? '').trim();

      // soporta valores tipo: "S1,S2" o "S1 | S2" o "S1;S2"
      const facList = facRaw
        .split(/[,\|;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const espList = espRaw
        .split(/[,\|;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const cicloList = cicloRaw
        .split(/[,\|;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const pasaFac =
        !this.selectedFacultad || facList.includes(this.selectedFacultad);
      const pasaEsp =
        !this.selectedEspecialidad ||
        espList.includes(this.selectedEspecialidad);
      const pasaCiclo =
        !this.selectedCiclo || cicloList.includes(this.selectedCiclo);

      return pasaTexto && pasaFac && pasaEsp && pasaCiclo;
    });

    if (this.sortColumn) {
      this.ordenarDatos();
    }

    this.updateCheckStatus();
  }

  // ✅ selección
  isSelected(courseidTemp: any): boolean {
    return this.selectedCourseIds.has(this.toNumber(courseidTemp));
  }

  toggleSelection(courseidTemp: any, checked: boolean) {
    const id = this.toNumber(courseidTemp);
    if (!id) return;

    if (checked) this.selectedCourseIds.add(id);
    else this.selectedCourseIds.delete(id);

    this.updateCheckStatus();
  }

  private getVisibleIds(): number[] {
    return (this.contadorFiltrado ?? [])
      .map((x) => this.toNumber((x as any).courseid_temp))
      .filter(Boolean);
  }

  toggleAll(checked: boolean) {
    const ids = this.getVisibleIds();

    if (checked) ids.forEach((id) => this.selectedCourseIds.add(id));
    else ids.forEach((id) => this.selectedCourseIds.delete(id));

    this.updateCheckStatus();
  }

  updateCheckStatus(): void {
    const ids = this.getVisibleIds();

    if (!ids.length) {
      this.allChecked = false;
      this.indeterminate = false;
      return;
    }

    const checkedCount = ids.filter((id) =>
      this.selectedCourseIds.has(id),
    ).length;

    this.allChecked = checkedCount === ids.length;
    this.indeterminate = checkedCount > 0 && checkedCount < ids.length;
  }

  onToggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleAll(checked);
  }

  onToggleOne(courseidTemp: any, e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleSelection(courseidTemp, checked);
  }

  // ✅ sincronizar
  sincronizarSeleccionados() {
    const ids = Array.from(this.selectedCourseIds);

    if (!ids.length) {
      this.alertService.error('Selecciona al menos un curso para sincronizar.');
      return;
    }

    this.alertService.showSyncing('Sincronizando cursos...');

    this.sincService.sincronizarBatch(ids).subscribe(
      (res: any) => {
        this.alertService.close();

        const arr = Array.isArray(res) ? res : [];

        const exitos = arr.filter((x) => x?.ok === true && x?.data);
        const fallos = arr.filter((x) => x?.ok === false);

        const totals = exitos.reduce(
          (acc, x) => {
            const d = x.data ?? {};
            acc.alumnosMatriculados += Number(d.nuevo ?? 0);
            acc.alumnosBorrados += Number(d.borrar ?? 0);
            acc.docentesMatriculados += Number(d.nuevoDocentes ?? 0);
            acc.docentesBorrados += Number(d.borrarDocentes ?? 0);
            return acc;
          },
          {
            alumnosMatriculados: 0,
            alumnosBorrados: 0,
            docentesMatriculados: 0,
            docentesBorrados: 0,
          },
        );

        const fallosHtml =
          fallos.length > 0
            ? `
              <div style="text-align:left;margin-top:10px;">
                <b>Cursos con error (${fallos.length})</b>
                <ul style="margin:6px 0 0 18px;">
                  ${fallos
                    .map(
                      (f) =>
                        `<li><b>${f.courseid}</b>: ${String(
                          f.error ?? 'Error desconocido',
                        )}</li>`,
                    )
                    .join('')}
                </ul>
              </div>
            `
            : `<div style="margin-top:10px;"><b>Sin errores ✅</b></div>`;

        const html = `
          <div style="text-align:left;">
            <div><b>Alumnos</b></div>
            <div>Matriculados: <b>${totals.alumnosMatriculados}</b></div>
            <div>Borrados: <b>${totals.alumnosBorrados}</b></div>

            <div style="margin-top:10px;"><b>Docentes</b></div>
            <div>Matriculados: <b>${totals.docentesMatriculados}</b></div>
            <div>Borrados: <b>${totals.docentesBorrados}</b></div>

            ${fallosHtml}
          </div>
        `;

        this.alertService.syncResults(html);
        console.log('Sincronizado:', res, 'ids:', ids);
      },
      (err) => {
        this.alertService.close();
        const msg =
          err?.error?.message ||
          err?.message ||
          'No se pudo completar la sincronización.';
        this.alertService.syncError(msg);
        console.error('Error sync:', err);
      },
    );
  }

  // ✅ export
  exportarExcel() {
    if (!this.contadorFiltrado.length) {
      this.alertService.error('No hay datos para exportar.');
      return;
    }

    const data = this.contadorFiltrado.map((item: any) => ({
      Periodo: this.selectedPeriodo,
      CourseID_SIGU: item.courseid_temp,
      Curso: item.c_nomcur,
      Codigo: item.c_codcur,
      Facultad: item.c_codfac,
      Especialidad: item.c_codesp,
      Secciones: item.secciones,
      Vacantes_Totales: item.total_vacantes_tot,
      Matriculados: item.total_vacantes_matriculados,
      Ciclo: item.n_ciclo,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contadores');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(
      blob,
      `contadores_${this.selectedPeriodo}_${new Date().getTime()}.xlsx`,
    );
  }
}
