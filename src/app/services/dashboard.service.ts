import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.api}`;

  constructor(
    private http: HttpClient,
  ) { }

  getHorasPorDocente() {
    return this.http.get<{ categories: string[], data: number[] }>(
      `${this.apiUrl}/docente/estadisticas/horas`
    );
  }
  
}
