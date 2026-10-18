// Marcador de las tres estrellas del intento: precisión, economía y abstracción.
//
// Es la versión visible de lo que el globo de Kiro dice en palabras. Cada estrella
// se comunica por forma (★ llena, ☆ vacía), por texto («otorgada», «negada») y por
// color, nunca solo por color. No es una región `aria-live`: el único canal de
// anuncios es la región del juego y el globo ya publica el resultado en ella.
//
// Solo pinta una `Calificacion` que ya calculó `main.ts`; no la recalcula.

import type { Calificacion, EstadoEstrella } from '../juego/estrellas.js';

// ============================================================================
// Estrellas y estados
// ============================================================================

export type NombreEstrella = 'precision' | 'economia' | 'abstraccion';

/** Estado presentado: `pendiente` es antes de tener un resultado que mostrar. */
export type EstadoMarcador = 'pendiente' | 'otorgada' | 'negada';

const ORDEN: readonly NombreEstrella[] = ['precision', 'economia', 'abstraccion'];

const ROTULO: Readonly<Record<NombreEstrella, string>> = {
  precision: 'Precisión',
  economia: 'Economía',
  abstraccion: 'Abstracción',
};

const ICONO: Readonly<Record<EstadoMarcador, string>> = {
  pendiente: '☆',
  otorgada: '★',
  negada: '☆',
};

const TEXTO_ESTADO: Readonly<Record<EstadoMarcador, string>> = {
  pendiente: 'pendiente',
  otorgada: 'otorgada',
  negada: 'negada',
};

// ============================================================================
// Interfaz pública
// ============================================================================

export interface DependenciasMarcador {
  readonly contenedor: HTMLElement;
}

export interface MarcadorEstrellas {
  readonly raiz: HTMLElement;
  /** Pinta el resultado de un intento: cada estrella otorgada o negada. */
  mostrar(calificacion: Calificacion): void;
  /** Vuelve las tres estrellas a «pendiente» (intento nuevo o nivel nuevo). */
  restablecer(): void;
  /** Estado presentado de una estrella. */
  estadoDe(estrella: NombreEstrella): EstadoMarcador;
}

// ============================================================================
// Creación
// ============================================================================

export function crearMarcadorEstrellas(deps: DependenciasMarcador): MarcadorEstrellas {
  const doc = deps.contenedor.ownerDocument;

  const raiz = doc.createElement('ul');
  raiz.className = 'kl-marcador';
  raiz.setAttribute('aria-label', 'Estrellas del intento');

  const items = new Map<NombreEstrella, HTMLElement>();
  const estados = new Map<NombreEstrella, EstadoMarcador>();

  for (const estrella of ORDEN) {
    const item = doc.createElement('li');
    item.className = `kl-estrella kl-estrella-${estrella}`;

    const icono = doc.createElement('span');
    icono.className = 'kl-estrella-icono';
    icono.setAttribute('aria-hidden', 'true');

    const nombre = doc.createElement('span');
    nombre.className = 'kl-estrella-nombre';
    nombre.textContent = ROTULO[estrella];

    const estado = doc.createElement('span');
    estado.className = 'kl-estrella-estado';

    item.append(icono, nombre, estado);
    raiz.appendChild(item);
    items.set(estrella, item);
  }

  deps.contenedor.appendChild(raiz);

  function pintar(estrella: NombreEstrella, estado: EstadoMarcador): void {
    const item = items.get(estrella)!;
    estados.set(estrella, estado);
    item.setAttribute('data-estado', estado);
    item.querySelector('.kl-estrella-icono')!.textContent = ICONO[estado];
    item.querySelector('.kl-estrella-estado')!.textContent = TEXTO_ESTADO[estado];
  }

  function deEstrella(e: EstadoEstrella): EstadoMarcador {
    return e.otorgada ? 'otorgada' : 'negada';
  }

  function restablecer(): void {
    for (const estrella of ORDEN) pintar(estrella, 'pendiente');
  }
  restablecer();

  return {
    raiz,

    mostrar(cal: Calificacion): void {
      pintar('precision', deEstrella(cal.precision));
      pintar('economia', deEstrella(cal.economia));
      pintar('abstraccion', deEstrella(cal.abstraccion));
    },

    restablecer,

    estadoDe(estrella: NombreEstrella): EstadoMarcador {
      return estados.get(estrella) ?? 'pendiente';
    },
  };
}
