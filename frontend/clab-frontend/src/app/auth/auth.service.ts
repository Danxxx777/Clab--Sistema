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
        localStorage.setItem('usuario', `${response.nombres.split(' ')[0]} ${response.apellidos.split(' ')[0]}`);
        localStorage.setItem('idUsuario', response.idUsuario);
        localStorage.setItem('rolesDisponibles', JSON.stringify(response.rolesDisponibles ?? []));
        localStorage.setItem('primerLogin', response.primerLogin ? 'true' : 'false');
        localStorage.setItem('modulos', JSON.stringify(response.modulos ?? [])); // ← nuevo
      })
    );
  }

  logout() {
    const token = localStorage.getItem('token');
    const idUsuario = localStorage.getItem('idUsuario');

    if (token && idUsuario) {
      this.http.post(`${this.apiUrl}/logout`, {
        token,
        idUsuario: parseInt(idUsuario)
      }).subscribe();
    }

    this.limpiarSesionLocal();
  }

  limpiarSesionLocal(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('rolesDisponibles');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('usuario');
    localStorage.removeItem('modulos');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }


  getRol(): string | null {
    return localStorage.getItem('rol');
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
    const id = localStorage.getItem('idUsuario');
    return id ? parseInt(id) : null;
  }

  getUsuarioNombre(): string | null {
    return localStorage.getItem('usuario');
  }

}

