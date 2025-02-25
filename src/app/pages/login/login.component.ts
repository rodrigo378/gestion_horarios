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
  boolLogin: boolean = false;
  submitted = false;

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

  get form() {
    return this.loginForm.controls;
  }

  btnClickGoogle() {
    window.location.href = 'http://localhost:8000/api/auth/google';
  }

  submit() {
    if (this.loginForm.invalid) {
      this.submitted = true;

      return;
    }

    const user: Partial<User> = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService.login(user).subscribe({
      next: (res: any) => {
        console.log(res.token);
        this.authService.setToken(res.token);
        this.router.navigate(['/docentes']);
      },
      error: (e: HttpErrorResponse) => {
        console.log(e);
        this.boolLogin = true;
      },
    });
  }
}
