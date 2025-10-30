import { Component } from '@angular/core';
import { TurnoService } from '../../../services/turno.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HR_Turno } from '../../../interfaces/hr/hr_turno';

@Component({
  selector: 'app-ver-turno',
  standalone: false,
  templateUrl: './ver-turno.component.html',
  styleUrl: './ver-turno.component.css',
})
export class VerTurnoComponent {
  editCache: { [key: string]: { edit: boolean; data: HR_Turno } } = {};
  listOfData: HR_Turno[] = [];
  searchValue: string = '';
  datosFiltrados: HR_Turno[] = [];

  pageSize = 10;
  pageIndex = 1;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly HR_Turno[] = [];
  setOfCheckedId = new Set<number>();

  especialidades: { nomesp: string; codesp: string; codfac: string }[] = [
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
    {
      nomesp: 'INGENIERÍA DE INTELIGENCIA ARTIFICIAL',
      codesp: 'E6',
      codfac: 'E',
    },
    { nomesp: 'INGENIERÍA DE SISTEMAS', codesp: 'E7', codfac: 'E' },
    { nomesp: 'ADMINISTRACIÓN DE EMPRESAS', codesp: 'E8', codfac: 'E' },
    { nomesp: 'DERECHO', codesp: 'E9', codfac: 'E' },
    { nomesp: 'ENFERMERÍA', codesp: 'S1', codfac: 'S' },
    { nomesp: 'FARMACIA Y BIOQUÍMICA', codesp: 'S2', codfac: 'S' },
    { nomesp: 'NUTRICIÓN Y DIETÉTICA', codesp: 'S3', codfac: 'S' },
    { nomesp: 'PSICOLOGÍA', codesp: 'S4', codfac: 'S' },
    {
      nomesp: 'TEC. MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN',
      codesp: 'S5',
      codfac: 'S',
    },
    {
      nomesp: 'TEC. MÉDICA EN LAB. CLÍNICO Y ANATOMÍA PATOLÓGICA',
      codesp: 'S6',
      codfac: 'S',
    },
    { nomesp: 'MEDICINA', codesp: 'S7', codfac: 'S' },
  ];
  especialidadesFiltradas: any = [];

  filtros = {
    n_codper: '20252',
    c_codfac: '',
    c_codesp: '',
    c_codmod: '',
    n_ciclo: '',
    estado: '',
    c_grpcur: '',
  };

  listOfColumn = [
    {
      title: 'Periodo',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_codper - b.n_codper,
      priority: false,
      nzWidth: 'auto',
    },
    {
      title: 'Plan',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_codpla - b.n_codpla,
      priority: false,
      nzWidth: 'auto',
    },
    {
      title: 'Facultad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_codfac.localeCompare(b.c_codfac),
      priority: 3,
      nzWidth: 'auto',
    },
    {
      title: 'Especialidad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_codesp.localeCompare(b.c_codesp),
      priority: 2,
      nzWidth: 'auto',
    },
    {
      title: 'Seccion',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_grpcur.localeCompare(b.c_grpcur),
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Ciclo',
      compare: (a: HR_Turno, b: HR_Turno) => a.n_ciclo - b.n_ciclo,
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Modalidad',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_nommod.localeCompare(b.c_nommod),
      priority: 1,
      nzWidth: '10%',
    },
    {
      title: 'Estado',
      compare: (a: HR_Turno, b: HR_Turno) => a.estado - b.estado,
      priority: 1,
      nzWidth: '10%',
    },
    {
      title: 'Bloqueado',
      compare: (a: HR_Turno, b: HR_Turno) => a.estado - b.estado,
      priority: 1,
      nzWidth: '10%',
    },
    {
      title: 'Accion',
      compare: (a: HR_Turno, b: HR_Turno) =>
        a.c_nommod.localeCompare(b.c_nommod),
      priority: 1,
      nzWidth: 'auto',
    },
  ];

  constructor(private turnoService: TurnoService) {}

  ngOnInit(): void {
    this.getTurnos();
    this.updateEditCache();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
  }

  getTurnos() {
    this.turnoService.getTurnos(this.filtros).subscribe((data) => {
      this.listOfData = data;
      this.datosFiltrados = [...this.listOfData];

      this.updateEditCache();
    });
  }
  get total(): number {
    return this.datosFiltrados.length;
  }

  onChangeFacultad(filtro: string, valor: string) {
    switch (filtro) {
      case 'n_codper':
        this.filtros.n_codper = valor;
        this.getTurnos();
        console.log(this.filtros);
        break;
      case 'facultad':
        this.filtros.c_codfac = valor;
        this.especialidadesFiltradas = this.especialidades.filter(
          (item: any) => item.codfac === this.filtros.c_codfac
        );
        this.getTurnos();
        console.log(this.filtros);
        break;
      case 'especialidad':
        this.filtros.c_codesp = valor;
        this.getTurnos();
        console.log(this.filtros);
        break;
      case 'modalidad':
        this.filtros.c_codmod = valor;
        this.getTurnos();
        console.log(this.filtros);
        break;
      case 'ciclo':
        this.filtros.n_ciclo = valor;
        this.getTurnos();
        console.log(this.filtros);
        break;
      case 'estado':
        this.filtros.estado = valor;
        this.getTurnos();
        console.log(this.filtros);
        break;
    }
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfData.findIndex((item) => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfData[index] },
      edit: false,
    };
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.id, value)
    );
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.id)
      ) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  updateEditCache(): void {
    this.listOfData.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  clickBloquearTodo() {
    console.log('aca => ', this.setOfCheckedId);
    this.turnoService
      .bloquearTurnos(Array.from(this.setOfCheckedId))
      .subscribe({
        next: (res: any) => {
          console.log('res => ', res);
          this.getTurnos();
        },
        error: (err: HttpErrorResponse) => {
          console.log('err => ', err);
        },
      });
  }

  clickDesbloquearTodo() {
    console.log('aca => ', this.setOfCheckedId);
    this.turnoService
      .desbloquearTurnos(Array.from(this.setOfCheckedId))
      .subscribe({
        next: (res: any) => {
          console.log('res => ', res);
          this.getTurnos();
        },
        error: (err: HttpErrorResponse) => {
          console.log('err => ', err);
        },
      });
  }

  onCurrentPageDataChange($event: readonly HR_Turno[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }
}
