import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
