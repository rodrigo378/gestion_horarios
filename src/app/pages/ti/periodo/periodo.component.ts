import { Component, OnInit } from '@angular/core';
import { PeriodoService } from '../../../services/periodo.service';
import { AlertService } from '../../../services/alert.service';
import { HR_Periodo } from '../../../interfaces/hr/hr_periodo';

@Component({
  selector: 'app-periodo',
  standalone: false,
  templateUrl: './periodo.component.html',
  styleUrl: './periodo.component.css',
})
export class PeriodoComponent implements OnInit {
  periodos: HR_Periodo[] = [];

  constructor(
    private periodoService: PeriodoService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.obtenerPeriodos();
  }

  obtenerPeriodos(): void {
    this.periodoService.getPeriodos().subscribe({
      next: (data) => {
        this.periodos = data;
      },
      error: (error) => {
        console.error('Error al obtener los periodos:', error);
      },
    });
  }

  actualizarPeriodo(n_codper: number, nuevaFecha: string): void {
    this.periodoService.updatePeriodo(n_codper, nuevaFecha).subscribe({
      next: () => {
        this.alertService.success(
          'Fecha actualizada correctamente',
          'segundo parametro'
        );
        this.obtenerPeriodos();
      },
      error: () => {
        this.alertService.error('Error al actualizar la fecha');
      },
    });
  }

  nuevoPeriodo = {
    n_codper: '',
    f_cierre: '',
  };

  crearPeriodo(): void {
    if (!this.nuevoPeriodo.n_codper || !this.nuevoPeriodo.f_cierre) {
      this.alertService.error('Debe completar ambos campos');
      return;
    }

    this.periodoService
      .createPeriodo(
        Number(this.nuevoPeriodo.n_codper),
        this.nuevoPeriodo.f_cierre
      )
      .subscribe({
        next: () => {
          this.alertService.success(
            'Periodo creado exitosamente',
            'segundo parametro'
          );
          this.nuevoPeriodo = { n_codper: '', f_cierre: '' };
          this.obtenerPeriodos();
        },
        error: () => {
          this.alertService.error('Error al crear el periodo');
        },
      });
  }
}
