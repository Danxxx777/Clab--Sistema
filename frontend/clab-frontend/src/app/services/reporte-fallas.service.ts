import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteFallaDTO {
  codLaboratorio: number;
  idEquipo: number;
  descripcionFalla: string;
  idUsuario: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteFallasService {

  private API_URL = 'http://localhost:8080/reportes';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/listar`);
  }

  listarPorEncargado(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/listarPorEncargado/${idUsuario}`);
  }

  crear(data: ReporteFallaDTO): Observable<any> {
    return this.http.post(`${this.API_URL}/crear`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/eliminar/${id}`);
  }
}
