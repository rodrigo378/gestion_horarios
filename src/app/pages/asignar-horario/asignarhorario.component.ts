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
import { CreateHorario, UpdateHorario } from '../../interfaces/Horario';
import { Turno } from '../../interfaces/turno';
import { TurnoService } from '../../services/turno.service';
@Component({
  selector: 'app-asignarhorario',
  standalone: false,
  templateUrl: './asignarhorario.component.html',
  styleUrl: './asignarhorario.component.css'
})
export class AsignarhorarioComponent implements OnInit{
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
  aulaSeleccionada!: number;
  docenteSeleccionado!: number;
  diaSeleccionado: string = '';
  horaInicio: string = '';  
  aulas = [ { id: 1, nombre: 'Aula 101' }, { id: 2, nombre: 'Aula 102' } ];
  docentes = [ { id: 1, nombre: 'Carlos Pérez' }, { id: 2, nombre: 'Luz Herrera' } ];
  //para separa los cursos por planes
  cursosPlan2023: Curso[] = [];
  cursosPlan2025: Curso[] = [];

  mostrarCalendario: boolean = true;

  
  newEvent = { curso: '', h_inicio: '', h_fin: '', color: '' };

  events: any[] = []
  //#endregion

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
    drop: this.handleExternalDrop.bind(this),
    eventClick: this.onEventClick.bind(this),
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

