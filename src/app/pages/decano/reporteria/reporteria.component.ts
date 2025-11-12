import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HR_Docente } from '../../../interfaces/hr/hr_docente';
import { HR_Horario } from '../../../interfaces/hr/hr_horario';
import { DocenteService } from '../../../services/docente.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-reporteria',
  standalone: false,
  templateUrl: './reporteria.component.html',
  styleUrls: ['./reporteria.component.css'],
})
export class ReporteriaComponent implements OnInit {
  itemsPorPagina = 10;
  filtroBusqueda = '';
  docentes: HR_Docente[] = [];
  usuariosFiltrados: HR_Docente[] = [];

  listOfColumn = [
    {
      title: 'ID',
      nzWidth: '70px',
      compare: (a: HR_Docente, b: HR_Docente) => a.id - b.id,
    },
    {
      title: 'Docente',
      nzWidth: '200px',
      compare: (a: HR_Docente, b: HR_Docente) =>
        a.c_nomdoc.localeCompare(b.c_nomdoc),
    },
    {
      title: 'H. Mín',
      nzWidth: '100px',
      compare: (a: HR_Docente, b: HR_Docente) => a.h_min - b.h_min,
    },
    {
      title: 'H. Máx',
      nzWidth: '100px',
      compare: (a: HR_Docente, b: HR_Docente) => a.h_max - b.h_max,
    },
    {
      title: 'H. Académicas',
      nzWidth: '120px',
      compare: (a: HR_Docente, b: HR_Docente) =>
        this.sumarHoras(a.horarios || []) - this.sumarHoras(b.horarios || []),
    },
    {
      title: 'Tipo',
      nzWidth: '140px',
      compare: (a: HR_Docente, b: HR_Docente) => a.tipo - b.tipo,
    },
    {
      title: 'Acciones',
      nzWidth: '130px',
      compare: null,
    },
  ];

  constructor(
    private docenteService: DocenteService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
  }

  cargarDocentes() {
    this.alertService.showLoadingScreen('Cargando información de docentes...');

    this.docenteService
      .obtenerDocentesreporteria(true, true, true, '', '')
      .subscribe({
        next: (data: any[]) => {
          this.docentes = data.map((d) => ({ ...d, expanded: false }));
          this.usuariosFiltrados = [...this.docentes];
          this.alertService.close();
        },
        error: (err) => {
          console.error(err);
          this.alertService.close();
        },
      });
  }

  filtrarUsuarios() {
    const f = this.filtroBusqueda.trim().toLowerCase();
    this.usuariosFiltrados = !f
      ? [...this.docentes]
      : this.docentes.filter(
          (d) =>
            d.c_nomdoc?.toLowerCase().includes(f) ||
            d.h_min?.toString().includes(f) ||
            d.h_max?.toString().includes(f)
        );
  }

  toggleExpand(docente: HR_Docente) {
    docente.expanded = !docente.expanded;
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

  sumarHoras(horarios: HR_Horario[]): number {
    if (!horarios || horarios.length === 0) return 0;
    const sesiones = new Set<string>();
    let total = 0;
    for (const h of horarios) {
      if (!h.dia || !h.h_inicio || !h.h_fin) continue;
      const clave = `${h.dia}-${h.h_inicio}-${h.h_fin}`;
      if (!sesiones.has(clave)) {
        sesiones.add(clave);
        total += h.n_horas || 0;
      }
    }
    return total;
  }

  agruparHorariosVisual(horarios: HR_Horario[]) {
    if (!horarios || horarios.length === 0) return [];

    // Agrupa por la misma sesión: día + hora inicio + hora fin
    const mapa = new Map<string, HR_Horario[]>();
    horarios.forEach((h) => {
      const key = `${h.dia}||${h.h_inicio}||${h.h_fin}`;
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(h);
    });

    const uniq = <T>(arr: (T | null | undefined)[]) =>
      Array.from(new Set(arr.filter(Boolean) as T[]));

    return Array.from(mapa.values()).map((grupo) => {
      const base = grupo[0];

      const c_codfac = uniq(grupo.map((g) => g.curso?.plan?.c_codfac)).join(
        ', '
      );
      const c_codesp = uniq(grupo.map((g) => g.curso?.plan?.c_codesp)).join(
        ', '
      );
      const c_codcur = uniq(grupo.map((g) => g.curso?.plan?.c_codcur)).join(
        ', '
      );
      const c_nomcur = uniq(grupo.map((g) => g.curso?.plan?.c_nomcur)).join(
        ' / '
      );
      const c_grpcur = uniq(grupo.map((g) => g.curso?.turno?.c_grpcur)).join(
        ', '
      );
      const modalidad = uniq(grupo.map((g) => g.modalidad)).join(', ');
      const aula = uniq(grupo.map((g) => g.aula?.c_codaula)).join(', ');

      // Como la clave del grupo ya es el mismo bloque horario, basta 1 cadena
      const horariosTxt = `${base.dia} (${base.h_inicio} - ${base.h_fin})`;

      // Para esta agrupación (misma sesión) basta tomar n_horas de la base
      const n_horas = base?.n_horas ?? 0;

      return {
        ...base,
        c_codfac,
        c_codesp,
        c_codcur,
        c_nomcur,
        c_grpcur,
        modalidad,
        aula,
        horarios: horariosTxt,
        n_horas,
      };
    });
  }

  clickCalendarioDocente(id: number) {
    const prefix = this.router.url.split('/')[1];
    const url = `/${prefix}/calendario_docente?id=${id}`;
    window.open(url, '_blank');
  }
}
