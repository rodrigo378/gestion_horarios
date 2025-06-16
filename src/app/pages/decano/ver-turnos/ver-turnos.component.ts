import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { format } from 'date-fns';
import { Periodo, Turno } from '../../../interfaces/turno';
import { Especialidad } from '../../../interfaces/Curso';
import { AlertService } from '../../../services/alert.service';
import { TurnoService } from '../../../services/turno.service';
import { CursoService } from '../../../services/curso.service';
import { HorarioService } from '../../../services/horario.service';

@Component({
  selector: 'app-ver-turnos',
  standalone: false,
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css',
})
export class VerTurnosComponent implements OnInit {
  mostrarModalReporte: boolean = false;

  mostrarModalCrear: boolean = false;
  formularioHorario!: FormGroup;

  itemsPorPagina = 10;
  paginaActual = 1;
  modalAbierto = false;
  turnos: Turno[] = [];
  turnoSeleccionado: { [key: number]: string } = {};

  filtros = {
    n_codper: '',
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
    estado: '',
    c_grpcur: '',
  };

  filtrosReporte = {
    n_codper: '',
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
    n_codpla: '',
    c_grpcur: '',
  };

  especialidades: Especialidad[] = [];
  especialidadesCompletas: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = [];
  especialidadesFiltradasReporte: Especialidad[] = [];

