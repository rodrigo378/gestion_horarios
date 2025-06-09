import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import esLocale from '@fullcalendar/core/locales/es';
import { ActivatedRoute } from '@angular/router';
import { Turno } from '../../interfaces/turno';
import { HorarioService } from '../../services/horario.service';
import { TurnoService } from '../../services/turno.service';
import { HorarioExtendido } from '../../interfaces/Horario';
import { DocentecurService } from '../../services/docentecur.service';
import { AulaService } from '../../services/aula.service';
import { Docente } from '../../interfaces/Docente';
import { Aula } from '../../interfaces/Aula';

@Component({
  selector: 'app-calender-director',
  standalone: false,
  templateUrl: './calender-director.component.html',
  styleUrl: './calender-director.component.css',
})
export class CalenderDirectorComponent implements OnInit {
  turnoData!: Turno;
  turnoId!: number;

  showModal: boolean = false;
  selectedDay: string = '';
  selectedClasses: any[] = [];

  docentes: Docente[] = [];
  aulas: Aula[] = [];


  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialDate: '2024-01-01',
    initialView: 'timeGridWeek',
    headerToolbar: { left: '', center: '', right: '' },
    buttonText: { today: 'Hoy', week: 'Semana' },
    locale: esLocale,
    slotMinTime: '08:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    editable: false,
    selectable: false,
    droppable: false,
    eventStartEditable: false,
    eventDurationEditable: false,
    height: 'auto',
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    events: [], // Acá vas a cargar los eventos del docente
    hiddenDays: [0], // oculta domingo
    eventClick: this.onEventClick.bind(this),
    eventDidMount: this.estilizarEvento.bind(this),
  };

  constructor(
    private route: ActivatedRoute,
    private horarioService: HorarioService,
    private turnoServices: TurnoService,
    private docenteService: DocentecurService,
    private aulaService: AulaService,
  ) {}
  


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.turnoId = +params['id'];
      if (this.turnoId) {
        this.cargarDatosTurno(this.turnoId);
        this.cargarDocentesYAulasYEventos(this.turnoId); // 👈 aquí corregimos
      }
    });
  }
  
  // 💡 Nuevo método combinado
  private cargarDocentesYAulasYEventos(turnoId: number): void {
    this.docenteService.obtenerDocentes().subscribe((docentes) => {
      this.docentes = docentes;
      this.aulaService.obtenerAulas().subscribe((aulas) => {
        this.aulas = aulas;
        // 🔥 SOLO cuando docentes + aulas ya están cargados, ahora sí carga eventos
        this.cargarEventosPorTurno(turnoId);
      });
    });
  }
    
  estilizarEvento(info: any): void {
    info.el.classList.add('evento-separado');

    const modalidad = info.event.extendedProps.modalidadTexto ?? '';
    const modalidadTipo = info.event.extendedProps.modalidad ?? '';
    const tipcur = info.event.extendedProps.tipcur === 'P' ? 'Práctica' : 'Teoría';

    // 🔵 Badge superior derecho: Modalidad (Virtual/Presencial)
    const badgeTopRight = document.createElement('div');
    badgeTopRight.textContent = modalidad;
    badgeTopRight.style.position = 'absolute';
    badgeTopRight.style.top = '2px';
    badgeTopRight.style.right = '4px';
    badgeTopRight.style.backgroundColor = modalidadTipo === 'vir' ? '#9333EA' : '#FACC15';
    badgeTopRight.style.color = '#fff';
    badgeTopRight.style.padding = '2px 6px';
    badgeTopRight.style.borderRadius = '8px';
    badgeTopRight.style.fontSize = '10px';
    badgeTopRight.style.fontWeight = 'Extra Bold';
    badgeTopRight.style.zIndex = '10';
    badgeTopRight.style.color = '#ffffff';

    // 🟢 Badge inferior derecho: Teoría o Práctica
    const badgeBottomRight = document.createElement('div');
    badgeBottomRight.textContent = tipcur;
    badgeBottomRight.style.position = 'absolute';
    badgeBottomRight.style.bottom = '2px';
    badgeBottomRight.style.right = '4px';
    badgeBottomRight.style.backgroundColor = '#006aff';
    badgeBottomRight.style.color = '#fff';
    badgeBottomRight.style.padding = '2px 6px';
    badgeBottomRight.style.borderRadius = '8px';
    badgeBottomRight.style.fontSize = '10px';
    badgeBottomRight.style.fontWeight = 'bold';
    badgeBottomRight.style.zIndex = '10';

    info.el.appendChild(badgeTopRight);
    info.el.appendChild(badgeBottomRight);
  }

  cargarEventosPorTurno(turnoId: number): void {
    this.horarioService.getHorarioPorTurno(turnoId).subscribe((data) => {
      const eventos = data.map((h: any) => {
        // 🎨 Asignar color y texto por modalidad
        let color = '';
        let modalidadTexto = '';
        if (h.modalidad === 'pre') {
          color = '#e9b109'; // Amarillo para semipresencial
          modalidadTexto = 'Presencial';
        } else if (h.modalidad === 'vir') {
          color = '#7E22CE'; // Morado para virtual
          modalidadTexto = 'Virtual';
        } else {
          color = '#9CA3AF'; // Gris si no se especifica
          modalidadTexto = 'Sin modalidad';
        }

        // 🧑‍🏫 Buscar nombre de docente
        const docenteObj = this.docentes.find(d => d.id === h.docente_id);
        const nombreDocente = docenteObj ? docenteObj.c_nomdoc : 'Sin docente';

        // 🏫 Buscar nombre de aula
        const aulaObj = this.aulas.find(a => a.id === h.aula_id);
        const nombreAula = aulaObj ? aulaObj.c_codaula : 'Sin aula';

        return {
          title: `${h.curso?.c_codcur} - ${h.curso?.c_nomcur} - ${nombreDocente} - Aula ${nombreAula}`,
          start: h.h_inicio,
          end: h.h_fin,
          backgroundColor: color,
          borderColor: color,
            extendedProps: {
              ...h,
              curso: h.curso,
              docente: nombreDocente,
              aula: nombreAula,
              modalidad: h.modalidad,
              modalidadTexto,
              tipcur: h.tipcur, // <-- Añade esto
            }
        };
      });
      this.calendarOptions.events = eventos;
    });
  }
  

  cargarDatosTurno(id: number): void {
    this.turnoServices.getTurnoById(id).subscribe((turno) => {
      this.turnoData = turno;
    });
  }

  onEventClick(info: any): void {
    const evento = info.event.extendedProps as HorarioExtendido;
  
    this.selectedDay = evento.dia;
  
    // Buscar docente
    const docente = this.docentes.find(d => d.id === evento.docente_id);
    const nombreDocente = docente ? docente.c_nomdoc : 'Sin docente';
  
    // Buscar aula
    const aula = this.aulas.find(a => a.id === evento.aula_id);
    const nombreAula = aula ? `Aula ${aula.c_codaula} - ${this.obtenerNombrePiso(aula.n_piso)}` : 'Sin aula';
  
    this.selectedClasses = [
      {
        subject: evento.curso?.c_nomcur ?? 'Curso',
        codcurso: evento.curso?.c_codcur?? '',
        time: `${this.formatHora(evento.h_inicio)} - ${this.formatHora(evento.h_fin)}`,
        faculty: this.turnoData?.nom_fac ?? '---',
        cycle: evento.curso?.n_ciclo ? `${evento.curso.n_ciclo}°` : (this.turnoData?.n_ciclo ? `${this.turnoData.n_ciclo}°` : '---'),
        floor: nombreAula, // Aquí sale Aula + Piso bonito
        modality: this.obtenerNombreModalidad(Number(this.turnoData?.c_codmod) ?? null),
        docente: nombreDocente, // Aquí traemos el docente
      },
    ];
  
    this.showModal = true;
  }
  
  formatHora(horaISO: string): string {
    const date = new Date(horaISO);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  obtenerNombrePiso(piso: number | null): string {
    const nombres: { [key: string]: string } = {
      '-1': 'Sótano',
      '0': 'Sótano',
      '1': '1er piso',
      '2': '2do piso',
      '3': '3er piso',
      '4': '4to piso',
      '5': '5to piso',
      '6': '6to piso',
      '7': '7mo piso',
    };
    return piso != null ? (nombres[piso.toString()] || `Piso ${piso}`) : '---';
  }
  
  obtenerNombreModalidad(mod: number | null): string {
    const modalidades: { [key: number]: string } = {
      1: 'PRESENCIAL',
      2: 'SEMIPRESENCIAL',
      3: 'VIRTUAL',
    };
    return mod != null ? modalidades[mod] : '---';
  }
  
  closeModal(): void {
  this.showModal = false;
  this.selectedDay = '';
  this.selectedClasses = [];
}

  exportarCalendarioAPDF(): void {
    const calendarioEl = document.querySelector('.fc'); // Asegúrate que este selector sea correcto
    if (!calendarioEl) {
      console.warn('❌ No se encontró el calendario en el DOM.');
      return;
    }

    html2canvas(calendarioEl as HTMLElement, {
      scale: 3, // Mejor resolución
      useCORS: true, // Por si tienes imágenes cargadas
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('calendario.pdf');
    });
  }

  capturarCalendario() {
    const calendarioEl = document.querySelector('.fc'); // o '#calendar'
    if (!calendarioEl) return;

    html2canvas(calendarioEl as HTMLElement).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'calendario.png';
      link.click();
    });
  }

}
