import { Component, inject, OnInit, effect } from '@angular/core';
import { TurnoService } from '../../../services/turno.service';
import { Router } from '@angular/router';
import { AuthContextService } from '../../../services_2/auth-context.service';
import { HR_Turno } from '../../../interfaces/hr/hr_turno';

@Component({
  selector: 'app-ver-turnos',
  standalone: false,
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css',
})
export class VerTurnosComponent implements OnInit {
  private ctx = inject(AuthContextService);

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

  // datos
  listOfData: HR_Turno[] = [];
  datosFiltrados: HR_Turno[] = []; // resultado de servidor (o filtros locales si agregas)
  turnosPaginados: HR_Turno[] = []; // slice visible en tabla

  // paginación personalizada
  itemsPorPagina = 8;
  paginaActual = 1;
  totalPaginas = 1;
  readonly opcionesPagina = [8, 10, 20, 50, 100, 150];

  // (si mantienes el editCache por alguna otra razón visual)
  editCache: { [key: string]: { edit: boolean; data: HR_Turno } } = {};

  // filtros
  filtros = {
    n_codper: '20252',
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
    estado: '',
    c_grpcur: '',
  };

  especialidades: { nomesp: string; codesp: string; codfac: string }[] = [
    {
      nomesp: 'ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
      codesp: 'E1',
      codfac: 'E',
    },
    { nomesp: 'ADMINISTRACIÓN Y MARKETING', codesp: 'E2', codfac: 'E' },
    { nomesp: 'CONTABILIDAD Y FINANZAS', codesp: 'E3', codfac: 'E' },
    {
      nomesp: 'ADMINISTRACIÓN Y NEGOS INTERNACIONALES',
      codesp: 'E4',
      codfac: 'E',
    },
    { nomesp: 'INGENIERÍA INDUSTRIAL', codesp: 'E5', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE IA', codesp: 'E6', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'ADMINISTRACIÓN DE EMPRESAS', codesp: 'E8', codfac: 'E' },
    { nomesp: 'DERECHO', codesp: 'E9', codfac: 'E' },
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

  listOfColumn = [
    {
      title: 'Periodo',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_codper - b.n_codper,
      priority: false,
      nzWidth: 'auto',
    },
    {
      title: 'Plan',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_codpla - b.n_codpla,
      priority: false,
      nzWidth: 'auto',
    },
    {
      title: 'Facultad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_codfac.localeCompare(b.c_codfac),
      priority: 3,
      nzWidth: 'auto',
    },
    {
      title: 'Especialidad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_codesp.localeCompare(b.c_codesp),
      priority: 2,
      nzWidth: 'auto',
    },
    {
      title: 'Seccion',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_grpcur.localeCompare(b.c_grpcur),
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Ciclo',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_ciclo - b.n_ciclo,
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Modalidad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_nommod.localeCompare(b.c_nommod),
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Estado',
      compare: (a: HR_Turno, b: HR_Turno) => a.estado - b.estado,
      priority: 1,
      nzWidth: '10%',
    },
    { title: 'Accion', compare: false, priority: 1, nzWidth: 'auto' },
  ];

  constructor(private turnoService: TurnoService, private router: Router) {
    effect(() => {
      if (this.isLoaded) this.recalcularEspecialidadesVisibles();
    });
  }

  ngOnInit(): void {
    this.recalcularEspecialidadesVisibles();
    this.getTurnos();
  }

  // ====== SERVICIO / REFRESH ======
  getTurnos() {
    this.turnoService.getTurnos(this.filtros).subscribe((data) => {
      this.listOfData = data;
      this.datosFiltrados = [...this.listOfData];
      this.updateEditCache();
      this.aplicarPaginacion(true); // reset a página 1 en cada fetch
    });
  }

  // ====== FILTROS (disparan fetch) ======
  onChangeFacultad(filtro: string, valor: string) {
    switch (filtro) {
      case 'n_codper':
        this.filtros.n_codper = valor;
        break;
      case 'facultad':
        this.filtros.c_codfac = valor;
        this.recalcularEspecialidadesVisibles();
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
    this.getTurnos();
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
    let base = this.especialidades;

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

  // ====== EDIT CACHE (si lo usas para estilos) ======
  updateEditCache(): void {
    this.listOfData.forEach((item) => {
      this.editCache[item.id] = { edit: false, data: { ...item } };
    });
  }

  // ====== NAVEGACIÓN ======
  clickAsignarHorario(id: number) {
    const url = this.router
      .createUrlTree([`/coa/asignar/${id}`], {})
      .toString();
    window.open(url, '_blank');
  }

  // ====== PAGINACIÓN PERSONALIZADA ======
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
    this.aplicarPaginacion(true); // reinicia a página 1
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
}
