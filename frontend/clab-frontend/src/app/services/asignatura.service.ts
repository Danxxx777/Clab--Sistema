import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Asignatura {
  idAsignatura?: number;
  nombre: string;
  idCarrera?: number;
  nivel?: number;
  horasSemanales?: number;
  requiereLaboratorio?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {

  private apiUrl = 'http://localhost:8080/asignaturas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Asignatura[]> {
    return this.http.get<Asignatura[]>(`${this.apiUrl}/listar`);
  }
}
