import { Component, OnInit, ViewChild } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Draggable } from '@fullcalendar/interaction';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { AlertService } from '../../services/alert.service';
import { HorarioService } from '../../services/horario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Curso } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';
import { HorarioExtendido } from '../../interfaces/Horario';
import { Turno } from '../../interfaces/turno';
import { TurnoService } from '../../services/turno.service';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { DocentecurService } from '../../services/docentecur.service';
import { AulaService } from '../../services/aula.service';
import { Docente } from '../../interfaces/Docente';
import { Aula } from '../../interfaces/Aula';
import tippy from 'tippy.js'
import { EstadoTurnoService } from '../../services/estado-turno.service';

@Component({
  selector: 'app-asignar-horario-dr',
  standalone: false,
  templateUrl: './asignar-horario-dr.component.html',
  styleUrl: './asignar-horario-dr.component.css'
})
export class AsignarHorarioDrComponent implements OnInit{
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;
  //#region Variables
  // variables para agregar horas
  modalHorasActivo = false;
  cursoSeleccionado: any = null;
  horasAsignadas: number = 1;
  fechaDrop: Date | null = null;
  //para traer cursos y data
  turnoId!: number;
  turnoData?: Turno;
  cursos: Curso[] = [];
  //idparaeventocruzetem
  ultimoEventoIdTemporal: string | null = null;
  //para el nuvo html-modal
  eventoSeleccionado: any = null;
  aulaSeleccionada: number | null = null;
  docenteSeleccionado: number | null = null;
  diaSeleccionado: string = '';
  horaInicio: string = '';
  aulas: Aula[] = [];
  docentes: Docente[] = [];
  //para separa los cursos por planes
  cursosPlan2023: Curso[] = [];
  cursosPlan2025: Curso[] = [];
  //detruir y contruir calender
  mostrarCalendario: boolean = true;
  //nro vacamtes
  vacantesAula: number | null = null;
  //new evento
  newEvent = { curso: '', h_inicio: '', h_fin: '', color: '' };
  events: any[] = [];
  //select turno
  turnoSeleccionado: 'M' | 'N' | '' = '';
  //carga docente
  nom_facultad: string[] = [];
  selectedFacultad: string = '';

  docentesFiltrados: Docente[] = [];
  selectedDocente: Docente | null = null;
  // para guardar datos temporales
  originalStart: Date | null = null;
  originalEnd: Date | null = null;
  eventoMovido: any = null;
  //paginato calender
  paginaActual: 'calendar' | 'async' = 'calendar'; 
  cursosAsyncDesdeAPI: Curso[] = [];
  //#endregion

