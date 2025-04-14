import { Component, OnInit } from '@angular/core';
import { AulaService } from '../../services/aula.service';
import { AulaExtendido, AulaReporte } from '../../interfaces/Aula';
import { Location } from '@angular/common';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { format, toZonedTime } from 'date-fns-tz';


@Component({
  selector: 'app-reporteria-aula',
  standalone: false,
  templateUrl: './reporteria-aula.component.html',
  styleUrl: './reporteria-aula.component.css'
})
export class ReporteriaAulaComponent implements OnInit{
  itemsPorPagina = 10;
  paginaActual = 1;
  usuariosFiltrados: AulaExtendido[] = []; // Se inicializa correctamente
  aula: AulaExtendido[] = [];
  filtroBusqueda: string = '';

  constructor(
    private location: Location,
    private aulaService: AulaService,
    // private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarAula();
  }

  obtenerNombrePiso(piso: number): string {
    const nombres: { [key: string]: string } = {
      '-1': 'Sótano',
      '0': 'Sótano',
      '1': '1er piso',
      '2': '2do piso',
      '3': '3er piso',
      '4': '4to piso',
      '5': '5to piso',
      '6': '6to piso',
      '7': '7mo piso',
    };
    return nombres[piso.toString()] || `Piso ${piso}`;
  }  

  cargarAula() {
    this.aulaService.getAula().subscribe({
      next: (data: any[]) => {
        this.aula = data.map((aula) => ({
          ...aula,
          expanded: false
        }));
        this.usuariosFiltrados = [...this.aula];
      },
      error: (error) => {
        console.error('Error al obtener aulas:', error);
      },
    });
  }

  exportarExcel(): void {
    const zonaHoraria = 'America/Lima';
    const rows: any[] = [];
  
    this.usuariosFiltrados.forEach((aula) => {
      const horarios = aula.Horario || [];
  
      horarios.forEach((h, index) => {
        const horaInicio = h.h_inicio
          ? format(toZonedTime(new Date(h.h_inicio), zonaHoraria), 'HH:mm')
          : '';
        const horaFin = h.h_fin
          ? format(toZonedTime(new Date(h.h_fin), zonaHoraria), 'HH:mm')
          : '';
  
        rows.push({
          Aula: index === 0 ? aula.c_codaula : '',
          Piso: index === 0 ? this.obtenerNombrePiso(aula.n_piso) : '',
          Pabellón: index === 0 ? aula.pabellon : '',
          Capacidad: index === 0 ? aula.n_capacidad : '',
          Observaciones: index === 0 ? (aula.c_obs || 'Sin observaciones') : '',
          'Nro Horarios': index === 0 ? horarios.length : '',
  
          Día: h.dia,
          'Hora Inicio': horaInicio,
          'Hora Fin': horaFin,
          'Nro Horas': h.n_horas,
          Tipo: h.tipo,
          Curso: h.curso?.c_nomcur || '',
          Docente: h.Docente?.c_nomdoc || 'No asignado',
        });
      });
  
      // Si no tiene horarios, aún exportamos la info del aula
      if (horarios.length === 0) {
        rows.push({
          Aula: aula.c_codaula,
          Piso: this.obtenerNombrePiso(aula.n_piso),
          Pabellón: aula.pabellon,
          Capacidad: aula.n_capacidad,
          Observaciones: aula.c_obs || 'Sin observaciones',
          'Nro Horarios': 0,
          Día: '',
          'Hora Inicio': '',
          'Hora Fin': '',
          'Nro Horas': '',
          Tipo: '',
          Curso: '',
          Docente: '',
        });
      }
    });
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Reporte Aulas': worksheet },
      SheetNames: ['Reporte Aulas'],
    };
  
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  
    FileSaver.saveAs(blob, `reporte-aulas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }
  

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  get totalPaginas() {
    return Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
  }

  get usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cancel() {
    this.location.back();
  }

  toggleExpand(aula: AulaExtendido) {
    aula.expanded = !aula.expanded;
  }  

  filtrarUsuarios() {
    const filtro = this.filtroBusqueda.toLowerCase();
  
    const pisoTexto: Record<string, string> = {
      '-1': 'Sótano',
      '0': 'Sótano',
      '1': '1er piso',
      '2': '2do piso',
      '3': '3er piso',
      '4': '4to piso',
      '5': '5to piso',
      '6': '6to piso',
      '7': '7mo piso',
    };
  
    this.usuariosFiltrados = this.aula.filter((aula) => {
      const pisoEnTexto = pisoTexto[aula.n_piso.toString()]?.toLowerCase() || '';
  
      return (
        aula.c_codaula?.toLowerCase().includes(filtro) ||
        aula.n_piso.toString().includes(filtro) ||
        pisoEnTexto.includes(filtro) ||
        aula.pabellon?.toLowerCase().includes(filtro) ||
        aula.n_capacidad?.toString().includes(filtro) ||
        (aula.c_obs ? aula.c_obs.toLowerCase().includes(filtro) : false)
      );
    });
  }
  
  cambiarItemsPorPagina(valor: number) {
    this.itemsPorPagina = valor;
    this.paginaActual = 1; // Reinicia a la primera página
  }
  
}
