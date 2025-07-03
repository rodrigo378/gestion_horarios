// import { Component, OnInit } from '@angular/core';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { ActivatedRoute } from '@angular/router';
// import { Turno } from '../../../interfaces/turno';
// import { Docente } from '../../../interfaces/Docente';
// import { Aula } from '../../../interfaces/Aula';
// import { HorarioService } from '../../../services/horario.service';
// import { TurnoService } from '../../../services/turno.service';
// import { DocenteService } from '../../../services/docente.service';
// import { AulaService } from '../../../services/aula.service';

// @Component({
//   selector: 'app-calender-director',
//   standalone: false,
//   templateUrl: './calender-director.component.html',
//   styleUrl: './calender-director.component.css',
// })
// export class CalenderDirectorComponent implements OnInit {
//   turnoData!: Turno;
//   turnoId!: number;
//   showModal: boolean = false;
//   selectedDay: string = '';
//   selectedClasses: any[] = [];
//   docentes: Docente[] = [];
//   aulas: Aula[] = [];
//   eventos: any[] = [];
//   dias: string[] = [
//     'Lunes',
//     'Martes',
//     'Miércoles',
//     'Jueves',
//     'Viernes',
//     'Sábado',
//   ];
//   horas: string[] = [];
//   turnoFiltro: string = 'todos'; // 'todos' | 'mañana' | 'tarde' | 'noche'
//   horaInicioFiltro: string = '07:00';
//   horaFinFiltro: string = '23:00';

//   constructor(
//     private route: ActivatedRoute,
//     private horarioService: HorarioService,
//     private turnoServices: TurnoService,
//     private docenteService: DocenteService,
//     private aulaService: AulaService
//   ) {}

//   ngOnInit(): void {
//     this.generarHoras('07:00', '23:00'); // puedes ajustar el rango
//     this.route.queryParams.subscribe((params) => {
//       this.turnoId = +params['id'];
//       if (this.turnoId) {
//         this.cargarDatosTurno(this.turnoId);
//         this.cargarDocentesYAulasYEventos(this.turnoId);
//       }
//     });
//   }

//   generarHoras(inicio: string, fin: string): void {
//     const [hInicio] = inicio.split(':').map(Number);
//     const [hFin] = fin.split(':').map(Number);

//     for (let h = hInicio; h <= hFin; h++) {
//       const hora = `${h.toString().padStart(2, '0')}:00`;
//       this.horas.push(hora);
//     }
//   }

//   diaANombre(diaNum: number): string {
//     const nombres = [
//       'Domingo',
//       'Lunes',
//       'Martes',
//       'Miércoles',
//       'Jueves',
//       'Viernes',
//       'Sábado',
//     ];
//     return nombres[diaNum] || '---';
//   }

//   obtenerEvento(dia: string, hora: string): any | null {
//     const horaNum = parseInt(hora.split(':')[0], 10);
//     return this.eventos.find(
//       (e) => e.dia === dia && new Date(e.h_inicio).getHours() === horaNum
//     );
//   }

//   mostrarHora(hora: string): boolean {
//     const horaNum = parseInt(hora.split(':')[0], 10);
//     const inicio = parseInt(this.horaInicioFiltro.split(':')[0], 10);
//     const fin = parseInt(this.horaFinFiltro.split(':')[0], 10);

//     return horaNum >= inicio && horaNum <= fin;
//   }

//   get horasFiltradas(): string[] {
//     return this.horas.filter((h) => this.mostrarHora(h));
//   }

//   // 💡 Nuevo método combinado
//   private cargarDocentesYAulasYEventos(turnoId: number): void {
//     this.docenteService.obtenerDocentes().subscribe((docentes) => {
//       this.docentes = docentes;
//       this.aulaService.obtenerAulas().subscribe((aulas) => {
//         this.aulas = aulas;
//         // 🔥 SOLO cuando docentes + aulas ya están cargados, ahora sí carga eventos
//         this.cargarEventosPorTurno(turnoId);
//       });
//     });
//   }

//   cargarEventosPorTurno(turnoId: number): void {
//     this.horarioService.getHorarioPorTurno(turnoId).subscribe((data) => {
//       const eventos = data.map((h: any) => {
//         // 🎨 Color y nombre de modalidad
//         let color = '';
//         let modalidadTexto = '';

