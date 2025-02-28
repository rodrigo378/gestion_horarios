import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private apiUrl = `${environment.api}/docente`; // backticks
  private apiUrlUbi = `${environment.api}`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  getTokenHeader() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  getDocentes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createDocente(docenteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, docenteData, this.getTokenHeader() );
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
