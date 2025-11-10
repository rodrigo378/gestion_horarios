import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { ActivatedRoute } from '@angular/router';
import { AulaService } from '../../../services/aula.service';
import { AlertService } from '../../../services/alert.service'; // 👈 agregado

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
    events: [],
    hiddenDays: [0],
  };

  constructor(
    private aulaService: AulaService,
    private route: ActivatedRoute,
    private alertService: AlertService // 👈 agregado
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
    // 🟢 Mostrar loader
    setTimeout(() => {
      this.alertService.showLoadingScreen('Cargando horario del aula...');
    });

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

    this.aulaService.getAula().subscribe({
      next: (aulas) => {
        const aula = aulas.find((a) => a.id === aulaId);
        if (!aula) {
          this.alertService.saveError('No se encontró el aula seleccionada.');
          this.alertService.close();
          return;
        }

        // 🏷️ Nombre del aula en el encabezado
        this.nombreAula = `Aula ${aula.c_codaula} - Pabellón ${
          aula.pabellon
        } - ${this.obtenerNombrePiso(aula.n_piso)}`;

        const baseDate = new Date('2024-01-01');
        const eventos = aula.horarios!.map((h) => {
          const diaUpper = (h.dia || '').toUpperCase();
          const diaOffset = diasMap[diaUpper] ?? 1;

          const fechaInicio = new Date(baseDate);
          fechaInicio.setDate(baseDate.getDate() + (diaOffset - 1));
          const fechaBase = fechaInicio.toISOString().split('T')[0];

          let backgroundColor = h.tipo === 'PRA' ? '#16a34a' : '#2563eb';
          let borderColor = backgroundColor;

          const tipoPadre = h.curso?.grupos_padre?.[0]?.tipo;
          if (tipoPadre === 0) backgroundColor = borderColor = '#facc15'; // transversal
          if (tipoPadre === 1) backgroundColor = borderColor = '#9333ea'; // agrupado

          const seccion = h.curso?.turno?.c_grpcur
            ? ` (Sec. ${h.curso.turno.c_grpcur})`
            : '';
          const docente = h.docente?.c_nomdoc
            ? ` - ${h.docente.c_nomdoc}`
            : ' - Sin docente';

          return {
            title: `${h.curso?.plan?.c_nomcur || 'Curso'}${seccion}${docente}`,
            start: `${fechaBase}T${h.h_inicio}`,
            end: `${fechaBase}T${h.h_fin}`,
            backgroundColor,
            borderColor,
          };
        });

        // ✅ Asigna eventos al calendario
        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos,
        };

        // 🔵 Cierra loader al terminar
        this.alertService.close();
      },
      error: (error) => {
        console.error('Error al obtener aulas:', error);
        this.alertService.saveError('Error al cargar el horario del aula.');
        this.alertService.close();
      },
    });
  }
}
