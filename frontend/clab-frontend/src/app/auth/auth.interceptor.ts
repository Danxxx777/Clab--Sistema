import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  const cloned = token ? req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }) : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        const mensaje = error.error?.mensaje || 'No tienes permisos para realizar esta acción.';
        mostrarToast(mensaje, 'error');
      } else if (error.status === 401) {
        mostrarToast('Tu sesión ha expirado. Inicia sesión nuevamente.', 'warning');
        localStorage.clear();
        window.location.href = '/login';
      } else if (error.status === 500) {
        mostrarToast('Error interno del servidor. Intenta de nuevo.', 'error');
      }
      return throwError(() => error);
    })
  );
};

function mostrarToast(mensaje: string, tipo: 'error' | 'warning' | 'success') {
  const toastExistente = document.getElementById('clab-toast');
  if (toastExistente) toastExistente.remove();

  const colores = {
    error:   { bg: '#dc3545', icon: '✖' },
    warning: { bg: '#ff9800', icon: '⚠' },
    success: { bg: '#28a745', icon: '✔' }
  };

  const { bg, icon } = colores[tipo];

  const toast = document.createElement('div');
  toast.id = 'clab-toast';
  toast.innerHTML = `<span style="font-size:18px;">${icon}</span><span>${mensaje}</span>`;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: ${bg};
    color: white;
    padding: 14px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    z-index: 99999;
    animation: slideIn 0.3s ease;
    max-width: 380px;
  `;

  if (!document.getElementById('clab-toast-style')) {
    const style = document.createElement('style');
    style.id = 'clab-toast-style';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
