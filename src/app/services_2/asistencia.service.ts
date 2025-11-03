import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

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

  getAsistenciaDocente(
    docente_id: number,
    filtros: {
      filtro?: 'diario' | 'rango' | 'mensual';
      fecha?: string;
      desde?: string;
      hasta?: string;
      mes?: string;
    }
  ): Observable<any[]> {
    const params = new HttpParams({ fromObject: filtros ?? {} });

    return this.http.get<any[]>(`${this.apiUrl}/docente/${docente_id}`, {
      params,
      withCredentials: true,
    });
  }
}
