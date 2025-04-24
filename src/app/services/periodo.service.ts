import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Periodo } from '../interfaces/turno';

@Injectable({
  providedIn: 'root',
})
export class PeriodoService {
  private apiUrl = `${environment.api}/periodo`;

  constructor(private http: HttpClient) {}

  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(this.apiUrl);
  }

  createPeriodo(n_codper: number, f_cierre: string) {
    return this.http.post(
      this.apiUrl,
      { n_codper, f_cierre },
      { withCredentials: true }
    );
  }

  updatePeriodo(n_codper: number, f_cierre: string) {
    return this.http.put(
      `${this.apiUrl}/${n_codper}`,
      { f_cierre },
      {
        withCredentials: true,
      }
    );
  }
}
