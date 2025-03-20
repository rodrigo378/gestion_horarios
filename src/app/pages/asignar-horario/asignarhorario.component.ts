import { Component, OnInit, Output, output } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es';
import { AlertService } from '../../services/alert.service';
import { HttpClient } from '@angular/common/http';
import { AsignarhorarioService } from '../../services/asignarhorario.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Curso } from '../../interfaces/Especialidad';
import { HorarioService } from '../../services/horario.service';
import { Horario } from '../../interfaces/Horario';
@Component({
  selector: 'app-asignarhorario',
  standalone: false,
  templateUrl: './asignarhorario.component.html',
  styleUrl: './asignarhorario.component.css'
})
export class AsignarhorarioComponent implements OnInit{

  isModalOpen:boolean = false;
  isEventDetailsModalOpen = false;
  
  selectedEvent: any = null;
  selectedEventCopy: any = null;
  selectedTeacher = '';

  mostrarHorario: boolean = false
  
  textoFiltros = '';
  
  turnos = ['Mañana', 'Noche'];
  secciones = ['N1', 'N2', 'N3', 'N4'];

  facultades: { codigo: string; nombre: string }[] = [
    { codigo: 'E', nombre: 'Escuela de Ingeniería' },
    { codigo: 'S', nombre: 'Escuela de Salud' }
  ];

  modalidades = [
    { id: 1, nombre: 'Presencial' },
    { id: 2, nombre: 'Semipresencial' },
    { id: 3, nombre: 'Virtual' }
  ];

  ciclos: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  carreras: { nombre: string; codigo: string }[] = [];

  
  turnoSeleccionado = '';
  cicloSeleccionado = '';
  seccionSeleccionada = '';
  carreraSeleccionada = '';
  facultadSeleccionada = '';

  modalidadSeleccionada: number = 1;
  cursoSeleccionado = '';
  tipoHorasSeleccionado = 'n_ht';
  
  teachers = ['Prof. Juan Pérez', 'Prof. María Gómez', 'Prof. Carlos López', 'Prof. Ana Torres'];
  
  suggestedColors = ['#b23f25', '#3788d8', '#336331', '#9a2366', '#A533FF', '#277b77'];
  
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

