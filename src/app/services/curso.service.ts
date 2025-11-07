import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_Curso } from '../interfaces/hr/hr_curso';

@Injectable({
  providedIn: 'root',
})
export class CursoService {
  private apiUrl = `${environment.api}/hr/curso`;

  constructor(private http: HttpClient) {}

  getCurso(
    c_codmod?: number,
    n_codper?: string,
    periodo?: number,
    c_codfac?: string,
    c_codesp?: string,
    c_codcur?: string,
    n_ciclo?: number,
    turno_id?: number,
    filtroBusqueda?: string,
    skip?: number,
    take?: number
  ): Observable<{
    data: HR_Curso[];
    skip: number;
    take: number;
    total: number;
    totalPages: number;
  }> {
    const params: any = {};
    if (c_codmod) params.c_codmod = c_codmod;
    if (n_codper) params.n_codper = n_codper;
    if (periodo) params.periodo = periodo;
    if (c_codfac) params.c_codfac = c_codfac;
    if (c_codesp) params.c_codesp = c_codesp;
    if (c_codcur) params.c_codcur = c_codcur;
    if (n_ciclo !== undefined) params.n_ciclo = n_ciclo;

    if (turno_id !== undefined) params.turno_id = turno_id;
    if (filtroBusqueda) params.filtroBusqueda = filtroBusqueda;
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;

    return this.http.get<{
      data: HR_Curso[];
      skip: number;
      take: number;
      total: number;
      totalPages: number;
    }>(`${this.apiUrl}`, { params });
  }

  createTransversal(padre_id: number, hijos_id: number[], tipo: number) {
    return this.http.post(
      `${this.apiUrl}/transversal`,
      {
        padre_id,
        hijos_id,
        tipo,
      },
      { withCredentials: true }
    );
  }

  createGrupo(padre_id: number, hijos_id: number[], tipo: number) {
    return this.http.post(
      `${this.apiUrl}/grupo`,
      {
        padre_id,
        hijos_id,
        tipo,
      },
      { withCredentials: true }
    );
  }

  deleteTransversal(padre_id: number) {
    return this.http.delete(`${this.apiUrl}/grupo/${padre_id}`, {
      withCredentials: true,
    });
  }
}
