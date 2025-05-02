import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Aula, AulaReporte } from '../interfaces/Aula';
@Injectable({
  providedIn: 'root',
})
export class AulaService {
  private apiUrl = `${environment.api}/aula`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(this.apiUrl);
  }

  getAula(): Observable<AulaReporte[]> {
    return this.http.get<AulaReporte[]>(
      `${this.apiUrl}/?horario=true&curso=true&docente=true&aula=true`
    );
  }

  getAulaIp(ip: string): Observable<Aula> {
    return this.http.get<Aula>(`${this.apiUrl}/${ip}`);
  }
}
