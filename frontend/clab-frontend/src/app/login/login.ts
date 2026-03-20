import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';
  recordarme = false;
  errorMessage = '';
  mostrarPassword = false;
  cargando = false;
  loadingText = 'Verificando credenciales...';
  modoAcceso: 'login' | 'solicitud' = 'login';

  stats = {
    labsActivos: 0,
    reservasMes: 0,
    usuariosActivos: 0,
    equiposRegistrados: 0
  };

  formSolicitud = {
    identidad: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    motivo: '',
    idRolSolicitado: null as number | null
  };

  roles: { id: number, nombre: string }[] = [];
  enviandoSolicitud = false;
  solicitudExito = false;
  errorSolicitud = '';

  private loadingMessages = [
    'Verificando credenciales...',
    'Cargando tu perfil...',
    'Preparando el sistema...',
    'Casi listo...'
  ];

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarRecordado();
    this.cargarRolesPublicos();
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleModo(): void {
    const container = document.querySelector('.login-left');
    const right = document.querySelector('.login-right');
    container?.classList.add('switching');
    right?.classList.add('switching');

    setTimeout(() => {
      this.modoAcceso = this.modoAcceso === 'login' ? 'solicitud' : 'login';
      this.errorMessage = '';
      this.errorSolicitud = '';
      this.solicitudExito = false;
      container?.classList.remove('switching');
      right?.classList.remove('switching');
      this.cdr.detectChanges();
    }, 220);
  }

  login(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Debe completar usuario y contraseña.';
      this.triggerShake();
      return;
    }

    this.cargando = true;
    this.loadingText = this.loadingMessages[0];
    this.cdr.detectChanges();

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex++;
      if (msgIndex < this.loadingMessages.length) {
        this.loadingText = this.loadingMessages[msgIndex];
        this.cdr.detectChanges();
      }
    }, 1000);

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        if (this.recordarme) {
          localStorage.setItem('clab_usuario_recordado', this.username);
        } else {
          localStorage.removeItem('clab_usuario_recordado');
        }
        clearInterval(msgInterval);
        this.loadingText = '¡Bienvenido!';
        this.cdr.detectChanges();
        setTimeout(() => {
          const esPrimerLogin = sessionStorage.getItem('primerLogin') === 'true';
          if (esPrimerLogin) {
            this.router.navigate(['/cambiar-contrasenia']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1500);
      },
      error: (err) => {
        clearInterval(msgInterval);
        this.loadingText = 'Verificando credenciales...';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cargando = false;
          const status = err.status;
          if (status === 401 || status === 403) {
            this.errorMessage = 'Contraseña incorrecta. Verifica e intenta de nuevo.';
          } else if (status === 404) {
            this.errorMessage = 'Usuario no encontrado en el sistema.';
          } else if (status === 0) {
            this.errorMessage = 'No se pudo conectar al servidor.';
          } else {
            this.errorMessage = 'Usuario o contraseña incorrectos.';
          }
          this.cdr.detectChanges();
          this.triggerShake();
        }, 1200);
      }
    });
  }

  cargarRecordado(): void {
    const usuarioGuardado = localStorage.getItem('clab_usuario_recordado');
    if (usuarioGuardado) {
      this.username = usuarioGuardado;
      this.recordarme = true;
      this.cdr.detectChanges();
    }
  }

  cargarEstadisticas(): void {
    this.http.get<any>('http://localhost:8080/estadisticas/login').subscribe({
      next: (data) => { this.stats = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarRolesPublicos(): void {
    this.http.get<any[]>('http://localhost:8080/roles/publicos').subscribe({
      next: (data) => {
        this.roles = data.map(r => ({ id: r.idRol, nombre: r.nombreRol }));
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  enviarSolicitud(): void {
    this.errorSolicitud = '';
    if (!this.formSolicitud.identidad || !this.formSolicitud.nombres ||
      !this.formSolicitud.apellidos || !this.formSolicitud.email ||
      !this.formSolicitud.motivo) {
      this.errorSolicitud = 'Por favor completa todos los campos obligatorios.';
      return;
    }
    if (!this.formSolicitud.idRolSolicitado) {
      this.errorSolicitud = 'Selecciona el rol que solicitas.';
      return;
    }
    this.enviandoSolicitud = true;
    this.http.post<any>('http://localhost:8080/api/solicitudes/crear', this.formSolicitud).subscribe({
      next: (res) => {
        this.enviandoSolicitud = false;
        if (Number(res.codigo) === 1) {
          this.solicitudExito = true;
        } else {
          this.errorSolicitud = res.mensaje;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.enviandoSolicitud = false;
        this.errorSolicitud = 'Error al conectar con el servidor.';
        this.cdr.detectChanges();
      }
    });
  }

  private triggerShake(): void {
    const el = document.querySelector('.login-form-container');
    el?.classList.remove('shake');
    void (el as HTMLElement)?.offsetWidth;
    el?.classList.add('shake');
    setTimeout(() => el?.classList.remove('shake'), 600);
  }
}
