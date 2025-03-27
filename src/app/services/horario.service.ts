import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import {
  CreateHorario,
  getHorario,
  Horario,
  UpdateHorario,
} from '../interfaces/Horario';
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

  getHorarios(
    c_codmod?: string,
    n_codper?: number,
    c_codfac?: string,
    c_codesp?: string,
    n_codpla?: number
  ) {
    const params: any = {};
    if (c_codmod) params.c_codmod = c_codmod;
    if (n_codper) params.n_codper = n_codper;
    if (c_codfac) params.c_codfac = c_codfac;
    if (c_codesp) params.c_codesp = c_codesp;
    if (n_codpla) params.n_codpla = n_codpla;

    return this.http.get<Horario[]>('http://localhost:3000/horario', {
      params,
    });
  }

  asociarHorarioTransversal(padre_id: number, hijo_id: number) {
    return this.http.post(`${this.apiUrl}/transversal`, { padre_id, hijo_id });
  }
}
