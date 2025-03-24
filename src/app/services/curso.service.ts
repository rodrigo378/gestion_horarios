import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Curso } from '../interfaces/Curso';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${environment.api}/curso`;
  
  constructor(private http: HttpClient, private authService: AuthService) {}
  
  obtenerCursos(data: { c_codfac: string, c_codesp: string, n_ciclo: string }): Observable<Curso[]> {
    return this.http.post<Curso[]>(this.apiUrl, data);
  }  
}
