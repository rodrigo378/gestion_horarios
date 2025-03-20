import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { CreateHorarioDto, Horario } from '../interfaces/Horario';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = `${environment.api}/horario`;
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  guardarHorarios(horarios: Horario[]): Observable<any> {
    const requestBody: CreateHorarioDto = { horarios };
    return this.http.post<any>(this.apiUrl, requestBody);
  }
  getHorario():Observable<Horario[]>{
    return this.http.get<Horario[]>(this.apiUrl);
  }
}
