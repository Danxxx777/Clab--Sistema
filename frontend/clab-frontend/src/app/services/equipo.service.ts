import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EquipoDTO {
  numeroSerie: string;
  nombreEquipo: string;
  marca: string;
  modelo: string;
  tipoEquipo: string;
  estado: string;
  laboratorio: string;
  ubicacionFisica: string;
  fechaAdquisicion: string;
}

@Injectable({ providedIn: 'root' })
export class EquipoService {

  private apiUrl = 'http://localhost:8080/equipos';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(this.apiUrl);
  }

  crear(dto: EquipoDTO) {
    return this.http.post(this.apiUrl, dto);
  }

  editar(id: number, dto: EquipoDTO) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}



