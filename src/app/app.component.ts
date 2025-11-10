import { Component, OnInit } from '@angular/core';
import { AuthContextService } from './services/auth-context.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit {
  isCollapsed = false;

  constructor(private authContext: AuthContextService) {}

  ngOnInit(): void {
    // Se ejecuta una vez al iniciar la aplicación
    this.authContext
      .bootstrap()
      .then(() => {
        console.log('✅ Contexto de usuario inicializado correctamente');
      })
      .catch((err) => {
        console.error('❌ Error al inicializar el contexto de usuario:', err);
      });
  }
}
