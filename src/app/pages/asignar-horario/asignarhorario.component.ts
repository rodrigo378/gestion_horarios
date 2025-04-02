import { Component, OnInit, ViewChild} from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Draggable } from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { AlertService } from '../../services/alert.service';
import { HorarioService } from '../../services/horario.service';
import { ActivatedRoute } from '@angular/router';
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
  events: any[] = []
  //select turno
  turnoSeleccionado: 'M' | 'N' | '' = '';
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
    private aulaService: AulaService
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
        n_ciclo: turno.n_ciclo.toString(),
        c_codmod: turno.c_codmod,
      };

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

  onEventClick(info: any) {
    const evento = info.event;
    this.eventoSeleccionado = evento;
    this.modalHorasActivo = true;

    const codigo = evento.extendedProps.codCur;
    const tipo = evento.extendedProps.tipo;
    const curso = this.cursos.find(
      (c) => c.c_codcur === codigo && c.tipo === tipo
    );

    let horasMaximas = 0;
    if (curso) {
      horasMaximas = tipo === 'Teoría' ? curso.n_ht ?? 0 : curso.n_hp ?? 0;
    }

    this.vacantesAula = curso?.vacante ?? null;

    this.cursoSeleccionado = {
      ...curso,
      title: evento.title,
      extendedProps: {
        codigo,
        tipo,
      },
      horasDisponibles: horasMaximas,
    };

    const fecha = new Date(evento.start);
    this.fechaDrop = fecha;
    this.diaSeleccionado = this.obtenerDiaSemana(fecha);
    this.horaInicio = this.formatDateTime(fecha);
    this.horasAsignadas = evento.extendedProps.n_horas || 0;
    this.aulaSeleccionada = evento.extendedProps.aula_id ?? null;
    this.docenteSeleccionado = evento.extendedProps.docente_id ?? null;
  }

  onEventDrop(info: any): void {
    const evento = info.event;

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

    let horasMaximas = 1;
    if (curso) {
      horasMaximas = tipo === 'Teoría' ? curso.n_ht ?? 1 : curso.n_hp ?? 1;
    }

    this.cursoSeleccionado = {
      ...curso,
      title: evento.title,
      extendedProps: {
        codigo,
        tipo,
      },
      horasDisponibles: horasMaximas,
    };

    // Aquí puedes autoactualizar si deseas
    // this.actualizarEvento();
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
    const isTemporal = info.event.id.toString().startsWith('temp-') || info.event.extendedProps?.isNew;
  
    const badge = document.createElement('span');
    badge.textContent = isTemporal ? 'Temporal' : 'Guardado';
  
    // ✅ Estilos Tailwind en forma manual
    badge.className = `
      absolute top-1 right-1 
      text-[10px] text-white px-2 py-[2px] rounded 
      ${isTemporal ? 'bg-pink-400' : 'bg-sky-400'}
    `;
    // Asegura que el evento tenga relative para posicionar
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
      this.cancelarAsignacionHoras();
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
        docente_id: this.docenteSeleccionado ?? null,
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

    // 🧹 Limpieza final
    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
    this.fechaDrop = null;
    this.ultimoEventoIdTemporal = null;
    this.horaInicio = '';
    this.diaSeleccionado = '';
    this.vacantesAula = null;
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
      fin.setMinutes(fin.getMinutes() + this.horasAsignadas * 50);  
      const minutos = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60));
      const horas = minutos / 50; // para convertir de minutos reales a horas académicas      
  
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
          turno_id: this.turnoId,
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
            curso?.c_codmod_equ != null ? String(curso.c_codmod_equ) : null,
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
          // Conflictos detectados
          const errores = res.errores as string[];
          const erroresHtml = errores.map(err => `<li>${err}</li>`).join('');
          this.alertService.confirmConConflictos(erroresHtml).then(confirmado => {
            if (confirmado) {
              this.horarioService.guardarHorarios({ dataArray, verificar: false }).subscribe({
                next: () => {
                  this.alertService.success('✅ Horarios guardados a pesar de los conflictos.');
                  this.cargarHorarios();
                },
                error: () => {
                  this.alertService.error('❌ Error al guardar los horarios con conflictos.');
                }
              });
            }
          });
    
        } else {
          // Guardado correcto (aunque no venga `success`)
          const mensaje = res.mensaje || '✅ Horarios guardados correctamente.';
          this.alertService.success(mensaje);
          this.cargarHorarios();
        }
      },
      error: (err) => {
        this.alertService.error('❌ Error al guardar horarios.');
        console.error(err);
      }
    });
    
    
    console.log('📝 Data enviada al backend:', payload);    
  }

  cargarHorarios(): void {
    if (!this.turnoId) return;

    this.horarioService
      .getHorarioPorTurno(this.turnoId)
      .subscribe((res: HorarioExtendido[]) => {
        const eventos = res.map((h: HorarioExtendido) => {
          const esPadre = h.curso && Array.isArray((h.curso as any).cursosPadres) && (h.curso as any).cursosPadres.length > 0;
        
          return {
            id: String(h.id),
            title: h.curso.c_nomcur,
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
              esPadre: esPadre
            }
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
    const listas = [this.cursos, this.cursosPlan2023, this.cursosPlan2025];

    listas.forEach((lista) => {
      const index = lista.findIndex(
        (c) => c.c_codcur === codigo && c.tipo === tipo
      );
      if (index !== -1) {
        lista[index].horasRestantes =
          (lista[index].horasRestantes ?? 0) + diferencia;
        // Si quedó en 0 o menos, lo removemos
        if (lista[index].horasRestantes <= 0) {
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

  //#endregion

  actualizarEvento() {
    if (!this.eventoSeleccionado) return;

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
    fin.setHours(fin.getHours() + this.horasAsignadas);

    const nuevoHorario = { start: base, end: fin };

    if (this.verificaCruceHorario(nuevoHorario)) {
      this.alertService.error(
        '⛔ Este curso se cruza con un curso ya asignado.'
      );
      return;
    }

    const docente = this.docentes.find(
      (d) => d.id === this.docenteSeleccionado
    );
    const aula = this.aulas.find((a) => a.id === this.aulaSeleccionada);
    const idEvento = this.eventoSeleccionado.id;
    const codigo = this.eventoSeleccionado.extendedProps.codCur;
    const tipo = this.eventoSeleccionado.extendedProps.tipo;
    const horasAntes = this.eventoSeleccionado.extendedProps.n_horas ?? 0;
    const diferencia = horasAntes - this.horasAsignadas;
    const esTemporal = idEvento.toString().startsWith('temp-');

    if (esTemporal) {
      // 🔁 Actualización visual de evento temporal
      this.eventoSeleccionado.setStart(base);
      this.eventoSeleccionado.setEnd(fin);
      this.eventoSeleccionado.setExtendedProp('n_horas', this.horasAsignadas);
      this.eventoSeleccionado.setExtendedProp('dia', this.diaSeleccionado);
      this.eventoSeleccionado.setExtendedProp('aula_id', this.aulaSeleccionada);
      this.eventoSeleccionado.setExtendedProp(
        'docente_id',
        this.docenteSeleccionado
      );
      this.eventoSeleccionado.setExtendedProp('isNew', true); // 🔥 Clave para guardar correctamente

      this.actualizarHorasRestantes(codigo, tipo, diferencia);

      const eventosActuales = (this.calendarOptions.events as any[]).map(
        (ev) => {
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
                docente_id: this.docenteSeleccionado,
                isNew: true,
              },
            };
          }
          return ev;
        }
      );
      this.calendarOptions.events = eventosActuales;

      this.alertService.success('📝 Evento temporal actualizado.');
      this.modalHorasActivo = false;
      this.eventoSeleccionado = null;
      return;
    }

    const curso = this.cursos.find((c) => c.c_codcur === codigo); // busca el curso asociado

    const payload = {
      dataArray: [
        {
          curso: {
            n_codper: String(this.turnoData?.n_codper || ''),
            c_codmod: Number(curso?.c_codmod) || 0,
            c_codfac: curso?.c_codfac || '',
            c_codesp: curso?.c_codesp || '',
            c_codcur: curso?.c_codcur || '',
            c_nomcur: curso?.c_nomcur || '',
            n_ciclo: Number(curso?.n_ciclo) || 0,
            c_area: curso?.c_area || '',
            turno_id: this.turnoId,
          },
          horarios: [
            {
              id: Number(idEvento),
              dia: this.diaSeleccionado,
              h_inicio: base.toISOString(),
              h_fin: fin.toISOString(),
              n_horas: this.horasAsignadas,
              c_color: this.eventoSeleccionado.backgroundColor || '#3788d8',
              aula_id: this.aulaSeleccionada != null ? Number(this.aulaSeleccionada) : null,
              docente_id: this.docenteSeleccionado != null ? Number(this.docenteSeleccionado) : null,
              turno_id: this.turnoId
            }
          ]
        }
      ],
      verificar: true
    };
    
    this.horarioService.updateHorarios(payload).subscribe({
      next: (res) => {
        if (res.success === false && res.errores?.length > 0) {
          const errores = res.errores as string[];
          const erroresHtml = errores.map(err => `<li>${err}</li>`).join('');
          
          this.alertService.confirmConConflictos(erroresHtml).then(confirmado => {
            if (confirmado) {
              this.horarioService.updateHorarios({ ...payload, verificar: false }).subscribe({
                next: () => {
                  this.procesarActualizacionExitosa(base, fin, codigo, tipo, diferencia);
                },
                error: () => {
                  this.alertService.error('❌ Error al actualizar con conflictos.');
                }
              });
            }
          });
    
        } else {
          this.procesarActualizacionExitosa(base, fin, codigo, tipo, diferencia);
        }
      },
      error: (err) => {
        this.alertService.error('❌ Error al actualizar el evento.');
        console.error(err);
      }
    });    
  }
  
  procesarActualizacionExitosa(base: Date, fin: Date, codigo: string, tipo: string, diferencia: number): void {
    this.actualizarHorasRestantes(codigo, tipo, diferencia);
    this.eventoSeleccionado?.setStart(base);
    this.eventoSeleccionado?.setEnd(fin);
    this.eventoSeleccionado?.setExtendedProp('n_horas', this.horasAsignadas);
    this.eventoSeleccionado?.setExtendedProp('dia', this.diaSeleccionado);
    this.eventoSeleccionado?.setExtendedProp('aula_id', this.aulaSeleccionada);
    this.eventoSeleccionado?.setExtendedProp('docente_id', this.docenteSeleccionado);
  
    this.alertService.success('✅ Evento actualizado correctamente.');
    this.modalHorasActivo = false;
    this.eventoSeleccionado = null;
    this.cargarHorarios();
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
      });
  }

  eliminarTodosLosHorarios(): void {
    this.alertService.confirm(
      '¿Estás seguro de eliminar todos los horarios? Esta acción no se puede deshacer.',
      'Eliminar horarios'
    ).then((isConfirmed) => {
      if (!isConfirmed) return;
  
      const ids: number[] = this.calendarComponent.getApi().getEvents()
        .filter(ev => !ev.id.toString().startsWith('temp-')) // solo persistentes
        .map(ev => Number(ev.id));
  
      if (ids.length === 0) {
        this.alertService.info('No hay horarios guardados para eliminar.');
        return;
      }
  
      this.horarioService.deleteHorarios({ horarios_id: ids }).subscribe({
        next: () => {
          this.alertService.success('Todos los horarios fueron eliminados correctamente.');
          this.cargarHorarios();
          this.cargarDatosPorTurno(this.turnoId);
        },
        error: (err) => {
          this.alertService.error('Ocurrió un error al eliminar los horarios.');
          console.error(err);
        }
      });
    });
  }

  //#endregion

  cancelarAsignacionHoras() {
    if (this.ultimoEventoIdTemporal) {
      this.calendarOptions.events = (
        this.calendarOptions.events as any[]
      ).filter((ev) => ev.id !== this.ultimoEventoIdTemporal);
    }

    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
    this.fechaDrop = null;
    this.ultimoEventoIdTemporal = null;
  }
}
