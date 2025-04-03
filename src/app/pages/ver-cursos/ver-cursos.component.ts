import { Component, OnInit } from '@angular/core';
import { HorarioService } from '../../services/horario.service';
import { AlertService } from '../../services/alert.service';
import { Curso2 } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';
import { ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { Turno } from '../../interfaces/turno';

@Component({
  selector: 'app-ver-cursos',
  standalone: false,
  templateUrl: './ver-cursos.component.html',
  styleUrl: './ver-cursos.component.css',
})
export class VerCursosComponent implements OnInit {
  cursos: Curso2[] = [];
  curso!: Curso2;
  turno!: Turno;
  mostrarModalCrear: boolean = false;
  id!: number;

  constructor(
    private horarioService: HorarioService,
    private turnoService: TurnoService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.getCursos();
    this.getTurno();
  }

  getCursos() {
    this.horarioService
      .getCurso(undefined, undefined, undefined, undefined, undefined, this.id)
      .subscribe((data) => {
        this.cursos = data.data;
        console.log('cursos => ', this.cursos);
      });
  }

  getTurno() {
    this.turnoService.getTurnoById(this.id).subscribe((data) => {
      this.turno = data;
      console.log('turno => ', this.turno);
    });
  }

  cerrarModal() {
    this.mostrarModalCrear = false;
  }

  clickAbrirModal(curso: Curso2) {
    this.mostrarModalCrear = true;
    console.log('cursos1 => ', curso);
  }
}
