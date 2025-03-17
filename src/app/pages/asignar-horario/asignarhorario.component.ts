import { Component, Output, output } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es';
import { AlertService } from '../../services/alert.service';
@Component({
  selector: 'app-asignarhorario',
  standalone: false,
  templateUrl: './asignarhorario.component.html',
  styleUrl: './asignarhorario.component.css'
})
export class AsignarhorarioComponent {


  isModalOpen = false;
  isEventDetailsModalOpen = false;
  
  selectedEvent: any = null;
  selectedEventCopy: any = null;
  selectedTeacher = '';
  
  textoFiltros = '';
  
  turnos = ['Mañana','Tarde', 'Noche'];
  ciclos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  secciones = ['N1', 'N2', 'N3', 'N4'];
  carreras = ['Enfermería', 'Farmacia o Bioquímica'];
  
  turnoSeleccionado = '';
  cicloSeleccionado = '';
  seccionSeleccionada = '';
  carreraSeleccionada = '';

  cursoSeleccionado = '';

  
  teachers = ['Prof. Juan Pérez', 'Prof. María Gómez', 'Prof. Carlos López', 'Prof. Ana Torres'];
  
  suggestedColors = ['#b23f25', '#37', '#336331', '#9a2366', '#A533FF', '#277b77'];
  
  newEvent = { title: '', start: '', end: '', color: '' };
  
  events = [
    { id: '1', title: 'Clase de Matemáticas', start: '2024-03-12T08:00:00', end: '2024-03-12T10:00:00', color: '#3788d8', teacher: '', ciclo: 'I', seccion: 'N1', carrera: 'Enfermería' }
  ];
  
  cursos = [
    'Matemáticas', 'Física', 'Química', 'Biología', 'Historia', 'Programación', 
    'Redes y Comunicaciones', 'Estadística', 'Cálculo', 'Ingeniería de Software'
  ];

