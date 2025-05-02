import { Aula } from '../../../interfaces/Aula';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { AulaService } from '../../../services/aula.service';
import { AlertService } from '../../../services/alert.service';
import { AsistenciaService } from '../../../services/asistencia.service';
import { DocentecurService } from '../../../services/docentecur.service';

@Component({
  standalone: false,
  selector: 'app-marcar-asistencia',
  styleUrl: './marcar-asistencia.component.css',
  templateUrl: './marcar-asistencia.component.html',
})
export class MarcarAsistenciaComponent implements OnInit {
  aula!: Aula;
  inputValue?: string;
  asistencias: any = [];
  selectedDocenteId?: number;
  filteredOptions: string[] = [];
  nombreDocenteSeleccionado: string = '';
  options: { id: number; nombre: string }[] = [];

  constructor(
    private userService: UserService,
    private aulaService: AulaService,
    private alertService: AlertService,
    private asistenciaService: AsistenciaService,
    private docentecurService: DocentecurService
  ) {
    this.filteredOptions = this.options.map((o) => o.nombre);
  }

  ngOnInit(): void {
    this.getAula();
    this.getDocente();
    this.getFecha();
    this.getHora();
    setInterval(() => this.getHora(), 1000);
  }

  getAsitencias() {
    if (!this.selectedDocenteId || this.selectedDocenteId === 0) return;

    this.asistenciaService
      .getAsistenciaDocente(this.selectedDocenteId)
      .subscribe((data) => {
        console.log(data);
        this.asistencias = data;
      });
  }

  onChange(value: string): void {
    this.filteredOptions = this.options
      .filter((option) =>
        option.nombre.toLowerCase().includes(value.toLowerCase())
      )
      .map((option) => option.nombre);

    const seleccionado = this.options.find((o) => o.nombre === value);
    this.selectedDocenteId = seleccionado?.id;
    this.getAsitencias();
  }

  getHora(): void {
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString('es-PE', { hour12: false });
    const elemento = document.getElementById('horaActual');
    if (elemento) {
      elemento.textContent = horaFormateada;
    }
  }

  getFecha() {
    const fecha = new Date();

    const opcionesDia: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const diaSemana = fecha.toLocaleDateString('es-PE', opcionesDia);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    const fechaFormateada = `${diaSemana} ${dia}/${mes}/${anio}`;

    const elemento = document.getElementById('fechaActual');
    if (elemento) {
      elemento.textContent = fechaFormateada;
    }
  }

  getDocente() {
    this.docentecurService
      .obtenerDocentesreporteria(false, false, false)
      .subscribe((data) => {
        this.options = data.map((d) => ({
          id: d.id,
          nombre: d.c_nomdoc,
        }));
        this.filteredOptions = this.options.map((o) => o.nombre);
      });
  }

  getAula() {
    this.userService.getIp().subscribe((data) => {
      // 192.168.1.213
      // this.aulaService.getAulaIp('192.168.1.214').subscribe((data) => {
      this.aulaService.getAulaIp(data.ip).subscribe((data) => {
        this.aula = data;
      });
    });
  }

  marcarEntrada() {
    if (this.selectedDocenteId === undefined) {
      this.alertService.warning('Primero seleccionar docente');
      return;
    }

    this.asistenciaService
      .marcarEntrada(this.selectedDocenteId || 0, this.aula.id)
      .subscribe({
        next: (res: any) => {
          console.log('res => ', res);
          this.alertService.success('Entrada marcada correctamente');
          this.getAsitencias();
        },
        error: (er: HttpErrorResponse) => {
          console.log('er => ', er);
          this.alertService.error(er.error.message);
        },
      });
  }

  marcarSalida() {
    if (this.selectedDocenteId === undefined) {
      this.alertService.warning('Primero seleccionar docente');
      return;
    }

    this.asistenciaService
      .marcarSalida(this.selectedDocenteId || 0, this.aula.id)
      .subscribe({
        next: (res: any) => {
          this.alertService.success('Salida marcada correctamente');
          this.getAsitencias();
        },
        error: (er: HttpErrorResponse) => {
          this.alertService.error(er.error.message);
        },
      });
  }
}
