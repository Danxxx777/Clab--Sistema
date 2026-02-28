import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface FacultadDTO {
  nombre: string;
  descripcion: string;
  idDecano: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class FacultadService {

  private apiUrl = 'http://localhost:8080/facultades';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarDecanos() {
    return this.http.get<any[]>(`${this.apiUrl}/decanos`);
  }

  crear(dto: FacultadDTO) {
    return this.http.post(this.apiUrl, dto);
  }

  editar(id: number, dto: FacultadDTO) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
