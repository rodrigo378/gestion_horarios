import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interfaces/user';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthGoogleService } from '../../services/auth-google.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];

      if (token) {
        console.log('Token capturado:', token);
        this.authService.setToken(token);
        this.router.navigate(['/docentes']);
      }
    });
  }

  btnClickGoogle() {
    window.location.href = 'http://localhost:8000/api/auth/google';
  }

  submit() {
    console.log('Datos enviados al backend:', this.loginForm.value);

    console.log('email => ', this.loginForm.get('email')?.value);
    console.log('password => ', this.loginForm.get('password')?.value);

    if (this.loginForm.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    // Object.keys(this.loginForm.controls).forEach((controlName) => {
    //   const controlErrors = this.loginForm.get(controlName)?.errors;
    //   if (controlErrors) {
    //     console.log(`Control: ${controlName}`, controlErrors);
    //   }
    // });

    console.log('Datos enviados al backend:', this.loginForm.value);

    const user: Partial<User> = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService.login(user).subscribe({
      next: (res: any) => {
        console.log(res.token);
        this.authService.setToken(res.token);
      },
      error: (e: HttpErrorResponse) => {
        console.log(e);
      },
    });
  }
}
