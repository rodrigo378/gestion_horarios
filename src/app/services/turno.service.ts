import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Turno } from '../interfaces/turno';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private apiUrl = `${environment.api}/turno`;
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  getTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.apiUrl);
  }

  getTurnoById(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/${id}`);
  }

  getTurnosFiltrados(params: any): Observable<Turno[]> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<Turno[]>(this.apiUrl, { params: httpParams });
  }
}
