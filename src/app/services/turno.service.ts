import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HR_Turno } from '../interfaces/hr/hr_turno';
import { HR_Curso } from '../interfaces/hr/hr_curso';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private apiUrl = `${environment.api}/hr/turno`;

  constructor(private http: HttpClient) {}

  getTurnos(params: any): Observable<HR_Turno[]> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<HR_Turno[]>(this.apiUrl, { params: httpParams });
  }

  getTurno(id: number): Observable<HR_Turno> {
    return this.http.get<HR_Turno>(`${this.apiUrl}/${id}`);
  }

  getCursosPlanTurno(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plan/cursos/${id}`);
  }

  generarCurso(curso: Partial<HR_Curso>) {
    return this.http.post(`${this.apiUrl}/generar/curso`, curso, {
      withCredentials: true,
    });
  }

  bloquearTurnos(turnos_id: number[]) {
    return this.http.post(`${this.apiUrl}/bloquear`, turnos_id);
  }

  desbloquearTurnos(turnos_id: number[]) {
    return this.http.post(`${this.apiUrl}/desbloquear`, turnos_id);
  }
}
