import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar.html',
  styleUrls: ['./reservar.scss']
})
export class ReservarComponent {
  laboratorio='Lab A'; fecha=''; hora='07:30-10:30';
  guardar(){ alert(`Reserva: ${this.laboratorio} ${this.fecha} ${this.hora}`); }
}