  //#region Libreria del calendario
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialDate: '2024-01-01',
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: { left: '', center: '', right: '' },
    buttonText: { today: 'Hoy', week: 'Semana' },
    slotMinTime: '08:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    editable: true,
    eventDurationEditable: false,
    eventResizableFromStart: false,
    selectable: true,
    events: [],
    droppable: false,
    dropAccept: () => false,
    height: 'auto',
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    drop: this.handleExternalDrop.bind(this),
    eventClick: this.onEventClick.bind(this),
    eventDrop: this.onEventDrop.bind(this),
    hiddenDays: [0],
    eventDidMount: this.estilizarEvento.bind(this), // 👈 Importante
  };
  //#endregion;

  constructor(
    private alertService: AlertService,
    private horarioService: HorarioService,
    private cursoService: CursoService,
    private turnoService: TurnoService,
    private route: ActivatedRoute,
    private docenteService: DocentecurService,
    private aulaService: AulaService,
    private router: Router,
    private estadoTurnoService: EstadoTurnoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.turnoId = +params['id'];
      if (this.turnoId) {
        this.cargarDatosPorTurno(this.turnoId);
      }
    });
    this.inicializarDragAndDrop();
    this.cargarHorarios();
    this.cargarAulas();
    this.cargarDocentes();
  }
  //#region metodos

  private cargarAulas(): void {
    this.aulaService.obtenerAulas().subscribe({
      next: (data) => {
        if (data) {
          this.aulas = data;
        } else {
          this.aulas = [];
          console.warn('⚠️ No se recibieron aulas.');
        }
      },
      error: (err) => {
        this.aulas = [];
        console.error('❌ Error cargando aulas', err);
      },
    });
  }

  private cargarDocentes(): void {
    this.docenteService.obtenerDocentes().subscribe((data) => {
      this.docentes = data;

      const nom_facSet = new Set(data.map((d) => d.nom_fac));
      this.nom_facultad = Array.from(nom_facSet);
    });
  }

  private calcularHorasRestantesPorCurso(
    cursos: Curso[],
    horasAsignadas: Record<string, number>
  ): {
    cursos: Curso[];
    cursosPlan2023: Curso[];
    cursosPlan2025: Curso[];
  } {
    const cursosResult: Curso[] = [];
    const plan2023: Curso[] = [];
    const plan2025: Curso[] = [];
  
    cursos.forEach((curso) => {
      const codCur = curso.c_codcur;
      const horasAsignadasCurso = horasAsignadas[codCur] || 0;
  
      // Si HT > 0: aplicar h_umaPlus
      if (curso.n_ht && curso.n_ht > 0) {
        const h_uma = curso.h_umaPlus ?? 0;
        const htReal = curso.n_ht - h_uma;
  
        const horasRestantes = htReal - horasAsignadasCurso;
  
        const cursoTeoria: Curso = {
          ...curso,
          tipo: 'Teoría',
          n_ht: htReal,
          h_umaPlus: h_uma,
          horasRestantes,
        };
  
        cursosResult.push(cursoTeoria);
        if (curso.n_codper === 2023) plan2023.push(cursoTeoria);
        if (curso.n_codper === 2025) plan2025.push(cursoTeoria);
      }
  
      // Si HP > 0: se mantiene igual
      if (curso.n_hp && curso.n_hp > 0) {
        const horasRestantes = curso.n_hp - horasAsignadasCurso;
  
        const cursoPractica: Curso = {
          ...curso,
          tipo: 'Práctica',
          horasRestantes,
        };
  
        cursosResult.push(cursoPractica);
        if (curso.n_codper === 2023) plan2023.push(cursoPractica);
        if (curso.n_codper === 2025) plan2025.push(cursoPractica);
      }
  
      // Si HT = 0 → entonces aseguramos que h_umaPlus también sea 0
      if (!curso.n_ht || curso.n_ht === 0) {
        curso.h_umaPlus = 0;
      }
    });
  
    return {
      cursos: cursosResult,
      cursosPlan2023: plan2023,
      cursosPlan2025: plan2025,
    };
  }
  

  private cargarDatosPorTurno(id: number): void {
    this.turnoService.getTurnoById(id).subscribe((turno) => {
      this.turnoData = turno;

      const dataCursos = {
        c_codfac: turno.c_codfac,
        c_codesp: turno.c_codesp,
        n_ciclo: turno.n_ciclo,
        c_codmod: Number(turno.c_codmod),
        c_grpcur: turno.c_grpcur,
      };

      console.log('AIZ => ', turno.c_grpcur);

      this.cursoService.obtenerCursos(dataCursos).subscribe((resCursos) => {
        this.horarioService
          .getHorarioPorTurno(this.turnoId)
          .subscribe((horarios: HorarioExtendido[]) => {
            const horasAsignadasPorCurso: Record<string, number> = {};

            horarios.forEach((h) => {
              const codCur = h.curso.c_codcur;
              horasAsignadasPorCurso[codCur] =
                (horasAsignadasPorCurso[codCur] || 0) + (h.n_horas || 0);
            });

            const resultado = this.calcularHorasRestantesPorCurso(
              resCursos,
              horasAsignadasPorCurso
            );

            this.cursos = resultado.cursos;
            this.cursosPlan2023 = resultado.cursosPlan2023;
            this.cursosPlan2025 = resultado.cursosPlan2025;
          });
      });
    });
  }

  private recargarCursosSegunTurno(): void {
    if (!this.turnoId) return;
    this.cargarDatosPorTurno(this.turnoId);
  }

  private inicializarDragAndDrop(): void {
    setTimeout(() => {
      const containerEl = document.getElementById('external-events');
      if (containerEl) {
        new Draggable(containerEl, {
          itemSelector: '.fc-event',
          eventData: function (eventEl) {
            const data = eventEl.getAttribute('data-event');
            return data ? JSON.parse(data) : {};
          },
        });
      }
    }, 0);
  }

  private verificaCruceHorario(nuevo: { start: Date; end: Date }): boolean {
    const eventos = this.calendarComponent.getApi().getEvents();

    for (let ev of eventos) {
      // 👇 Ignoramos el evento que estamos editando (si existe)
      if (this.eventoSeleccionado && ev.id === this.eventoSeleccionado.id)
        continue;

      const inicioExistente = new Date(ev.start!);
      const finExistente = new Date(ev.end!);

      const seCruzan =
        nuevo.start < finExistente && nuevo.end > inicioExistente;
      if (seCruzan) return true;
    }

    return false;
  }

  private formatDateTime(date: Date): string {
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  get cursosPlan2023Visibles(): Curso[] {
    return this.cursosPlan2023.filter((c) => (c.horasRestantes || 0) > 0);
  }

  get cursosPlan2023Asignados(): number {
    return this.cursosPlan2023.length - this.cursosPlan2023Visibles.length;
  }

  get cursosPlan2025Visibles(): Curso[] {
    return this.cursosPlan2025.filter((c) => (c.horasRestantes || 0) > 0);
  }

  get cursosPlan2025Asignado(): number {
    return this.cursosPlan2025.length - this.cursosPlan2025Visibles.length;
  }

  //#endregion

  //#region funcion para los eventos y callender
  handleExternalDrop(info: any) {
    const calendarApi = this.calendarComponent.getApi();
  
    // 🧠 Agarramos ID de eventos antes del drop
    const eventosAntes = calendarApi.getEvents().map(ev => ev.id);
  
    const draggedData = JSON.parse(info.draggedEl.getAttribute('data-event'));
    const dropDate = info.date;
    const diaSemana = this.obtenerDiaSemana(dropDate);
    const [hora, minutos] = this.formatDateTime(dropDate).split(':').map(Number);
  
    const start = new Date(dropDate);
    start.setHours(hora, minutos, 0);
  
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 50);
  
    const cruce = this.verificaCruceHorario({ start, end });
  
    // 🛑 Si hay cruce, borramos el evento que FullCalendar ya pintó
    if (cruce) {
      this.alertService.error('⛔ Este curso se cruza con uno ya asignado.');
  
      // ⏳ Eliminamos visualmente cualquier evento nuevo que se haya agregado
      setTimeout(() => {
        const eventosDespues = calendarApi.getEvents();
        const nuevosEventos = eventosDespues.filter(
          (ev) => !eventosAntes.includes(ev.id)
        );
        nuevosEventos.forEach((ev) => ev.remove());
      }, 10);
  
      return;
    }
  
    // ✅ Si no hay cruce, abrir modal de asignar
    const index = this.cursos.findIndex(
      (c) =>
        c.c_codcur === draggedData.extendedProps.codigo &&
        c.tipo === draggedData.extendedProps.tipo
    );
  
    this.eventoSeleccionado = null;
    this.fechaDrop = info.date;
    this.diaSeleccionado = diaSemana;
    this.horaInicio = this.formatDateTime(info.date);
    this.horasAsignadas = 1;
  
    this.cursoSeleccionado = {
      ...draggedData,
      horasDisponibles: this.cursos[index].horasRestantes,
      tipo: draggedData.extendedProps.tipo,
      index: index,
      h_umaPlus: this.cursos[index].h_umaPlus
    };
  
    this.modalHorasActivo = true;
  }
  
  stringifyEvent(curso: any): string {
    return JSON.stringify({
      title: curso.c_nomcur,
      extendedProps: {
        codigo: curso.c_codcur,
        tipo: curso.tipo,
        ht: curso.n_ht,
        hp: curso.n_hp,
      },
    });
  }

  onEventClick(info: any) {
    const evento = info.event;
  
    // 🛡️ Si es curso padre, mostramos confirmación y redirigimos
    if (evento.extendedProps?.esPadre) {
      this.alertService
        .confirm(
          'Este curso es un curso padre. ¿Deseas editarlo? Serás redirigido a la página de edición específica.',
          'Curso Padre'
        )
        .then((confirmado) => {
          if (confirmado) {
            this.router.navigate(['/cursos/', this.turnoId]);
          }
        });
      return; // 🔒 Detenemos el flujo aquí
    }
  
    // Si no es padre, sigue el flujo normal
    this.eventoSeleccionado = evento;
    this.modalHorasActivo = true;
  
    const codigo = evento.extendedProps.codCur;
    const tipo = evento.extendedProps.tipo;
    const curso = this.cursos.find(
      (c) => c.c_codcur === codigo && c.tipo === tipo
    );
  
    // 🧠 Calcular horas restantes excluyendo el evento actual
    let horasAsignadasTotales = 0;
    const eventos = this.calendarComponent.getApi().getEvents();
    eventos.forEach((ev) => {
      if (
        ev.id !== evento.id &&
        ev.extendedProps['codCur'] === codigo &&
        ev.extendedProps['tipo'] === tipo
      ) {
        horasAsignadasTotales += ev.extendedProps['n_horas'] || 0;
      }
    });
  
    const horasTotalesCurso = tipo === 'Teoría' ? curso?.n_ht ?? 0 : curso?.n_hp ?? 0;
    const horasDisponibles = horasTotalesCurso - horasAsignadasTotales;
  
    this.vacantesAula = curso?.vacante ?? null;
  
    this.cursoSeleccionado = {
      ...curso,
      title: evento.title,
      extendedProps: {
        codigo,
        tipo,
      },
      horasDisponibles,
    };
  
    const fecha = new Date(evento.start);
    this.fechaDrop = fecha;
    this.diaSeleccionado = this.obtenerDiaSemana(fecha);
    this.horaInicio = this.formatDateTime(fecha);
    this.horasAsignadas = evento.extendedProps.n_horas || 0;
    this.aulaSeleccionada = evento.extendedProps.aula_id ?? null;
  
    const idDocente = evento.extendedProps.docente_id;
  
    if (idDocente != null) {
      const docente = this.docentes.find((d) => d.id === idDocente);
  
      if (docente) {
        this.selectedDocente = docente;
        this.docenteSeleccionado = docente.id;
        this.selectedFacultad = docente.nom_fac;
        this.filtrarDocentes(); // Esto actualizará docentesFiltrados con la categoría correcta
      } else {
        this.selectedDocente = null;
        this.selectedFacultad = '';
        this.docentesFiltrados = [];
      }
    } else {
      this.selectedDocente = null;
      this.docenteSeleccionado = null;
      this.selectedFacultad = '';
      this.docentesFiltrados = [];
    }
  }
  onEventDrop(info: any): void {
    const evento = info.event;
  
    // 🔁 Restaurar extendedProps desde oldEvent si faltan
    if (!evento.extendedProps.docente_id && info.oldEvent?.extendedProps) {
      console.log('🔁 Recuperando extendedProps perdidos desde oldEvent');
      Object.entries(info.oldEvent.extendedProps).forEach(([key, value]) => {
        evento.setExtendedProp(key, value);
      });
    }
  
    // 🧠 Guardamos la posición original para revertir si se cancela
    this.originalStart = new Date(info.oldEvent.start);
    this.originalEnd = new Date(info.oldEvent.end);
    this.eventoMovido = evento;
  
    const nuevo = {
      start: new Date(evento.start),
      end: new Date(evento.end),
    };
  
    const idEventoActual = evento.id;
  
    const seCruza = this.calendarComponent.getApi().getEvents().some((ev) => {
      if (ev.id === idEventoActual) return false;
      const inicio = new Date(ev.start!);
      const fin = new Date(ev.end!);
      return nuevo.start < fin && nuevo.end > inicio;
    });
  
    if (seCruza) {
      this.alertService.error('⛔ Este curso se cruza con un curso ya asignado.');
      info.revert();
      return;
    }
  
    // ✅ No se cruza: seguimos con el flujo
    this.eventoSeleccionado = evento;
    this.modalHorasActivo = true;
  
    const fecha = new Date(evento.start);
    this.fechaDrop = fecha;
    this.diaSeleccionado = this.obtenerDiaSemana(fecha);
    this.horaInicio = this.formatDateTime(fecha);
    this.horasAsignadas = evento.extendedProps.n_horas || 1;
    this.aulaSeleccionada = evento.extendedProps.aula_id ?? null;
    this.docenteSeleccionado = evento.extendedProps.docente_id ?? null;
  
    const codigo = evento.extendedProps.codCur;
    const tipo = evento.extendedProps.tipo;
    const curso = this.cursos.find((c) => c.c_codcur === codigo && c.tipo === tipo);
  
    // 🧠 Calcular horas restantes excluyendo el evento actual
    let horasAsignadasTotales = 0;
    const eventos = this.calendarComponent.getApi().getEvents();
    eventos.forEach((ev) => {
      if (
        ev.id !== evento.id &&
        ev.extendedProps['codCur'] === codigo &&
        ev.extendedProps['tipo'] === tipo
      ) {
        horasAsignadasTotales += ev.extendedProps['n_horas'] || 0;
      }
    });
  
    const horasTotalesCurso = tipo === 'Teoría' ? curso?.n_ht ?? 0 : curso?.n_hp ?? 0;
    const horasDisponibles = horasTotalesCurso - horasAsignadasTotales;
  
    this.cursoSeleccionado = {
      ...curso,
      title: evento.title,
      extendedProps: {
        codigo,
        tipo,
      },
      horasDisponibles,
    };
  
    // 🧩 Restaurar información del docente si existe
    const idDocente = evento.extendedProps.docente_id;
    console.log('👨‍🏫 ID del docente leído del evento:', idDocente);
  
    if (idDocente != null) {
      const docente = this.docentes.find((d) => d.id === idDocente);
      console.log('📚 Docente encontrado:', docente);
  
      if (docente) {
        this.selectedDocente = docente;
        this.docenteSeleccionado = docente.id;
        this.selectedFacultad = docente.nom_fac;
        this.filtrarDocentes();
      } else {
        console.warn('⚠️ Docente con ese ID no encontrado en la lista.');
        this.selectedDocente = null;
        this.docenteSeleccionado = null;
        this.selectedFacultad = '';
        this.docentesFiltrados = [];
      }
    } else {
      console.warn('❌ No hay docente_id en el evento.');
      this.selectedDocente = null;
      this.docenteSeleccionado = null;
      this.selectedFacultad = '';
      this.docentesFiltrados = [];
    }
  }
  
  actualizarRangoPorTurno() {
    if (this.turnoSeleccionado === 'M') {
      this.calendarOptions.slotMinTime = '08:00:00';
      this.calendarOptions.slotMaxTime = '18:00:00';
    } else if (this.turnoSeleccionado === 'N') {
      this.calendarOptions.slotMinTime = '18:00:00';
      this.calendarOptions.slotMaxTime = '23:00:00';
    }

    // 🔄 Forzar redibujado del calendario
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.setOption('slotMinTime', this.calendarOptions.slotMinTime);
    calendarApi.setOption('slotMaxTime', this.calendarOptions.slotMaxTime);
  }

  estilizarEvento(info: any): void {
    const isTemporal =
      info.event.id.toString().startsWith('temp-') ||
      info.event.extendedProps?.isNew;
    const esPadre = info.event.extendedProps?.esPadre;

    // 🏷️ Badge de estado
    const badge = document.createElement('span');
    badge.textContent = isTemporal ? 'Temporal' : 'Guardado';
    badge.className = `
      absolute top-1 right-1 
      text-[10px] text-white px-2 py-[2px] rounded 
      ${isTemporal ? 'bg-pink-400' : 'bg-sky-400'}
    `;

    // 🔒 Candado para cursos padres
    if (esPadre) {
      const candado = document.createElement('i');
      candado.className = `
        fa-solid fa-lock 
        absolute bottom-1 right-1 
        text-gray-700 text-[25px] 
        pointer-events-none
      `;
      candado.title = 'Curso padre bloqueado';
      info.el.appendChild(candado);

      info.el.appendChild(candado);
    }
    info.el.classList.add('relative');
    info.el.appendChild(badge);

    const aula = info.event.extendedProps.aula_id;
    const docente = info.event.extendedProps.docente_id;

    let tooltipText = '';

    if (aula && docente) {
      tooltipText = '✅ Aula y Docente asignados';
    } else if (!aula && docente) {
      tooltipText = '⚠️ Falta asignar aula';
    } else if (aula && !docente) {
      tooltipText = '⚠️ Falta asignar docente';
    } else {
      tooltipText = '⚠️ Falta asignar aula y docente';
    }

    // info.el.setAttribute('title', tooltipText)
    tippy(info.el, {
      content: tooltipText,
      theme: 'light-border',
      animation: 'fade',
      arrow: true,
      delay: [50 , 100],
    });    
  }

  //#endregion

  confirmarAsignacionHoras() {
    console.log('confirmarAsignacionHoras');

    if (!this.fechaDrop || !this.horaInicio) return;

    // ✅ VALIDACIÓN DE HORAS
    const maxHoras = this.cursoSeleccionado?.horasDisponibles || 0;
    if (this.horasAsignadas > maxHoras) {
      this.alertService.error(
        `❌ No puedes asignar más de ${maxHoras} hora(s) a este curso.`
      );
      return;
    }

    if (this.horasAsignadas < 1) {
      this.alertService.error(`❌ Debes asignar al menos 1 hora.`);
      return;
    }

    if (this.selectedDocente) {
      this.selectedDocente.h_total = this.horasAsignadas;
    }

    const diaAFecha: Record<string, number> = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };

    const base = new Date(this.fechaDrop);
    base.setDate(base.getDate() - base.getDay()); // ir al domingo
    const diaNumero = diaAFecha[this.diaSeleccionado];
    const [hora, minutos] = this.horaInicio.split(':').map(Number);

    const start = new Date(base);
    start.setDate(base.getDate() + diaNumero);
    start.setHours(hora, minutos, 0);

    const end = new Date(start);
    end.setMinutes(start.getMinutes() + this.horasAsignadas * 50);

    const eventoId = `temp-${Date.now()}`;
    this.ultimoEventoIdTemporal = eventoId;

    if (this.verificaCruceHorario({ start, end })) {
      this.alertService.error('❌ Este curso se cruza con uno ya asignado');
      this.modalHorasActivo = false;
      // this.cancelarAsignacionHoras();
      return;
    }

    const cursoBase = this.cursoSeleccionado;

    const evento = {
      id: eventoId,
      title: `${this.cursoSeleccionado.title} (${this.cursoSeleccionado.tipo})`,
      start: start,
      end: end,
      backgroundColor:
        this.cursoSeleccionado.tipo === 'Teoría' ? '#3788d8' : '#28a745',
      extendedProps: {
        codCur: this.cursoSeleccionado.extendedProps.codigo,
        tipo: this.cursoSeleccionado.extendedProps.tipo,
        isNew: true,
        n_horas: this.horasAsignadas, // 👈🔥 ESTO ES CLAVE
        aula_id: this.aulaSeleccionada ?? null,
        docente_id: this.selectedDocente?.id ?? null,
        h_umaPlus: this.cursoSeleccionado.h_umaPlus ?? 0
      },
    };

    this.calendarOptions.events = [
      ...(this.calendarOptions.events as any[]),
      evento,
    ];

    const codigo = this.cursoSeleccionado.extendedProps.codigo;
    const tipo = this.cursoSeleccionado.extendedProps.tipo;

    const actualizarLista = (lista: Curso[]) => {
      const index = lista.findIndex(
        (c) => c.c_codcur === codigo && c.tipo === tipo
      );
      if (index !== -1) {
        lista[index].horasRestantes =
          (lista[index].horasRestantes || 0) - this.horasAsignadas;
        if (lista[index].horasRestantes <= 0) {
        }
      }
    };

    actualizarLista(this.cursosPlan2023);
    actualizarLista(this.cursosPlan2025);

    // ✅ Deshabilitar curso equivalente del otro plan
    const codEquivalente = this.cursosPlan2025.find(
      (c) => c.c_codcur === this.cursoSeleccionado.extendedProps.codigo
    )?.c_codcur_equ;

    if (codEquivalente) {
      const index = this.cursosPlan2023.findIndex(
        (c) => c.c_codcur === codEquivalente
      );
      if (index !== -1) {
        this.cursosPlan2023[index].disabled = true;
      }
    }

    this.resetCamposModal();

    // 🧹 Limpieza final
    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
    this.fechaDrop = null;
    this.ultimoEventoIdTemporal = null;
    this.horaInicio = '';
    this.diaSeleccionado = '';
    this.vacantesAula = null;

    // 👇 Esto es lo nuevo: limpiamos campos seleccionados también
    this.aulaSeleccionada = null;
    this.docenteSeleccionado = null;
    this.selectedDocente = null;
    this.selectedFacultad = '';
    this.docentesFiltrados = [];
  }

  //#region Listar, Guardar y Editar eventos
  obtenerDiaSemana(fecha: Date): string {
    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return dias[new Date(fecha).getDay()];
  }

  guardarEventos(): void {
    if (!this.turnoId) return;

    const eventos = this.calendarComponent
      .getApi()
      .getEvents()
      .filter(
        (ev) => ev.extendedProps?.['codCur'] && ev.extendedProps?.['isNew']
      );

    // Paso 1: Armar horarios con datos mínimos + agrupador codCur
    const horarios = eventos.map((ev) => {
      const inicio = new Date(ev.start!);
      const fin = new Date(inicio);
      const horasEvento = ev.extendedProps['n_horas'] ?? 1;
      fin.setMinutes(fin.getMinutes() + horasEvento * 50);
      const minutos = Math.round(
        (fin.getTime() - inicio.getTime()) / (1000 * 60)
      );
      const horas = minutos / 50;

      return {
        c_codcur: ev.extendedProps['codCur'], // Para agrupar luego
        horario: {
          dia: this.obtenerDiaSemana(inicio),
          h_inicio: inicio.toISOString(),
          h_fin: fin.toISOString(),
          n_horas: horas,
          c_color: ev.backgroundColor || '#3788d8',
          aula_id: Number(ev.extendedProps['aula_id']),
          docente_id: Number(ev.extendedProps['docente_id']),
          // docente_id: Number(ev.extendedProps['docente_id']),
          h_total: horas,
          turno_id: this.turnoId,
          tipo: ev.extendedProps['tipo'] ?? 'Teoria',
          h_umaPlus: ev.extendedProps['h_umaPlus'] ?? 0 // 👈 este es el nuevo campo
        },
      };
    });

    // Paso 2: Agrupar por curso
    const cursosUnicos = [...new Set(horarios.map((h) => h.c_codcur))];
    const dataArray = cursosUnicos.map((codCur) => {
      const curso = this.cursos.find((c) => c.c_codcur === codCur);
      const horariosDelCurso = horarios
        .filter((h) => h.c_codcur === codCur)
        .map((h) => h.horario);

      return {
        curso: {
          n_codper: String(curso?.n_codper || ''),
          c_codmod: Number(curso?.c_codmod) || 0,
          c_codfac: curso?.c_codfac || '',
          c_codesp: curso?.c_codesp || '',
          c_codcur: curso?.c_codcur || '',
          c_nomcur: curso?.c_nomcur || '',
          n_ciclo: Number(curso?.n_ciclo) || 0,
          c_area: curso?.c_area || '',
          turno_id: this.turnoId,
          n_codper_equ:
            curso?.n_codper_equ != null ? String(curso.n_codper_equ) : null,
          c_codmod_equ:
            curso?.c_codmod_equ != null ? Number(curso?.c_codmod_equ) : null,
          c_codfac_equ: curso?.c_codfac_equ ?? null,
          c_codesp_equ: curso?.c_codesp_equ ?? null,
          c_codcur_equ: curso?.c_codcur_equ ?? null,
          c_nomcur_equ: curso?.c_nomcur_equ ?? null,
        },
        horarios: horariosDelCurso,
      };
    });

    const payload = {
      dataArray: dataArray,
      verificar: true,
    };

    this.horarioService.guardarHorarios(payload).subscribe({
      next: (res) => {
        if (res.success === false && res.errores?.length > 0) {
          const errores = res.errores as string[];
          const erroresHtml = errores.map((err) => `<li>${err}</li>`).join('');
          this.alertService.confirmConConflictos(erroresHtml); // solo muestra
          return;
        }

        // Guardado correcto
        const mensaje = res.mensaje || '✅ Horarios guardados correctamente.';
        this.alertService.success(mensaje);
        this.cargarHorarios();
        this.cargarDocentes();
      },
      error: (err) => {
        this.alertService.error('❌ Error al guardar horarios.');
        console.error(err);
      },
    });
    console.log('📝 Data enviada al backend:', payload);
  }

  cargarHorarios(): void {
    if (!this.turnoId) return;

    this.horarioService
      .getHorarioPorTurno(this.turnoId)
      .subscribe((res: HorarioExtendido[]) => {
        // 🟢 1. Mapeo de eventos normales para el calendario
        const eventos = res
          .filter((h) => h.h_inicio && h.h_fin && h.dia) // solo los que tienen fechas
          .map((h: HorarioExtendido) => {
            const curso = h.curso;
            const tipoEvento = h.tipo ?? 'Teoría';

            let color = '#3788d8';
            let tipoAgrupado = null;

            if (curso?.cursosPadres!.length > 0) {
              const padre = curso.cursosPadres![0];
              tipoAgrupado = padre.tipo;

              if (padre.tipo === 0) {
                color = '#EAB308';
              } else if (padre.tipo === 1) {
                color = '#7E22CE';
              }
            }

            return {
              id: String(h.id),
              title: `${curso.c_nomcur} (${tipoEvento})`,
              start: h.h_inicio,
              end: h.h_fin,
              backgroundColor: color,
              borderColor: color,
              extendedProps: {
                codCur: curso.c_codcur,
                turno: h.turno_id,
                dia: h.dia,
                tipo: tipoEvento,
                n_horas: h.n_horas,
                aula_id: h.aula_id,
                docente_id: h.docente_id,
                tipoAgrupado: tipoAgrupado,
              },
              durationEditable: false,
            };
          });

        // 🔄 2. Cargar eventos en el calendario (como ya lo hacías)
        this.mostrarCalendario = false;
        setTimeout(() => {
          this.calendarOptions.events = eventos;
          this.mostrarCalendario = true;
        }, 10);

        // ✨ 3. EXTRA: Detectar cursos asíncronos desde la misma respuesta
        this.cursosAsyncDesdeAPI = res
        .filter((h) => h.h_inicio === null && h.h_fin === null && h.dia === null)
        .map((h) => {
          const curso = h.curso;
          return {
            n_codper: +curso.n_codper,
            c_codmod: curso.c_codmod?.toString(),
            c_nommod: this.turnoData?.c_nommod || '',
            c_codfac: curso.c_codfac,
            c_codesp: curso.c_codesp,
            c_area: curso.c_area,
            n_ciclo: curso.n_ciclo?.toString(),
            c_ciclo: curso.n_ciclo?.toString(),
            c_codcur: curso.c_codcur,
            c_nomcur: curso.c_nomcur,
            // Omitimos n_ht y n_hp si no están
            tipo: h.tipo,
            horasRestantes: h.n_horas,
            turno_id: curso.turno_id,
            h_umaPlus: h.h_umaPlus ?? 0,    
            guardadoAsync: true,
      
            n_codper_equ: curso.n_codper_equ ? +curso.n_codper_equ : undefined,
            c_codmod_equ: curso.c_codmod_equ,
            c_codfac_equ: curso.c_codfac_equ,
            c_codesp_equ: curso.c_codesp_equ,
            c_codcur_equ: curso.c_codcur_equ,
            c_nomcur_equ: curso.c_nomcur_equ,
            disabled: false
          } as Curso;
        });
      });
  }

  //#region metodos para en eliminar y actulizar
  private actualizarHorasRestantes(
    codigo: string,
    tipo: string,
    diferencia: number
  ) {
    const procesados = new Set(); // ⛔ evita aplicar varias veces

    const listas = [this.cursos, this.cursosPlan2023, this.cursosPlan2025];

    listas.forEach((lista) => {
      const index = lista.findIndex(
        (c) => c.c_codcur === codigo && c.tipo === tipo
      );

      if (index !== -1 && !procesados.has(lista[index])) {
        const curso = lista[index];
        procesados.add(curso);

        const antes = curso.horasRestantes ?? 0;
        curso.horasRestantes = antes - diferencia;

        console.log('📘 Curso:', codigo, '-', tipo);
        console.log('Horas antes:', antes);
        console.log('Diferencia aplicada:', diferencia);
        console.log('Horas después:', curso.horasRestantes);

        if (curso.horasRestantes <= 0) {
          curso.disabled = true;
          console.log('🚫 Curso ocultado por horas 0');
        }
      }
    });
  }

  private devolverCursoEliminado(
    codigo: string,
    tipo: string,
    horas: number,
    titulo: string
  ) {
    const existe = this.cursos.find(
      (c) => c.c_codcur === codigo && c.tipo === tipo
    );

    if (existe) {
      existe.horasRestantes = (existe.horasRestantes ?? 0) + horas;
      this.cursos = [...this.cursos]; // trigger visual
      return;
    }

    const turno = this.turnoData;
    if (!turno) return;

    const nuevoCurso: Curso = {
      c_codcur: codigo,
      c_nomcur: titulo,
      c_nommod: turno.c_nommod,
      c_codmod: turno.c_codmod,
      c_codfac: turno.c_codfac,
      c_codesp: turno.c_codesp,
      n_codper: turno.n_codper,
      n_ciclo: turno.n_ciclo.toString(),
      c_ciclo: turno.n_ciclo.toString(),
      tipo,
      horasRestantes: horas,
    };

    this.cursos = [...this.cursos, nuevoCurso];

    if (turno.n_codper === 2023) {
      this.cursosPlan2023 = [...this.cursosPlan2023, nuevoCurso];
    }

    if (turno.n_codper === 2025) {
      this.cursosPlan2025 = [...this.cursosPlan2025, nuevoCurso];
    }
  }

  private validarYCalcularFechas(): { base: Date; fin: Date } | null {
    const [hora, minutos] = this.horaInicio.split(':').map(Number);
    const diaAFecha: Record<string, number> = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };

    const base = new Date(this.fechaDrop!);
    base.setDate(base.getDate() - base.getDay()); // ir al domingo
    const diaNumero = diaAFecha[this.diaSeleccionado];
    base.setDate(base.getDate() + diaNumero);
    base.setHours(hora, minutos, 0);

    const fin = new Date(base);
    fin.setMinutes(base.getMinutes() + this.horasAsignadas * 50); // ⏱️ 1 hora = 50 min

    const nuevoHorario = { start: base, end: fin };

    if (this.verificaCruceHorario(nuevoHorario)) {
      this.alertService.error(
        '⛔ Este curso se cruza con un curso ya asignado.'
      );
      return null;
    }

    return { base, fin };
  }

  private actualizarEventoTemporal(
    base: Date,
    fin: Date,
    codigo: string,
    tipo: string,
    idEvento: string,
    diferencia: number
  ) {
    this.eventoSeleccionado?.setStart(base);
    this.eventoSeleccionado?.setEnd(fin);
    this.eventoSeleccionado?.setExtendedProp('n_horas', this.horasAsignadas);
    this.eventoSeleccionado?.setExtendedProp('dia', this.diaSeleccionado);
    this.eventoSeleccionado?.setExtendedProp('aula_id', this.aulaSeleccionada);
    const docenteId = this.selectedDocente?.id ?? null;
    this.eventoSeleccionado?.setExtendedProp('docente_id', docenteId);
    this.eventoSeleccionado?.setExtendedProp('isNew', true);
    this.actualizarHorasRestantes(codigo, tipo, diferencia);

    const eventosActuales = (this.calendarOptions.events as any[]).map((ev) => {
      if (ev.id === idEvento) {
        return {
          ...ev,
          start: base,
          end: fin,
          extendedProps: {
            ...ev.extendedProps,
            n_horas: this.horasAsignadas,
            dia: this.diaSeleccionado,
            aula_id: this.aulaSeleccionada,
            docente_id: docenteId,
            isNew: true,
          },
        };
      }
      return ev;
    });
    this.calendarOptions.events = eventosActuales;
  }

  //#endregion

  actualizarEvento() {
    console.log('🧪 actualizandoEvento llamado');
    if (!this.eventoSeleccionado) return;
  
    const idEvento = this.eventoSeleccionado.id;
    const codigo = this.eventoSeleccionado.extendedProps.codCur;
    const tipo = this.eventoSeleccionado.extendedProps.tipo;
    const horasAntes = this.eventoSeleccionado.extendedProps.n_horas ?? 0;
  
    const curso = this.cursos.find(c => c.c_codcur === codigo && c.tipo === tipo);
    const totalHorasPermitidas = tipo === 'Teoría' ? curso?.n_ht ?? 0 : curso?.n_hp ?? 0;
  
    // 🧮 Calcular total de horas ya asignadas (excepto el evento actual)
    const eventos = this.calendarComponent.getApi().getEvents();
    const horasAsignadas = eventos.reduce((suma, ev) => {
      const mismoCurso = ev.extendedProps['codCur'] === codigo && ev.extendedProps['tipo'] === tipo;
      const noEsActual = ev.id !== idEvento;
      return mismoCurso && noEsActual ? suma + (ev.extendedProps['n_horas'] ?? 0) : suma;
    }, 0);
  
    const horasDisponibles = totalHorasPermitidas - horasAsignadas;
  
    if (this.horasAsignadas > horasDisponibles || this.horasAsignadas < 1) {
      const msg =
        this.horasAsignadas < 1
          ? '❌ Debes asignar al menos 1 hora.'
          : `❌ No puedes asignar más de ${horasDisponibles} hora(s) restantes para este curso.`;
      this.alertService.error(msg);
      return;
    }
  
    const result = this.validarYCalcularFechas();
    if (!result) return;
  
    const { base, fin } = result;
    const diferencia = this.horasAsignadas - horasAntes;
    const esTemporal = idEvento.toString().startsWith('temp-');
  
    if (esTemporal) {
      this.actualizarEventoTemporal(base, fin, codigo, tipo, idEvento, diferencia);
      this.alertService.success('📝 Evento temporal actualizado.');
      this.modalHorasActivo = false;
      this.eventoSeleccionado = null;
      return;
    }
  
    const eventosDelCurso: EventApi[] = eventos.filter(
      (ev: EventApi) =>
        ev.extendedProps['codCur'] === codigo &&
        ev.extendedProps['tipo'] === tipo
    );
  
    const horarios = eventosDelCurso.map((ev) => {
      const isEdited = ev.id === idEvento;
  
      const h_inicio = isEdited
        ? base?.toISOString() || ''
        : ev.start?.toISOString() || '';
  
      const h_fin = isEdited
        ? fin?.toISOString() || ''
        : ev.end?.toISOString() || '';
  
      return {
        id: Number(ev.id),
        dia: isEdited ? this.diaSeleccionado : ev.extendedProps['dia'],
        h_inicio,
        h_fin,
        n_horas: isEdited ? this.horasAsignadas : ev.extendedProps['n_horas'],
        c_color: ev.backgroundColor || '#3788d8',
        aula_id: isEdited
          ? this.aulaSeleccionada ?? null
          : ev.extendedProps['aula_id'] ?? null,
        docente_id: isEdited
          ? this.selectedDocente?.id ?? null
          : ev.extendedProps['docente_id'] ?? null,
        turno_id: this.turnoId,
      };
    });
  
    const payload = {
      verificar: true,
      dataArray: [
        {
          curso: {
            n_codper: String(curso?.n_codper || ''),
            c_codmod: Number(curso?.c_codmod) || 0,
            c_codfac: curso?.c_codfac || '',
            c_codesp: curso?.c_codesp || '',
            c_codcur: curso?.c_codcur || '',
            c_nomcur: curso?.c_nomcur || '',
            n_ciclo: Number(curso?.n_ciclo) || 0,
            c_area: curso?.c_area || '',
            turno_id: this.turnoId,
            tipo: tipo ?? 'Teoría',
            n_codper_equ: curso?.n_codper_equ != null ? String(curso.n_codper_equ) : null,
            c_codmod_equ: curso?.c_codmod_equ != null ? Number(curso.c_codmod_equ) : null,
            c_codfac_equ: curso?.c_codfac_equ ?? null,
            c_codesp_equ: curso?.c_codesp_equ ?? null,
            c_codcur_equ: curso?.c_codcur_equ ?? null,
            c_nomcur_equ: curso?.c_nomcur_equ ?? null,
          },
          horarios,
        },
      ],
    };
  
    this.horarioService.updateHorarios(payload).subscribe({
      next: (res) => {
        if (res.success === false && res.errores?.length > 0) {
          const erroresHtml = res.errores.map((err: any) => `<li>${err}</li>`).join('');
          this.alertService.confirmConConflictos(erroresHtml);
          return;
        }
        this.procesarActualizacionExitosa(base, fin, codigo, tipo, diferencia);
      },
      error: (err) => {
        this.alertService.error('❌ Error al actualizar el evento.');
        console.error(err);
      },
    });
  }  

  procesarActualizacionExitosa(
    base: Date,
    fin: Date,
    codigo: string,
    tipo: string,
    diferencia: number
  ): void {
    console.log('🟢 Solo aquí debe ir la actualización de horas restantes');
    this.actualizarHorasRestantes(codigo, tipo, diferencia);
    this.eventoSeleccionado?.setStart(base);
    this.eventoSeleccionado?.setEnd(fin);
    this.eventoSeleccionado?.setExtendedProp('n_horas', this.horasAsignadas);
    this.eventoSeleccionado?.setExtendedProp('dia', this.diaSeleccionado);
    this.eventoSeleccionado?.setExtendedProp('aula_id', this.aulaSeleccionada);
    this.eventoSeleccionado?.setExtendedProp(
      'docente_id',
      this.docenteSeleccionado
    );

    this.alertService.success('✅ Evento actualizado correctamente.');
    this.modalHorasActivo = false;
    this.eventoSeleccionado = null;
    this.cargarHorarios();
    this.cargarDocentes();
    this.resetCamposModal();
  }

  eliminarEvento(): void {
    if (!this.eventoSeleccionado) return;

    const id = this.eventoSeleccionado.id.toString();
    const codigo = this.eventoSeleccionado.extendedProps.codCur;
    const tipo = this.eventoSeleccionado.extendedProps.tipo;
    const horas = this.eventoSeleccionado.extendedProps.n_horas ?? 1;
    const titulo = this.eventoSeleccionado.title;

    this.alertService
      .confirm(
        '¿Estás seguro de que deseas eliminar este horario?',
        'Eliminar horario'
      )
      .then((isConfirmed) => {
        if (!isConfirmed) return;

        const calendarApi = this.calendarComponent.getApi();
        const evento = calendarApi.getEventById(id);
        if (evento) evento.remove();

        this.calendarOptions.events = (
          this.calendarOptions.events as any[]
        ).filter((ev) => ev.id !== id);

        if (!id.startsWith('temp-')) {
          this.horarioService
            .deleteHorarios({ horarios_id: [Number(id)] })
            .subscribe({
              next: () => {
                this.alertService.success('🗑️ Evento eliminado correctamente.');
                this.recargarCursosSegunTurno();
                this.cargarDocentes();
              },
              error: (err) => {
                this.alertService.error('❌ Error al eliminar el evento.');
                console.error(err);
              },
            });
        } else {
          this.devolverCursoEliminado(codigo, tipo, horas, titulo);
        }

        this.modalHorasActivo = false;
        this.eventoSeleccionado = null;
        this.resetCamposModal();
      });
  }

  eliminarTodosLosHorarios(): void {
    this.alertService
      .confirm(
        '¿Estás seguro de eliminar todos los horarios? Esta acción no se puede deshacer.',
        'Eliminar horarios'
      )
      .then((isConfirmed) => {
        if (!isConfirmed) return;

        const ids: number[] = this.calendarComponent
          .getApi()
          .getEvents()
          .filter((ev) => !ev.id.toString().startsWith('temp-')) // solo persistentes
          .map((ev) => Number(ev.id));

        if (ids.length === 0) {
          this.alertService.info('No hay horarios guardados para eliminar.');
          return;
        }

        this.horarioService.deleteHorarios({ horarios_id: ids }).subscribe({
          next: () => {
            this.alertService.success(
              'Todos los horarios fueron eliminados correctamente.'
            );
            this.cargarHorarios();
            this.cargarDatosPorTurno(this.turnoId);
            this.cargarDocentes();
          },
          error: (err) => {
            this.alertService.error(
              'Ocurrió un error al eliminar los horarios.'
            );
            console.error(err);
          },
        });
      });
  }

  filtrarDocentes(): void {
    this.docentesFiltrados = this.docentes.filter(
      (d) => d.nom_fac === this.selectedFacultad
    );
  
    // Si el docente seleccionado actual no pertenece a la nueva facultad, se limpia
    if (
      this.selectedDocente &&
      !this.docentesFiltrados.some((d) => d.id === this.selectedDocente?.id)
    ) {
      this.selectedDocente = null;
    }
  }
  

  cancelarEdicion(): void {
    console.log('⛔ CANCELANDO EDICIÓN');
  
    if (this.eventoMovido && this.originalStart && this.originalEnd) {
      console.log('↩️ Revirtiendo evento a su posición original');
      this.eventoMovido.setDates(this.originalStart, this.originalEnd); // 💥 usa setDates()
    }else {
      console.warn('⚠️ No hay evento movido o fechas originales');
    }
  
    // Limpieza
    this.originalStart = null;
    this.originalEnd = null;
    this.eventoMovido = null;
  
    this.modalHorasActivo = false;
    this.eventoSeleccionado = null;
    this.cursoSeleccionado = null;
    this.fechaDrop = null;
    this.horaInicio = '';
    this.diaSeleccionado = '';
    this.resetCamposModal();
  }

  private resetCamposModal(): void {
    this.selectedDocente = null;
    this.selectedFacultad = '';
    this.docentesFiltrados = [];
    this.aulaSeleccionada = null;
    this.horasAsignadas = 1;
  }
  
  cambiarEstadoSelect(event: Event) {
    const nuevoEstado = +(event.target as HTMLSelectElement).value;
  
    this.turnoService.actualizarEstado(this.turnoData!.id, nuevoEstado).subscribe(() => {
      this.turnoData!.estado = nuevoEstado;
      this.turnoService.emitirCambioEstado(this.turnoData!.id);
  
      // Mostrar alerta personalizada según el estado
      switch (nuevoEstado) {
        case 2:
          this.alertService.success('El turno ha sido marcado como asignado.', '✅ Turno asignado');
          break;
        case 1:
          this.alertService.info('Este turno se ha marcado como pendiente.');
          break;
        case 0:
          this.alertService.error('Este turno no ha sido asignado aún.', '🛑 No asignado');
          break;
      }
    });
  }
  
  stringifyCursoAsync(curso: any): string {
    return JSON.stringify({
      n_codper: String(curso.n_codper),
      c_codmod: String(curso.c_codmod),
      c_codfac: curso.c_codfac,
      c_codesp: curso.c_codesp,
      c_codcur: curso.c_codcur,
      c_nomcur: curso.c_nomcur,
      n_ciclo: Number(curso.n_ciclo),
      c_area: curso.c_area,
      n_codper_equ: String(curso.n_codper_equ),
      c_codmod_equ: String(curso.c_codmod_equ),
      c_codfac_equ: curso.c_codfac_equ,
      c_codesp_equ: curso.c_codesp_equ,
      c_codcur_equ: curso.c_codcur_equ,
      c_nomcur_equ: curso.c_nomcur_equ,
      turno_id: curso.turno_id ?? this.turnoId,
      tipo: curso.tipo,
      horasRestantes: Number(curso.horasRestantes ?? 1)
    });
  }
  
  
  onDragStartAsync(event: DragEvent) {
    const element = event.target as HTMLElement;
    const data = element.getAttribute('data-curso');
    if (data) {
      event.dataTransfer?.setData('text/plain', data);
    }
  }
  
  allowDrop(event: DragEvent) {
    event.preventDefault(); // Permite soltar
  }

  mostrarPlan2023: boolean = true;
  mostrarPlan2025: boolean = true;
  
  handleAsyncDrop(event: DragEvent) {
    event.preventDefault();
  
    const data = event.dataTransfer?.getData('text/plain');
    if (!data) return;
  
    const curso = JSON.parse(data);
  
    this.alertService.confirm(
      `¿Deseas registrar el curso ${curso.c_nomcur} como curso asíncrono?`,
      ''
    ).then((confirmado) => {
      if (!confirmado) return;
  
      const payload = {
        curso: {
          n_codper: String(curso.n_codper),
          c_codmod: Number(curso.c_codmod),
          c_codfac: curso.c_codfac,
          c_codesp: curso.c_codesp,
          c_codcur: curso.c_codcur,
          c_nomcur: curso.c_nomcur,
          n_ciclo: Number(curso.n_ciclo),
          c_area: curso.c_area,
          n_codper_equ: String(curso.n_codper_equ),
          c_codmod_equ: Number(curso.c_codmod_equ),
          c_codfac_equ: curso.c_codfac_equ,
          c_codesp_equ: curso.c_codesp_equ,
          c_codcur_equ: curso.c_codcur_equ,
          c_nomcur_equ: curso.c_nomcur_equ,
          turno_id: Number(curso.turno_id),
        },
        horario: {
          n_horas: Number(curso.horasRestantes ?? 1),
          tipo: curso.tipo,
          turno_id: Number(curso.turno_id),
        }
      };
  
      console.log('📤 Payload Async listo:', payload);
  
      this.horarioService.guardarHorarioAsync(payload).subscribe({
        next: (res) => {
          this.alertService.success(res.mensaje || '✅ Registrado correctamente');
          this.cargarDatosPorTurno(this.turnoId);
          
          // 🔄 Buscar y marcar curso como guardado
          const index = this.cursosPlan2025.findIndex(c => c.c_codcur === curso.c_codcur && c.tipo === curso.tipo);
          if (index !== -1) {
            this.cursosPlan2025[index].guardadoAsync = true;
            this.cargarHorarios()
          }
        },
        error: (err) => {
          this.alertService.error('⛔ Error al guardar');
          console.error(err);
        }
      });
    });
  }
  
  get cursosPlan2023Async(): Curso[] {
    return this.cursosAsyncDesdeAPI.filter(c => +c.n_codper === 2023);
  }
  
  get cursosPlan2025Async(): Curso[] {
    return this.cursosAsyncDesdeAPI.filter(c => +c.n_codper === 2025);
  }
}
