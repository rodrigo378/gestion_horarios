import { Component, OnInit } from '@angular/core';
import { DocenteService } from '../../../services/docente.service';
import { Docente } from '../../../interfaces_2/Docente';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../services/alert.service';
import { HR_Docente } from '../../../interfaces/hr/hr_docente';

@Component({
  selector: 'app-docente',
  standalone: false,
  templateUrl: './docente.component.html',
  styleUrl: './docente.component.css',
})
export class DocenteComponent implements OnInit {
  editCache: { [key: string]: { edit: boolean; data: HR_Docente } } = {};
  listOfData: HR_Docente[] = [];
  searchValue: string = '';
  datosFiltrados: HR_Docente[] = [];

  listOfColumn = [
    {
      title: 'id',
      nzWidth: '20%',
      compare: (a: HR_Docente, b: HR_Docente) => a.id - b.id,
      priority: false,
    },
    {
      title: 'dni',
      compare: (a: HR_Docente, b: HR_Docente) =>
        a.c_dnidoc.localeCompare(b.c_dnidoc),
      priority: false,
    },
    {
      title: 'Nombre',
      compare: (a: HR_Docente, b: HR_Docente) =>
        a.c_nomdoc.localeCompare(b.c_nomdoc),
      priority: 3,
    },
    {
      title: 'H. Min',
      compare: (a: HR_Docente, b: HR_Docente) => a.h_min - b.h_min,
      priority: 2,
    },
    {
      title: 'H. Max',
      compare: (a: HR_Docente, b: HR_Docente) => a.h_max - b.h_max,
      priority: 1,
    },
    {
      title: 'H. Asignadas',
      compare: (a: HR_Docente, b: HR_Docente) => a.h_total - b.h_total,
      priority: 1,
    },
    {
      title: 'Tipo',
      compare: (a: HR_Docente, b: HR_Docente) => a.tipo - b.tipo,
      priority: 1,
    },
    {
      title: 'Accion',
      compare: (a: HR_Docente, b: HR_Docente) => a.tipo - b.tipo,
      priority: 1,
    },
  ];

  constructor(
    private docenteService: DocenteService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    console.log('ti/docente');

    this.getDocente();
    this.updateEditCache();
  }

  getDocente() {
    this.docenteService.obtenerDocentes().subscribe((data) => {
      this.listOfData = data;
      this.datosFiltrados = [...this.listOfData];

      this.updateEditCache();
    });
  }

  buscar(): void {
    const filtro = this.searchValue.trim().toLowerCase();
    this.datosFiltrados = this.listOfData.filter(
      (item) =>
        item.c_nomdoc.toLowerCase().includes(filtro) ||
        item.c_dnidoc.includes(filtro)
    );
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

  saveEdit(id: number): void {
    this.alertService.iniciarSolicitud();
    const index = this.listOfData.findIndex((item) => item.id === id);

    this.docenteService.updateDocente(this.editCache[id].data).subscribe({
      next: (res: any) => {
        Object.assign(this.listOfData[index], this.editCache[id].data);
        console.log('res => ', res);
        this.alertService.finalizarSolicitud();
      },
      error: (er: HttpErrorResponse) => {
        console.log('error => ', er);
        this.alertService.finalizarSolicitud();
      },
    });

    console.log('new data => ', this.editCache[id].data);

    this.editCache[id].edit = false;
  }

  updateEditCache(): void {
    this.listOfData.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }
}
