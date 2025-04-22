import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.api}/dashboard`;

  constructor(
    private http: HttpClient,
  ) { }

  getdashboard1() {
    return this.http.get<{
      countCursos: number,
      countDocentes: number,
      countAulasAsignadas: number,
      porAsignacion: number
    }>(`${this.apiUrl}/1`);
  }  

  getHorasPorDocente() {
    return this.http.get<{ docente: string[], data: number[] }>(
      `${this.apiUrl}/docente`
    );
  }
  
  cargarTipoCursos(){
    return this,this.http.get<{ 
      countCursos: number, 
      countTransversales: number, 
      countAgrupados: number 
    }>(`${this.apiUrl}/tipo_curso`)
  }

  cargarEstadoTurno(){
    return this,this.http.get<{ 
      countTurnoEstado_0: number, 
      countTurnoEstado_1: number, 
      countTurnoEstado_2: number 
    }>(`${this.apiUrl}/estado_turno`)
  }
}
