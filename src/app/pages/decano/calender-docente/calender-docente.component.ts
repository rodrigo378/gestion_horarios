import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteService } from '../../../services/docente.service';

const diasMap: Record<string, number> = {
  LUNES: 1,
  MARTES: 2,
  MIÉRCOLES: 3,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SÁBADO: 6,
  SABADO: 6,
};

@Component({
  selector: 'app-calender-docente',
  standalone: false,
  templateUrl: './calender-docente.component.html',
  styleUrl: './calender-docente.component.css',
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
    height: 'auto',
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    events: [],
    hiddenDays: [0],

    eventDidMount: (info) => {
      const evento = info.event.extendedProps as any;
      const curso = info.event.title || 'Curso';
      const seccion = evento.c_grpcur
        ? `<span style="font-weight:700;color:#FFD700;background:rgba(255,255,255,0.15);padding:2px 6px;border-radius:5px;margin-left:3px;">${evento.c_grpcur}</span>`
        : '<span style="opacity:0.8;">Sin sección</span>';
      const aula = evento.aula
        ? `<span style="color:#d1fae5;font-weight:600;">Aula ${evento.aula}</span>`
        : '<span style="opacity:0.8;">Sin asignar aula</span>';

      // ✅ Tooltip completo
      info.el.setAttribute(
        'title',
        `${curso}\nSección: ${evento.c_grpcur || 'Sin sección'}\n${
          evento.aula ? 'Aula ' + evento.aula : 'Sin asignar aula'
        }`
      );

      // ✅ Contenido visual mejorado
      const el = info.el.querySelector('.fc-event-title');
      if (el) {
        el.innerHTML = `
          <div style="font-weight:700;font-size:12px;">${curso}</div>
          <div style="font-size:14px;margin-top:3px;">Sección ${seccion}</div>
          <div style="font-size:13px;opacity:0.95;margin-top:2px;">${aula}</div>
        `;
      }
    },
  };

  constructor(
    private docenteService: DocenteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const docenteId = +params['id'];
      if (!docenteId) return;
      this.cargarHorarioDocente(docenteId);
    });
  }

  private cargarHorarioDocente(docenteId: number): void {
    this.docenteService
      .obtenerDocentesreporteria(true, true, true)
      .subscribe((docentes) => {
        const docente = docentes.find((d) => d.id === docenteId);
        if (!docente) return;

        this.nombreDocente = docente.c_nomdoc;

        const baseDate = new Date('2024-01-01');

        const eventos = docente.horarios!.map((h) => {
          const diaUpper = (h.dia || '').toUpperCase();
          const diaOffset = diasMap[diaUpper] ?? 1;

          const fechaInicio = new Date(baseDate);
          fechaInicio.setDate(baseDate.getDate() + (diaOffset - 1));
          const fechaBase = fechaInicio.toISOString().split('T')[0];

          const backgroundColor =
            h.modalidad === 'pre'
              ? '#0c7734'
              : h.modalidad === 'vir'
              ? '#7E22CE'
              : '#9CA3AF';

          return {
            title: h.curso?.plan?.c_nomcur || 'Curso',
            start: `${fechaBase}T${h.h_inicio}`,
            end: `${fechaBase}T${h.h_fin}`,
            backgroundColor,
            borderColor: backgroundColor,
            dia: h.dia,
            aula: h.aula?.c_codaula || '',
            c_grpcur: h.turno?.c_grpcur || '',
          };
        });

        this.calendarOptions = { ...this.calendarOptions, events: eventos };
      });
  }

  regresar() {
    const currentPrefix = this.router.url.split('/')[1];
    this.router.navigate([`/${currentPrefix}/docente`]);
  }
}
