import { Component, inject, OnInit, effect } from '@angular/core';
import { TurnoService } from '../../../services/turno.service';
import { Router } from '@angular/router';
import { AuthContextService } from '../../../services/auth-context.service';
import { HR_Turno } from '../../../interfaces/hr/hr_turno';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../services/alert.service';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-ver-turnos',
  standalone: false,
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css',
})
export class VerTurnosComponent implements OnInit {
  private ctx = inject(AuthContextService);
  isSaving = false;

  get isLoaded() {
    return this.ctx.isLoaded();
  }
  get isAuthenticated() {
    return this.ctx.isAuthenticated();
  }
  get user() {
    return this.ctx.userConfig()?.user;
  }
  get hrModule() {
    return this.ctx.hr();
  }
  get hrRole() {
    return this.ctx.hrRole();
  }
  get hrEspecialidades() {
    return this.ctx.hrConfig()?.especialidades as string[] | undefined;
  }

  listOfColumn = [
    {
      title: 'Periodo',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_codper - b.n_codper,
      nzWidth: 'auto',
    },
    {
      title: 'Plan',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_codpla - b.n_codpla,
      nzWidth: 'auto',
    },
    {
      title: 'Facultad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_codfac.localeCompare(b.c_codfac),
      nzWidth: 'auto',
    },
    {
      title: 'Especialidad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_codesp.localeCompare(b.c_codesp),
      nzWidth: 'auto',
    },
    {
      title: 'Seccion',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_grpcur.localeCompare(b.c_grpcur),
      nzWidth: 'auto',
    },
    {
      title: 'Ciclo',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_ciclo - b.n_ciclo,
      nzWidth: 'auto',
    },
    {
      title: 'Modalidad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_nommod.localeCompare(b.c_nommod),
      nzWidth: 'auto',
    },

    { title: 'Acción', compare: false, nzWidth: 'auto' },
  ];

  mostrarModalCrear: boolean = false;
  seccionesSugeridas: string[] = [];

  listOfData: HR_Turno[] = [];
  datosFiltrados: HR_Turno[] = [];
  turnosPaginados: HR_Turno[] = [];

  itemsPorPagina = 8;
  paginaActual = 1;
  totalPaginas = 1;
  readonly opcionesPagina = [8, 10, 20, 50, 100, 150];

  editCache: { [key: string]: { edit: boolean; data: HR_Turno } } = {};

  filtros = {
    n_codper: 20261,
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
    c_grpcur: '',
  };

  periodos = [{ n_codper: 20261 }];
  ciclos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  modalidades = [
    { label: 'Presencial', value: '1' },
    { label: 'Semipresencial', value: '2' },
    { label: 'Virtual', value: '3' },
  ];

