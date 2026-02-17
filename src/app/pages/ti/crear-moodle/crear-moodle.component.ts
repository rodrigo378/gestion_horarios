// src/app/pages/ti/crear-moodle/crear-moodle.component.ts
import { Component, OnInit } from '@angular/core';
import { finalize, map } from 'rxjs/operators';

import { ContadorService } from '../../../services/contador.service';
import { AlertService } from '../../../services/alert.service';
import { ContadorResult } from '../../../interfaces/hr/hr_contador';
import {
  CreateCursoDto,
  MoodleCursoTemplate,
  SincronizarService,
} from '../../../services/sincronizar.service';
import { Observable } from 'rxjs';

type Especialidad = { codfac: string; codesp: string; nomesp: string };

type PlantillaOption = { id: number; label: string };

type ItemUI = ContadorResult & {
  __id: number; // courseid_temp como number
  __isNeg: boolean; // "aplicable" para selección (negativos o positivos en modo prueba)
};

@Component({
  selector: 'app-crear-moodle',
  standalone: false,
  templateUrl: './crear-moodle.component.html',
  styleUrl: './crear-moodle.component.css',
})
export class CrearMoodleComponent implements OnInit {
  step: 1 | 2 = 1;

  contador: ItemUI[] = [];
  contadorFiltrado: ItemUI[] = [];
  search = '';

  // ✅ modo prueba: permite seleccionar positivos como si fueran negativos
  permitirPositivos = true;

  // Periodo (n_codper)
  periodos = [
    { label: '20261 (Activo)', value: 20261 },
    { label: '20252', value: 20252 },
    { label: '20251', value: 20251 },
  ];
  selectedPeriodo: number = 20261;

  // filtros
  selectedFacultad: string = '';
  selectedEspecialidad: string = '';
  selectedCiclo: string = '';
  showOnlyNegativos = true;

  facultades = [
    { label: 'Todas', value: '' },
    { label: 'DIPLOMADOS (D)', value: 'D' },
    { label: 'INGENIERIA Y NEGOCIOS (E)', value: 'E' },
    { label: 'SEGUNDA ESPECIALIDAD FARMACIA Y BIOQUÍMICA (F)', value: 'F' },
    { label: 'POSGRADO (G)', value: 'G' },
    { label: 'SEGUNDA ESPECIALIDAD PSICOLOGÍA (L)', value: 'L' },
    { label: 'SEGUNDA ESPECIALIDAD ENFERMERÍA (P)', value: 'P' },
    { label: 'CIENCIAS DE LA SALUD (S)', value: 'S' },
    { label: 'TALLERES EXTRACURRICULARES (T)', value: 'T' },
  ];

  ciclos = Array.from({ length: 10 }, (_, i) => String(i + 1));

  // pega tu lista completa si quieres
  especialidades: Especialidad[] = [
    { codfac: 'S', codesp: 'S1', nomesp: 'ENFERMERÍA' },
    { codfac: 'S', codesp: 'S2', nomesp: 'FARMACIA Y BIOQUÍMICA' },
    { codfac: 'S', codesp: 'S4', nomesp: 'PSICOLOGÍA' },
  ];

  get especialidadesFiltradas(): Especialidad[] {
    const fac = (this.selectedFacultad ?? '').trim();
    if (!fac) return [];
    return this.especialidades.filter((e) => e.codfac === fac);
  }

  // selección
  selectedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  // plantillas moodle (desde categoría de plantillas)
  readonly categoryPlantillas = 1063; // ✅ de donde salen las plantillas
  readonly categoryDestino = 1083; // ✅ estático para CreateCursoDto.categoryid

  isLoadingPlantillas = false;
  plantillasError = '';

  plantillas: PlantillaOption[] = [];
  plantillaDefault: number | null = null;
  plantillaPorId = new Map<number, number>(); // courseid_seleccionado -> origin_courseid

  // estado por item
  statusPorId = new Map<number, 'pendiente' | 'creando' | 'creado' | 'error'>();

  constructor(
    private contadorService: ContadorService,
    private alertService: AlertService,
    private moodleCursosService: SincronizarService,
  ) {}

  ngOnInit(): void {
    this.getContador();
    this.cargarPlantillas();
  }

  private toNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  // ✅ regla única de selección: negativos siempre; positivos solo en modo prueba
  private isSelectableId(id: number): boolean {
    return id < 0 || this.permitirPositivos === true;
  }

  private resetWizardState(full = true) {
    this.selectedIds.clear();
    this.plantillaPorId.clear();
    this.statusPorId.clear();
    this.allChecked = false;
    this.indeterminate = false;
    if (full) this.plantillaDefault = null;
  }

