import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { CreateHorario, HorarioExtendido, UpdateHorarioData } from '../interfaces/Horario';
@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = `${environment.api}/horario`;
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  guardarHorarios(dataArray: CreateHorario[]): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { dataArray });
  }
  
  getHorarioPorTurno(turno_id: number): Observable<HorarioExtendido[]> {
    return this.http.get<HorarioExtendido[]>(`${this.apiUrl}/turno/${turno_id}`);
  }
  
  updateHorarios(data: UpdateHorarioData): Observable<any> {
    return this.http.put(`${this.apiUrl}`, data);
  }
  
  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }  
  
}
