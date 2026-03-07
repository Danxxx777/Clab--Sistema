import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaUsuarioService {

  private API_URL = 'http://localhost:8080/asistencia';
  private BLOQUEO_URL = 'http://localhost:8080/bloqueo-usuario';

  constructor(private http: HttpClient) {}

  listarReservasHoy(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/hoy`);
  }

  registrarAsistencia(idReserva: number, idUsuario: number, observaciones?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/registrar`, {
      idReserva,
      idUsuario,
      observaciones: observaciones || null
    });
  }

  registrarFalta(idReserva: number, idUsuario: number): Observable<any> {
    return this.http.post(`${this.API_URL}/falta`, {
      idReserva,
      idUsuario });
  }

  usuarioBloqueado(idUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/bloqueado/${idUsuario}`);
  }

  listarBloqueados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BLOQUEO_URL}/listar`);
  }

  verificarBloqueo(idUsuario: number): Observable<any> {
    return this.http.post(`${this.API_URL}/verificar-bloqueo/${idUsuario}`, {});
  }

  desbloquearUsuario(idUsuario: number): Observable<any> {
    return this.http.put(`${this.BLOQUEO_URL}/desbloquear`, { idUsuario });
  }
}
