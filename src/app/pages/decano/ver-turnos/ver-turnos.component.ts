import { Component, OnInit } from '@angular/core';
import { TurnoService } from '../../../services/turno.service';
import { CursoService } from '../../../services/curso.service';
import { AlertService } from '../../../services/alert.service';
import { Turno } from '../../../interfaces/turno';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ver-turnos',
  standalone: false,
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css',
})
export class VerTurnosComponent implements OnInit {
  editCache: { [key: string]: { edit: boolean; data: Turno } } = {};
  listOfData: Turno[] = [];
  searchValue: string = '';
  datosFiltrados: Turno[] = [];

  pageSize = 10;
  pageIndex = 1;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly Turno[] = [];
  setOfCheckedId = new Set<number>();

  especialidades: any = [];
  especialidadesFiltradas: any = [];

  filtros = {
    n_codper: '20242',
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
      compare: (a: Turno, b: Turno) => a.n_codper - b.n_codper,
      priority: false,
      nzWidth: 'auto',
    },
    {
      title: 'Plan',
      compare: (a: Turno, b: Turno) => a.n_codpla - b.n_codpla,
      priority: false,
      nzWidth: 'auto',
    },
    {
      title: 'Facultad',
      compare: (a: Turno, b: Turno) => a.c_codfac.localeCompare(b.c_codfac),
      priority: 3,
      nzWidth: 'auto',
    },
    {
      title: 'Especialidad',
      compare: (a: Turno, b: Turno) => a.c_codesp.localeCompare(b.c_codesp),
      priority: 2,
      nzWidth: 'auto',
    },
    {
      title: 'Seccion',
      compare: (a: Turno, b: Turno) => a.c_grpcur.localeCompare(b.c_grpcur),
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Ciclo',
      compare: (a: Turno, b: Turno) => a.n_ciclo - b.n_ciclo,
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Modalidad',
      compare: (a: Turno, b: Turno) => a.c_nommod.localeCompare(b.c_nommod),
      priority: 1,
      nzWidth: 'auto',
    },
    {
      title: 'Estado',
      compare: (a: Turno, b: Turno) => a.estado - b.estado,
      priority: 1,
      nzWidth: '10%',
    },

    {
      title: 'Accion',
      compare: (a: Turno, b: Turno) => a.c_nommod.localeCompare(b.c_nommod),
      priority: 1,
      nzWidth: 'auto',
    },
  ];

  constructor(
    private turnoService: TurnoService,
    private siguService: CursoService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEspecialidades();
    this.getTurnos();
    this.updateEditCache();
  }

  getEspecialidades() {
    this.siguService.getEspecialidades().subscribe((data) => {
      this.especialidades = data;
    });
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1; // opcional: vuelve a la primera página
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

  onCurrentPageDataChange($event: readonly Turno[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  verCursos(turno: Turno) {
    const currentPrefix = this.router.url.split('/')[1];
    const url = `/${currentPrefix}/asignarhorario?id=${turno.id}`;
    window.open(url, '_blank');
  }

  clickAsignarHorario(id: number) {
    const url = this.router
      .createUrlTree([`/coa/asignar/${id}`], {})
      .toString();

    window.open(url, '_blank');
  }
}
