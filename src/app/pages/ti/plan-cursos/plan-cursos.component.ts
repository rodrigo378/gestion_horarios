import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanCursoService } from '../../../services/plan-curso.service';
import { AlertService } from '../../../services/alert.service';
import { HR_Plan_Estudio_Curso } from '../../../interfaces/hr/hr_plan_estudio_curso';

@Component({
  selector: 'app-plan-cursos',
  standalone: false,
  templateUrl: './plan-cursos.component.html',
  styleUrl: './plan-cursos.component.css',
})
export class PlanCursosComponent implements OnInit {
  // ============================
  // FILTROS
  // ============================
  filtros = {
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
  };

  especialidadesFiltradas: any[] = []; // se llena según c_codfac

  // ============================
  // DATOS
  // ============================
  editCache: { [key: string]: { edit: boolean; data: HR_Plan_Estudio_Curso } } =
    {};
  listOfData: HR_Plan_Estudio_Curso[] = [];
  datosFiltrados: HR_Plan_Estudio_Curso[] = [];

  searchValue: string = '';

  listOfColumn = [
    { title: 'id', compare: (a: any, b: any) => a.id - b.id },
    {
      title: 'Facultad',
      compare: (a: any, b: any) => a.c_codfac.localeCompare(b.c_codfac),
    },
    {
      title: 'Especialidad',
      compare: (a: any, b: any) => a.c_codesp.localeCompare(b.c_codesp),
      priority: 3,
    },
    {
      title: 'Modalidad',
      compare: (a: any, b: any) => a.c_codmod - b.c_codmod,
      priority: 2,
    },
    {
      title: 'Código',
      compare: (a: any, b: any) => a.c_codcur.localeCompare(b.c_codcur),
      priority: 1,
    },
    {
      title: 'Nombre',
      compare: (a: any, b: any) => a.c_nomcur.localeCompare(b.c_nomcur),
      priority: 0,
    },
    {
      title: 'Tipo',
      compare: (a: any, b: any) => a.c_area.localeCompare(b.c_area),
      priority: 0,
    },
    {
      title: 'Ciclo',
      compare: (a: any, b: any) => a.n_ciclo - b.n_ciclo,
      priority: 1,
    },
    {
      title: 'Teoria',
      compare: (a: any, b: any) => a.n_ht - b.n_ht,
      priority: 1,
    },
    {
      title: 'Practica',
      compare: (a: any, b: any) => a.n_hp - b.n_hp,
      priority: 1,
    },
    {
      title: 'UmaPlus',
      compare: (a: any, b: any) => a.c_curup - b.c_curup,
      priority: 1,
    },
    { title: 'Acciones' },
  ];

  constructor(
    private planCursoService: PlanCursoService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.getPlanCurso();
  }

  // ======================================================
  // OBTENER DATOS
  // ======================================================
  getPlanCurso() {
    this.planCursoService.getPlanCurso().subscribe((data) => {
      this.listOfData = data;
      this.datosFiltrados = [...this.listOfData];

      // llenar especialidades iniciales
      this.actualizarEspecialidades();

      this.updateEditCache();
    });
  }

  // ======================================================
  // BÚSQUEDA POR TEXTO
  // ======================================================
  buscar(): void {
    const filtro = this.searchValue.trim().toLowerCase();

    this.datosFiltrados = this.listOfData.filter(
      (item) =>
        item.c_codcur.toLowerCase().includes(filtro) ||
        item.c_nomcur.toLowerCase().includes(filtro)
    );

    // aplicar filtros combinados también
    this.aplicarFiltros();
  }

  // ======================================================
  // FILTRADO COMBINADO
  // ======================================================
  filtrarCursos() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.datosFiltrados = this.listOfData.filter(
      (item) =>
        (this.filtros.c_codfac
          ? item.c_codfac === this.filtros.c_codfac
          : true) &&
        (this.filtros.c_codesp
          ? item.c_codesp === this.filtros.c_codesp
          : true) &&
        (this.filtros.c_codmod
          ? item.c_codmod === Number(this.filtros.c_codmod)
          : true) &&
        (this.filtros.n_ciclo
          ? item.n_ciclo === Number(this.filtros.n_ciclo)
          : true) &&
        (this.searchValue
          ? item.c_codcur
              .toLowerCase()
              .includes(this.searchValue.toLowerCase()) ||
            item.c_nomcur.toLowerCase().includes(this.searchValue.toLowerCase())
          : true)
    );

    // actualizar especialidades según facultad seleccionada
    this.actualizarEspecialidades();
  }

  // ======================================================
  // DEPENDENCIA: FACULTAD → ESPECIALIDAD
  // ======================================================
  actualizarEspecialidades() {
    if (!this.filtros.c_codfac) {
      this.especialidadesFiltradas = [];
      return;
    }

    this.especialidadesFiltradas = this.listOfData
      .filter((x) => x.c_codfac === this.filtros.c_codfac)
      .reduce((acc: any[], item: any) => {
        if (!acc.some((e) => e.codesp === item.c_codesp)) {
          acc.push({
            codesp: item.c_codesp,
            nomesp: item.c_codesp, // si tienes nombre real, cámbialo aquí
          });
        }
        return acc;
      }, []);
  }

  // ======================================================
  // RESET FILTROS
  // ======================================================
  resetFiltros() {
    this.filtros = {
      c_codfac: '',
      c_codesp: '',
      c_codmod: '',
      n_ciclo: '',
    };

    this.searchValue = '';

    this.datosFiltrados = [...this.listOfData];
    this.especialidadesFiltradas = [];

    this.aplicarFiltros();
  }

  // ======================================================
  // EDICIÓN
  // ======================================================
  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfData.findIndex((item) => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfData[index] },
      edit: false,
    };
  }

  saveEdit(id: number): void {
    this.alertService.iniciarSolicitud();
    const index = this.listOfData.findIndex((item) => item.id === id);

    this.planCursoService.updatePlanCurso(this.editCache[id].data).subscribe({
      next: (res: any) => {
        Object.assign(this.listOfData[index], this.editCache[id].data);
        this.alertService.finalizarSolicitud();
      },
      error: (er: HttpErrorResponse) => {
        this.alertService.finalizarSolicitud();
      },
    });

    this.editCache[id].edit = false;
  }

  updateEditCache(): void {
    this.listOfData.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }
}
