import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Laboratorio } from '../interfaces/Reportar.model';
import {
  FiltrosReporte,
  ResumenGlobal,
  ReporteResponse,
  ReporteUsoItem,
  ReporteEquipoItem,
  ReporteFallaItem,
  ReporteUsuarioItem,
  ReporteReservaItem,
  ReporteAsistenciaItem,
  ReporteAcademicoItem,
  ReporteBloqueosItem,
} from '../interfaces/Reportar.model';


@Injectable({ providedIn: 'root' })
export class ReportarService {

  // Cambiar la URL
  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getResumenGlobal(): Observable<ResumenGlobal> {
    return this.http.get<ResumenGlobal>(`${this.api}/reportes/resumen-global`);
  }

  getReporteUso(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteUsoItem>> {
    return this.http.get<ReporteResponse<ReporteUsoItem>>(`${this.api}/reportes/uso`, { params: this.buildParams(filtros) });
  }

  getReporteEquipos(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteEquipoItem>> {
    return this.http.get<ReporteResponse<ReporteEquipoItem>>(`${this.api}/reportes/equipos`, { params: this.buildParams(filtros) });
  }

  getReporteFallas(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteFallaItem>> {
    return this.http.get<ReporteResponse<ReporteFallaItem>>(`${this.api}/reportes/fallas`, { params: this.buildParams(filtros) });
  }

  getReporteUsuarios(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteUsuarioItem>> {
    return this.http.get<ReporteResponse<ReporteUsuarioItem>>(`${this.api}/reportes/usuarios`, { params: this.buildParams(filtros) });
  }

  getReporteReservas(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteReservaItem>> {
    return this.http.get<ReporteResponse<ReporteReservaItem>>(`${this.api}/reportes/reservas`, { params: this.buildParams(filtros) });
  }

  getReporteAsistencia(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteAsistenciaItem>> {
    return this.http.get<ReporteResponse<ReporteAsistenciaItem>>(`${this.api}/reportes/asistencia`, { params: this.buildParams(filtros) });
  }

  getReporteAcademico(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteAcademicoItem>> {
    return this.http.get<ReporteResponse<ReporteAcademicoItem>>(`${this.api}/reportes/academico`, { params: this.buildParams(filtros) });
  }

  getReporteBloqueos(filtros: FiltrosReporte): Observable<ReporteResponse<ReporteBloqueosItem>> {
    return this.http.get<ReporteResponse<ReporteBloqueosItem>>(`${this.api}/reportes/bloqueos`, { params: this.buildParams(filtros) });
  }

  getLaboratorios(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(`http://localhost:8080/laboratorios/listar`);
  }

  private buildParams(filtros: FiltrosReporte): HttpParams {
    let params = new HttpParams();
    if (filtros.laboratorio) params = params.set('laboratorio', String(filtros.laboratorio));
    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin)    params = params.set('fechaFin',    filtros.fechaFin);
    if (filtros.estado)      params = params.set('estado',      filtros.estado);
    return params;
  }
}
