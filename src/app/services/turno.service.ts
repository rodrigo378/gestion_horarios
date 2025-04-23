import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Periodo, Turno } from '../interfaces/turno';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private apiUrl = `${environment.api}/turno`;
  private apiUrlget = `${environment.api}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.apiUrl);
  }

  getTurnoById(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/${id}`);
  }

  getTurnosFiltrados(params: any): Observable<Turno[]> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<Turno[]>(this.apiUrl, { params: httpParams });
  }

  createTurno(turno: Turno) {
    return this.http.post(this.apiUrl, turno, { withCredentials: true });
  }

  deleteTurno(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  actualizarEstado(id: number, estado: number) {
    return this.http.put(`${this.apiUrl}/${id}`, { estado });
  }

  private estadoActualizado = new BehaviorSubject<number | null>(null);

  emitirCambioEstado(turnoId: number) {
    this.estadoActualizado.next(turnoId);
  }

  onCambioEstado() {
    return this.estadoActualizado.asObservable();
  }

  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrlget}/periodo`);
  }
}
