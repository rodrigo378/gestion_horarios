// docente.component.ts
import { Component, OnInit } from '@angular/core';
import { SincronizarService } from '../../../services/sincronizar.service';

type Estado = 'BIEN' | 'MAL' | 'SIN_MARCACIONES';

type DocenteInfo = {
  c_dni: string;
  c_nombres: string;
  c_apepat: string;
  c_apemat: string;
};

type ComparacionDocente = {
  docente: DocenteInfo;
  estado: Estado;
  resumen: {
    sesionesHorario: number;
    marcaciones: number;
    iguales: number;
    noDeberianEstar: number;
    faltanEnMarcacion: number;
  };
  detalle: {
    iguales: any[];
    noDeberianEstar: any[];
    faltanEnMarcacion: any[];
  };
};

@Component({
  selector: 'app-docente',
  standalone: false,
  templateUrl: './docente.component.html',
  styleUrl: './docente.component.css',
})
export class DocenteComponent implements OnInit {
  loading = false;

  data: ComparacionDocente[] = [];
  view: ComparacionDocente[] = [];

  // filtros
  search = '';
  estado: 'TODOS' | Estado = 'TODOS';

  // modal
  isModalVisible = false;
  selected: ComparacionDocente | null = null;

  constructor(private sinc: SincronizarService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.sinc.comparacionDocentes().subscribe({
      next: (res: any) => {
        this.data = Array.isArray(res) ? (res as ComparacionDocente[]) : [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();

    this.view = this.data.filter((x) => {
      const nombre =
        `${x.docente.c_nombres} ${x.docente.c_apepat} ${x.docente.c_apemat}`.toLowerCase();
      const dni = x.docente.c_dni.toLowerCase();
      const matchText = !q || nombre.includes(q) || dni.includes(q);

      const matchEstado = this.estado === 'TODOS' || x.estado === this.estado;

      return matchText && matchEstado;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onEstadoChange(): void {
    this.applyFilters();
  }

  openDetail(row: ComparacionDocente): void {
    this.selected = row;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selected = null;
  }

  nombreCompleto(d: DocenteInfo): string {
    return `${d.c_nombres} ${d.c_apepat} ${d.c_apemat}`.trim();
  }
}