//         switch (h.modalidad) {
//           case 'pre':
//             color = '#F59E0B'; // Presencial
//             modalidadTexto = 'Presencial';
//             break;
//           case 'vir':
//             color = '#7E22CE'; // Virtual
//             modalidadTexto = 'Virtual';
//             break;
//           case 'lab':
//             color = '#0EA5E9'; // Laboratorio
//             modalidadTexto = 'Laboratorio';
//             break;
//           case 'tev':
//             color = '#10B981'; // Teoría Virtual
//             modalidadTexto = 'Teoría Virtual';
//             break;
//           case 'lbp':
//             color = '#EF4444'; // Laboratorio Presencial
//             modalidadTexto = 'Laboratorio Presencial';
//             break;
//           default:
//             color = '#9CA3AF'; // Gris
//             modalidadTexto = 'Sin modalidad';
//         }

//         // 🧑‍🏫 Buscar nombre de docente
//         const docenteObj = this.docentes.find((d) => d.id === h.docente_id);
//         const nombreDocente = docenteObj ? docenteObj.c_nomdoc : 'Sin docente';

//         // 🏫 Buscar nombre de aula
//         const aulaObj = this.aulas.find((a) => a.id === h.aula_id);
//         const nombreAula = aulaObj ? aulaObj.c_codaula : 'Sin aula';

//         return {
//           curso: `${h.curso?.c_codcur} - ${h.curso?.c_nomcur}`,
//           docente: nombreDocente,
//           aula: nombreAula,
//           dia: h.dia, // 👈 ahora es string ("Sábado", "Jueves", etc.)
//           h_inicio: h.h_inicio,
//           h_fin: h.h_fin,
//           color: color,
//           modalidad: h.modalidad,
//           tipo: h.tipo,
//         };
//       });
//       this.eventos = eventos;
//       console.log(this.eventos); // ✅
//     });
//   }

//   cargarDatosTurno(id: number): void {
//     this.turnoServices.getTurnoById(id).subscribe((turno) => {
//       this.turnoData = turno;
//     });
//   }

//   formatHora(horaISO: string): string {
//     const date = new Date(horaISO);
//     return `${date.getHours().toString().padStart(2, '0')}:${date
//       .getMinutes()
//       .toString()
//       .padStart(2, '0')}`;
//   }

//   obtenerNombrePiso(piso: number | null): string {
//     const nombres: { [key: string]: string } = {
//       '-1': 'Sótano',
//       '0': 'Sótano',
//       '1': '1er piso',
//       '2': '2do piso',
//       '3': '3er piso',
//       '4': '4to piso',
//       '5': '5to piso',
//       '6': '6to piso',
//       '7': '7mo piso',
//     };
//     return piso != null ? nombres[piso.toString()] || `Piso ${piso}` : '---';
//   }

//   obtenerNombreModalidad(mod: number | null): string {
//     const modalidades: { [key: number]: string } = {
//       1: 'PRESENCIAL',
//       2: 'SEMIPRESENCIAL',
//       3: 'VIRTUAL',
//     };
//     return mod != null ? modalidades[mod] : '---';
//   }

//   closeModal(): void {
//     this.showModal = false;
//     this.selectedDay = '';
//     this.selectedClasses = [];
//   }

//   exportarCalendarioAPDF(): void {
//     const calendarioEl = document.querySelector('.horario-table'); // Asegúrate que este selector sea correcto
//     if (!calendarioEl) {
//       console.warn('❌ No se encontró el calendario en el DOM.');
//       return;
//     }

//     html2canvas(calendarioEl as HTMLElement, {
//       scale: 3, // Mejor resolución
//       useCORS: true, // Por si tienes imágenes cargadas
//     }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('landscape', 'pt', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save('calendario.pdf');
//     });
//   }

//   capturarCalendario() {
//     const calendarioEl = document.querySelector('.horario-table'); // o '#calendar'
//     if (!calendarioEl) return;

//     html2canvas(calendarioEl as HTMLElement).then((canvas) => {
//       const link = document.createElement('a');
//       link.href = canvas.toDataURL('image/png');
//       link.download = 'calendario.png';
//       link.click();
//     });
//   }
// }
