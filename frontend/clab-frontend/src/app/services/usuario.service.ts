import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioRequest {
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  contrasenia: string;
  idsRoles: number[];
  usuario?: string;
}

export interface UsuarioResponse {
  idUsuario: number;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  usuario: string;
  estado: string;
  fechaRegistro: string;
  rol?: string;
  roles?: { idRol: number; nombreRol: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.baseUrl}/listar`);
  }

  crear(data: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.baseUrl}/crear`, data);
  }

  actualizar(id: number, data: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.baseUrl}/actualizar/${id}`, data);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/desactivar/${id}`, {});
  }
}
