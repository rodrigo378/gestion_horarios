import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { format, toZonedTime } from 'date-fns-tz';
import { Router } from '@angular/router';
import { HR_Docente } from '../../../interfaces/hr/hr_docente';
import { HR_Horario } from '../../../interfaces/hr/hr_horario';

import { AlertService } from '../../../services_2/alert.service';
import { DocenteService } from '../../../services/docente.service';

@Component({
  selector: 'app-reporteria',
  standalone: false,
  templateUrl: './reporteria.component.html',
  styleUrl: './reporteria.component.css',
})
export class ReporteriaComponent implements OnInit {
  itemsPorPagina = 10;
  paginaActual = 1;
  usuariosFiltrados: HR_Docente[] = [];
  docentes: HR_Docente[] = [];
  mostrarModal = false;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  nuevoDocente: Partial<HR_Docente> = {
    c_dnidoc: '',
    c_codfac: '',
    nom_fac: '',
    c_nomdoc: '',
    h_min: 0,
    h_max: 0,
    tipo: 0,
  };
  selectFacultad: string = '';
  selectEspecialidad: string = '';

  filtroBusqueda: string = '';

  constructor(
    private location: Location,
    private alertService: AlertService,
    private docenteService: DocenteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

  cargarDocentes() {
    this.docenteService
      .obtenerDocentesreporteria(
        true,
        true,
        true,
        this.selectFacultad,
        this.selectEspecialidad
      )
      .subscribe({
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
    if (!this.nuevoDocente.c_nomdoc!.trim()) {
      this.alertService.error('El nombre del docente es obligatorio');
      return;
    }

    this.nuevoDocente.nom_fac = this.nombreFacultad(
      this.nuevoDocente.c_codfac!
    );

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

  getHorariosPorFacultad(docente: HR_Docente): {
    [key: string]: HR_Docente[];
  } {
    const agrupado: { [key: string]: HR_Docente[] } = {};

    if (!docente.horarios || docente.horarios.length === 0) return agrupado;

    docente.horarios.forEach((h) => {
      // const codfac = h.curso?.c_codfac || 'N/A';
      const codfac = 'N/A';
      if (!agrupado[codfac]) {
        agrupado[codfac] = [];
      }
      agrupado[codfac].push({ ...(h as any) });
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

  sumarHoras(grupo: HR_Horario[]): number {
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

  toggleExpand(docente: HR_Docente) {
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
      // const categoria = docente.categoria?.toLowerCase() || '';
      const hMin = docente.h_min?.toString() || '';
      const hMax = docente.h_max?.toString() || '';
      const hTotal = docente.h_total?.toString() || '';

      return (
        nombre.includes(filtro) ||
        // categoria.includes(filtro) ||
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
      const horarios = docente.horarios || [];
      const asignado = horarios.length;

      horarios.forEach((h, index) => {
        const cursoPadre = h.curso?.grupos_padre?.[0];
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

        const cursosUnicos = new Set(
          horarios.map((h) => h.curso?.plan?.c_codcur)
        ).size;
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
          'Horarios Asignaciones': index === 0 ? asignado : '',
          'Cursos Asignados': index === 0 ? cursosUnicos : '',
          Día: h.dia,
          'Hora Inicio': horaInicio,
          'Hora Fin': horaFin,
          'Nro Horas': h.n_horas,
          Curso: h.curso?.plan?.c_nomcur || 'error_1',
          Ciclo: h.curso?.plan?.n_ciclo || 'error_2',
          Facultad: this.nombreFacultad(h.curso?.plan?.c_codfac || 'error_3'),
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
    this.paginaActual = 1;
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

  aplicarFiltros() {
    this.cargarDocentes();
  }
}
