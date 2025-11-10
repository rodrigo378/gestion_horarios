// src/app/core/services/auth-context.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthContextService {
  private readonly API = `https://mesa-api.uma.edu.pe`;
  private _config = signal<any | null>(null);
  private _loaded = signal(false);

  readonly userConfig = computed(() => this._config());
  readonly isAuthenticated = computed(() => !!this._config()?.user);
  readonly isLoaded = computed(() => this._loaded());

  readonly hr = computed(() => this._config()?.hr ?? null);
  readonly hasHR = computed(() => !!this._config()?.hr);
  readonly hrRole = computed(() => this._config()?.hr?.role);
  readonly hrConfig = computed(() => this._config()?.hr?.configuracion);

  constructor(private http: HttpClient) {}

  async bootstrap(): Promise<void> {
    // console.log('[auth] bootstrap:start');
    try {
      const raw = await firstValueFrom(
        this.http.get<any>(`${this.API}/core/iam/context`, {
          withCredentials: true,
        })
      );
      const user = raw?.user ?? null;
      const hr = Array.isArray(raw?.modules)
        ? raw.modules.find((m: any) => m?.codigo === 'HR') ?? null
        : null;

      const normalized = { user, hr };
      // console.log('[auth] bootstrap:normalized =>', normalized);

      this._config.set(normalized);
    } catch (e) {
      // console.error('[auth] bootstrap:error =>', e);
      this._config.set(null);
    } finally {
      // console.log('[auth] bootstrap:done');
      this._loaded.set(true);
    }
  }

  clear() {
    this._config.set(null);
    this._loaded.set(false);
  }
}
