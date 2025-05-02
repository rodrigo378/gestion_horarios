import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { DocentecurService } from '../../services/docentecur.service';
import { ActivatedRoute, Router } from '@angular/router';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const docenteId = +params['id'];
      if (!docenteId) {
        console.warn('⚠️ No se recibió ID');
        return;
      }
      this.cargarHorarioDocente(docenteId);
    });
  }

  private cargarHorarioDocente(docenteId: number): void {
    this.docenteService
      .obtenerDocentesreporteria(true, true, true)
      .subscribe((docentes) => {
        const docente = docentes.find((d) => d.id === docenteId);

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
            backgroundColor = '#EAB308'; // Transversal
            borderColor = '#EAB308';
          } else if (tipoPadre === 1) {
            backgroundColor = '#7E22CE'; // Agrupado
            borderColor = '#7E22CE';
          } else {
            backgroundColor = h.tipo === 'Teoría' ? '#3788d8' : '#28a745';
            borderColor = backgroundColor;
          }

          const aulaNombre = h.aula?.c_codaula
            ? ` - Aula ${h.aula.c_codaula}`
            : '';

          return {
            title: `${h.curso?.c_nomcur || 'Curso'} (${h.tipo})${aulaNombre}`,
            start: h.h_inicio,
            end: h.h_fin,
            backgroundColor,
            borderColor,
          };
        });

        this.calendarOptions.events = eventos;
      });
  }

  regresar() {
    const currentPrefix = this.router.url.split('/')[1];
    this.router.navigate([`/${currentPrefix}/docente`]);
  }
}
