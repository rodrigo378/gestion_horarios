import { Component, OnInit } from '@angular/core';
import { ContadorResult } from '../../../interfaces/hr/hr_contador';
import { ContadorService } from '../../../services/contador.service';
import { AlertService } from '../../../services/alert.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SincronizarService } from '../../../services/sincronizar.service';

@Component({
  selector: 'app-sincronizar',
  standalone: false,
  templateUrl: './sincronizar.component.html',
  styleUrl: './sincronizar.component.css',
})
export class SincronizarComponent implements OnInit {
  contador: ContadorResult[] = [];
  contadorFiltrado: ContadorResult[] = [];
  search = '';

  selectedCourseIds = new Set<number>();

  allChecked = false;
  indeterminate = false;

  listOfColumn = [
    { title: 'courseid' },
    { title: 'Curso' },
    { title: 'Código' },
    { title: 'Especialidad' },
    { title: 'Secciones' },
    { title: 'Vacantes Totales' },
    { title: 'Matriculados' },
    { title: 'Ciclo' },
  ];

  constructor(
    private contadorService: ContadorService,
    private alertService: AlertService,
    private sincService: SincronizarService,
  ) {}

  ngOnInit(): void {
    this.getContador();
  }

  private toNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  getContador() {
    this.contadorService.getContador().subscribe((data) => {
      this.contador = data;
      this.contadorFiltrado = this.contador;
      this.updateCheckStatus();
    });
  }

  filtrar() {
    const term = (this.search ?? '').toLowerCase().trim();

    this.contadorFiltrado = this.contador.filter((item) => {
      const courseid = String(item.courseid_temp ?? '').toLowerCase();
      const curso = String(item.c_nomcur ?? '').toLowerCase();
      const codigo = String(item.c_codcur ?? '').toLowerCase();

      return (
        courseid.includes(term) || curso.includes(term) || codigo.includes(term)
      );
    });

    this.updateCheckStatus();
  }

  isSelected(courseidTemp: any): boolean {
    return this.selectedCourseIds.has(this.toNumber(courseidTemp));
  }

  toggleSelection(courseidTemp: any, checked: boolean) {
    const id = this.toNumber(courseidTemp);
    if (!id) return;

    if (checked) this.selectedCourseIds.add(id);
    else this.selectedCourseIds.delete(id);

    this.updateCheckStatus();
  }

  private getVisibleIds(): number[] {
    return this.contadorFiltrado
      .map((x) => this.toNumber(x.courseid_temp))
      .filter(Boolean);
  }

  toggleAll(checked: boolean) {
    const ids = this.getVisibleIds();

    if (checked) ids.forEach((id) => this.selectedCourseIds.add(id));
    else ids.forEach((id) => this.selectedCourseIds.delete(id));

    this.updateCheckStatus();
  }

  updateCheckStatus(): void {
    const ids = this.getVisibleIds();

    if (!ids.length) {
      this.allChecked = false;
      this.indeterminate = false;
      return;
    }

    const checkedCount = ids.filter((id) =>
      this.selectedCourseIds.has(id),
    ).length;

    this.allChecked = checkedCount === ids.length;
    this.indeterminate = checkedCount > 0 && checkedCount < ids.length;
  }

  sincronizarSeleccionados() {
    const ids = Array.from(this.selectedCourseIds);

    if (!ids.length) {
      this.alertService.error('Selecciona al menos un curso para sincronizar.');
      return;
    }

    this.alertService.showSyncing('Sincronizando cursos...');

    this.sincService.sincronizarBatch(ids).subscribe({
      next: (res) => {
        this.alertService.close(); // cierra loading
        this.alertService.syncSuccess();
        console.log('Sincronizado:', res, 'ids:', ids);
      },
      error: (err) => {
        this.alertService.close(); // cierra loading
        const msg =
          err?.error?.message ||
          err?.message ||
          'No se pudo completar la sincronización.';
        this.alertService.syncError(msg);
        console.error('Error sync:', err);
      },
    });
  }

  exportarExcel() {
    if (!this.contadorFiltrado.length) {
      this.alertService.error('No hay datos para exportar.');
      return;
    }

    const data = this.contadorFiltrado.map((item) => ({
      CourseID_SIGU: item.courseid_temp,
      Curso: item.c_nomcur,
      Codigo: item.c_codcur,
      Especialidad: item.c_codesp,
      Secciones: item.secciones,
      Vacantes_Totales: item.total_vacantes_tot,
      Matriculados: item.total_vacantes_matriculados,
      Ciclo: item.n_ciclo,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contadores');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `contadores_${new Date().getTime()}.xlsx`);
  }
  onToggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleAll(checked);
  }

  onToggleOne(courseidTemp: any, e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleSelection(courseidTemp, checked);
  }
}
