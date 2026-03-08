import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

export interface EncargadoLaboratorioDTO {
  laboratorio: number;
  usuario: number;
  fechaAsignacion: string;
  vigente: boolean;
}

export interface UsuarioEncargado {
  identidad: string;
  idUsuario: number;
  nombreEncargado: string;
}

export interface LaboratorioCombo {
  codLaboratorio: number;
  nombreLab: string;
}

@Injectable({ providedIn: 'root' })
export class EncargadoLaboratorioService {

  private api = 'http://localhost:8080/encargados-laboratorios';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/listar`);
  }

  insertar(dto: EncargadoLaboratorioDTO): Observable<void> {
    return this.http.post<void>(`${this.api}/crear`, dto);
  }

  actualizar(id: number, dto: EncargadoLaboratorioDTO): Observable<void> {
    return this.http.put<void>(`${this.api}/actualizar/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/eliminar/${id}`);
  }

  listarUsuariosEncargados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/listarRolEncargados`);
  }

  listarLaboratorios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/listarLaboratorios`);
  }
}
