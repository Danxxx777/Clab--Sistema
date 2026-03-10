import { Injectable } from '@angular/core';
import { StatModulo, DatoGrafica, ModuloConfig, ExportOptions } from '../interfaces/Reportar.model';

// ─── Paleta de colores ARGB para xlsx ────────────────────────────────────────
const COLORS: Record<string, string> = {
  // Módulos → color primario
  neon:     'FF16A34A',
  verde:    'FF16A34A',
  rojo:     'FFDC2626',
  azul:     'FF2563EB',
  naranja:  'FFEA580C',
  cyan:     'FF0891B2',
  amarillo: 'FFD97706',
  morado:   'FF7C3AED',
  // Grises y blancos
  gray900:  'FF111827',
  gray700:  'FF374151',
  gray500:  'FF6B7280',
  gray400:  'FF9CA3AF',
  gray200:  'FFE5E7EB',
  gray100:  'FFF3F4F6',
  gray50:   'FFF9FAFB',
  white:    'FFFFFFFF',
  // Estado
  greenBg:  'FFD1FAE5',
  greenFg:  'FF065F46',
  orangeBg: 'FFFFEDD5',
  orangeFg: 'FF9A3412',
  redBg:    'FFFEE2E2',
  redFg:    'FF991B1B',
};

@Injectable({ providedIn: 'root' })
export class ExportExcelService {

