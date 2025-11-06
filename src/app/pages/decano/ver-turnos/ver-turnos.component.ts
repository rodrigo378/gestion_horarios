import { Component, inject, OnInit, effect } from '@angular/core';
import { TurnoService } from '../../../services/turno.service';
import { Router } from '@angular/router';
import { AuthContextService } from '../../../services_2/auth-context.service';
import { HR_Turno } from '../../../interfaces/hr/hr_turno';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../services/alert.service';

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
    {
      title: 'Estado',
      compare: (a: HR_Turno, b: HR_Turno) => a.estado - b.estado,
      nzWidth: '10%',
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
    estado: '',
    c_grpcur: '',
  };

  periodos = [{ n_codper: 20251 }, { n_codper: 20252 }, { n_codper: 20261 }];
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
    effect(() => {
      if (this.isLoaded) this.recalcularEspecialidadesVisibles();
    });
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.recalcularEspecialidadesVisibles();
  }

  inicializarFormulario() {
    this.formularioHorario = this.fb.group({
      c_codfac: ['', Validators.required],
      c_codesp: ['', Validators.required],
      n_codper: [20261, Validators.required],
      c_grpcur: [[], Validators.required],
      n_ciclo: ['', Validators.required],
      c_codmod: ['', Validators.required],
      n_codpla: ['', Validators.required],
    });
  }

  // ===================
  // === CARGA TURNOS ==
  // ===================
  getTurnos() {
    this.turnoService.getTurnos(this.filtros).subscribe((data) => {
      this.listOfData = data;
      this.datosFiltrados = [...this.listOfData];
      this.updateEditCache();
      this.aplicarPaginacion(true);
    });
  }

  // ===================
  // === FILTROS =======
  // ===================
  onChangeFacultad(filtro: string, valor: string) {
    switch (filtro) {
      case 'n_codper':
        this.filtros.n_codper = Number(valor);
        // Si ya hay una especialidad seleccionada, recargar turnos
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
        // Solo carga cuando se selecciona una especialidad
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
      case 'estado':
        this.filtros.estado = valor;
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
    const facs = this.detectFaculties(this.hrEspecialidades);
    return facs.length > 1;
  }

  private recalcularEspecialidadesVisibles(): void {
    const permitidas = this.hrEspecialidades;
    const facs = this.detectFaculties(permitidas);
    let base = [...this.especialidades];

    if (Array.isArray(permitidas) && permitidas.length > 0) {
      base = base.filter((e) => permitidas.includes(e.codesp));
    }
    if (facs.length === 1) this.filtros.c_codfac = facs[0];
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

  // ===================
  // === FORMULARIO ====
  // ===================

  // filtra las especialidades según facultad seleccionada
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

  // sugerencias automáticas para campo Sección
  // onInputSeccion(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   const value = input.value.toUpperCase();
  //   const letra = value.charAt(0);
  //   this.formularioHorario.get('c_grpcur')?.setValue(value);

  //   // Solo genera sugerencias si la primera letra es válida
  //   if (/^[A-Z]$/.test(letra)) {
  //     this.seccionesSugeridas = Array.from(
  //       { length: 9 },
  //       (_, i) => `${letra}${i + 1}`
  //     );
  //   } else {
  //     this.seccionesSugeridas = [];
  //   }
  // }

  // guardar nuevo turno
  // guardarTurno() {
  //   if (this.formularioHorario.invalid) {
  //     this.formularioHorario.markAllAsTouched();
  //     console.warn('Formulario incompleto');
  //     return;
  //   }

  //   this.isSaving = true; // 👈 inicia estado de carga

  //   const form = this.formularioHorario.value;
  //   const nom_fac =
  //     form.c_codfac === 'E'
  //       ? 'FACULTAD DE INGENIERÍA Y NEGOCIOS'
  //       : 'FACULTAD DE CIENCIAS DE LA SALUD';

  //   const especialidadSeleccionada = this.especialidades.find(
  //     (e) => e.codesp === form.c_codesp
  //   );
  //   const nomesp = especialidadSeleccionada
  //     ? especialidadSeleccionada.nomesp
  //     : 'SIN ESPECIALIDAD';

  //   const modalidadSeleccionada = this.modalidades.find(
  //     (m) => m.value === form.c_codmod
  //   );
  //   const c_nommod = modalidadSeleccionada
  //     ? modalidadSeleccionada.label.toUpperCase()
  //     : 'SIN MODALIDAD';

  //   const nuevoTurno = {
  //     ...form,
  //     n_ciclo: Number(form.n_ciclo),
  //     n_codper: Number(form.n_codper),
  //     n_codpla: Number(form.n_codpla),
  //     estado: 0,
  //     nom_fac,
  //     nomesp,
  //     c_nommod,
  //   };

  //   this.turnoService.createTurno(nuevoTurno).subscribe({
  //     next: () => {
  //       this.alertService.createTurnoSuccess();
  //       this.isSaving = false; // 👈 detener loader
  //       this.mostrarModalCrear = false;
  //       this.cerrarModalCrear(); // 👈 limpiar correctamente
  //       this.getTurnos();
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       this.isSaving = false; // 👈 detener loader también en error
  //       const message = err.error?.message || 'Error al crear el turno.';
  //       this.alertService.createTurnoError(message);
  //     },
  //   });
  // }
  guardarTurno() {
    if (this.formularioHorario.invalid) {
      this.formularioHorario.markAllAsTouched();
      console.warn('Formulario incompleto');

      // ⚠️ Mostrar alerta personalizada
      this.alertService.saveError(
        'Completa todos los campos requeridos antes de guardar.'
      );
      return;
    }

    this.isSaving = true; // 👈 inicia estado de carga

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
      estado: 0,
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

  // ===================
  // === PAGINACIÓN ====
  // ===================
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

    this.formularioHorario.reset({
      c_codfac: '',
      c_codesp: '',
      n_codper: 20261,
      c_grpcur: [], // 👈 limpiar correctamente el array
      n_ciclo: '',
      c_codmod: '',
      n_codpla: '',
    });

    this.seccionesSugeridas = []; // 👈 también limpia las sugerencias
  }

  // Cuando el usuario selecciona una opción del autocomplete
  // onSeleccionarSeccion(event: NzAutocompleteOptionComponent): void {
  //   const valor = event.nzValue;
  //   this.formularioHorario.get('c_grpcur')?.setValue(valor);
  // }

  // Si el usuario no selecciona ninguna opción válida
  // validarSeleccionSeccion(): void {
  //   const valor = this.formularioHorario.get('c_grpcur')?.value;
  //   if (!this.seccionesSugeridas.includes(valor)) {
  //     this.formularioHorario.get('c_grpcur')?.setValue('');
  //   }
  // }

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
}
