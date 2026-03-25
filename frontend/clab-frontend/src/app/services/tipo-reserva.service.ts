import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoReservaDTO {
  idTipoReserva?: number;
  nombreTipo: string;
  descripcion: string;
  requiereAsignatura: boolean;
}

export interface TipoReserva {
  idTipoReserva: number;
  nombreTipo: string;
  descripcion: string;
  estado: string;
  requiereAsignatura: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TipoReservaService {

  private API_URL = 'http://localhost:8080/tipos-reserva';

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoReserva[]> {
    return this.http.get<TipoReserva[]>(`${this.API_URL}/listar`);
  }

  crear(data: TipoReservaDTO): Observable<any> {
    return this.http.post(`${this.API_URL}/crear`, data);
  }

  actualizar(id: number, data: TipoReservaDTO): Observable<any> {
    return this.http.put(`${this.API_URL}/actualizar/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/eliminar/${id}`);
  }
}
