import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PermisoResponse {
  idPermiso: number;
  nombrePermiso: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermisoService {

  private apiUrl = 'http://localhost:8080/permisos';

  constructor(private http: HttpClient) {}

  listar(): Observable<PermisoResponse[]> {
    return this.http.get<PermisoResponse[]>(this.apiUrl);
  }
}
