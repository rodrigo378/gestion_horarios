import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HR_Turno } from '../interfaces/hr/hr_turno';
import { HR_Curso } from '../interfaces/hr/hr_curso';

export interface ComparacionTurnoPeriodo {
  turno: HR_Turno;

  estadoGeneralCursos: string;
  estadoGeneralDocentes: string;
  estadoGeneralHorarios: string;

  estadoGeneral?: string; // calculado en el front
}

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private apiUrl = `${environment.api}/hr/turno`;

  constructor(private http: HttpClient) {}

  createTurno(data: Partial<HR_Turno>) {
    return this.http.post(`${this.apiUrl}`, data, { withCredentials: true });
  }

  getTurno(id: number): Observable<HR_Turno> {
    return this.http.get<HR_Turno>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  getCursosPlanTurno(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plan/cursos/${id}`, {
      withCredentials: true,
    });
  }

  generarCurso(curso: Partial<HR_Curso>) {
    return this.http.post(`${this.apiUrl}/generar/curso`, curso, {
      withCredentials: true,
    });
  }

  deleteCurso(curso_id: number) {
    return this.http.delete(`${this.apiUrl}/delete/curso/${curso_id}`, {
      withCredentials: true,
    });
  }

  bloquearTurnos(turnos_id: number[]) {
    return this.http.post(`${this.apiUrl}/bloquear`, turnos_id, {
      withCredentials: true,
    });
  }

  desbloquearTurnos(turnos_id: number[]) {
    return this.http.post(`${this.apiUrl}/desbloquear`, turnos_id, {
      withCredentials: true,
    });
  }

  getTurnos(filtros: any = {}): Observable<HR_Turno[]> {
    let params = new HttpParams();

    // Añadimos solo los filtros que tienen valor
    Object.keys(filtros).forEach((key) => {
      const value = filtros[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    return this.http.get<HR_Turno[]>(this.apiUrl, { params });
  }

  comparacionPorTurnoId(turno_id: number) {
    return this.http.get(`${this.apiUrl}/comparacion/turno/${turno_id}`, {
      withCredentials: true,
    });
  }

  comparacionPorPeriodo(
    n_codper: number
  ): Observable<ComparacionTurnoPeriodo[]> {
    return this.http.get<ComparacionTurnoPeriodo[]>(
      `${this.apiUrl}/comparacion/periodo/${n_codper}`,
      { withCredentials: true }
    );
  }

  generarReporte() {
    return this.http.get(`${this.apiUrl}/reporte`, { withCredentials: true });
  }
}
