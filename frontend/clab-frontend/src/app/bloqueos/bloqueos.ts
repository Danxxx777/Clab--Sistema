import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LaboratorioService } from '../services/laboratorio.service';
import { TipoBloqueoService, TipoBloqueo, TipoBloqueDTO } from '../services/tipo-bloqueo.service';
import { BloqueoLabService, BloqueoLabDTO } from '../services/bloqueo-lab.service';

interface Bloqueo {
  idBloqueo: number;
  codLaboratorio: number;
  nombreLaboratorio: string;
  idUsuario: number;
  nombreUsuario: string;
  idTipoBloqueo: number;
  nombreTipoBloqueo: string;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  afectaReservasExistentes: boolean;
  estado: string;
}

@Component({
  selector: 'app-bloqueos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bloqueos.html',
  styleUrls: ['./bloqueos.scss']
})
export class BloqueosComponent implements OnInit {

  tabActiva: 'bloqueos' | 'tipos' = 'bloqueos';

  bloqueos: Bloqueo[] = [];

  tiposBloqueo: TipoBloqueo[] = [];
  busquedaTipo = '';
  mostrarModalTipo = false;
  modoEdicionTipo = false;
  tipoSeleccionado: TipoBloqueo | null = null;
  formTipo: TipoBloqueDTO = { nombreTipo: '', descripcion: '', estado: '' };

  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  laboratorios: any[] = [];
  mostrarModalBloqueo = false;
  modoEdicionBloqueo = false;
  bloqueoEditandoId: number | null = null;

  formBloqueo: BloqueoLabDTO = {
    codLaboratorio: 0,
    idTipoBloqueo: 0,
    fechaInicio: '',
    fechaFin: '',
    estado: 'ACTIVO',
    motivo: ''
  };

  mostrarModalVer = false;
  bloqueoSeleccionado: Bloqueo | null = null;
  mostrarModalConfirm= false;
  bloqueoAEliminar: Bloqueo | null= null;

  confirmarEliminar(bloqueo: Bloqueo): void {
    this.bloqueoAEliminar = bloqueo;
    this.mostrarModalConfirm = true;
  }

  cerrarModalConfirm(): void {
    this.mostrarModalConfirm = false;
    this.bloqueoAEliminar = null;
  }

  ejecutarEliminar(): void {
    if (!this.bloqueoAEliminar) return;
    const id = this.bloqueoAEliminar.idBloqueo;
    this.bloqueos = this.bloqueos.filter(b => b.idBloqueo !== id);
    this.cerrarModalConfirm();
    this.mostrarNotificacion('✅ Bloqueo eliminado correctamente');
    this.cdr.detectChanges();
    this.bloqueoLabService.eliminar(id).subscribe({
      error: (err) => {
        console.error('Error eliminando bloqueo:', err);
        this.mostrarNotificacion('❌ Error al eliminar el bloqueo', 'error');
        this.cargarBloqueos();
      }
    });
  }

  constructor(
    private router: Router,
    private tipoBloqueoService: TipoBloqueoService,
    private laboratorioService: LaboratorioService,
    private bloqueoLabService: BloqueoLabService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';
    this.cargarTiposBloqueo();
    this.cargarLaboratorios();
    this.cargarBloqueos();
    this.cdr.detectChanges();
  }

  // ───── TABS ─────
  cambiarTab(tab: 'bloqueos' | 'tipos') {
    this.tabActiva = tab;
  }

