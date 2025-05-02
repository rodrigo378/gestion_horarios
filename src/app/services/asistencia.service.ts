import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {
  private apiUrl = `${environment.api}/asistencia`;

  constructor(private http: HttpClient) {}

  marcarEntrada(docente_id: number, aula_id: number) {
    return this.http.post(
      `${this.apiUrl}/entrada`,
      { docente_id, aula_id },
      { withCredentials: true }
    );
  }

  marcarSalida(docente_id: number, aula_id: number) {
    return this.http.post(
      `${this.apiUrl}/salida`,
      { docente_id, aula_id },
      { withCredentials: true }
    );
  }

  getAsistenciaDocente(docente_id: number) {
    return this.http.get(`${this.apiUrl}/docente/${docente_id}`, {
      withCredentials: true,
    });
  }
}
