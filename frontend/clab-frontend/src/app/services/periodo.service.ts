import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Periodo} from '../interfaces/Periodo.model';


@Injectable({ providedIn: 'root' })
export class PeriodoService {

  private apiUrl = 'http://localhost:8080/periodos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(
      `${this.apiUrl}/listar`);
  }

  crear(periodo: Periodo): Observable<Periodo> {
    return this.http.post<Periodo>(
      `${this.apiUrl}/crear`, periodo);
  }

  editar(id: number, periodo: Periodo): Observable<Periodo> {
    return this.http.put<Periodo>(
      `${this.apiUrl}/actualizar/${id}`, periodo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/eliminar/${id}`);
  }
}
