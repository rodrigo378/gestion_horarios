import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocenteService } from '../../services/docente.service';
import { AlertService } from '../../services/alert.service';
import { FormacionAcademica } from '../../interfaces/Docentes';

@Component({
  selector: 'app-ver-informacion',
  standalone: false,
  templateUrl: './ver-informacion.component.html',
  styleUrl: './ver-informacion.component.css'
})
export class VerInformacionComponent implements OnInit{

  docente: any = null;

  @ViewChild('nombre') nombre!: ElementRef;
  @ViewChild('apellidoP') apellidoP!: ElementRef;
  @ViewChild('apellidoM') apellidoM!: ElementRef;
  @ViewChild('email') email!: ElementRef;
  @ViewChild('celular') celular!: ElementRef;
  @ViewChild('telefono') telefono!: ElementRef;
  @ViewChild('contactoNombre') contactoNombre!: ElementRef;
  @ViewChild('contactoRelacion') contactoRelacion!: ElementRef;
  @ViewChild('contactoTelefono1') contactoTelefono1!: ElementRef;
  @ViewChild('contactoTelefono2') contactoTelefono2!: ElementRef;
  @ViewChild('departamento_id') departamento_id!: ElementRef;
  @ViewChild('provincia_id') provincia_id!: ElementRef;
  @ViewChild('distrito_id') distrito_id!: ElementRef;
  @ViewChild('direccion') direccion!: ElementRef;
  @ViewChild('referencia') referencia!: ElementRef;
  @ViewChild('mz') mz!: ElementRef;
  @ViewChild('lote') lote!: ElementRef;

  @ViewChildren('grado_academico') gradoAcademico!: QueryList<ElementRef>;
  @ViewChildren('universidad') universidad!: QueryList<ElementRef>;
  @ViewChildren('especialidad') especialidad!: QueryList<ElementRef>;
  @ViewChildren('pais') pais!: QueryList<ElementRef>;
  @ViewChildren('resolucion_sunedu') resolucionSunedu!: QueryList<ElementRef>;

  @ViewChildren('titulo') titulo!: QueryList<ElementRef>;
  @ViewChildren('universidadtp') universidadtp!: QueryList<ElementRef>;
  @ViewChildren('especialidadtp') especialidadtp!: QueryList<ElementRef>;
  // @ViewChild('telefono') telefono!: ElementRef;
  // @ViewChild('contactoNombre') contactoNombre!: ElementRef;
  // @ViewChild('contactoRelacion') contactoRelacion!: ElementRef;
  // @ViewChild('contactoTelefono1') contactoTelefono1!: ElementRef;
  // @ViewChild('contactoTelefono2') contactoTelefono2!: ElementRef;
  // @ViewChild('nombre') nombre!: ElementRef;
  // @ViewChild('apellidoP') apellidoP!: ElementRef;
  // @ViewChild('apellidoM') apellidoM!: ElementRef;
  // @ViewChild('email') email!: ElementRef;
  // @ViewChild('celular') celular!: ElementRef;
  // @ViewChild('telefono') telefono!: ElementRef;
  // @ViewChild('contactoNombre') contactoNombre!: ElementRef;
  // @ViewChild('contactoRelacion') contactoRelacion!: ElementRef;
  // @ViewChild('contactoTelefono1') contactoTelefono1!: ElementRef;
  // @ViewChild('contactoTelefono2') contactoTelefono2!: ElementRef;

  @ViewChild('nombreCompleto') nombreCompleto!: ElementRef;

  constructor(
    private docenteService: DocenteService,
    private alertServices: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarDocenteUsuario();
  }

  cargarDocenteUsuario(): void {
    this.docenteService.getDocentePorUsuario().subscribe(response => {
      this.docente = response.docente;
    });
  }

  actualizarDocente(): void {
    // Obtener el valor modificado del campo
    const nombreCompleto = this.nombreCompleto.nativeElement.innerText.trim();

    // Separar en nombres y apellidos
    const partes = nombreCompleto.split(' '); 
    const nombres = partes.slice(0, -2).join(' ') || '';  
    const apellido_paterno = partes[partes.length - 2] || '';
    const apellido_materno = partes[partes.length - 1] || '';

    // Capturar la lista de formación académica
    const formaciones = this.docente.formacion_academica.map((formacion: any, i: number) => ({
      id: formacion.id ?? null,  // 🔥 Capturamos el ID para que Laravel lo reconozca
      grado_academico: this.gradoAcademico.get(i)?.nativeElement.innerText.trim() || '',
      universidad: this.universidad.get(i)?.nativeElement.innerText.trim() || '',
      especialidad: this.especialidad.get(i)?.nativeElement.innerText.trim() || '',
      pais: this.pais.get(i)?.nativeElement.innerText.trim() || '',
      resolucion_sunedu: this.resolucionSunedu.get(i)?.nativeElement.innerText.trim() || '',
    }));

  
    const datosActualizados = {
      nombres: nombres,
      apellido_paterno: apellido_paterno,
      apellido_materno: apellido_materno,
      email: this.email.nativeElement.innerText.trim(),
      celular: this.celular.nativeElement.innerText.trim(),
      telefono_fijo: this.telefono.nativeElement.innerText.trim(),
      contactoEmergencia: {
        nombre: this.contactoNombre.nativeElement.innerText.trim(),
        relacion: this.contactoRelacion.nativeElement.innerText.trim(),
        telefono_1: this.contactoTelefono1.nativeElement.innerText.trim(),
        telefono_2: this.contactoTelefono2.nativeElement.innerText.trim(),
      },
      domicilio: {
        departamento_id: this.departamento_id.nativeElement.innerText.trim(),
        provincia_id: this.provincia_id.nativeElement.innerText.trim(),
        distrito_id: this.distrito_id.nativeElement.innerText.trim(),
        direccion: this.direccion.nativeElement.innerText.trim(),
        referencia: this.referencia.nativeElement.innerText.trim(),
        mz: this.mz.nativeElement.innerText.trim(),
        lote: this.lote.nativeElement.innerText.trim(),
      },
      formacion_academica: formaciones,
      // titulo_profecionales: titulos
    };

    console.log("📌 Enviando datos a Laravel:", JSON.stringify(datosActualizados, null, 2));

    this.docenteService.updateDocenteUsuario(datosActualizados).subscribe(response => {
      this.alertServices.success('Información actualizada correctamente');
    }, error => {
      console.error("Error al actualizar la información:", error);
    });
  }
}