  //#region Libreria del calendario
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: { left: '', center: '', right: '' },
    buttonText: { today: 'Hoy', week: 'Semana' },
    slotMinTime: '08:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '00:30:00',
    allDaySlot: false,
    editable: true,
    selectable: true,
    events: this.events,
    height: 'auto',
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    select: (info) => this.handleSelect(info),
    eventClick: (info) => this.handleEventClick(info),
  };
  //#endregion;

  constructor(private alertService: AlertService) {}
  //#region metodos 
  private formatDate(date: Date): string {
    const pad = (num: number) => String(num).padStart(2, '0'); // Asegura dos dígitos
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private generarColorAleatorio(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
  
  //#endregion;
  
  selectColor(color: string) {
    this.newEvent.color = color;
  }

  handleSelect({ startStr, endStr }: any) {
    this.newEvent = {
      title: '',
      start: this.formatDate(new Date(startStr)), // Formatear fecha de inicio
      end: this.formatDate(new Date(endStr)),     // Formatear fecha de fin
      color: ''
    };
    this.isModalOpen = true;
  }

  // 📌 Cierra el modal
  closeModal() {
    this.isModalOpen = false;
  }

  //#region guardar y edit detalle y eliminar
  saveEvent() {
    if (!this.cursoSeleccionado) {
      this.alertService.error("El curso es obligatorio");
      return;
    }

    this.newEvent.color ||= this.generarColorAleatorio();

    const newEvent = {
      id: String(this.events.length + 1),
      title: this.cursoSeleccionado,
      start: this.newEvent.start,
      end: this.newEvent.end,
      color: this.newEvent.color,
      teacher: '',
      ciclo: this.cicloSeleccionado || '',
      seccion: this.seccionSeleccionada || '',
      carrera: this.carreraSeleccionada || ''
    };

    this.events.push(newEvent);
    this.aplicarFiltrosYActualizarTexto();
    this.alertService.success("✅ Evento guardado correctamente.");
    // 📌 Cerrar el modal con animación
    this.cerrarModalAnimado("modal-evento", this.closeModal.bind(this));
    this.exportarEstadoComoJSON();
  }

  saveEditedEvent() {
    if (!this.selectedEvent || !this.selectedEventCopy) return;

    this.selectedEvent.setProp('title', this.selectedEventCopy.title);
    this.selectedEvent.setStart(this.selectedEventCopy.start);
    this.selectedEvent.setEnd(this.selectedEventCopy.end);

    this.selectedEvent.setProp('backgroundColor', this.selectedEventCopy.color);
    this.selectedEvent.setProp('borderColor', this.selectedEventCopy.color);
    this.selectedEvent.setExtendedProp('teacher', this.selectedTeacher);

    this.alertService.success("✅ Cambios guardados correctamente.");
  }

  deleteEvent() {
    if (!this.selectedEvent) return;

    this.events = this.events.filter(event => event.id !== this.selectedEvent?.id);
    this.selectedEvent.remove();
    this.calendarOptions.events = [...this.events];

    this.aplicarFiltrosYActualizarTexto()
    this.closeEventDetailsModal();
  }
  //#endregion
  
  // 📌 Cierra cualquier modal con animación
  cerrarModalAnimado(idModal: string, callback: () => void) {
    const modal = document.getElementById(idModal);
    if (modal) {
      modal.style.opacity = "1";
      modal.style.transition = "opacity 0.5s ease-out";

      // Reducir la opacidad para la animación
      setTimeout(() => (modal.style.opacity = "0"), 100);

      // Esperar el fin de la animación antes de cerrar el modal
      setTimeout(() => {
        modal.style.display = "none";
        this.isModalOpen = false;
        this.exportarEstadoComoJSON();
        callback();
      }, 600);
    } else {
      callback();
    }
  }

  // 📌 Cierra el modal de detalles con animación
  cerrarModalDetallesConAnimacion() {
    this.cerrarModalAnimado("modal-detalles-evento", () => (this.isEventDetailsModalOpen = false));
  }

  // 📌 Método para abrir el modal de detalles sin bloquear la app
  handleEventClick(eventInfo: any) {
    const event = eventInfo.event;
    if (!event) return;

    const eventColor = event.backgroundColor || event.color || '#3788d8';

    this.selectedEvent = event;
    this.selectedEventCopy = {
      id: event.id,
      title: event.title,
      start: this.formatDate(new Date(event.start as string)), // Convertir fecha inicio
      end: this.formatDate(new Date(event.end as string)), // Convertir fecha fin
      color: eventColor,
      teacher: event.extendedProps?.teacher || ''
    };

    this.selectedTeacher = this.selectedEventCopy.teacher;
    this.isEventDetailsModalOpen = true;
    this.exportarEstadoComoJSON();
  }

  // 📌 Cierra el modal de detalles
  closeEventDetailsModal() {
    this.isEventDetailsModalOpen = false;
    this.selectedEvent = null;
    this.selectedEventCopy = null;
  }


  aplicarFiltrosYActualizarTexto() {
    const filtros: string[] = [];
  
    // 📌 Definir los turnos con su rango de horas
    const turnos: Record<string, { min: string; max: string }> = {
      // 'Mañana': { min: '08:00:00', max: '11:59:59' },
      // 'Noche': { min: '12:00:00', max: '23:00:00' },
      'Mañana': { min: '08:00:00', max: '11:59:59' },
      'Tarde': { min: '12:00:00', max: '18:59:59' },
      'Noche': { min: '19:00:00', max: '24:00:00' },
    };
  
    // 📌 Obtener el rango de horas según el turno seleccionado
    const turno = turnos[this.turnoSeleccionado] || { min: '08:00:00', max: '23:00:00' };
    this.calendarOptions.slotMinTime = turno.min;
    this.calendarOptions.slotMaxTime = turno.max;
    if (this.turnoSeleccionado) filtros.push(`Turno: ${this.turnoSeleccionado}`);
  
    // 📌 Filtrar eventos según Ciclo, Sección y Carrera
    this.calendarOptions.events = this.events.filter(event =>
      (!this.cicloSeleccionado || event.ciclo === this.cicloSeleccionado) &&
      (!this.seccionSeleccionada || event.seccion === this.seccionSeleccionada) &&
      (!this.carreraSeleccionada || event.carrera === this.carreraSeleccionada)
    );
  
    // 📌 Construcción eficiente del texto de filtros
    const filtrosSeleccionados = [
      this.cicloSeleccionado && `Ciclo: ${this.cicloSeleccionado}`,
      this.seccionSeleccionada && `Sección: ${this.seccionSeleccionada}`,
      this.carreraSeleccionada && `Carrera: ${this.carreraSeleccionada}`
    ].filter(Boolean);
  
    if (filtrosSeleccionados.length) filtros.push(...filtrosSeleccionados);
    this.textoFiltros = filtros.join(' - ');
  
    // 📌 Refrescar la configuración del calendario
    this.calendarOptions = { ...this.calendarOptions };
  }
  
  exportarEstadoComoJSON() {
    const estadoActual = {
      eventos: this.events, // Todos los eventos registrados
      eventoSeleccionado: this.selectedEvent || null, // Último evento seleccionado o null
      // eventoNuevo: this.newEvent, // Evento en proceso de creación
      filtros: {
        ciclo: this.cicloSeleccionado || null,
        seccion: this.seccionSeleccionada || null,
        carrera: this.carreraSeleccionada || null,
        turno: this.turnoSeleccionado || null,
      },
      modalAbierto: this.isModalOpen, // Indica si el modal está abierto
      fechaExportacion: new Date().toISOString(), // Marca de tiempo de exportación
    };
  
    console.log("📌 Estado del componente en JSON:", JSON.stringify(estadoActual, null, 2));
  }
  

}