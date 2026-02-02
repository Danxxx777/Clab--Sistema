import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.scss']
})
export class InventarioComponent {

  // Variable para mostrar/ocultar el modal
  mostrarModal = false;

  // Variable para saber si estamos editando o agregando
  modoEdicion = false;

  // Índice del equipo que estamos editando
  equipoEditandoIndex = -1;
  //
  mostrarConfirmarEliminar= false;
  equipoParaEliminar: any = null;
  indexParaEliminar: number= -1;

  // Lista de equipos de EJEMPLO
  equipos = [
    {
      nombre: 'Computadora Dell',
      tipoEquipo: 'Computadora',
      marca: 'Dell',
      modelo: 'Optiplex 7090',
      noSerie: 'D1001',
      estado: 'OPERATIVO',
      fechaAdquisicion: '2023-01-15',
      ultimaRevision: '2024-01-10',
      laboratorio: 'Lab Comp A',
      ubicacionFisica: 'Edificio A - Piso 2',
      responsable: 'Dr. García'
    },
    {
      nombre: 'Microscopio Leica',
      tipoEquipo: 'Microscopio',
      marca: 'Leica',
      modelo: 'DM2500',
      noSerie: 'LC002',
      estado: 'MANTENIMIENTO',
      fechaAdquisicion: '2022-06-20',
      ultimaRevision: '2024-01-20',
      laboratorio: 'Lab Biología',
      ubicacionFisica: 'Edificio B - Piso 1',
      responsable: 'Dra. Ruiz'
    }
  ];

  // Datos del formulario
  formulario = {
    nombre: '',
    tipoEquipo: '',
    marca: '',
    modelo: '',
    noSerie: '',
    estado: '',
    fechaAdquisicion: '',
    ultimaRevision: '',
    laboratorio: '',
    ubicacionFisica: '',
    responsable: ''
  };

  constructor(private router: Router) {}

  // Abre el modal para AGREGAR
  abrirModal() {
    this.modoEdicion = false;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  // Abre el modal para EDITAR
  editarEquipo(equipo: any, index: number) {
    this.modoEdicion = true;
    this.equipoEditandoIndex = index;

    // Cargar los datos del equipo en el formulario
    this.formulario = {
      nombre: equipo.nombre,
      tipoEquipo: equipo.tipoEquipo,
      marca: equipo.marca,
      modelo: equipo.modelo,
      noSerie: equipo.noSerie,
      estado: equipo.estado,
      fechaAdquisicion: equipo.fechaAdquisicion,
      ultimaRevision: equipo.ultimaRevision,
      laboratorio: equipo.laboratorio,
      ubicacionFisica: equipo.ubicacionFisica,
      responsable: equipo.responsable
    };

    this.mostrarModal = true;
  }


  eliminarEquipo(equipo: any, index: number) {
    this.equipoParaEliminar = equipo;
    this.indexParaEliminar = index;
    this.mostrarConfirmarEliminar = true; // Abrimos el modal personalizado
  }


  confirmarEliminacion() {
    if (this.indexParaEliminar !== -1) {
      this.equipos.splice(this.indexParaEliminar, 1);
      this.cerrarModalConfirmar();
      // Opcional: una notificación pequeña en lugar de un alert
    }
  }

  cerrarModalConfirmar() {
    this.mostrarConfirmarEliminar = false;
    this.equipoParaEliminar = null;
    this.indexParaEliminar = -1;
  }

  // Guardar (agregar o editar)
  guardarEquipo() {
    if (this.modoEdicion) {
      // EDITAR: Actualizar el equipo existente
      this.equipos[this.equipoEditandoIndex] = { ...this.formulario };
      alert('Equipo actualizado correctamente');
    } else {
      // AGREGAR: Añadir nuevo equipo
      this.equipos.push({ ...this.formulario });
      alert('Equipo agregado correctamente');
    }

    this.cerrarModal();
  }

  // Cierra el modal
  cerrarModal() {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  // Limpia el formulario
  limpiarFormulario() {
    this.formulario = {
      nombre: '',
      tipoEquipo: '',
      marca: '',
      modelo: '',
      noSerie: '',
      estado: '',
      fechaAdquisicion: '',
      ultimaRevision: '',
      laboratorio: '',
      ubicacionFisica: '',
      responsable: ''
    };
  }

  // Vuelve al dashboard
  volver() {
    this.router.navigate(['/dashboard']);
  }
}
