import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
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
  styleUrl: './calender-director.component.css'
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
    eventClick: this.onEventClick.bind(this)
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
  
  

  
  cargarEventosPorTurno(turnoId: number): void {
    this.horarioService.getHorarioPorTurno(turnoId).subscribe(data => {
      const eventos = data.map((h: any) => {
        let color = h.tipo === 'Práctica' ? '#28a745' : '#3788d8';
  
        const tipoPadre = h.curso?.cursosPadres?.[0]?.tipo;
        if (tipoPadre === 0) color = '#EAB308'; // Amarillo (Transversal)
        if (tipoPadre === 1) color = '#9333ea'; // Morado (Agrupado)
  
        // 🏛️ Buscar nombre de docente
        const docenteObj = this.docentes.find(d => d.id === h.docente_id);
        const nombreDocente = docenteObj ? docenteObj.c_nomdoc : 'Sin docente';
  
        // 🏫 Buscar nombre de aula
        const aulaObj = this.aulas.find(a => a.id === h.aula_id);
        const nombreAula = aulaObj ? aulaObj.c_codaula : 'Sin aula';
  
        return {
          title: `${h.curso?.c_nomcur} (${h.tipo}) - ${nombreDocente} - Aula ${nombreAula}`,
          start: h.h_inicio,
          end: h.h_fin,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            ...h,
            curso: h.curso,
            docente: nombreDocente,
            aula: nombreAula,
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

}
