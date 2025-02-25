import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interfaces/User';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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
    private router: Router
  ){
      this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
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

        this.router.navigate(['/registrodocentes'])
      },
      error: (e: HttpErrorResponse) => {
        console.log(e);
      },
    });
  }
}
