import { describe, it, expect } from 'vitest';
import { MUNDOS, etiquetaDeMundo } from './mundos.js';
import { CATALOGO } from './catalogo.js';
import type { Mundo } from '../lenguaje/vocabulario.js';

const NUMEROS: readonly Mundo[] = [0, 1, 2, 3, 4, 5];

describe('mundos · nombre e insignia', () => {
  it('declara los seis mundos de concepto, y ninguno más', () => {
    expect(Object.keys(MUNDOS).map(Number).sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('los nombres son los del steering, en orden', () => {
    expect(NUMEROS.map((m) => MUNDOS[m].nombre)).toEqual([
      'Primeros pasos',
      'Figuras geométricas',
      'Composición',
      'Rosetones',
      'Parámetros',
      'Fractales',
    ]);
  });

  it('las insignias son las del steering: una por concepto, y distintas entre sí', () => {
    const insignias = NUMEROS.map((m) => MUNDOS[m].insignia);
    expect(insignias).toEqual([
      'Secuencia',
      'Iteración',
      'Descomposición',
      'Simetría',
      'Generalización',
      'Recursión',
    ]);
    expect(new Set(insignias).size).toBe(insignias.length);
  });

  it('los nombres tampoco se repiten ni están vacíos', () => {
    const nombres = NUMEROS.map((m) => MUNDOS[m].nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
    expect(nombres.every((n) => n.trim().length > 0)).toBe(true);
  });

  it('todo nivel del catálogo pertenece a un mundo con nombre', () => {
    for (const nivel of CATALOGO) {
      expect(MUNDOS[nivel.mundo], `nivel ${nivel.id}`).toBeDefined();
    }
  });
});

describe('mundos · etiqueta', () => {
  it('une número y nombre: «Mundo 0 · Primeros pasos»', () => {
    expect(etiquetaDeMundo(0)).toBe('Mundo 0 · Primeros pasos');
    expect(etiquetaDeMundo(4)).toBe('Mundo 4 · Parámetros');
  });

  it('empieza siempre por la palabra «Mundo» y su número, para que el primer número del nivel se entienda', () => {
    for (const m of NUMEROS) {
      expect(etiquetaDeMundo(m).startsWith(`Mundo ${m} · `)).toBe(true);
    }
  });
});
