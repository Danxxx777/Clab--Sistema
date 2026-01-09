import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { Reservar } from './reservar/reservar';
import { Horarios } from './horarios/horarios';
import { Reportar } from './reportar/reportar';
import { Notificaciones } from './notificaciones/notificaciones';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'reservar', component: Reservar },
  { path: 'horarios', component: Horarios },
  { path: 'reportar', component: Reportar },
  { path: 'notificaciones', component: Notificaciones },
];
