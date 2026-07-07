import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DocenteService } from '../../../services/docente.service';
import { AlertService } from '../../../services/alert.service';
import { HR_Docente } from '../../../interfaces/hr/hr_docente';

interface FilaEdicion {
  edit: boolean;
  guardando: boolean;
  h_min: number;
  h_max: number;
}

@Component({
  selector: 'app-horas-docente',
  standalone: false,
  templateUrl: './horas-docente.component.html',
  styleUrl: './horas-docente.component.css',
})
export class HorasDocenteComponent implements OnInit {
  loading = false;

  data: HR_Docente[] = [];
  view: HR_Docente[] = [];

  search = '';

  // estado de edición por id de docente
  editCache: { [id: number]: FilaEdicion } = {};

  constructor(
    private docenteService: DocenteService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.docenteService.getDocentes().subscribe({
      next: (res) => {
        this.data = Array.isArray(res) ? res : [];
        this.actualizarCache();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alertService.error('No se pudieron cargar los docentes.');
      },
    });
  }

  private actualizarCache(): void {
    this.editCache = {};
    this.data.forEach((d) => {
      this.editCache[d.id] = {
        edit: false,
        guardando: false,
        h_min: d.h_min,
        h_max: d.h_max,
      };
    });
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();
    this.view = this.data.filter((d) => {
      if (!q) return true;
      return (
        (d.c_nomdoc || '').toLowerCase().includes(q) ||
        (d.c_dnidoc || '').toLowerCase().includes(q)
      );
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  iniciarEdicion(d: HR_Docente): void {
    this.editCache[d.id] = {
      edit: true,
      guardando: false,
      h_min: d.h_min,
      h_max: d.h_max,
    };
  }

  cancelarEdicion(d: HR_Docente): void {
    this.editCache[d.id] = {
      edit: false,
      guardando: false,
      h_min: d.h_min,
      h_max: d.h_max,
    };
  }

  guardar(d: HR_Docente): void {
    const cache = this.editCache[d.id];
    if (!cache) return;

    const h_min = Number(cache.h_min);
    const h_max = Number(cache.h_max);

    if (
      !Number.isInteger(h_min) ||
      !Number.isInteger(h_max) ||
      h_min < 0 ||
      h_max < 0
    ) {
      this.alertService.warn(
        'Valores inválidos',
        'Las horas deben ser números enteros mayores o iguales a 0.',
      );
      return;
    }

    if (h_min > h_max) {
      this.alertService.warn(
        'Rango inválido',
        'El mínimo de horas no puede ser mayor que el máximo.',
      );
      return;
    }

    cache.guardando = true;
    this.docenteService.updateHorasDocente(d.id, { h_min, h_max }).subscribe({
      next: (actualizado) => {
        // refleja el docente devuelto por el backend
        Object.assign(d, actualizado);
        this.editCache[d.id] = {
          edit: false,
          guardando: false,
          h_min: d.h_min,
          h_max: d.h_max,
        };
        this.alertService.toastSuccess('Horas actualizadas');
      },
      error: (err: HttpErrorResponse) => {
        cache.guardando = false;
        const message =
          err.error?.message || 'No se pudieron actualizar las horas.';
        this.alertService.saveError(message);
      },
    });
  }
}
