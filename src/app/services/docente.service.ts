import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {

  private apiUrl = `${environment.api}/docente`; // backticks
  private apiUrlUbi = `${environment.api}/ubi`;

  constructor(private http: HttpClient) {}

  getDocentes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createDocente(docenteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, docenteData);
  }

  //#region Api Ubicaciones
  getDepartamentos(): Observable<{ departamentos: any[] }> {
    return this.http.get<{ departamentos: any[] }>(`${this.apiUrlUbi}/departamento`);
  }

  getProvincias(departamentoId: number): Observable<{ provincias: any[] }> {
    return this.http.get<{ provincias: any[] }>(`${this.apiUrlUbi}/provincia/${departamentoId}`);
  }

  getDistritos(provinciaId: number): Observable<{ distritos: any[] }> {
    return this.http.get<{ distritos: any[] }>(`${this.apiUrlUbi}/distrito/${provinciaId}`);
  }
  //#endregion

}
