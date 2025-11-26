import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { ContadorResult } from '../interfaces/hr/hr_contador';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContadorService {
  private apiUrl = `${environment.api}/hr/contador`;
  constructor(private http: HttpClient) {}

  getContador(): Observable<ContadorResult[]> {
    return this.http.get<ContadorResult[]>(this.apiUrl);
  }

  createContador(payload: { courseId: number; limite: number }) {
    return this.http.post(this.apiUrl, payload);
  }

  updateContador(id: number, limite: number) {
    return this.http.put(`${this.apiUrl}/${id}`, { limite });
  }
}
