import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(FirebaseAuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  user$ = this.auth.user$;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async googleLogin() {
    try {
      await this.auth.signInWithGoogle();
      this.router.navigate(['/']);
    } catch (e: any) {
      this.snackBar.open(e.message, 'Close', { duration: 3000 });
    }
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    try {
      await this.auth.signInWithEmail(email!, password!);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.snackBar.open(e.message, 'Close', { duration: 3000 });
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      return;
    }
    const { email, password } = this.registerForm.value;
    try {
      await this.auth.signUpWithEmail(email!, password!);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.snackBar.open(e.message, 'Close', { duration: 3000 });
    }
  }

  async logout() {
    await this.auth.signOut();
  }
}
