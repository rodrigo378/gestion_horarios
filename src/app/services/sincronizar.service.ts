import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HR_Turno } from '../interfaces/hr/hr_turno';
import { HR_Curso } from '../interfaces/hr/hr_curso';

export interface ComparacionTurnoPeriodo {
  turno: HR_Turno;

  estadoGeneralCursos: string;
  estadoGeneralDocentes: string;
  estadoGeneralHorarios: string;

  estadoGeneral?: string; // calculado en el front
}

@Injectable({
  providedIn: 'root',
})
export class SincronizarService {
  private apiUrl = `${environment.api}/hr/sinc`;

  constructor(private http: HttpClient) {}

  sincronizarBatch(courseids: number[]) {
    return this.http.post(
      `${this.apiUrl}/batch`,
      { courseids },
      { withCredentials: true },
    );
  }
}
