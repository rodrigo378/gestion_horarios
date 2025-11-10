import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interfaces_2/User';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private apiUrl = `${environment.api}`;

  loginForm!: FormGroup;
  boolLogin: boolean = false;
  submitted = false;
  showPassword: boolean = false;

  currentYear: number = new Date().getFullYear();

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
        this.router.navigate(['/welcome']);
      }
    });
  }

  get form() {
    return this.loginForm.controls;
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
        this.router.navigate(['dashboard/welcome']);
      },
      error: (e: HttpErrorResponse) => {
        this.boolLogin = true;
      },
    });
  }

  submit_2() {
    // const apiUrl = 'https://mesa-api.uma.edu.pe';
    const returnTo = '/';
    window.location.href = `${
      this.apiUrl
    }/auth/login?app=horario&returnTo=${encodeURIComponent(returnTo)}`;
  }

  togglePassword() {
    this, (this.showPassword = !this.showPassword);
  }
}
