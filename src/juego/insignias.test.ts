// Pruebas de las insignias Secuencia (mundo 0) e Iteración (mundo 1), requisito 8.
import { describe, it, expect } from 'vitest';
import { cargarProgreso, type Progreso } from './progreso.js';
import type { Calificacion } from './estrellas.js';
import {
  insigniaSecuenciaOtorgada,
  insigniaIteracionOtorgada,
  insigniasDelMundo,
} from './insignias.js';
import { CATALOGO } from '../niveles/catalogo.js';

// ============================================================================
// Ayudas
// ============================================================================

const IDS = ['0.1', '0.2', '0.3', '0.4', '0.5'] as const;

/** Ids de los niveles del mundo 1, derivados del catálogo (no hardcodeados). */
const IDS_MUNDO_1 = CATALOGO.filter((n) => n.mundo === 1).map((n) => n.id);

function calif(p: boolean, e: boolean, a: boolean): Calificacion {
  const est = (o: boolean) => (o ? { otorgada: true as const } : { otorgada: false as const, motivo: { clave: 'sinPrecision' as const } });
  return { precision: est(p), economia: est(e), abstraccion: est(a), conteoJugador: 1, presupuestoEstrella: 1, mensajeAbstraccion: null };
}

/** Progreso con cada nivel dado completado con las tres estrellas. */
function conTresEstrellas(...ids: string[]): Progreso {
  const progreso = cargarProgreso(null);
  for (const id of ids) progreso.guardar(id, 1, calif(true, true, true), 1);
  return progreso;
}

// ============================================================================
// Otorgamiento
// ============================================================================

describe('insignia Secuencia', () => {
  it('se otorga con las tres estrellas en los cinco niveles del mundo 0', () => {
    const progreso = conTresEstrellas(...IDS);
    expect(insigniaSecuenciaOtorgada(progreso)).toBe(true);
    expect(insigniasDelMundo(0, progreso)).toEqual(['secuencia']);
  });

  it('no se otorga si falta algún nivel por completo', () => {
    const progreso = conTresEstrellas('0.1', '0.2', '0.3', '0.4'); // falta el 0.5
    expect(insigniaSecuenciaOtorgada(progreso)).toBe(false);
    expect(insigniasDelMundo(0, progreso)).toEqual([]);
  });

  it('no se otorga si a un nivel le falta una sola estrella', () => {
    // Cuatro niveles completos y el 0.3 con solo dos estrellas (falta abstracción).
    const parcial = cargarProgreso(null);
    for (const id of ['0.1', '0.2', '0.4', '0.5']) parcial.guardar(id, 1, calif(true, true, true), 1);
    parcial.guardar('0.3', 1, calif(true, true, false), 1);
    expect(insigniaSecuenciaOtorgada(parcial)).toBe(false);
  });

  it('no se otorga sin ningún progreso', () => {
    expect(insigniaSecuenciaOtorgada(cargarProgreso(null))).toBe(false);
  });

  it('aprobar los cinco niveles solo con precisión no basta: exige las tres', () => {
    const progreso = cargarProgreso(null);
    for (const id of IDS) progreso.guardar(id, 1, calif(true, false, false), 1);
    expect(insigniaSecuenciaOtorgada(progreso)).toBe(false);
  });
});

// ============================================================================
// Insignia Iteración (mundo 1)
// ============================================================================

describe('insignia Iteración', () => {
  it('el catálogo tiene cinco niveles en el mundo 1', () => {
    expect(IDS_MUNDO_1).toHaveLength(5);
  });

  it('se otorga con las tres estrellas en todos los niveles del mundo 1', () => {
    const progreso = conTresEstrellas(...IDS_MUNDO_1);
    expect(insigniaIteracionOtorgada(progreso)).toBe(true);
    expect(insigniasDelMundo(1, progreso)).toEqual(['iteracion']);
  });

  it('no se otorga si a un nivel le falta la estrella de abstracción', () => {
    const progreso = cargarProgreso(null);
    for (const id of IDS_MUNDO_1.slice(1)) progreso.guardar(id, 1, calif(true, true, true), 1);
    progreso.guardar(IDS_MUNDO_1[0]!, 1, calif(true, true, false), 1);
    expect(insigniaIteracionOtorgada(progreso)).toBe(false);
    expect(insigniasDelMundo(1, progreso)).toEqual([]);
  });

  it('no se otorga si un nivel del mundo está sin jugar', () => {
    const progreso = conTresEstrellas(...IDS_MUNDO_1.slice(1)); // falta el primero
    expect(insigniaIteracionOtorgada(progreso)).toBe(false);
  });

  it('no se otorga sin ningún progreso', () => {
    expect(insigniaIteracionOtorgada(cargarProgreso(null))).toBe(false);
  });
});

// ============================================================================
describe('insignias · derivado del progreso y alcance', () => {
  it('reconstruir el progreso desde las mismas estrellas da el mismo otorgamiento', () => {
    const a = conTresEstrellas(...IDS);
    const b = conTresEstrellas(...[...IDS].reverse()); // otro orden de guardado
    expect(insigniaSecuenciaOtorgada(a)).toBe(insigniaSecuenciaOtorgada(b));
  });

  it('ningún mundo sin insignia declarada la otorga en esta spec', () => {
    const progreso = conTresEstrellas(...IDS, ...IDS_MUNDO_1);
    for (const mundo of [2, 3, 4, 5]) {
      expect(insigniasDelMundo(mundo, progreso)).toEqual([]);
    }
  });
});
