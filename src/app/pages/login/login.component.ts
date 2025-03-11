import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interfaces/User';
import { HttpErrorResponse } from '@angular/common/http';
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
        console.log('Token capturado:', token);
        this.authService.setToken(token); 
        this.router.navigate(['/registrodocentes']);
      }
    });
  }
  

  get form() {
    return this.loginForm.controls;
  }

  btnClickGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
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
        this.router.navigate(['/registrodocentes']);
      },
      error: (e: HttpErrorResponse) => {
        console.log(e);
        this.boolLogin = true;
      },
    });
  }

  togglePassword()
  {
    this,this.showPassword = !this.showPassword
  }
}
