import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../../services/turno.service';
import { HR_Turno } from '../../../interfaces/hr/hr_turno';

@Component({
  selector: 'app-asignar-horario',
  standalone: false,
  templateUrl: './asignar-horario.component.html',
  styleUrl: './asignar-horario.component.css',
})
export class AsignarHorarioComponent implements OnInit {
  turno_id!: number;
  turno!: HR_Turno;

  constructor(
    private route: ActivatedRoute,
    private turnoService: TurnoService
  ) {}

  ngOnInit(): void {
    this.turno_id = Number(this.route.snapshot.paramMap.get('turno_id'));
    console.log('ID recibido:', this.turno_id);

    this.getTurno();
  }

  getTurno() {
    this.turnoService.getTurno(this.turno_id).subscribe((data) => {
      this.turno = data;
      console.log('turno => ', this.turno);
    });
  }
}

//  Asignación de horarios | 20252 - 2025 - ENFERMERÍA - 5° Ciclo - Presencial - Sección M1 -
