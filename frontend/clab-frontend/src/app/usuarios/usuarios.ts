import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* ===============================
   INTERFACES
================================ */
interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  identidad: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
}

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
}

interface Permiso {
  id: number;
  nombre: string;
  modulo: string;
  estado: 'Activo' | 'Inactivo';
}

interface Auditoria {
  usuario: string;
  accion: string;
  modulo: string;
  fecha: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {

  /* ===============================
     TABS
  ================================ */
  tabActiva = 0;

  /* ===============================
     MODALES
  ================================ */
  mostrarModalUsuario = false;
  mostrarModalRol = false;
  mostrarModalPermiso = false;

  modoModal: 'crear' | 'editar' | 'ver' = 'crear';

  usuarioActual!: Usuario;
  rolActual!: Rol;
  permisoActual!: Permiso;

  /* ===============================
     USUARIOS
  ================================ */
  usuarios: Usuario[] = [
    {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@universidad.edu',
      identidad: '0801199012345',
      rol: 'Administrador',
      estado: 'Activo',
      fechaRegistro: '15/01/2024'
    },
    {
      id: 2,
      nombres: 'María',
      apellidos: 'González',
      email: 'maria.gonzalez@universidad.edu',
      identidad: '0801198023456',
      rol: 'Docente',
      estado: 'Activo',
      fechaRegistro: '20/01/2024'
    }
  ];

  usuariosFiltrados: Usuario[] = [];

  busqueda = '';
  filtroEstado = 'Todos';
  filtroRol = 'Todos';

  /* ===============================
     ROLES
  ================================ */
  roles: Rol[] = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total', estado: 'Activo' },
    { id: 2, nombre: 'Docente', descripcion: 'Gestión académica', estado: 'Activo' },
    { id: 3, nombre: 'Técnico', descripcion: 'Soporte técnico', estado: 'Activo' }
  ];

  /* ===============================
     PERMISOS
  ================================ */
  permisos: Permiso[] = [
    { id: 1, nombre: 'Crear Usuario', modulo: 'Usuarios', estado: 'Activo' },
    { id: 2, nombre: 'Editar Usuario', modulo: 'Usuarios', estado: 'Activo' },
    { id: 3, nombre: 'Eliminar Usuario', modulo: 'Usuarios', estado: 'Activo' }
  ];

  /* ===============================
     AUDITORÍA
  ================================ */
  auditorias: Auditoria[] = [];

  ngOnInit(): void {
    this.usuariosFiltrados = [...this.usuarios];
  }

  /* ===============================
     TABS
  ================================ */
  cambiarTab(index: number): void {
    this.tabActiva = index;
  }

