import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { Aula } from '../interfaces_2/Aula';
import { HR_Aula } from '../interfaces/hr/hr_aula';
@Injectable({
  providedIn: 'root',
})
export class AulaService {
  private apiUrl = `${environment.api}/hr/aula`;

  constructor(private http: HttpClient) {}

  getAulas(): Observable<HR_Aula[]> {
    return this.http.get<HR_Aula[]>(this.apiUrl);
  }

  getAula(): Observable<HR_Aula[]> {
    return this.http.get<HR_Aula[]>(
      `${this.apiUrl}/?horario=true&curso=true&docente=true&aula=true`
    );
  }

  getAulaIp(ip: string): Observable<HR_Aula> {
    return this.http.get<HR_Aula>(`${this.apiUrl}/${ip}`);
  }
}
