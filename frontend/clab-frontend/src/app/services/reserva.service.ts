import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReservaDTO {
  idReserva?: number;
  codLaboratorio: number;
  idUsuario: number;
  idPeriodo: number;
  idHorarioAcademico: number;
  idAsignatura?: number;
  idTipoReserva?: number;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  numeroEstudiantes: number;
  descripcion?: string;
}

export interface CancelacionDTO {
  idReserva: number;
  idUsuarioCancela: number;
  motivoCancelacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private API_URL = 'http://localhost:8080/reservas';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/listar`);
  }

  listarPorEncargado(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/listarPorEncargado/${idUsuario}`);
  }

  crear(data: ReservaDTO): Observable<any> {
    return this.http.post(`${this.API_URL}/crear`, data);
  }

  crearAdmin(data: ReservaDTO): Observable<any> {
    return this.http.post(`${this.API_URL}/crear-admin`, data);
  }

  actualizar(id: number, data: ReservaDTO): Observable<any> {
    return this.http.put(`${this.API_URL}/actualizar/${id}`, data);
  }

  cancelar(data: CancelacionDTO): Observable<any> {
    return this.http.post(`${this.API_URL}/cancelar`, data);
  }

  aprobar(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/aprobar/${id}`, {});
  }

  rechazar(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/rechazar/${id}`, {});
  }

  listarPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuario/${idUsuario}`);
  }

  crearRecurrente(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/crear-recurrente`, data);
  }

  cancelarGrupo(idGrupo: number, data: CancelacionDTO): Observable<any> {
    return this.http.post(`${this.API_URL}/cancelar-grupo/${idGrupo}`, data);
  }

  listarGrupos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/listar-grupos`);
  }

  aprobarGrupo(idGrupo: number): Observable<any> {
    return this.http.put(`${this.API_URL}/aprobar-grupo/${idGrupo}`, {});
  }

  rechazarGrupo(idGrupo: number): Observable<any> {
    return this.http.put(`${this.API_URL}/rechazar-grupo/${idGrupo}`, {});
  }
}