  especialidades: { nomesp: string; codesp: string; codfac: string }[] = [
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
    // E	E4	ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES

    { nomesp: 'INGENIERÍA INDUSTRIAL', codesp: 'E5', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE IA', codesp: 'E6', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'ENFERMERÍA', codesp: 'S1', codfac: 'S' },
    { nomesp: 'FARMACIA Y BIOQUÍMICA', codesp: 'S2', codfac: 'S' },
    { nomesp: 'NUTRICIÓN Y DIETÉTICA', codesp: 'S3', codfac: 'S' },
    { nomesp: 'PSICOLOGÍA', codesp: 'S4', codfac: 'S' },
    { nomesp: 'TM TERAPIA FÍSICA Y REHAB', codesp: 'S5', codfac: 'S' },
    { nomesp: 'TM LAB. CLÍNICO Y ANAT. PAT', codesp: 'S6', codfac: 'S' },
    { nomesp: 'MEDICINA', codesp: 'S7', codfac: 'S' },
  ];

  especialidadesFiltradas: {
    nomesp: string;
    codesp: string;
    codfac: string;
  }[] = [];

  formularioHorario!: FormGroup;

  constructor(
    private turnoService: TurnoService,
    private router: Router,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    // 🟢 Loader global al cargar la vista
    this.alertService.showLoadingScreen('Cargando información...');

    effect(() => {
      if (this.isLoaded) {
        // 🔵 Cierra loader cuando todo esté listo
        this.alertService.close();

        this.recalcularEspecialidadesVisibles();

        // 🧠 Ahora el formulario se crea con permisos ya cargados
        this.inicializarFormulario();

        console.log('✅ Página completamente cargada con permisos aplicados');
      }
    });
  }

  ngOnInit(): void {
    // Si ya está cargado, no mostrar loader innecesario
    if (!this.isLoaded) {
      this.alertService.showLoadingScreen('Cargando información...');
    }

    // Si ya cargó por alguna razón (por ejemplo, vienes de otra ruta y el contexto ya está listo)
    if (this.isLoaded) {
      this.recalcularEspecialidadesVisibles();
      this.inicializarFormulario();
    }
  }

  inicializarFormulario() {
    const facultadDefault = this.facultadUnica ?? '';

    this.formularioHorario = this.fb.group({
      c_codfac: [
        { value: facultadDefault, disabled: this.facultadUnica !== null },
        Validators.required,
      ],
      c_codesp: ['', Validators.required],
      n_codper: [20261, Validators.required],
      c_grpcur: [[], Validators.required],
      n_ciclo: ['', Validators.required],
      c_codmod: ['', Validators.required],
      n_codpla: ['', Validators.required],
    });
  }

  getTurnos() {
    this.turnoService.getTurnos(this.filtros).subscribe((data) => {
      this.listOfData = data;
      this.datosFiltrados = [...this.listOfData];
      this.updateEditCache();
      this.aplicarPaginacion(true);
    });
  }

  onChangeFacultad(filtro: string, valor: string) {
    switch (filtro) {
      case 'n_codper':
        this.filtros.n_codper = Number(valor);

        if (this.filtros.c_codesp && this.filtros.c_codesp.trim() !== '') {
          this.getTurnos();
        }
        break;
      case 'facultad':
        this.filtros.c_codfac = valor;
        this.recalcularEspecialidadesVisibles();
        break;
      case 'especialidad':
        this.filtros.c_codesp = valor;

        if (valor && valor.trim() !== '') {
          this.getTurnos();
        } else {
          this.datosFiltrados = [];
          this.turnosPaginados = [];
        }
        return;
      case 'modalidad':
        this.filtros.c_codmod = valor;
        if (this.filtros.c_codesp && this.filtros.c_codesp.trim() !== '') {
          this.getTurnos();
        }
        break;

      case 'ciclo':
        this.filtros.n_ciclo = valor ? valor : '';
        if (this.filtros.c_codesp && this.filtros.c_codesp.trim() !== '') {
          this.getTurnos();
        }
        break;
    }
  }

  private detectFaculties(codes?: string[]): ('E' | 'S')[] {
    if (!codes || codes.length === 0) return [];
    const set = new Set<'E' | 'S'>();
    for (const c of codes) {
      const ch = c?.[0] as 'E' | 'S';
      if (ch === 'E' || ch === 'S') set.add(ch);
    }
    return Array.from(set);
  }

  get showFacultad(): boolean {
    return true;
  }
  get facultadUnica(): 'E' | 'S' | null {
    const facs = this.detectFaculties(this.hrEspecialidades);
    if (facs.length === 1) return facs[0];
    return null;
  }

  private recalcularEspecialidadesVisibles(): void {
    const permitidas = this.hrEspecialidades;
    const facs = this.detectFaculties(permitidas);
    let base = [...this.especialidades];

    if (Array.isArray(permitidas) && permitidas.length > 0) {
      base = base.filter((e) => permitidas.includes(e.codesp));
    }

    if (facs.length === 1) {
      this.filtros.c_codfac = facs[0];
    }

    if (this.filtros.c_codfac === 'E' || this.filtros.c_codfac === 'S') {
      base = base.filter((e) => e.codfac === this.filtros.c_codfac);
    }

    this.especialidadesFiltradas = base;

    if (
      this.filtros.c_codesp &&
      !this.especialidadesFiltradas.some(
        (e) => e.codesp === this.filtros.c_codesp
      )
    ) {
      this.filtros.c_codesp = '';
    }
  }

  onChangeFacultadFormulario() {
    const codfac = this.formularioHorario.get('c_codfac')?.value;
    const permitidas = this.hrEspecialidades || [];
    this.especialidadesFiltradas = this.especialidades.filter(
      (esp) => esp.codfac === codfac && permitidas.includes(esp.codesp)
    );

    const actual = this.formularioHorario.get('c_codesp')?.value;
    const existe = this.especialidadesFiltradas.some(
      (e) => e.codesp === actual
    );
    if (!existe) this.formularioHorario.get('c_codesp')?.setValue('');
  }

  guardarTurno() {
    if (this.formularioHorario.invalid) {
      this.formularioHorario.markAllAsTouched();
      console.warn('Formulario incompleto');

      this.alertService.saveError(
        'Completa todos los campos requeridos antes de guardar.'
      );
      return;
    }

    this.isSaving = true;

    const form = this.formularioHorario.value;
    const nom_fac =
      form.c_codfac === 'E'
        ? 'FACULTAD DE INGENIERÍA Y NEGOCIOS'
        : 'FACULTAD DE CIENCIAS DE LA SALUD';

    const especialidadSeleccionada = this.especialidades.find(
      (e) => e.codesp === form.c_codesp
    );
    const nomesp = especialidadSeleccionada
      ? especialidadSeleccionada.nomesp
      : 'SIN ESPECIALIDAD';

    const modalidadSeleccionada = this.modalidades.find(
      (m) => m.value === form.c_codmod
    );
    const c_nommod = modalidadSeleccionada
      ? modalidadSeleccionada.label.toUpperCase()
      : 'SIN MODALIDAD';

    const nuevoTurno = {
      ...form,
      n_ciclo: Number(form.n_ciclo),
      n_codper: Number(form.n_codper),
      n_codpla: Number(form.n_codpla),
      nom_fac,
      nomesp,
      c_nommod,
    };

    this.turnoService.createTurno(nuevoTurno).subscribe({
      next: () => {
        this.alertService.createTurnoSuccess();
        this.isSaving = false;
        this.mostrarModalCrear = false;
        this.cerrarModalCrear();
        this.getTurnos();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        const message = err.error?.message || 'Error al crear el turno.';
        this.alertService.saveError(message);
      },
    });
  }

  updateEditCache(): void {
    this.listOfData.forEach((item) => {
      this.editCache[item.id] = { edit: false, data: { ...item } };
    });
  }

  clickAsignarHorario(id: number) {
    const url = this.router.createUrlTree([`/coa/asignar/${id}`]).toString();
    window.open(url, '_blank');
  }

  private clampPagina(): void {
    this.totalPaginas = Math.max(
      1,
      Math.ceil(this.datosFiltrados.length / this.itemsPorPagina)
    );
    if (this.paginaActual > this.totalPaginas)
      this.paginaActual = this.totalPaginas;
    if (this.paginaActual < 1) this.paginaActual = 1;
  }

  aplicarPaginacion(reset = false): void {
    if (reset) this.paginaActual = 1;
    this.clampPagina();
    const ini = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = ini + this.itemsPorPagina;
    this.turnosPaginados = this.datosFiltrados.slice(ini, fin);
  }

  cambiarItemsPorPagina(n: number): void {
    this.itemsPorPagina = n;
    this.aplicarPaginacion(true);
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.aplicarPaginacion();
    }
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.aplicarPaginacion();
    }
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;

