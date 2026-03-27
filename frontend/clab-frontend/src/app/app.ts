import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('clab-frontend');
  private intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      if (!localStorage.getItem('token')) return;

      this.http.get('http://localhost:8080/ping', { responseType: 'text' }).subscribe({
        error: (err) => {
          if (err.status === 0) {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
      });
    }, 30000); // cada 30 segundos
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
