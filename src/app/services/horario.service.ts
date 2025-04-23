import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import {
  CreateHorarioRequest,
  DeleteHorariosRequest,
  Horario,
  HorarioExtendido,
  UpdateHorarioData,
} from '../interfaces/Horario';
import { Curso2 } from '../interfaces/Curso';
@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = `${environment.api}/horario`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  guardarHorarios(data: CreateHorarioRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data, { withCredentials: true }); // ✅ No lo vuelvas a meter en { dataArray }
  }

  getHorarioPorTurno(turno_id: number): Observable<HorarioExtendido[]> {
    return this.http.get<HorarioExtendido[]>(
      `${this.apiUrl}/turno/${turno_id}`
    );
  }

  updateHorarios(data: UpdateHorarioData): Observable<any> {
    return this.http.put(`${this.apiUrl}`, data, { withCredentials: true });
  }

  deleteHorarios(data: DeleteHorariosRequest): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}`, {
      body: data,
      withCredentials: true,
    });
  }

  getHorarios(
    c_codmod?: string,
    n_codper?: number,
    c_codfac?: string,
    c_codesp?: string,
    n_codpla?: number
  ) {
    const params: any = {};
    if (c_codmod) params.c_codmod = c_codmod;
    if (n_codper) params.n_codper = n_codper;
    if (c_codfac) params.c_codfac = c_codfac;
    if (c_codesp) params.c_codesp = c_codesp;
    if (n_codpla) params.n_codpla = n_codpla;

    return this.http.get<Horario[]>('http://localhost:3000/horario', {
      params,
    });
  }

  asociarHorarioTransversal(padre_id: number, hijo_id: number) {
    return this.http.post(`${this.apiUrl}/transversal`, {
      padre_id,
      hijo_id,
    });
  }

  // @Get('curso')
  // getCurso(
  //   @Query('c_codmod') c_codmod?: string,
  //   @Query('n_codper') n_codper?: string,
  //   @Query('periodo') periodo?: string,
  //   @Query('c_codfac') c_codfac?: string,
  //   @Query('c_codesp') c_codesp?: string,
  //   @Query('c_codcur') c_codcur?: string,
  //   @Query('n_ciclo') n_ciclo?: string,
  //   @Query('turno_id') turno_id?: string,
  //   @Query('filtroBusqueda') filtroBusqueda?: string,
  //   @Query('skip') skip?: string,
  //   @Query('take') take?: string,
  //   @Query('sortField') sortField?: string,
  //   @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  // ) {
  //   return this.horarioService.getCursos(
  //     Number(c_codmod),
  //     n_codper,
  //     Number(periodo),
  //     c_codfac,
  //     c_codesp,
  //     c_codcur,
  //     n_ciclo ? Number(n_ciclo) : undefined,
  //     turno_id ? Number(turno_id) : undefined,
  //     filtroBusqueda,
  //     skip ? Number(skip) : undefined,
  //     take ? Number(take) : undefined,
  //     sortField,
  //     sortOrder || 'asc',
  //   );
  // }

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
    data: Curso2[];
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
      data: Curso2[];
      skip: number;
      take: number;
      total: number;
      totalPages: number;
    }>(`${this.apiUrl}/curso`, { params });
  }

  createTransversal(padre_id: number, hijos_id: number[], tipo: number) {
    return this.http.post(`${this.apiUrl}/curso/transversal`, {
      padre_id,
      hijos_id,
      tipo,
    });
  }

  createGrupo(padre_id: number, hijos_id: number[], tipo: number) {
    return this.http.post(`${this.apiUrl}/curso/grupo`, {
      padre_id,
      hijos_id,
      tipo,
    });
  }

  deleteTransversal(padre_id: number) {
    return this.http.delete(`${this.apiUrl}/curso/transversal/${padre_id}`);
  }

  guardarHorarioAsync(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/async`, data);
  }
}
