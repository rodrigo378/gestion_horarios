import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class SiguService {
  private apiUrl = `${environment.api}/core/sigu`;

  constructor(private http: HttpClient) {}

  getVacantes() {
    return this.http.get(`${this.apiUrl}/vacantes/20261`);
  }

  updateVacante(payload: {
    n_codper: number;
    c_codfac: string;
    c_codcur: string;
    c_grpcur: string;
    c_codmod: string;
    c_codesp: string;
    n_codpla: number;
    n_vactot: number;
    n_vacmax: number;
  }) {
    return this.http.patch(`${this.apiUrl}/vacantes`, payload);
  }
}