  /* ===============================
     FILTROS USUARIOS
  ================================ */
  filtrarUsuarios(): void {
    const texto = this.busqueda.toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(u =>
      (`${u.nombres} ${u.apellidos} ${u.email} ${u.identidad}`
        .toLowerCase().includes(texto)) &&
      (this.filtroEstado === 'Todos' || u.estado === this.filtroEstado) &&
      (this.filtroRol === 'Todos' || u.rol === this.filtroRol)
    );
  }

  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'activo' : 'inactivo';
  }

  /* ===============================
     MODAL USUARIO
  ================================ */
  abrirModalUsuario(modo: 'crear' | 'editar' | 'ver', u?: Usuario): void {
    this.modoModal = modo;

    this.usuarioActual = u
      ? { ...u }
      : {
        id: 0,
        nombres: '',
        apellidos: '',
        email: '',
        identidad: '',
        rol: '',
        estado: 'Activo',
        fechaRegistro: new Date().toLocaleDateString()
      };

    this.mostrarModalUsuario = true;
  }

  guardarUsuario(): void {
    if (!this.usuarioActual.nombres || !this.usuarioActual.email || !this.usuarioActual.rol) {
      alert('Complete los campos obligatorios');
      return;
    }

    if (this.modoModal === 'crear') {
      this.usuarioActual.id = Date.now();
      this.usuarios.push(this.usuarioActual);
      this.registrarAuditoria('Crear usuario', 'Usuarios');
    } else if (this.modoModal === 'editar') {
      const i = this.usuarios.findIndex(u => u.id === this.usuarioActual.id);
      if (i !== -1) this.usuarios[i] = this.usuarioActual;
      this.registrarAuditoria('Editar usuario', 'Usuarios');
    }

    this.filtrarUsuarios();
    this.cerrarModalUsuario();
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
  }

  eliminarUsuario(u: Usuario): void {
    if (!confirm(`¿Eliminar al usuario ${u.nombres}?`)) return;

    this.usuarios = this.usuarios.filter(x => x.id !== u.id);
    this.filtrarUsuarios();
    this.registrarAuditoria('Eliminar usuario', 'Usuarios');
  }

  /* ===============================
     MODAL ROL
  ================================ */
  abrirModalRol(modo: 'crear' | 'editar', r?: Rol): void {
    this.modoModal = modo;

    this.rolActual = r
      ? { ...r }
      : { id: 0, nombre: '', descripcion: '', estado: 'Activo' };

    this.mostrarModalRol = true;
  }

  guardarRol(): void {
    if (!this.rolActual.nombre) {
      alert('El nombre del rol es obligatorio');
      return;
    }

    if (this.modoModal === 'crear') {
      this.rolActual.id = Date.now();
      this.roles.push(this.rolActual);
      this.registrarAuditoria('Crear rol', 'Roles');
    } else {
      const i = this.roles.findIndex(r => r.id === this.rolActual.id);
      if (i !== -1) this.roles[i] = this.rolActual;
      this.registrarAuditoria('Editar rol', 'Roles');
    }

    this.cerrarModalRol();
  }

  cerrarModalRol(): void {
    this.mostrarModalRol = false;
  }

  eliminarRol(r: Rol): void {
    if (!confirm(`¿Eliminar el rol ${r.nombre}?`)) return;

    this.roles = this.roles.filter(x => x.id !== r.id);
    this.registrarAuditoria('Eliminar rol', 'Roles');
  }

  /* ===============================
     MODAL PERMISO
  ================================ */
  abrirModalPermiso(modo: 'crear' | 'editar', p?: Permiso): void {
    this.modoModal = modo;

    this.permisoActual = p
      ? { ...p }
      : { id: 0, nombre: '', modulo: '', estado: 'Activo' };

    this.mostrarModalPermiso = true;
  }

  guardarPermiso(): void {
    if (!this.permisoActual.nombre || !this.permisoActual.modulo) {
      alert('Complete los campos obligatorios');
      return;
    }

    if (this.modoModal === 'crear') {
      this.permisoActual.id = Date.now();
      this.permisos.push(this.permisoActual);
      this.registrarAuditoria('Crear permiso', 'Permisos');
    } else {
      const i = this.permisos.findIndex(p => p.id === this.permisoActual.id);
      if (i !== -1) this.permisos[i] = this.permisoActual;
      this.registrarAuditoria('Editar permiso', 'Permisos');
    }

    this.cerrarModalPermiso();
  }

  cerrarModalPermiso(): void {
    this.mostrarModalPermiso = false;
  }

  eliminarPermiso(p: Permiso): void {
    if (!confirm(`¿Eliminar permiso ${p.nombre}?`)) return;

    this.permisos = this.permisos.filter(x => x.id !== p.id);
    this.registrarAuditoria('Eliminar permiso', 'Permisos');
  }

  /* ===============================
     AUDITORÍA
  ================================ */
  registrarAuditoria(accion: string, modulo: string): void {
    this.auditorias.unshift({
      usuario: 'Juan Pérez',
      accion,
      modulo,
      fecha: new Date().toLocaleString()
    });
  }
}
