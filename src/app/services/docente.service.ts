import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_Docente } from '../interfaces/hr/hr_docente';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private apiUrl = `${environment.api}/hr/docente`;

  constructor(private http: HttpClient) {}

  getDocentes(
    horario?: boolean,
    curso?: boolean,
    aula?: boolean,
    c_codfac?: string,
    c_codesp?: string,
  ): Observable<HR_Docente[]> {
    let params = new HttpParams();

    if (horario !== undefined) {
      params = params.set('horario', horario ? 'true' : 'false');
    }

    if (curso !== undefined) {
      params = params.set('curso', curso ? 'true' : 'false');
    }

    if (aula !== undefined) {
      params = params.set('aula', aula ? 'true' : 'false');
    }

    if (c_codfac) {
      params = params.set('c_codfac', c_codfac);
    }

    if (c_codesp) {
      params = params.set('c_codesp', c_codesp);
    }

    return this.http.get<HR_Docente[]>(this.apiUrl, { params });
  }

  getDocente(docente_id: number): Observable<HR_Docente> {
    return this.http.get<HR_Docente>(`${this.apiUrl}/${docente_id}`, {
      withCredentials: true,
    });
  }

  updateDocente(docente: Partial<HR_Docente>) {
    return this.http.put(`${this.apiUrl}/${docente.id}`, docente, {
      withCredentials: true,
    });
  }

  verificarDocente() {
    return this.http.get(`${this.apiUrl}/verificar`, {
      withCredentials: true,
      observe: 'response', // ✅ para leer headers
    });
  }

  // Obtener cursos del docente (sin tipos ni DTO)
  getCursosDocentes(c_dnidoc: string, n_codper: number, c_codmod: number) {
    return this.http.post(
      `${this.apiUrl}/cursos`,
      { c_dnidoc, n_codper, c_codmod },
      { withCredentials: true },
    );
  }

  // Obtener matriculados por courseid (sin tipos)
  matriculados(courseid: number) {
    return this.http.post(
      `${this.apiUrl}/matriculados`,
      { courseid },
      { withCredentials: true },
    );
  }
  // Obtener fechas de asistencia por courseid
  getFechasAsistencia(courseid: number) {
    return this.http.post(
      `${this.apiUrl}/asistencias/fechas`,
      { courseid },
      { withCredentials: true },
    );
  }

  getHorarios(courseid: number) {
    return this.http.post(
      `${this.apiUrl}/asistencias/horarios`,
      { courseid },
      { withCredentials: true },
    );
  }
  // Obtener detalle de asistencias por ids_asistencias[]
  getDetalleAsistencias(ids_asistencias: number[]) {
    return this.http.post(
      `${this.apiUrl}/asistencias/detalle`,
      { ids_asistencias },
      { withCredentials: true },
    );
  }
}
