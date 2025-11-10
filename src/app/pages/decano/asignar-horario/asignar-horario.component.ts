import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../../services/turno.service';
import { HorarioService } from '../../../services/horario.service';
import { HR_Turno } from '../../../interfaces/hr/hr_turno';
import { HR_Curso } from '../../../interfaces/hr/hr_curso';

import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';

import { AlertService } from '../../../services/alert.service';
import { HR_Plan_Estudio_Curso } from '../../../interfaces/hr/hr_plan_estudio_curso';
import { HttpErrorResponse } from '@angular/common/http';
import { DocenteService } from '../../../services/docente.service';
import { AulaService } from '../../../services/aula.service';
import { HR_Aula } from '../../../interfaces/hr/hr_aula';
import 'tippy.js/dist/tippy.css';

type FilaCursoPlan = HR_Plan_Estudio_Curso & { cursoGenerado: HR_Curso | null };

type TipoCurso = 'teoria' | 'practica';

interface CursoCard {
  id: number;
  curso_id: number;
  c_codcur: string;
  c_nomcur: string;
  n_ciclo: number;
  tipo: TipoCurso;
  horas: number;
  horasTotales: number;
  horasRestantes: number;
  h_umaPlus: number;
  c_nommod: string;
  c_nom_cur_area: string;
  c_codcur_equ?: string;
  c_nomcur_equ?: string;
  n_codper: number;
  grupos_hijos: any;
}