  //#region Metodos cargar y verificar cursos
  private cargarDatosPorTurno(id: number): void {
    this.turnoService.getTurnoById(id).subscribe(turno => {
      this.turnoData = turno;
  
      const dataCursos = {
        c_codfac: turno.c_codfac,
        c_codesp: turno.c_codesp,
        n_ciclo: turno.n_ciclo.toString(),
        c_codmod: turno.c_codmod
      };
  
      this.cursoService.obtenerCursos(dataCursos).subscribe(resCursos => {
        this.horarioService.getHorarioPorTurno(id).subscribe(horarios => {
          const horasAsignadasPorCurso: Record<string, number> = {};
  
          horarios.forEach(h => {
            horasAsignadasPorCurso[h.c_codcur] =
              (horasAsignadasPorCurso[h.c_codcur] || 0) + (h.n_horas || 0);
          });
  
          // Limpiamos las listas
          this.cursos = [];
          this.cursosPlan2023 = [];
          this.cursosPlan2025 = [];
  
          resCursos.forEach((curso: Curso) => {
            const horasTeoriaAsignadas = horasAsignadasPorCurso[curso.c_codcur] || 0;
          
            if (curso.n_ht && curso.n_ht > 0) {
              const horasRestantes = curso.n_ht - horasTeoriaAsignadas;
              if (horasRestantes > 0) {
                const cursoTeoria: Curso = {
                  ...curso,
                  n_hp: undefined,
                  tipo: 'Teoría',
                  horasRestantes,
                };
                this.cursos.push(cursoTeoria);
          
                if (curso.n_codper === 2023) this.cursosPlan2023.push(cursoTeoria);
                if (curso.n_codper === 2025) this.cursosPlan2025.push(cursoTeoria);
              }
            }
          
            if (curso.n_hp && curso.n_hp > 0) {
              const horasRestantes = curso.n_hp - horasTeoriaAsignadas;
              if (horasRestantes > 0) {
                const cursoPractica: Curso = {
                  ...curso,
                  n_ht: undefined,
                  tipo: 'Práctica',
                  horasRestantes,
                };
                this.cursos.push(cursoPractica);
          
                if (curso.n_codper === 2023) this.cursosPlan2023.push(cursoPractica);
                if (curso.n_codper === 2025) this.cursosPlan2025.push(cursoPractica);
              }
            }
          });
          this.cargarHorarios();
        });
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

  private formatDateTime(date: Date): string {
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }
  
  //#endregion
  
  //#region funcion para los eventos
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
        tipo:curso.tipo,
        ht: curso.n_ht,
        hp: curso.n_hp
      }
    });
  }

  onEventClick(info: any) {
    const evento = info.event;
  
    console.log('🧠 Evento clickeado con ID:', evento.id); // debe salir "25", "26", etc.
  
    this.eventoSeleccionado = evento;
    this.modalHorasActivo = true;
  
    this.cursoSeleccionado = {
      extendedProps: {
        codigo: evento.extendedProps.codCur,
        tipo: evento.extendedProps.tipo
      },
      title: evento.title,
      horasDisponibles: evento.extendedProps.n_horas
    };
  
    const fecha = new Date(evento.start);
    this.fechaDrop = fecha;
    this.diaSeleccionado = this.obtenerDiaSemana(fecha);
    this.horaInicio = this.formatDateTime(fecha);
    this.horasAsignadas = evento.extendedProps.n_horas || 1;
    this.aulaSeleccionada = evento.extendedProps.aula_id || 1;
    this.docenteSeleccionado = evento.extendedProps.docente_id || 1;
  }

  //#endregion
  
  confirmarAsignacionHoras() {
    if (!this.fechaDrop || !this.horaInicio) return;

    const diaAFecha: Record<string, number> = {
      'Domingo': 0,
      'Lunes': 1,
      'Martes': 2,
      'Miércoles': 3,
      'Jueves': 4,
      'Viernes': 5,
      'Sábado': 6
    };

    const base = new Date(this.fechaDrop);
    base.setDate(base.getDate() - base.getDay()); // ir al domingo
    const diaNumero = diaAFecha[this.diaSeleccionado];
    const [hora, minutos] = this.horaInicio.split(':').map(Number);
  
    const start = new Date(base);
    start.setDate(base.getDate() + diaNumero);
    start.setHours(hora, minutos, 0);
  
    // 👇 Si el usuario modificó la hora manualmente (input horaInicio), la aplicamos
    // if (this.horaInicio) {
    //   const [hora, minuto] = this.horaInicio.split(':').map(Number);
    //   start.setHours(hora, minuto);
    // }
  
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
  
    const codigo = this.cursoSeleccionado.extendedProps.codigo;
    const tipo = this.cursoSeleccionado.extendedProps.tipo;
  
    const actualizarLista = (lista: Curso[]) => {
      const index = lista.findIndex(c => c.c_codcur === codigo && c.tipo === tipo);
      if (index !== -1) {
        lista[index].horasRestantes = (lista[index].horasRestantes || 0) - this.horasAsignadas;
        if (lista[index].horasRestantes <= 0) {
          lista.splice(index, 1);
        }
      }
    };
  
    actualizarLista(this.cursosPlan2023);
    actualizarLista(this.cursosPlan2025);
  
    // 🧹 Limpieza final
    this.modalHorasActivo = false;
    this.cursoSeleccionado = null;
    this.fechaDrop = null;
    this.ultimoEventoIdTemporal = null;
    this.horaInicio = '';
    this.diaSeleccionado = '';
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
      console.log('📡 Horarios recuperados:', horarios);
  
      // 🔁 Ocultamos el calendario temporalmente
      this.mostrarCalendario = false;
  
      setTimeout(() => {
        this.calendarOptions.events = horarios.map(h => ({
          id: String(h.id), // 👈 ahora sí, FullCalendar lo tomará
          title: h.c_nomcur,
          start: h.h_inicio,
          end: h.h_fin,
          backgroundColor: h.c_color,
          extendedProps: {
            docente: h.c_nomdoc,
            codDocente: h.c_coddoc,
            dia: h.dia,
            turno: h.turno_id,
            codCur: h.c_codcur,
            tipo: 'Teoría',
            n_horas: h.n_horas,
            aula_id: h.aula_id || 1,
            docente_id: h.c_coddoc || 1
          }
        }));
  
        // ✅ Volvemos a mostrar el calendario (forzamos redibujo)
        this.mostrarCalendario = true;
  
        console.log('🎯 Eventos construidos con ID:', this.calendarOptions.events);
      }, 10);
    });
  }
  

  actualizarEvento() {
    if (!this.eventoSeleccionado) return;
  
    const [hora, minutos] = this.horaInicio.split(':').map(Number);
    const base = new Date(this.fechaDrop!);
    base.setHours(hora, minutos, 0);
  
    const fin = new Date(base);
    fin.setHours(fin.getHours() + this.horasAsignadas);
  
    const docente = this.docentes.find(d => d.id === this.docenteSeleccionado);
  
    const dataUpdate: UpdateHorario = {
      id: this.eventoSeleccionado.id,
      c_codcur: this.eventoSeleccionado.extendedProps.codCur,
      c_nomcur: this.eventoSeleccionado.title,
      dia: this.diaSeleccionado,
      h_inicio: base.toISOString(),
      h_fin: fin.toISOString(),
      n_horas: this.horasAsignadas,
      c_color: this.eventoSeleccionado.backgroundColor || '#3788d8',
      c_coddoc: docente?.id.toString() || 'SIN_DOCENTE',
      c_nomdoc: docente?.nombre || 'Sin nombre',
      turno_id: this.turnoId
    };
  
    this.horarioService.updateHorarios(dataUpdate).subscribe({
      next: () => {
        this.eventoSeleccionado.setStart(base);
        this.eventoSeleccionado.setEnd(fin);
        this.eventoSeleccionado.setExtendedProp('n_horas', this.horasAsignadas);
        this.eventoSeleccionado.setExtendedProp('dia', this.diaSeleccionado);
        this.eventoSeleccionado.setExtendedProp('aula_id', this.aulaSeleccionada);
        this.eventoSeleccionado.setExtendedProp('docente_id', this.docenteSeleccionado);
  
        this.alertService.success('✅ Evento actualizado correctamente.');
        this.modalHorasActivo = false;
        this.eventoSeleccionado = null;
      },
      error: (err) => {
        this.alertService.error('❌ Error al actualizar el evento.');
        console.error(err);
      }
    });
  }

eliminarEvento() {
  if (!this.eventoSeleccionado) return;

  const id = this.eventoSeleccionado.id;

  const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este horario?');

  if (!confirmar) return;

  if (id && !id.toString().startsWith('temp-')) {
    this.horarioService.eliminarHorario(id).subscribe({
      next: () => {
        this.alertService.success('🗑️ Evento eliminado correctamente.');
      },
      error: (err) => {
        this.alertService.error('❌ Error al eliminar el evento.');
        console.error(err);
      }
    });
  }

  this.eventoSeleccionado.remove();
  this.modalHorasActivo = false;
  this.eventoSeleccionado = null;
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