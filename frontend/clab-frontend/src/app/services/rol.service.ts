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
  rolesBD: RolBD[];
  estado: string;
  modulosIds: number[];
}

export interface RolRequest {
  nombreRol: string;
  descripcion?: string;
  permisos: number[];
  rolesBD: string[];
  permisosEsquemas?: {       // ← agregar esto
    idRolBd: number;
    nombreRolBd: string;
    nombreEsquema: string;
    select: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
  }[];
  modulosIds?: number[];
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

  listarRolesBD(): Observable<RolBD[]> {
    return this.http.get<RolBD[]>(`${this.apiUrl}/roles-bd`);
  }

  desactivar(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: 'INACTIVO' });
  }
  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado });
  }
  obtenerPermisosEsquemas(idRolBd: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles-bd/${idRolBd}/permisos-esquemas`);
  }
}

