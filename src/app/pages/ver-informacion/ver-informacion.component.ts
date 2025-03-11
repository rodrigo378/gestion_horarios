import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
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

  @ViewChildren('denominacion') denominacion!: QueryList<ElementRef>;
  @ViewChildren('especialidadfc') especialidadfc!: QueryList<ElementRef>;
  @ViewChildren('institucion') institucion!: QueryList<ElementRef>;

  @ViewChildren('institucionxp') institucionxp!: QueryList<ElementRef>;
  @ViewChildren('cursodictado') cursodictado!: QueryList<ElementRef>;
  @ViewChildren('semestre') semestre!: QueryList<ElementRef>;
  @ViewChildren('paisxp') paisxp!: QueryList<ElementRef>;

  @ViewChildren('tituloarticulo') tituloarticulo!: QueryList<ElementRef>;
  @ViewChildren('nombrerevista') nombrerevista!: QueryList<ElementRef>;
  @ViewChildren('indizado') indizado!: QueryList<ElementRef>;
  @ViewChildren('año') año!: QueryList<ElementRef>;
  @ViewChildren('enlace') enlace!: QueryList<ElementRef>;

  @ViewChildren('titulolibro') titulolibro!: QueryList<ElementRef>;
  @ViewChildren('nombreeditorial') nombreeditorial!: QueryList<ElementRef>;
  @ViewChildren('añolibro') añolibro!: QueryList<ElementRef>;

  @ViewChildren('proyecto') proyecto!: QueryList<ElementRef>;
  @ViewChildren('emtidadfinanciera') emtidadfinanciera!: QueryList<ElementRef>;
  @ViewChildren('añoadjudicacion') añoadjudicacion!: QueryList<ElementRef>;

  @ViewChildren('titulotesis') titulotesis!: QueryList<ElementRef>;
  @ViewChildren('universidadaj') universidadaj!: QueryList<ElementRef>;
  @ViewChildren('nivel') nivel!: QueryList<ElementRef>;
  @ViewChildren('añoaj') añoaj!: QueryList<ElementRef>;

  @ViewChildren('idioma') idioma!: QueryList<ElementRef>;
  @ViewChildren('nivel_idioma') nivel_idioma!: QueryList<ElementRef>;
  @ViewChildren('office') office!: QueryList<ElementRef>;
  @ViewChildren('nivel_office') nivel_office!: QueryList<ElementRef>;
  @ViewChildren('learning') learning!: QueryList<ElementRef>;
  @ViewChildren('nivel_learning') nivel_learning!: QueryList<ElementRef>;

  @ViewChild('nombreCompleto') nombreCompleto!: ElementRef;

  constructor(
    private docenteService: DocenteService,
    private alertServices: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDocenteUsuario();
  }

  cargarDocenteUsuario(): void {
    this.docenteService.getDocentePorUsuario().subscribe(response => {
      this.docente = response.docente;
    });
  }

  obtenerTexto(element: ElementRef | undefined): string {
    return element ? element.nativeElement.innerText.trim() : '';
  }


  obtenerFormacionAcademica(): any[] {
    return this.docente.formacion_academica.map((formacion: any, i: number) => ({
      id: formacion.id ?? null,
      grado_academico: this.obtenerTexto(this.gradoAcademico.get(i)),
      universidad: this.obtenerTexto(this.universidad.get(i)),
      especialidad: this.obtenerTexto(this.especialidad.get(i)),
      pais: this.obtenerTexto(this.pais.get(i)),
      resolucion_sunedu: this.obtenerTexto(this.resolucionSunedu.get(i))
    }));
  }

  obtenerTitulosProfecionales(): any[] {
    return this.docente.titulos_profesionales.map((titulo: any, i: number) => ({
      id: titulo.id ?? null,
      titulo: this.obtenerTexto(this.titulo.get(i)),
      universidad: this.obtenerTexto(this.universidadtp.get(i)),
      especialidad: this.obtenerTexto(this.especialidadtp.get(i)),
    }));
  }

  obtenerFormacionComplementaria(): any[] {
    return this.docente.formacion_complementaria.map((formacioncomplementaria: any, i: number) => ({
      id: formacioncomplementaria.id ?? null,
      denominacion: this.obtenerTexto(this.denominacion.get(i)),
      especialidad: this.obtenerTexto(this.especialidadfc.get(i)),
      institucion: this.obtenerTexto(this.institucion.get(i)),
    }));
  }

  obtenerExperienciaDocente(): any[] {
    return this.docente.experiencia_docente.map((xpdocente: any, i: number) => ({
      id: xpdocente.id ?? null,
      institucion: this.obtenerTexto(this.institucion.get(i)),
      curso_dictado: this.obtenerTexto(this.cursodictado.get(i)),
      semestre: this.obtenerTexto(this.semestre.get(i)),
      pais: this.obtenerTexto(this.paisxp.get(i)),
    }));
  }


  obtenerArticulosCientificos(): any[] {
    return this.docente.articulos_cientificos.map((artcientifico: any, i: number) => ({
      id: artcientifico.id ?? null,
      titulo_articulo: this.obtenerTexto(this.tituloarticulo.get(i)),
      nombre_revista: this.obtenerTexto(this.nombrerevista.get(i)),
      indizado: this.obtenerTexto(this.indizado.get(i)),
      año: this.obtenerTexto(this.año.get(i)),
      enlace: this.obtenerTexto(this.enlace.get(i)),
    }));
  }

  obtenerLibros(): any[] {
    return this.docente.libros.map((libros: any, i: number) => ({
      id: libros.id ?? null,
      titulo: this.obtenerTexto(this.titulolibro.get(i)),
      nombre_editorial: this.obtenerTexto(this.nombreeditorial.get(i)),
      año: this.obtenerTexto(this.añolibro.get(i)),
    }));
  }

  obtenerProyecyosInvestigacion(): any[] {
    return this.docente.proyectos_investigacion.map((proinvestigacion: any, i: number) => ({
      id: proinvestigacion.id ?? null,
      proyecto: this.obtenerTexto(this.proyecto.get(i)),
      entidad_financiera: this.obtenerTexto(this.emtidadfinanciera.get(i)),
      año_adjudicacion: this.obtenerTexto(this.añoadjudicacion.get(i)),
    }));
  }

  obtenersAsesoriasJurados(): any[] {
    return this.docente.asesorias_jurado.map((asesoriajurados: any, i: number) => ({
      id: asesoriajurados.id ?? null,
      titulo_tesis: this.obtenerTexto(this.titulotesis.get(i)),
      universidad: this.obtenerTexto(this.universidadaj.get(i)),
      nivel: this.obtenerTexto(this.nivel.get(i)),
      año: this.obtenerTexto(this.añoaj.get(i)),
    }));
  }

  obtenerOtros(): any[] {
    return this.docente.otros.map((otros: any, i: number) => ({
      id: otros.id ?? null,
      idioma: this.obtenerTexto(this.idioma.get(i)),
      nivel_idioma: this.obtenerTexto(this.nivel_idioma.get(i)),
      office: this.obtenerTexto(this.office.get(i)),
      nivel_office: this.obtenerTexto(this.nivel_office.get(i)),
      learning: this.obtenerTexto(this.learning.get(i)),
      nivel_learning: this.obtenerTexto(this.nivel_learning.get(i)),
    }));
  }

  // actualizarDocente(): void {
  //   // Obtener el valor modificado del campo
  //   const nombreCompleto = this.nombreCompleto.nativeElement.innerText.trim();

  //   // Separar en nombres y apellidos
  //   const partes = nombreCompleto.split(' '); 
  //   const nombres = partes.slice(0, -2).join(' ') || '';  
  //   const apellido_paterno = partes[partes.length - 2] || '';
  //   const apellido_materno = partes[partes.length - 1] || '';

  //   // Capturar la lista de formación académica
  //   const formaciones = this.docente.formacion_academica.map((formacion: any, i: number) => ({
  //     id: formacion.id ?? null,  // 🔥 Capturamos el ID para que Laravel lo reconozca
  //     grado_academico: this.gradoAcademico.get(i)?.nativeElement.innerText.trim() || '',
  //     universidad: this.universidad.get(i)?.nativeElement.innerText.trim() || '',
  //     especialidad: this.especialidad.get(i)?.nativeElement.innerText.trim() || '',
  //     pais: this.pais.get(i)?.nativeElement.innerText.trim() || '',
  //     resolucion_sunedu: this.resolucionSunedu.get(i)?.nativeElement.innerText.trim() || '',
  //   }));

  
  //   const datosActualizados = {
  //     nombres: nombres,
  //     apellido_paterno: apellido_paterno,
  //     apellido_materno: apellido_materno,
  //     email: this.email.nativeElement.innerText.trim(),
  //     celular: this.celular.nativeElement.innerText.trim(),
  //     telefono_fijo: this.telefono.nativeElement.innerText.trim(),
  //     contactoEmergencia: {
  //       nombre: this.contactoNombre.nativeElement.innerText.trim(),
  //       relacion: this.contactoRelacion.nativeElement.innerText.trim(),
  //       telefono_1: this.contactoTelefono1.nativeElement.innerText.trim(),
  //       telefono_2: this.contactoTelefono2.nativeElement.innerText.trim(),
  //     },
  //     domicilio: {
  //       departamento_id: this.departamento_id.nativeElement.innerText.trim(),
  //       provincia_id: this.provincia_id.nativeElement.innerText.trim(),
  //       distrito_id: this.distrito_id.nativeElement.innerText.trim(),
  //       direccion: this.direccion.nativeElement.innerText.trim(),
  //       referencia: this.referencia.nativeElement.innerText.trim(),
  //       mz: this.mz.nativeElement.innerText.trim(),
  //       lote: this.lote.nativeElement.innerText.trim(),
  //     },
  //     formacion_academica: formaciones,
  //     // titulo_profecionales: titulos
  //   };

  //   console.log("📌 Enviando datos a Laravel:", JSON.stringify(datosActualizados, null, 2));

  //   this.docenteService.updateDocenteUsuario(datosActualizados).subscribe(response => {
  //     this.alertServices.success('Información actualizada correctamente');
  //   }, error => {
  //     console.error("Error al actualizar la información:", error);
  //   });
  // }

  actualizarDocente(): void {
    const nombreCompleto = this.obtenerTexto(this.nombreCompleto);
    const partes = nombreCompleto.split(' '); 
    const nombres = partes.slice(0, -2).join(' ') || '';  
    const apellido_paterno = partes[partes.length - 2] || '';
    const apellido_materno = partes[partes.length - 1] || '';

    const datosActualizados = {
      nombres,
      apellido_paterno,
      apellido_materno,
      email: this.obtenerTexto(this.email),
      celular: this.obtenerTexto(this.celular),
      telefono_fijo: this.obtenerTexto(this.telefono),
      contactoEmergencia: {
        nombre: this.obtenerTexto(this.contactoNombre),
        relacion: this.obtenerTexto(this.contactoRelacion),
        telefono_1: this.obtenerTexto(this.contactoTelefono1),
        telefono_2: this.obtenerTexto(this.contactoTelefono2),
      },
      domicilio: {
        departamento_id: this.obtenerTexto(this.departamento_id),
        provincia_id: this.obtenerTexto(this.provincia_id),
        distrito_id: this.obtenerTexto(this.distrito_id),
        direccion: this.obtenerTexto(this.direccion),
        referencia: this.obtenerTexto(this.referencia),
        mz: this.obtenerTexto(this.mz),
        lote: this.obtenerTexto(this.lote),
      },
      formacion_academica: this.obtenerFormacionAcademica(),
      titulos_profesionales: this.obtenerTitulosProfecionales(),
      formacion_complementaria: this.obtenerFormacionComplementaria(),
      experiencia_docente: this.obtenerExperienciaDocente(),
      articulos_cientificos: this.obtenerArticulosCientificos(),
      libros: this.obtenerLibros(),
      proyectos_investigacion: this.obtenerProyecyosInvestigacion(),
      asesorias_jurado: this.obtenersAsesoriasJurados(),
      otros: this.obtenerOtros()
    };

    console.log("📌 Enviando datos a Laravel:", JSON.stringify(datosActualizados, null, 2));

    this.docenteService.updateDocenteUsuario(datosActualizados).subscribe(response => {
      this.alertServices.success('Información actualizada correctamente');
    }, error => {
      console.error("Error al actualizar la información:", error);
    });
  }
}