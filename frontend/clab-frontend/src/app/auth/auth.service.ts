import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(usuario: string, contrasenia: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      usuario,
      contrasenia
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('rol', response.rol);
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }
}
