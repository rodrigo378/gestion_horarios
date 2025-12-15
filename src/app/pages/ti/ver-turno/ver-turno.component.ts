import { Component } from '@angular/core';
import {
  ComparacionTurnoPeriodo,
  TurnoService,
} from '../../../services/turno.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-ver-turno',
  standalone: false,
  templateUrl: './ver-turno.component.html',
  styleUrl: './ver-turno.component.css',
})
export class VerTurnoComponent {
  editCache: { [key: string]: { edit: boolean; data: any } } = {};
  listOfData: ComparacionTurnoPeriodo[] = [];
  datosFiltrados: ComparacionTurnoPeriodo[] = [];
  listOfCurrentPageData: readonly ComparacionTurnoPeriodo[] = [];

  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  pageSize = 10;
  pageIndex = 1;

  modalComparacionVisible = false;
  loadingComparacion = false;
  comparacion: any = null;
  turnoSeleccionado: any = null;

  especialidades = [
    {
      nomesp: 'ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
      codesp: 'E1',
      codfac: 'E',
    },
    { nomesp: 'ADMINISTRACIÓN Y MARKETING', codesp: 'E2', codfac: 'E' },
    { nomesp: 'CONTABILIDAD Y FINANZAS', codesp: 'E3', codfac: 'E' },
    {
      nomesp: 'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES',
      codesp: 'E4',
      codfac: 'E',
    },
    { nomesp: 'INGENIERÍA INDUSTRIAL', codesp: 'E5', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE IA', codesp: 'E6', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'DERECHO', codesp: 'E9', codfac: 'E' },

    { nomesp: 'ENFERMERÍA', codesp: 'S1', codfac: 'S' },
    { nomesp: 'FARMACIA Y BIOQUÍMICA', codesp: 'S2', codfac: 'S' },
    { nomesp: 'NUTRICIÓN Y DIETÉTICA', codesp: 'S3', codfac: 'S' },
    { nomesp: 'PSICOLOGÍA', codesp: 'S4', codfac: 'S' },
    { nomesp: 'TM TERAPIA FÍSICA Y REHAB', codesp: 'S5', codfac: 'S' },
    { nomesp: 'TM LAB. CLÍNICO Y ANAT. PAT', codesp: 'S6', codfac: 'S' },
    { nomesp: 'MEDICINA', codesp: 'S7', codfac: 'S' },
  ];
  especialidadesFiltradas: any[] = [];

  filtros = {
    n_codper: '20261',
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
    estado: '',
    c_grpcur: '',
    exportacion: '',
  };

  listOfColumn = [
    { title: 'Periodo', nzWidth: 'auto' },
    { title: 'Plan', nzWidth: 'auto' },
    { title: 'Facultad', nzWidth: 'auto' },
    { title: 'Especialidad', nzWidth: 'auto' },
    { title: 'Seccion', nzWidth: 'auto' },
    { title: 'Ciclo', nzWidth: 'auto' },
    { title: 'Exportado', nzWidth: 'auto' },
    { title: 'Modalidad', nzWidth: '10%' },
    { title: 'Estado General', nzWidth: 'auto' },
    { title: 'Bloqueado', nzWidth: '10%' },
    { title: 'Accion', nzWidth: 'auto' },
  ];

  constructor(
    private turnoService: TurnoService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Mostrar loader al iniciar
    this.alertService.showLoadingScreen('Cargando turnos...');
    this.getTurnos();
  }

  // ===========================
  // CARGA PRINCIPAL
  // ===========================
  getTurnos() {
    const periodo = Number(this.filtros.n_codper || 0);

    this.turnoService.comparacionPorPeriodo(periodo).subscribe({
      next: (data) => {
        this.listOfData = data;
        this.aplicarFiltros();

        // cerrar loader
        this.alertService.close();
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.alertService.close();
        this.alertService.error('Error al cargar los turnos');
      },
    });
  }

  get total(): number {
    return this.datosFiltrados.length;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
  }

  // ===========================
  // CAMBIO DE FILTROS (SELECTS)
  // ===========================
  onChangeFacultad(filtro: string, valor: string) {
    switch (filtro) {
      case 'n_codper':
        this.filtros.n_codper = valor;

        // recargar desde backend
        this.alertService.showLoadingScreen('Cargando turnos...');
        this.getTurnos();
        return;

      case 'facultad':
        this.filtros.c_codfac = valor;
        this.especialidadesFiltradas = this.especialidades.filter(
          (item) => item.codfac === valor
        );
        this.filtros.c_codesp = '';
        break;

      case 'especialidad':
        this.filtros.c_codesp = valor;
        break;

      case 'modalidad':
        this.filtros.c_codmod = valor;
        break;

      case 'ciclo':
        this.filtros.n_ciclo = valor;
        break;

      case 'estado':
        this.filtros.estado = valor;
        break;
    }

    this.aplicarFiltros();
  }

  // ===========================
  // APLICAR FILTROS EN MEMORIA
  // ===========================
  aplicarFiltros(): void {
    this.datosFiltrados = this.listOfData.filter((item) => {
      const t = item.turno;

      const coincidePeriodo = this.filtros.n_codper
        ? String(t.n_codper) === this.filtros.n_codper
        : true;

      const coincideFacultad = this.filtros.c_codfac
        ? t.c_codfac === this.filtros.c_codfac
        : true;

      const coincideEspecialidad = this.filtros.c_codesp
        ? t.c_codesp === this.filtros.c_codesp
        : true;

      const coincideModalidad = this.filtros.c_codmod
        ? String(t.c_codmod) === String(this.filtros.c_codmod)
        : true;

      const coincideCiclo = this.filtros.n_ciclo
        ? Number(t.n_ciclo) === Number(this.filtros.n_ciclo)
        : true;

      const coincideExportacion =
        this.filtros.exportacion === ''
          ? true
          : this.filtros.exportacion === 'exportado'
          ? t.requiere_reexportacion === true
          : this.filtros.exportacion === 'sin_exportar'
          ? t.requiere_reexportacion === false
          : false;

      return (
        coincidePeriodo &&
        coincideFacultad &&
        coincideEspecialidad &&
        coincideModalidad &&
        coincideCiclo &&
        coincideExportacion
      );
    });

    this.pageIndex = 1;
  }

  // ===========================
  // SELECCIÓN
  // ===========================
  onItemChecked(id: number, checked: boolean): void {
    checked ? this.setOfCheckedId.add(id) : this.setOfCheckedId.delete(id);
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.onItemChecked(item.turno.id, value)
    );
  }

