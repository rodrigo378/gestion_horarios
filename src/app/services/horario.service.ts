import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { CreateHorario, Horario, HorarioExtendido, UpdateHorarioData } from '../interfaces/Horario';
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
