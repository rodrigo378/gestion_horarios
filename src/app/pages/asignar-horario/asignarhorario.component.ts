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
@Component({
  selector: 'app-asignarhorario',
  standalone: false,
  templateUrl: './asignarhorario.component.html',
  styleUrl: './asignarhorario.component.css',
})
export class AsignarhorarioComponent implements OnInit {
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
  selectedCategoria: string = '';
  categorias: String[] = [];

  docentesFiltrados: Docente[] = [];
  selectedDocente: Docente | null = null;
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
    private router: Router
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
          console.log('🏫 AULAS:', data);
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
      console.log('📚 DOCENTES:', data);
      this.docentes = data;

      const categoriaSet = new Set(data.map((d) => d.categoria));
      this.categorias = Array.from(categoriaSet);
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
      const horasAsignadasCurso = horasAsignadas[curso.c_codcur] || 0;

      if (curso.n_ht && curso.n_ht > 0) {
        const horasRestantes = curso.n_ht - horasAsignadasCurso;
        const cursoTeoria: Curso = {
          ...curso,
          tipo: 'Teoría',
          horasRestantes,
        };
        cursosResult.push(cursoTeoria);
        if (curso.n_codper === 2023) plan2023.push(cursoTeoria);
        if (curso.n_codper === 2025) plan2025.push(cursoTeoria);
      }

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
    const draggedData = JSON.parse(info.draggedEl.getAttribute('data-event'));
    const index = this.cursos.findIndex(
      (c) =>
        c.c_codcur === draggedData.extendedProps.codigo &&
        c.tipo === draggedData.extendedProps.tipo
    );

    this.eventoSeleccionado = null;

    this.cursoSeleccionado = {
      ...draggedData,
      horasDisponibles: this.cursos[index].horasRestantes,
      tipo: draggedData.extendedProps.tipo,
      index: index,
    };
    this.fechaDrop = info.date;
    if (this.fechaDrop) {
      this.diaSeleccionado = this.obtenerDiaSemana(this.fechaDrop);
      this.horaInicio = this.formatDateTime(this.fechaDrop);
    }
    this.horasAsignadas = 1;
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

  // onEventClick(info: any) {
  //   const evento = info.event;

  //   // 🛡️ Si es curso padre, mostramos confirmación y redirigimos
  //   if (evento.extendedProps?.esPadre) {
  //     this.alertService
  //       .confirm(
  //         'Este curso es un curso padre. ¿Deseas editarlo? Serás redirigido a la página de edición específica.',
  //         'Curso Padre'
  //       )
  //       .then((confirmado) => {
  //         if (confirmado) {
  //           this.router.navigate(['/cursos/', this.turnoId]);
  //         }
  //       });
  //     return; // 🔒 Detenemos el flujo aquí
  //   }

  //   // Si no es padre, sigue el flujo normal
  //   this.eventoSeleccionado = evento;
  //   this.modalHorasActivo = true;

  //   const codigo = evento.extendedProps.codCur;
  //   const tipo = evento.extendedProps.tipo;
  //   const curso = this.cursos.find(
  //     (c) => c.c_codcur === codigo && c.tipo === tipo
  //   );

  //   let horasMaximas = 0;
  //   if (curso) {
  //     horasMaximas = tipo === 'Teoría' ? curso.n_ht ?? 0 : curso.n_hp ?? 0;
  //   }

  //   this.vacantesAula = curso?.vacante ?? null;

  //   this.cursoSeleccionado = {
  //     ...curso,
  //     title: evento.title,
  //     extendedProps: {
  //       codigo,
  //       tipo,
  //     },
  //     horasDisponibles: horasMaximas,
  //   };

  //   const fecha = new Date(evento.start);
  //   this.fechaDrop = fecha;
  //   this.diaSeleccionado = this.obtenerDiaSemana(fecha);
  //   this.horaInicio = this.formatDateTime(fecha);
  //   this.horasAsignadas = evento.extendedProps.n_horas || 0;
  //   this.aulaSeleccionada = evento.extendedProps.aula_id ?? null;

  //   const idDocente = evento.extendedProps.docente_id;

  //   if (idDocente != null) {
  //     const docente = this.docentes.find((d) => d.id === idDocente);

