import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Curso, Especialidad } from '../interfaces_2/Curso';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CursoService {
  private apiUrl = `${environment.api}/sigu`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerCursos(data: {
    n_codper: number;
    n_codpla: number;
    c_codfac: string;
    c_codesp: string;
    n_ciclo: number;
    c_codmod: number;
    c_grpcur: string;
  }): Observable<Curso[]> {
    return this.http.post<Curso[]>(`${this.apiUrl}/curso`, data);
  }

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.apiUrl}/especialidades`);
  }
}