  // ====== plantillas ======
  cargarPlantillas() {
    this.isLoadingPlantillas = true;
    this.plantillasError = '';

    (
      this.moodleCursosService.getCursoByCagoria(
        this.categoryPlantillas,
      ) as Observable<any>
    )
      .pipe(
        map((res: any) => {
          // Soporta: res = []  o  res = { data: [] }
          const raw = res?.data ?? res;
          return Array.isArray(raw) ? (raw as MoodleCursoTemplate[]) : [];
        }),
        finalize(() => (this.isLoadingPlantillas = false)),
      )
      .subscribe({
        next: (arr: MoodleCursoTemplate[]) => {
          this.plantillas = arr
            .filter((x) => this.toNumber(x?.id) > 0)
            .map((x) => ({
              id: this.toNumber(x.id),
              label: String(
                x.displayname || x.fullname || x.shortname || `Curso ${x.id}`,
              ),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

          if (!this.plantillas.length) {
            this.plantillasError = `No se encontraron plantillas en la categoría ${this.categoryPlantillas}.`;
          }
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            err?.message ||
            `No se pudo cargar plantillas de la categoría ${this.categoryPlantillas}.`;
          this.plantillasError = msg;
          this.plantillas = [];
        },
      });
  }

  // ====== data ======
  getContador() {
    this.step = 1;
    this.resetWizardState(false);

    this.contadorService.getContador(this.selectedPeriodo).subscribe((data) => {
      const arr = (data ?? []).map((x: any) => {
        const id = this.toNumber(x?.courseid_temp);
        return {
          ...(x as ContadorResult),
          __id: id,
          __isNeg: this.isSelectableId(id),
        } as ItemUI;
      });

      this.contador = arr;
      this.aplicarFiltros();
    });
  }

  onPeriodoChange() {
    this.getContador();
  }

  // ✅ cuando activas/desactivas modo prueba
  onTogglePermitirPositivos() {
    // 1) recalcular "aplicable"
    this.contador = (this.contador ?? []).map((x) => ({
      ...x,
      __isNeg: this.isSelectableId(x.__id),
    }));

    // 2) si apagaste el modo prueba, limpia positivos seleccionados
    if (!this.permitirPositivos) {
      const toRemove = Array.from(this.selectedIds).filter((id) => id >= 0);
      if (toRemove.length) {
        toRemove.forEach((id) => {
          this.selectedIds.delete(id);
          this.plantillaPorId.delete(id);
          this.statusPorId.delete(id);
        });
      }
      // si estabas en step 2 y te quedaste sin seleccionados, vuelve
      if (this.step === 2) {
        const remain = Array.from(this.selectedIds).filter((id) =>
          this.isSelectableId(id),
        );
        if (!remain.length) this.step = 1;
      }
    }

    this.aplicarFiltros();
  }

  // ====== filtros ======
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

  onToggleSoloNegativos() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const term = (this.search ?? '').toLowerCase().trim();

    this.contadorFiltrado = (this.contador ?? []).filter((item) => {
      // ✅ “Solo negativos” en realidad significa “solo aplicables”
      if (this.showOnlyNegativos && !this.isSelectableId(item.__id))
        return false;

      const courseid = String((item as any).courseid_temp ?? '').toLowerCase();
      const curso = String((item as any).c_nomcur ?? '').toLowerCase();
      const codigo = String((item as any).c_codcur ?? '').toLowerCase();

      const pasaTexto =
        !term ||
        courseid.includes(term) ||
        curso.includes(term) ||
        codigo.includes(term);

      const facRaw = String((item as any).c_codfac ?? '').trim();
      const espRaw = String((item as any).c_codesp ?? '').trim();
      const cicloRaw = String((item as any).n_ciclo ?? '').trim();

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

  // ====== selección ======
  private getVisibleSelectableIds(): number[] {
    return (this.contadorFiltrado ?? [])
      .map((x) => x.__id)
      .filter((id) => this.isSelectableId(id));
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  onToggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleAllVisible(checked);
  }

  toggleAllVisible(checked: boolean) {
    const ids = this.getVisibleSelectableIds();
    if (checked) ids.forEach((id) => this.selectedIds.add(id));
    else ids.forEach((id) => this.selectedIds.delete(id));
    this.updateCheckStatus();
  }

  onToggleOne(id: number, e: Event) {
    const checked = (e.target as HTMLInputElement)?.checked ?? false;
    this.toggleOne(id, checked);
  }

  toggleOne(id: number, checked: boolean) {
    if (!this.isSelectableId(id)) return;
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
    this.updateCheckStatus();
  }

  updateCheckStatus() {
    const ids = this.getVisibleSelectableIds();

    if (!ids.length) {
      this.allChecked = false;
      this.indeterminate = false;
      return;
    }

    const checkedCount = ids.filter((id) => this.selectedIds.has(id)).length;
    this.allChecked = checkedCount === ids.length;
    this.indeterminate = checkedCount > 0 && checkedCount < ids.length;
  }

  // ====== wizard nav ======
  goStep2() {
    const ids = Array.from(this.selectedIds).filter((x) =>
      this.isSelectableId(x),
    );
    if (!ids.length) {
      this.alertService.error('Selecciona al menos un courseid aplicable.');
      return;
    }
    if (this.isLoadingPlantillas) {
      this.alertService.error(
        'Se están cargando las plantillas. Intenta nuevamente en unos segundos.',
      );
      return;
    }
    if (!this.plantillas.length) {
      this.alertService.error(
        `No hay plantillas disponibles (categoría ${this.categoryPlantillas}).`,
      );
      return;
    }

    ids.forEach((id) => {
      if (!this.statusPorId.has(id)) this.statusPorId.set(id, 'pendiente');
    });

    this.step = 2;
  }

  backStep1() {
    this.step = 1;
  }

  // ====== paso 2 helpers ======
  get selectedItems(): ItemUI[] {
    const ids = this.selectedIds;
    return (this.contador ?? []).filter(
      (x) => this.isSelectableId(x.__id) && ids.has(x.__id),
    );
  }

  get readyCount(): number {
    return this.selectedItems.filter((x) => !!this.plantillaPorId.get(x.__id))
      .length;
  }

  plantillaDe(courseId: number): number | null {
    return this.plantillaPorId.get(courseId) ?? null;
  }

  setPlantilla(courseId: number, originCourseId: number | null) {
    if (!this.isSelectableId(courseId)) return;

    if (!originCourseId) this.plantillaPorId.delete(courseId);
    else this.plantillaPorId.set(courseId, originCourseId);

    if (this.statusPorId.get(courseId) === 'error') {
      this.statusPorId.set(courseId, 'pendiente');
    }
  }

  aplicarPlantillaDefault() {
    if (!this.plantillaDefault) {
      this.alertService.error('Selecciona una plantilla por defecto.');
      return;
    }
    const ids = Array.from(this.selectedIds).filter((x) =>
      this.isSelectableId(x),
    );
    ids.forEach((courseId) =>
      this.plantillaPorId.set(courseId, this.plantillaDefault!),
    );
    this.alertService.success(
      'Finalizado',
      'Plantilla aplicada a seleccionados.',
    );
  }

  // ====== badges ======
  labelEstado(id: number): string {
    const s = this.statusPorId.get(id) ?? 'pendiente';
    if (s === 'pendiente') return 'Pendiente';
    if (s === 'creando') return 'Creando...';
    if (s === 'creado') return 'Creado';
    return 'Error';
  }

  badgeClass(id: number): string {
    const s = this.statusPorId.get(id) ?? 'pendiente';
    if (s === 'pendiente') return 'bg-slate-200 text-slate-700';
    if (s === 'creando') return 'bg-blue-100 text-blue-700';
    if (s === 'creado') return 'bg-green-100 text-green-700';
    return 'bg-rose-100 text-rose-700';
  }

  // ====== generar ======
  generar() {
    const ids = Array.from(this.selectedIds).filter((x) =>
      this.isSelectableId(x),
    );

    if (!ids.length) {
      this.alertService.error('No hay seleccionados aplicables.');
      return;
    }

    const faltantes = ids.filter(
      (courseId) => !this.plantillaPorId.get(courseId),
    );
    if (faltantes.length) {
      faltantes.forEach((id) => this.statusPorId.set(id, 'error'));
      this.alertService.error(
        `Faltan plantillas en ${faltantes.length} seleccionados.`,
      );
      return;
    }

    const dtos: CreateCursoDto[] = ids.map((courseId) => ({
      origin_courseid: this.plantillaPorId.get(courseId)!,
      negative_courseid: courseId, // ✅ backend seguirá recibiendo el mismo campo
      categoryid: this.categoryDestino,
    }));

    ids.forEach((id) => this.statusPorId.set(id, 'creando'));
    this.alertService.showSyncing('Creando cursos en Moodle...');

    this.moodleCursosService.createMassive(dtos).subscribe({
      next: (res: any) => {
        this.alertService.close();

        if (Array.isArray(res)) {
          res.forEach((r: any) => {
            const id = this.toNumber(
              r?.negative_courseid ?? r?.courseid ?? r?.id,
            );
            const ok = r?.ok === true || r?.success === true;
            if (id) this.statusPorId.set(id, ok ? 'creado' : 'error');
          });
        } else {
          ids.forEach((id) => this.statusPorId.set(id, 'creado'));
        }

        this.alertService.success('Finalizado', 'Proceso finalizado.');
        console.log('create-massive response:', res, 'dtos:', dtos);
      },
      error: (err) => {
        this.alertService.close();
        ids.forEach((id) => this.statusPorId.set(id, 'error'));
        const msg =
          err?.error?.message ||
          err?.message ||
          'Error al crear cursos en Moodle.';
        this.alertService.error(msg);
        console.error('create-massive error:', err, 'dtos:', dtos);
      },
    });
  }
}
