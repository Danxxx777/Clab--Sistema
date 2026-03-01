import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface HorarioDTO {
  idPeriodo: number;
  idAsignatura: number;
  idDocente: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  numeroEstudiantes: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class HorarioService {

  private apiUrl = 'http://localhost:8080/horarios';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarDocentes() {
    return this.http.get<any[]>(`${this.apiUrl}/docentes`);
  }

  crear(dto: HorarioDTO) {
    return this.http.post(this.apiUrl, dto);
  }

  editar(id: number, dto: HorarioDTO) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  listarPorAsignatura(idAsignatura: number) {
    return this.http.get<any[]>(`${this.apiUrl}/asignatura/${idAsignatura}`);
  }
}
