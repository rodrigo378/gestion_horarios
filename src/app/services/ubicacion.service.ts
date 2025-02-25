import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Departamento } from '../interfaces/Departamento';
import { Distrito } from '../interfaces/Distrito';
import { Provincia } from '../interfaces/Provincia';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  api: string = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.api}/departamento`);
  }

  getDistritos(departamento_id: number): Observable<Distrito[]> {
    return this.http.get<Distrito[]>(`${this.api}/distrito/${departamento_id}`);
  }

  getProvincias(distrito_id: number): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.api}/provincia/${distrito_id}`);
  }
}
