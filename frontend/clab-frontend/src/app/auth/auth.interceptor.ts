import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  // No agregar token ni interceptar rutas de autenticación
  if (req.url.includes('/auth')) {
    return next(req);
  }

  const cloned = token ? req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }) : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        const mensaje = error.error?.mensaje || 'No tienes permisos para realizar esta acción.';
        mostrarToast(mensaje, 'error');
      } else if (error.status === 401) {
        // Solo redirigir si hay token — significa sesión expirada/forzada
        if (localStorage.getItem('token')) {
          mostrarToast('Tu sesión fue cerrada. Inicia sesión nuevamente.', 'warning');
          localStorage.clear();
          setTimeout(() => { window.location.href = '/login'; }, 1500);
        }
      } else if (error.status === 500) {
        mostrarToast('Error interno del servidor. Intenta de nuevo.', 'error');
      } else if (error.status === 0) {
    // Backend caído / sin conexión
        if (localStorage.getItem('token')) {
          mostrarToast('El servidor no está disponible. Cerrando sesión...', 'warning');
          localStorage.clear();
          setTimeout(() => { window.location.href = '/login'; }, 1500);
        }
      }
      return throwError(() => error);
    })
  );
};

function mostrarToast(mensaje: string, tipo: 'error' | 'warning' | 'success') {
  const toastExistente = document.getElementById('clab-toast');
  if (toastExistente) toastExistente.remove();

  const estilos = {
    error:   { border: '#e74c3c', icon: '✖', color: '#ff6b6b' },
    warning: { border: '#39ff14', icon: '⚠', color: '#39ff14' },
    success: { border: '#39ff14', icon: '✔', color: '#39ff14' }
  };

  const { border, icon, color } = estilos[tipo];

  const toast = document.createElement('div');
  toast.id = 'clab-toast';
  toast.innerHTML = `<span style="font-size:18px;">${icon}</span><span>${mensaje}</span>`;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: #1a1a1a;
    color: ${color};
    border: 1px solid ${border};
    border-left: 3px solid ${border};
    padding: 14px 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    z-index: 99999;
    animation: clabSlideIn 0.3s ease;
    max-width: 380px;
  `;

  if (!document.getElementById('clab-toast-style')) {
    const style = document.createElement('style');
    style.id = 'clab-toast-style';
    style.textContent = `
      @keyframes clabSlideIn  { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes clabSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'clabSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
