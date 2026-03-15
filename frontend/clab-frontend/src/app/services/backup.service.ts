import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export interface BackupConfig {
  frecuencia:      'DIARIO' | 'SEMANAL' | 'MENSUAL';
  modalidadDefault: 'COMPLETO' | 'DIFERENCIAL' | 'INCREMENTAL';
  horas:           string[];
  diasSemana:      string[];
  diasMes:         number[];
  guardarLocal:    boolean;
  guardarDrive:    boolean;
  activo:          boolean;
  diasRetencion:   number;
  rutaLocalBackup: string;
}


export interface BackupRegistro {
  id:           number;
  fecha:        string;
  modalidad:    'COMPLETO' | 'DIFERENCIAL' | 'INCREMENTAL';
  tablasIncluidas?: number;
  tipo:      'MANUAL' | 'AUTOMATICO';
  estado:    'EXITOSO' | 'FALLIDO';
  tamano?:   string;
  rutaLocal?: string;
  rutaDrive?: string;
  error?:    string;
}

export interface BackupRespuesta {
  exito:    boolean;
  mensaje:  string;
  detalle?: string;
}
@Injectable({
  providedIn: 'root'
})
export class BackupService {

  private readonly baseUrl = 'http://localhost:8080/backup';
  constructor(private http: HttpClient) {}

  // CONFIGURACIÓN
  obtenerConfiguracion(): Observable<BackupConfig> {
    return this.http
      .get<BackupConfig>(`${this.baseUrl}/configuracion`)
      .pipe(catchError(this.manejarError));
  }

  guardarConfiguracion(config: BackupConfig): Observable<BackupRespuesta> {
    return this.http
      .post<BackupRespuesta>(`${this.baseUrl}/configurar`, config)
      .pipe(catchError(this.manejarError));
  }

  // BACKUP MANUAL
  ejecutarBackupManual(modalidad: 'COMPLETO' | 'DIFERENCIAL' | 'INCREMENTAL' = 'COMPLETO'): Observable<BackupRespuesta> {
    return this.http
      .post<BackupRespuesta>(`${this.baseUrl}/ejecutar?modalidad=${modalidad}`, {})
      .pipe(catchError(this.manejarError));
  }

  // HISTORIAL
  obtenerHistorial(): Observable<BackupRegistro[]> {
    return this.http
      .get<BackupRegistro[]>(`${this.baseUrl}/historial`)
      .pipe(catchError(this.manejarError));
  }

  // DESCARGA
  descargarBackup(id: number): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/descargar/${id}`, { responseType: 'blob' })
      .pipe(catchError(this.manejarError));
  }

  // MANEJO DE ERRORES
  private manejarError(error: HttpErrorResponse): Observable<never> {
    let mensajeError = 'Ocurrió un error inesperado';
    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error de conexión: ${error.error.message}`;
    } else {
      mensajeError = error.error?.mensaje
        || error.error?.message
        || `Error ${error.status}: ${error.statusText}`;
    }
    console.error('BackupService error:', mensajeError, error);
    return throwError(() => new Error(mensajeError));
  }
}
