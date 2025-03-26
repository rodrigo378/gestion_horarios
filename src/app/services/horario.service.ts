import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { CreateHorario, getHorario, UpdateHorario } from '../interfaces/Horario';
@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = `${environment.api}/horario`;
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  guardarHorarios(horarios: CreateHorario[]): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { horarios });
  }
  
  getHorarioPorTurno(turno_id: number): Observable<getHorario[]> {
    return this.http.get<getHorario[]>(`${this.apiUrl}/${turno_id}`);
  }

  updateHorarios(data: { horarios: UpdateHorario[] }): Observable<any> {
    return this.http.put(`${this.apiUrl}`, data);
  }  
  
  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }  
  
}
