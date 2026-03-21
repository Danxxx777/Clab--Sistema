import { Injectable } from '@angular/core';
import { ExportOptions } from '../interfaces/Reportar.model';

const C_DEFAULT = {
  black:    'FF111111',
  black2:   'FF1A1A1A',
  black3:   'FF2A2A2A',
  neon:     'FF39FF14',
  neonDark: 'FF2ACC10',
  white:    'FFFFFFFF',
  gray50:   'FFF9FAFB',
  gray100:  'FFF3F4F6',
  gray200:  'FFE5E7EB',
  gray400:  'FF9CA3AF',
  gray500:  'FF6B7280',
  gray700:  'FF374151',
  gray900:  'FF111827',
  greenBg:  'FFD1FAE5',
  greenFg:  'FF065F46',
  orangeBg: 'FFFFEDD5',
  orangeFg: 'FF9A3412',
  redBg:    'FFFEE2E2',
  redFg:    'FF991B1B',
};

const W = 8;

@Injectable({ providedIn: 'root' })
export class ExportExcelService {

  private C = { ...C_DEFAULT };

  private toArgb(hex: string): string {
    return 'FF' + hex.replace('#', '').toUpperCase();
  }

  private toHex(argb: string): string {
    return '#' + argb.slice(2);
  }

  private lightenArgb(hex: string, amount: number): string {
    const clean = hex.replace('#', '');
    const num   = parseInt(clean, 16);
    let r = ((num >> 16) & 0xff) + amount;
    let g = ((num >>  8) & 0xff) + amount;
    let b = ((num      ) & 0xff) + amount;
    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);
    return 'FF' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
  }

  private generarBarras(
    labels: string[], valores: number[], titulo: string,
    colorAcento: string, colorFondo: string
  ): string {
    const canvas  = document.createElement('canvas');
    canvas.width  = 600;
    canvas.height = 320;
    const ctx     = canvas.getContext('2d')!;

    ctx.fillStyle = colorFondo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const esClaroFondo = this.esColorClaro(colorFondo);
    const colorTexto   = esClaroFondo ? '#111111' : '#ffffff';
    const colorGuia    = esClaroFondo ? '#dddddd' : '#2a2a2a';
    const colorLabel   = esClaroFondo ? '#555555' : '#9ca3af';

    ctx.fillStyle = colorTexto;
    ctx.font      = 'bold 14px Calibri';
    ctx.textAlign = 'center';
    ctx.fillText(titulo, canvas.width / 2, 24);

    const pad    = { top: 50, bottom: 50, left: 60, right: 20 };
    const chartW = canvas.width  - pad.left - pad.right;
    const chartH = canvas.height - pad.top  - pad.bottom;
    const maxVal = Math.max(...valores, 1);
    const barW   = chartW / labels.length * 0.6;
    const gap    = chartW / labels.length;

    ctx.strokeStyle = colorGuia;
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (chartH / 4 * i);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = colorLabel;
      ctx.font      = '10px Calibri';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxVal / 4 * i)), pad.left - 6, y + 4);
    }

    labels.forEach((lbl, i) => {
      const barH = (valores[i] / maxVal) * chartH;
      const x    = pad.left + gap * i + (gap - barW) / 2;
      const y    = pad.top  + chartH - barH;

      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x + 3, y + 3, barW, barH);

      ctx.fillStyle = colorAcento;
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = colorTexto;
      ctx.font      = 'bold 11px Calibri';
      ctx.textAlign = 'center';
      ctx.fillText(String(valores[i]), x + barW / 2, y - 6);

      ctx.fillStyle = colorLabel;
      ctx.font      = '9px Calibri';
      const maxLbl  = 12;
      const lblText = lbl.length > maxLbl ? lbl.slice(0, maxLbl) + '…' : lbl;
      ctx.fillText(lblText, x + barW / 2, pad.top + chartH + 16);
    });

    return canvas.toDataURL('image/png');
  }

  private generarPastel(
    labels: string[], valores: number[], titulo: string, colorFondo: string
  ): string {
    const canvas  = document.createElement('canvas');
    canvas.width  = 600;
    canvas.height = 320;
    const ctx     = canvas.getContext('2d')!;

    const COLORES = ['#39ff14','#3b82f6','#e67e22','#e74c3c','#a855f7','#06b6d4','#f59e0b','#10b981'];

    ctx.fillStyle = colorFondo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const esClaroFondo = this.esColorClaro(colorFondo);
    const colorTexto   = esClaroFondo ? '#111111' : '#ffffff';
    const colorLabel   = esClaroFondo ? '#555555' : '#ffffff';

    ctx.fillStyle = colorTexto;
    ctx.font      = 'bold 14px Calibri';
    ctx.textAlign = 'center';
    ctx.fillText(titulo, canvas.width / 2, 24);

    const total  = valores.reduce((a, b) => a + b, 0) || 1;
    const cx     = 180;
    const cy     = 170;
    const radio  = 110;
    let   angulo = -Math.PI / 2;

    valores.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radio, angulo, angulo + slice);
      ctx.closePath();
      ctx.fillStyle   = COLORES[i % COLORES.length];
      ctx.fill();
      ctx.strokeStyle = colorFondo;
      ctx.lineWidth   = 2;
      ctx.stroke();

      const midA = angulo + slice / 2;
      const tx   = cx + Math.cos(midA) * radio * 0.65;
      const ty   = cy + Math.sin(midA) * radio * 0.65;
      const pct  = Math.round(val / total * 100);
      if (pct > 4) {
        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 11px Calibri';
        ctx.textAlign = 'center';
        ctx.fillText(`${pct}%`, tx, ty + 4);
      }
      angulo += slice;
    });

    const legendX = 320;
    labels.forEach((lbl, i) => {
      const ly  = 60 + i * 26;
      ctx.fillStyle = COLORES[i % COLORES.length];
      ctx.fillRect(legendX, ly, 14, 14);
      ctx.fillStyle = colorLabel;
      ctx.font      = '11px Calibri';
      ctx.textAlign = 'left';
      const pct     = Math.round(valores[i] / total * 100);
      ctx.fillText(`${lbl} — ${valores[i]} (${pct}%)`, legendX + 20, ly + 11);
    });

    return canvas.toDataURL('image/png');
  }

