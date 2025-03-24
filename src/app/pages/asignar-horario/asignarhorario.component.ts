import { Component, OnInit, Output, output } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Draggable } from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es';
import { AlertService } from '../../services/alert.service';
import { HorarioService } from '../../services/horario.service';
import { ActivatedRoute } from '@angular/router';
import { Curso } from '../../interfaces/Curso';
import { CursoService } from '../../services/curso.service';
import { CreateHorario } from '../../interfaces/Horario';
import { Turno } from '../../interfaces/turno';
import { TurnoService } from '../../services/turno.service';
@Component({
  selector: 'app-asignarhorario',
  standalone: false,
  templateUrl: './asignarhorario.component.html',
  styleUrl: './asignarhorario.component.css'
})
export class AsignarhorarioComponent implements OnInit{
  // variables para agregar horas
  modalHorasActivo = false;
  cursoSeleccionado: any = null;
  horasAsignadas: number = 1;
  fechaDrop: Date | null = null;
  //para traer cursos y data
  turnoId!: number;
  turnoData!: Turno;
  cursos: Curso[] = [];
  //idparaeventocruzetem
  ultimoEventoIdTemporal: string | null = null;
  
  newEvent = { curso: '', h_inicio: '', h_fin: '', color: '' };

  // events = [
  //   {
  //     id: '1',
  //     curso: 'Clase de Matemáticas',
  //     h_inicio: '2024-01-01T08:00:00',
  //     h_fin: '2024-01-01T10:00:00',
  //     color: '#3788d8',
  //     docente: '',
  //     ciclo: 'I',
  //     seccion: 'N1',
  //     carrera: 'Enfermería'
  //   }
  // ];

  events: any[] = []

