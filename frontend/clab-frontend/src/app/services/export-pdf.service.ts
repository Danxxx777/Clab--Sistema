import { Injectable } from '@angular/core';
import { StatModulo, DatoGrafica, ModuloConfig, ExportOptions } from '../interfaces/Reportar.model';

// Paleta de colores profesional para el PDF (tema claro)
const C = {
  primary:    [15,  23,  42]   as [number,number,number],  // slate-900
  accent:     [22,  163, 74]   as [number,number,number],  // green-600
  accentLight:[220, 252, 231]  as [number,number,number],  // green-100
  blue:       [37,  99,  235]  as [number,number,number],  // blue-600
  blueLight:  [219, 234, 254]  as [number,number,number],  // blue-100
  orange:     [234, 88,  12]   as [number,number,number],  // orange-600
  orangeLight:[255, 237, 213]  as [number,number,number],  // orange-100
  red:        [220, 38,  38]   as [number,number,number],  // red-600
  redLight:   [254, 226, 226]  as [number,number,number],  // red-100
  purple:     [147, 51,  234]  as [number,number,number],  // purple-600
  purpleLight:[243, 232, 255]  as [number,number,number],  // purple-100
  cyan:       [8,   145, 178]  as [number,number,number],  // cyan-600
  cyanLight:  [207, 250, 254]  as [number,number,number],  // cyan-100
  yellow:     [161, 98,  7]    as [number,number,number],  // yellow-700
  yellowLight:[254, 249, 195]  as [number,number,number],  // yellow-100
  white:      [255, 255, 255]  as [number,number,number],
  gray50:     [249, 250, 251]  as [number,number,number],
  gray100:    [243, 244, 246]  as [number,number,number],
  gray200:    [229, 231, 235]  as [number,number,number],
  gray400:    [156, 163, 175]  as [number,number,number],
  gray500:    [107, 114, 128]  as [number,number,number],
  gray300:    [209, 213, 219]  as [number,number,number],
  gray700:    [55,  65,  81]   as [number,number,number],
  gray900:    [17,  24,  39]   as [number,number,number],
};

// Color según módulo
const moduloColor: Record<string, [number,number,number]> = {
  neon:     C.accent,
  verde:    C.accent,
  rojo:     C.red,
  azul:     C.blue,
  naranja:  C.orange,
  cyan:     C.cyan,
  amarillo: C.yellow,
  morado:   C.purple,
};
const moduloColorLight: Record<string, [number,number,number]> = {
  neon:     C.accentLight,
  verde:    C.accentLight,
  rojo:     C.redLight,
  azul:     C.blueLight,
  naranja:  C.orangeLight,
  cyan:     C.cyanLight,
  amarillo: C.yellowLight,
  morado:   C.purpleLight,
};

@Injectable({ providedIn: 'root' })
export class ExportPdfService {

  async exportar(opts: ExportOptions): Promise<void> {
    // Carga dinámica de jsPDF para no aumentar el bundle inicial
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PW  = 210;   // page width
    const PH  = 297;   // page height
    const ML  = 14;    // margin left
    const MR  = 14;    // margin right
    const CW  = PW - ML - MR;  // content width
    let   Y   = 0;     // cursor Y

    const color  = moduloColor[opts.modulo.color]      ?? C.accent;
    const colorL = moduloColorLight[opts.modulo.color] ?? C.accentLight;

    // ── Helpers ──────────────────────────────────────────────────────────────

    const setFont = (style: 'normal'|'bold', size: number, rgb: [number,number,number]) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    };

    const rect = (x: number, y: number, w: number, h: number, rgb: [number,number,number], r = 0) => {
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      if (r > 0) doc.roundedRect(x, y, w, h, r, r, 'F');
      else       doc.rect(x, y, w, h, 'F');
    };

    const line = (x1: number, y1: number, x2: number, y2: number, rgb: [number,number,number], lw = 0.3) => {
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setLineWidth(lw);
      doc.line(x1, y1, x2, y2);
    };

    const text = (t: string, x: number, y: number, opts2?: any) => {
      doc.text(t, x, y, opts2);
    };