  // ───── BLOQUEOS ─────
  cargarBloqueos(): void {
    this.bloqueoLabService.listar().subscribe({
      next: (data) => {
        this.bloqueos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando bloqueos', err)
    });
  }

  cargarLaboratorios(): void {
    this.laboratorioService.listar().subscribe({
      next: (data) => {
        this.laboratorios = data.map(l => ({
          codLaboratorio: l.codLaboratorio,
          nombre: l.nombreLab
        }));
      },
      error: (err) => console.error('Error cargando laboratorios', err)
    });
  }

  crearBloqueo(): void {
    this.modoEdicionBloqueo = false;
    this.bloqueoEditandoId = null;
    this.formBloqueo = {
      codLaboratorio: 0,
      idTipoBloqueo: 0,
      fechaInicio: '',
      fechaFin: '',
      estado: 'ACTIVO',
      motivo: ''
    };
    this.mostrarModalBloqueo = true;
  }

  cerrarModalBloqueo(): void {
    this.mostrarModalBloqueo = false;
    this.bloqueoEditandoId = null;
  }

  guardarBloqueo(): void {
    if (!this.formBloqueo.codLaboratorio || this.formBloqueo.codLaboratorio === 0) {
      this.mostrarNotificacion('Seleccione un laboratorio', 'error'); return;
    }
    if (!this.formBloqueo.idTipoBloqueo || this.formBloqueo.idTipoBloqueo === 0) {
      this.mostrarNotificacion('Seleccione un tipo de bloqueo', 'error'); return;
    }
    if (!this.formBloqueo.fechaInicio || !this.formBloqueo.fechaFin) {
      this.mostrarNotificacion('Las fechas son obligatorias', 'error'); return;
    }
    if (this.formBloqueo.fechaInicio > this.formBloqueo.fechaFin) {
      this.mostrarNotificacion('La fecha inicio no puede ser mayor a la fecha fin', 'error'); return;
    }
    if (!this.formBloqueo.motivo.trim()) {
      this.mostrarNotificacion('El motivo es obligatorio', 'error'); return;
    }

    if (this.modoEdicionBloqueo && this.bloqueoEditandoId !== null) {
      this.bloqueoLabService.actualizar(this.bloqueoEditandoId, this.formBloqueo).subscribe({
        next: () => {
          this.cerrarModalBloqueo();
          this.mostrarNotificacion('✅ Bloqueo actualizado correctamente');
          this.cdr.detectChanges();
          this.cargarBloqueos();

        },
        error: (err) => {
          console.error('Error actualizando bloqueo:', err);
          this.mostrarNotificacion('❌ Error al actualizar el bloqueo', 'error');
        }
      });
    } else {
      this.bloqueoLabService.crear(this.formBloqueo).subscribe({
        next: () => {
          this.cerrarModalBloqueo();
          this.mostrarNotificacion('✅ Bloqueo creado exitosamente');
          this.cdr.detectChanges();
          this.cargarBloqueos();

        },
        error: (err) => {
          console.error('Error creando bloqueo:', err);
          this.mostrarNotificacion('❌ Error al crear el bloqueo', 'error');
        }
      });
    }
  }

  editar(bloqueo: Bloqueo): void {
    this.modoEdicionBloqueo = true;
    this.bloqueoEditandoId = bloqueo.idBloqueo;
    this.formBloqueo = {
      codLaboratorio: bloqueo.codLaboratorio,
      idTipoBloqueo: bloqueo.idTipoBloqueo,
      fechaInicio: bloqueo.fechaInicio,
      fechaFin: bloqueo.fechaFin,
      estado: bloqueo.estado,
      motivo: bloqueo.motivo
    };
    this.mostrarModalBloqueo = true;
  }

  ver(bloqueo: Bloqueo): void {
    this.bloqueoSeleccionado = bloqueo;
    this.mostrarModalVer = true;
  }

  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.bloqueoSeleccionado = null;
  }

  //ESTUVO AQUI EL METODO ELIMINAR

  // ───── TIPOS DE BLOQUEO ─────
  cargarTiposBloqueo() {
    this.tipoBloqueoService.listar().subscribe({
      next: (data) => this.tiposBloqueo = data,
      error: (err) => console.error('Error cargando tipos de bloqueo', err)
    });
  }

  get tiposFiltrados(): TipoBloqueo[] {
    if (!this.busquedaTipo.trim()) return this.tiposBloqueo;
    const q = this.busquedaTipo.toLowerCase();
    return this.tiposBloqueo.filter(t =>
      t.nombreTipo.toLowerCase().includes(q) ||
      t.descripcion.toLowerCase().includes(q)
    );
  }

  abrirModalNuevoTipo() {
    this.modoEdicionTipo = false;
    this.tipoSeleccionado = null;
    this.formTipo = { nombreTipo: '', descripcion: '', estado: '' };
    this.mostrarModalTipo = true;
  }

  abrirModalEditarTipo(tipo: TipoBloqueo) {
    this.modoEdicionTipo = true;
    this.tipoSeleccionado = tipo;
    this.formTipo = { nombreTipo: tipo.nombreTipo, descripcion: tipo.descripcion, estado: tipo.estado };
    this.mostrarModalTipo = true;
  }

  cerrarModalTipo() {
    this.mostrarModalTipo = false;
  }

  guardarTipo() {
    if (this.modoEdicionTipo && this.tipoSeleccionado) {
      this.tipoBloqueoService.actualizar(this.tipoSeleccionado.idTipoBloqueo, this.formTipo).subscribe({
        next: () => {
          this.cargarTiposBloqueo();
          this.cerrarModalTipo();
          this.mostrarNotificacion('✅ Tipo bloqueo actualizado correctamente');
        },
        error: (err) => {
          console.error('Error actualizando tipo:', err);
          this.mostrarNotificacion('❌ Error al actualizar el tipo', 'error');
        }
      });
    } else {
      this.tipoBloqueoService.crear(this.formTipo).subscribe({
        next: () => {
          this.cargarTiposBloqueo();
          this.cerrarModalTipo();
          this.mostrarNotificacion('✅ Tipo de bloqueo creado exitosamente');
        },
        error: (err) => {
          console.error('Error creando tipo:', err);
          this.mostrarNotificacion('❌ Error al crear el tipo', 'error');
        }
      });
    }
  }

  eliminarTipo(tipo: TipoBloqueo) {
    if (confirm(`¿Eliminar el tipo "${tipo.nombreTipo}"?`)) {
      this.tipoBloqueoService.eliminar(tipo.idTipoBloqueo).subscribe({
        next: () => this.cargarTiposBloqueo(),
        error: (err) => console.error('Error eliminando tipo', err)
      });
    }
  }

  // ───── NOTIFICACION ─────
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;
    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  // ───── DRAWER / NAV ─────
  toggleDrawer(): void { this.drawerAbierto = !this.drawerAbierto; }
  cerrarDrawer(): void { this.drawerAbierto = false; }

  navegar(ruta: string, texto: string): void {
    this.cerrarDrawer();
    this.router.navigate([`/${ruta}`]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
