import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoBloqueoService, TipoBloqueo, TipoBloqueDTO } from '../services/tipo-bloqueo.service';

interface Bloqueo {
  id: number;
  laboratorio: string;
  fechaInicio: string;
  fechaFin: string;
  horario: string;
  motivo: string;
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
  formTipo: TipoBloqueDTO = { nombreTipo: '', descripcion: '', estado: ''};

  drawerAbierto = false;
  rol = localStorage.getItem('rol') || '';
  usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';
  private cdr: any;

  constructor(
    private router: Router,
    private tipoBloqueoService: TipoBloqueoService
  ) {}

  ngOnInit() {
    this.rol = localStorage.getItem('rol') || '';
    this.usuarioLogueado = localStorage.getItem('usuario') || 'Usuario';

    this.bloqueos = [
      {
        id: 1,
        laboratorio: 'Lab Computación B',
        fechaInicio: '2024-10-20',
        fechaFin: '2024-10-22',
        horario: '14:00 - 18:00',
        motivo: 'Mantenimiento general'
      }
    ];

    this.cargarTiposBloqueo();
  }

  // ───── TABS ─────
  cambiarTab(tab: 'bloqueos' | 'tipos') {
    this.tabActiva = tab;
  }

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
    this.formTipo = { nombreTipo: '', descripcion: '', estado: ''};
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

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;

    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 3000);
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

  // ───── BLOQUEOS ─────
  crearBloqueo() {
    alert('Abrir formulario de nuevo bloqueo - Por implementar');
  }

  editar(bloqueo: Bloqueo) {
    alert(`Editar bloqueo de ${bloqueo.laboratorio}`);
  }

  ver(bloqueo: Bloqueo) {
    alert(`Detalles:\nLab: ${bloqueo.laboratorio}\nMotivo: ${bloqueo.motivo}`);
  }

  eliminar(bloqueo: Bloqueo) {
    if (confirm(`¿Eliminar el bloqueo de "${bloqueo.laboratorio}"?`)) {
      this.bloqueos = this.bloqueos.filter(b => b.id !== bloqueo.id);
    }
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

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
