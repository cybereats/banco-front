import { Component, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  login = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async onLogin() {
    if (!this.login() || !this.password()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const success = await this.authService.login(this.login(), this.password());
    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Credenciales inválidas');
      this.loading.set(false);
    }
  }

  onDemo() {
    this.login.set('juan@cyberbank.com');
    this.password.set('password123');
  }
}
