import { Injectable } from '@angular/core';
import { ExportOptions } from '../interfaces/Reportar.model';

const C = {
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

  async exportar(opts: ExportOptions): Promise<void> {
    const ExcelJS = (await import('exceljs')).default ?? await import('exceljs');
    const wb      = new ExcelJS.Workbook();

    let logoId: number | null = null;
    try {
      const resp = await fetch('/LogoUTEQ.png');
      if (resp.ok) logoId = wb.addImage({ buffer: await resp.arrayBuffer(), extension: 'png' });
    } catch { }

    // ═══════════════════════════════════════════════════════
    // HOJA 1 — RESUMEN
    // ═══════════════════════════════════════════════════════
    const ws = wb.addWorksheet('Resumen');

    // Columnas: 4 pares de columnas iguales para stats simétricas
    // Las primeras 2 columnas son más anchas (etiqueta + valor del meta)
    ws.columns = [
      { width: 26 }, { width: 22 }, { width: 16 }, { width: 16 },
      { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 },
    ];

    let R = 1;

    // ── CLAB header ───────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.black);
    ws.getRow(R).height = 40;
    const cClab = ws.getCell(R, 1);
    cClab.value     = 'CLAB';
    cClab.font      = { bold: true, size: 22, color: { argb: C.neon }, name: 'Calibri' };
    cClab.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.mergeCells(R, 1, R, W);
    R++;

    // ── Subtítulo ─────────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.black);
    ws.getRow(R).height = 16;
    const cSub = ws.getCell(R, 1);
    cSub.value     = 'SISTEMA DE LABORATORIOS  ·  UTEQ';
    cSub.font      = { size: 9, color: { argb: C.gray500 }, name: 'Calibri' };
    cSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.mergeCells(R, 1, R, W);
    R++;

    // Logo: ocupa exactamente las 2 filas negras (row 0 y row 1), ancho 1.5 columnas
    if (logoId !== null) {
      ws.addImage(logoId, {
        tl: { col: W - 1, row: 0 } as any,
        br: { col: W,     row: 2 } as any,
        editAs: 'absolute',
      });
    }

    // ── Línea neón ────────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.neon);
    ws.getRow(R).height = 4;
    R++;

    // ── Título reporte ────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.black2);
    ws.getRow(R).height = 26;
    const cTit = ws.getCell(R, 1);
    cTit.value     = `Reporte: ${opts.modulo.titulo}`;
    cTit.font      = { bold: true, size: 14, color: { argb: C.white }, name: 'Calibri' };
    cTit.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.mergeCells(R, 1, R, W);
    R++;

    // ── Descripción ───────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.black2);
    ws.getRow(R).height = 16;
    const cDesc = ws.getCell(R, 1);
    cDesc.value     = opts.modulo.desc;
    cDesc.font      = { italic: true, size: 9, color: { argb: C.gray400 }, name: 'Calibri' };
    cDesc.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.mergeCells(R, 1, R, W);
    R++;

    // ── Separador ─────────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.black3);
    ws.getRow(R).height = 4;
    R++;

    // ── Espacio ───────────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.white);
    ws.getRow(R).height = 8;
    R++;

    // ── Info del reporte ──────────────────────────────────────────────────
    this.sectionHeader(ws, R, W, 'INFORMACIÓN DEL REPORTE', C.neon, C.neonDark, C.black);
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
        ws.getCell(R, i).fill   = this.fill(i === 1 ? C.gray100 : C.white);
        ws.getCell(R, i).border = this.border(C.gray200);
      }
      const cL = ws.getCell(R, 1);
      cL.value     = lbl;
      cL.font      = { bold: true, size: 9, color: { argb: C.gray500 }, name: 'Calibri' };
      cL.alignment = { vertical: 'middle', indent: 1 };
      const cV = ws.getCell(R, 2);
      cV.value     = val;
      cV.font      = { size: 9, color: { argb: C.gray900 }, name: 'Calibri' };
      cV.alignment = { vertical: 'middle', indent: 1 };
      ws.mergeCells(R, 2, R, W);
      R++;
    });

    // ── Espacio ───────────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.white);
    ws.getRow(R).height = 8;
    R++;

    // ── Stats: CLAVE — columnas de ancho IGUAL sin merge, todo definido explícitamente ──
    if (opts.statsModulo.length > 0) {
      this.sectionHeader(ws, R, W, 'RESUMEN DEL PERÍODO', C.black, C.black3, C.neon);
      R++;

      const n = opts.statsModulo.length;

      // Recalcular columnas para que las stats sean simétricas
      // Dividir W columnas en n grupos exactamente iguales ajustando anchos
      this.setStatColumns(ws, n, W);

      // Fila de labels: CADA celda individual tiene su propio estilo (sin merge)
      ws.getRow(R).height = 14;
      for (let col = 1; col <= W; col++) {
        const cc    = ws.getCell(R, col);
        cc.fill     = this.fill(C.black2);
        cc.border   = this.border(C.black3);
        // Determinar a qué stat pertenece esta columna
        const stat  = this.colToStat(col, n, W);
        const isFirst = this.isFirstColOfStat(col, n, W);
        if (isFirst) {
          cc.value     = opts.statsModulo[stat].label.toUpperCase();
          cc.font      = { bold: true, size: 7, color: { argb: C.gray400 }, name: 'Calibri' };
          cc.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      }
      // Merge cada grupo de columnas de la stat
      this.mergeStatGroups(ws, R, n, W);
      R++;

      // Fila de valores: igual
      ws.getRow(R).height = 36;
      for (let col = 1; col <= W; col++) {
        const cc   = ws.getCell(R, col);
        cc.fill    = this.fill(C.black2);
        cc.border  = this.border(C.black3);
        const stat = this.colToStat(col, n, W);
        const isFirst = this.isFirstColOfStat(col, n, W);
        if (isFirst) {
          cc.value     = opts.statsModulo[stat].valor;
          cc.font      = { bold: true, size: 24, color: { argb: C.white }, name: 'Calibri' };
          cc.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      }
      this.mergeStatGroups(ws, R, n, W);
      R++;

      this.rowFill(ws, R, W, C.white);
      ws.getRow(R).height = 8;
      R++;
    }

    // ── Espacio ───────────────────────────────────────────────────────────
    this.rowFill(ws, R, W, C.white);
    ws.getRow(R).height = 8;
    R++;

    // ── Tabla gráfica 1 ───────────────────────────────────────────────────
    if (opts.datosGrafica.length > 0) {
      this.sectionHeader(ws, R, W, opts.tituloGrafica1.toUpperCase(), C.black, C.black3, C.white);
      R++;
      this.tableHead(ws, R, W, ['CATEGORÍA', 'CANTIDAD', '% RELATIVO']);
      R++;
      opts.datosGrafica.forEach((d, ri) => {
        this.tableRow(ws, R, W, [d.label, d.valor, `${d.pct}%`], ri % 2 === 0);
        R++;
      });
      this.rowFill(ws, R, W, C.white);
      ws.getRow(R).height = 8;
      R++;
    }

    // ── Tabla gráfica 2 ───────────────────────────────────────────────────
    if (opts.datosDistribucion.length > 0) {
      this.sectionHeader(ws, R, W, opts.tituloGrafica2.toUpperCase(), C.black, C.black3, C.white);
      R++;
      this.tableHead(ws, R, W, ['CATEGORÍA', 'CANTIDAD', '% DISTRIBUCIÓN']);
      R++;
      opts.datosDistribucion.forEach((d, ri) => {
        this.tableRow(ws, R, W, [d.label, d.valor, `${d.pct}%`], ri % 2 === 0);
        R++;
      });
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

      // Header
      this.rowFill(ws2, R2, DW, C.black);
      ws2.getRow(R2).height = 30;
      const ch = ws2.getCell(R2, 1);
      ch.value     = `CLAB — ${opts.modulo.titulo.toUpperCase()}`;
      ch.font      = { bold: true, size: 14, color: { argb: C.neon }, name: 'Calibri' };
      ch.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws2.mergeCells(R2, 1, R2, DW);
      R2++;

      this.rowFill(ws2, R2, DW, C.black2);
      ws2.getRow(R2).height = 14;
      const cs = ws2.getCell(R2, 1);
      cs.value     = `${opts.datosReporte.length} registros  ·  ${new Date().toLocaleString('es-EC')}  ·  ${opts.usuarioLogueado}`;
      cs.font      = { size: 8, color: { argb: C.gray400 }, name: 'Calibri' };
      cs.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      ws2.mergeCells(R2, 1, R2, DW);
      R2++;

      this.rowFill(ws2, R2, DW, C.neon);
      ws2.getRow(R2).height = 4;
      R2++;

      this.rowFill(ws2, R2, DW, C.white);
      ws2.getRow(R2).height = 8;
      R2++;

      // Cabecera columnas
      ws2.getRow(R2).height = 18;
      for (let i = 1; i <= DW; i++) {
        ws2.getCell(R2, i).fill   = this.fill(C.black);
        ws2.getCell(R2, i).border = this.border(C.black3);
      }
      cols.forEach((col, ci) => {
        const cell     = ws2.getCell(R2, ci + 1);
        cell.value     = col.toUpperCase();
        cell.font      = { bold: true, size: 9, color: { argb: C.white }, name: 'Calibri' };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      // Fusionar última columna de datos hasta DW
      if (DW > cols.length) ws2.mergeCells(R2, cols.length, R2, DW);
      R2++;

      // Filas de datos
      opts.datosReporte.forEach((fila, fi) => {
        const vals = opts.filasTabla(fila);
        const even = fi % 2 === 0;
        const bg   = even ? C.white : C.gray50;
        ws2.getRow(R2).height = 15;

        for (let i = 1; i <= DW; i++) {
          ws2.getCell(R2, i).fill   = this.fill(bg);
          ws2.getCell(R2, i).border = this.border(C.gray200);
        }

        vals.forEach((val, ci) => {
          const isLast = ci === vals.length - 1;
          const cell   = ws2.getCell(R2, ci + 1);
          if (isLast) {
            const bs        = this.badgeStyle(String(val));
            const startCol  = ci + 1; // 1-based
            cell.value      = String(val).toUpperCase();
            cell.font       = { bold: true, size: 8, color: { argb: bs.text }, name: 'Calibri' };
            cell.alignment  = { horizontal: 'center', vertical: 'middle' };
            // Rellenar desde la columna del badge hasta DW
            for (let j = startCol; j <= DW; j++) {
              ws2.getCell(R2, j).fill   = this.fill(bs.bg);
              ws2.getCell(R2, j).border = this.border(C.gray200);
            }
            if (DW > startCol) ws2.mergeCells(R2, startCol, R2, DW);
          } else {
            cell.value     = val;
            cell.font      = { bold: ci === 0, size: 9, color: { argb: C.gray700 }, name: 'Calibri' };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });
        R2++;
      });
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

  // ── Stats: helpers de distribución simétrica ────────────────────────────

  // Ajusta el ancho de las columnas para que las N stats queden exactamente iguales
  private setStatColumns(ws: any, n: number, w: number): void {
    const totalW = [26, 22, 16, 16, 14, 14, 14, 14].slice(0, w).reduce((a, b) => a + b, 0);
    const statW  = totalW / n;
    const colsPerStat = w / n; // puede ser decimal

    // Reconstruir anchos para que cada stat ocupe la misma cantidad de píxeles
    if (Number.isInteger(colsPerStat)) {
      // Caso exacto: 4 stats en 8 cols → 2 cols por stat con ancho igual
      const colW = statW / colsPerStat;
      for (let i = 1; i <= w; i++)
        ws.getColumn(i).width = colW;
    }
    // Si no es entero, dejamos los anchos originales y simplemente mergeamos
  }

  // Dado un número de columna (1-based), retorna a qué stat (0-based) pertenece
  private colToStat(col: number, n: number, w: number): number {
    const cps = Math.floor(w / n);
    const extra = w % n;
    let cur = 1;
    for (let i = 0; i < n; i++) {
      const width = cps + (i < extra ? 1 : 0);
      if (col >= cur && col < cur + width) return i;
      cur += width;
    }
    return n - 1;
  }

  // Retorna true si `col` es la primera columna de su stat
  private isFirstColOfStat(col: number, n: number, w: number): boolean {
    const cps   = Math.floor(w / n);
    const extra = w % n;
    let cur = 1;
    for (let i = 0; i < n; i++) {
      if (cur === col) return true;
      cur += cps + (i < extra ? 1 : 0);
    }
    return false;
  }

  // Mergea cada grupo de columnas de cada stat en la fila dada
  private mergeStatGroups(ws: any, row: number, n: number, w: number): void {
    const cps   = Math.floor(w / n);
    const extra = w % n;
    let cur = 1;
    for (let i = 0; i < n; i++) {
      const width = cps + (i < extra ? 1 : 0);
      if (width > 1) ws.mergeCells(row, cur, row, cur + width - 1);
      cur += width;
    }
  }

  // ── Layout helpers ─────────────────────────────────────────────────────

  // Rellena todas las celdas de la fila con un color
  private rowFill(ws: any, row: number, cols: number, argb: string): void {
    for (let i = 1; i <= cols; i++)
      ws.getCell(row, i).fill = this.fill(argb);
  }

  // Cabecera de sección: rellena todo, pone texto en col 1, mergea
  private sectionHeader(
    ws: any, row: number, span: number, title: string,
    bgArgb: string, borderArgb: string, fontArgb: string
  ): void {
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

  // Cabecera de tabla: 3 cols de datos, la última fusionada hasta totalCols
  private tableHead(ws: any, row: number, totalCols: number, headers: string[]): void {
    ws.getRow(row).height = 16;
    for (let i = 1; i <= totalCols; i++) {
      ws.getCell(row, i).fill   = this.fill(C.neon);
      ws.getCell(row, i).border = this.border(C.neonDark);
    }
    headers.forEach((h, i) => {
      const cell     = ws.getCell(row, i + 1);
      cell.value     = h;
      cell.font      = { bold: true, size: 8, color: { argb: C.black }, name: 'Calibri' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    const last = headers.length;
    if (totalCols > last) ws.mergeCells(row, last, row, totalCols);
  }

  // Fila de datos: 3 cols, la última fusionada hasta totalCols
  private tableRow(ws: any, row: number, totalCols: number, cells: any[], even: boolean): void {
    const bg = even ? C.white : C.gray50;
    ws.getRow(row).height = 15;
    for (let i = 1; i <= totalCols; i++) {
      ws.getCell(row, i).fill   = this.fill(bg);
      ws.getCell(row, i).border = this.border(C.gray200);
    }
    cells.forEach((val, i) => {
      const cell = ws.getCell(row, i + 1);
      cell.value = val;
      cell.font  = { bold: i === 0, size: 9, color: { argb: C.gray700 }, name: 'Calibri' };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    const last = cells.length;
    if (totalCols > last) ws.mergeCells(row, last, row, totalCols);
    ws.getCell(row, last).alignment = { horizontal: 'center', vertical: 'middle' };
  }

  // ── Helpers base ────────────────────────────────────────────────────────
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
      return { bg: C.greenBg, text: C.greenFg };
    if (['MANTENIMIENTO','PENDIENTE','EN PROCESO'].some(x => e.includes(x)))
      return { bg: C.orangeBg, text: C.orangeFg };
    if (e.match(/^\d+%$/)) {
      const v = parseFloat(e);
      if (v >= 85) return { bg: C.greenBg,  text: C.greenFg  };
      if (v >= 70) return { bg: C.orangeBg, text: C.orangeFg };
    }
    return { bg: C.redBg, text: C.redFg };
  }
}
