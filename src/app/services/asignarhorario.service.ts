import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignarhorarioService {
  private apiUrl = `${environment.api}/curso`; // backticks
  
  constructor( private http: HttpClient, private authService: AuthService) { }

// 🔹 Obtiene Carreras (Especialidades) según Facultad, Ciclo y Modalidad
  getCarrerasYCiclosYModalidad(c_codfac: string, n_ciclo: string, c_codmod: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/carreras-ciclo?c_codfac=${c_codfac}&n_ciclo=${n_ciclo}&c_codmod=${c_codmod}`);
  }

  // 🔹 Obtiene Cursos según Facultad y Ciclo seleccionados
  getCursos(c_codfac: string, c_ciclo: string, c_codesp: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/?c_codfac=${c_codfac}&c_ciclo=${c_ciclo}&c_codesp=${c_codesp}`);
  }
  
}
