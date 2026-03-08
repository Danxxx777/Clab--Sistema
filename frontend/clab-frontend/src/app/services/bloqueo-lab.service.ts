import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BloqueoLabDTO {
  codLaboratorio: number;
  idTipoBloqueo: number;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class BloqueoLabService {

  private apiUrl = 'http://localhost:8080/bloqueos';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const idUsuario = sessionStorage.getItem('idUsuario') || '0';
    return new HttpHeaders({ 'id-usuario': idUsuario });
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crear(dto: BloqueoLabDTO): Observable<void> {
    return this.http.post<void>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  actualizar(id: number, dto: BloqueoLabDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
