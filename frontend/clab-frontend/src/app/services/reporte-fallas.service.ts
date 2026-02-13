import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ============================
   INTERFACES
============================ */

export interface ReporteFallaDTO {
  codLaboratorio: number;
  idEquipo: number;
  descripcionFalla: string;
  idUsuario: number;
}

export interface ReporteFallaDetalle {
  idReporte: number;
  fechaReporte: Date;
  descripcionFalla: string;
  laboratorio: any;
  equipo: any;
  usuario: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteFallasService {

  private API_URL = 'http://localhost:8080/reportes';

  constructor(private http: HttpClient) {}

  listar(): Observable<ReporteFallaDetalle[]> {
    return this.http.get<ReporteFallaDetalle[]>(`${this.API_URL}/listar`);
  }

  crear(data: ReporteFallaDTO): Observable<any> {
    return this.http.post(`${this.API_URL}/crear`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/eliminar/${id}`);
  }
}
