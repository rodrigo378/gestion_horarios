import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { PlanCurso } from '../interfaces_2/Plan';

@Injectable({
  providedIn: 'root',
})
export class PlanCursoService {
  private apiUrl = `${environment.api}/hr/plan`;

  constructor(private http: HttpClient) {}

  getPlanCurso(): Observable<PlanCurso[]> {
    return this.http.get<PlanCurso[]>(`${this.apiUrl}/curso`);
  }

  updatePlanCurso(planCurso: PlanCurso) {
    return this.http.put(`${this.apiUrl}/curso/${planCurso.id}`, planCurso, {
      withCredentials: true,
    });
  }
}
