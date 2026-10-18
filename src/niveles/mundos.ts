// Los mundos de KiroLogo: su nombre y la insignia de concepto que se gana al completarlos.
//
// Son datos, no lógica (ver `niveles-y-progresion`): la interfaz los lee para decirle
// al jugador en qué mundo está, porque el identificador de un nivel («0.3») solo
// dice el mundo si ya se sabe que el primer número lo es.

import type { Mundo } from '../lenguaje/vocabulario.js';

export interface InfoMundo {
  /** Nombre del mundo, tal como lo llama el steering. */
  readonly nombre: string;
  /** Insignia de concepto que se gana al completarlo con las tres estrellas en todos sus niveles. */
  readonly insignia: string;
}

/**
 * Los seis mundos de concepto, por número. El mundo bonus de arquitectura se desbloquea
 * aparte y todavía no tiene número de mundo en el lenguaje.
 */
export const MUNDOS: Readonly<Record<Mundo, InfoMundo>> = {
  0: { nombre: 'Primeros pasos', insignia: 'Secuencia' },
  1: { nombre: 'Figuras geométricas', insignia: 'Iteración' },
  2: { nombre: 'Composición', insignia: 'Descomposición' },
  3: { nombre: 'Rosetones', insignia: 'Simetría' },
  4: { nombre: 'Parámetros', insignia: 'Generalización' },
  5: { nombre: 'Fractales', insignia: 'Recursión' },
};

/** «Mundo 0 · Primeros pasos»: número y nombre, para mostrar al jugador. */
export function etiquetaDeMundo(mundo: Mundo): string {
  return `Mundo ${mundo} · ${MUNDOS[mundo].nombre}`;
}