  //     if (docente) {
  //       this.selectedDocente = docente;
  //       this.docenteSeleccionado = docente.id;
  //       this.selectedCategoria = docente.categoria;
  //       this.filtrarDocentes(); // Esto actualizará docentesFiltrados con la categoría correcta
  //     } else {
  //       this.selectedDocente = null;
  //       this.selectedCategoria = '';
  //       this.docentesFiltrados = [];
  //     }
  //   } else {
  //     this.selectedDocente = null;
  //     this.docenteSeleccionado = null;
  //     this.selectedCategoria = '';
  //     this.docentesFiltrados = [];
  //   }
  // }

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
        this.selectedCategoria = docente.categoria;
        this.filtrarDocentes(); // Esto actualizará docentesFiltrados con la categoría correcta
      } else {
        this.selectedDocente = null;
        this.selectedCategoria = '';
        this.docentesFiltrados = [];
      }
    } else {
      this.selectedDocente = null;
      this.docenteSeleccionado = null;
      this.selectedCategoria = '';
      this.docentesFiltrados = [];
    }
  }  

  // onEventDrop(info: any): void {
  //   const evento = info.event;
  
  //   const nuevo = {
  //     start: new Date(evento.start),
  //     end: new Date(evento.end),
  //   };
  
  //   // ⚠️ Verificamos el cruce antes de setear eventoSeleccionado
  //   const idEventoActual = evento.id;
  
  //   const seCruza = this.calendarComponent.getApi().getEvents().some((ev) => {
  //     if (ev.id === idEventoActual) return false;
  //     const inicio = new Date(ev.start!);
  //     const fin = new Date(ev.end!);
  //     return nuevo.start < fin && nuevo.end > inicio;
  //   });
  
  //   if (seCruza) {
  //     this.alertService.error('⛔ Este curso se cruza con un curso ya asignado.');
  //     info.revert(); // 👈 Aquí regresamos visualmente
  //     return;
  //   }
  
  //   // ✅ No se cruza: ahora sí seguimos con el modal
  //   this.eventoSeleccionado = evento;
  //   this.modalHorasActivo = true;
  
  //   const fecha = new Date(evento.start);
  //   this.fechaDrop = fecha;
  //   this.diaSeleccionado = this.obtenerDiaSemana(fecha);
  //   this.horaInicio = this.formatDateTime(fecha);
  //   this.horasAsignadas = evento.extendedProps.n_horas || 1;
  //   this.aulaSeleccionada = evento.extendedProps.aula_id ?? null;
  //   this.docenteSeleccionado = evento.extendedProps.docente_id ?? null;
  
  //   const codigo = evento.extendedProps.codCur;
  //   const tipo = evento.extendedProps.tipo;
  //   const curso = this.cursos.find(
  //     (c) => c.c_codcur === codigo && c.tipo === tipo
  //   );
  
  //   let horasMaximas = 1;
  //   if (curso) {
  //     horasMaximas = tipo === 'Teoría' ? curso.n_ht ?? 1 : curso.n_hp ?? 1;
  //   }
  
  //   this.cursoSeleccionado = {
  //     ...curso,
  //     title: evento.title,
  //     extendedProps: {
  //       codigo,
  //       tipo,
  //     },
  //     horasDisponibles: horasMaximas,
  //   };
  // }

  onEventDrop(info: any): void {
    const evento = info.event;
  
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
      info.revert(); // 👈 Revertimos visualmente el movimiento
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
  
    this.cursoSeleccionado = {
      ...curso,
      title: evento.title,
      extendedProps: {
        codigo,
        tipo,
      },
      horasDisponibles,
    };
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
    this.selectedCategoria = '';
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
        const eventos = res.map((h: HorarioExtendido) => {
          const esPadre =
            h.curso &&
            Array.isArray((h.curso as any).cursosPadres) &&
            (h.curso as any).cursosPadres.length > 0;
          const tipoEvento = h.tipo ?? 'Teoria';
          return {
            id: String(h.id),
            title: `${h.curso.c_nomcur} (${tipoEvento})`,
            start: h.h_inicio,
            end: h.h_fin,
            backgroundColor: esPadre ? '#EAB308' : h.c_color || '#3788d8',
            borderColor: esPadre ? '#EAB308' : h.c_color || '#3788d8',
            extendedProps: {
              codCur: h.curso.c_codcur,
              turno: h.turno_id,
              dia: h.dia,
              tipo: 'Teoría',
              n_horas: h.n_horas,
              aula_id: h.aula_id,
              docente_id: h.docente_id,
              // esPadre: esPadre,
            },
            // editable: !esPadre,
            durationEditable: false,
          };
        });

        this.mostrarCalendario = false;
        setTimeout(() => {
          this.calendarOptions.events = eventos;
          this.mostrarCalendario = true;
        }, 10);
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
  
  // actualizarEvento() {
  //   console.log('🧪 actualizandoEvento llamado');
  //   if (!this.eventoSeleccionado) return;

  //   const maxHoras = this.cursoSeleccionado?.horasDisponibles || 0;
  //   if (this.horasAsignadas > maxHoras || this.horasAsignadas < 1) {
  //     const msg =
  //       this.horasAsignadas < 1
  //         ? '❌ Debes asignar al menos 1 hora.'
  //         : `❌ No puedes asignar más de ${maxHoras} hora(s).`;
  //     this.alertService.error(msg);
  //     return;
  //   }

  //   const result = this.validarYCalcularFechas();
  //   if (!result) return;

  //   const { base, fin } = result;
  //   const idEvento = this.eventoSeleccionado.id;
  //   const codigo = this.eventoSeleccionado.extendedProps.codCur;
  //   const tipo = this.eventoSeleccionado.extendedProps.tipo;
  //   const horasAntes = this.eventoSeleccionado.extendedProps.n_horas ?? 0;
  //   const diferencia = this.horasAsignadas - horasAntes;
  //   const esTemporal = idEvento.toString().startsWith('temp-');
    

  //   if (esTemporal) {
  //     this.actualizarEventoTemporal(
  //       base,
  //       fin,
  //       codigo,
  //       tipo,
  //       idEvento,
  //       diferencia
  //     );
  //     this.alertService.success('📝 Evento temporal actualizado.');
  //     this.modalHorasActivo = false;
  //     this.eventoSeleccionado = null;
  //     return;
  //   }
    
  //   // Si no es temporal => construir payload
  //   const curso = this.cursos.find((c) => c.c_codcur === codigo);

  //   // 1️⃣ Buscar todos los eventos del mismo curso padre
  //   const calendarApi = this.calendarComponent.getApi();

  //   const eventosDelCurso: EventApi[] = calendarApi.getEvents().filter(
  //     (ev: EventApi) =>
  //       ev.extendedProps['codCur'] === codigo &&
  //       ev.extendedProps['tipo'] === tipo
  //   );

    
  //   // 2️⃣ Armar lista de horarios
  //   const horarios = eventosDelCurso.map((ev) => {
  //     const isEdited = ev.id === idEvento;
    
  //     const h_inicio = isEdited
  //     ? base?.toISOString() || ''
  //     : ev.start?.toISOString() || '';
    
  //   const h_fin = isEdited
  //     ? fin?.toISOString() || ''
  //     : ev.end?.toISOString() || '';    
    
  //     return {
  //       id: Number(ev.id),
  //       dia: ev.extendedProps['dia'],
  //       h_inicio,
  //       h_fin,
  //       n_horas: isEdited ? this.horasAsignadas : ev.extendedProps['n_horas'],
  //       c_color: ev.backgroundColor || '#3788d8',
  //       aula_id: isEdited
  //         ? this.aulaSeleccionada ?? null
  //         : ev.extendedProps['aula_id'] ?? null,
  //       docente_id: isEdited
  //         ? this.selectedDocente?.id ?? null
  //         : ev.extendedProps['docente_id'] ?? null,
  //       turno_id: this.turnoId,
  //     };
  //   });
    
  //   // 3️⃣ Armar el payload completo
  //   const payload = {
  //     verificar: true,
  //     dataArray: [
  //       {
  //         curso: {
  //           n_codper: String(curso?.n_codper || ''),
  //           c_codmod: Number(curso?.c_codmod) || 0,
  //           c_codfac: curso?.c_codfac || '',
  //           c_codesp: curso?.c_codesp || '',
  //           c_codcur: curso?.c_codcur || '',
  //           c_nomcur: curso?.c_nomcur || '',
  //           n_ciclo: Number(curso?.n_ciclo) || 0,
  //           c_area: curso?.c_area || '',
  //           turno_id: this.turnoId,
  //           tipo: tipo ?? 'Teoría',
  //           n_codper_equ:
  //             curso?.n_codper_equ != null ? String(curso.n_codper_equ) : null,
  //           c_codmod_equ:
  //             curso?.c_codmod_equ != null ? Number(curso.c_codmod_equ) : null,
  //           c_codfac_equ: curso?.c_codfac_equ ?? null,
  //           c_codesp_equ: curso?.c_codesp_equ ?? null,
  //           c_codcur_equ: curso?.c_codcur_equ ?? null,
  //           c_nomcur_equ: curso?.c_nomcur_equ ?? null,
  //         },
  //         horarios,
  //       },
  //     ],
  //   };
    

  //   this.horarioService.updateHorarios(payload).subscribe({
  //     next: (res) => {
  //       if (res.success === false && res.errores?.length > 0) {
  //         const erroresHtml = res.errores
  //           .map((err: any) => `<li>${err}</li>`)
  //           .join('');
  //         this.alertService.confirmConConflictos(erroresHtml);
  //         return;
  //       }
  //       this.procesarActualizacionExitosa(base, fin, codigo, tipo, diferencia);
  //     },
  //     error: (err) => {
  //       this.alertService.error('❌ Error al actualizar el evento.');
  //       console.error(err);
  //     },
  //   });
  // }

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
        dia: ev.extendedProps['dia'],
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

  filtrarDocentes() {
    this.docentesFiltrados = this.docentes.filter(
      (d) => d.categoria === this.selectedCategoria
    );

    // Si el docente previamente seleccionado ya no está en la lista filtrada, lo quitamos
    if (
      this.selectedDocente &&
      !this.docentesFiltrados.some((d) => d.id === this.selectedDocente?.id)
    ) {
      this.selectedDocente = null;
    }
  }

  cancelarEdicion(): void {
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
    this.selectedCategoria = '';
    this.docentesFiltrados = [];
    this.aulaSeleccionada = null;
    this.horasAsignadas = 1;
  }
}