    const checkPage = (needed: number) => {
      if (Y + needed > PH - 14) {
        doc.addPage();
        Y = 14;
        drawFooter();
      }
    };

    const wrapText = (str: string, maxW: number, fontSize: number): string[] => {
      doc.setFontSize(fontSize);
      return doc.splitTextToSize(str, maxW);
    };

    const drawFooter = () => {
      const pg = doc.getCurrentPageInfo().pageNumber;
      const total = (doc as any).internal.getNumberOfPages?.() ?? pg;
      rect(0, PH - 10, PW, 10, C.gray50);
      line(0, PH - 10, PW, PH - 10, C.gray200);
      setFont('normal', 7, C.gray400);
      text('CLAB — Sistema de Laboratorios', ML, PH - 4);
      text(`Generado: ${new Date().toLocaleString('es-EC')}`, PW/2, PH - 4, { align: 'center' });
      text(`Página ${pg}`, PW - MR, PH - 4, { align: 'right' });
    };

    // ── PORTADA / HEADER ─────────────────────────────────────────────────────

    // Banda superior con color del módulo
    rect(0, 0, PW, 42, color);

    // Decoración geométrica
    doc.setFillColor(255, 255, 255);
    doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
    doc.circle(PW - 20, -10, 40, 'F');
    doc.circle(PW - 5,  30,  25, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Logo / Brand
    setFont('bold', 22, C.white);
    text('CLAB', ML, 17);

    setFont('normal', 8, C.white);
    doc.setTextColor(255, 255, 255);
    doc.setGState(new (doc as any).GState({ opacity: 0.75 }));
    text('SISTEMA DE LABORATORIOS', ML, 23);
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Título del reporte
    setFont('bold', 16, C.white);
    text(`Reporte: ${opts.modulo.titulo}`, ML, 35);

    // Chips de meta info
    Y = 50;
    const chips: string[] = [];
    if (opts.filtros.fechaInicio && opts.filtros.fechaFin)
      chips.push(`📅 ${opts.filtros.fechaInicio}  →  ${opts.filtros.fechaFin}`);
    if (opts.nombreLaboratorio)
      chips.push(`🏫 ${opts.nombreLaboratorio}`);
    if (opts.filtros.estado)
      chips.push(`Estado: ${opts.filtros.estado}`);
    chips.push(`👤 ${opts.usuarioLogueado}`);

    let chipX = ML;
    chips.forEach(chip => {
      const tw = doc.getTextWidth(chip) + 8;
      rect(chipX, Y, tw, 7, colorL, 3);
      setFont('normal', 7, color);
      text(chip, chipX + 4, Y + 5);
      chipX += tw + 4;
      if (chipX > PW - MR - 20) { chipX = ML; Y += 10; }
    });

    Y += 14;

    // Línea divisoria decorativa
    line(ML, Y, PW - MR, Y, C.gray200, 0.4);
    Y += 6;

    drawFooter();

    // ── ESTADÍSTICAS ─────────────────────────────────────────────────────────
    if (opts.statsModulo.length > 0) {
      checkPage(32);

      // Título sección
      setFont('bold', 9, C.gray500);
      text('ESTADÍSTICAS GENERALES', ML, Y);
      Y += 5;

      const statW   = (CW - (opts.statsModulo.length - 1) * 4) / Math.min(opts.statsModulo.length, 4);
      const statH   = 20;
      let   statX   = ML;
      let   rowBase = Y;

      opts.statsModulo.forEach((s, i) => {
        if (i > 0 && i % 4 === 0) {
          rowBase += statH + 4;
          statX    = ML;
          checkPage(statH + 4);
        }

        // Card fondo
        rect(statX, rowBase, statW, statH, C.gray50, 3);
        doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(statX, rowBase, statW, statH, 3, 3, 'S');

        // Barra color izquierda
        rect(statX, rowBase, 3, statH, color, 0);

        // Valor
        setFont('bold', 14, C.gray900);
        text(String(s.valor), statX + 7, rowBase + 12);

        // Label
        setFont('normal', 6.5, C.gray500);
        const labelLines = wrapText(s.label.toUpperCase(), statW - 10, 6.5);
        labelLines.forEach((ln, li) => text(ln, statX + 7, rowBase + 17 + li * 3.5));

        statX += statW + 4;
      });

      Y = rowBase + statH + 8;
    }

    // ── GRÁFICAS ─────────────────────────────────────────────────────────────

    if (opts.datosGrafica.length > 0 || opts.datosDistribucion.length > 0) {
      checkPage(80);

      setFont('bold', 9, C.gray500);
      text('VISUALIZACIÓN DE DATOS', ML, Y);
      Y += 5;

      const halfW = (CW - 6) / 2;

      // ── Gráfica 1: Barras horizontales ────────────────────────────────────
      if (opts.datosGrafica.length > 0) {
        const g1H = 10 + opts.datosGrafica.length * 11 + 6;
        rect(ML, Y, halfW, g1H, C.white, 3);
        doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
        doc.roundedRect(ML, Y, halfW, g1H, 3, 3, 'S');

        setFont('bold', 7.5, C.gray700);
        text(opts.tituloGrafica1.toUpperCase(), ML + 5, Y + 7);

        let bY = Y + 12;
        const maxVal = Math.max(...opts.datosGrafica.map(d => d.valor), 1);

        opts.datosGrafica.forEach(item => {
          const labelW  = 32;
          const barMaxW = halfW - labelW - 22;
          const barW    = (item.pct / 100) * barMaxW;
          const valX    = ML + 5 + labelW + barMaxW + 4;

          setFont('normal', 6.5, C.gray500);
          // truncate label
          const lbl = item.label.length > 14 ? item.label.substring(0,13)+'…' : item.label;
          text(lbl, ML + 5 + labelW, bY + 3.5, { align: 'right' });

          // track
          rect(ML + 5 + labelW + 2, bY + 1, barMaxW, 5, C.gray100, 1);
          // fill
          if (barW > 0) rect(ML + 5 + labelW + 2, bY + 1, barW, 5, color, 1);

          setFont('bold', 6, C.gray700);
          text(String(item.valor), valX, bY + 4.5);

          bY += 11;
        });
      }

      // ── Gráfica 2: Distribución (barras horizontales con %) ───────────────
      if (opts.datosDistribucion.length > 0) {
        const colores: [number,number,number][] = [color, C.blue, C.orange, C.red, C.purple, C.cyan, [245,158,11], [16,185,129]];
        const g2X = ML + halfW + 6;
        const g2H = 10 + opts.datosDistribucion.length * 13 + 6;

        rect(g2X, Y, halfW, g2H, C.white, 3);
        doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
        doc.roundedRect(g2X, Y, halfW, g2H, 3, 3, 'S');

        setFont('bold', 7.5, C.gray700);
        text(opts.tituloGrafica2.toUpperCase(), g2X + 5, Y + 7);

        let dY = Y + 12;
        opts.datosDistribucion.forEach((item, i) => {
          const clr = colores[i % colores.length];
          const barMaxW = halfW - 14;
          const barW    = (item.pct / 100) * barMaxW;

          // dot
          doc.setFillColor(clr[0], clr[1], clr[2]);
          doc.circle(g2X + 5 + 2, dY + 2, 2, 'F');

          // label
          setFont('bold', 6.5, C.gray700);
          text(item.label, g2X + 11, dY + 3.5);

          // pct badge
          setFont('bold', 6.5, clr);
          text(`${item.pct}%`, g2X + halfW - 5, dY + 3.5, { align: 'right' });

          // bar track
          rect(g2X + 5, dY + 6, barMaxW, 4, C.gray100, 1);
          if (barW > 0) rect(g2X + 5, dY + 6, barW, 4, clr, 1);

          dY += 13;
        });
      }

      Y += Math.max(
        10 + opts.datosGrafica.length      * 11 + 8,
        10 + opts.datosDistribucion.length * 13 + 8
      );
    }

    // ── TABLA DE DETALLE ─────────────────────────────────────────────────────
    if (opts.datosReporte.length > 0 && opts.columnasTabla.length > 0) {
      checkPage(30);

      setFont('bold', 9, C.gray500);
      text('DETALLE DE REGISTROS', ML, Y);
      setFont('normal', 7, C.gray400);
      text(`${opts.datosReporte.length} registros`, PW - MR, Y, { align: 'right' });
      Y += 5;

      const cols    = opts.columnasTabla;
      const numCols = cols.length;
      const colW    = CW / numCols;
      const rowH    = 8;
      const headH   = 9;

      // Cabecera
      rect(ML, Y, CW, headH, color, 2);
      cols.forEach((col, i) => {
        setFont('bold', 6.5, C.white);
        text(col, ML + i * colW + colW / 2, Y + 6, { align: 'center' });
      });
      Y += headH;

      // Filas
      opts.datosReporte.forEach((fila, fi) => {
        checkPage(rowH + 2);

        const vals = opts.filasTabla(fila);

        // Fondo alternado
        rect(ML, Y, CW, rowH, fi % 2 === 0 ? C.white : C.gray50, 0);

        // Borde fila
        doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
        doc.setLineWidth(0.2);
        doc.line(ML, Y + rowH, ML + CW, Y + rowH);

        vals.forEach((val, ci) => {
          const isLast = ci === vals.length - 1;
          const cellX  = ML + ci * colW;
          const cellCX = cellX + colW / 2;

          if (isLast) {
            // Badge de estado
            const bw   = Math.min(colW - 4, 30);
            const bx   = cellCX - bw / 2;
            const brgb = this.badgeRgb(val);
            rect(bx, Y + 1.5, bw, rowH - 3, brgb.bg, 2);
            setFont('bold', 5.5, brgb.text);
            text(val, cellCX, Y + rowH - 2.5, { align: 'center' });
          } else {
            setFont(ci === 0 ? 'bold' : 'normal', 6.5, ci === 0 ? C.gray900 : C.gray700);
            // Truncar texto largo
            const maxW  = colW - 4;
            const lines = doc.splitTextToSize(String(val), maxW);
            text(lines[0], cellCX, Y + rowH - 2.5, { align: 'center' });
          }
        });

        Y += rowH;
      });

      // Borde exterior tabla
      doc.setDrawColor(...C.gray300);
      doc.setLineWidth(0.4);
      doc.rect(ML, Y - opts.datosReporte.length * rowH - headH, CW, opts.datosReporte.length * rowH + headH, 'S');

      Y += 6;
    }

    // ── NOTA AL PIE ──────────────────────────────────────────────────────────
    checkPage(16);
    rect(ML, Y, CW, 14, C.gray50, 3);
    doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
    doc.roundedRect(ML, Y, CW, 14, 3, 3, 'S');
    setFont('normal', 6.5, C.gray500);
    text('Este reporte fue generado automáticamente por el Sistema CLAB.', ML + 5, Y + 5.5);
    text('La información aquí contenida es de carácter confidencial y de uso exclusivo institucional.', ML + 5, Y + 10);

    // Actualiza footer en todas las páginas
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawFooter();
    }

    // ── GUARDAR ──────────────────────────────────────────────────────────────
    const fecha    = new Date().toISOString().split('T')[0];
    const filename = `CLAB_${opts.modulo.titulo.replace(/\s+/g,'_')}_${fecha}.pdf`;
    doc.save(filename);
  }

  // ── Colores para badges ───────────────────────────────────────────────────
  private badgeRgb(estado: string): { bg: [number,number,number]; text: [number,number,number] } {
    const e = (estado || '').toUpperCase();
    if (['COMPLETADA','OPERATIVO','ACTIVO','ACTIVA','APROBADA','LIBERADO','RESUELTO'].some(x => e.includes(x)))
      return { bg: C.accentLight, text: C.accent };
    if (['MANTENIMIENTO','PENDIENTE','EN PROCESO'].some(x => e.includes(x)))
      return { bg: C.orangeLight, text: C.orange };
    if (e.match(/^\d+%$/)) {
      const v = parseFloat(e);
      if (v >= 85) return { bg: C.accentLight, text: C.accent };
      if (v >= 70) return { bg: C.orangeLight, text: C.orange };
      return { bg: C.redLight, text: C.red };
    }
    return { bg: C.redLight, text: C.red };
  }
}
