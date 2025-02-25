import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class AuthGoogleService {
  constructor(private http: HttpClient) {}

  // initLogin() {
  //   const config: AuthConfig = {
  //     issuer: 'https://accounts.google.com',
  //     strictDiscoveryDocumentValidation: false,
  //     clientId: 'YOUR_CLIENT_ID',
  //     redirectUri: window.location.origin + '/main',
  //     scope: 'openid profile email',
  //   }

  //   this.oauthService.configure(config);
  //   this.oauthService.setupAutomaticSilentRefresh();
  //   this.oauthService.loadDiscoveryDocumentAndTryLogin();
  // }

  getLoginGoogle() {
    return this.http.get('http://localhost:8000/api/auth/google');
  }
}
