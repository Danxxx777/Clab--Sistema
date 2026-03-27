import {
  Component, Input, OnChanges, OnDestroy, SimpleChanges, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type EstadoAprobacion = 'cargando' | 'exito' | 'error';

interface ToastStep {
  label: string;
  sub: string;
}

@Component({
  selector: 'app-toast-aprobacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-aprobacion.html',     // ← sin ".component"
  styleUrls: ['./toast-aprobacion.scss']       // ← sin ".component", y .scss no .css
})
export class ToastAprobacionComponent implements OnChanges, OnDestroy {

  @Input() visible = false;
  @Input() estado: EstadoAprobacion = 'cargando';
  @Output() cerrado = new EventEmitter<void>();

  currentStep = -1;
  completed = false;
  failed = false;
  private timers: any[] = [];

  readonly steps: ToastStep[] = [
    { label: 'Verificando disponibilidad',     sub: 'Comprobando conflictos de horario...' },
    { label: 'Aprobando reserva',              sub: 'Actualizando estado en base de datos...' },
    { label: 'Notificando al encargado',       sub: 'Enviando correo al encargado del laboratorio...' },
    { label: '¡Reserva aprobada!',             sub: 'Proceso completado exitosamente.' },
  ];

  get progressPercent(): number {
    if (this.completed) return 100;
    if (this.currentStep < 0) return 0;
    return Math.round(((this.currentStep + 1) / this.steps.length) * 90);
  }

  getStepClass(i: number): string {
    if (this.completed || i < this.currentStep) return 'done';
    if (i === this.currentStep && !this.completed) return 'active';
    return 'waiting';
  }

  getStepSub(i: number): string {
    if (this.completed || i < this.currentStep) return 'Completado';
    if (i === this.currentStep) return this.steps[i].sub;
    return 'En espera...';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.start();
    }
    if (changes['visible']?.currentValue === false) {
      this.reset();
    }
    if (changes['estado'] && !changes['estado'].firstChange) {
      if (this.estado === 'exito') this.finalize();
      if (this.estado === 'error') this.handleError();
    }
  }

  private start(): void {
    this.reset();
    const delays = [0, 700, 1600];
    delays.forEach((delay, i) => {
      const t = setTimeout(() => { this.currentStep = i; }, delay);
      this.timers.push(t);
    });
  }

  // Llamar esto cuando el API responde OK
  private finalize(): void {
    this.clearTimers();
    this.currentStep = this.steps.length - 1;
    const t = setTimeout(() => {
      this.completed = true;
      // auto-cierre después de 3s
      const t2 = setTimeout(() => this.cerrar(), 3000);
      this.timers.push(t2);
    }, 1000);
    this.timers.push(t);
  }

  private handleError(): void {
    this.clearTimers();
    this.failed = true;
  }

  cerrar(): void {
    this.reset();
    this.cerrado.emit();
  }

  private reset(): void {
    this.clearTimers();
    this.currentStep = -1;
    this.completed = false;
    this.failed = false;
  }

  private clearTimers(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}
