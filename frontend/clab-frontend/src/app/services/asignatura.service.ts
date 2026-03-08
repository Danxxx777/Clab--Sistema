import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AsignaturaDTO {
  nombre: string;
  idCarrera: number;
  nivel: number;
  horasSemanales: number;
  requiereLaboratorio: boolean;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class AsignaturaService {

  private apiUrl = 'http://localhost:8080/asignaturas';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(this.apiUrl);
  }

  crear(dto: AsignaturaDTO) {
    return this.http.post(this.apiUrl, dto);
  }

  editar(id: number, dto: AsignaturaDTO) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
