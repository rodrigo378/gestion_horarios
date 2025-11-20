import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteService } from '../../../services/docente.service';
import { AlertService } from '../../../services/alert.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

      const curso = info.event.extendedProps['codCurso']
        ? `${info.event.extendedProps['codCurso']} – ${info.event.extendedProps['cursoNombre']}`
        : info.event.title;

      const aula = evento.aulas?.length
        ? `<span style="color:#d1fae5;font-weight:600;">${evento.aulas.join(
            ', '
          )}</span>`
        : '<span style="opacity:0.8;">Sin asignar aula</span>';

      info.el.setAttribute(
        'title',
        `${curso}
        Secciones: ${evento.secciones?.join(', ') || 'Sin sección'}
        Aulas: ${evento.aulas?.join(', ') || 'Sin aula'}`
      );

      const el = info.el.querySelector('.fc-event-title');
      if (el) {
        el.innerHTML = `
          <div style="font-weight:700;font-size:12px;">${curso}</div>
          <div style="font-size:13px;opacity:0.95;margin-top:2px;">${aula}</div>
        `;
      }
    },
  };

  constructor(
    private docenteService: DocenteService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const docenteId = +params['id'];
      if (!docenteId) return;
      this.cargarHorarioDocente(docenteId);
    });
  }

  descargarCalendarioPDF() {
    const calendar = document.querySelector('.fc');

    if (!calendar) {
      console.error('Calendario no encontrado');
      return;
    }

    // 1. Activar Print Mode
    document.body.classList.add('print-mode');

    setTimeout(() => {
      html2canvas(calendar as HTMLElement, {
        scale: 3, // resolución alta
        useCORS: true,
        allowTaint: true,
      }).then((canvas) => {
        // 2. Crear PDF
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;
        const imgHeight = canvas.height * (pdfWidth / canvas.width);

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        pdf.save(`Horario_${this.nombreDocente}.pdf`);

        // 3. Restaurar modo normal
        document.body.classList.remove('print-mode');
      });
    }, 300); // tiempo para aplicar estilos
  }

  private combinarHorarios(horarios: any[]) {
    const grupos = new Map<string, any>();

    for (const h of horarios) {
      const codCurso = h.curso?.plan?.c_codcur ?? 'CURSO';

      const key = [h.dia, h.h_inicio, h.h_fin, h.modalidad, codCurso].join('|');

      if (!grupos.has(key)) {
        grupos.set(key, {
          dia: h.dia,
          h_inicio: h.h_inicio,
          h_fin: h.h_fin,
          modalidad: h.modalidad,
          codCurso,
          cursoNombre: h.curso?.plan?.c_nomcur || 'Curso',
          especialidades: [],
          secciones: [],
          aulas: [],
        });
      }

      const grupo = grupos.get(key);

      grupo.especialidades.push(h.curso?.plan?.c_codesp ?? '-');
      grupo.secciones.push(h.turno?.c_grpcur ?? '-');
      grupo.aulas.push(h.aula?.c_codaula ?? 'Sin aula');
    }

    console.log(
      ' => ',
      Array.from(grupos.values()).map((g) => ({
        ...g,
        secciones: [...new Set(g.secciones)],
        aulas: [...new Set(g.aulas)],
        especialidades: [...new Set(g.especialidades)],
      }))
    );

    return Array.from(grupos.values()).map((g) => ({
      ...g,
      secciones: [...new Set(g.secciones)],
      aulas: [...new Set(g.aulas)],
      especialidades: [...new Set(g.especialidades)],
    }));
  }

  private cargarHorarioDocente(docenteId: number): void {
    this.alertService.showLoadingScreen('Cargando horario del docente...');

    this.docenteService.getDocente(docenteId).subscribe({
      next: (docente) => {
        if (!docente) {
          this.alertService.saveError('Docente no encontrado.');
          this.alertService.close();
          return;
        }

        this.nombreDocente = docente.c_nomdoc;

        // 🔥 COMBINAR LOS HORARIOS
        const horariosCombinados = this.combinarHorarios(
          docente.horarios || []
        );

        const baseDate = new Date('2024-01-01');

        const eventos = horariosCombinados.map((h: any) => {
          const diaUpper = (h.dia || '').toUpperCase();
          const diaOffset = diasMap[diaUpper] ?? 1;

          const fecha = new Date(baseDate);
          fecha.setDate(baseDate.getDate() + (diaOffset - 1));
          const fechaBase = fecha.toISOString().split('T')[0];

          const backgroundColor =
            h.modalidad === 'pre'
              ? '#0c7734'
              : h.modalidad === 'vir'
              ? '#7E22CE'
              : '#9CA3AF';

          return {
            title: `${h.codCurso} – ${h.cursoNombre}`,
            start: `${fechaBase}T${h.h_inicio}`,
            end: `${fechaBase}T${h.h_fin}`,
            backgroundColor,
            borderColor: backgroundColor,
            extendedProps: {
              codCurso: h.codCurso,
              cursoNombre: h.cursoNombre,
              especialidades: h.especialidades,
              secciones: h.secciones,
              aulas: h.aulas,
            },
          };
        });

        this.calendarOptions = { ...this.calendarOptions, events: eventos };

        this.alertService.close();
      },
      error: (err) => {
        console.error(err);
        this.alertService.saveError(
          'Ocurrió un error al cargar el horario del docente.'
        );
        this.alertService.close();
      },
    });
  }

  regresar() {
    const currentPrefix = this.router.url.split('/')[1];
    this.router.navigate([`/${currentPrefix}/docente`]);
  }
}
