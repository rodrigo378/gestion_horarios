import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../../services/turno.service';
import { Turno } from '../../../interfaces/turno';
import { PlanCurso } from '../../../interfaces/Plan';
import { Curso2 } from '../../../interfaces/Curso';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface table {
  id: number;
  n_codper: string;
  c_codcur: number;
  c_nomcur: string;
  n_ciclo: string;
  n_ht: number;
  n_hp: number;
  c_area: string;
  c_curup: number;
  c_alu: number;
}

@Component({
  selector: 'app-generar-cursos',
  standalone: false,
  templateUrl: './generar-cursos.component.html',
  styleUrl: './generar-cursos.component.css',
})
export class GenerarCursosComponent implements OnInit {
  turno_id!: number;
  turno!: Turno;
  // listOfData: PlanCurso[] = [];
  listOfData: any[] = [];

  cursosPlan: PlanCurso[] = [];
  cursos: Curso2[] = [];

  cursoSeleccionado!: PlanCurso;

  isVisible: boolean = false;

  vacantes: number = 20;

  constructor(
    private route: ActivatedRoute,
    private turnoService: TurnoService
  ) {}

  ngOnInit(): void {
    this.turno_id = Number(this.route.snapshot.paramMap.get('turno_id'));

    this.getTurno();
    this.getDataTable();
  }

  getTurno() {
    this.turnoService.getTurno(this.turno_id).subscribe((data) => {
      this.turno = data;
    });
  }

  getDataTable() {
    forkJoin({
      plan: this.turnoService.getCursosPlanTurno(this.turno_id),
      generados: this.turnoService.getCursosTurno(this.turno_id),
    }).subscribe(({ plan, generados }) => {
      this.cursosPlan = plan;
      this.cursos = generados;

      console.log('plan => ', this.cursosPlan);
      console.log('cursos => ', this.cursos);

      this.listOfData = plan.map((cursoPlan: any) => {
        const yaGenerado = generados.find(
          (c: any) => c.curso.c_codcur === cursoPlan.c_codcur
        );

        return {
          ...cursoPlan,
          cursoGenerado: yaGenerado || null, // puedes guardar más info aquí
        };
      });
    });
  }

  getCursosPlan() {
    this.turnoService.getCursosPlanTurno(this.turno_id).subscribe((data) => {
      // this.listOfData = data;
      this.cursosPlan = data;
      console.log('plan => ', this.cursosPlan);
    });
  }

  getCursos() {
    this.turnoService.getCursosTurno(this.turno_id).subscribe((data) => {
      this.cursos = data;
      console.log('cursos => ', this.cursos);
    });
  }

  showModal(curso: any): void {
    this.cursoSeleccionado = curso;
    console.log('aca => ', this.cursoSeleccionado);

    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;
    const newCurso: Curso2 = {
      id_planCurso: Number(this.cursoSeleccionado.id),
      turno_id: this.turno_id,
      c_alu: this.vacantes,
    };

    this.turnoService.generarCurso(newCurso).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}
