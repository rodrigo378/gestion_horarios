import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';
import { listadocentes } from '../interfaces/Docentes';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private apiUrl = `${environment.api}`; // backticks
  // private apiUrlUbi = `${environment.api}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getTokenHeader() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  createDocente(docenteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/docente`, docenteData, this.getTokenHeader() );
  }

  getDocentes(): Observable<listadocentes[]> {
    return this.http.get<listadocentes[]>(this.apiUrl, this.getTokenHeader());
  }

  getDocentePorUsuario(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/docente/user`, this.getTokenHeader());
  }

  // // Actualizar un docente
  // updateDocente(id: number, docenteData: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${id}`, docenteData, this.getTokenHeader());
  // }

  updateDocenteUsuario(docenteData: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/docente/updateuser`,
      docenteData,
      this.getTokenHeader()
    );    
  }

  getDocentesAprobados(): Observable<listadocentes[]> {
    return this.http.get<listadocentes[]>(
      `${this.apiUrl}/aprobados`,
      this.getTokenHeader()
    );
  }

  getDocentesRechazados(): Observable<listadocentes[]> {
    return this.http.get<listadocentes[]>(
      `${this.apiUrl}/rechazados`,
      this.getTokenHeader()
    );
  }

  aprobarDocente(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/aprobar`,
      {},
      this.getTokenHeader()
    );
  }

  rechazarDocente(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/rechazar`,
      {},
      this.getTokenHeader()
    );
  }

  //#region Api Ubicaciones
  // getDepartamentos(): Observable<{ departamentos: any[] }> {
  //   const token = this.authService.getToken();
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  //   return this.http.get<{ departamentos: any[] }>(
  //     `${this.apiUrlUbi}/ubi/departamento`,
  //     { headers }
  //   );
  // }

  // getProvincias(departamentoId: number): Observable<{ provincias: any[] }> {
  //   const token = this.authService.getToken();
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  //   return this.http.get<{ provincias: any[] }>(
  //     `${this.apiUrlUbi}/ubi/provincia/${departamentoId}`,
  //     { headers }
  //   );
  // }

  // getDistritos(provinciaId: number): Observable<{ distritos: any[] }> {
  //   const token = this.authService.getToken();
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  //   return this.http.get<{ distritos: any[] }>(
  //     `${this.apiUrlUbi}/ubi/distrito/${provinciaId}`,
  //     { headers }
  //   );
  // }
  //#endregion
}
