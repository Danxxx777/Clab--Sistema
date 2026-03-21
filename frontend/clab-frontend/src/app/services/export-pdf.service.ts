import { Injectable } from '@angular/core';
import { ExportOptions } from '../interfaces/Reportar.model';

// ─── Paleta base ──────────────────────────────────────────────────────────────
const C = {
  white:   [255, 255, 255] as [number,number,number],
  bg:      [250, 250, 250] as [number,number,number],
  chipBg:  [245, 245, 245] as [number,number,number],
  gray100: [238, 238, 238] as [number,number,number],
  gray200: [224, 224, 224] as [number,number,number],
  gray300: [200, 200, 200] as [number,number,number],
  gray400: [160, 160, 160] as [number,number,number],
  gray500: [120, 120, 120] as [number,number,number],
  gray700: [70,  70,  70]  as [number,number,number],
  black:   [17,  17,  17]  as [number,number,number],
  neon:    [57,  255, 20]  as [number,number,number],
  badgeBg: [240, 240, 240] as [number,number,number],
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

// Calcula si el texto sobre un color debe ser blanco o negro
function contrastColor(rgb: [number,number,number]): [number,number,number] {
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return lum > 0.5 ? C.black : C.white;
}

const fmtHorario = (v: string) =>
  (v || '').split(' - ').map(p => p.replace(/^(\d{2}:\d{2}):\d{2}$/, '$1')).join(' - ');

@Injectable({ providedIn: 'root' })
export class ExportPdfService {

  async exportar(opts: ExportOptions): Promise<void> {
    const { jsPDF } = await import('jspdf');

    // ── Colores dinámicos según tema ─────────────────────────────────────────
    const temaOscuro  = opts.temaOscuro !== false;
    const HEADER_BG   = temaOscuro ? C.black      : hexToRgb(opts.colorHeader || '#1e3a8a');
    const ACENTO      = temaOscuro ? C.neon        : hexToRgb(opts.colorAcento || '#3b82f6');
    const HEADER_TEXT = contrastColor(HEADER_BG);
    const BRAND_COLOR = temaOscuro ? C.neon        : contrastColor(HEADER_BG);
    const BAR_FILL    = temaOscuro ? C.black       : hexToRgb(opts.colorAcento || '#3b82f6');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PW = 210, PH = 297, ML = 14, MR = 14, CW = PW - ML - MR;
    const FOOTER_H    = 8;
    const SAFE_BOTTOM = PH - FOOTER_H - 4;
    let Y = 0;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const setFont = (style: 'normal' | 'bold', size: number, rgb: [number,number,number]) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    };

    const fill = (x: number, y: number, w: number, h: number, rgb: [number,number,number]) => {
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(x, y, w, h, 'F');
    };

    const fillR = (x: number, y: number, w: number, h: number, r: number, rgb: [number,number,number]) => {
      if (w <= 0 || h <= 0) return;
      const safeR = Math.min(r, w / 2, h / 2);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      (doc as any).roundedRect(x, y, w, h, safeR, safeR, 'F');
    };

    const borderR = (x: number, y: number, w: number, h: number, r: number, rgb: [number,number,number], lw = 0.3) => {
      const safeR = Math.min(r, w / 2, h / 2);
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setLineWidth(lw);
      (doc as any).roundedRect(x, y, w, h, safeR, safeR, 'S');
    };

    const fillBorderR = (x: number, y: number, w: number, h: number, r: number,
                         fillRgb: [number,number,number], borderRgb: [number,number,number], lw = 0.3) => {
      const safeR = Math.min(r, w / 2, h / 2);
      doc.setFillColor(fillRgb[0], fillRgb[1], fillRgb[2]);
      doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
      doc.setLineWidth(lw);
      (doc as any).roundedRect(x, y, w, h, safeR, safeR, 'FD');
    };

    const hline = (x1: number, y: number, x2: number, rgb: [number,number,number], lw = 0.3) => {
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setLineWidth(lw);
      doc.line(x1, y, x2, y);
    };

    const vline = (x: number, y1: number, y2: number, rgb: [number,number,number], lw = 0.3) => {
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setLineWidth(lw);
      doc.line(x, y1, x, y2);
    };

    const cell = (t: string, x: number, ry: number, rh: number, o?: any) =>
      doc.text(String(t), x, ry + rh / 2, { baseline: 'middle', ...o });

    const op = (v: number) => doc.setGState(new (doc as any).GState({ opacity: v }));

    const drawBar = (x: number, y: number, maxW: number, trackH: number, ratio: number, r: number) => {
      fillR(x, y, maxW, trackH, r, C.gray100);
      const bW = Math.min(Math.max(ratio, 0), 1) * maxW;
      if (bW > 0) {
        const finalW = bW >= maxW - 0.5 ? maxW : bW;
        fillR(x, y, finalW, trackH, r, BAR_FILL);
      }
    };

    const checkPage = (needed: number) => {
      if (Y + needed > SAFE_BOTTOM) { doc.addPage(); Y = 14; }
    };

    const drawFooter = () => {
      const total = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        fill(0, PH - FOOTER_H, PW, FOOTER_H, HEADER_BG);
        hline(0, PH - FOOTER_H, PW, ACENTO, 0.5);
        setFont('normal', 6, C.gray400);
        op(0.6);
        cell('CLAB — Sistema de Laboratorios · UTEQ', ML, PH - FOOTER_H, FOOTER_H);
        cell(
          `Generado: ${new Date().toLocaleDateString('es-EC')} · Pág. ${p} / ${total}`,
          PW - MR, PH - FOOTER_H, FOOTER_H, { align: 'right' }
        );
        op(1);
      }
    };

    // ── HEADER ────────────────────────────────────────────────────────────────
    const HEADER_H = 54;
    fill(0, 0, PW, HEADER_H, HEADER_BG);
    hline(0, HEADER_H, PW, ACENTO, 0.8);

    // Logo UTEQ
    try {
      const resp = await fetch('/LogoUTEQ.png');
      const blob = await resp.blob();
      const b64: string = await new Promise(res => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(',')[1]);
        r.readAsDataURL(blob);
      });
      doc.addImage(b64, 'PNG', ML, 6, 22, 22);
    } catch {}

    // Brand CLAB
    setFont('bold', 22, BRAND_COLOR);
    doc.text('CLAB', ML + 26, 15);

    setFont('normal', 7, HEADER_TEXT);
    op(0.4);
    doc.text('SISTEMA DE LABORATORIOS  ·  UTEQ', ML + 26, 21);
    op(1);

    // Fecha arriba derecha
    setFont('normal', 7, HEADER_TEXT);
    op(0.35);
    doc.text(new Date().toLocaleDateString('es-EC', { year:'numeric', month:'long', day:'numeric' }), PW - MR, 16, { align: 'right' });
    doc.text(new Date().toLocaleTimeString('es-EC', { hour:'2-digit', minute:'2-digit' }), PW - MR, 22.5, { align: 'right' });
    op(1);

    // Separador sutil
    op(0.1);
    hline(ML, 31, PW - MR, HEADER_TEXT, 0.3);
    op(1);

    // Sub-label REPORTE
    setFont('normal', 7, HEADER_TEXT);
    op(0.4);
    doc.text('REPORTE', ML, 35);
    op(1);

    // Título del reporte
    setFont('bold', 16, HEADER_TEXT);
    doc.text(opts.modulo.titulo, ML, 47);

    // ── CHIPS ─────────────────────────────────────────────────────────────────
    Y = HEADER_H;
    const CHIP_BAND_H = 13;

    fill(0, Y, PW, CHIP_BAND_H, C.chipBg);
    hline(0, Y + CHIP_BAND_H, PW, C.gray200, 0.4);

    const chips: { label: string; val: string }[] = [];
    if (opts.filtros.fechaInicio && opts.filtros.fechaFin)
      chips.push({ label: 'Periodo', val: `${opts.filtros.fechaInicio} - ${opts.filtros.fechaFin}` });
    chips.push({ label: 'Laboratorio', val: opts.nombreLaboratorio || 'Todos' });
    if (opts.filtros.estado) chips.push({ label: 'Estado', val: opts.filtros.estado });
    chips.push({ label: 'Usuario', val: opts.usuarioLogueado });

    const CHIP_H    = 7;
    const chipItemY = Y + (CHIP_BAND_H - CHIP_H) / 2;
    let   chipX     = ML;

    chips.forEach(chip => {
      const labelTxt = `${chip.label}: `;
      setFont('normal', 6.5, C.gray500);
      const lw = doc.getTextWidth(labelTxt);
      setFont('bold', 6.5, C.black);
      const vw = doc.getTextWidth(chip.val);
      const tw = lw + vw + 10;
      if (chipX + tw > PW - MR) chipX = ML;

      fillBorderR(chipX, chipItemY, tw, CHIP_H, 1.5, C.white, C.gray200, 0.3);
      setFont('normal', 6.5, C.gray500);
      cell(labelTxt, chipX + 4, chipItemY, CHIP_H);
      setFont('bold', 6.5, C.black);
      cell(chip.val, chipX + 4 + lw, chipItemY, CHIP_H);
      chipX += tw + 5;
    });

    Y = Y + CHIP_BAND_H + 10;

    // ── STATS ─────────────────────────────────────────────────────────────────
    if (opts.statsModulo.length > 0) {
      checkPage(42);

      setFont('bold', 7, C.gray400);
      doc.text('RESUMEN DEL PERÍODO', ML, Y);
      Y += 6;

      const count = Math.min(opts.statsModulo.length, 4);
      const GAP   = 6;
      const statW = (CW - (count - 1) * GAP) / count;
      const statH = 22;
      let   sx    = ML;

      opts.statsModulo.forEach((s, i) => {
        if (i >= 4) return;
        fillBorderR(sx, Y, statW, statH, 2, C.bg, C.gray200, 0.3);
        fillR(sx, Y, statW, 2, 1, ACENTO);
        setFont('normal', 5.5, C.gray500);
        doc.text(
          (s.label.length > 20 ? s.label.substring(0, 19) + '…' : s.label).toUpperCase(),
          sx + 6, Y + 8
        );
        setFont('bold', 18, C.black);
        doc.text(String(s.valor), sx + statW / 2, Y + 18, { align: 'center' });
        sx += statW + GAP;
      });

      Y += statH + 10;
    }

    // ── GRÁFICAS ──────────────────────────────────────────────────────────────
    if (opts.datosGrafica.length > 0 || opts.datosDistribucion.length > 0) {
      const CHART_HEAD_H = 10;
      const ROW_H        = 15;
      const CHART_PAD_T  = 4;
      const CHART_PAD_B  = 6;
      const BAR_H        = 2.5;
      const BAR_R        = 1;
      const maxRows      = Math.max(opts.datosGrafica.length, opts.datosDistribucion.length);
      checkPage(12 + CHART_HEAD_H + CHART_PAD_T + maxRows * ROW_H + CHART_PAD_B);

      setFont('bold', 7, C.gray400);
      doc.text('VISUALIZACIÓN DE DATOS', ML, Y);
      Y += 5;

      const halfW  = (CW - 5) / 2;
      const gY     = Y;
      const R_CARD = 2;
      const PAD_H  = 7;

      // Gráfica 1
      if (opts.datosGrafica.length > 0) {
        const g1H = CHART_HEAD_H + CHART_PAD_T + opts.datosGrafica.length * ROW_H + CHART_PAD_B;
        fillBorderR(ML, gY, halfW, g1H, R_CARD, C.bg, C.gray200, 0.3);
        fillR(ML, gY, halfW, CHART_HEAD_H + R_CARD, R_CARD, HEADER_BG);
        fill(ML, gY + CHART_HEAD_H, halfW, R_CARD, HEADER_BG);
        setFont('bold', 6, HEADER_TEXT);
        op(0.8);
        cell(opts.tituloGrafica1.toUpperCase(), ML + halfW / 2, gY + 2, CHART_HEAD_H - 2, { align: 'center' });
        op(1);

        const maxVal = Math.max(...opts.datosGrafica.map(d => Number(d.valor) || 0), 1);
        const bMaxW  = halfW - PAD_H * 2;
        const barX   = ML + PAD_H;
        let   bY     = gY + CHART_HEAD_H + CHART_PAD_T;

        opts.datosGrafica.forEach(item => {
          const ratio = Number(item.valor) / maxVal;
          setFont('normal', 6.5, C.gray700);
          doc.text(String(item.label), barX, bY + 3.5);
          setFont('bold', 6.5, C.black);
          doc.text(String(item.valor), ML + halfW - PAD_H, bY + 3.5, { align: 'right' });
          drawBar(barX, bY + 7, bMaxW, BAR_H, ratio, BAR_R);
          bY += ROW_H;
        });
      }

      // Gráfica 2
      if (opts.datosDistribucion.length > 0) {
        const g2X = ML + halfW + 5;
        const g2H = CHART_HEAD_H + CHART_PAD_T + opts.datosDistribucion.length * ROW_H + CHART_PAD_B;
        fillBorderR(g2X, gY, halfW, g2H, R_CARD, C.bg, C.gray200, 0.3);
        fillR(g2X, gY, halfW, CHART_HEAD_H + R_CARD, R_CARD, HEADER_BG);
        fill(g2X, gY + CHART_HEAD_H, halfW, R_CARD, HEADER_BG);
        setFont('bold', 6, HEADER_TEXT);
        op(0.8);
        cell(opts.tituloGrafica2.toUpperCase(), g2X + halfW / 2, gY + 2, CHART_HEAD_H - 2, { align: 'center' });
        op(1);

        const bMaxW2 = halfW - PAD_H * 2;
        const barX2  = g2X + PAD_H;
        let   dY     = gY + CHART_HEAD_H + CHART_PAD_T;

        opts.datosDistribucion.forEach(item => {
          const ratio = Math.min(Number(item.pct) / 100, 1);
          setFont('normal', 6.5, C.gray700);
          doc.text(String(item.label), barX2, dY + 3.5);
          setFont('bold', 6.5, C.black);
          doc.text(`${item.pct}%`, g2X + halfW - PAD_H, dY + 3.5, { align: 'right' });
          drawBar(barX2, dY + 7, bMaxW2, BAR_H, ratio, BAR_R);
          dY += ROW_H;
        });
      }

      Y = gY + Math.max(
        CHART_HEAD_H + CHART_PAD_T + opts.datosGrafica.length * ROW_H + CHART_PAD_B,
        CHART_HEAD_H + CHART_PAD_T + opts.datosDistribucion.length * ROW_H + CHART_PAD_B
      ) + 10;
    }

    // ── TABLA ─────────────────────────────────────────────────────────────────
    if (opts.datosReporte.length > 0 && opts.columnasTabla.length > 0) {
      checkPage(30);

      setFont('bold', 7, C.gray400);
      doc.text('DETALLE DE REGISTROS', ML, Y);
      setFont('normal', 7, C.gray300);
      doc.text(`${opts.datosReporte.length} registros`, PW - MR, Y, { align: 'right' });
      Y += 5;

      const cols   = opts.columnasTabla;
      const colW   = CW / cols.length;
      const HEAD_H = 9;
      const ROW_H  = 8;
      const R_TBL  = 2;

      fillR(ML, Y, CW, HEAD_H + R_TBL, R_TBL, HEADER_BG);
      fill(ML, Y + HEAD_H, CW, R_TBL, HEADER_BG);
      hline(ML, Y + HEAD_H, ML + CW, ACENTO, 0.5);

      cols.forEach((col, i) => {
        setFont('bold', 6, HEADER_TEXT);
        op(0.8);
        cell(col.toUpperCase(), ML + i * colW + colW / 2, Y, HEAD_H, { align: 'center' });
        if (i > 0) {
          op(0.15);
          vline(ML + i * colW, Y, Y + HEAD_H, HEADER_TEXT, 0.2);
        }
        op(1);
      });
      Y += HEAD_H;

      const tableStartY = Y;

      opts.datosReporte.forEach((fila, fi) => {
        checkPage(ROW_H + 2);
        const vals = opts.filasTabla(fila);

        fill(ML, Y, CW, ROW_H, fi % 2 === 0 ? C.bg : C.white);
        hline(ML, Y + ROW_H, ML + CW, C.gray100, 0.2);

        vals.forEach((val, ci) => {
          const isLast     = ci === vals.length - 1;
          const cx         = ML + ci * colW + colW / 2;
          const displayVal = fmtHorario(String(val ?? ''));

          if (isLast) {
            const bw = Math.min(colW - 6, 28);
            const bx = cx - bw / 2;
            fillBorderR(bx, Y + 1.5, bw, ROW_H - 3, 1.5, C.badgeBg, C.gray200, 0.2);
            setFont('bold', 5.5, C.black);
            cell(displayVal.toUpperCase(), cx, Y + 1.5, ROW_H - 3, { align: 'center' });
          } else {
            setFont(ci === 0 ? 'bold' : 'normal', 6.5, ci === 0 ? C.black : C.gray700);
            const lines = doc.splitTextToSize(displayVal, colW - 4);
            cell(lines[0], cx, Y, ROW_H, { align: 'center' });
          }
        });

        Y += ROW_H;
      });

      borderR(ML, tableStartY - HEAD_H, CW, opts.datosReporte.length * ROW_H + HEAD_H, R_TBL, C.gray200, 0.3);
      Y += 6;
    }

    // ── FOOTER ────────────────────────────────────────────────────────────────
    drawFooter();

    const fecha    = new Date().toISOString().split('T')[0];
    const filename = `CLAB_${opts.modulo.titulo.replace(/\s+/g, '_')}_${fecha}.pdf`;
    doc.save(filename);
  }
}
