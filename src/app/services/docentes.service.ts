import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Docente } from '../interfaces/Docentes';

@Injectable({
  providedIn: 'root',
})
export class DocentesService {
  api: string = 'http://localhost:8000/api';
  constructor(private http: HttpClient) {}

  getDocentes(): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.api}/docente`);
  }
}
