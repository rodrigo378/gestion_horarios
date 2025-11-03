// src/app/services/iam-menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

export interface IamMenuItem {
  key: string;
  label: string;
  path?: string;
  order?: number;
}
export interface IamMenuGroup {
  key: string;
  label: string;
  order?: number;
  children?: IamMenuItem[];
}
export interface IamMenuModule {
  key: string;
  label: string;
  icono?: string;
  order?: number;
  groups?: IamMenuGroup[];
}

@Injectable({ providedIn: 'root' })
export class IamMenuService {
  private readonly apiUrl = `${environment.api}`;

  constructor(private http: HttpClient) {}

  getFullMenu() {
    return this.http.get<IamMenuModule[]>(`${this.apiUrl}/core/iam/menu`, {
      withCredentials: true,
    });
  }
}
