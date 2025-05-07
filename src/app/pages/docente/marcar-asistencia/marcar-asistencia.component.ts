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
  selectDocente?: any;
  asistencias: any = [];
  verificarDni: string = '';
  filteredOptions: string[] = [];
  nombreDocenteSeleccionado: string = '';
  mostrarModalVerificacion: boolean = false;
  options: { id: number; nombre: string }[] = [];

  constructor(
    private userService: UserService,
    private aulaService: AulaService,
    private alertService: AlertService,
    private asistenciaService: AsistenciaService
  ) {
    this.filteredOptions = this.options.map((o) => o.nombre);
  }

  ngOnInit(): void {
    this.getAula();
    this.getFecha();
    this.getHora();
    setInterval(() => this.getHora(), 1000);
  }

  getAsitencias() {
    if (!this.selectDocente.id || this.selectDocente.id === 0) return;

    const hoy = new Date().toISOString().split('T')[0];

    this.asistenciaService
      .getAsistenciaDocente(this.selectDocente.id, {
        filtro: 'diario',
        fecha: hoy,
      })
      .subscribe((data) => {
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
    this.selectDocente = seleccionado;
    // this.getAsitencias();

    if (this.selectDocente !== undefined) {
      this.mostrarModalVerificacion = true;
    }
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

  getAula() {
    this.userService.getIp().subscribe((data) => {
      // 192.168.1.213
      // this.aulaService.getAulaIp('192.168.1.214').subscribe((data) => {
      this.aulaService.getAulaIp(data.ip).subscribe((data) => {
        this.aula = data;
        this.getDocente();
      });
    });
  }

  getDocente() {
    const today = new Date();
    const daysOfWeek = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const currentDay = daysOfWeek[today.getDay()];

    this.aulaService
      .getDocentesAula(this.aula.id, 'Lunes')
      .subscribe((data) => {
        this.options = data.map((d) => ({
          id: d.id,
          c_dnidoc: d.c_dnidoc,
          nombre: d.c_nomdoc,
        }));
        this.filteredOptions = this.options.map((o) => o.nombre);
      });
  }

  marcarEntrada() {
    if (this.selectDocente?.id === undefined) {
      this.alertService.warning('Primero seleccionar docente');
      return;
    }

    this.asistenciaService
      .marcarEntrada(this.selectDocente.id || 0, this.aula.id)
      .subscribe({
        next: (res: any) => {
          this.alertService.success('Entrada marcada correctamente');
          this.getAsitencias();
        },
        error: (er: HttpErrorResponse) => {
          this.alertService.error(er.error.message);
        },
      });
  }

  marcarSalida() {
    if (this.selectDocente?.id === undefined) {
      this.alertService.warning('Primero seleccionar docente');
      return;
    }

    this.asistenciaService
      .marcarSalida(this.selectDocente.id || 0, this.aula.id)
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

  clickVerificarDni() {
    if (this.verificarDni !== this.selectDocente.c_dnidoc) {
      this.alertService.error('DNI Incorrecto');
      return;
    }
    this.mostrarModalVerificacion = false;

    this.getAsitencias();
  }

  clickCancelar() {
    this.mostrarModalVerificacion = false;
    this.verificarDni = '';
    this.inputValue = '';
    this.selectDocente = undefined;
  }
}
