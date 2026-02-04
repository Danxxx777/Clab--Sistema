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
}


export interface UsuarioResponse {
  idUsuario: number;
  identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  usuario: string;
  estado: string;
  fechaRegistro: string;
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

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminar/${id}`);
  }
}
