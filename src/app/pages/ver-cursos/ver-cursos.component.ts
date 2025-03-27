import { Component, OnInit } from '@angular/core';
import { HorarioService } from '../../services/horario.service';
import { Horario } from '../../interfaces/Horario';
import { Especialidad } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';

@Component({
  selector: 'app-ver-cursos',
  standalone: false,
  templateUrl: './ver-cursos.component.html',
  styleUrl: './ver-cursos.component.css',
})
export class VerCursosComponent implements OnInit {
  horarios: Horario[] = [];
  horario!: Horario;
  especialidades: Especialidad[] = [];
  especialidadesModal: Especialidad[] = [];
  cursosFiltrados: any[] = [];

  selectFacultadad: string = '';
  selectEspecialidad: string = '';
  selectModalidad: string = '';
  selectPlan: string = '';
  selectPeriodo: string = '';

  mostrarModalCrear: boolean = false;

  filtros = {
    c_codmod: '',
    c_codfac: '',
    c_codesp: '',
    c_codpla: '',
  };

  constructor(
    private horarioService: HorarioService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {}

  getHorarios() {
    this.horarioService
      .getHorarios(
        this.selectModalidad,
        Number(this.selectPeriodo),
        this.selectFacultadad,
        this.selectEspecialidad,
        Number(this.selectPlan)
      )
      .subscribe((data) => {
        this.horarios = data;
        console.log('cursos tabla');
      });
  }

  getHorariosFiltrados() {
    console.log('filtros => ', this.filtros);

    this.horarioService
      .getHorarios(
        this.filtros.c_codmod,
        undefined,
        this.filtros.c_codfac,
        this.filtros.c_codesp,
        Number(this.filtros.c_codpla)
      )
      .subscribe((data) => {
        this.cursosFiltrados = data;
        console.log('cursos modal => ', data);
      });
  }

  changeSelectFacultad() {
    this.cursoService.getEspecialidades().subscribe((data) => {
      this.especialidades = data.filter(
        (especialidad) => especialidad.codfac === this.selectFacultadad
      );

      this.selectEspecialidad = '';
    });
  }

  changeSelectFacultadModal() {
    this.cursoService.getEspecialidades().subscribe((data) => {
      this.especialidadesModal = data.filter(
        (especialidad) => especialidad.codfac === this.filtros.c_codfac
      );

      this.filtros.c_codesp = '';
    });
  }

  clickDefinirCursoTransversales() {
    this.getHorarios();
  }

  clickMas(horario: Horario) {
    console.log('horario => ', horario);
    this.mostrarModalCrear = true;
  }

  clickBuscarCursosModal() {
    this.getHorariosFiltrados();
  }
}
