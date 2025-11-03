import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { ActivatedRoute } from '@angular/router';
import { AulaService } from '../../../services_2/aula.service';
@Component({
  selector: 'app-calender-aula',
  standalone: false,
  templateUrl: './calender-aula.component.html',
  styleUrl: './calender-aula.component.css',
})
export class CalenderAulaComponent implements OnInit {
  nombreAula: string = '';
  aulaId: number = 1;

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
    private aulaService: AulaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const aulaId = +params['id'];
      if (!aulaId) return;
      this.cargarHorarioAula(aulaId);
    });
  }

  obtenerNombrePiso(piso: number): string {
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
    return nombres[piso.toString()] || `Piso ${piso}`;
  }

  private cargarHorarioAula(aulaId: number): void {
    this.aulaService.getAula().subscribe((aulas) => {
      const aula = aulas.find((a) => a.id === aulaId);
      if (!aula) return;

      this.nombreAula = `Aula ${aula.c_codaula} - Pabellón ${
        aula.pabellon
      } - ${this.obtenerNombrePiso(aula.n_piso)}`;

      const eventos = aula.horarios!.map((h) => {
        let backgroundColor = h.tipo === 'Teoría' ? '#3788d8' : '#28a745';
        let borderColor = backgroundColor;

        // Revisar si es agrupado o transversal
        const tipoPadre = h.curso?.grupos_padre?.[0]?.tipo;
        if (tipoPadre === 0) backgroundColor = borderColor = '#facc15'; // amarillo
        if (tipoPadre === 1) backgroundColor = borderColor = '#9333ea'; // morado

        // // Etiqueta visual opcional para el tipo
        // let etiquetaTipo = '';
        // if (tipoPadre === 0) etiquetaTipo = ' [Transversal]';
        // if (tipoPadre === 1) etiquetaTipo = ' [Agrupado]';

        return {
          title: `${h.curso?.plan?.c_nomcur || 'Curso'} (${h.tipo}) - ${
            h.docente?.c_nomdoc || 'Sin docente'
          }`,
          start: h.h_inicio,
          end: h.h_fin,
          backgroundColor,
          borderColor,
        };
      });

      // this.calendarOptions.events = eventos;
    });
  }
}
