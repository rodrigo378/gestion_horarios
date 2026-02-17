import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MoodleCursoTemplate {
  id: number;
  fullname?: string;
  displayname?: string;
  shortname?: string;
  categoryid?: number;
  categoryname?: string;
}

export interface CreateCursoDto {
  origin_courseid: number; // ✅ plantilla moodle (id del curso origen)
  negative_courseid: number; // ✅ courseid negativo seleccionado
  categoryid: number; // ✅ destino (estático 1083)
}

@Injectable({
  providedIn: 'root',
})
export class SincronizarService {
  private apiUrl = `${environment.api}/hr/sinc`;

  constructor(private http: HttpClient) {}

  sincronizarBatch(courseids: number[]) {
    return this.http.post(
      `${this.apiUrl}/batch`,
      { courseids },
      { withCredentials: true },
    );
  }

  getCursoByCagoria(categoryid: number) {
    return this.http.get(`${this.apiUrl}/categoria/${categoryid}`, {
      withCredentials: true,
    });
  }

  createMassive(dtos: CreateCursoDto[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-massive`, dtos, {
      withCredentials: true,
    });
  }

  comparacionDocentes() {
    return this.http.get(`${this.apiUrl}/comp`, {
      withCredentials: true,
    });
  }
}