// Detecta si un color hex es claro u oscuro
  private esColorClaro(hex: string): boolean {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 128;
  }

  private dataUrlToBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const bin    = atob(base64);
    const buf    = new ArrayBuffer(bin.length);
    const view   = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
    return buf;
  }

  async exportar(opts: ExportOptions): Promise<void> {
    const ExcelJS = (await import('exceljs')).default ?? await import('exceljs');
    const wb      = new ExcelJS.Workbook();

    // ── Colores personalizados ──────────────────────────────
    this.C = { ...C_DEFAULT };
    if (opts.colorFondo) {
      this.C.black  = this.toArgb(opts.colorFondo);
      this.C.black2 = this.lightenArgb(opts.colorFondo, 8);
      this.C.black3 = this.lightenArgb(opts.colorFondo, 16);
    }
    if (opts.colorAcento) {
      this.C.neon     = this.toArgb(opts.colorAcento);
      this.C.neonDark = this.toArgb(opts.colorAcento);
    }
    if (opts.temaOscuro === false) {
      this.C.black   = 'FFFFFFFF';  // fondo principal → blanco
      this.C.black2  = 'FFF8F8F8';  // fondo secundario → gris muy claro
      this.C.black3  = 'FFE5E7EB';  // separadores → gris claro
      this.C.white   = 'FF111111';  // texto principal → negro
      this.C.gray50  = 'FFF3F4F6';  // filas alternas
      this.C.gray100 = 'FFE5E7EB';  // celda label metadata
      this.C.gray900 = C_DEFAULT.gray900;
      this.C.gray700 = C_DEFAULT.gray700;
      this.C.gray500 = C_DEFAULT.gray500;
      this.C.gray400 = C_DEFAULT.gray400;
    }

    const acentoHex = this.toHex(this.C.neon);

    let logoId: number | null = null;
    try {
      const resp = await fetch('/LogoUTEQ.png');
      if (resp.ok) logoId = wb.addImage({ buffer: await resp.arrayBuffer(), extension: 'png' });
    } catch { }

    // ═══════════════════════════════════════════════════════
    // HOJA 1 — RESUMEN
    // ═══════════════════════════════════════════════════════
    if (opts.incluirResumen !== false) {
      const ws = wb.addWorksheet('Resumen');
      ws.columns = [
        { width: 26 }, { width: 22 }, { width: 16 }, { width: 16 },
        { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 },
      ];
      let R = 1;

      this.rowFill(ws, R, W, this.C.black);
      ws.getRow(R).height = 40;
      const cClab = ws.getCell(R, 1);
      cClab.value     = 'CLAB';
      cClab.font      = { bold: true, size: 22, color: { argb: this.C.neon }, name: 'Calibri' };
      cClab.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.mergeCells(R, 1, R, W);
      R++;

      this.rowFill(ws, R, W, this.C.black);
      ws.getRow(R).height = 16;
      const cSub = ws.getCell(R, 1);
      cSub.value     = 'SISTEMA DE LABORATORIOS  ·  UTEQ';
      cSub.font      = { size: 9, color: { argb: this.C.gray500 }, name: 'Calibri' };
      cSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.mergeCells(R, 1, R, W);
      R++;

      if (logoId !== null) {
        ws.addImage(logoId, {
          tl: { col: W - 1, row: 0 } as any,
          br: { col: W,     row: 2 } as any,
          editAs: 'absolute',
        });
      }

      this.rowFill(ws, R, W, this.C.neon);
      ws.getRow(R).height = 4;
      R++;

      this.rowFill(ws, R, W, this.C.black2);
      ws.getRow(R).height = 26;
      const cTit = ws.getCell(R, 1);
      cTit.value     = `Reporte: ${opts.modulo.titulo}`;
      cTit.font      = { bold: true, size: 14, color: { argb: this.C.white }, name: 'Calibri' };
      cTit.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.mergeCells(R, 1, R, W);
      R++;

      this.rowFill(ws, R, W, this.C.black2);
      ws.getRow(R).height = 16;
      const cDesc = ws.getCell(R, 1);
      cDesc.value     = opts.modulo.desc;
      cDesc.font      = { italic: true, size: 9, color: { argb: this.C.gray400 }, name: 'Calibri' };
      cDesc.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws.mergeCells(R, 1, R, W);
      R++;

      this.rowFill(ws, R, W, this.C.black3);
      ws.getRow(R).height = 4;
      R++;

      this.rowFill(ws, R, W, this.C.white);
      ws.getRow(R).height = 8;
      R++;

      this.sectionHeader(ws, R, W, 'INFORMACIÓN DEL REPORTE', this.C.neon, this.C.neonDark, this.C.black);
      R++;

      const metaItems: [string, string][] = [
        ['Laboratorio',  opts.nombreLaboratorio || 'Todos'],
        ['Período',      opts.filtros.fechaInicio && opts.filtros.fechaFin
          ? `${opts.filtros.fechaInicio}  →  ${opts.filtros.fechaFin}` : 'Sin filtro'],
        ['Estado',       opts.filtros.estado || 'Todos'],
        ['Generado por', opts.usuarioLogueado],
        ['Fecha',        new Date().toLocaleString('es-EC')],
      ];

      metaItems.forEach(([lbl, val]) => {
        ws.getRow(R).height = 16;
        for (let i = 1; i <= W; i++) {
          ws.getCell(R, i).fill   = this.fill(i === 1 ? this.C.gray100 : this.C.white);
          ws.getCell(R, i).border = this.border(this.C.gray200);
        }
        const cL = ws.getCell(R, 1);
        cL.value     = lbl;
        cL.font      = { bold: true, size: 9, color: { argb: this.C.gray500 }, name: 'Calibri' };
        cL.alignment = { vertical: 'middle', indent: 1 };
        const cV = ws.getCell(R, 2);
        cV.value     = val;
        cV.font      = { size: 9, color: { argb: this.C.gray900 }, name: 'Calibri' };
        cV.alignment = { vertical: 'middle', indent: 1 };
        ws.mergeCells(R, 2, R, W);
        R++;
      });

      this.rowFill(ws, R, W, this.C.white);
      ws.getRow(R).height = 8;
      R++;

      if (opts.statsModulo.length > 0) {
        this.sectionHeader(ws, R, W, 'RESUMEN DEL PERÍODO', this.C.black, this.C.black3, this.C.neon);
        R++;
        const n = opts.statsModulo.length;
        this.setStatColumns(ws, n, W);

        ws.getRow(R).height = 14;
        for (let col = 1; col <= W; col++) {
          const cc  = ws.getCell(R, col);
          cc.fill   = this.fill(this.C.black2);
          cc.border = this.border(this.C.black3);
          const stat = this.colToStat(col, n, W);
          if (this.isFirstColOfStat(col, n, W)) {
            cc.value     = opts.statsModulo[stat].label.toUpperCase();
            cc.font      = { bold: true, size: 7, color: { argb: this.C.gray400 }, name: 'Calibri' };
            cc.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        }
        this.mergeStatGroups(ws, R, n, W);
        R++;

        ws.getRow(R).height = 36;
        for (let col = 1; col <= W; col++) {
          const cc  = ws.getCell(R, col);
          cc.fill   = this.fill(this.C.black2);
          cc.border = this.border(this.C.black3);
          const stat = this.colToStat(col, n, W);
          if (this.isFirstColOfStat(col, n, W)) {
            cc.value     = opts.statsModulo[stat].valor;
            cc.font      = { bold: true, size: 24, color: { argb: this.C.white }, name: 'Calibri' };
            cc.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        }
        this.mergeStatGroups(ws, R, n, W);
        R++;

        this.rowFill(ws, R, W, this.C.white);
        ws.getRow(R).height = 8;
        R++;
      }

      this.rowFill(ws, R, W, this.C.white);
      ws.getRow(R).height = 8;
      R++;

      if (opts.datosGrafica.length > 0) {
        this.sectionHeader(ws, R, W, opts.tituloGrafica1.toUpperCase(), this.C.black, this.C.black3, this.C.white);
        R++;
        this.tableHead(ws, R, W, ['CATEGORÍA', 'CANTIDAD', '% RELATIVO']);
        R++;
        opts.datosGrafica.forEach((d, ri) => {
          this.tableRow(ws, R, W, [d.label, d.valor, `${d.pct}%`], ri % 2 === 0);
          R++;
        });
        this.rowFill(ws, R, W, this.C.white);
        ws.getRow(R).height = 8;
        R++;
      }

      if (opts.datosDistribucion.length > 0) {
        this.sectionHeader(ws, R, W, opts.tituloGrafica2.toUpperCase(), this.C.black, this.C.black3, this.C.white);
        R++;
        this.tableHead(ws, R, W, ['CATEGORÍA', 'CANTIDAD', '% DISTRIBUCIÓN']);
        R++;
        opts.datosDistribucion.forEach((d, ri) => {
          this.tableRow(ws, R, W, [d.label, d.valor, `${d.pct}%`], ri % 2 === 0);
          R++;
        });
      }
    }

    // ═══════════════════════════════════════════════════════
    // HOJA 2 — DETALLE
    // ═══════════════════════════════════════════════════════
    if (opts.datosReporte.length > 0 && opts.columnasTabla.length > 0) {
      const ws2  = wb.addWorksheet('Detalle');
      const cols = opts.columnasTabla;
      const DW   = W;
      let R2 = 1;

      ws2.columns = cols.map((col, i) => ({
        width: Math.max(col.length, ...opts.datosReporte.map(f => String(opts.filasTabla(f)[i] ?? '').length), 10) + 3,
      }));

      this.rowFill(ws2, R2, DW, this.C.black);
      ws2.getRow(R2).height = 30;
      const ch = ws2.getCell(R2, 1);
      ch.value     = `CLAB — ${opts.modulo.titulo.toUpperCase()}`;
      ch.font      = { bold: true, size: 14, color: { argb: this.C.neon }, name: 'Calibri' };
      ch.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws2.mergeCells(R2, 1, R2, DW);
      R2++;

      this.rowFill(ws2, R2, DW, this.C.black2);
      ws2.getRow(R2).height = 14;
      const cs = ws2.getCell(R2, 1);
      cs.value     = `${opts.datosReporte.length} registros  ·  ${new Date().toLocaleString('es-EC')}  ·  ${opts.usuarioLogueado}`;
      cs.font      = { size: 8, color: { argb: this.C.gray400 }, name: 'Calibri' };
      cs.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws2.mergeCells(R2, 1, R2, DW);
      R2++;

      this.rowFill(ws2, R2, DW, this.C.neon);
      ws2.getRow(R2).height = 4;
      R2++;

      this.rowFill(ws2, R2, DW, this.C.white);
      ws2.getRow(R2).height = 8;
      R2++;

      ws2.getRow(R2).height = 18;
      for (let i = 1; i <= DW; i++) {
        ws2.getCell(R2, i).fill   = this.fill(this.C.black);
        ws2.getCell(R2, i).border = this.border(this.C.black3);
      }
      cols.forEach((col, ci) => {
        const cell     = ws2.getCell(R2, ci + 1);
        cell.value     = col.toUpperCase();
        cell.font      = { bold: true, size: 9, color: { argb: this.C.white }, name: 'Calibri' };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      if (DW > cols.length) ws2.mergeCells(R2, cols.length, R2, DW);
      R2++;

      opts.datosReporte.forEach((fila, fi) => {
        const vals = opts.filasTabla(fila);
        const even = fi % 2 === 0;
        const bg   = even ? this.C.white : this.C.gray50;
        ws2.getRow(R2).height = 15;

        for (let i = 1; i <= DW; i++) {
          ws2.getCell(R2, i).fill   = this.fill(bg);
          ws2.getCell(R2, i).border = this.border(this.C.gray200);
        }

        vals.forEach((val, ci) => {
          const isLast = ci === vals.length - 1;
          const cell   = ws2.getCell(R2, ci + 1);
          if (isLast) {
            const bs       = this.badgeStyle(String(val));
            const startCol = ci + 1;
            cell.value     = String(val).toUpperCase();
            cell.font      = { bold: true, size: 8, color: { argb: bs.text }, name: 'Calibri' };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            for (let j = startCol; j <= DW; j++) {
              ws2.getCell(R2, j).fill   = this.fill(bs.bg);
              ws2.getCell(R2, j).border = this.border(this.C.gray200);
            }
            if (DW > startCol) ws2.mergeCells(R2, startCol, R2, DW);
          } else {
            cell.value     = val;
            cell.font      = { bold: ci === 0, size: 9, color: { argb: this.C.gray700 }, name: 'Calibri' };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });
        R2++;
      });
    }

    // ═══════════════════════════════════════════════════════
// HOJA 3 — GRÁFICOS
// ═══════════════════════════════════════════════════════
    if (opts.incluirResumen !== false &&
      (opts.datosGrafica.length > 0 || opts.datosDistribucion.length > 0)) {

      const fondoHex = opts.colorFondo ?? (opts.temaOscuro === false ? '#ffffff' : '#1a1a1a');

      const ws3 = wb.addWorksheet('Gráficos');
      ws3.columns = Array(12).fill(null).map(() => ({ width: 10 }));
      let R3 = 1;

      this.rowFill(ws3, R3, 12, this.C.black);
      ws3.getRow(R3).height = 30;
      const cgt = ws3.getCell(R3, 1);
      cgt.value     = `CLAB  ·  ${opts.modulo.titulo.toUpperCase()}  ·  ANÁLISIS VISUAL`;
      cgt.font      = { bold: true, size: 13, color: { argb: this.C.neon }, name: 'Calibri' };
      cgt.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws3.mergeCells(R3, 1, R3, 12);
      R3++;

      this.rowFill(ws3, R3, 12, this.C.neon);
      ws3.getRow(R3).height = 3;
      R3++;

      this.rowFill(ws3, R3, 12, this.C.black);
      ws3.getRow(R3).height = 8;
      R3++;

      if (opts.datosGrafica.length > 0) {
        const imgBarras = this.generarBarras(
          opts.datosGrafica.map(d => d.label),
          opts.datosGrafica.map(d => d.valor),
          opts.tituloGrafica1,
          acentoHex,
          fondoHex
        );
        const idBarras = wb.addImage({ buffer: this.dataUrlToBuffer(imgBarras), extension: 'png' });
        ws3.addImage(idBarras, {
          tl: { col: 0, row: R3 - 1 } as any,
          br: { col: 7, row: R3 + 15 } as any,
          editAs: 'absolute',
        });

        ws3.getRow(R3).height = 14;
        const lbl1 = ws3.getCell(R3, 9);
        lbl1.value     = opts.tituloGrafica1;
        lbl1.font      = { bold: true, size: 10, color: { argb: this.C.neon }, name: 'Calibri' };
        lbl1.alignment = { vertical: 'middle' };
        ws3.mergeCells(R3, 9, R3, 12);
        R3++;

        this.tableHead(ws3, R3, 4, ['Categoría', 'Cant.', '%']);
        R3++;
        opts.datosGrafica.forEach((d, ri) => {
          ws3.getRow(R3).height = 14;
          const bg = ri % 2 === 0 ? this.C.black2 : this.C.black;
          [9, 10, 11].forEach(c => {
            ws3.getCell(R3, c).fill   = this.fill(bg);
            ws3.getCell(R3, c).border = this.border(this.C.black3);
          });
          ws3.getCell(R3, 9).value      = d.label;
          ws3.getCell(R3, 9).font       = { size: 9, color: { argb: this.C.white }, name: 'Calibri' };
          ws3.getCell(R3, 10).value     = d.valor;
          ws3.getCell(R3, 10).font      = { bold: true, size: 9, color: { argb: this.C.neon }, name: 'Calibri' };
          ws3.getCell(R3, 10).alignment = { horizontal: 'center' };
          ws3.getCell(R3, 11).value     = `${d.pct}%`;
          ws3.getCell(R3, 11).font      = { size: 9, color: { argb: this.C.gray400 }, name: 'Calibri' };
          ws3.getCell(R3, 11).alignment = { horizontal: 'center' };
          R3++;
        });

        R3 += 18; // ← espacio suficiente para separar las dos imágenes
      }

      if (opts.datosDistribucion.length > 0) {
        this.rowFill(ws3, R3, 12, this.C.black3);
        ws3.getRow(R3).height = 3;
        R3++;

        const imgPastel = this.generarPastel(
          opts.datosDistribucion.map(d => d.label),
          opts.datosDistribucion.map(d => d.valor),
          opts.tituloGrafica2,
          fondoHex
        );
        const idPastel = wb.addImage({ buffer: this.dataUrlToBuffer(imgPastel), extension: 'png' });
        ws3.addImage(idPastel, {
          tl: { col: 0, row: R3 - 1 } as any,
          br: { col: 7, row: R3 + 15 } as any,
          editAs: 'absolute',
        });

        ws3.getRow(R3).height = 14;
        const lbl2 = ws3.getCell(R3, 9);
        lbl2.value     = opts.tituloGrafica2;
        lbl2.font      = { bold: true, size: 10, color: { argb: this.C.neon }, name: 'Calibri' };
        lbl2.alignment = { vertical: 'middle' };
        ws3.mergeCells(R3, 9, R3, 12);
        R3++;

        this.tableHead(ws3, R3, 4, ['Estado', 'Cant.', '%']);
        R3++;
        opts.datosDistribucion.forEach((d, ri) => {
          ws3.getRow(R3).height = 14;
          const bg = ri % 2 === 0 ? this.C.black2 : this.C.black;
          [9, 10, 11].forEach(c => {
            ws3.getCell(R3, c).fill   = this.fill(bg);
            ws3.getCell(R3, c).border = this.border(this.C.black3);
          });
          ws3.getCell(R3, 9).value      = d.label;
          ws3.getCell(R3, 9).font       = { size: 9, color: { argb: this.C.white }, name: 'Calibri' };
          ws3.getCell(R3, 10).value     = d.valor;
          ws3.getCell(R3, 10).font      = { bold: true, size: 9, color: { argb: this.C.neon }, name: 'Calibri' };
          ws3.getCell(R3, 10).alignment = { horizontal: 'center' };
          ws3.getCell(R3, 11).value     = `${d.pct}%`;
          ws3.getCell(R3, 11).font      = { size: 9, color: { argb: this.C.gray400 }, name: 'Calibri' };
          ws3.getCell(R3, 11).alignment = { horizontal: 'center' };
          R3++;
        });
      }
    }

    // ═══════════════════════════════════════════════════════
    // Descargar
    // ═══════════════════════════════════════════════════════
    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = `CLAB_${opts.modulo.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Stats helpers ───────────────────────────────────────────────────────────

  private setStatColumns(ws: any, n: number, w: number): void {
    const totalW      = [26, 22, 16, 16, 14, 14, 14, 14].slice(0, w).reduce((a, b) => a + b, 0);
    const colsPerStat = w / n;
    if (Number.isInteger(colsPerStat)) {
      const colW = (totalW / n) / colsPerStat;
      for (let i = 1; i <= w; i++) ws.getColumn(i).width = colW;
    }
  }

  private colToStat(col: number, n: number, w: number): number {
    const cps = Math.floor(w / n), extra = w % n;
    let cur = 1;
    for (let i = 0; i < n; i++) {
      const width = cps + (i < extra ? 1 : 0);
      if (col >= cur && col < cur + width) return i;
      cur += width;
    }
    return n - 1;
  }

  private isFirstColOfStat(col: number, n: number, w: number): boolean {
    const cps = Math.floor(w / n), extra = w % n;
    let cur = 1;
    for (let i = 0; i < n; i++) {
      if (cur === col) return true;
      cur += cps + (i < extra ? 1 : 0);
    }
    return false;
  }

  private mergeStatGroups(ws: any, row: number, n: number, w: number): void {
    const cps = Math.floor(w / n), extra = w % n;
    let cur = 1;
    for (let i = 0; i < n; i++) {
      const width = cps + (i < extra ? 1 : 0);
      if (width > 1) ws.mergeCells(row, cur, row, cur + width - 1);
      cur += width;
    }
  }

  // ── Layout helpers ──────────────────────────────────────────────────────────

  private rowFill(ws: any, row: number, cols: number, argb: string): void {
    for (let i = 1; i <= cols; i++) ws.getCell(row, i).fill = this.fill(argb);
  }

  private sectionHeader(ws: any, row: number, span: number, title: string,
                        bgArgb: string, borderArgb: string, fontArgb: string): void {
    ws.getRow(row).height = 18;
    for (let i = 1; i <= span; i++) {
      ws.getCell(row, i).fill   = this.fill(bgArgb);
      ws.getCell(row, i).border = this.border(borderArgb);
    }
    const cell     = ws.getCell(row, 1);
    cell.value     = title;
    cell.font      = { bold: true, size: 9, color: { argb: fontArgb }, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', indent: 1 };
    ws.mergeCells(row, 1, row, span);
  }

  private tableHead(ws: any, row: number, totalCols: number, headers: string[]): void {
    ws.getRow(row).height = 16;
    for (let i = 1; i <= totalCols; i++) {
      ws.getCell(row, i).fill   = this.fill(this.C.neon);
      ws.getCell(row, i).border = this.border(this.C.neonDark);
    }
    headers.forEach((h, i) => {
      const cell     = ws.getCell(row, i + 1);
      cell.value     = h;
      cell.font      = { bold: true, size: 8, color: { argb: this.C.black }, name: 'Calibri' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    const last = headers.length;
    if (totalCols > last) ws.mergeCells(row, last, row, totalCols);
  }

  private tableRow(ws: any, row: number, totalCols: number, cells: any[], even: boolean): void {
    const bg = even ? this.C.white : this.C.gray50;
    ws.getRow(row).height = 15;
    for (let i = 1; i <= totalCols; i++) {
      ws.getCell(row, i).fill   = this.fill(bg);
      ws.getCell(row, i).border = this.border(this.C.gray200);
    }
    cells.forEach((val, i) => {
      const cell     = ws.getCell(row, i + 1);
      cell.value     = val;
      cell.font      = { bold: i === 0, size: 9, color: { argb: this.C.gray700 }, name: 'Calibri' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    const last = cells.length;
    if (totalCols > last) ws.mergeCells(row, last, row, totalCols);
    ws.getCell(row, last).alignment = { horizontal: 'center', vertical: 'middle' };
  }

  // ── Base helpers ────────────────────────────────────────────────────────────

  private fill(argb: string) {
    return { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb }, bgColor: { argb: 'FFFFFFFF' } };
  }

  private border(argb: string) {
    const s = { style: 'thin' as const, color: { argb } };
    return { top: s, bottom: s, left: s, right: s };
  }

  private badgeStyle(estado: string): { bg: string; text: string } {
    const e = (estado || '').toUpperCase();
    if (['COMPLETADA','OPERATIVO','ACTIVO','ACTIVA','APROBADA','LIBERADO','RESUELTO'].some(x => e.includes(x)))
      return { bg: this.C.greenBg, text: this.C.greenFg };
    if (['MANTENIMIENTO','PENDIENTE','EN PROCESO'].some(x => e.includes(x)))
      return { bg: this.C.orangeBg, text: this.C.orangeFg };
    if (e.match(/^\d+%$/)) {
      const v = parseFloat(e);
      if (v >= 85) return { bg: this.C.greenBg,  text: this.C.greenFg  };
      if (v >= 70) return { bg: this.C.orangeBg, text: this.C.orangeFg };
    }
    return { bg: this.C.redBg, text: this.C.redFg };
  }
}
