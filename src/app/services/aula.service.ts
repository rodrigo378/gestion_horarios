import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Aula, AulaReporte } from '../interfaces_2/Aula';
import { Docente } from '../interfaces_2/Docente';
import { HR_Aula } from '../interfaces/hr/hr_aula';
@Injectable({
  providedIn: 'root',
})
export class AulaService {
  private apiUrl = `${environment.api}/aula`;

  constructor(private http: HttpClient) {}

  obtenerAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(this.apiUrl);
  }

  getAula(): Observable<HR_Aula[]> {
    return this.http.get<HR_Aula[]>(
      `${this.apiUrl}/?horario=true&curso=true&docente=true&aula=true`
    );
  }

  getAulaIp(ip: string): Observable<Aula> {
    return this.http.get<Aula>(`${this.apiUrl}/${ip}`);
  }

  getDocentesAula(aula_id: number, dia: string): Observable<Docente[]> {
    const params = new HttpParams().set('aula_id', aula_id).set('dia', dia);

    return this.http.get<Docente[]>(`${this.apiUrl}/docente`, { params });
  }
}
