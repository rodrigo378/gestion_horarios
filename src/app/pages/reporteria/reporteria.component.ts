import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { Location } from '@angular/common';
import {
  CreateDocente,
  Docente,
  DocenteExtendido,
  HorarioAsignado,
} from '../../interfaces/Docente';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { format, toZonedTime } from 'date-fns-tz';
import { DocentecurService } from '../../services/docentecur.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reporteria',
  standalone: false,
  templateUrl: './reporteria.component.html',
  styleUrl: './reporteria.component.css',
})
export class ReporteriaComponent implements OnInit {
  itemsPorPagina = 10;
  paginaActual = 1;
  usuariosFiltrados: DocenteExtendido[] = [];
  docentes: DocenteExtendido[] = [];
  mostrarModal = false;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  nuevoDocente: CreateDocente = {
    c_dnidoc: '',
    c_codfac: '',
    nom_fac: '',
    c_nomdoc: '',
    h_min: 0,
    h_max: 0,
    tipo: 0,
  };

  filtroBusqueda: string = '';

  constructor(
    private location: Location,
    private alertService: AlertService,
    private docenteService: DocentecurService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

  cargarDocentes() {
    this.docenteService.obtenerDocentesreporteria(true, true, true).subscribe({
      next: (data: any[]) => {
        this.docentes = data.map((docente) => ({
          ...docente,
          expanded: false,
        }));
        this.usuariosFiltrados = [...this.docentes];
      },
      error: (error) => {
        console.error('Error al obtener docentes:', error);
      },
    });
  }

  crearDocente() {
    if (!this.nuevoDocente.c_nomdoc.trim()) {
      this.alertService.error('El nombre del docente es obligatorio');
      return;
    }

    this.nuevoDocente.nom_fac = this.nombreFacultad(this.nuevoDocente.c_codfac); // sincronizar

    this.docenteService.crearDocente(this.nuevoDocente).subscribe({
      next: (res) => {
        this.alertService.success('Docente creado correctamente');
        this.cargarDocentes(); // recarga lista
        // reiniciar formulario
        this.nuevoDocente = {
          c_dnidoc: '',
          c_codfac: 'E',
          nom_fac: 'INGENIERÍA Y NEGOCIOS',
          c_nomdoc: '',
          h_min: 1,
          h_max: 8,
          tipo: 0,
        };
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error al crear docente');
      },
    });
    this.mostrarModal = false;
  }

  abrirModalCrearDocente() {
    this.nuevoDocente = {
      c_dnidoc: '',
      c_codfac: 'E',
      nom_fac: 'INGENIERÍA Y NEGOCIOS',
      c_nomdoc: '',
      h_min: 1,
      h_max: 8,
      tipo: 0,
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  getHorariosPorFacultad(docente: Docente): {
    [key: string]: HorarioAsignado[];
  } {
    const agrupado: { [key: string]: HorarioAsignado[] } = {};

    if (!docente.Horario || docente.Horario.length === 0) return agrupado;

    docente.Horario.forEach((h) => {
      const codfac = h.curso?.c_codfac || 'N/A';
      if (!agrupado[codfac]) {
        agrupado[codfac] = [];
      }
      agrupado[codfac].push(h);
    });

    return agrupado;
  }

  nombreFacultad(cod: string): string {
    switch (cod) {
      case 'S':
        return 'CIENCIAS DE LA SALUD';
      case 'E':
        return 'INGENIERÍA Y NEGOCIOS';
      default:
        return 'FACULTAD DESCONOCIDA';
    }
  }

  sumarHoras(grupo: HorarioAsignado[]): number {
    return grupo.reduce((acc, h) => acc + h.n_horas, 0);
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

  toggleExpand(docente: DocenteExtendido) {
    docente.expanded = !docente.expanded;
  }

  filtrarUsuarios() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    if (!filtro) {
      this.usuariosFiltrados = [...this.docentes]; // mostrar todo si está vacío
      return;
    }

    this.usuariosFiltrados = this.docentes.filter((docente) => {
      const nombre = docente.c_nomdoc?.toLowerCase() || '';
      const categoria = docente.categoria?.toLowerCase() || '';
      const hMin = docente.h_min?.toString() || '';
      const hMax = docente.h_max?.toString() || '';
      const hTotal = docente.h_total?.toString() || '';

      return (
        nombre.includes(filtro) ||
        categoria.includes(filtro) ||
        hMin.includes(filtro) ||
        hMax.includes(filtro) ||
        hTotal.includes(filtro)
      );
    });

    this.paginaActual = 1; // Reinicia paginación
  }

  exportarExcel(): void {
    const rows: any[] = [];
    const zonaHoraria = 'America/Lima';

    this.usuariosFiltrados.forEach((docente) => {
      const horarios = docente.Horario || [];
      const asignado = horarios.length;

      horarios.forEach((h, index) => {
        const cursoPadre = h.curso?.cursosPadres?.[0];
        const tipoCursoPadre = cursoPadre
          ? cursoPadre.tipo === 0
            ? 'Transversal'
            : cursoPadre.tipo === 1
            ? 'Agrupado'
            : 'Otro'
          : '';

        const shortname = cursoPadre?.shortname || '';

        const horaInicio = h.h_inicio
          ? format(toZonedTime(new Date(h.h_inicio), zonaHoraria), 'HH:mm')
          : '';

        const horaFin = h.h_fin
          ? format(toZonedTime(new Date(h.h_fin), zonaHoraria), 'HH:mm')
          : '';

        rows.push({
          Docente: index === 0 ? docente.c_nomdoc : '',
          'H. Min': index === 0 ? docente.h_min : '',
          'H. Max': index === 0 ? docente.h_max : '',
          'H. Académicas': index === 0 ? docente.h_total : '',
          Tipo:
            index === 0
              ? docente.tipo === 0
                ? 'Tiempo Completo'
                : 'Tiempo Parcial'
              : '',
          Asignado: index === 0 ? asignado : '',
          Día: h.dia,
          'Hora Inicio': horaInicio,
          'Hora Fin': horaFin,
          'Nro Horas': h.n_horas,
          Curso: h.curso?.c_nomcur,
          Ciclo: h.curso?.n_ciclo,
          Facultad: this.nombreFacultad(h.curso?.c_codfac),
          'Tipo Curso': tipoCursoPadre,
          'Shortname Curso': shortname,
        });
      });

      // Si no tiene horarios, aún se agrega una fila básica
      if (horarios.length === 0) {
        rows.push({
          Docente: docente.c_nomdoc,
          'H. Min': docente.h_min,
          'H. Max': docente.h_max,
          'H. Académicas': docente.h_total,
          Tipo: docente.tipo === 0 ? 'Tiempo Completo' : 'Tiempo Parcial',
          Asignado: 0,
          Día: '',
          'Hora Inicio': '',
          'Hora Fin': '',
          'Nro Horas': '',
          Curso: '',
          Ciclo: '',
          Facultad: '',
          'Tipo Curso': '',
          'Shortname Curso': '',
        });
      }
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Reporte Docentes': worksheet },
      SheetNames: ['Reporte Docentes'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    FileSaver.saveAs(
      blob,
      `reporte-docentes-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    );
  }

  cambiarItemsPorPagina(valor: number) {
    this.itemsPorPagina = valor;
    this.paginaActual = 1; // Reinicia a la primera página
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.sortData();
  }

  sortData() {
    this.usuariosFiltrados.sort((a, b) => {
      const valA = (a as any)[this.sortColumn];
      const valB = (b as any)[this.sortColumn];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIconClass(column: string): string {
    if (this.sortColumn !== column) return '';

    return this.sortDirection === 'asc' ? 'rotate-180' : '';
  }

  clickCalendarioDocente(docente_id: number) {
    const currentPrefix = this.router.url.split('/')[1];
    const url = `/${currentPrefix}/calendario_docente?id=${docente_id}`;

    window.open(url, '_blank');
  }
}
