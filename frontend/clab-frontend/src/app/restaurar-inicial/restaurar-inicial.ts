import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurar-inicial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="background:#111;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;">
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;width:100%;max-width:460px;padding:48px 40px;text-align:center;">

        <h1 style="color:#39ff14;font-size:2.5rem;font-weight:700;margin:0 0 4px;">CLAB</h1>
        <p style="color:#555;font-size:0.85rem;margin:0 0 32px;font-family:'Space Mono',monospace;">Sistema de Gestión de Laboratorios</p>

        <div style="border:2px dashed #2a2a2a;border-radius:12px;padding:28px 20px;margin-bottom:20px;cursor:pointer;"
             [style.borderColor]="archivoSeleccionado ? '#39ff14' : '#2a2a2a'"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept=".zip,.backup" (change)="onArchivoSeleccionado($event)" style="display:none">
          <div style="color:#39ff14;font-size:2rem;margin-bottom:8px;">↑</div>
          <p style="color:#888;font-size:0.85rem;margin:0;">
            {{ archivoSeleccionado ? archivoSeleccionado.name : 'Selecciona el archivo de backup (.zip)' }}
          </p>
        </div>

        <button (click)="restaurar()"
                [disabled]="!archivoSeleccionado || cargando"
                style="width:100%;padding:14px;background:#39ff14;color:#000;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;font-family:'Space Grotesk',sans-serif;"
                [style.opacity]="(!archivoSeleccionado || cargando) ? '0.5' : '1'">
          {{ cargando ? 'Restaurando base de datos...' : 'Restaurar Sistema' }}
        </button>

        <p *ngIf="mensaje" style="margin-top:16px;color:#39ff14;font-size:0.85rem;">{{ mensaje }}</p>
        <p *ngIf="error" style="margin-top:16px;color:#ff6b6b;font-size:0.85rem;">{{ error }}</p>

        <p style="margin-top:24px;font-size:0.75rem;color:#333;">
          <a href="/login" style="color:#444;text-decoration:none;">← Volver al login</a>
        </p>
      </div>
    </div>
  `
})
export class RestaurarInicialComponent {
  cargando = false;
  mensaje = '';
  error = '';
  archivoSeleccionado: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.archivoSeleccionado = input.files[0];
  }

  restaurar(): void {
    if (!this.archivoSeleccionado) return;
    this.cargando = true;
    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    this.http.post<any>('http://localhost:8080/backup/restaurar/inicial', formData).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = res.exitoso ? '✅ Restauración completada. Reinicia el backend.' : res.mensaje;
      },
      error: () => { this.cargando = false; this.error = 'Error al conectar'; }
    });
  }
}
