import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Departamento } from '../interfaces/Departamento';
import { Distrito } from '../interfaces/Distrito';
import { Provincia } from '../interfaces/Provincia';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  api: string = 'http://localhost:8000/api/ubi';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getDepartamentos(): Observable<Departamento[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Departamento[]>(`${this.api}/departamento`, {
      headers,
    });
  }

  getDistritos(departamento_id: number): Observable<Distrito[]> {
    return this.http.get<Distrito[]>(`${this.api}/distrito/${departamento_id}`);
  }

  getProvincias(distrito_id: number): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.api}/provincia/${distrito_id}`);
  }
}
