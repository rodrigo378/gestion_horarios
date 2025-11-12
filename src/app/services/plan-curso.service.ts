import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { HR_Plan_Estudio_Curso } from '../interfaces/hr/hr_plan_estudio_curso';

@Injectable({
  providedIn: 'root',
})
export class PlanCursoService {
  private apiUrl = `${environment.api}/hr/plan`;

  constructor(private http: HttpClient) {}

  getPlanCurso(): Observable<HR_Plan_Estudio_Curso[]> {
    return this.http.get<HR_Plan_Estudio_Curso[]>(`${this.apiUrl}/curso`);
  }

  updatePlanCurso(planCurso: HR_Plan_Estudio_Curso) {
    return this.http.put(`${this.apiUrl}/curso/${planCurso.id}`, planCurso, {
      withCredentials: true,
    });
  }
}
