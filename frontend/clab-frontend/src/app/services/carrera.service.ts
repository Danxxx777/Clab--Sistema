import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CarreraDTO {
  nombre: string;
  idFacultad: number;
  idCoordinador: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class CarreraService {

  private apiUrl = 'http://localhost:8080/carreras';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarCoordinadores() {
    return this.http.get<any[]>(`${this.apiUrl}/coordinadores`);
  }

  crear(dto: CarreraDTO) {
    return this.http.post(this.apiUrl, dto);
  }

  editar(id: number, dto: CarreraDTO) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
