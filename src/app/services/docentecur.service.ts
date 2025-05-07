import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDocente, Docente } from '../interfaces/Docente';

@Injectable({
  providedIn: 'root',
})
export class DocentecurService {
  private apiUrl = `${environment.api}/docente`;

  constructor(private http: HttpClient) {}

  obtenerDocentes(): Observable<Docente[]> {
    return this.http.get<Docente[]>(this.apiUrl);
  }

  obtenerDocentesreporteria(
    horario: boolean,
    curso: boolean,
    aula: boolean
  ): Observable<Docente[]> {
    const params = `horario=${horario}&curso=${curso}&aula=${aula}`;
    return this.http.get<Docente[]>(`${this.apiUrl}?${params}`);
  }

  crearDocente(docente: CreateDocente): Observable<any> {
    return this.http.post(this.apiUrl, docente, { withCredentials: true });
  }
}
