import { Component } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es'; // Importar idioma español
import { Title } from '@angular/platform-browser';


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
  selectedEventCopy: any = null; // Copia del evento para editar sin bloquear
  selectedTeacher = ''; 

  teachers = ['Prof. Juan Pérez', 'Prof. María Gómez', 'Prof. Carlos López', 'Prof. Ana Torres'];

  suggestedColors = ['#FF5733', '#37', '#336331', '#FF33A5', '#A533FF', '#33FFF5'];

  newEvent = { title: '', start: '', end: '', color: '' };

  events = [
    { id: '1', title: 'Clase de Matemáticas', start: '2024-03-12T08:00:00', end: '2024-03-12T10:00:00', color: '#3788d8', teacher: '' }
  ];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,dayGridMonth'
    },
    buttonText: { today: 'Hoy', day: 'Día', week: 'Semana', month: 'Mes', list: 'Lista' },
    slotMinTime: '08:00:00',
    slotMaxTime: '21:59:59',
    allDaySlot: false,
    editable: true,
    selectable: true,
    events: this.events,
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  // 📌 Método para seleccionar un color de los sugeridos
  selectColor(color: string) {
    this.newEvent.color = color;
  }

  handleSelect(eventInfo: any) {
    this.newEvent = { title: '', start: eventInfo.startStr, end: eventInfo.endStr, color: '' };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  saveEvent() {
    if (!this.newEvent.title) { alert("El título es obligatorio"); return; }
    if (!this.newEvent.color) { this.newEvent.color = '#' + Math.floor(Math.random() * 16777215).toString(16); }
    this.events.push({ ...this.newEvent, id: String(this.events.length + 1), teacher: '' });
    this.calendarOptions.events = [...this.events];
    this.closeModal();
  }

  // 📌 Método corregido para abrir el modal de detalles sin bloquear la app
  handleEventClick(eventInfo: any) {
    this.selectedEvent = eventInfo.event;
    this.selectedEventCopy = {  // Hacemos una copia del evento para editar sin afectar el original
      id: this.selectedEvent.id,
      title: this.selectedEvent.title,
      start: this.selectedEvent.startStr,
      end: this.selectedEvent.endStr,
      color: this.selectedEvent.backgroundColor,
      teacher: this.selectedEvent.extendedProps.teacher || ''
    };
    this.selectedTeacher = this.selectedEventCopy.teacher;
    this.isEventDetailsModalOpen = true;
  }

  closeEventDetailsModal() { 
    this.isEventDetailsModalOpen = false; 
    this.selectedEvent = null; 
    this.selectedEventCopy = null; 
  }

  // 📌 Método corregido para actualizar el evento sin afectar el original antes de guardar
  saveEditedEvent() {
    if (this.selectedEvent && this.selectedEventCopy) {
      this.selectedEvent.setProp('title', this.selectedEventCopy.title);
      this.selectedEvent.setStart(this.selectedEventCopy.start);
      this.selectedEvent.setEnd(this.selectedEventCopy.end);
      this.selectedEvent.setProp('backgroundColor', this.selectedEventCopy.color);
      this.selectedEvent.setExtendedProp('teacher', this.selectedTeacher);

      this.closeEventDetailsModal();
    }
  }

  deleteEvent() {
    this.events = this.events.filter(event => event.id !== this.selectedEvent.id);
    this.selectedEvent.remove();
    this.calendarOptions.events = [...this.events];
    this.closeEventDetailsModal();
  }
}