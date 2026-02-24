import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HorarioAcademico {
  idHorarioAcademico: number;
  idAsignatura: number;
  nombreAsignatura?: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  private apiUrl = 'http://localhost:8080/horarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<HorarioAcademico[]> {
    return this.http.get<HorarioAcademico[]>(`${this.apiUrl}/listar`);
  }

  listarPorAsignatura(idAsignatura: number): Observable<HorarioAcademico[]> {
    return this.http.get<HorarioAcademico[]>(
      `${this.apiUrl}/porAsignatura/${idAsignatura}`
    );
  }
}
