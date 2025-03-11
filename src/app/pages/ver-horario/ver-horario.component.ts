import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ver-horario',
  standalone: false,
  templateUrl: './ver-horario.component.html',
  styleUrl: './ver-horario.component.css'
})
export class VerHorarioComponent  implements OnInit{

  currentDate: Date = new Date();
  daysInMonth: number[] = [];
  firstDayOfMonth: number = 0;
  selectedDay: number | null = null;
  showModal: boolean = false;
  selectedClasses: any[] = [];

  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Lista de clases organizadas por día
  classSchedule: { [key: number]: { [key: number]: any[] } } = {
    2: { // Febrero (mes 2)
      7: [
        { subject: 'Matemática I', time: '08:00 AM - 12:00 PM', faculty: 'Ingeniería', cycle: 'IV', floor: 'Piso 3', modality: 'Precencial' },
        { subject: 'Física II', time: '03:00 PM - 07:00 PM', faculty: 'Ingeniería', cycle: 'IV', floor: 'Piso 2', modality: 'Precencial' }
      ],
      18: [
        { subject: 'Inglés II', time: '09:00 AM - 11:00 AM', faculty: 'Humanidades', cycle: 'II', floor: 'Piso 1', modality: 'Virtual' }
      ]
    },
    3: { // Marzo (mes 3)
      10: [
        { subject: 'Biología', time: '02:00 PM - 05:00 PM', faculty: 'Ciencias', cycle: 'III', floor: 'Piso 4', modality: 'Precencial' },
        { subject: 'Química', time: '06:00 PM - 08:00 PM', faculty: 'Ciencias', cycle: 'III', floor: 'Piso 4', modality: 'Precencial' }
      ]
    }
  };

  ngOnInit() {
    this.generateCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth());
  }

  generateCalendar(year: number, month: number) {
    const firstDay = new Date(year, month, 0);
    this.firstDayOfMonth = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    this.daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
  }

  changeMonth(step: number) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + step, 1);
    this.generateCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth());
  }

  selectMonth(event: Event) {
    const selectedMonth = parseInt((event.target as HTMLSelectElement).value);
    this.currentDate = new Date(this.currentDate.getFullYear(), selectedMonth, 1);
    this.generateCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth());
  }  

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth());
  }

  isToday(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getFullYear() === today.getFullYear()
    );
  }

  openModal(day: number) {
    const month = this.currentDate.getMonth() + 1;
    this.selectedDay = day;
    this.selectedClasses = this.classSchedule[month]?.[day] || [];
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
