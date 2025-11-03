import { Component, OnInit } from '@angular/core';
import { PlanCurso } from '../../../interfaces_2/Plan';
import { AlertService } from '../../../services_2/alert.service';
import { PlanCursoService } from '../../../services_2/plan-curso.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-plan-cursos',
  standalone: false,
  templateUrl: './plan-cursos.component.html',
  styleUrl: './plan-cursos.component.css',
})
export class PlanCursosComponent implements OnInit {
  editCache: { [key: string]: { edit: boolean; data: PlanCurso } } = {};
  listOfData: PlanCurso[] = [];
  searchValue: string = '';
  datosFiltrados: PlanCurso[] = [];

  listOfColumn = [
    // {
    //   title: 'id',
    //   nzWidth: '20%',
    //   compare: (a: PlanCurso, b: PlanCurso) => a.id - b.id,
    //   priority: false,
    // },
    {
      title: 'Facultad',
      compare: (a: PlanCurso, b: PlanCurso) =>
        a.c_codfac.localeCompare(b.c_codfac),
      priority: false,
      nzWidth: '7%',
    },
    {
      title: 'Especialidad',
      compare: (a: PlanCurso, b: PlanCurso) =>
        a.c_codesp.localeCompare(b.c_codesp),
      priority: 3,
      nzWidth: '8%',
    },
    {
      title: 'Modalidad',
      compare: (a: PlanCurso, b: PlanCurso) => a.c_codmod - b.c_codmod,
      priority: 2,
      nzWidth: '7%',
    },
    {
      title: 'Codigo',
      compare: (a: PlanCurso, b: PlanCurso) =>
        a.c_codcur.localeCompare(b.c_codcur),
      priority: 1,
      nzWidth: '8%',
    },
    {
      title: 'Nombre',
      compare: (a: PlanCurso, b: PlanCurso) =>
        a.c_nomcur.localeCompare(b.c_nomcur),
      priority: 0,
      nzWidth: '25%',
    },
    {
      title: 'Tipo',
      compare: (a: PlanCurso, b: PlanCurso) => a.c_area.localeCompare(b.c_area),
      priority: 0,
      nzWidth: '8%',
    },
    {
      title: 'Teoria',
      compare: (a: PlanCurso, b: PlanCurso) => a.n_ht - b.n_ht,
      priority: 1,
      nzWidth: '7%',
    },
    {
      title: 'Practica',
      compare: (a: PlanCurso, b: PlanCurso) => a.n_hp - b.n_hp,
      priority: 1,
      nzWidth: '7%',
    },
    {
      title: 'UnaPlus',
      compare: (a: PlanCurso, b: PlanCurso) => a.c_curup - b.c_curup,
      priority: 1,
      nzWidth: '7%',
    },
    {
      title: 'Acciones',
      compare: (a: PlanCurso, b: PlanCurso) => a.c_curup - b.c_curup,
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
