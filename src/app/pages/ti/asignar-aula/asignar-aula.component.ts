import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { SiguService } from '../../../services/sigu.service';

interface Aula {
  id_aula: number;
  c_codaula: string;
  c_detalle: string;
  c_obs: string | null;
  id_pab: number;
  n_capacidad: number;
  n_piso: number;
}

interface HorarioAula {
  c_hh_fin: string;
  c_hh_ini: string;
  c_mi_fin: string;
  c_mi_ini: string;
  n_codper: number;
  n_numdia: number; // 1 = lunes, 2 = martes, ... 7 = domingo
}

@Component({
  selector: 'app-asignar-aula',
  standalone: false,
  templateUrl: './asignar-aula.component.html',
  styleUrls: ['./asignar-aula.component.css'],
})
export class AsignarAulaComponent implements OnInit {
  constructor(
    private readonly siguService: SiguService,
    private readonly elementRef: ElementRef,
  ) {}

  aulas: Aula[] = [];
  aulasFiltradas: Aula[] = [];
  horariosAula: HorarioAula[] = [];

  aulaSeleccionadaId: number | null = null;
  textoBusqueda: string = '';
  dropdownAbierto: boolean = false;

  diasSemana = [
    { id: 1, nombre: 'Lunes', corto: 'LUN' },
    { id: 2, nombre: 'Martes', corto: 'MAR' },
    { id: 3, nombre: 'Miércoles', corto: 'MIÉ' },
    { id: 4, nombre: 'Jueves', corto: 'JUE' },
    { id: 5, nombre: 'Viernes', corto: 'VIE' },
    { id: 6, nombre: 'Sábado', corto: 'SÁB' },
    { id: 7, nombre: 'Domingo', corto: 'DOM' },
  ];

  ngOnInit(): void {
    this.getAulas();
  }

  getAulas(): void {
    this.siguService.getAulas().subscribe((data: any) => {
      console.log('aulas => ', data);
      this.aulas = data || [];
      this.aulasFiltradas = [...this.aulas];
    });
  }

  abrirDropdown(): void {
    this.dropdownAbierto = true;
    this.filtrarAulas();
  }

  filtrarAulas(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    if (!texto) {
      this.aulasFiltradas = [...this.aulas];
      return;
    }

    this.aulasFiltradas = this.aulas.filter((aula) =>
      `${aula.c_codaula} ${aula.c_detalle || ''} piso ${aula.n_piso} capacidad ${aula.n_capacidad} pabellon ${aula.id_pab}`
        .toLowerCase()
        .includes(texto),
    );
  }

  seleccionarAulaDesdeLista(aula: Aula): void {
    this.aulaSeleccionadaId = aula.id_aula;
    this.textoBusqueda = `${aula.c_codaula} | Piso ${aula.n_piso} | Cap. ${aula.n_capacidad}`;
    this.dropdownAbierto = false;
    this.getHorarioAula(aula.id_aula);
  }

  limpiarSeleccion(): void {
    this.aulaSeleccionadaId = null;
    this.textoBusqueda = '';
    this.horariosAula = [];
    this.aulasFiltradas = [...this.aulas];
    this.dropdownAbierto = false;
  }

  getHorarioAula(idAula: number): void {
    this.siguService.gethorarioAula(idAula).subscribe((data: any) => {
      console.log('horario => ', data);
      this.horariosAula = data || [];
    });
  }

  obtenerHorariosPorDia(idDia: number): HorarioAula[] {
    return this.horariosAula
      .filter((h) => Number(h.n_numdia) === idDia)
      .sort(
        (a, b) =>
          this.convertirHoraAMinutos(a.c_hh_ini, a.c_mi_ini) -
          this.convertirHoraAMinutos(b.c_hh_ini, b.c_mi_ini),
      );
  }

  formatearRangoHorario(horario: HorarioAula): string {
    return `${horario.c_hh_ini.padStart(2, '0')}:${horario.c_mi_ini.padStart(2, '0')} - ${horario.c_hh_fin.padStart(2, '0')}:${horario.c_mi_fin.padStart(2, '0')}`;
  }

  tieneHorariosEnDia(idDia: number): boolean {
    return this.horariosAula.some((h) => Number(h.n_numdia) === idDia);
  }

  convertirHoraAMinutos(hora: string, minuto: string): number {
    return Number(hora) * 60 + Number(minuto);
  }

  get aulaSeleccionada(): Aula | undefined {
    return this.aulas.find((a) => a.id_aula === this.aulaSeleccionadaId);
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownAbierto = false;
    }
  }
}
