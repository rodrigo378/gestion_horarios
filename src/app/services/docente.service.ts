import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';
import { listadocentes } from '../interfaces/Docentes';
import { Docente } from '../interfaces/Docente';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private apiUrl = `${environment.api}`; // backticks
  // private apiUrlUbi = `${environment.api}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  createDocente(docenteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/docente`, docenteData);
  }

  // getDocentes(): Observable<Docente[]> {
  //   return this.http.get<Docente[]>(
  //     `${this.apiUrl}/docente`,
  //     this.getTokenHeader()
  //   );
  // }

  // getDocentes(): Observable<Docente[]> {
  //   return this.http.get<Docente[]>(
  //     `${this.apiUrl}/docente?horario=true&curso=true`
  //   );
  // }

  getDocentePorUsuario(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/docente/user`);
  }

  updateDocenteUsuario(docenteData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/docente/updateuser`, docenteData);
  }

  getDocentesAprobados(): Observable<listadocentes[]> {
    return this.http.get<listadocentes[]>(`${this.apiUrl}/aprobados`);
  }

  getDocentesRechazados(): Observable<listadocentes[]> {
    return this.http.get<listadocentes[]>(`${this.apiUrl}/rechazados`);
  }

  aprobarDocente(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/aprobar`, {});
  }

  rechazarDocente(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/rechazar`, {});
  }
}
