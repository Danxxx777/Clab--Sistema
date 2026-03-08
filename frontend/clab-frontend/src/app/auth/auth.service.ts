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
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('rol', response.rol);
        sessionStorage.setItem('usuario', `${response.nombres.split(' ')[0]} ${response.apellidos.split(' ')[0]}`);
        sessionStorage.setItem('idUsuario', response.idUsuario);
        sessionStorage.setItem('rolesDisponibles', JSON.stringify(response.rolesDisponibles ?? []));

      })
    );
  }

  logout() {
    const token = sessionStorage.getItem('token');
    const idUsuario = sessionStorage.getItem('idUsuario');

    if (token && idUsuario) {
      this.http.post(`${this.apiUrl}/logout`, {
        token,
        idUsuario: parseInt(idUsuario)
      }).subscribe();
    }

    this.limpiarSesionLocal();
  }

  limpiarSesionLocal(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('rolesDisponibles');
    sessionStorage.removeItem('idUsuario');
    sessionStorage.removeItem('usuario');
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    return !!token;
  }


  getRol(): string | null {
    return sessionStorage.getItem('rol');
  }

  esAdministrador(): boolean {
    return this.getRol() === 'Administradorr';
  }

  esDecano(): boolean {
    return this.getRol() === 'Decano';
  }

  esEncargado(): boolean {
    return this.getRol() === 'Encargado_Lab';
  }

  esDocente(): boolean {
    return this.getRol() === 'Docente';
  }

  esCoordinador(): boolean {
    return this.getRol() === 'Coordinador';
  }

  getIdUsuario(): number | null {
    const id = sessionStorage.getItem('idUsuario');
    return id ? parseInt(id) : null;
  }

  getUsuarioNombre(): string | null {
    return sessionStorage.getItem('usuario');
  }

}

