import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoBloqueo {
  idTipoBloqueo: number;
  nombreTipo: string;
  descripcion: string;
  estado: string;
}

export interface TipoBloqueDTO {
  nombreTipo: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoBloqueoService {

  private apiUrl = 'http://localhost:8080/tipos-bloqueos';

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoBloqueo[]> {
    return this.http.get<TipoBloqueo[]>(`${this.apiUrl}/listar`);
  }

  crear(dto: TipoBloqueDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/crear`, dto);
  }

  actualizar(id: number, dto: TipoBloqueDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/actualizar/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }
}
