import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = `${environment.api}/hr/horario`;

  constructor(private http: HttpClient) {}

  createHorarios(payload: { items: any[] }, turno_id: number) {
    return this.http.post(`${this.apiUrl}/turno/${turno_id}`, payload, {
      withCredentials: true,
    });
  }

  deleteHorarios(turno_id: number) {
    return this.http.delete(`${this.apiUrl}/turno/${turno_id}`);
  }

  deleteHorario(turno_id: number) {
    return this.http.delete(`${this.apiUrl}/${turno_id}`);
  }
}
