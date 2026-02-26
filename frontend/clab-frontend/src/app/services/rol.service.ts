import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RolBD {
  idRolBd: number;
  nombreRolBd: string;
  descripcion: string;
}

export interface RolResponse {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  fechaCreacion: string;
  rolesBD: RolBD[];   // ← antes era string[]
}

export interface RolRequest {
  nombreRol: string;
  descripcion?: string;
  permisos: number[];
  rolesBD: string[];  // sigue siendo string[] para enviar al backend
}

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private apiUrl = 'http://localhost:8080/roles';

  constructor(private http: HttpClient) {}

  listar(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(`${this.apiUrl}/listar`);
  }

  crear(data: RolRequest): Observable<RolResponse> {
    return this.http.post<RolResponse>(`${this.apiUrl}/crear`, data);
  }

  actualizar(id: number, data: RolRequest): Observable<RolResponse> {
    return this.http.put<RolResponse>(`${this.apiUrl}/actualizar/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }

  obtenerPermisos(id: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${id}/permisos`);
  }

  listarRolesBD(): Observable<RolBD[]> {   // ← antes era string[]
    return this.http.get<RolBD[]>(`${this.apiUrl}/roles-bd`);
  }
}
