import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.api}/dashboard`;

  constructor(private http: HttpClient) {}

  getdashboard1(n_codper: string) {
    return this.http.get<{
      countCursos: number;
      countDocentes: number;
      countAulasAsignadas: number;
      porAsignacion: number;
    }>(`${this.apiUrl}/1`, {
      params: { n_codper },
    });
  }

  getHorasPorDocente(n_codper: string) {
    return this.http.get<{ docente: string[]; data: number[] }>(
      `${this.apiUrl}/docente`,
      { params: { n_codper } }
    );
  }

  cargarTipoCursos(n_codper: string) {
    return (
      this,
      this.http.get<{
        countCursos: number;
        countTransversales: number;
        countAgrupados: number;
      }>(`${this.apiUrl}/tipo_curso`, { params: { n_codper } })
    );
  }

  cargarEstadoTurno(n_codper: string) {
    return (
      this,
      this.http.get<{
        countTurnoEstado_0: number;
        countTurnoEstado_1: number;
        countTurnoEstado_2: number;
      }>(`${this.apiUrl}/estado_turno`, { params: { n_codper } })
    );
  }
}
