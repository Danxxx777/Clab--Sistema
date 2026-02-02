import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {

  // =========================
  // ESTADO UI
  // =========================
  cargando = false;

  // =========================
  // ESTADÍSTICAS
  // =========================
  totalUsuarios = 0;
  usuariosActivos = 0;
  usuariosInactivos = 0;

  // =========================
  // FILTROS
  // =========================
  filtros = {
    busqueda: '',
    estado: '' as '' | 'Activo' | 'Inactivo'
  };


  // =========================
  // DATA
  // =========================
  usuarios = [
    {
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@uteq.edu.ec',
      estado: 'Activo'
    },
    {
      nombres: 'Ana',
      apellidos: 'López',
      email: 'ana@uteq.edu.ec',
      estado: 'Inactivo'
    }
  ];

  usuariosFiltrados: any[] = [];

  // =========================
  // CICLO DE VIDA
  // =========================
  ngOnInit(): void {
    this.usuariosFiltrados = [...this.usuarios];
    this.calcularEstadisticas();
  }

  // =========================
  // MÉTODOS
  // =========================
  aplicarFiltros(): void {
    const texto = this.filtros.busqueda.toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(u =>
      u.nombres.toLowerCase().includes(texto) ||
      u.apellidos.toLowerCase().includes(texto) ||
      u.email.toLowerCase().includes(texto)
    );

    this.calcularEstadisticas();
  }

  limpiarBusqueda(): void {
    this.filtros.busqueda = '';
    this.usuariosFiltrados = [...this.usuarios];
    this.calcularEstadisticas();
  }

  calcularEstadisticas(): void {
    this.totalUsuarios = this.usuariosFiltrados.length;
    this.usuariosActivos = this.usuariosFiltrados.filter(u => u.estado === 'Activo').length;
    this.usuariosInactivos = this.usuariosFiltrados.filter(u => u.estado === 'Inactivo').length;
  }

  obtenerIniciales(nombres: string, apellidos: string): string {
    return (
      (nombres?.charAt(0) ?? '') +
      (apellidos?.charAt(0) ?? '')
    ).toUpperCase();
  }

  abrirModalNuevo(): void {
    alert('Abrir modal nuevo usuario (pendiente)');
  }

  editarUsuario(usuario: any): void {
    alert(`Editar usuario: ${usuario.nombres}`);
  }

  eliminarUsuario(usuario: any): void {
    const ok = confirm(`¿Eliminar a ${usuario.nombres} ${usuario.apellidos}?`);
    if (ok) {
      this.usuarios = this.usuarios.filter(u => u !== usuario);
      this.aplicarFiltros();
    }
  }
  exportarUsuarios(): void {
    console.log('Exportando usuarios:', this.usuariosFiltrados);
    alert('Exportación pendiente');
  }

  verUsuario(usuario: any): void {
    alert(
      `Usuario:\n${usuario.nombres} ${usuario.apellidos}\nEmail: ${usuario.email}`
    );
  }

}