  cursos: Curso[] = [];
  cursosFiltrados: Curso[] = [];

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
    slotDuration: '00:50:00',
    slotLabelInterval: '00:50:00',
    allDaySlot: false,
    editable: true,
    selectable: true,
    events: [],
    height: 'auto',
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    select: (info) => this.handleSelect(info),
    // eventClick: (info) => this.handleEventClick(info),
  };
  //#endregion;

  constructor(
    private alertService: AlertService,
    private http: HttpClient,
    private asignarhorarioService: AsignarhorarioService,
    private horarioService: HorarioService
  ) {}

  ngOnInit(): void {
    this.getCarrerasYCiclosYModalidad()
    this.cargarHorarios()
  }

  //#region cargar filtros Especialidades, Cursos y Modalidad
  getCarrerasYCiclosYModalidad() {
    if (this.facultadSeleccionada && this.cicloSeleccionado && this.modalidadSeleccionada) {
      this.asignarhorarioService
        .getCarrerasYCiclosYModalidad(this.facultadSeleccionada, this.cicloSeleccionado, this.modalidadSeleccionada)
        .subscribe({
          next: (data: any[]) => {
            this.carreras = data.map((e) => ({ nombre: e.nomesp, codigo: e.c_codesp }));
  
            // 🔹 Si hay especialidades, selecciona la primera por defecto
            if (this.carreras.length > 0) {
              this.carreraSeleccionada = this.carreras[0].codigo;
            } else {
              this.carreraSeleccionada = '';
            }

            this.getCursos()
          },
          error: (err) => console.error('Error al obtener especialidades filtradas:', err)
        });
    } else {
      this.carreras = [];
      this.carreraSeleccionada = '';
    }
  }
  
  getCursos() {
    if (this.facultadSeleccionada && this.cicloSeleccionado && this.carreraSeleccionada) {
      console.log("📡 Llamando a API de cursos con:", this.facultadSeleccionada, this.cicloSeleccionado, this.carreraSeleccionada);
  
      this.asignarhorarioService
        .getCursos(this.facultadSeleccionada, this.cicloSeleccionado, this.carreraSeleccionada)
        .subscribe({
          next: (data: any[]) => {
            console.log("✅ Cursos recibidos:", data);
  
            this.cursos = data.map((c) => ({
              nombre: c.c_nomcur,
              horas: c.horas,
              modalidad: Number(c.c_codmod),
              tipoHoras: c.tipo_horas
            }));
  
            this.filtrarCursosPorModalidadYTipoHoras();
          },
          error: (err) => console.error('❌ Error al obtener cursos:', err)
        });
    } else {
      console.log("⚠️ No se llamó a la API de cursos porque falta algún parámetro.");
      this.cursos = [];
      this.cursosFiltrados = [];
    }
  }  
  
  onCicloChange() {
    console.log("🔄 Ciclo cambiado:", this.cicloSeleccionado);
    this.getCursos(); // 🔹 Llamamos la función al cambiar ciclo
  }
  
  onCarreraChange() {
    console.log("🔄 Especialidad cambiada:", this.carreraSeleccionada);
    this.getCursos(); // 🔹 Llamamos la función al cambiar especialidad
  }  
  
  filtrarCursosPorModalidadYTipoHoras() {
    this.cursosFiltrados = this.cursos.filter(curso => 
      curso.modalidad === Number(this.modalidadSeleccionada) && 
      curso.tipoHoras === this.tipoHorasSeleccionado &&
      curso.horas > 0
    );
  }
  //#endregion

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

  closeModal() {
    this.isModalOpen = false;
  }

  //#region Listar, Guardar y Editar eventos
  cargarHorarios() {
    this.horarioService.getHorario().subscribe({
      next: (data: Horario[]) => {
        console.log("📡 Horarios cargados:", data);
  
        // 🔹 Convertimos los datos al formato de FullCalendar
        this.events = data.map(evento => ({
          id: evento.id,
          title: evento.curso,
          start: evento.h_inicio,
          end: evento.h_fin,
          color: evento.color, 
          teacher: evento.docente,
          ciclo: evento.ciclo, 
          seccion: evento.seccion, 
          carrera: evento.carrera
        }));
  
        // 🔹 Asignamos los eventos convertidos a `calendarOptions`
        this.calendarOptions.events = [...this.events];
      },
      error: (err) => console.error("❌ Error al obtener horarios:", err)
    });
  }
  
  handleSelect({ startStr, endStr }: any) {
    this.newEvent = {
      curso: '',
      h_inicio: this.formatDate(new Date(startStr)),
      h_fin: this.formatDate(new Date(endStr)),
      color: ''
    };
    this.isModalOpen = true;
  }

  saveEvent() {
    if (!this.cursoSeleccionado) {
      this.alertService.error("El curso es obligatorio");
      return;
    }
    if (!this.newEvent.h_inicio) {
      this.alertService.error("La hora de inicio es obligatoria");
      return;
    }
    const curso = this.cursos.find(c => 
      c.nombre === this.cursoSeleccionado && c.tipoHoras === this.tipoHorasSeleccionado
    );
  
    const duracionHoras = curso ? curso.horas : 2;  
    const startDate = new Date(this.newEvent.h_inicio);  
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + duracionHoras);
  
    const newEvent: Horario = {
      id: String(Date.now()),
      curso: this.cursoSeleccionado,
      h_inicio: startDate.toISOString(),
      h_fin: endDate.toISOString(),
      color: this.newEvent.color || this.generarColorAleatorio(),
      docente: '',
      ciclo: this.cicloSeleccionado || '',
      seccion: this.seccionSeleccionada || '',
      carrera: this.carreraSeleccionada || '',
      dia: ''
    };
  
    this.events = [...this.events, newEvent];  
    this.horarioService.guardarHorarios([newEvent]).subscribe({
      next: () => {
        this.alertService.success("✅ Evento guardado correctamente en la BD.");
        this.getHorario();
        setTimeout(() => {
          this.calendarOptions.events = [...this.events];
        }, 100);
      },
      error: (err) => {
        this.alertService.error("❌ Error al guardar el evento.");
        console.error("Error:", err);
      }
    });
    this.cerrarModalAnimado("modal-evento", this.closeModal.bind(this));
  }
  
  // handleEventClick(eventInfo: any) {
  //   const event = eventInfo.event;
  //   if (!event) return;
  
  //   const eventColor = event.backgroundColor || event.color || '#3788d8';
  
  //   // 🔹 Buscar la duración del curso seleccionado
  //   const curso = this.cursos.find(c => c.nombre === event.title);
  //   const duracionHoras = curso ? curso.horas : 2; // Si no lo encuentra, usa 2 horas por defecto
  
  //   // 🔹 Convertir la hora de inicio a objeto `Date`
  //   const startDate = new Date(event.start as string);
  
  //   // 🔹 Calcular automáticamente la hora de fin
  //   const endDate = new Date(startDate);
  //   endDate.setHours(endDate.getHours() + duracionHoras);
  
  //   // 🔹 Asignar los valores al modal de edición
  //   this.selectedEvent = event;
  //   this.selectedEventCopy = {
  //     id: event.id,
  //     title: event.title,
  //     start: this.formatDate(startDate), // Convertir fecha inicio
  //     end: this.formatDate(endDate), // 🔹 Fecha fin calculada automáticamente
  //     color: eventColor,
  //     teacher: event.extendedProps?.teacher || ''
  //   };
  
  //   this.selectedTeacher = this.selectedEventCopy.teacher;
  //   this.isEventDetailsModalOpen = true;
  // }  

  // saveEditedEvent() {
  //   if (!this.selectedEvent || !this.selectedEventCopy) return;
  
  //   // 🔹 Buscar la duración del curso seleccionado
  //   const curso = this.cursos.find(c => c.nombre === this.selectedEventCopy.title);
  //   const duracionHoras = curso ? curso.horas : 2; // 🔹 2 horas por defecto si no encuentra el curso
  
  //   // 🔹 Convertir la hora de inicio en objeto `Date`
  //   const startDate = new Date(this.selectedEventCopy.start);
  
  //   // 🔹 Calcular la nueva hora de finalización
  //   const endDate = new Date(startDate);
  //   endDate.setHours(endDate.getHours() + duracionHoras);
  
  //   // 🔹 Asignar la nueva hora de fin en `selectedEventCopy.end`
  //   this.selectedEventCopy.end = this.formatDate(endDate);
  
  //   // 🔹 Actualizar los valores del evento
  //   this.selectedEvent.setProp('title', this.selectedEventCopy.title);
  //   this.selectedEvent.setStart(this.selectedEventCopy.start);
  //   this.selectedEvent.setEnd(this.selectedEventCopy.end);
  //   this.selectedEvent.setProp('backgroundColor', this.selectedEventCopy.color);
  //   this.selectedEvent.setProp('borderColor', this.selectedEventCopy.color);
  //   this.selectedEvent.setExtendedProp('teacher', this.selectedTeacher);
  
  //   this.alertService.success("✅ Cambios guardados correctamente.");
  //   this.cerrarModalDetallesConAnimacion();
  // }

  // deleteEvent() {
  //   if (!this.selectedEvent) return;

  //   this.events = this.events.filter(event => event.id !== this.selectedEvent?.id);
  //   this.selectedEvent.remove();
  //   this.calendarOptions.events = [...this.events];

  //   this.aplicarFiltrosYActualizarTexto()
  //   this.closeEventDetailsModal();
  // }
  
  //#endregion
  
  //#region animacion cerrar
  cerrarModalAnimado(idModal: string, callback: () => void) {
    const modal = document.getElementById(idModal);
    if (modal) {
      modal.style.opacity = "1";
      modal.style.transition = "opacity 0.5s ease-out";

      setTimeout(() => (modal.style.opacity = "0"), 100);
      setTimeout(() => {
        modal.style.display = "none";
        this.isModalOpen = false;
        callback();
      }, 600);
    } else {
      callback();
    }
  }

  cerrarModalDetallesConAnimacion() {
    this.cerrarModalAnimado("modal-detalles-evento", () => (this.isEventDetailsModalOpen = false));
  }
  //#endregion

  // closeEventDetailsModal() {
  //   this.isEventDetailsModalOpen = false;
  //   this.selectedEvent = null;
  //   this.selectedEventCopy = null;
  // }

  aplicarFiltrosYActualizarTexto() {
    const filtros: string[] = [];
  
    // 📌 Definir los turnos con su rango de horas
    const turnos: Record<string, { min: string; max: string }> = {
      'Mañana': { min: '07:00:00', max: '17:59:59' },
      'Noche': { min: '18:00:00', max: '22:59:59' },
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
  
  //#region ver horario luego de los filtros
  verificarFiltrosCompletos(): boolean {
    return (
      this.facultadSeleccionada !== '' &&
      this.modalidadSeleccionada !== null &&
      this.cicloSeleccionado !== '' &&
      this.seccionSeleccionada !== '' &&
      this.carreraSeleccionada !== ''
    );
  }

  mostrarHorarioHandler() {
    if (this.verificarFiltrosCompletos()) {
      this.mostrarHorario = true; // 🔹 Solo muestra el horario si todos los filtros están completos
      this.getHorario(); // 🔹 Llama a la API para obtener el horario
    } else {
      this.alertService.error("⚠️ Selecciona todos los filtros antes de ver el horario.");
    }
  }

  getHorario() {
    this.horarioService.getHorario().subscribe({
      next: (data: Horario[]) => {
        this.events = data.map(evento => ({
          id: evento.id,
          title: evento.curso,
          start: evento.h_inicio,
          end: evento.h_fin,
          color: evento.color,
          teacher: evento.docente,
          ciclo: evento.ciclo,
          seccion: evento.seccion,
          carrera: evento.carrera
        }));
  
        this.calendarOptions.events = [...this.events]; // 🔹 Actualiza FullCalendar
      },
      error: (err) => console.error("❌ Error al obtener horario:", err)
    });
  }
  //#endregion
  
  // exportarEstadoComoJSON() {
  //   const estadoActual = {
  //     eventos: this.events, // Todos los eventos registrados
  //     eventoSeleccionado: this.selectedEvent || null, // Último evento seleccionado o null
  //     // eventoNuevo: this.newEvent, // Evento en proceso de creación
  //     filtros: {
  //       ciclo: this.cicloSeleccionado || null,
  //       seccion: this.seccionSeleccionada || null,
  //       carrera: this.carreraSeleccionada || null,
  //       turno: this.turnoSeleccionado || null,
  //     },
  //     modalAbierto: this.isModalOpen, // Indica si el modal está abierto
  //     fechaExportacion: new Date().toISOString(), // Marca de tiempo de exportación
  //   };
  
  //   console.log("📌 Estado del componente en JSON:", JSON.stringify(estadoActual, null, 2));
  // }

}