@Component({
  selector: 'app-asignar-horario',
  standalone: false,
  templateUrl: './asignar-horario.component.html',
  styleUrl: './asignar-horario.component.css',
})
export class AsignarHorarioComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('externalEvents') externalEventsRef!: ElementRef<HTMLDivElement>;
  @ViewChild('selModalidad') selModalidadRef!: ElementRef<HTMLSelectElement>;

  private lastDropRevert: (() => void) | null = null;
  private estadoAnteriorEvento: any = null;

  genVisible = false;
  genLoading = false;
  genList: FilaCursoPlan[] = [];
  genVacantes = 20;

  turnoSeleccionado: 'C' | 'M' | 'N' = 'C';
  private modalAnchorWeekStart: Date | null = null;

  turno_id!: number;
  guardandoUno = false;

  turno!: HR_Turno;
  aulas: HR_Aula[] = [];

  boolTransversal: boolean = false;

  cursos!: HR_Curso[];
  cursosPlan2023: CursoCard[] = [];
  cursosPlan2025: CursoCard[] = [];
  count2023 = 0;
  count2025 = 0;

  modalHorasActivo = false;
  eventoSeleccionado: any = null;
  cursoSeleccionado: any = null;
  modalidadSeleccionada: string | null = null;

  diaSeleccionado: string = 'Lunes';
  horaInicio: string = '07:00';
  horasAsignadas: number = 1;

  aulaSeleccionada: number | null = null;

  docentesFiltrados: any[] = [];
  selectedDocente: any = null;
  busquedaDocente = '';
  resultadosBusqueda: any[] = [];
  selectedFacultad: any = null;
  vacantesAula: number | null = null;

  eliminandoHorarios = false;
  guardando = false;

  private draggable?: Draggable;
  private beforeUnloadHandler = (e: BeforeUnloadEvent) => {
    if (this.guardando) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialDate: '2024-01-01',
    initialView: 'timeGridWeek',
    locale: esLocale,
    firstDay: 1,
    hiddenDays: [0],
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '23:00',
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    headerToolbar: { left: '', center: '', right: '' },
    height: 'auto',
    droppable: true,
    editable: true,
    eventDurationEditable: false,
    events: [],
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    eventReceive: (arg) => this.onEventReceive(arg),
    eventClick: (arg) => this.onEventClick(arg),

    eventDrop: (arg) => this.onEventDrop(arg),
    eventClassNames: (arg) => {
      const est = (arg.event.extendedProps?.['estado'] ?? '')
        .toString()
        .toUpperCase();
      return est === 'TEMPORAL' ? ['evt-temporal'] : ['evt-guardado'];
    },

    eventDidMount: (info) => this.addEstadoBadge(info),

    dropAccept: () => true,
  };

  declare tippy: any;

  constructor(
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private horarioService: HorarioService,
    private alertService: AlertService,
    private docenteService: DocenteService,
    private aulaService: AulaService
  ) {}

  ngOnInit(): void {
    this.turno_id = Number(this.route.snapshot.paramMap.get('turno_id'));
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    this.alertService.showLoadingScreen('Cargando datos del turno...');

    this.getTurno();
    this.getDocentes();
    this.getAulas();
  }

  ngAfterViewInit(): void {
    const containerEl = this.externalEventsRef?.nativeElement;
    if (containerEl) {
      this.draggable = new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: (el) => {
          const raw = el.getAttribute('data-event');
          return raw ? JSON.parse(raw) : {};
        },
      });
    }

    const api = this.calendarComponent?.getApi();
    if (api) {
      const today = new Date();
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      api.gotoDate(monday);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    this.draggable?.destroy();
  }

  private addEstadoBadge(info: any) {
    try {
      const ext = info.event.extendedProps || {};
      const modalidad = (ext['modalidad'] ?? '').toString().toUpperCase();
      const docente = ext['docente'] || ext['docente_nombre'] || '';
      const aula =
        ext['aula'] ||
        ext['aula_nombre'] ||
        ext['c_codaula'] ||
        ext['nombre_aula'] ||
        '';

      const main = info.el.querySelector('.fc-event-main') || info.el;
      if (!main || main.querySelector('.badge-estado')) return;

      (main as HTMLElement).style.position = 'relative';

      const titleContainer = main.querySelector('.fc-event-title-container');
      if (titleContainer) {
        if (docente) {
          const docenteSpan = document.createElement('div');
          docenteSpan.className = 'docente-text';
          docenteSpan.textContent = docente;
          titleContainer.appendChild(docenteSpan);
        }

        if (aula) {
          const aulaSpan = document.createElement('div');
          aulaSpan.className = 'aula-text';
          aulaSpan.textContent = `aula : ${aula}`;
          titleContainer.appendChild(aulaSpan);
        }
      }

      if (modalidad) {
        const badgeModalidad = document.createElement('span');
        badgeModalidad.className = 'badge-modalidad';
        badgeModalidad.textContent = modalidad;
        Object.assign(badgeModalidad.style, {
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          fontSize: '10px',
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '4px',
          background: '#374151',
          zIndex: '-1',

          pointerEvents: 'none',
        });
        main.appendChild(badgeModalidad);
      }
    } catch (error) {
      console.error('Error en addEstadoBadge:', error);
    }
  }

  private refreshBadgesForEvent(e: any): void {
    try {
      const el = e.el || document.querySelector(`[data-event-id="${e.id}"]`);
      if (!el) return;
      const main = el.querySelector('.fc-event-main') || el;
      if (!main) return;

      main
        .querySelectorAll('.docente-text, .aula-text, .badge-modalidad')
        .forEach((elm: any) => elm.remove());

      const ext = e.extendedProps || {};
      const modalidad = (ext['modalidad'] ?? '').toString().toUpperCase();
      const docente = ext['docente'] || ext['docente_nombre'] || '';
      const aula =
        ext['aula'] ||
        ext['aula_nombre'] ||
        ext['c_codaula'] ||
        ext['nombre_aula'] ||
        '';

      const titleContainer = main.querySelector('.fc-event-title-container');
      if (titleContainer) {
        if (docente) {
          const docenteSpan = document.createElement('div');
          docenteSpan.className = 'docente-text';
          docenteSpan.textContent = docente;
          titleContainer.appendChild(docenteSpan);
        }

        if (aula) {
          const aulaSpan = document.createElement('div');
          aulaSpan.className = 'aula-text';
          aulaSpan.textContent = `aula : ${aula}`;
          titleContainer.appendChild(aulaSpan);
        }
      }

      if (modalidad) {
        const badgeModalidad = document.createElement('span');
        badgeModalidad.className = 'badge-modalidad';
        badgeModalidad.textContent = modalidad;
        Object.assign(badgeModalidad.style, {
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          fontSize: '10px',
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '4px',
          background: '#374151',
          pointerEvents: 'none',
        });
        main.appendChild(badgeModalidad);
      }
    } catch (err) {
      console.error('Error al refrescar badges:', err);
    }
  }

  onEventClick(arg: any) {
    if (this.guardando) return;
    this.lastDropRevert = null;

    console.log('aca 1');

    const grupos = arg.event.extendedProps?.['grupos_hijo'] ?? [];
    console.log('grupos => ', grupos);

    if (
      this.boolTransversal &&
      Array.isArray(grupos) &&
      grupos[0]?.tipo === 0
    ) {
      this.alertService.warn('Los cursos transversales no pueden editarse.');
      return;
    }

    arg.jsEvent?.preventDefault?.();
    arg.jsEvent?.stopPropagation?.();

    const e = arg.event;
    console.log(
      '🟣 [CLICK] Antes de capturar estado:',
      e.extendedProps['n_horas_asignadas']
    );

    this.estadoAnteriorEvento = {
      start: e.start ? new Date(e.start) : null,
      end: e.end ? new Date(e.end) : null,
      extendedProps: { ...e.extendedProps },
    };

    console.log(
      '🟢 [CLICK] Estado capturado ->',
      this.estadoAnteriorEvento.extendedProps['n_horas_asignadas']
    );

    console.log(
      '📦 Estado original capturado:',
      this.estadoAnteriorEvento.extendedProps
    );

    const ext = e.extendedProps || {};
    const start = new Date(e.start!);

    this.modalAnchorWeekStart = this.getWeekStart(start);

    const horas50 = Math.max(1, Number(ext['n_horas_asignadas'] ?? 1));
    const codigo = ext['codigo'];
    const tipo = ext['tipo'];
    const maxParaEdicion = this.getHorasMaximasParaEdicion(
      codigo,
      tipo,
      horas50
    );

    this.eventoSeleccionado = e;
    this.cursoSeleccionado = {
      title: e.title,
      extendedProps: { ...ext },
      horasDisponibles: maxParaEdicion,
    };

    this.diaSeleccionado = this.mapDayIndexToName(start.getDay());
    this.horaInicio = this.toLocalHHmm(start);
    this.horasAsignadas = horas50;

    this.modalidadSeleccionada =
      (ext['modalidad'] ?? '').toString().toLowerCase() || null;

    this.aulaSeleccionada = ext['aula_id'] ?? null;

    const docenteId = ext['docente_id'] ?? null;
    if (docenteId) {
      const docenteEncontrado = this.docentesFiltrados.find(
        (d) => d.id === docenteId
      );
      this.selectedDocente = docenteEncontrado || null;
    } else {
      this.selectedDocente = null;
    }

    this.modalHorasActivo = true;
  }

  private dtoFromEvent(e: any) {
    const start: Date = e.start!;
    const end: Date = e.end!;
    const diaNombre = this.mapDayIndexToName(start.getDay());

    const mapDiaEnum = (nombre: string): string => {
      const d = (nombre ?? '').toLowerCase();
      const m: Record<string, string> = {
        domingo: 'DOMINGO',
        lunes: 'LUNES',
        martes: 'MARTES',
        miércoles: 'MIERCOLES',
        miercoles: 'MIERCOLES',
        jueves: 'JUEVES',
        viernes: 'VIERNES',
        sábado: 'SABADO',
        sabado: 'SABADO',
      };
      return m[d] ?? 'LUNES';
    };

    const mapTipoEnum = (tipoTxt: string): 'TEO' | 'PRA' => {
      const t = (tipoTxt ?? '').toLowerCase();
      if (
        t.startsWith('teo') ||
        t.startsWith('teoría') ||
        t.startsWith('teoria')
      )
        return 'TEO';
      if (t.startsWith('pra') || t.startsWith('prác') || t.startsWith('pract'))
        return 'PRA';
      return 'TEO';
    };

    const n_horas = Number(e.extendedProps?.['n_horas_asignadas'] ?? 1);
    const tipoTxt = String(e.extendedProps?.['tipo'] ?? 'Teoría');
    const curso_id = Number(e.extendedProps?.['curso_id'] ?? 0);
    const modalidad = e.extendedProps?.['modalidad'] ?? null;
    const aula_id = Number(e.extendedProps?.['aula_id'] ?? 0) || null;
    const docente_id = Number(e.extendedProps?.['docente_id'] ?? 0) || null;

    const horario_id_raw = e.extendedProps?.['horario_id'];
    const horario_id =
      typeof horario_id_raw === 'number'
        ? horario_id_raw
        : Number(horario_id_raw) || undefined;

    const base = {
      dia: mapDiaEnum(diaNombre),
      h_inicio: this.toLocalHHmm(start),
      h_fin: this.toLocalHHmm(end),
      n_horas: n_horas,
      tipo: mapTipoEnum(tipoTxt),
      modalidad,
      aula_id,
      docente_id,
      curso_id,
    };

    return horario_id ? { ...base, horario_id } : base;
  }

  clampHorasAsignadas(max: number) {
    const v = Math.floor(Number(this.horasAsignadas || 1));
    this.horasAsignadas = Math.min(Math.max(v, 1), Math.max(1, max));
  }

  private focusModalidad() {
    try {
      this.selModalidadRef?.nativeElement?.focus();
    } catch {}
  }

  private getWeekStart(d: Date): Date {
    const monday = new Date(d);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private existeSolapeRango(
    start: Date,
    end: Date,
    excludeEventId?: string
  ): boolean {
    const api = this.calendarComponent?.getApi();
    if (!api) return false;
    const eventos = api.getEvents();

    return eventos.some((e) => {
      if (excludeEventId && e.id === excludeEventId) return false;
      const es = e.start!;
      const ee = e.end!;

      return es < end && start < ee;
    });
  }

  onEventAllow(dropInfo: any, draggedEvent: any): boolean {
    const start = dropInfo.start as Date;
    const end = dropInfo.end as Date;

    const hayCruce = this.existeSolapeRango(start, end, draggedEvent?.id);
    if (hayCruce) this.alertService?.warn('Ese horario ya está ocupado');
    return !hayCruce;
  }

  onEventDrop(arg: any) {
    this.lastDropRevert = () => arg.revert();

    const e = arg.event;
    const ext = e.extendedProps || {};
    const horas50 = Math.max(1, Number(ext['n_horas_asignadas'] ?? 1));
    const nuevoStart = new Date(e.start!);

    this.modalAnchorWeekStart = this.getWeekStart(nuevoStart);

    const codigo = ext['codigo'];
    const tipo = ext['tipo'];
    const maxParaEdicion = this.getHorasMaximasParaEdicion(
      codigo,
      tipo,
      horas50
    );

    this.eventoSeleccionado = e;
    this.cursoSeleccionado = {
      title: e.title,
      extendedProps: { ...ext },
      horasDisponibles: maxParaEdicion,
    };

    this.diaSeleccionado = this.mapDayIndexToName(nuevoStart.getDay());
    this.horaInicio = this.toLocalHHmm(nuevoStart);
    this.horasAsignadas = horas50;

    this.modalidadSeleccionada =
      (ext['modalidad'] ?? '').toString().toLowerCase() || null;

    this.aulaSeleccionada = ext['aula_id'] ?? null;

    const docenteId = ext['docente_id'] ?? null;
    if (docenteId) {
      const docenteEncontrado = this.docentesFiltrados.find(
        (d) => d.id === docenteId
      );
      this.selectedDocente = docenteEncontrado || null;
    } else {
      this.selectedDocente = null;
    }

    this.modalHorasActivo = true;
  }

  getTurno(): void {
    this.turnoService.getTurno(this.turno_id).subscribe((data) => {
      this.turno = data;
      this.cursos = (data as any)?.cursos ?? [];

      const transformados = this.transformarCursos(this.cursos);
      this.cursosPlan2023 = transformados.filter((c) => c.n_codper === 2023);
      this.cursosPlan2025 = transformados.filter((c) => c.n_codper === 2025);

      this.count2023 = this.cursosPlan2023.length;
      this.count2025 = this.cursosPlan2025.length;

      const horarios = (data as any)?.horarios ?? [];
      this.cargarHorariosEnCalendario(horarios);

      this.alertService.close();
    });
  }

  getDocentes() {
    this.docenteService.getDocentes().subscribe((data) => {
      this.docentesFiltrados = [...data];
    });
  }

  getAulas() {
    this.aulaService.getAulas().subscribe((data) => {
      this.aulas = data;
    });
  }

  private transformarCursos(data: any[]): CursoCard[] {
    const areaMap: Record<string, string> = {
      EC: 'ESPECIALIDAD',
      EF: 'ESPECIFICA',
      FG: 'FORMACIÓN GENERAL',
      PP: 'PRÁCTICAS PRE-PROFESIONALES ',
    };
    const modalidadMap = (c_codmod: number): string =>
      c_codmod === 1
        ? 'Presencial'
        : c_codmod === 2
        ? 'Semipresencial'
        : c_codmod === 3
        ? 'Virtual'
        : '—';

    const out: CursoCard[] = [];
    for (const item of data) {
      const p = item.plan;
      const horasT = Number(p?.n_ht ?? 0);
      const horasP = Number(p?.n_hp ?? 0);
      const umaPlus = Number(p?.c_curup ?? 0);
      const horasTeoriaAsignables = Math.max(0, horasT - umaPlus);

      if (horasT > 0) {
        out.push({
          id: item.id,
          curso_id: item.id,
          c_codcur: p.c_codcur,
          c_nomcur: p.c_nomcur,
          n_ciclo: p.n_ciclo,
          tipo: 'teoria',
          horas: horasTeoriaAsignables,
          horasTotales: horasT + horasP,
          horasRestantes: horasTeoriaAsignables,
          h_umaPlus: umaPlus,
          c_nommod: modalidadMap(p.c_codmod),
          c_nom_cur_area: areaMap[p.c_area] ?? p.c_area ?? '—',
          c_codcur_equ: (item as any).c_codcur_equ,
          c_nomcur_equ: (item as any).c_nomcur_equ,
          n_codper: Number(p.n_codper),

          grupos_hijos: item.grupos_hijo,
        });
      }

      if (horasP > 0) {
        out.push({
          id: item.id,
          curso_id: item.id,
          c_codcur: p.c_codcur,
          c_nomcur: p.c_nomcur,
          n_ciclo: p.n_ciclo,
          tipo: 'practica',
          horas: horasP,
          horasTotales: horasT + horasP,
          horasRestantes: horasP,
          h_umaPlus: 0,
          c_nommod: modalidadMap(p.c_codmod),
          c_nom_cur_area: areaMap[p.c_area] ?? p.c_area ?? '—',
          c_codcur_equ: (item as any).c_codcur_equ,
          c_nomcur_equ: (item as any).c_nomcur_equ,
          n_codper: Number(p.n_codper),
          grupos_hijos: item.grupos_hijo,
        });
      }
    }
    return out;
  }

  public normalizeHorasInput() {
    const v = Math.floor(Number(this.horasAsignadas ?? 1));
    this.horasAsignadas = Math.max(1, v || 1);
  }

  stringifyEvent(curso: CursoCard): string {
    return JSON.stringify({
      title: `${curso.c_nomcur} (${
        curso.tipo === 'teoria' ? 'Teoría' : 'Práctica'
      })`,
      extendedProps: {
        id: curso.id,
        curso_id: curso.curso_id,
        codigo: curso.c_codcur,
        tipo: curso.tipo === 'teoria' ? 'Teoría' : 'Práctica',
        n_horas: 1,
        h_umaPlus: curso.tipo === 'teoria' ? curso.h_umaPlus ?? 0 : 0,
        grupos_hijo: curso.grupos_hijos ?? [],
      },
    });
  }

  private cargarHorariosEnCalendario(horarios: any[]): void {
    const api = this.calendarComponent?.getApi();
    if (!api || !Array.isArray(horarios)) return;

    this.resetHorasRestantes();

    horarios.forEach((h) => {
      const tipoTexto =
        (h.tipo ?? '').toString().toUpperCase() === 'TEO'
          ? 'Teoría'
          : 'Práctica';
      const isTeoria = tipoTexto === 'Teoría';

      const plan = h?.curso?.plan;
      const c_nomcur = plan?.c_nomcur ?? 'CURSO';
      const c_codcur = plan?.c_codcur ?? '';
      const curso_id = h?.curso?.id ?? h.curso_id ?? 0;

      const start = this.buildDateFromCurrentWeek(
        this.normalizarDia(h.dia),
        h.h_inicio
      );
      const end = this.buildDateFromCurrentWeek(
        this.normalizarDia(h.dia),
        h.h_fin
      );

      let color = isTeoria ? '#3788d8' : '#28a745';

      const grupos = h?.curso?.grupos_hijo ?? [];
      if (Array.isArray(grupos) && grupos.length > 0) {
        const tipoGrupo = grupos[0]?.tipo;
        if (tipoGrupo === 0) color = '#FACC15';
        if (tipoGrupo === 1) color = '#7C3AED';
      }

      const aulaId = Number(h.aula_id ?? h.aula?.id ?? 0);
      const aulaObj = this.aulas.find((a) => a.id === aulaId);
      const aulaNombre = aulaObj?.c_codaula ?? aulaObj?.c_codaula ?? null;

      const docenteNombre =
        h.docente?.c_nomdoc ??
        h.docente?.nombre ??
        h.docente_nombre ??
        (h.docente_id ? `Docente ${h.docente_id}` : null);

      const modalidadTxt = (h.modalidad ?? '').toString().toUpperCase();
      const modalidadLabel =
        modalidadTxt === 'VIR'
          ? 'Virtual'
          : modalidadTxt === 'PRE'
          ? 'Presencial'
          : modalidadTxt === 'SEMIPRESENCIAL'
          ? 'Semipresencial'
          : modalidadTxt || '—';

      api.addEvent({
        id: `loaded-${h.id}`,
        title: `${c_nomcur} (${tipoTexto})`,
        start,
        end,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          horario_id: Number(h.id),
          curso_id,
          codigo: c_codcur,
          tipo: tipoTexto,

          modalidad: modalidadTxt,

          aula_id: Number(h.aula_id ?? 0),
          docente_id: Number(h.docente_id ?? 0),

          aula_nombre: aulaNombre,
          docente_nombre: docenteNombre,
          n_horas_asignadas: Number(h.n_horas ?? 1),
          h_umaPlus: isTeoria ? Number(plan?.c_curup ?? 0) : 0,
          persisted: true,
          estado: 'GUARDADO',
          grupos_hijo: h?.curso?.grupos_hijo ?? [],
        },
      });

      const nHoras = Number(h.n_horas ?? 1);
      this.restarHorasDisponibles(c_codcur, tipoTexto, nHoras);
    });
  }

  private resetHorasRestantes(): void {
    const reset = (arr: CursoCard[]) =>
      arr.forEach((c) => (c.horasRestantes = c.horas));
    reset(this.cursosPlan2023);
    reset(this.cursosPlan2025);
  }

  private limpiarCalendario() {
    const api = this.calendarComponent?.getApi();
    api?.getEvents().forEach((e) => e.remove());
    this.resetHorasRestantes();
  }

  onEventReceive(info: any) {
    if (this.guardando) {
      info.event.remove();
      return;
    }
    info.event.remove();
    const raw = info.draggedEl?.getAttribute('data-event');
    const data = raw ? JSON.parse(raw) : {};
    const dropDate: Date | null = info.event?.start ?? null;
    const fallbackDate =
      this.calendarComponent?.getApi()?.getDate?.() ?? new Date();
    this.openAsignacionModal(data, dropDate ?? fallbackDate);
  }

  private openAsignacionModal(dragData: any, dropDate: Date) {
    if (this.guardando) return;

    const horasDisp = this.getHorasDisponibles(
      dragData?.extendedProps?.codigo,
      dragData?.extendedProps?.tipo
    );

    if (!horasDisp || horasDisp <= 0) {
      this.alertService.warn('Curso asignado sin horas disponibles');
      return;
    }

    const start0 = new Date(dropDate);
    const end0 = new Date(start0);
    end0.setMinutes(end0.getMinutes() + 50);
    if (this.haySolape(start0, end0)) {
      this.alertService.warn('Ese horario ya está ocupado');
      return;
    }

    this.eventoSeleccionado = null;
    this.cursoSeleccionado = { ...dragData, horasDisponibles: horasDisp };
    this.diaSeleccionado = this.mapDayIndexToName(dropDate.getDay());
    this.horaInicio = this.formatTime(dropDate);
    this.horasAsignadas = 1;
    this.modalidadSeleccionada = null;
    this.aulaSeleccionada = null;
    this.selectedDocente = null;
    this.vacantesAula = null;
    this.modalHorasActivo = true;
  }

  confirmarAsignacionHoras() {
    if (this.guardando) return;
    if (!this.cursoSeleccionado) return;

    if (!this.modalidadSeleccionada) {
      this.alertService.warn('Selecciona una modalidad antes de asignar');
      this.focusModalidad();
      return;
    }

    if (
      this.boolTransversal &&
      this.cursoSeleccionado?.extendedProps?.grupos_hijo?.[0]?.tipo === 0
    ) {
      this.alertService.warn(
        'No puedes crear horarios para cursos transversales.'
      );
      return;
    }

    const disp = Number(this.cursoSeleccionado?.horasDisponibles ?? 0);
    let raw = Math.floor(Number(this.horasAsignadas ?? 1));
    if (raw < 1) raw = 1;

    if (raw > disp) {
      this.alertService.warn(
        `No puedes asignar ${raw} hora(s). Solo quedan ${disp}.`
      );

      this.horasAsignadas = disp > 0 ? disp : 1;
      return;
    }

    const aAsignar = raw;
    if (!this.horaInicio || aAsignar <= 0) return;

    const start = this.buildDateFromCurrentWeek(
      this.diaSeleccionado,
      this.horaInicio
    );
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + aAsignar * 50);

    if (this.haySolape(start, end)) {
      this.alertService.warn('Ya existe un curso asignado en ese horario');
      return;
    }

    const calApi = this.calendarComponent.getApi();

    const isTeoria = this.cursoSeleccionado?.extendedProps?.tipo === 'Teoría';
    let color = isTeoria ? '#3788d8' : '#28a745';

    const grupos = this.cursoSeleccionado?.extendedProps?.grupos_hijo ?? [];
    if (Array.isArray(grupos) && grupos.length > 0) {
      const tipoGrupo = grupos[0]?.tipo;
      if (tipoGrupo === 0) color = '#FACC15';
      if (tipoGrupo === 1) color = '#7C3AED';
    }

    const nuevoEvento = calApi.addEvent({
      id: `ev-${this.cursoSeleccionado.extendedProps.codigo}-${Date.now()}`,
      title: this.cursoSeleccionado.title,
      start,
      end,
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        ...this.cursoSeleccionado.extendedProps,
        modalidad: this.modalidadSeleccionada,
        aula_id: this.aulaSeleccionada ?? 0,
        docente_id: this.selectedDocente?.id ?? 0,
        docente_nombre: this.selectedDocente?.c_nomdoc ?? '',
        aula_nombre:
          this.aulas.find((a) => a.id === this.aulaSeleccionada)?.c_codaula ??
          '',
        n_horas_asignadas: aAsignar,
        persisted: false,
        estado: 'GUARDADO',
      },
    });

    this.guardarSoloEvento(nuevoEvento);

    this.restarHorasDisponibles(
      this.cursoSeleccionado.extendedProps.codigo,
      this.cursoSeleccionado.extendedProps.tipo,
      aAsignar
    );

    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
  }

  async confirmarEliminarTodosLosHorarios() {
    if (this.guardando) return;

    const ok = await this.alertService.confirmDeleteAll();
    if (!ok) return;

    this.eliminandoHorarios = true;
    this.alertService.deletingAll();

    this.horarioService.deleteHorarios(this.turno_id).subscribe({
      next: () => {
        this.alertService.close();
        this.alertService.deleteAllSuccess();
        this.limpiarCalendario();
        this.getTurno();
        this.eliminandoHorarios = false;
      },
      error: () => {
        this.alertService.close();
        this.alertService.deleteAllError();
        this.eliminandoHorarios = false;
      },
    });
  }

  guardarEventos() {
    this.alertService.showSaving();

    const api = this.calendarComponent?.getApi();
    const eventos = api?.getEvents() ?? [];

    const mapDiaEnum = (nombre: string): string => {
      const d = (nombre ?? '').toLowerCase();
      const m: Record<string, string> = {
        domingo: 'DOMINGO',
        lunes: 'LUNES',
        martes: 'MARTES',
        miércoles: 'MIERCOLES',
        miercoles: 'MIERCOLES',
        jueves: 'JUEVES',
        viernes: 'VIERNES',
        sábado: 'SABADO',
        sabado: 'SABADO',
      };
      return m[d] ?? 'LUNES';
    };

    const mapTipoEnum = (tipoTxt: string): 'TEO' | 'PRA' => {
      const t = (tipoTxt ?? '').toLowerCase();
      if (
        t.startsWith('teo') ||
        t.startsWith('teoría') ||
        t.startsWith('teoria')
      )
        return 'TEO';
      if (t.startsWith('pra') || t.startsWith('prác') || t.startsWith('pract'))
        return 'PRA';
      return 'TEO';
    };

    const seen = new Set<string>();
    const items: any[] = [];

    for (const e of eventos) {
      const yaPersistido = !!e.extendedProps?.['persisted'];
      const persistidoSinId = !!e.extendedProps?.['persisted_without_id'];
      const horarioIdRaw = e.extendedProps?.['horario_id'];
      const horario_id: number | undefined =
        typeof horarioIdRaw === 'number'
          ? horarioIdRaw
          : Number(horarioIdRaw) || undefined;

      if (yaPersistido && !horario_id && persistidoSinId) {
        continue;
      }

      const start: Date = e.start!;
      const end: Date = e.end!;
      const diaNombre = this.mapDayIndexToName(start.getDay());
      const nHoras = Number(e.extendedProps?.['n_horas_asignadas'] ?? 1);
      const tipoTxt = String(e.extendedProps?.['tipo'] ?? 'Teoría');
      const curso_id = Number(e.extendedProps?.['curso_id'] ?? 0);
      const modalidad = e.extendedProps?.['modalidad'];
      const aula_id = Number(e.extendedProps?.['aula_id'] ?? 0) || null;
      const docente_id = Number(e.extendedProps?.['docente_id'] ?? 0) || null;

      const fingerprint = [
        this.turno_id,
        curso_id,
        mapDiaEnum(diaNombre),
        this.toLocalHHmm(start),
        this.toLocalHHmm(end),
        mapTipoEnum(tipoTxt),
        modalidad ?? '',
        aula_id ?? 0,
        docente_id ?? 0,
      ].join('|');

      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);

      const base = {
        dia: mapDiaEnum(diaNombre),
        h_inicio: this.toLocalHHmm(start),
        h_fin: this.toLocalHHmm(end),
        n_horas: nHoras,
        tipo: mapTipoEnum(tipoTxt),
        modalidad,
        aula_id,
        docente_id,
        curso_id,
      };

      items.push(horario_id ? { ...base, horario_id } : base);
    }

    this.horarioService.createHorarios({ items }, this.turno_id).subscribe({
      next: () => {
        this.alertService.close();
        this.alertService.saveSuccess();
        this.limpiarCalendario();
        this.getTurno();
      },
      error: (err: any) => {
        this.alertService.close();

        const msg =
          err?.error?.message ||
          err?.message ||
          'Ocurrió un error al guardar los horarios.';

        this.alertService.warn('Conflicto detectado', msg);

        console.error('Error al guardar horarios:', err);
      },
    });
  }

  actualizarRangoPorTurno(): void {
    if (this.guardando) return;
    if (this.turnoSeleccionado === 'M') {
      this.calendarOptions.slotMinTime = '08:00:00';
      this.calendarOptions.slotMaxTime = '18:00:00';
    } else if (this.turnoSeleccionado === 'N') {
      this.calendarOptions.slotMinTime = '18:00:00';
      this.calendarOptions.slotMaxTime = '23:00:00';
    } else {
      this.calendarOptions.slotMinTime = '08:00:00';
      this.calendarOptions.slotMaxTime = '23:00:00';
    }
    const api = this.calendarComponent?.getApi();
    if (api) {
      api.setOption('slotMinTime', this.calendarOptions.slotMinTime!);
      api.setOption('slotMaxTime', this.calendarOptions.slotMaxTime!);
    }
  }

  private restarHorasDisponibles(
    codigo: string,
    tipo: 'Teoría' | 'Práctica',
    nHoras: number
  ): void {
    const updater = (arr: CursoCard[]) => {
      const item = arr.find(
        (c) =>
          c.c_codcur === codigo &&
          ((tipo === 'Teoría' && c.tipo === 'teoria') ||
            (tipo === 'Práctica' && c.tipo === 'practica'))
      );
      if (item) item.horasRestantes = Math.max(0, item.horasRestantes - nHoras);
    };
    updater(this.cursosPlan2023);
    updater(this.cursosPlan2025);
  }

  private getHorasDisponibles(
    codigo: string,
    tipo: 'Teoría' | 'Práctica'
  ): number {
    const finder = (arr: CursoCard[]) =>
      arr.find(
        (c) =>
          c.c_codcur === codigo &&
          ((tipo === 'Teoría' && c.tipo === 'teoria') ||
            (tipo === 'Práctica' && c.tipo === 'practica'))
      )?.horasRestantes ?? 0;

    const h1 = finder(this.cursosPlan2023);
    const h2 = finder(this.cursosPlan2025);
    return Math.max(h1, h2);
  }

  private normalizarDia(dia: string): string {
    const d = (dia ?? '').toString().trim().toLowerCase();
    const mapa: Record<string, string> = {
      domingo: 'Domingo',
      lunes: 'Lunes',
      martes: 'Martes',
      miércoles: 'Miércoles',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sábado: 'Sábado',
      sabado: 'Sábado',
    };
    return mapa[d] ?? 'Lunes';
  }

  private mapDayIndexToName(i: number): string {
    const map = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return map[i] ?? 'Lunes';
  }

  private formatTime(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private buildDateFromCurrentWeek(
    nombreDia: string,
    hhmm: string,
    anchor?: Date
  ): Date {
    const api = this.calendarComponent.getApi();
    const base = anchor ? new Date(anchor) : new Date(api.view.currentStart);
    const dayIndex = this.diaNombreToIndex(nombreDia);

    const target = new Date(base);
    target.setDate(base.getDate() + dayIndex);
    const [hh, mm] = (hhmm ?? '00:00').split(':').map((v) => Number(v));
    target.setHours(hh || 0, mm || 0, 0, 0);
    return target;
  }

  private diaNombreToIndex(nombreDia: string): number {
    const d = (nombreDia ?? '').toString().trim().toLowerCase();
    const map: Record<string, number> = {
      lunes: 0,
      martes: 1,
      miércoles: 2,
      miercoles: 2,
      jueves: 3,
      viernes: 4,
      sábado: 5,
      sabado: 5,
      domingo: 6,
    };
    return map[d] ?? 0;
  }

  filtrarDocentesBusquedaGeneral() {
    const termino = this.busquedaDocente?.toLowerCase().trim() || '';

    if (!termino) {
      this.docentesFiltrados = this.selectedDocente;
      this.resultadosBusqueda = [];
      return;
    }

    this.docentesFiltrados = this.selectedDocente.filter((d: any) =>
      d.c_nomdoc.toLowerCase().includes(termino)
    );

    this.resultadosBusqueda = this.docentesFiltrados;
  }

  seleccionarDocenteDesdeBusqueda(doc: any) {
    this.selectedDocente = doc;
    this.resultadosBusqueda = [];
    this.busquedaDocente = '';
  }

  cancelarAsignacion() {
    if (this.guardando) return;
    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
  }

  actualizarEvento() {
    if (this.guardando || !this.eventoSeleccionado) return;

    if (
      this.boolTransversal &&
      this.eventoSeleccionado.extendedProps?.grupos_hijo?.[0]?.tipo === 0
    ) {
      this.alertService.warn(
        'No puedes modificar horarios de cursos transversales.'
      );
      return;
    }

    console.log(
      '🔵 [ACTUALIZAR] Antes de guardar snapshot ->',
      this.eventoSeleccionado.extendedProps['n_horas_asignadas']
    );

    // 🧩 GUARDAR ESTADO ANTERIOR ANTES DE CAMBIAR NADA
    this.estadoAnteriorEvento = {
      start: this.eventoSeleccionado.start
        ? new Date(this.eventoSeleccionado.start)
        : null,
      end: this.eventoSeleccionado.end
        ? new Date(this.eventoSeleccionado.end)
        : null,
      extendedProps: { ...this.eventoSeleccionado.extendedProps },
    };

    console.log(
      '🟠 [ACTUALIZAR] Snapshot guardado con ->',
      this.estadoAnteriorEvento.extendedProps['n_horas_asignadas']
    );

    console.log(
      '📦 EstadoAnterior guardado antes de modificar:',
      this.estadoAnteriorEvento.extendedProps?.['n_horas_asignadas']
    );

    if (!this.modalidadSeleccionada) {
      this.alertService.warn('Selecciona una modalidad antes de actualizar');
      this.focusModalidad();
      return;
    }

    const oldHoras = this.getHorasAsignadasDeEventoSel();
    const codigo = this.eventoSeleccionado.extendedProps?.['codigo'];
    const tipo = (this.eventoSeleccionado.extendedProps?.['tipo'] ??
      'Teoría') as 'Teoría' | 'Práctica';
    const maxEdicion = this.getHorasMaximasParaEdicion(codigo, tipo, oldHoras);

    let rawNew = Math.floor(Number(this.horasAsignadas ?? 1));
    if (rawNew < 1) rawNew = 1;

    if (rawNew > maxEdicion) {
      this.alertService.warn(
        `No puedes asignar ${rawNew} hora(s). Solo permite hasta ${maxEdicion}.`
      );

      this.horasAsignadas = maxEdicion;
      return;
    }

    const newHoras = rawNew;

    const start = this.buildDateFromCurrentWeek(
      this.diaSeleccionado,
      this.horaInicio,
      this.modalAnchorWeekStart || undefined
    );
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + newHoras * 50);

    if (this.existeSolapeRango(start, end, this.eventoSeleccionado.id)) {
      this.alertService.warn('Ya existe un curso asignado en ese horario');
      return;
    }

    const deltaRestantes = oldHoras - newHoras;
    if (deltaRestantes !== 0) {
      this.aplicarDeltaHorasRestantes(codigo, tipo, deltaRestantes);
    }

    this.eventoSeleccionado.setStart(start);
    this.eventoSeleccionado.setEnd(end);
    this.eventoSeleccionado.setExtendedProp(
      'modalidad',
      this.modalidadSeleccionada ?? null
    );
    this.eventoSeleccionado.setExtendedProp(
      'aula_id',
      this.aulaSeleccionada ?? 0
    );
    this.eventoSeleccionado.setExtendedProp(
      'docente_id',
      this.selectedDocente?.id ?? 0
    );
    this.eventoSeleccionado.setExtendedProp('n_horas_asignadas', newHoras);

    this.eventoSeleccionado.setExtendedProp(
      'docente_nombre',
      this.selectedDocente?.c_nomdoc ?? ''
    );
    this.eventoSeleccionado.setExtendedProp(
      'aula_nombre',
      this.aulas.find((a) => a.id === this.aulaSeleccionada)?.c_codaula ?? ''
    );

    this.eventoSeleccionado.setExtendedProp(
      'docente_nombre',
      this.selectedDocente?.c_nomdoc ?? ''
    );
    this.eventoSeleccionado.setExtendedProp(
      'aula_nombre',
      this.aulas.find((a) => a.id === this.aulaSeleccionada)?.c_codaula ?? ''
    );

    console.log(
      '🔴 [ACTUALIZAR] Justo antes de guardar evento ->',
      this.eventoSeleccionado.extendedProps['n_horas_asignadas']
    );

    this.guardarSoloEvento(this.eventoSeleccionado);

    this.refreshBadgesForEvent(this.eventoSeleccionado);

    this.modalHorasActivo = false;
    this.eventoSeleccionado = null;
    this.modalAnchorWeekStart = null;
  }

  eliminarEvento() {
    if (this.guardando || !this.eventoSeleccionado) return;

    if (
      this.boolTransversal &&
      this.eventoSeleccionado.extendedProps?.grupos_hijo?.[0]?.tipo === 0
    ) {
      this.alertService.warn(
        'No puedes eliminar horarios de cursos transversales.'
      );
      return;
    }

    const e = this.eventoSeleccionado;
    const horarioId = e.extendedProps?.['horario_id'];
    const estado = (e.extendedProps?.['estado'] ?? '').toString().toUpperCase();

    if (!horarioId || estado === 'TEMPORAL') {
      const codigo = e.extendedProps?.['codigo'];
      const tipo = e.extendedProps?.['tipo'] ?? 'Teoría';
      const nh = Number(e.extendedProps?.['n_horas_asignadas'] ?? 1);

      const addBack = (arr: CursoCard[]) => {
        const item = arr.find(
          (c) =>
            c.c_codcur === codigo &&
            ((tipo === 'Teoría' && c.tipo === 'teoria') ||
              (tipo === 'Práctica' && c.tipo === 'practica'))
        );
        if (item) item.horasRestantes = Math.max(0, item.horasRestantes + nh);
      };
      addBack(this.cursosPlan2023);
      addBack(this.cursosPlan2025);

      e.remove();

      this.alertService.success(
        'Horario eliminado',
        'El horario temporal fue eliminado correctamente.'
      );
      this.modalHorasActivo = false;
      this.eventoSeleccionado = null;
      return;
    }

    this.lockUI(true);
    this.alertService.showSaving();

    this.horarioService.deleteHorario(horarioId).subscribe({
      next: () => {
        const codigo = e.extendedProps?.['codigo'];
        const tipo = e.extendedProps?.['tipo'] ?? 'Teoría';
        const nh = Number(e.extendedProps?.['n_horas_asignadas'] ?? 1);

        const addBack = (arr: CursoCard[]) => {
          const item = arr.find(
            (c) =>
              c.c_codcur === codigo &&
              ((tipo === 'Teoría' && c.tipo === 'teoria') ||
                (tipo === 'Práctica' && c.tipo === 'practica'))
          );
          if (item) item.horasRestantes = Math.max(0, item.horasRestantes + nh);
        };
        addBack(this.cursosPlan2023);
        addBack(this.cursosPlan2025);

        e.remove();
        this.alertService.close();
        this.alertService.success(
          'Eliminar Horario',
          'Horario eliminado correctamente.'
        );
        this.modalHorasActivo = false;
        this.eventoSeleccionado = null;
        this.lockUI(false);
      },
      error: () => {
        this.alertService.close();
        this.alertService.saveError();
        this.lockUI(false);
      },
    });
  }

  private guardarSoloEvento(e: any) {
    // 🧩 Guardamos un clon del estado actual antes de modificarlo
    console.log(
      '⚙️ [GUARDAR] Llega estadoAnteriorEvento con ->',
      this.estadoAnteriorEvento?.extendedProps?.['n_horas_asignadas']
    );
    console.log(
      '⚙️ [GUARDAR] Evento actual llega con ->',
      e.extendedProps['n_horas_asignadas']
    );

    const estadoAnterior = this.estadoAnteriorEvento || {
      start: e.start ? new Date(e.start) : null,
      end: e.end ? new Date(e.end) : null,
      extendedProps: { ...e.extendedProps },
    };

    // 🪵 Log inicial para monitorear el estado antes del guardado
    console.log('=== 🟢 INICIO GUARDAR EVENTO ===');
    console.log('Evento ->', e.title);
    console.log(
      'Horas actuales antes del intento:',
      e.extendedProps?.['n_horas_asignadas']
    );
    console.log(
      'Horas restantes antes del intento:',
      this.getHorasDisponibles(
        e.extendedProps?.['codigo'],
        e.extendedProps?.['tipo']
      )
    );

    const item = this.dtoFromEvent(e);

    this.guardandoUno = true;
    this.lockUI(true);
    this.alertService.showSaving();

    this.horarioService
      .createHorarios({ items: [item] }, this.turno_id)
      .subscribe({
        next: (resp: any) => {
          let newId: number | undefined;
          if (resp?.items?.[0]?.id) newId = Number(resp.items[0].id);
          else if (Array.isArray(resp) && resp[0]?.id)
            newId = Number(resp[0].id);
          else if (resp?.id) newId = Number(resp.id);

          this.marcarPersistido(e, newId);

          const api = this.calendarComponent.getApi();
          const eventData = e.toPlainObject();
          e.remove();
          api.addEvent(eventData);

          this.alertService.close();
          this.alertService.toastSuccess('Horario guardado correctamente');

          this.lockUI(false);
          this.guardandoUno = false;
          this.lastDropRevert = null;
          this.estadoAnteriorEvento = null;

          console.log('=== ✅ GUARDADO EXITOSO ===');
        },

        error: (err: any) => {
          console.error('Error al guardar horario:', err);
          console.log('=== 🔴 ERROR DE CONFLICTO DETECTADO ===');
          console.log(
            'Horas actuales del evento fallido:',
            e.extendedProps?.['n_horas_asignadas']
          );
          console.log(
            'Horas restantes antes de revertir:',
            this.getHorasDisponibles(
              e.extendedProps?.['codigo'],
              e.extendedProps?.['tipo']
            )
          );

          if (err?.status === 409) console.log('⚠️ ACA CRUCE ⚠️');

          // ⚙️ Si hay revert interno
          if (this.lastDropRevert) {
            try {
              this.lastDropRevert();
            } catch (revertErr) {
              console.warn('Error al revertir evento:', revertErr);
            }
          } else {
            const yaPersistido = !!e.extendedProps?.persisted;
            console.log('yaPersistido => ', yaPersistido);

            if (yaPersistido) {
              // 🔹 Guardar las horas que intentó asignar ANTES de revertir visualmente
              const horasIntentadas = Number(
                e.extendedProps?.['n_horas_asignadas'] ?? 1
              );

              // 🔙 Revertimos el evento a su estado anterior (día, hora, aula, docente, etc.)
              if (estadoAnterior.start) e.setStart(estadoAnterior.start);
              if (estadoAnterior.end) e.setEnd(estadoAnterior.end);

              for (const key in estadoAnterior.extendedProps) {
                e.setExtendedProp(key, estadoAnterior.extendedProps[key]);
              }

              this.refreshBadgesForEvent(e);
              this.eventoSeleccionado = null;
              this.cursoSeleccionado = null;

              const api = this.calendarComponent?.getApi();
              if (api) {
                const eventData = e.toPlainObject();
                e.remove();
                api.addEvent(eventData);
              }

              console.log(
                '🔁 Evento revertido y re-renderizado por conflicto.'
              );

              // ♻️ Revertir también las horasRestantes si hubo cambio previo
              try {
                const codigo = estadoAnterior.extendedProps?.['codigo'];
                const tipo = estadoAnterior.extendedProps?.['tipo'] ?? 'Teoría';
                const horasPrevias = Number(
                  estadoAnterior.extendedProps?.['n_horas_asignadas'] ?? 1
                );
                const delta = horasIntentadas - horasPrevias;

                console.log(
                  '🧩 [ERROR] estadoAnteriorEvento usado con ->',
                  estadoAnterior.extendedProps['n_horas_asignadas']
                );
                console.log('Horas previas:', horasPrevias);
                console.log(
                  'Horas intentadas (antes del revert):',
                  horasIntentadas
                );
                console.log('Delta calculado:', delta);

                if (delta !== 0) {
                  // this.aplicarDeltaHorasRestantes(codigo, tipo, delta * -1);
                  this.aplicarDeltaHorasRestantes(codigo, tipo, delta);

                  console.log(
                    '♻️ HorasRestantes revertidas. Delta aplicado:',
                    delta * -1
                  );
                }

                console.log(
                  'Horas restantes después del revert:',
                  this.getHorasDisponibles(codigo, tipo)
                );
              } catch (err) {
                console.warn(
                  'No se pudo revertir las horas restantes tras conflicto:',
                  err
                );
              }
            } else {
              try {
                e.remove();
              } catch (removeErr) {
                console.warn(
                  'No se pudo eliminar el evento tras conflicto:',
                  removeErr
                );
              }
            }
          }

          this.lastDropRevert = null;
          this.lockUI(false);
          this.guardandoUno = false;
          this.alertService.close();
          this.estadoAnteriorEvento = null;

          const msg =
            err?.error?.message ||
            err?.message ||
            'Ocurrió un error al guardar el horario.';

          if (err?.status === 409) {
            this.alertService.warn('Conflicto detectado', msg);
          } else {
            this.alertService.saveError(msg);
          }

          // 🪵 Estado final tras error
          console.log('=== 🔚 FIN ERROR GUARDADO ===');
          console.log(
            'Horas restantes finales:',
            this.getHorasDisponibles(
              e.extendedProps?.['codigo'],
              e.extendedProps?.['tipo']
            )
          );
          console.log('============================');
        },
      });
  }

  cancelarEdicion() {
    if (this.guardando) return;

    if (this.lastDropRevert) {
      try {
        this.lastDropRevert();
      } catch {}
    }
    this.lastDropRevert = null;

    this.modalHorasActivo = false;
    this.eventoSeleccionado = null;
  }

  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  private toLocalHHmm(d: Date): string {
    return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`;
  }

  private lockUI(lock: boolean) {
    const api = this.calendarComponent?.getApi();
    if (api) {
      api.setOption('editable', !lock);
      api.setOption('droppable', !lock);
      api.setOption('eventDurationEditable', !lock);
    }
    document.body.style.cursor = lock ? 'wait' : 'auto';
  }

  isDraggable(curso: CursoCard): boolean {
    return Number(curso.horasRestantes ?? 0) > 0 && !this.guardando;
  }

  estadoHorasTexto(curso: CursoCard): string {
    return this.isDraggable(curso) ? '' : 'ASIGNADO SIN HORAS';
  }

  private haySolape(start: Date, end: Date): boolean {
    const api = this.calendarComponent?.getApi();
    if (!api) return false;
    const eventos = api.getEvents();

    return eventos.some((e) => {
      const es = e.start!;
      const ee = e.end!;
      return es < end && start < ee;
    });
  }

  private getHorasMaximasParaEdicion(
    codigo: string,
    tipo: 'Teoría' | 'Práctica',
    asignadasEvento: number
  ): number {
    return Math.max(
      1,
      this.getHorasDisponibles(codigo, tipo) + (asignadasEvento || 0)
    );
  }

  private aplicarDeltaHorasRestantes(
    codigo: string,
    tipo: 'Teoría' | 'Práctica',
    delta: number
  ): void {
    const apply = (arr: CursoCard[]) => {
      const item = arr.find(
        (c) =>
          c.c_codcur === codigo &&
          ((tipo === 'Teoría' && c.tipo === 'teoria') ||
            (tipo === 'Práctica' && c.tipo === 'practica'))
      );
      if (item) {
        item.horasRestantes = Math.max(0, item.horasRestantes + delta);
      }
    };
    apply(this.cursosPlan2023);
    apply(this.cursosPlan2025);
  }

  private getHorasAsignadasDeEventoSel(): number {
    return Math.max(
      1,
      Number(this.eventoSeleccionado?.extendedProps?.['n_horas_asignadas'] ?? 1)
    );
  }

  abrirGenerarCursosModal() {
    if (this.guardando) return;
    this.genVisible = true;
    this.cargarGenerables();
  }

  cerrarGenerarCursosModal() {
    if (this.genLoading) return;
    this.genVisible = false;
  }

  private cargarGenerables() {
    this.genLoading = true;

    const ensureCursos$ = this.cursos
      ? null
      : this.turnoService.getTurno(this.turno_id);

    const loadPlan$ = this.turnoService.getCursosPlanTurno(this.turno_id);

    (ensureCursos$ ? ensureCursos$ : loadPlan$).subscribe({
      next: (maybeTurno: any) => {
        if (maybeTurno && maybeTurno.cursos) {
          this.cursos = maybeTurno.cursos;

          loadPlan$.subscribe({
            next: (plan: HR_Plan_Estudio_Curso[]) => {
              const generados = this.cursos || [];
              this.genList = (plan || []).map((p: HR_Plan_Estudio_Curso) => {
                const ya =
                  generados.find(
                    (c: any) => c?.plan?.c_codcur === p.c_codcur
                  ) ?? null;
                return { ...p, cursoGenerado: ya };
              });
              this.genLoading = false;
            },
            error: () => {
              this.genLoading = false;
              this.alertService.saveError();
            },
          });
        } else if (!ensureCursos$) {
          const plan = maybeTurno as unknown as HR_Plan_Estudio_Curso[];
          const generados = this.cursos || [];
          this.genList = (plan || []).map((p: HR_Plan_Estudio_Curso) => {
            const ya =
              generados.find((c: any) => c?.plan?.c_codcur === p.c_codcur) ??
              null;
            return { ...p, cursoGenerado: ya };
          });
          this.genLoading = false;
        }
      },
      error: () => {
        this.genLoading = false;
        this.alertService.saveError();
      },
    });
  }

  generarCursoDesdeModal(fila: FilaCursoPlan) {
    if (this.guardando || this.genLoading) return;
    if (fila.cursoGenerado) return;

    const payload: Partial<HR_Curso> = {
      turno_id: this.turno_id,
      plan_id: Number(fila.id),
      c_alu: Number(this.genVacantes || 20),
    };

    this.lockUI(true);
    this.genLoading = true;

    this.turnoService.generarCurso(payload).subscribe({
      next: () => {
        this.alertService.saveSuccess();

        this.turnoService.getTurno(this.turno_id).subscribe({
          next: (turnoActualizado) => {
            this.turno = turnoActualizado;
            this.cursos = turnoActualizado.cursos || [];

            const transformados = this.transformarCursos(this.cursos);
            this.cursosPlan2023 = transformados.filter(
              (c) => c.n_codper === 2023
            );
            this.cursosPlan2025 = transformados.filter(
              (c) => c.n_codper === 2025
            );

            this.cargarGenerables();

            this.lockUI(false);
            this.genLoading = false;
          },
          error: () => {
            this.lockUI(false);
            this.genLoading = false;
          },
        });
      },
      error: () => {
        this.alertService.close();
        this.alertService.saveError();
        this.lockUI(false);
        this.genLoading = false;
      },
    });
  }

  eliminarCursoDesdeModal(fila: FilaCursoPlan) {
    if (this.guardando || this.genLoading) return;
    const id = fila.cursoGenerado?.id;
    if (!id) return;

    this.lockUI(true);
    this.alertService.showSaving();
    this.genLoading = true;

    this.turnoService.deleteCurso(id).subscribe({
      next: () => {
        this.alertService.close();
        this.alertService.success(
          'Curso eliminado',
          'El curso fue eliminado correctamente.'
        );

        this.turnoService.getTurno(this.turno_id).subscribe({
          next: (turnoActualizado) => {
            this.turno = turnoActualizado;
            this.cursos = turnoActualizado.cursos || [];

            const transformados = this.transformarCursos(this.cursos);
            this.cursosPlan2023 = transformados.filter(
              (c) => c.n_codper === 2023
            );
            this.cursosPlan2025 = transformados.filter(
              (c) => c.n_codper === 2025
            );

            this.cargarGenerables();

            this.lockUI(false);
            this.genLoading = false;
          },
          error: () => {
            this.lockUI(false);
            this.genLoading = false;
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.alertService.close();
        console.log('Error => ', err.error.message);

        this.alertService.saveError(err.error.message);
        this.lockUI(false);
        this.genLoading = false;
      },
    });
  }

  abrirModalDesdeCard(curso: CursoCard, ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    if (this.guardando) return;
    console.log('aca');

    if (this.boolTransversal && curso.grupos_hijos?.[0]?.tipo === 0) {
      this.alertService.warn('Los cursos transversales están bloqueados.');
      return;
    }

    if (!this.aulas.length || !this.docentesFiltrados.length) {
      this.alertService.warn(
        'Aulas o docentes aún no están cargados. Espera un momento.'
      );
      return;
    }

    const tipoTexto: 'Teoría' | 'Práctica' =
      curso.tipo === 'teoria' ? 'Teoría' : 'Práctica';
    const horasDisp = this.getHorasDisponibles(curso.c_codcur, tipoTexto);

    if (!horasDisp || horasDisp <= 0) {
      this.alertService?.warn('Curso asignado sin horas disponibles');
      return;
    }

    const dragData = {
      title: `${curso.c_nomcur} (${tipoTexto})`,
      extendedProps: {
        id: curso.id,
        curso_id: curso.curso_id,
        codigo: curso.c_codcur,
        tipo: tipoTexto,
        n_horas: 1,
        h_umaPlus: curso.tipo === 'teoria' ? curso.h_umaPlus ?? 0 : 0,
        grupos_hijo: curso.grupos_hijos ?? [],
      },
    };

    const api = this.calendarComponent?.getApi();
    const base = api?.getDate?.() ?? new Date();
    const weekStart = this.getWeekStart(base);
    const dropDate = new Date(weekStart);
    dropDate.setHours(8, 0, 0, 0);

    this.eventoSeleccionado = null;
    this.cursoSeleccionado = { ...dragData, horasDisponibles: horasDisp };
    this.diaSeleccionado = 'Lunes';
    this.horaInicio = '08:00';
    this.horasAsignadas = 1;
    this.modalidadSeleccionada = null;
    this.aulaSeleccionada = null;
    this.selectedDocente = null;
    this.vacantesAula = null;
    this.modalHorasActivo = true;
  }

  private marcarPersistido(e: any, horarioId?: number) {
    e.setExtendedProp('persisted', true);
    e.setExtendedProp('estado', 'GUARDADO');
    if (horarioId && Number(horarioId) > 0) {
      e.setExtendedProp('horario_id', Number(horarioId));
      e.setExtendedProp('persisted_without_id', false);
    } else {
      e.setExtendedProp('persisted_without_id', true);
    }
  }

  getTipoGrupo(curso: any): number | null {
    // Busca el primer registro de grupo válido
    if (Array.isArray(curso.grupos_hijos) && curso.grupos_hijos.length > 0) {
      const grupo = curso.grupos_hijos.find(
        (g: any) => g.tipo === 0 || g.tipo === 1
      );
      return grupo ? grupo.tipo : null;
    }
    return null;
  }
}