    const facultadDefault = this.facultadUnica ?? '';
    const disabled = this.facultadUnica !== null;

    this.formularioHorario.reset({
      c_codfac: facultadDefault,
      c_codesp: '',
      n_codper: 20261,
      c_grpcur: [],
      n_ciclo: '',
      c_codmod: '',
      n_codpla: '',
    });

    if (disabled) {
      this.formularioHorario.get('c_codfac')?.disable();
    } else {
      this.formularioHorario.get('c_codfac')?.enable();
    }

    this.seccionesSugeridas = [];
  }

  onBuscarSeccion(value: string): void {
    const letra = value.toUpperCase().charAt(0);

    if (/^[A-Z]$/.test(letra)) {
      this.seccionesSugeridas = Array.from(
        { length: 9 },
        (_, i) => `${letra}${i + 1}`
      );
    } else {
      this.seccionesSugeridas = [];
    }
  }

  // generarReporte() {
  //   this.turnoService.generarReporte().subscribe((data) => {
  //     console.log('data =>', data);
  //   });
  // }

  generarReporte() {
    this.alertService.showLoadingScreen('Generando reporte...');

    this.turnoService.generarReporte().subscribe((data) => {
      const fecha = new Date().toISOString().slice(0, 10);

      // Asegurar que sea un array
      const dataArray = Array.isArray(data) ? data : [data];

      // Convertir JSON → Excel
      const worksheet = XLSX.utils.json_to_sheet(dataArray);

      const workbook = {
        Sheets: { Reporte: worksheet },
        SheetNames: ['Reporte'],
      };

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });

      FileSaver.saveAs(blob, `ReporteTurnos_${fecha}.xlsx`);

      this.alertService.close();
    });
  }
}
