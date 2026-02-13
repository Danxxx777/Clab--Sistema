import { Routes } from '@angular/router';

import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { ReservarComponent } from './reservar/reservar';
import { HorariosComponent } from './horarios/horarios';
import { ReportarComponent } from './reportar/reportar';
import { NotificacionesComponent } from './notificaciones/notificaciones';
import { InventarioComponent } from './inventario/inventario';
import { BloqueosComponent } from './bloqueos/bloqueos';
import { InformesComponent } from './informes/informes';
import { LaboratoriosComponent } from './laboratorio/laboratorio';
import { AcademicoComponent } from './academico/academico';
import { EstudiantesComponent } from './estudiantes/estudiantes';
import { UsuariosComponent } from './usuarios/usuarios';
import { ReporteFallasComponent } from './reporteFallas/reporteFallas';



import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';

import { authGuard } from './auth/auth.guard';

export const routes: Routes = [

  // 🔑 RUTA INICIAL
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔓 RUTAS PÚBLICAS
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // 🔐 RUTAS PROTEGIDAS
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'reservar',
    component: ReservarComponent,
    canActivate: [authGuard]
  },
  {
    path: 'inventario',
    component: InventarioComponent,
    canActivate: [authGuard]
  },
  {
    path: 'horarios',
    component: HorariosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'estudiantes',
    component: EstudiantesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'equipos',
    component: InventarioComponent,
    canActivate: [authGuard]
  },
  {
    path: 'reportar',
    component: ReportarComponent,
    canActivate: [authGuard]
  },
  {
    path: 'notificaciones',
    component: NotificacionesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'laboratorios',
    component: LaboratoriosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'bloqueos',
    component: BloqueosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'informes',
    component: InformesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'academico',
    component: AcademicoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [authGuard]
  },

  {
    path: 'reporte-fallas',
    component: ReporteFallasComponent,
    canActivate: [authGuard]
  },




  // 🔒 fallback FINAL
  { path: '**', redirectTo: 'dashboard' }
];
