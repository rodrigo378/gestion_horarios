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

  selectedFacultad: string = '';
  selectedEspecialidad: string = '';
  selectedCiclo: string = '';

  facultades = [
    { label: 'Todas', value: '' },
    { label: 'Ciencias de la Salud (S)', value: 'S' },
    { label: 'Ingeniería y Negocios (E)', value: 'E' },
  ];

  ciclos = Array.from({ length: 10 }, (_, i) => String(i + 1));

  especialidades: { nomesp: string; codesp: string; codfac: string }[] = [
    {
      nomesp: 'ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
      codesp: 'E1',
      codfac: 'E',
    },
    { nomesp: 'ADMINISTRACIÓN Y MARKETING', codesp: 'E2', codfac: 'E' },
    { nomesp: 'CONTABILIDAD Y FINANZAS', codesp: 'E3', codfac: 'E' },
    {
      nomesp: 'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES',
      codesp: 'E4',
      codfac: 'E',
    },
    { nomesp: 'DERECHO', codesp: 'E9', codfac: 'E' },

    { nomesp: 'INGENIERÍA INDUSTRIAL', codesp: 'E5', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE IA', codesp: 'E6', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },

    { nomesp: 'ENFERMERÍA', codesp: 'S1', codfac: 'S' },
    { nomesp: 'FARMACIA Y BIOQUÍMICA', codesp: 'S2', codfac: 'S' },
    { nomesp: 'NUTRICIÓN Y DIETÉTICA', codesp: 'S3', codfac: 'S' },
    { nomesp: 'PSICOLOGÍA', codesp: 'S4', codfac: 'S' },
    { nomesp: 'TM TERAPIA FÍSICA Y REHAB', codesp: 'S5', codfac: 'S' },
    { nomesp: 'TM LAB. CLÍNICO Y ANAT. PAT', codesp: 'S6', codfac: 'S' },
    { nomesp: 'MEDICINA', codesp: 'S7', codfac: 'S' },
  ];

  get especialidadesFiltradas() {
    const fac = this.selectedFacultad;
    const list = fac
      ? this.especialidades.filter((e) => e.codfac === fac)
      : this.especialidades;

    const seen = new Set<string>();
    return list.filter((e) => {
      const k = `${e.codfac}-${e.codesp}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

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
      this.aplicarFiltros();
    });
  }

  filtrar() {
    this.aplicarFiltros();
  }

  onFacultadChange() {
    this.selectedEspecialidad = '';
    this.aplicarFiltros();
  }

  onEspecialidadChange() {
    this.aplicarFiltros();
  }

  onCicloChange() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const term = (this.search ?? '').toLowerCase().trim();

    this.contadorFiltrado = this.contador.filter((item) => {
      const courseid = String(item.courseid_temp ?? '').toLowerCase();
      const curso = String(item.c_nomcur ?? '').toLowerCase();
      const codigo = String(item.c_codcur ?? '').toLowerCase();

      const pasaTexto =
        !term ||
        courseid.includes(term) ||
        curso.includes(term) ||
        codigo.includes(term);

      const facRaw = String(item.c_codfac ?? '').trim();
      const espRaw = String(item.c_codesp ?? '').trim();
      const cicloRaw = String(item.n_ciclo ?? '').trim();

      // soporta valores tipo: "S1,S2,S3"  o  "S1 | S2"  o  "S1;S2"
      const facList = facRaw
        .split(/[,\|;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const espList = espRaw
        .split(/[,\|;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const cicloList = cicloRaw
        .split(/[,\|;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const pasaFac =
        !this.selectedFacultad || facList.includes(this.selectedFacultad);
      const pasaEsp =
        !this.selectedEspecialidad ||
        espList.includes(this.selectedEspecialidad);
      const pasaCiclo =
        !this.selectedCiclo || cicloList.includes(this.selectedCiclo);

      return pasaTexto && pasaFac && pasaEsp && pasaCiclo;
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
      .map((x) => this.toNumber((x as any).courseid_temp))
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

  onToggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleAll(checked);
  }

  onToggleOne(courseidTemp: any, e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleSelection(courseidTemp, checked);
  }

  sincronizarSeleccionados() {
    const ids = Array.from(this.selectedCourseIds);

    if (!ids.length) {
      this.alertService.error('Selecciona al menos un curso para sincronizar.');
      return;
    }

    this.alertService.showSyncing('Sincronizando cursos...');

    this.sincService.sincronizarBatch(ids).subscribe(
      (res: any) => {
        this.alertService.close();

        const arr = Array.isArray(res) ? res : [];

        const exitos = arr.filter((x) => x?.ok === true && x?.data);
        const fallos = arr.filter((x) => x?.ok === false);

        const totals = exitos.reduce(
          (acc, x) => {
            const d = x.data ?? {};
            acc.alumnosMatriculados += Number(d.nuevo ?? 0);
            acc.alumnosBorrados += Number(d.borrar ?? 0);
            acc.docentesMatriculados += Number(d.nuevoDocentes ?? 0);
            acc.docentesBorrados += Number(d.borrarDocentes ?? 0);
            return acc;
          },
          {
            alumnosMatriculados: 0,
            alumnosBorrados: 0,
            docentesMatriculados: 0,
            docentesBorrados: 0,
          },
        );

        const fallosHtml =
          fallos.length > 0
            ? `
          <div style="text-align:left;margin-top:10px;">
            <b>Cursos con error (${fallos.length})</b>
            <ul style="margin:6px 0 0 18px;">
              ${fallos
                .map(
                  (f) =>
                    `<li><b>${f.courseid}</b>: ${String(
                      f.error ?? 'Error desconocido',
                    )}</li>`,
                )
                .join('')}
            </ul>
          </div>
        `
            : `<div style="margin-top:10px;"><b>Sin errores ✅</b></div>`;

        const html = `
      <div style="text-align:left;">
        <div><b>Alumnos</b></div>
        <div>Matriculados: <b>${totals.alumnosMatriculados}</b></div>
        <div>Borrados: <b>${totals.alumnosBorrados}</b></div>

        <div style="margin-top:10px;"><b>Docentes</b></div>
        <div>Matriculados: <b>${totals.docentesMatriculados}</b></div>
        <div>Borrados: <b>${totals.docentesBorrados}</b></div>

        ${fallosHtml}
      </div>
    `;

        this.alertService.syncResults(html);
        console.log('Sincronizado:', res, 'ids:', ids);
      },
      (err) => {
        this.alertService.close();
        const msg =
          err?.error?.message ||
          err?.message ||
          'No se pudo completar la sincronización.';
        this.alertService.syncError(msg);
        console.error('Error sync:', err);
      },
    );
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
      Facultad: item.c_codfac,
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
}
