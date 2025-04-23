import { Component } from '@angular/core';
import { OnInit, ViewChild } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Draggable } from '@fullcalendar/interaction';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { DocentecurService } from '../../services/docentecur.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-calender-docente',
  standalone: false,
  templateUrl: './calender-docente.component.html',
  styleUrl: './calender-docente.component.css'
})
export class CalenderDocenteComponent implements OnInit {

  nombreDocente: string = '';

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
  };

  constructor(
    private docenteService: DocentecurService,
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const docenteId = +params['id'];
      if (!docenteId) {
        console.warn('⚠️ No se recibió ID');
        return;
      }
      this.cargarHorarioDocente(docenteId);
    });
  }

  private cargarHorarioDocente(docenteId: number): void {
    this.docenteService.obtenerDocentesreporteria().subscribe((docentes) => {
      const docente = docentes.find(d => d.id === docenteId);

      if (!docente) {
        console.warn('⚠️ Docente no encontrado');
        return;
      }

      this.nombreDocente = docente.c_nomdoc;

      const eventos = docente.Horario.map((h) => {
        const tipoPadre = h.curso?.cursosPadres?.[0]?.tipo;

        let backgroundColor = '';
        let borderColor = '';

        if (tipoPadre === 0) {
          // Curso transversal
          backgroundColor = '#EAB308'; // Amarillo
          borderColor = '#EAB308';
        } else if (tipoPadre === 1) {
          // Curso agrupado
          backgroundColor = '#7E22CE'; // Morado
          borderColor = '#7E22CE';
        } else {
          // Normal
          backgroundColor = h.tipo === 'Teoría' ? '#3788d8' : '#28a745';
          borderColor = h.tipo === 'Teoría' ? '#3788d8' : '#28a745';
        }

        return {
          title: `${h.curso?.c_nomcur || 'Curso'} - (${h.tipo})`,
          start: h.h_inicio,
          end: h.h_fin,
          backgroundColor,
          borderColor,
        };
      });

      this.calendarOptions.events = eventos;
    });
  }
}
