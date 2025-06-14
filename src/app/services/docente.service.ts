import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDocente, Docente, UpdateDocente } from '../interfaces/Docente';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private apiUrl = `${environment.api}/docente`;

  constructor(private http: HttpClient) {}

  obtenerDocentes(): Observable<Docente[]> {
    return this.http.get<Docente[]>(this.apiUrl);
  }

  obtenerDocentesreporteria(
    horario: boolean,
    curso: boolean,
    aula: boolean,
    c_codfac?: string | null,
    c_codesp?: string | null
  ): Observable<Docente[]> {
    const params = new URLSearchParams();
    params.set('horario', String(horario));
    params.set('curso', String(curso));
    params.set('aula', String(aula));
    if (c_codfac) params.set('c_codfac', c_codfac);
    if (c_codesp) params.set('c_codesp', c_codesp);

    return this.http.get<Docente[]>(`${this.apiUrl}?${params.toString()}`);
  }

  crearDocente(docente: CreateDocente): Observable<any> {
    return this.http.post(this.apiUrl, docente, { withCredentials: true });
  }

  updateDocente(docente: UpdateDocente) {
    return this.http.put(`${this.apiUrl}/${docente.id}`, docente, {
      withCredentials: true,
    });
  }
}
