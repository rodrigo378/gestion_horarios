import { Component, OnInit } from '@angular/core';
import { DocenteService } from '../../services/docente.service';
import { AbstractControl, Form, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro-docentes',
  standalone: false,
  templateUrl: './registro-docentes.component.html',
  styleUrl: './registro-docentes.component.css'
})
export class RegistroDocentesComponent implements OnInit{
  currentStep =  1;
  totalSteps = 10;
  
  docenteForm: FormGroup;
  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private docenteService: DocenteService
  ) {
    this.docenteForm = this.fb.group({
      // Información Personal
      nombres: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: ['', Validators.required],
      tipo_identificacion: ['', Validators.required],
      numero_identificacion: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      fecha_nacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      telefono_fijo: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],

      // Contacto de Emergencia
      contactoEmergencia: this.fb.group({
        nombre: ['', Validators.required],
        relacion: ['', Validators.required],
        telefono_1: ['', Validators.required],
        telefono_2: ['']
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
      experienciaDocente:this.fb.array([]),
      
      //Exp_inves Articulos Cientifos
      articuloCientifico: this.fb.array([]),

      //Libro/Proyerto/Investigaciones
      libros: this.fb.array([]),
      proyectoInvestigacion: this.fb.array([]),

      //Asesorias y jurados
      asesoriaJurado:this.fb.array([]),

      //otros
      otros: this.fb.array([])
    });

    this.agregarFormacionAcademica();
    this.agregarTituloProfesional();
    this.agregarFormacionComplementaria();
    this.agregarExperienciaDocente();
    this.agregarArticuloCientifico();
    this.agregarLibro();
    this.agregarProyectoInvestigacion();
    this.agregarAsesoriaJurado();
    this.agregarOtros()
  }

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  get formacionesAcademicas(): FormArray {
    return this.docenteForm.get('formacionAcademica') as FormArray;
  }
  get titulosProfesionales(): FormArray{
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
      grado_academico: ['', Validators.required],
      universidad: ['', Validators.required],
      especialidad: ['', Validators.required],
      pais: ['', Validators.required],
      resolucion_sunedu: ['', Validators.required]
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
      titulo: ['', Validators.required],
      universidad: ['', Validators.required],
      especialidad: ['', Validators.required]
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
      denominacion: ['', Validators.required],
      especialidad: ['', Validators.required],
      institucion: ['', Validators.required]
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
      institucion: ['', Validators.required],
      curso_dictado: ['', Validators.required],
      semestre: ['', Validators.required],
      pais: ['', Validators.required]
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
      titulo_articulo: ['', Validators.required],
      nombre_revista: ['', Validators.required],
      indizado: ['', Validators.required],
      año: ['', Validators.required],
      enlace: ['', Validators.required]
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
      libro_titulo: ['', Validators.required],
      nombre_editorial: ['', Validators.required],
      año: ['', [Validators.required, Validators.min(1000), Validators.max(new Date().getFullYear())]]
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
      proyecto: ['', Validators.required],
      entidad_financiera: ['', Validators.required],
      año_adjudicacion: ['', Validators.required]
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
      titulo_tesis: ['', Validators.required],
      universidad: ['', Validators.required],
      nivel: ['', Validators.required],
      año: [
        '',
        [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]
      ]
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
      idioma: ['', Validators.required],
      nivel_idioma: ['', Validators.required],
      office: ['', Validators.required],
      nivel_office: ['', Validators.required],
      learning: ['', Validators.required],
      nivel_learning: ['', Validators.required]
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
    this.docenteService.getDepartamentos().subscribe(response => {
      console.log("Respuesta completa de la API:", response);
      this.departamentos = response.departamentos || [];
      console.log("Departamentos extraídos:", this.departamentos);
    }, error => {
      console.error("Error al cargar departamentos:", error);
    });
  }

  cargarProvincias(event: any) {
    const departamentoId = event.target.value;
    console.log("Departamento seleccionado:", departamentoId);
    this.docenteService.getProvincias(departamentoId).subscribe(response => {
      console.log("✅ Respuesta completa de provincias:", response);
      this.provincias = response.provincias || []; // Extraemos correctamente el array
      this.distritos = []; // Limpiar distritos cuando cambia el departamento
      console.log("✅ Provincias extraídas:", this.provincias);
    }, error => {
      console.error("❌ Error al cargar provincias:", error);
    });
  }

  cargarDistritos(event: any) {
    const provinciaId = event.target.value;
    console.log("Provincia seleccionada:", provinciaId);
    this.docenteService.getDistritos(provinciaId).subscribe(response => {
      console.log("✅ Respuesta completa de distritos:", response);
      this.distritos = response.distritos || []; // Extraemos correctamente el array
      console.log("✅ Distritos extraídos:", this.distritos);
    }, error => {
      console.error("Error al cargar distritos:", error);
    });
  }
  //#endregion

  //#region boton registroDocentes
  registrarDocente() {
    if (this.docenteForm.valid) {
      console.log('Datos enviados al backend:', this.docenteForm.value);

      this.docenteService.createDocente(this.docenteForm.value).subscribe(
        response => {
          console.log('Docente registrado:', response);
          alert('Docente registrado con éxito');
        },
        error => {
          console.error('Error al registrar docente:', error);
          alert('Hubo un error al registrar el docente');
        }
      );
    } else {
      this.marcarCamposInvalidos(this.docenteForm)
    }
  }

  marcarCamposInvalidos(formGroup: FormGroup) {
    let primerCampoFaltante: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;
    let camposFaltantes: string[] = [];
  
    Object.keys(formGroup.controls).forEach(campo => {
      const control = formGroup.get(campo);
  
      if (control instanceof FormGroup) {
        // Si el control es otro FormGroup (anidado), recorrerlo recursivamente
        this.marcarCamposInvalidos(control);
      } else if (control instanceof FormArray) {
        // 🔥 Si es un FormArray, iteramos sobre cada FormGroup dentro de él
        control.controls.forEach((grupo, index) => {
          if (grupo instanceof FormGroup) {
            Object.keys(grupo.controls).forEach(subCampo => {
              const subControl = grupo.get(subCampo);
  
              if (subControl?.invalid) {
                // Identificar el label correcto
                const label = document.querySelector(`label[for="${subCampo}"]`)?.textContent || `${campo} [${index}] - ${subCampo}`;
                camposFaltantes.push(label);
  
                // Buscar el elemento en el DOM
                const elemento = document.querySelector(`[formControlName="${subCampo}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  
                if (!primerCampoFaltante && elemento) {
                  primerCampoFaltante = elemento;
                }
  
                // Resaltar en rojo
                if (elemento) {
                  elemento.classList.add('border-red-500');
                }
              }
            });
          }
        });
      } else if (control?.invalid) {
        // Manejo normal de controles simples
        const label = document.querySelector(`label[for="${campo}"]`)?.textContent || campo;
        camposFaltantes.push(label);
  
        const elemento = document.querySelector(`[formControlName="${campo}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  
        if (!primerCampoFaltante && elemento) {
          primerCampoFaltante = elemento;
        }
  
        if (elemento) {
          elemento.classList.add('border-red-500');
        }
      }
    });
  
    if (camposFaltantes.length > 0) {
      alert(`Faltan los siguientes campos: \n${camposFaltantes.join('\n')}`);
  
      // Enfocar el primer campo vacío
      if (primerCampoFaltante) {
        setTimeout(() => primerCampoFaltante!.focus(), 0);
      }
    }
  }
  
  
  eliminarError(campo: string) {
    const elemento = document.querySelector(`[formControlName="${campo}"]`);
    if (elemento) {
      elemento.classList.remove('border-red-500');
    }
  }  
  
  //#endregion
}
