import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurar-inicial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurar-inicial.html',
  styleUrls: ['./restaurar-inicial.scss']
})
export class RestaurarInicialComponent {
  cargando = false;
  completado = false;
  error = '';
  archivoSeleccionado: File | null = null;
  progresoSimulado = 0;
  pasoActual = 1; // 1=seleccionar, 2=restaurando, 3=completado
  private intervaloProgreso: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private zone:NgZone,
    private cdr: ChangeDetectorRef
  ) {}
  isDragOver = false;

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.archivoSeleccionado = input.files[0];
      this.error = '';
    }
  }

  restaurar(): void {
    if (!this.archivoSeleccionado || this.cargando) return;
    this.cargando = true;
    this.error = '';
    this.progresoSimulado = 0;
    this.pasoActual = 2;

    this.intervaloProgreso = setInterval(() => {
      if (this.progresoSimulado < 90) {
        this.progresoSimulado += Math.random() * 4 + 1;
        if (this.progresoSimulado > 90) this.progresoSimulado = 90;
      }
      this.cdr.detectChanges();
    }, 400);

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);

    this.http.post<any>('http://localhost:8080/backup/restaurar/inicial', formData).subscribe({
      next: (res) => {
        clearInterval(this.intervaloProgreso);
        this.progresoSimulado = 100;
        this.cargando = false;
        this.pasoActual = 3;
        this.completado = true;
        this.cdr.detectChanges();  // ← agregar esto
      },
      error: () => {
        clearInterval(this.intervaloProgreso);
        this.progresoSimulado = 0;
        this.cargando = false;
        this.pasoActual = 1;
        this.error = 'Error al conectar con el servidor. Verifica que el backend esté corriendo.';
        this.cdr.detectChanges();  // ← y esto
      }
    });
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }

  get nombreArchivo(): string {
    if (!this.archivoSeleccionado) return '';
    const nombre = this.archivoSeleccionado.name;
    return nombre.length > 32 ? nombre.substring(0, 29) + '...' : nombre;
  }

  get progresoRedondeado(): number {
    return Math.round(this.progresoSimulado);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.error = '';
      this.cdr.detectChanges();
    }
  }
}
