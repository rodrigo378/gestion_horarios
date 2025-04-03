import { Component, OnInit } from '@angular/core';
import { HorarioService } from '../../services/horario.service';
import { AlertService } from '../../services/alert.service';
import { Curso2 } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';
import { ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { Turno } from '../../interfaces/turno';
import { CreateHorarioRequest, Horario } from '../../interfaces/Horario';
import { DocenteService } from '../../services/docente.service';
import { AulaService } from '../../services/aula.service';
import { Docente } from '../../interfaces/Docente';
import { Aula } from '../../interfaces/Aula';
import { HttpErrorResponse } from '@angular/common/http';

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
    n_horas: 0,
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
        this.cursos = data.data.map((curso: Curso2) => ({
          ...curso,
          cursosPadres: curso.cursosPadres ?? [], // ← aquí garantizas que no sea undefined
          cursosHijos: curso.cursosHijos ?? [],   // ← opcional, por si acaso
        }));
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
      tipo: horario.tipo,
      dia: horario.dia,
      h_inicio: horario.h_inicio?.substring(11, 16),
      h_fin: horario.h_fin?.substring(11, 16),
      n_horas: horario.n_horas,
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
      n_horas: 0,
    };
    console.log(this.formHorario);
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

  createHorario() {
    console.log(this.formHorario);
    console.log('curso => ', this.curso);

    if (this.formHorario.id === 0) {
      const [horaStr, minutoStr] = this.formHorario.h_inicio.split(':');
      const hora = parseInt(horaStr, 10) + 5; // Sumar 5 horas reales
      const minuto = parseInt(minutoStr, 10);

      const inicio = new Date(Date.UTC(2024, 0, 1, hora, minuto)); // Enero = 0

      const minutosTotales = Number(this.formHorario.n_horas) * 50;

      const fin = new Date(inicio.getTime() + minutosTotales * 60000);

      const h_inicio = inicio.toISOString();
      const h_fin = fin.toISOString();

      const newHorario: any = {
        dataArray: [
          {
            curso: {
              n_codper: this.curso.n_codper,
              c_codmod: Number(this.curso.c_codmod),
              c_codfac: this.curso.c_codfac,
              c_codesp: this.curso.c_codesp,
              c_codcur: this.curso.c_codcur,
              c_nomcur: this.curso.c_nomcur,
              n_ciclo: this.curso.n_ciclo,
              c_area: this.curso.c_area,
              turno_id: this.curso.turno_id,

              n_codper_equ: this.curso.n_codper_equ || '',
              c_codmod_equ: Number(this.curso.c_codmod_equ) || 0,
              c_codfac_equ: this.curso.c_codfac_equ || '',
              c_codesp_equ: this.curso.c_codesp_equ || '',
              c_codcur_equ: this.curso.c_codcur_equ || '',
              c_nomcur_equ: this.curso.c_nomcur_equ || '',
            },
            horarios: [
              {
                dia: this.formHorario.dia,
                h_inicio: h_inicio,
                h_fin: h_fin,
                n_horas: Number(this.formHorario.n_horas),
                c_color: '#3788d8',
                aula_id: Number(this.formHorario.aula_id),
                docente_id: Number(this.formHorario.docente_id),
                turno_id: this.turno.id,
                tipo: this.formHorario.tipo,
              },
            ],
          },
        ],
        verificar: true,
      };

      this.horarioService.guardarHorarios(newHorario).subscribe({
        next: (res: any) => {
          console.log('res => ', res);
        },
        error: (err: HttpErrorResponse) => {
          console.log('err => ', err);
        },
      });
    }
  }
}
