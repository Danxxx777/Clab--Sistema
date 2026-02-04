import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Sedes} from '../interfaces/Sedes.model';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SedeService {

  private apiUrl = 'http://localhost:8080/sedes';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(`${this.apiUrl}/listar`);
  }

  crear(sede: Sedes) {
    return this.http.post<Sedes>(
      `${this.apiUrl}/crear`,
      sede
    );
  }

  editar(id: number, sede: Sedes) {
    return this.http.put<Sedes>(
      `${this.apiUrl}/actualizar/${id}`,
      sede
    );
  }
}