  async exportar(opts: ExportOptions): Promise<void> {
    // Carga dinámica de SheetJS
    const XLSX = await import('xlsx');

    const wb = XLSX.utils.book_new();
    const modColor = COLORS[opts.modulo.color] ?? COLORS['azul'];

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 1 — RESUMEN
    // ════════════════════════════════════════════════════════════════════════
    {
      const ws: any = {};
      const merges: any[] = [];
      let row = 0;

      // ── Bloque título ────────────────────────────────────────────────────
      const headerStyle = {
        font:      { bold: true, sz: 18, color: { argb: COLORS['white'] }, name: 'Calibri' },
        fill:      { patternType: 'solid', fgColor: { argb: modColor } },
        alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
      };
      this.setCell(ws, row, 0, `CLAB — Reporte: ${opts.modulo.titulo}`, headerStyle);
      merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } });
      row++;

      // Sub-título descripción
      const subStyle = {
        font:      { italic: true, sz: 10, color: { argb: COLORS['gray500'] }, name: 'Calibri' },
        fill:      { patternType: 'solid', fgColor: { argb: modColor } },
        alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
      };
      this.setCell(ws, row, 0, opts.modulo.desc, subStyle);
      merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } });
      row++;

      // Fila vacía
      row++;

      // ── Bloque meta-info ─────────────────────────────────────────────────
      const metaLabel = { font: { bold: true, sz: 9, color: { argb: COLORS['gray500'] }, name: 'Calibri' }, fill: { patternType: 'solid', fgColor: { argb: COLORS['gray100'] } } };
      const metaVal   = { font: { sz: 9, color: { argb: COLORS['gray900'] }, name: 'Calibri' },             fill: { patternType: 'solid', fgColor: { argb: COLORS['white'] }   } };

      const meta = [
        ['Módulo',        opts.modulo.titulo],
        ['Descripción',   opts.modulo.desc],
        ['Laboratorio',   opts.nombreLaboratorio || 'Todos'],
        ['Período',       opts.filtros.fechaInicio && opts.filtros.fechaFin
          ? `${opts.filtros.fechaInicio} → ${opts.filtros.fechaFin}`
          : '—'],
        ['Estado',        opts.filtros.estado || 'Todos'],
        ['Generado por',  opts.usuarioLogueado],
        ['Fecha/hora',    new Date().toLocaleString('es-EC')],
      ];

      meta.forEach(([label, val]) => {
        this.setCell(ws, row, 0, label, metaLabel);
        this.setCell(ws, row, 1, val,   metaVal);
        merges.push({ s: { r: row, c: 1 }, e: { r: row, c: 5 } });
        row++;
      });

      row++;

      // ── Estadísticas ─────────────────────────────────────────────────────
      if (opts.statsModulo.length > 0) {
        const sectionStyle = {
          font: { bold: true, sz: 11, color: { argb: COLORS['white'] }, name: 'Calibri' },
          fill: { patternType: 'solid', fgColor: { argb: modColor } },
          alignment: { vertical: 'center', indent: 1 },
        };
        this.setCell(ws, row, 0, 'ESTADÍSTICAS GENERALES', sectionStyle);
        merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } });
        row++;

        // Cabeceras de stats
        const statHeadStyle = {
          font:      { bold: true, sz: 8, color: { argb: modColor }, name: 'Calibri' },
          fill:      { patternType: 'solid', fgColor: { argb: COLORS['gray100'] } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border:    this.thinBorder(),
        };
        const statValStyle = {
          font:      { bold: true, sz: 14, color: { argb: COLORS['gray900'] }, name: 'Calibri' },
          fill:      { patternType: 'solid', fgColor: { argb: COLORS['white'] } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border:    this.thinBorder(),
        };

        opts.statsModulo.forEach((s, i) => {
          this.setCell(ws, row,     i, s.label.toUpperCase(), statHeadStyle);
          this.setCell(ws, row + 1, i, s.valor,               statValStyle);
        });
        row += 3;
      }

      // ── Gráfica 1: tabla ─────────────────────────────────────────────────
      if (opts.datosGrafica.length > 0) {
        this.writeSubTable(
          ws, merges, row,
          opts.tituloGrafica1.toUpperCase(),
          ['CATEGORÍA', 'CANTIDAD', '% RELATIVO'],
          opts.datosGrafica.map(d => [d.label, d.valor, `${d.pct}%`]),
          modColor
        );
        row += opts.datosGrafica.length + 4;
      }

      // ── Gráfica 2: distribución ───────────────────────────────────────────
      if (opts.datosDistribucion.length > 0) {
        this.writeSubTable(
          ws, merges, row,
          opts.tituloGrafica2.toUpperCase(),
          ['CATEGORÍA', 'CANTIDAD', '% DISTRIBUCIÓN'],
          opts.datosDistribucion.map(d => [d.label, d.valor, `${d.pct}%`]),
          modColor
        );
        row += opts.datosDistribucion.length + 4;
      }

      ws['!merges'] = merges;
      ws['!cols']   = [
        { wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
    }

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 2 — DETALLE
    // ════════════════════════════════════════════════════════════════════════
    if (opts.datosReporte.length > 0 && opts.columnasTabla.length > 0) {
      const ws2: any = {};
      const merges2: any[] = [];
      let row2 = 0;

      // Header banda
      const hStyle = {
        font:      { bold: true, sz: 14, color: { argb: COLORS['white'] }, name: 'Calibri' },
        fill:      { patternType: 'solid', fgColor: { argb: modColor } },
        alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
      };
      this.setCell(ws2, row2, 0, `Detalle — ${opts.modulo.titulo}`, hStyle);
      merges2.push({ s: { r: row2, c: 0 }, e: { r: row2, c: opts.columnasTabla.length - 1 } });
      row2++;

      const subH = {
        font:      { italic: true, sz: 9, color: { argb: COLORS['white'] }, name: 'Calibri' },
        fill:      { patternType: 'solid', fgColor: { argb: modColor } },
        alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
      };
      this.setCell(ws2, row2, 0, `${opts.datosReporte.length} registros — Generado: ${new Date().toLocaleString('es-EC')}`, subH);
      merges2.push({ s: { r: row2, c: 0 }, e: { r: row2, c: opts.columnasTabla.length - 1 } });
      row2 += 2;

      // Cabecera tabla
      const colHeadStyle = {
        font:      { bold: true, sz: 9, color: { argb: COLORS['white'] }, name: 'Calibri' },
        fill:      { patternType: 'solid', fgColor: { argb: modColor } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border:    this.thinBorder(),
      };
      opts.columnasTabla.forEach((col, ci) => {
        this.setCell(ws2, row2, ci, col, colHeadStyle);
      });
      row2++;

      // Filas de datos
      const evenStyle = {
        font:   { sz: 9, color: { argb: COLORS['gray700'] }, name: 'Calibri' },
        fill:   { patternType: 'solid', fgColor: { argb: COLORS['white'] } },
        border: this.thinBorder(),
        alignment: { vertical: 'center', wrapText: false },
      };
      const oddStyle = {
        ...evenStyle,
        fill: { patternType: 'solid', fgColor: { argb: COLORS['gray50'] } },
      };
      const firstColStyle = (isEven: boolean) => ({
        ...( isEven ? evenStyle : oddStyle ),
        font: { bold: true, sz: 9, color: { argb: COLORS['gray900'] }, name: 'Calibri' },
      });

      opts.datosReporte.forEach((fila, fi) => {
        const vals   = opts.filasTabla(fila);
        const isEven = fi % 2 === 0;

        vals.forEach((val, ci) => {
          const isLast = ci === vals.length - 1;

          if (isLast) {
            // Celda de estado con estilo condicional
            const bs  = this.badgeStyle(String(val));
            const est = {
              font:      { bold: true, sz: 8, color: { argb: bs.text }, name: 'Calibri' },
              fill:      { patternType: 'solid', fgColor: { argb: bs.bg } },
              alignment: { horizontal: 'center', vertical: 'center' },
              border:    this.thinBorder(),
            };
            this.setCell(ws2, row2, ci, String(val).toUpperCase(), est);
          } else if (ci === 0) {
            this.setCell(ws2, row2, ci, val, firstColStyle(isEven));
          } else {
            this.setCell(ws2, row2, ci, val, isEven ? evenStyle : oddStyle);
          }
        });
        row2++;
      });

      // Auto-ancho columnas (aprox.)
      ws2['!cols'] = opts.columnasTabla.map((_, i) => ({
        wch: Math.max(
          opts.columnasTabla[i].length,
          ...opts.datosReporte.map(f => String(opts.filasTabla(f)[i] ?? '').length),
          12
        ) + 2
      }));
      ws2['!rows']   = [{ hpt: 24 }, { hpt: 16 }];
      ws2['!merges'] = merges2;

      XLSX.utils.book_append_sheet(wb, ws2, 'Detalle');
    }

    // ════════════════════════════════════════════════════════════════════════
    // GUARDAR
    // ════════════════════════════════════════════════════════════════════════
    const fecha    = new Date().toISOString().split('T')[0];
    const filename = `CLAB_${opts.modulo.titulo.replace(/\s+/g,'_')}_${fecha}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private setCell(ws: any, row: number, col: number, value: any, style?: any): void {
    const addr = this.cellAddr(row, col);
    ws[addr]   = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style };
    // Extiende el rango
    if (!ws['!ref']) {
      ws['!ref'] = `${addr}:${addr}`;
    } else {
      const cur  = ws['!ref'].split(':');
      const minC = this.addrToRC(cur[0]);
      const maxC = this.addrToRC(cur[1] || cur[0]);
      ws['!ref'] = `${this.rcToAddr(Math.min(minC.r, row), Math.min(minC.c, col))}:${this.rcToAddr(Math.max(maxC.r, row), Math.max(maxC.c, col))}`;
    }
  }

  private writeSubTable(
    ws: any, merges: any[], startRow: number,
    title: string, headers: string[], rows: any[][],
    accentColor: string
  ): void {
    const sStyle = {
      font:      { bold: true, sz: 10, color: { argb: COLORS['white'] }, name: 'Calibri' },
      fill:      { patternType: 'solid', fgColor: { argb: accentColor } },
      alignment: { vertical: 'center', indent: 1 },
      border:    this.thinBorder(),
    };
    this.setCell(ws, startRow, 0, title, sStyle);
    merges.push({ s: { r: startRow, c: 0 }, e: { r: startRow, c: headers.length - 1 } });

    const hStyle = {
      font:      { bold: true, sz: 8, color: { argb: accentColor }, name: 'Calibri' },
      fill:      { patternType: 'solid', fgColor: { argb: COLORS['gray100'] } },
      alignment: { horizontal: 'center' },
      border:    this.thinBorder(),
    };
    headers.forEach((h, i) => this.setCell(ws, startRow + 1, i, h, hStyle));

    const dStyle = {
      font:   { sz: 9, color: { argb: COLORS['gray700'] }, name: 'Calibri' },
      fill:   { patternType: 'solid', fgColor: { argb: COLORS['white'] } },
      border: this.thinBorder(),
      alignment: { vertical: 'center' },
    };
    rows.forEach((row, ri) => {
      row.forEach((val, ci) => {
        const style = ri % 2 === 0 ? dStyle : { ...dStyle, fill: { patternType: 'solid', fgColor: { argb: COLORS['gray50'] } } };
        this.setCell(ws, startRow + 2 + ri, ci, val, style);
      });
    });
  }

  private thinBorder() {
    const s = { style: 'thin', color: { argb: COLORS['gray200'] } };
    return { top: s, bottom: s, left: s, right: s };
  }

  private badgeStyle(estado: string): { bg: string; text: string } {
    const e = (estado || '').toUpperCase();
    if (['COMPLETADA','OPERATIVO','ACTIVO','ACTIVA','APROBADA','LIBERADO','RESUELTO'].some(x => e.includes(x)))
      return { bg: COLORS['greenBg'],  text: COLORS['greenFg']  };
    if (['MANTENIMIENTO','PENDIENTE','EN PROCESO'].some(x => e.includes(x)))
      return { bg: COLORS['orangeBg'], text: COLORS['orangeFg'] };
    if (e.match(/^\d+%$/)) {
      const v = parseFloat(e);
      if (v >= 85) return { bg: COLORS['greenBg'],  text: COLORS['greenFg']  };
      if (v >= 70) return { bg: COLORS['orangeBg'], text: COLORS['orangeFg'] };
    }
    return { bg: COLORS['redBg'],    text: COLORS['redFg']    };
  }

  private cellAddr(row: number, col: number): string {
    let col26 = '';
    let c = col;
    do { col26 = String.fromCharCode(65 + (c % 26)) + col26; c = Math.floor(c / 26) - 1; } while (c >= 0);
    return `${col26}${row + 1}`;
  }

  private addrToRC(addr: string): { r: number; c: number } {
    const m = addr.match(/^([A-Z]+)(\d+)$/);
    if (!m) return { r: 0, c: 0 };
    let c = 0;
    for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64;
    return { r: parseInt(m[2], 10) - 1, c: c - 1 };
  }

  private rcToAddr(r: number, c: number): string { return this.cellAddr(r, c); }
}
