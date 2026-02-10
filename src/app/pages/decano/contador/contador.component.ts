import { Component } from '@angular/core';
import { ContadorResult } from '../../../interfaces/hr/hr_contador';
import { ContadorService } from '../../../services/contador.service';
import { AlertService } from '../../../services/alert.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-contador',
  standalone: false,
  templateUrl: './contador.component.html',
  styleUrl: './contador.component.css',
})
export class ContadorComponent {
  contador: ContadorResult[] = [];
  contadorFiltrado: ContadorResult[] = [];
  search = '';

  // MODALES
  modalCrearVisible = false;
  modalEditarVisible = false;

  // Formulario
  formLimite: number | null = null;

  // Item seleccionado
  selectedItem: ContadorResult | null = null;

  listOfColumn = [
    {
      title: 'courseid',
      nzWidth: '20%',
      compare: (a: ContadorResult, b: ContadorResult) => {
        // Si ambos son números
        if (typeof a.courseId === 'number' && typeof b.courseId === 'number') {
          return a.courseId - b.courseId;
        }

        // Si ambos son strings
        if (typeof a.courseId === 'string' && typeof b.courseId === 'string') {
          return parseInt(a.courseId, 10) - parseInt(b.courseId, 10);
        }

        // Si uno es undefined/null
        const idA = a.courseId ? Number(a.courseId) : 0;
        const idB = b.courseId ? Number(b.courseId) : 0;
        return idA - idB;
      },
      priority: false,
    },
    {
      title: 'Curso',
      compare: (a: ContadorResult, b: ContadorResult) =>
        a.c_codcur.localeCompare(b.c_codcur),
      priority: 3,
    },
    {
      title: 'Código',
      compare: (a: ContadorResult, b: ContadorResult) =>
        a.c_codcur.localeCompare(b.c_codcur),
      priority: 3,
    },
    {
      title: 'Especialidad',
      compare: (a: ContadorResult, b: ContadorResult) =>
        a.c_codesp.localeCompare(b.c_codesp),
      priority: 3,
    },
    {
      title: 'Secciones',
      compare: (a: ContadorResult, b: ContadorResult) =>
        a.secciones.localeCompare(b.secciones),
      priority: 3,
    },
    {
      title: 'Vacantes Totales',
      compare: (a: ContadorResult, b: ContadorResult) =>
        a.total_vacantes_tot - b.total_vacantes_tot,
      priority: 3,
    },
    {
      title: 'Matriculados',
      compare: (a: ContadorResult, b: ContadorResult) =>
        a.total_vacantes_matriculados - b.total_vacantes_matriculados,
      priority: 3,
    },
    {
      title: 'Ciclo',
      compare: (a: ContadorResult, b: ContadorResult) => a.n_ciclo - b.n_ciclo,
      priority: 3,
    },
    {
      title: 'Estado',
      compare: (a: ContadorResult, b: ContadorResult) => {
        // Activo (con courseId) primero, luego Sin contador
        const aHasContador = !!a.courseId;
        const bHasContador = !!b.courseId;

        if (aHasContador && !bHasContador) return -1;
        if (!aHasContador && bHasContador) return 1;
        return 0;
      },
      priority: 3,
    },
    {
      title: 'limite',
      compare: (a: ContadorResult, b: ContadorResult) => {
        const limiteA = a.limite || 0;
        const limiteB = b.limite || 0;
        return limiteA - limiteB;
      },
      priority: false,
    },
    {
      title: 'Ejecutado',
      compare: (a: ContadorResult, b: ContadorResult) => {
        const valorA = !a.courseId ? 0 : a.ejecutado ? 2 : 1;
        const valorB = !b.courseId ? 0 : b.ejecutado ? 2 : 1;
        return valorA - valorB;
      },
      priority: false,
    },

    {
      title: 'Fecha Ejecución',
      compare: (a: ContadorResult, b: ContadorResult) => {
        const getFechaNum = (item: ContadorResult): number => {
          if (!item.courseId) return -1;
          if (!item.ejecutado_at) return 0;
          const fecha = new Date(item.ejecutado_at);
          return fecha.getTime() || 0;
        };
        return getFechaNum(a) - getFechaNum(b);
      },
      priority: false,
    },
  ];

  // Agrega estas propiedades después de las existentes
  filtros = {
    n_ciclo: '', // Filtro por ciclo
    estado: '', // Filtro por estado del contador
  };