  onCurrentPageDataChange(list: readonly any[]): void {
    this.listOfCurrentPageData = list;
  }

  // ===========================
  // ACCIONES
  // ===========================
  clickAsignarHorario(id: number) {
    window.open(`/ti/asignar/${id}`, '_blank');
  }

  clickCompararSigu(turno: any) {
    this.modalComparacionVisible = true;
    this.loadingComparacion = true;
    this.turnoSeleccionado = turno;

    this.turnoService.comparacionPorTurnoId(turno.id).subscribe({
      next: (res) => {
        this.comparacion = res;
        this.loadingComparacion = false;
      },
      error: () => (this.loadingComparacion = false),
    });
  }

  reloadComparacion() {
    if (!this.turnoSeleccionado) return;

    this.loadingComparacion = true;
    this.turnoService
      .comparacionPorTurnoId(this.turnoSeleccionado.id)
      .subscribe({
        next: (res) => {
          this.comparacion = res;
          this.loadingComparacion = false;
        },
        error: () => (this.loadingComparacion = false),
      });
  }

  closeModal() {
    this.modalComparacionVisible = false;
  }

  copiar(texto: any) {
    const contenido = Array.isArray(texto)
      ? texto.join('\n')
      : JSON.stringify(texto, null, 2);

    navigator.clipboard.writeText(contenido);
  }

  // ========= CURSOS =========
  get cursosTodos(): string[] {
    const hr =
      this.comparacion?.cursos?.hr?.map((h: any) => h.plan.c_codcur) ?? [];
    const sigu =
      this.comparacion?.cursos?.sigu?.map((s: any) => s.c_codcur) ?? [];
    return Array.from(new Set([...hr, ...sigu]));
  }

  isCursoCoincide(cod: string): boolean {
    return this.comparacion?.cursos?.coinciden?.some(
      (c: any) => c.c_codcur === cod
    );
  }

