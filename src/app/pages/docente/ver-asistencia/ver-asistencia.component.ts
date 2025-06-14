import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '../../../services/alert.service';
import { AsistenciaService } from '../../../services/asistencia.service';
import { DocenteService } from '../../../services/docente.service';

@Component({
  selector: 'app-ver-asistencia',
  standalone: false,
  templateUrl: './ver-asistencia.component.html',
  styleUrl: './ver-asistencia.component.css',
})
export class VerAsistenciaComponent implements OnInit {
  @ViewChild('inputDocente') inputDocente!: ElementRef;
  @ViewChild('inputVerificarDni') inputVerificarDni!: ElementRef;

  filtroSeleccionado: string = 'diario';

  fechaDiaria: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  mesSeleccionado: string = '';

  asistencias: any[] = [];

  asistenciasFiltradas: any[] = [];

  options: { id: number; nombre: string }[] = [];
  filteredOptions: string[] = [];
  inputValue?: string;
  selectDocente?: any;
  mostrarModalVerificacion: boolean = false;
  verificarDni: string = '';

  constructor(
    private alertService: AlertService,
    private docentecurService: DocenteService,
    private asistenciaService: AsistenciaService
  ) {}

  ngOnInit(): void {
    this.getDocente();
  }

  getDocente() {
    this.docentecurService
      .obtenerDocentesreporteria(false, false, false)
      .subscribe((data) => {
        this.options = data.map((d) => ({
          id: d.id,
          c_dnidoc: d.c_dnidoc,
          nombre: d.c_nomdoc,
        }));
        this.filteredOptions = this.options.map((o) => o.nombre);
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

    if (this.selectDocente !== undefined) {
      this.mostrarModalVerificacion = true;

      // Esperar a que el modal se renderice y enfocar
      setTimeout(() => {
        this.inputVerificarDni?.nativeElement?.focus();
      }, 0);
    }
  }

  clickVerificarDni() {
    if (this.verificarDni !== this.selectDocente.c_dnidoc) {
      this.alertService.error('DNI Incorrecto');
      return;
    }
    this.mostrarModalVerificacion = false;
    // this.getAsitencias();
  }

  clickCancelar() {
    this.mostrarModalVerificacion = false;
    this.verificarDni = '';
    this.inputValue = '';
    this.selectDocente = undefined;
  }

  clickBuscar() {
    if (this.selectDocente?.id === undefined) {
      this.alertService.warning('Primero seleccionar docente');
      return;
    }

    let option = {};
    switch (this.filtroSeleccionado) {
      case 'diario':
        // const hoy = new Date().toISOString().split('T')[0];
        option = {
          filtro: this.filtroSeleccionado,
          fecha: this.fechaDiaria,
        };
        break;
      case 'mensual':
        option = {
          filtro: this.filtroSeleccionado,
          mes: this.mesSeleccionado,
        };
        break;
      case 'rango':
        option = {
          filtro: this.filtroSeleccionado,
          desde: this.fechaInicio,
          hasta: this.fechaFin,
        };
        break;
    }

    this.asistenciaService
      .getAsistenciaDocente(this.selectDocente.id, option)
      .subscribe((data) => {
        if (data.length === 0) this.alertService.warning('No tiene asistencia');
        this.asistencias = data;
      });
  }
}
