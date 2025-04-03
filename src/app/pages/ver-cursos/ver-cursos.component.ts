import { Component, OnInit } from '@angular/core';
import { HorarioService } from '../../services/horario.service';
import { AlertService } from '../../services/alert.service';
import { Curso2 } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';
import { ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { Turno } from '../../interfaces/turno';
import { Horario } from '../../interfaces/Horario';
import { DocenteService } from '../../services/docente.service';
import { AulaService } from '../../services/aula.service';
import { Docente } from '../../interfaces/Docente';
import { Aula } from '../../interfaces/Aula';

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
  docentes: Docente[] = [];
  aulas: Aula[] = [];
  mostrarModalCrear: boolean = false;
  id!: number;

  formHorario: any = {
    id: 0,
    docente_id: '',
    aula_id: '',
    tipo: '',
    dia: '',
    h_inicio: '',
    h_fin: '',
  };

  constructor(
    private horarioService: HorarioService,
    private docenteService: DocenteService,
    private aulaService: AulaService,
    private turnoService: TurnoService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) || 0;
    console.log('Id => ', this.id);

    this.getAulas();
    this.getDocentes();
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
    this.curso = curso;
    console.log('cursos1 => ', curso);
  }

  clickRow(horario: Horario) {
    console.log(horario);

    this.formHorario = {
      id: horario.id || '',
      docente_id: horario.docente_id || '',
      aula_id: horario.aula_id || '',
      tipo: horario.tipo || '',
      dia: horario.dia || '',
      h_inicio: horario.h_inicio?.substring(11, 16) || '',
      h_fin: horario.h_fin?.substring(11, 16) || '',
    };
  }

  nuevoFormulario() {
    this.formHorario = {
      id: 0,
      docente_id: '',
      aula_id: '',
      tipo: '',
      dia: '',
      h_inicio: '',
      h_fin: '',
    };
  }

  getAulas() {
    this.aulaService.obtenerAulas().subscribe((data) => {
      this.aulas = data;
      console.log('aulas => ', this.aulas);
    });
  }

  getDocentes() {
    this.docenteService.getDocentes().subscribe((data) => {
      this.docentes = data;
      console.log('docentes => ', this.docentes);
    });
  }
}
