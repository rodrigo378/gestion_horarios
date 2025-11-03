import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Departamento } from '../interfaces_2/Departamento';
import { Distrito } from '../interfaces_2/Distrito';
import { Provincia } from '../interfaces_2/Provincia';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  // private apiUrl = `${environment.api}/docente`; // backticks
  private apiUrlUbi = `${environment.api}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(
      `${this.apiUrlUbi}/ubicacion/departamento`
    );
  }

  getProvincias(departamentoId: number): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(
      `${this.apiUrlUbi}/ubicacion/provincia/${departamentoId}`
    );
  }

  getDistritos(provinciaId: number): Observable<Distrito[]> {
    return this.http.get<Distrito[]>(
      `${this.apiUrlUbi}/ubicacion/distrito/${provinciaId}`
    );
  }
}
