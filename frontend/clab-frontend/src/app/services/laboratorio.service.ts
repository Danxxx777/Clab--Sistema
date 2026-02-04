import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Laboratorio {
  codLaboratorio: number;
  nombreLab: string;  // Cambiado de "nombre" a "nombreLab"
  ubicacion: string;
  capacidadEstudiantes: number;
  numeroEquipos: number;
  descripcion: string;
  estadoLab: 'Disponible' | 'Mantenimiento' | 'Bloqueado';
  sede?: {
    idSede: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    estado: string;
  };
  idSede?: number;  // Para crear/editar
  nombreSede?: string;
  encargadoNombre?: string;
  foto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LaboratorioService {
  private baseUrl = 'http://localhost:8080/laboratorios';

  constructor(private http: HttpClient) { }

  listar(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(`${this.baseUrl}/listar`);
  }

  obtenerPorId(codLaboratorio: number): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.baseUrl}/obtener/${codLaboratorio}`);
  }

  crear(laboratorio: any): Observable<Laboratorio> {
    return this.http.post<Laboratorio>(`${this.baseUrl}/crear`, laboratorio);
  }

  editar(codLaboratorio: number, laboratorio: any): Observable<Laboratorio> {
    return this.http.put<Laboratorio>(`${this.baseUrl}/actualizar/${codLaboratorio}`, laboratorio);
  }

  eliminar(codLaboratorio: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminar/${codLaboratorio}`, { responseType: 'text' });
  }
}
