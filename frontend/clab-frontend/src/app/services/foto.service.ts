import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FotoDTO {
  idFoto: number;
  urlFoto: string;
  publicId: string;
  fechaSubida: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class FotoService {

  private api = 'http://localhost:8080/fotos';

  constructor(private http: HttpClient) {}

  listarPorLaboratorio(codLaboratorio: number): Observable<FotoDTO[]> {
    return this.http.get<FotoDTO[]>(`${this.api}/laboratorio/${codLaboratorio}`);
  }

  subirFotos(codLaboratorio: number, archivos: File[]): Observable<void> {
    const formData = new FormData();
    archivos.forEach(f => formData.append('archivos', f));
    return this.http.post<void>(`${this.api}/subir/${codLaboratorio}`, formData);
  }

  eliminarFoto(idFoto: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/eliminar/${idFoto}`);
  }
}
