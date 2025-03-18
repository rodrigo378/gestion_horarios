import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignarhorarioService {
  private apiUrl = `${environment.api}/especialidades`; // backticks
  
  constructor( private http: HttpClient, private authService: AuthService) { }

  // 🔹 Obtiene Carreras y Ciclos según la Facultad seleccionada
  getCarrerasYCiclos(c_codfac: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/carreras-ciclos?c_codfac=${c_codfac}`);
  }

  // 🔹 Obtiene Cursos según Facultad y Ciclo seleccionados
  getCursos(c_codfac: string, c_ciclo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cursos?c_codfac=${c_codfac}&c_ciclo=${c_ciclo}`);
  }
}
