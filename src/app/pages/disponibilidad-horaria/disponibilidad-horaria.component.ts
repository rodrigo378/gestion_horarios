import { Component, OnInit } from '@angular/core';
import { DisponibilidadHorariaService } from '../../services/disponibilidad-horaria.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-disponibilidad-horaria',
  standalone: false,
  templateUrl: './disponibilidad-horaria.component.html',
  styleUrl: './disponibilidad-horaria.component.css'
})
export class DisponibilidadHorariaComponent implements OnInit{
  disponibilidad: any[] = [
    { dia: 'lunes', hora_inicio: '', hora_fin: '', modalidad: 'presencial' },
    { dia: 'martes', hora_inicio: '', hora_fin: '', modalidad: 'presencial' },
    { dia: 'miercoles', hora_inicio: '', hora_fin: '', modalidad: 'presencial' },
    { dia: 'jueves', hora_inicio: '', hora_fin: '', modalidad: 'presencial' },
    { dia: 'viernes', hora_inicio: '', hora_fin: '', modalidad: 'presencial' },
  ];

  mensaje: string = '';
  mostrarBotonGuardar: boolean = true;
  datosCargados: boolean = false;

  constructor(
    private disponibilidadService: DisponibilidadHorariaService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.obtenerDisponibilidad()
  }

  formatHora(hora: string | null): string | null {
    if (!hora) return null;
    if (hora.split(':').length === 3) {
      return hora;
    }
    return `${hora}:00`;
  }

  guardarDisponibilidad() {
    const disponibilidadFormateada = this.disponibilidad.map(d => ({
      dia: d.dia,
      hora_inicio: this.formatHora(d.hora_inicio),
      hora_fin: this.formatHora(d.hora_fin),
      modalidad: d.modalidad
    }));
  
    this.disponibilidadService.createdisponibilidad(disponibilidadFormateada).subscribe(
      (response: any) => {
        this.alertService.success(response.message ?? '')
        this.mostrarBotonGuardar = false;
        this.obtenerDisponibilidad();
      },
      (error) => {
        this.mensaje = 'Error al guardar disponibilidad';
        console.error(error);
      }
    );
  }
  
  obtenerDisponibilidad() {
    this.disponibilidadService.getDisponibilidad().subscribe(
      (response: any) => {
        console.log("Datos recibidos en el componente:", response);
        this.mensaje = response.message ?? ''; 

        if (Array.isArray(response) && response.length > 0) {
          this.disponibilidad = response;
          this.mostrarBotonGuardar = false;
          this.datosCargados = true; 
        } else {
          this.disponibilidad = [];
          this.mostrarBotonGuardar = true;
          this.datosCargados = false;
        }
      },
      (error) => {
        console.error("Error al obtener disponibilidad:", error);
        this.mensaje = error.error?.message ?? 'Error al obtener disponibilidad';
        this.datosCargados = false;
      }
    );
  }

  editarDisponibilidad(id: number, index: number) {
    const disponibilidadActualizada = {
      ...this.disponibilidad[index],
      hora_inicio: this.formatHora(this.disponibilidad[index].hora_inicio),
      hora_fin: this.formatHora(this.disponibilidad[index].hora_fin)
    };
  
    this.disponibilidadService.updateDisponibilidad(id, disponibilidadActualizada).subscribe(
      (response: any) => {
        this.alertService.success(response.message ?? '')
      },
      (error) => {
        this.alertService.errorwarning('Error en la actualización edite bien las horas')
        console.error(error);
      }
    );
  }
}
