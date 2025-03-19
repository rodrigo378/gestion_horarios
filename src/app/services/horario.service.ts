import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrlUbi = `${environment.api}`;
  constructor(private http: HttpClient, private authService: AuthService) {}

  createHorario() {}
}
