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
  editCache: { [key: string]: { edit: boolean; data: HR_Plan_Estudio_Curso } } =
    {};
  listOfData: HR_Plan_Estudio_Curso[] = [];
  searchValue: string = '';
  datosFiltrados: HR_Plan_Estudio_Curso[] = [];

  listOfColumn = [
    // {
    //   title: 'id',
    //   nzWidth: '20%',
    //   compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) => a.id - b.id,
    //   priority: false,
    // },
    {
      title: 'Facultad',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_codfac.localeCompare(b.c_codfac),
      priority: false,
      nzWidth: '7%',
    },
    {
      title: 'Especialidad',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_codesp.localeCompare(b.c_codesp),
      priority: 3,
      nzWidth: '8%',
    },
    {
      title: 'Modalidad',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_codmod - b.c_codmod,
      priority: 2,
      nzWidth: '7%',
    },
    {
      title: 'Codigo',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_codcur.localeCompare(b.c_codcur),
      priority: 1,
      nzWidth: '8%',
    },
    {
      title: 'Nombre',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_nomcur.localeCompare(b.c_nomcur),
      priority: 0,
      nzWidth: '25%',
    },
    {
      title: 'Tipo',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_area.localeCompare(b.c_area),
      priority: 0,
      nzWidth: '8%',
    },
    {
      title: 'Teoria',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.n_ht - b.n_ht,
      priority: 1,
      nzWidth: '7%',
    },
    {
      title: 'Practica',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.n_hp - b.n_hp,
      priority: 1,
      nzWidth: '7%',
    },
    {
      title: 'UnaPlus',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_curup - b.c_curup,
      priority: 1,
      nzWidth: '7%',
    },
    {
      title: 'Acciones',
      compare: (a: HR_Plan_Estudio_Curso, b: HR_Plan_Estudio_Curso) =>
        a.c_curup - b.c_curup,
      priority: 1,
      nzWidth: '10%',
    },
  ];

  constructor(
    private planCursoService: PlanCursoService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.getPlanCurso();
  }

  getPlanCurso() {
    this.planCursoService.getPlanCurso().subscribe((data) => {
      this.listOfData = data;
      this.datosFiltrados = [...this.listOfData];

      this.updateEditCache();
    });
  }

  buscar(): void {
    const filtro = this.searchValue.trim().toLowerCase();
    this.datosFiltrados = this.listOfData.filter(
      (item) =>
        item.c_codcur.toLowerCase().includes(filtro) ||
        item.c_nomcur.toLowerCase().includes(filtro)
    );
  }

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
    console.log('saveEdit => ', id);
    const index = this.listOfData.findIndex((item) => item.id === id);

    this.planCursoService.updatePlanCurso(this.editCache[id].data).subscribe({
      next: (res: any) => {
        Object.assign(this.listOfData[index], this.editCache[id].data);
        console.log('res => ', res);
        this.alertService.finalizarSolicitud();
      },
      error: (er: HttpErrorResponse) => {
        console.log('error => ', er);
        this.alertService.finalizarSolicitud();
      },
    });

    console.log('new data => ', this.editCache[id].data);

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
