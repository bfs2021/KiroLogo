// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { crearMarcadorEstrellas, type MarcadorEstrellas } from './marcador-estrellas.js';
import type { Calificacion, EstadoEstrella } from '../juego/estrellas.js';

let contenedor: HTMLElement;

function estrella(otorgada: boolean): EstadoEstrella {
  return otorgada
    ? { otorgada: true }
    : { otorgada: false, motivo: { clave: 'sinPrecision' } };
}

function calif(p: boolean, e: boolean, a: boolean): Calificacion {
  return {
    precision: estrella(p),
    economia: estrella(e),
    abstraccion: estrella(a),
    conteoJugador: 1,
    presupuestoEstrella: 1,
  };
}

function crear(): MarcadorEstrellas {
  return crearMarcadorEstrellas({ contenedor });
}

beforeEach(() => {
  document.body.innerHTML = '<div id="aplicacion"></div>';
  contenedor = document.getElementById('aplicacion') as HTMLElement;
});

describe('marcador-estrellas · presentación', () => {
  it('se cuelga del contenedor con tres estrellas nombradas en español, en orden', () => {
    const m = crear();
    expect(m.raiz.parentElement).toBe(contenedor);
    const nombres = [...m.raiz.querySelectorAll('.kl-estrella-nombre')].map((n) => n.textContent);
    expect(nombres).toEqual(['Precisión', 'Economía', 'Abstracción']);
  });

  it('arranca con las tres estrellas pendientes, dichas por texto y por forma', () => {
    const m = crear();
    for (const e of ['precision', 'economia', 'abstraccion'] as const) {
      expect(m.estadoDe(e)).toBe('pendiente');
    }
    const items = [...m.raiz.querySelectorAll('.kl-estrella')];
    for (const item of items) {
      expect(item.querySelector('.kl-estrella-estado')!.textContent).toBe('pendiente');
      expect(item.querySelector('.kl-estrella-icono')!.textContent).toBe('☆');
    }
  });

  it('no es una región aria-live: el único canal de anuncios es el del juego', () => {
    const m = crear();
    expect(m.raiz.closest('[aria-live]')).toBeNull();
    expect(m.raiz.querySelector('[aria-live]')).toBeNull();
  });

  it('esconde el ícono a los lectores de pantalla: el estado va en texto', () => {
    const m = crear();
    for (const icono of m.raiz.querySelectorAll('.kl-estrella-icono')) {
      expect(icono.getAttribute('aria-hidden')).toBe('true');
    }
  });
});

describe('marcador-estrellas · mostrar', () => {
  it('pinta cada estrella otorgada o negada con forma, texto y data-estado', () => {
    const m = crear();
    m.mostrar(calif(true, false, true));

    expect(m.estadoDe('precision')).toBe('otorgada');
    expect(m.estadoDe('economia')).toBe('negada');
    expect(m.estadoDe('abstraccion')).toBe('otorgada');

    const precision = m.raiz.querySelector('.kl-estrella-precision')!;
    expect(precision.getAttribute('data-estado')).toBe('otorgada');
    expect(precision.querySelector('.kl-estrella-icono')!.textContent).toBe('★');
    expect(precision.querySelector('.kl-estrella-estado')!.textContent).toBe('otorgada');

    const economia = m.raiz.querySelector('.kl-estrella-economia')!;
    expect(economia.getAttribute('data-estado')).toBe('negada');
    expect(economia.querySelector('.kl-estrella-icono')!.textContent).toBe('☆');
    expect(economia.querySelector('.kl-estrella-estado')!.textContent).toBe('negada');
  });

  it('un resultado nuevo reemplaza al anterior por completo', () => {
    const m = crear();
    m.mostrar(calif(true, true, true));
    m.mostrar(calif(false, false, false));
    for (const e of ['precision', 'economia', 'abstraccion'] as const) {
      expect(m.estadoDe(e)).toBe('negada');
    }
  });
});

describe('marcador-estrellas · restablecer', () => {
  it('vuelve las tres estrellas a pendiente', () => {
    const m = crear();
    m.mostrar(calif(true, true, true));
    m.restablecer();
    for (const e of ['precision', 'economia', 'abstraccion'] as const) {
      expect(m.estadoDe(e)).toBe('pendiente');
    }
    expect(m.raiz.querySelector('.kl-estrella-precision')!.getAttribute('data-estado')).toBe('pendiente');
  });
});

// ============================================================================
// 7.4 · dos de tres canales bastan sin depender solo del color
//
// La forma sola no basta: «pendiente» y «negada» comparten el ícono ☆. El
// requisito 7.4 pide que, de los tres canales (forma, texto y color), dos
// basten para distinguir cada estado sin depender solo del color. Estas
// pruebas cierran el hueco: confirman que el canal de texto distingue lo que
// la forma no, y que las tres tarjetas son distinguibles entre sí.
// ============================================================================

describe('marcador-estrellas · 7.4 distinción sin depender del color', () => {
  it('pendiente y negada comparten forma, así que el texto es quien las distingue', () => {
    const m = crear();

    // Arranque: las tres pendientes.
    const iconoPendiente = m.raiz.querySelector('.kl-estrella-precision .kl-estrella-icono')!.textContent;
    const textoPendiente = m.raiz.querySelector('.kl-estrella-precision .kl-estrella-estado')!.textContent;

    // Negar la precisión.
    m.mostrar(calif(false, true, true));
    const iconoNegada = m.raiz.querySelector('.kl-estrella-precision .kl-estrella-icono')!.textContent;
    const textoNegada = m.raiz.querySelector('.kl-estrella-precision .kl-estrella-estado')!.textContent;

    // La forma no alcanza para separar pendiente de negada: ambas son ☆.
    expect(iconoPendiente).toBe('☆');
    expect(iconoNegada).toBe('☆');
    expect(iconoNegada).toBe(iconoPendiente);

    // El texto sí las separa: ese es el segundo canal, no el color.
    expect(textoPendiente).toBe('pendiente');
    expect(textoNegada).toBe('negada');
    expect(textoNegada).not.toBe(textoPendiente);
  });

  it('otorgada se distingue de pendiente y negada por forma además de por texto', () => {
    const m = crear();
    m.mostrar(calif(true, false, false));

    const otorgada = m.raiz.querySelector('.kl-estrella-precision')!;
    const negada = m.raiz.querySelector('.kl-estrella-economia')!;

    // Forma distinta (★ vs ☆) y texto distinto: dos canales, sin color.
    expect(otorgada.querySelector('.kl-estrella-icono')!.textContent).toBe('★');
    expect(negada.querySelector('.kl-estrella-icono')!.textContent).toBe('☆');
    expect(otorgada.querySelector('.kl-estrella-estado')!.textContent).toBe('otorgada');
    expect(negada.querySelector('.kl-estrella-estado')!.textContent).toBe('negada');

    // Y cada tarjeta trae su estado en un atributo, no solo en el color.
    expect(otorgada.getAttribute('data-estado')).toBe('otorgada');
    expect(negada.getAttribute('data-estado')).toBe('negada');
  });

  it('las tres tarjetas son distinguibles entre sí por su nombre', () => {
    const m = crear();
    const nombres = [...m.raiz.querySelectorAll('.kl-estrella-nombre')].map((n) => n.textContent);
    expect(new Set(nombres).size).toBe(3);
  });
});