  especialidadesFiltradas: any[] = [];
  especialidades = [
    {
      nomesp: 'ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES',
      codesp: 'E1',
      codfac: 'E',
    },
    { nomesp: 'ADMINISTRACIÓN Y MARKETING', codesp: 'E2', codfac: 'E' },
    { nomesp: 'CONTABILIDAD Y FINANZAS', codesp: 'E3', codfac: 'E' },
    {
      nomesp: 'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES',
      codesp: 'E4',
      codfac: 'E',
    },
    { nomesp: 'INGENIERÍA INDUSTRIAL', codesp: 'E5', codfac: 'E' },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'ENFERMERÍA', codesp: 'S1', codfac: 'S' },
    { nomesp: 'FARMACIA Y BIOQUÍMICA', codesp: 'S2', codfac: 'S' },
    { nomesp: 'NUTRICIÓN Y DIETÉTICA', codesp: 'S3', codfac: 'S' },
    { nomesp: 'PSICOLOGÍA', codesp: 'S4', codfac: 'S' },
    { nomesp: 'TM TERAPIA FÍSICA Y REHAB', codesp: 'S5', codfac: 'S' },
    { nomesp: 'TM LAB. CLÍNICO Y ANAT. PAT', codesp: 'S6', codfac: 'S' },
    { nomesp: 'MEDICINA', codesp: 'S7', codfac: 'S' },
  ];

  // Modifica el método aplicarFiltros() o crea uno nuevo
  aplicarFiltros(): void {
    this.contadorFiltrado = this.contador.filter((item) => {
      // Filtro por ciclo
      const coincideCiclo = this.filtros.n_ciclo
        ? String(item.n_ciclo) === this.filtros.n_ciclo
        : true;

      // Filtro por estado del contador
      const coincideEstado =
        this.filtros.estado === ''
          ? true
          : this.filtros.estado === 'activo'
            ? !!item.courseId
            : this.filtros.estado === 'sin_contador'
              ? !item.courseId
              : true;

      return coincideCiclo && coincideEstado;
    });
  }

  // Método para cambiar filtros (puedes adaptar según tu estructura)
  onChangeFiltro(tipo: string, valor: string): void {
    // Actualiza el filtro correspondiente
    if (tipo === 'n_ciclo') {
      this.filtros.n_ciclo = valor;
    } else if (tipo === 'estado') {
      this.filtros.estado = valor;
    } else if (tipo === 'especialidad') {
      // this.filtros.especialidad = valor;
    }

    // Aplica los filtros
    this.aplicarFiltros();
  }

  constructor(
    private contadorService: ContadorService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.getContador();
  }

  // getContador() {
  //   this.contadorService.getContador().subscribe((data) => {
  //     this.contador = data;
  //     this.contadorFiltrado = data;
  //   });
  // }
  getContador() {
    this.contadorService.getContador(20261).subscribe((data) => {
      this.contador = data;
      this.contadorFiltrado = data;

      // Inicializar especialidades filtradas (si decides agregar filtro por especialidad)
      this.especialidadesFiltradas = this.especialidades;

      // Aplicar filtros iniciales si los hay
      this.aplicarFiltros();
    });
  }

  filtrar() {
    const term = this.search.toLowerCase().trim();
    this.contadorFiltrado = this.contador.filter(
      (item) =>
        item.courseid_temp.toLowerCase().includes(term) ||
        item.c_nomcur.toLowerCase().includes(term) ||
        item.c_codcur.toLowerCase().includes(term),
    );
  }

  // -----------------------
  // CREAR CONTADOR
  // -----------------------
  openCrear(item: ContadorResult) {
    this.selectedItem = item;
    this.formLimite = null;
    this.modalCrearVisible = true;
  }

  crearContador() {
    if (!this.formLimite || !this.selectedItem) return;

    this.alertService.showLoadingScreen('Creando contador...');

    this.contadorService
      .createContador({
        courseId: Number(this.selectedItem.courseid_temp),
        limite: this.formLimite,
      })
      .subscribe({
        next: () => {
          this.alertService.close();
          this.alertService.success(
            'Contador creado correctamente.',
            '¡Éxito!',
          );
          this.getContador();
          this.closeModal();
        },
        error: () => {
          this.alertService.close();
          this.alertService.error('No se pudo crear el contador.');
        },
      });
  }

  // -----------------------
  // EDITAR CONTADOR
  // -----------------------
  openEditar(item: ContadorResult) {
    this.selectedItem = item;
    this.formLimite = item.limite ?? null;
    this.modalEditarVisible = true;
  }

  editarContador() {
    if (!this.formLimite || !this.selectedItem?.id) return;

    this.alertService.showLoadingScreen('Actualizando contador...');

    this.contadorService
      .updateContador(this.selectedItem.id, this.formLimite)
      .subscribe({
        next: () => {
          this.alertService.close();
          this.alertService.success(
            'Límite actualizado correctamente.',
            '¡Éxito!',
          );
          this.getContador();
          this.closeModal();
        },
        error: () => {
          this.alertService.close();
          this.alertService.error('No se pudo actualizar el contador.');
        },
      });
  }

  closeModal() {
    this.modalCrearVisible = false;
    this.modalEditarVisible = false;
    this.selectedItem = null;
    this.formLimite = null;
  }

  exportarExcel() {
    if (!this.contadorFiltrado.length) {
      this.alertService.error('No hay datos para exportar.');
      return;
    }

    const data = this.contadorFiltrado.map((item) => ({
      CourseID_SIGU: item.courseid_temp,
      Curso: item.c_nomcur,
      Codigo: item.c_codcur,
      Especialidad: item.c_codesp,
      Secciones: item.secciones,
      Vacantes_Totales: item.total_vacantes_tot,
      Matriculados: item.total_vacantes_matriculados,
      Ciclo: item.n_ciclo,
      Estado: item.courseId ? 'Activo' : 'Sin contador',
      Limite: item.courseId ? item.limite : '-',
      Ejecutado: item.courseId ? (item.ejecutado ? 'Sí' : 'No') : '-',
      Fecha_Ejecucion: item.courseId
        ? new Date(item.ejecutado_at || '').toLocaleString()
        : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contadores');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `contadores_${new Date().getTime()}.xlsx`);
  }
}