  periodos: Periodo[] = [];
  facultades: string[] = [];
  ciclos: number[] = [];
  estados: { value: string; label: string }[] = [];
  secciones: string[] = [];
  modalidades: { value: string; label: string }[] = [];

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private location: Location,
    private alertService: AlertService,
    private turnoServices: TurnoService,
    private cursoServices: CursoService,
    private horarioService: HorarioService
  ) {}

  ngOnInit(): void {
    this.filtros.n_codper = '20252';

    this.inicializarFormulario();
    this.turnoServices.getTurnos().subscribe((data) => {
      this.turnos = data;
      this.turnosFiltrados = data;
      this.extraerValoresUnicos(data);
      this.turnoServices.getPeriodos().subscribe((data) => {
        this.periodos = data;
        this.aplicarFiltros();
      });
    });

    this.cursoServices.getEspecialidades().subscribe((data) => {
      this.especialidadesCompletas = data;
      this.especialidades = data;
    });

    this.turnoServices.onCambioEstado().subscribe((turnoId) => {
      if (turnoId !== null) {
        this.actualizarEstadoEnListado(turnoId);
      }
    });
  }

  actualizarEstadoEnListado(turnoId: number) {
    this.turnoServices.getTurnoById(turnoId).subscribe((turnoActualizado) => {
      const index = this.turnos.findIndex((t) => t.id === turnoId);
      if (index !== -1) {
        this.turnos[index].estado = turnoActualizado.estado;
      }
    });
  }

  inicializarFormulario() {
    this.formularioHorario = this.fb.group({
      c_codfac: ['', Validators.required],
      c_codesp: ['', Validators.required],
      n_codper: [20251, Validators.required],
      c_grpcur: ['', Validators.required],
      n_ciclo: ['', Validators.required],
      c_codmod: ['', Validators.required],
      n_codpla: ['', Validators.required],
    });
  }

  deleteTurno(id: number) {
    this.alertService
      .confirm('¿Está seguro que desea eliminar este turno?')
      .then((confirmado) => {
        if (confirmado) {
          this.turnoServices.deleteTurno(id).subscribe({
            next: () => {
              this.aplicarFiltros();
              this.alertService.success('Turno eliminado correctamente');
            },
            error: (err: HttpErrorResponse) => {
              console.error(err);
              this.alertService.error('Ocurrió un error al eliminar el turno');
            },
          });
        }
      });
  }

  obtenerNombreEspecialidad(codesp: string): string {
    const esp = this.especialidadesCompletas.find((e) => e.codesp === codesp);

    return esp?.nomesp || '';
  }

  obtenerNombreModalidad(codmod: string): string {
    const modalidad = this.modalidades.find((m) => m.value == codmod);
    return modalidad?.label || '';
  }

  guardarTurno() {
    if (this.formularioHorario.invalid) {
      this.formularioHorario.markAllAsTouched();
      this.alertService.error('Todos los campos son necesarios');
      return;
    }

    const form = this.formularioHorario.value;

    const turno = {
      ...form,
      c_codmod: form.c_codmod,
      n_ciclo: Number(form.n_ciclo),
      n_codper: Number(form.n_codper),
      n_codpla: Number(form.n_codpla),
      nom_fac: this.getNombreFacultad(form.c_codfac),
      c_nommod: this.obtenerNombreModalidad(form.c_codmod),
      nomesp: this.obtenerNombreEspecialidad(form.c_codesp),
    };

    this.turnoServices.createTurno(turno).subscribe({
      next: (_res: any) => {
        this.alertService.success('Se creo el Turno exitosamente');
        this.turnoServices.getTurnos().subscribe((data) => {
          this.turnos = data;
          this.formularioHorario.get('n_codper')?.setValue('nuevoValor');

          this.turnosFiltrados = data;
          this.extraerValoresUnicos(data);
          this.mostrarModalCrear = false;

          this.formularioHorario.reset({
            c_codfac: '',
            c_codesp: '',
            n_codper: '',
            c_grpcur: '',
            n_ciclo: '',
            c_codmod: '',
            n_codpla: '',
          });
        });
      },
      error: (_er: HttpErrorResponse) => {
        this.alertService.error('Este Turno ya existe.');
      },
    });
  }

  onChangeFacultadFormulario() {
    const codfac = this.formularioHorario.get('c_codfac')?.value;

    this.especialidades = this.especialidadesCompletas.filter(
      (esp) => esp.codfac === codfac
    );

    // Si la especialidad actual ya no pertenece a la nueva facultad, resetea
    const especialidadActual = this.formularioHorario.get('c_codesp')?.value;
    const existe = this.especialidades.some(
      (e) => e.codesp === especialidadActual
    );

    if (!existe) {
      this.formularioHorario.get('c_codesp')?.setValue('');
    }
  }

  verCursos(turno: Turno) {
    const currentPrefix = this.router.url.split('/')[1];
    const url = `/${currentPrefix}/asignarhorario?id=${turno.id}`;
    window.open(url, '_blank');
  }

  vercursoblock(turno: Turno) {
    const url = this.router
      .createUrlTree(['/coa/calender_turno'], {
        queryParams: { id: turno.id },
      })
      .toString();

    window.open(url, '_blank');
  }

  //#region filtro

  getNombreFacultad(codfac: string): string {
    const facultadesMap: Record<string, string> = {
      S: 'CIENCIAS DE LA SALUD',
      E: 'INGENIERÍA Y NEGOCIOS',
    };
    return facultadesMap[codfac] || codfac;
  }

  extraerValoresUnicos(turnos: Turno[]) {
    this.facultades = [...new Set(turnos.map((t) => t.c_codfac))];
    this.secciones = [...new Set(turnos.map((t) => t.c_grpcur))];
    this.ciclos = [...new Set(turnos.map((t) => t.n_ciclo))];

    // Diccionarios para etiquetas
    const modalidadLabels: { [key: string]: string } = {
      '1': 'PRESENCIAL',
      '2': 'SEMIPRESENCIAL',
      '3': 'VIRTUAL',
    };

    const estadoLabels: { [key: string]: string } = {
      '1': 'ASIGNADO',
      '2': 'NO ASIGNADO',
    };

    // Modalidades únicas
    const modalidadesUnicas = [...new Set(turnos.map((t) => t.c_codmod))];
    this.modalidades = modalidadesUnicas.map((mod) => ({
      value: mod,
      label: modalidadLabels[mod] || mod,
    }));

    // Estados únicos
    const estadosUnicos = [...new Set(turnos.map((t) => t.estado.toString()))];
    this.estados = estadosUnicos.map((est) => ({
      value: est,
      label: estadoLabels[est] || est,
    }));
  }

  aplicarFiltros() {
    const queryParams: any = {};

    for (const key of Object.keys(
      this.filtros
    ) as (keyof typeof this.filtros)[]) {
      if (this.filtros[key]) {
        queryParams[key] = this.filtros[key];
      }
    }

    this.turnoServices.getTurnosFiltrados(queryParams).subscribe((data) => {
      this.turnos = data;
      this.turnosFiltrados = data;
      this.paginaActual = 1;
    });
  }

  onFacultadChange(): void {
    this.filtros.c_codesp = ''; // Reiniciamos especialidad
    this.especialidadesFiltradas = this.especialidadesCompletas.filter(
      (e) => e.codfac === this.filtros.c_codfac
    );

    this.aplicarFiltros();
  }

  //#endregion

  //#endregion

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  get totalPaginas() {
    return Math.ceil(this.turnosFiltrados.length / this.itemsPorPagina);
  }

  get turnosPaginados(): Turno[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.turnosFiltrados.slice(inicio, fin);
  }

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  cancel() {
    this.location.back();
  }

  turnosFiltrados: Turno[] = [];
  filtroBusqueda: string = '';

  filtrarturnos() {
    const texto = this.filtroBusqueda.toLowerCase();

    this.turnosFiltrados = this.turnos.filter(
      (turno) =>
        turno.nom_fac.toLowerCase().includes(texto) ||
        turno.nomesp.toLowerCase().includes(texto) ||
        turno.c_grpcur.toLowerCase().includes(texto) ||
        turno.n_ciclo.toString().includes(texto) ||
        turno.c_nommod.toLowerCase().includes(texto) ||
        (turno.estado === 1 ? 'asignado' : 'no asignado')
          .toLowerCase()
          .includes(texto)
    );
    this.paginaActual = 1;
  }

  editarTurno(turno_id: number) {
    const currentPrefix = this.router.url.split('/')[1];
    const url = `/${currentPrefix}/curso/${turno_id}?id=${turno_id}`;
    window.open(url, '_blank');
  }

  mostrarAlertaVencido() {
    this.alertService.error(
      'La fecha de asignación ha caducado. Ya no puedes modificar este turno.'
    );
  }

  cambiarItemsPorPagina(valor: number) {
    this.itemsPorPagina = valor;
    this.paginaActual = 1; // Reinicia a la primera página
  }

  generarReporteExcel() {
    this.mostrarModalReporte = false;

    const filtros: any = {};

    if (this.filtrosReporte.n_codper)
      filtros.n_codper = this.filtrosReporte.n_codper;
    if (this.filtrosReporte.c_codfac)
      filtros.c_codfac = this.filtrosReporte.c_codfac;
    if (this.filtrosReporte.c_codesp)
      filtros.c_codesp = this.filtrosReporte.c_codesp;
    if (this.filtrosReporte.c_codmod)
      filtros.c_codmod = this.filtrosReporte.c_codmod;
    if (this.filtrosReporte.c_grpcur)
      filtros.c_grpcur = this.filtrosReporte.c_grpcur;

    if (
      this.filtrosReporte.n_ciclo !== undefined &&
      this.filtrosReporte.n_ciclo !== ''
    ) {
      filtros.n_ciclo = Number(this.filtrosReporte.n_ciclo);
    }

    if (
      this.filtrosReporte.n_codpla !== undefined &&
      this.filtrosReporte.n_codpla !== ''
    ) {
      filtros.n_codpla = Number(this.filtrosReporte.n_codpla);
    }

    const zonaHoraria = 'America/Lima';

    this.horarioService.getReporte(filtros).subscribe((data) => {
      console.log('data => ', data);

      // Suponiendo que `data` es un array de objetos con `dia` y `h_inicio`
      const rows = (data || []).map((item: any) => ({
        n_codper: item.n_codper,
        c_codfac: item.c_codfac,
        nom_fac: item.nom_fac,
        c_codesp: item.c_codesp,
        nomesp: item.nomesp,
        c_codcur: item.c_codcur,
        c_nomcur: item.c_nomcur,
        c_grpcur: item.c_grpcur,
        modalidad: item.modalidad,
        n_ciclo: item.n_ciclo,
        n_codpla: item.n_codpla,
        Docente: item?.docentes || '',
        Día: item.dias || '',
        // Hini: item.horas_inicio
        //   ? format(
        //       toZonedTime(new Date(item.horas_inicio), zonaHoraria),
        //       'HH:mm'
        //     )
        //   : '',
        // Hfin: item.horas_fin
        //   ? format(toZonedTime(new Date(item.horas_fin), zonaHoraria), 'HH:mm')
        //   : '',
        Hini: item.horas_inicio,
        Hfin: item.horas_fin,
        horas_academicas: item.n_horas,
        c_tipo: item.c_tipo,
        aula: item?.aula || '',
        piso: item?.piso || '',
        pabellon: item?.pabellon || '',
      }));

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Reporte Horarios': worksheet },
        SheetNames: ['Reporte Horarios'],
      };

      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      FileSaver.saveAs(
        blob,
        `reporte-horarios-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      );
    });
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.sortData();
  }

  sortData() {
    this.turnosFiltrados.sort((a, b) => {
      const valA = (a as any)[this.sortColumn];
      const valB = (b as any)[this.sortColumn];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  onFacultadChangeReporte(): void {
    this.filtrosReporte.c_codesp = '';
    this.especialidadesFiltradasReporte = this.especialidadesCompletas.filter(
      (e) => e.codfac === this.filtrosReporte.c_codfac
    );
  }

  debeBloquearTurno(turno: Turno): boolean {
    return turno.subido_sigu === true;
  }

  handleClick(turno: Turno): void {
    if (this.debeBloquearTurno(turno)) {
      this.alertService.errorwarning(
        'Este turno ya está asignado no se permite modificación.'
      );
      return;
    }

    this.verCursos(turno); // si no está bloqueado, continúa el flujo normal
  }
}
