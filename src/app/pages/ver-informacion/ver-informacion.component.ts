import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocenteService } from '../../services/docente.service';

@Component({
  selector: 'app-ver-informacion',
  standalone: false,
  templateUrl: './ver-informacion.component.html',
  styleUrl: './ver-informacion.component.css'
})
export class VerInformacionComponent implements OnInit{

  docente: any = null;

  constructor(
    private route: ActivatedRoute,
    private docenteService: DocenteService
  ) {}

  ngOnInit(): void {
    this.cargarDocenteUsuario();
  }

  cargarDocenteUsuario(): void {
    this.docenteService.getDocentePorUsuario().subscribe(response => {
      this.docente = response.docente;
    }, error => {
      console.error("Error al obtener el docente:", error);
    });
  }
}