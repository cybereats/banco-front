import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

export interface User {
  id: number;
  login: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  dni: string;
}

interface AuthResponse {
  token: string;
  expiration: string;
  id: number;
  login: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_BASE_URL;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private authToken: string | null = null;

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const normalizedUser: User = {
          id: user.id ?? user.id_cliente,
          login: user.login,
          nombre: user.nombre,
          apellido1: user.apellido1,
          apellido2: user.apellido2,
          dni: user.dni
        };
        localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
        this.currentUserSubject.next(normalizedUser);
        if (storedToken) {
          this.authToken = storedToken;
          this.isAuthenticatedSubject.next(true);
        }
      } catch (e) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
  }

  async login(login: string, password: string): Promise<boolean> {
    try {
      const response = await this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/login`, { login, password })
        .toPromise();

      if (response && response.token) {
        const userData: User = {
          id: response.id,
          login: response.login,
          nombre: response.nombre,
          apellido1: '',
          apellido2: '',
          dni: ''
        };
        this.authToken = response.token;
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.authToken = null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return this.authToken;
  }
}
