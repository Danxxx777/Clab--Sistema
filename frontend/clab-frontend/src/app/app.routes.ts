import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { ReservarComponent } from './reservar/reservar';
import { HorariosComponent } from './horarios/horarios';
import { ReportarComponent } from './reportar/reportar';
import { NotificacionesComponent } from './notificaciones/notificaciones';
import { LoginComponent } from './auth/login/login';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'reservar', component: ReservarComponent },
  { path: 'horarios', component: HorariosComponent },
  { path: 'reportar', component: ReportarComponent },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: '**', redirectTo: 'dashboard' }
];