  //#region Libreria del calendario
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialDate: '2024-01-01',
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: { left: '', center: '', right: '' },
    buttonText: { today: 'Hoy', week: 'Semana' },
    slotMinTime: '07:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '00:30:00',
    allDaySlot: false,
    editable: true,
    selectable: true,
    events: [],
    droppable: true,
    height: 'auto',
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    // select: (info) => this.handleSelect(info),
    drop: this.handleExternalDrop.bind(this),
    // eventClick: (info) => this.handleEventClick(info),
  };
  //#endregion;

  constructor(
    private alertService: AlertService,
    private horarioService: HorarioService,
    private cursoService: CursoService,
    private turnoService: TurnoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.turnoId = +params['id'];
      if (this.turnoId) {
        this.cargarDatosPorTurno(this.turnoId);
      }
    });
    this.inicializarDragAndDrop();
    this.cargarHorarios();
  }

  //#region Metodos
  
  private cargarDatosPorTurno(id: number): void {
    this.turnoService.getTurnoById(id).subscribe(turno => {
      this.turnoData = turno;

      const dataCursos = {
        c_codfac: turno.c_codfac,
        c_codesp: turno.c_codesp,
        n_ciclo: turno.n_ciclo.toString()
      };
  
      this.cursoService.obtenerCursos(dataCursos).subscribe(res => {
        this.cursos = [];
  
        res.forEach((curso: Curso) => {
          if (curso.n_ht && curso.n_ht > 0) {
            this.cursos.push({
              ...curso,
              n_hp: undefined,
              tipo: 'Teoría',
              horasRestantes: curso.n_ht
            });
          }
  
          if (curso.n_hp && curso.n_hp > 0) {
            this.cursos.push({
              ...curso,
              n_ht: undefined,
              tipo: 'Práctica',
              horasRestantes: curso.n_hp
            });
          }
        });
      });
  
      // 🔹 Cargar horarios del turno
      this.horarioService.getHorarioPorTurno(id).subscribe(horarios => {
        this.calendarOptions.events = horarios.map(h => ({
          title: h.c_nomcur,
          start: h.h_inicio,
          end: h.h_fin,
          backgroundColor: h.c_color,
          extendedProps: {
            docente: h.c_nomdoc,
            codDocente: h.c_coddoc,
            dia: h.dia,
            turno: h.turno_id,
            codCur: h.c_codcur
          }
        }));
      });
    });
  }
  
  private cargarCursos(data: any): void {
    this.cursoService.obtenerCursos(data).subscribe((res) => {
      this.cursos = [];
  
      res.forEach((curso: Curso) => {
        if (curso.n_ht && curso.n_ht > 0) {
          this.cursos.push({
            ...curso,
            n_hp: undefined,
            tipo: 'Teoría',
            horasRestantes: curso.n_ht
          });
        }
  
        if (curso.n_hp && curso.n_hp > 0) {
          this.cursos.push({
            ...curso,
            n_ht: undefined,
            tipo: 'Práctica',
            horasRestantes: curso.n_hp
          });
        }
      });
    });
  }
  
  private inicializarDragAndDrop(): void {
    setTimeout(() => {
      const containerEl = document.getElementById('external-events');
      if (containerEl) {
        new Draggable(containerEl, {
          itemSelector: '.fc-event',
          eventData: function(eventEl) {
            const data = eventEl.getAttribute('data-event');
            return data ? JSON.parse(data) : {};
          }
        });
      }
    }, 0);
  }

  private verificaCruceHorario(nuevo: { start: Date, end: Date }): boolean {
    const eventos = this.calendarOptions.events as any[];
    
    for(let ev of eventos){
      const inicioExistente = new Date(ev.start);
      const finExistente = new Date(ev.end);

      const seCruzan = (
        nuevo.start < finExistente &&
        nuevo.end > inicioExistente
      );
      if(seCruzan){
        return true;
      }
    }
    return false
  }
  
    //#endregion
  
  handleExternalDrop(info: any) {
    const draggedData = JSON.parse(info.draggedEl.getAttribute('data-event'));
    const index = this.cursos.findIndex(c => c.c_codcur === draggedData.extendedProps.codigo && c.tipo === draggedData.extendedProps.tipo);
  
    this.cursoSeleccionado = {
      ...draggedData,
      horasDisponibles: this.cursos[index].horasRestantes,
      tipo: draggedData.extendedProps.tipo,
      index: index
    };
    this.fechaDrop = info.date;
    this.horasAsignadas = 1;
    this.modalHorasActivo = true;
  }
  
  stringifyEvent(curso: any): string {
    return JSON.stringify({
      title: curso.c_nomcur,
      extendedProps: {
        codigo: curso.c_codcur,
        tipo:curso.tipo,
        ht: curso.n_ht,
        hp: curso.n_hp
      }
    });
  }
  
  confirmarAsignacionHoras() {
    const start = new Date(this.fechaDrop!);
    const end = new Date(start);
    end.setHours(start.getHours() + this.horasAsignadas);
  
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
      backgroundColor: this.cursoSeleccionado.tipo === 'Teoría' ? '#3788d8' : '#28a745',
      extendedProps: {
        codCur: this.cursoSeleccionado.extendedProps.codigo,
        tipo: this.cursoSeleccionado.extendedProps.tipo,
        isNew: true
      }
    };
  
    this.calendarOptions.events = [
      ...(this.calendarOptions.events as any[]),
      evento
    ];
  
    const idx = this.cursoSeleccionado.index;
  
    if (idx !== -1 && this.cursos[idx]) {
      this.cursos[idx].horasRestantes = (this.cursos[idx].horasRestantes || 0) - this.horasAsignadas;
  
      if (this.cursos[idx].horasRestantes <= 0) {
        this.cursos.splice(idx, 1);
      }
    }
  
    // Reset modal y temporal
    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
    this.fechaDrop = null;
    this.ultimoEventoIdTemporal = null;
  }
  
  //#region Listar, Guardar y Editar eventos
  obtenerDiaSemana(fecha: Date): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[new Date(fecha).getDay()];
  }

  guardarEventos(): void {
    if (!this.turnoId || this.calendarOptions.events === undefined) return;
  
    const eventos = (this.calendarOptions.events as any[]).filter(ev =>
      ev.extendedProps?.codCur &&
      ev.extendedProps?.isNew // 🔥 solo los nuevos
    );
  
    const horarios: CreateHorario[] = eventos.map(ev => {
      const inicio = new Date(ev.start);
      const fin = new Date(ev.end);
  
      const diferenciaEnMilisegundos = fin.getTime() - inicio.getTime();
      const horas = Math.round(diferenciaEnMilisegundos / (1000 * 60 * 60)); // 🔢 Convertimos a horas enteras
  
      return {
        c_codcur: ev.extendedProps.codCur,
        c_nomcur: ev.title || '',
        dia: this.obtenerDiaSemana(inicio),
        h_inicio: inicio.toISOString(),
        h_fin: fin.toISOString(),
        n_horas: horas,
        c_color: ev.backgroundColor || '#3788d8',
        c_coddoc: 'DNI123456',
        c_nomdoc: 'Ing. Carlos Pérez',
        turno_id: this.turnoId
      };
    });
  
    this.horarioService.guardarHorarios(horarios).subscribe({
      next: () => {
        this.alertService.success('✅ Horarios guardados correctamente.');
        this.cargarHorarios(); // 🔁 Recarga para ver lo nuevo
      },
      error: (err) => {
        this.alertService.error('❌ Error al guardar horarios.');
        console.error(err);
      }
    });
  
    console.log('📝 Horarios que se están enviando:', horarios);
  }
  
  cargarHorarios(): void {
    if (!this.turnoId) return;
  
    this.horarioService.getHorarioPorTurno(this.turnoId).subscribe(horarios => {
      console.log('📡 Horarios recuperados:', horarios); // <--- ¿viene vacío?
      this.calendarOptions.events = horarios.map(h => ({
        title: h.c_nomcur,
        start: h.h_inicio,
        end: h.h_fin,
        backgroundColor: h.c_color,
        extendedProps: {
          docente: h.c_nomdoc,
          codDocente: h.c_coddoc,
          dia: h.dia,
          turno: h.turno_id,
          codCur: h.c_codcur
        }
      }));
    });
  }
  //#endregion

  cancelarAsignacionHoras() {
    if (this.ultimoEventoIdTemporal) {
      this.calendarOptions.events = (this.calendarOptions.events as any[]).filter(ev =>
        ev.id !== this.ultimoEventoIdTemporal
      );
    }
  
    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
    this.fechaDrop = null;
    this.ultimoEventoIdTemporal = null;
  }

}