  isCursoSoloHr(cod: string): boolean {
    return (
      !this.isCursoCoincide(cod) &&
      !this.comparacion?.cursos?.sigu?.some((s: any) => s.c_codcur === cod)
    );
  }

  isCursoSoloSigu(cod: string): boolean {
    return (
      !this.isCursoCoincide(cod) &&
      this.comparacion?.cursos?.sigu?.some((s: any) => s.c_codcur === cod)
    );
  }

  getCursoNombreHr(cod: string): string {
    return (
      this.comparacion?.cursos?.hr?.find((h: any) => h.plan.c_codcur === cod)
        ?.plan?.c_nomcur ?? '—'
    );
  }

  getCursoNombreSigu(cod: string): string {
    return (
      this.comparacion?.cursos?.sigu?.find((s: any) => s.c_codcur === cod)
        ?.c_nomcur ?? '—'
    );
  }

  // ========= DOCENTES =========
  get docentesTodos(): string[] {
    const hr = this.comparacion?.docentes?.hr?.map((d: any) => d.dni) ?? [];
    const sigu =
      this.comparacion?.docentes?.sigu?.map((d: any) => d.c_dnidoc) ?? [];
    return Array.from(new Set([...hr, ...sigu]));
  }

  isDocenteCoincide(dni: string): boolean {
    return this.comparacion?.docentes?.coinciden?.some(
      (d: any) => d.dni === dni
    );
  }

  isDocenteSoloHr(dni: string): boolean {
    return (
      !this.isDocenteCoincide(dni) &&
      this.comparacion?.docentes?.hr?.some((d: any) => d.dni === dni)
    );
  }

  isDocenteSoloSigu(dni: string): boolean {
    return (
      !this.isDocenteCoincide(dni) &&
      this.comparacion?.docentes?.sigu?.some((d: any) => d.c_dnidoc === dni)
    );
  }

  getNombreDocenteHr(dni: string): string {
    return (
      this.comparacion?.docentes?.hr?.find((d: any) => d.dni === dni)?.nombre ??
      '—'
    );
  }

  getNombreDocenteSigu(dni: string): string {
    return (
      this.comparacion?.docentes?.sigu?.find((d: any) => d.c_dnidoc === dni)
        ?.nombres ?? '—'
    );
  }

  // ========= ESTADO GENERAL =========
  getEstadoGeneral(turno: any): string {
    const cursoOK = turno.estadoGeneralCursos === 'CURSOS_COINCIDEN';
    const docenteOK = turno.estadoGeneralDocentes === 'DOCENTES_COINCIDEN';
    const horarioOK = turno.estadoGeneralHorarios === 'HORARIOS_COINCIDEN';

    if (cursoOK && docenteOK && horarioOK) return 'OK';
    if (!cursoOK && docenteOK && horarioOK) return 'CURSOS_INCORRECTOS';
    if (cursoOK && !docenteOK && horarioOK) return 'DOCENTES_INCORRECTOS';
    if (cursoOK && docenteOK && !horarioOK) return 'HORARIOS_INCORRECTOS';

    if (!cursoOK && !docenteOK && horarioOK)
      return 'CURSOS_DOCENTES_INCORRECTOS';
    if (!cursoOK && horarioOK && !docenteOK)
      return 'CURSOS_HORARIOS_INCORRECTOS';
    if (cursoOK && !docenteOK && !horarioOK)
      return 'DOCENTES_HORARIOS_INCORRECTOS';

    return 'TODO_INCORRECTO';
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'OK':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'CURSOS_INCORRECTOS':
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'DOCENTES_INCORRECTOS':
        return 'bg-orange-100 text-orange-700 ring-orange-600/20';
      case 'HORARIOS_INCORRECTOS':
        return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
      case 'CURSOS_DOCENTES_INCORRECTOS':
        return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'CURSOS_HORARIOS_INCORRECTOS':
        return 'bg-pink-100 text-pink-700 ring-pink-600/20';
      case 'DOCENTES_HORARIOS_INCORRECTOS':
        return 'bg-purple-100 text-purple-700 ring-purple-600/20';
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-400/20';
    }
  }
}
