import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoEquipoDTO {
  idTipoEquipo: number;
  nombreTipo: string;
  descripcion: string;
}

// ✅ Payload corregido: usa nombreTipo (como espera el backend)
export interface TipoEquipoPayload {
  nombreTipo: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class TipoEquipoService {

  private apiUrl = 'http://localhost:8080/tipos-equipo';

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoEquipoDTO[]> {
    return this.http.get<TipoEquipoDTO[]>(`${this.apiUrl}/listar`);
  }

  crear(data: { nombre: string; descripcion: string }): Observable<TipoEquipoDTO> {
    return this.http.post<TipoEquipoDTO>(`${this.apiUrl}/crear`, data);
  }

  actualizar(id: number, data: { nombre: string; descripcion: string }): Observable<TipoEquipoDTO> {
    return this.http.put<TipoEquipoDTO>(`${this.apiUrl}/actualizar/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }
}
