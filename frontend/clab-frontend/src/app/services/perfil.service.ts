import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CambiarContraseniaDTO {
  contraseniaActual: string;
  contraseniaNueva: string;
}

export interface PerfilUsuario {
  idUsuario: number;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  usuario: string;
  estado: string;
  rol: string;
  idsRoles?: number[];
}
export interface ReservaHistorial {
  idReserva: number;
  nombreLaboratorio: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  asistio: boolean | null;
  nombreUsuario?: string;
  nombreAsignatura?: string;
  motivo?: string;
}
@Injectable({ providedIn: 'root' })
export class PerfilService {

  private base = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  obtenerPerfil(idUsuario: number): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.base}/usuarios/${idUsuario}`);
  }

  actualizarPerfil(idUsuario: number, datos: Partial<PerfilUsuario>): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(`${this.base}/usuarios/actualizar/${idUsuario}`, datos);
  }

  cambiarContrasenia(dto: CambiarContraseniaDTO): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.base}/usuarios/cambiar-contrasenia`, dto);
  }

  obtenerHistorialReservas(idUsuario: number): Observable<ReservaHistorial[]> {
    return this.http.get<ReservaHistorial[]>(`${this.base}/reservas/usuario/${idUsuario}`);
  }
}
