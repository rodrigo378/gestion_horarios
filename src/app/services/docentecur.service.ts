import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
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

  obtenerDocentesreporteria(): Observable<Docente[]> {
    return this.http.get<Docente[]>(
      `${this.apiUrl}?horario=true&curso=true&aula=true`
    );
  }

  crearDocente(docente: CreateDocente): Observable<any> {
    return this.http.post(this.apiUrl, docente);
  }
}
