import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { ActivatedRoute, Router } from '@angular/router';
import { Turno } from '../../interfaces/turno';
import { HorarioService } from '../../services/horario.service';
import { TurnoService } from '../../services/turno.service';

@Component({
  selector: 'app-calender-director',
  standalone: false,
  templateUrl: './calender-director.component.html',
  styleUrl: './calender-director.component.css'
})
export class CalenderDirectorComponent implements OnInit {

  turnoData!: Turno;
  turnoId!: number;

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
    private route: ActivatedRoute, 
    private horarioService: HorarioService,
    private turnoServices: TurnoService) {}


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.turnoId = +params['id'];
      if (this.turnoId) {
        this.cargarEventosPorTurno(this.turnoId);
        this.cargarDatosTurno(this.turnoId);
      }
    });
  }

  
  cargarEventosPorTurno(turnoId: number): void {
    this.horarioService.getHorarioPorTurno(turnoId).subscribe(data => {
      const eventos = data.map((h: any) => {
        let color = h.tipo === 'Práctica' ? '#28a745' : '#3788d8';

        const tipoPadre = h.curso?.cursosPadres?.[0]?.tipo;
        if (tipoPadre === 0) color = '#facc15'; // Amarillo (Transversal)
        if (tipoPadre === 1) color = '#9333ea'; // Morado (Agrupado)

        return {
          title: `${h.curso?.c_nomcur} (${h.tipo})`,
          start: h.h_inicio,
          end: h.h_fin,
          backgroundColor: color,
          borderColor: color,
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
}
