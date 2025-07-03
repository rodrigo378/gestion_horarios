import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Periodo, Turno } from '../interfaces/turno';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Curso2 } from '../interfaces/Curso';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private apiUrl = `${environment.api}/turno`;
  private apiUrlget = `${environment.api}`;

  constructor(private http: HttpClient) {}

  getTurnos(params: any): Observable<Turno[]> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<Turno[]>(this.apiUrl, { params: httpParams });
  }

  getTurno(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/${id}`);
  }

  getCursosPlanTurno(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plan/cursos/${id}`);
  }

  getCursosTurno(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cursos/${id}`);
  }

  createTurno(turno: Turno) {
    return this.http.post(this.apiUrl, turno, { withCredentials: true });
  }

  deleteTurno(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  generarCurso(curso: Curso2) {
    return this.http.post(`${this.apiUrl}/generar/curso`, curso, {
      withCredentials: true,
    });
  }

  actualizarEstado(id: number, estado: number) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      { estado },
      { withCredentials: true }
    );
  }

  private estadoActualizado = new BehaviorSubject<number | null>(null);

  emitirCambioEstado(turnoId: number) {
    this.estadoActualizado.next(turnoId), { withCredentials: true };
  }

  onCambioEstado() {
    return this.estadoActualizado.asObservable();
  }

  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrlget}/periodo`);
  }

  bloquearTurnos(turnos_id: number[]) {
    return this.http.post(`${this.apiUrl}/bloquear`, turnos_id);
  }

  desbloquearTurnos(turnos_id: number[]) {
    return this.http.post(`${this.apiUrl}/desbloquear`, turnos_id);
  }
}
