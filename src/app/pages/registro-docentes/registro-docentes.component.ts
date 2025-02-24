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
  currentStep =  6;
  totalSteps = 10;
  
  exp_docentes: any [] = [{}]
  exp_investigadora: any [] = [{}]
  libro: any [] = [{}]
  proyecto_investigacion: any [] = [{}]
  asesoria_jurado: any [] = [{}]
  otros: any [] = [{}]

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
      nombre_emergencia: ['', Validators.required],
      relacion_emergencia: ['', Validators.required],
      telefono_emergencia: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      telefono_emergencia2: ['', [Validators.pattern('^[0-9]{9}$')]], // Opcional

      // Domicilio del Docente
      departamento_id: ['', Validators.required],
      provincia_id: ['', Validators.required],
      distrito_id: ['', Validators.required],
      direccion: ['', Validators.required],
      referencia: ['', Validators.required],
      mz: ['', Validators.required],
      lote: ['', Validators.required],

      //Formacion academica
      formacionAcademica: this.fb.array([]),

      //Titulo/formacion
      titulosProfesionales: this.fb.array([]),
      formacionComplementaria: this.fb.array([]),

    });

    this.agregarFormacionAcademica();
    this.agregarTituloProfesional();
    this.agregarFormacionComplementaria();
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

  // Método para castear AbstractControl a FormGroup
  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  // Método para convertir un AbstractControl de titulosProfesionales a FormGroup
getTituloProfesionalFormGroup(control: AbstractControl): FormGroup {
  return control as FormGroup;
}

// Método para convertir un AbstractControl de formacionesComplementarias a FormGroup
getFormacionComplementariaFormGroup(control: AbstractControl): FormGroup {
  return control as FormGroup;
}

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
      revalidacion: ['', Validators.required]
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

  agregarexp(){
    this.exp_docentes.push({})
  }

  eliminarexp(index: number): void{
    if (this.exp_docentes.length > 1){
      this.exp_docentes.splice(index , 1)
    }
  }

  agregarexpinvestigadora(){
    this.exp_investigadora.push({})
  }

  eliminarexpinvestigadora(index: number): void{
    if (this.exp_investigadora.length > 1){
      this.exp_investigadora.splice(index , 1)
    }
  }

  agregarlibro(){
    this.libro.push({})
  }

  eliminarlibro(index: number): void{
    if (this.libro.length > 1){
      this.libro.splice(index , 1)
    }
  }

  agregarproyec(){
    this.proyecto_investigacion.push({})
  }

  eliminarproyec(index: number): void{
    if (this.proyecto_investigacion.length > 1){
      this.proyecto_investigacion.splice(index , 1)
    }
  }

  agregarasejura(){
    this.asesoria_jurado.push({})
  }

  eliminarasejura(index: number): void{
    if (this.asesoria_jurado.length > 1){
      this.asesoria_jurado.splice(index , 1)
    }
  }

  agregarotros(){
    this.otros.push({})
  }

  eliminarotros(index: number): void{
    if (this.otros.length > 1){
      this.otros.splice(index , 1)
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
      alert('Hay errores en el formulario, revisa los campos.');
    }
  }
  //#endregion
}
