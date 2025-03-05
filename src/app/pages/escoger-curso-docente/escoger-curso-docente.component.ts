import { Component } from '@angular/core';

@Component({
  selector: 'app-escoger-curso-docente',
  standalone: false,
  templateUrl: './escoger-curso-docente.component.html',
  styleUrl: './escoger-curso-docente.component.css'
})
export class EscogerCursoDocenteComponent {
  searchQuery: string = '';
  selectedFaculty: string = '';
  faculties: string[] = ['Medicina General', 'Cirugía', 'Pediatría', 'Ginecología', 'Cardiología'];
  availableCourses: { [key: string]: string[] } = {
    'Medicina General': ['Anatomía Humana', 'Fisiología', 'Farmacología'],
    'Cirugía': ['Técnicas Quirúrgicas', 'Anestesiología', 'Cirugía General'],
    'Pediatría': ['Enfermedades Infantiles', 'Vacunación', 'Nutrición Infantil'],
    'Ginecología': ['Obstetricia', 'Salud Reproductiva', 'Endocrinología Femenina'],
    'Cardiología': ['Electrocardiografía', 'Hipertensión', 'Insuficiencia Cardíaca']
  };
  generalCourses: string[] = ['Metodología de la Investigación', 'Bioética', 'Primeros Auxilios'];
  filteredCourses: string[] = [];
  selectedCareerCourses: string[] = [];
  selectedGeneralCourses: string[] = [];

  searchCourses() {
    if (this.searchQuery.trim() === '' || !this.selectedFaculty) {
      this.filteredCourses = [];
      return;
    }
    this.filteredCourses = this.availableCourses[this.selectedFaculty].filter(course => 
      course.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectCourse(course: string) {
    if (this.availableCourses[this.selectedFaculty].includes(course) && !this.selectedCareerCourses.includes(course)) {
      this.selectedCareerCourses.push(course);
    } else if (this.generalCourses.includes(course) && !this.selectedGeneralCourses.includes(course)) {
      this.selectedGeneralCourses.push(course);
    }
    this.searchQuery = '';
    this.filteredCourses = [];
  }

  removeCourse(course: string, type: 'career' | 'general') {
    if (type === 'career') {
      this.selectedCareerCourses = this.selectedCareerCourses.filter(c => c !== course);
    } else {
      this.selectedGeneralCourses = this.selectedGeneralCourses.filter(c => c !== course);
    }
  }
}
