import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface EstadoTurno {
  turnoId: number;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoTurnoService {
  // private estadosTurnos$ = new BehaviorSubject<EstadoTurno[]>([]);

  // setEstado(turnoId: number, estado: number) {
  //   const actuales = this.estadosTurnos$.value;
  //   const actualizados = actuales.filter(e => e.turnoId !== turnoId);
  //   this.estadosTurnos$.next([...actualizados, { turnoId, estado }]);
  // }

  // getEstados() {
  //   return this.estadosTurnos$.asObservable();
  // }

  // getEstado(turnoId: number): number | undefined {
  //   return this.estadosTurnos$.value.find(e => e.turnoId === turnoId)?.estado;
  // }
}
