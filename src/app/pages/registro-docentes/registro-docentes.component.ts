import { Component, OnInit } from '@angular/core';
import { DocenteService } from '../../services/docente.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-registro-docentes',
  standalone: false,
  templateUrl: './registro-docentes.component.html',
  styleUrl: './registro-docentes.component.css',
})
export class RegistroDocentesComponent implements OnInit {
  currentStep = 1;
  totalSteps = 10;
  mensajeError: string = '';
  msgErrorCelular: string = '';

  docenteForm: FormGroup;
  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];

  constructor(private fb: FormBuilder, private docenteService: DocenteService, private alertService: AlertService) {
    this.docenteForm = this.fb.group({
      // Información Personal
      nombres: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: ['', Validators.required],
      tipo_identificacion: ['', Validators.required],
      numero_identificacion: [
        '',
        [Validators.required, Validators.pattern('^[0-9]+$')],
      ],
      fecha_nacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      telefono_fijo: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{7,10}$')],
      ],

      // Contacto de Emergencia
      contactoEmergencia: this.fb.group({
        nombre: ['', Validators.required],
        relacion: ['', Validators.required],
        telefono_1: ['', Validators.required],
        telefono_2: [''],
      }),

      // Domicilio del Docente
      domicilio: this.fb.group({
        departamento_id: ['', Validators.required],
        provincia_id: ['', Validators.required],
        distrito_id: ['', Validators.required],
        direccion: ['', Validators.required],
        referencia: ['', Validators.required],
        mz: ['', Validators.required],
        lote: ['', Validators.required],
      }),

      //Formacion academica
      formacionAcademica: this.fb.array([]),

      //Titulo/formacion
      titulosProfesionales: this.fb.array([]),
      formacionComplementaria: this.fb.array([]),

      //Exp Docente
      experienciaDocente: this.fb.array([]),

      //Exp_inves Articulos Cientifos
      articuloCientifico: this.fb.array([]),

      //Libro/Proyerto/Investigaciones
      libros: this.fb.array([]),
      proyectoInvestigacion: this.fb.array([]),

      //Asesorias y jurados
      asesoriaJurado: this.fb.array([]),

      //otros
      otros: this.fb.array([]),
    });

    this.agregarFormacionAcademica();
    this.agregarTituloProfesional();
    this.agregarFormacionComplementaria();
    this.agregarExperienciaDocente();
    this.agregarArticuloCientifico();
    this.agregarLibro();
    this.agregarProyectoInvestigacion();
    this.agregarAsesoriaJurado();
    this.agregarOtros();
  }

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  get formacionesAcademicas(): FormArray {
    return this.docenteForm.get('formacionAcademica') as FormArray;
  }
  get titulosProfesionales(): FormArray {
    return this.docenteForm.get('titulosProfesionales') as FormArray;
  }
  get formacionesComplementarias(): FormArray {
    return this.docenteForm.get('formacionComplementaria') as FormArray;
  }
  get experienciasDocentes(): FormArray {
    return this.docenteForm.get('experienciaDocente') as FormArray;
  }
  get articulosCientificos(): FormArray {
    return this.docenteForm.get('articuloCientifico') as FormArray;
  }
  get libros(): FormArray {
    return this.docenteForm.get('libros') as FormArray;
  }
  get proyectosInvestigacion(): FormArray {
    return this.docenteForm.get('proyectoInvestigacion') as FormArray;
  }
  get asesoriasJurados(): FormArray {
    return this.docenteForm.get('asesoriaJurado') as FormArray;
  }
  get otros(): FormArray {
    return this.docenteForm.get('otros') as FormArray;
  }

  //#region Método para convertir un AbstractControl
  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  getTituloProfesionalFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  getFormacionComplementariaFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  //#endregion

  //#region siquiente y volver
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  //#endregion

  //#region agregar
  agregarFormacionAcademica() {
    const formacion = this.fb.group({
      grado_academico: [''],
      universidad: [''],
      especialidad: [''],
      pais: [''],
      resolucion_sunedu: [''],
    });

    this.formacionesAcademicas.push(formacion);
  }

  eliminarFormacionAcademica(index: number) {
    if (this.formacionesAcademicas.length > 1) {
      this.formacionesAcademicas.removeAt(index);
    }
  }

  agregarTituloProfesional() {
    const titulo = this.fb.group({
      titulo: [''],
      universidad: [''],
      especialidad: [''],
    });

    this.titulosProfesionales.push(titulo);
  }

  eliminarTituloProfesional(index: number) {
    if (this.titulosProfesionales.length > 1) {
      this.titulosProfesionales.removeAt(index);
    }
  }

  agregarFormacionComplementaria() {
    const formacion = this.fb.group({
      denominacion: [''],
      especialidad: [''],
      institucion: [''],
    });

    this.formacionesComplementarias.push(formacion);
  }

  eliminarFormacionComplementaria(index: number) {
    if (this.formacionesComplementarias.length > 1) {
      this.formacionesComplementarias.removeAt(index);
    }
  }

  crearExperienciaDocente(): FormGroup {
    return this.fb.group({
      tipo_experiencia: ['', Validators.required],
      institucion: [''],
      curso_dictado: [''],
      semestre: [''],
      pais: [''],
    });
  }

  agregarExperienciaDocente() {
    this.experienciasDocentes.push(this.crearExperienciaDocente());
  }

  eliminarExperienciaDocente(index: number) {
    if (this.experienciasDocentes.length > 1) {
      this.experienciasDocentes.removeAt(index);
    }
  }

  crearArticuloCientifico(): FormGroup {
    return this.fb.group({
      titulo_articulo: [''],
      nombre_revista: [''],
      indizado: [''],
      año: [''],
      enlace: [''],
    });
  }

  agregarArticuloCientifico() {
    this.articulosCientificos.push(this.crearArticuloCientifico());
  }

  eliminarArticuloCientifico(index: number) {
    if (this.articulosCientificos.length > 1) {
      this.articulosCientificos.removeAt(index);
    }
  }

  crearLibro(): FormGroup {
    return this.fb.group({
      libro_titulo: [''],
      nombre_editorial: [''],
      año: [''],
    });
  }

  agregarLibro() {
    this.libros.push(this.crearLibro());
  }

  eliminarLibro(index: number) {
    if (this.libros.length > 1) {
      this.libros.removeAt(index);
    }
  }

  crearProyectoInvestigacion(): FormGroup {
    return this.fb.group({
      proyecto: [''],
      entidad_financiera: [''],
      año_adjudicacion: [''],
    });
  }

  agregarProyectoInvestigacion() {
    this.proyectosInvestigacion.push(this.crearProyectoInvestigacion());
  }

  eliminarProyectoInvestigacion(index: number) {
    if (this.proyectosInvestigacion.length > 1) {
      this.proyectosInvestigacion.removeAt(index);
    }
  }

  agregarAsesoriaJurado() {
    const asesoria = this.fb.group({
      tipo: ['', Validators.required],
      titulo_tesis: [''],
      universidad: [''],
      nivel: [''],
      año: [''],
    });

    this.asesoriasJurados.push(asesoria);
  }

  eliminarAsesoriaJurado(index: number) {
    if (this.asesoriasJurados.length > 1) {
      this.asesoriasJurados.removeAt(index);
    }
  }

  agregarOtros() {
    const otro = this.fb.group({
      idioma: [''],
      nivel_idioma: [''],
      office: [''],
      nivel_office: [''],
      learning: [''],
      nivel_learning: [''],
    });

    this.otros.push(otro);
  }

  eliminarOtros(index: number) {
    if (this.otros.length > 1) {
      this.otros.removeAt(index);
    }
  }
  //#endregion

  //#region API datos para Ubicaciones
  cargarDepartamentos() {
    this.docenteService.getDepartamentos().subscribe({
      next: (res) => {
        this.departamentos = res.departamentos || [];
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar departamentos:', e);
      },
    });
  }

  cargarProvincias(event: any) {
    const departamentoId = event.target.value;
    console.log('Departamento seleccionado:', departamentoId);
    this.docenteService.getProvincias(departamentoId).subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta completa de provincias:', res);
        this.provincias = res.provincias || []; // Extraemos correctamente el array
        this.distritos = []; // Limpiar distritos cuando cambia el departamento
        console.log('✅ Provincias extraídas:', this.provincias);
      },
      error: (e: HttpErrorResponse) => {
        console.error('❌ Error al cargar provincias:', e);
      },
    });
  }

  cargarDistritos(event: any) {
    const provinciaId = event.target.value;
    console.log('Provincia seleccionada:', provinciaId);
    this.docenteService.getDistritos(provinciaId).subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta completa de distritos:', res);
        this.distritos = res.distritos || []; // Extraemos correctamente el array
        console.log('✅ Distritos extraídos:', this.distritos);
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar distritos:', e);
      },
    });
  }
  //#endregion

  //#region Agregar y validar
  marcarCamposInvalidos(formGroup: FormGroup) {
    let camposFaltantes: string[] = [];
  
    const nombresAmigables: { [key: string]: string } = {
      nombres: "Nombres",
      apellido_paterno: "Apellido Paterno",
      apellido_materno: "Apellido Materno",
      tipo_identificacion: "Tipo de Identificación",
      numero_identificacion: "Número de Identificación",
      fecha_nacimiento: "Fecha de Nacimiento",
      email: "Correo Electrónico",
      celular: "Celular",
      telefono_fijo: "Teléfono Fijo",
      "contactoEmergencia.nombre": "Nombre del Contacto de Emergencia",
      "contactoEmergencia.relacion": "Relación con Contacto de Emergencia",
      "contactoEmergencia.telefono_1": "Teléfono de Contacto de Emergencia",
      "domicilio.departamento_id": "Departamento",
      "domicilio.provincia_id": "Provincia",
      "domicilio.distrito_id": "Distrito",
      "domicilio.direccion": "Dirección",
      "domicilio.referencia": "Referencia",
      "domicilio.mz": "Manzana",
      "domicilio.lote": "Lote",
      "experienciaDocente.0.tipo_experiencia": "Tipo de Experiencia Docente",
      "asesoriaJurado.0.tipo": "Tipo de Asesoría de Jurado"
    };
  
    const recorrerControles = (control: AbstractControl, nombreCampo = '') => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        Object.entries(control.controls).forEach(([subCampo, subControl]) =>
          recorrerControles(subControl, nombreCampo ? `${nombreCampo}.${subCampo}` : subCampo)
        );
      } else if (control.invalid) {
        const nombreAmigable = nombresAmigables[nombreCampo] || nombreCampo;
        camposFaltantes.push(nombreAmigable);
        document.querySelector(`[formControlName="${nombreCampo}"]`)?.classList.add('border-red-500');
      }
    };

    recorrerControles(formGroup);
    if (camposFaltantes.length) {
      this.alertService.warning(camposFaltantes.join('\n'));
    }
    console.log("Campos faltantes:", camposFaltantes);
  }
  
  
  eliminarError(campo: string) {
    const elemento = document.querySelector(`[formControlName="${campo}"]`);
    if (elemento) {
      elemento.classList.remove('border-red-500');
    }
  }

  registrarDocente() {
    if (this.docenteForm.valid) {
      console.log('Datos enviados al backend:', this.docenteForm.value);

      this.docenteService.createDocente(this.docenteForm.value).subscribe({
        next: (response: any) => {
          console.log('Docente registrado:', response);
          alert('Docente registrado con éxito');
        },
        error: (e: HttpErrorResponse) => {
          console.error('Error al registrar docente:', e);
          alert('Hubo un error al registrar el docente');
        },
      });
    } else {
      this.marcarCamposInvalidos(this.docenteForm)
    }
  }
  //#endregion

  //#region Validaciones TipoIdentificaciones
  changeTipoIdentificacion() {
    const numeroIdentificacion = this.docenteForm.get('numero_identificacion');
    console.log(this.docenteForm.get('tipo_identificacion')?.value);

    if (!numeroIdentificacion) return;

    switch (this.docenteForm.get('tipo_identificacion')?.value) {
      case 'dni':
        numeroIdentificacion.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(8),
          Validators.pattern('^[0-9]{8}$'),
        ]);
        this.mensajeError =
          '⚠ El DNI debe tener exactamente 8 dígitos numéricos.';
        break;

      case 'passport':
        numeroIdentificacion.setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(12),
        ]);
        this.mensajeError =
          '⚠ El pasaporte debe tener entre 6 y 12 caracteres.';
        break;

      case 'cedula':
        numeroIdentificacion.setValidators([
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]{11}$'),
        ]);
        this.mensajeError =
          '⚠ La Cédula debe tener exactamente 11 dígitos numéricos.';
        break;

      default:
        numeroIdentificacion.setValidators([Validators.required]);
        this.mensajeError = '⚠ Este campo es obligatorio.';
        break;
    }

    numeroIdentificacion.updateValueAndValidity();

    // Verificar si el campo tiene errores después de la validación
    if (numeroIdentificacion.invalid) {
      numeroIdentificacion.setErrors({
        customError: true,
        message: this.mensajeError,
      });
    } else {
      numeroIdentificacion.setErrors(null);
    }
  }
  //#endregion
}
