// Pruebas de los personajes: la tortuga, Kiro y el lápiz.
//
// Corre en Node con el doble de dibujo de `doble-dibujo.test.ts`. Los ejemplos de
// la sección 7.4.3 y la Property 14A (parte personajes) se miden sobre la secuencia
// registrada de llamadas y su rasterizado; la verificación con un Canvas real del
// navegador sigue siendo manual.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { crearPrng } from '../azar/prng.js';
import { DobleDibujo, iou, mascarasIguales } from './doble-dibujo.test.js';
import {
  dibujarPersonajes,
  GROSOR_TRAZO,
  INCLINACION_MAXIMA,
  type EstadoPersonajes,
  type EstiloPersonajes,
  type IdentidadTortuga,
} from './personajes.js';
import { ESTADO_INICIAL, type EstadoTortuga } from './tortuga.js';

// ============================================================================
// Ayudas
// ============================================================================

/** Estilo de personajes con valores concretos (los resuelve el lector del tema). */
function estiloPersonajes(): EstiloPersonajes {
  return {
    contorno: '#212529',
    relleno: '#ffffff',
    cabeza: '#343a40',
    kiroContorno: '#0d6efd',
    kiroRelleno: 'rgba(13,110,253,0.1)',
    lapizContorno: '#dc3545',
    marcaRumbo: '#ff6b6b',
    grosor: GROSOR_TRAZO,
  };
}

/** Estado de personajes con la tortuga en el centro y los predeterminados. */
function estadoBase(sobre: Partial<EstadoTortuga> = {}): EstadoPersonajes {
  return {
    tortuga: { ...ESTADO_INICIAL, ...sobre },
    kiroMontado: true,
    inclinacionKiro: 0,
    identidad: 'jugador',
    celebracion: false,
  };
}

// ============================================================================
// Las nueve piezas trazadas (Req 13.1, 13.2)
// ============================================================================

describe('personajes · piezas trazadas', () => {
  it('dibuja con la tortuga visible y registra trazos y rellenos', () => {
    const ctx = new DobleDibujo();
    const r = dibujarPersonajes(ctx, estadoBase(), estiloPersonajes);
    expect(r.valido).toBe(true);
    const metodos = ctx.llamadas.map((l) => l.metodo);
    expect(metodos.filter((m) => m === 'stroke').length).toBeGreaterThan(0);
    expect(metodos.filter((m) => m === 'fill').length).toBeGreaterThan(0);
    expect(metodos.filter((m) => m === 'beginPath').length).toBeGreaterThanOrEqual(9);
  });

  it('el conjunto tiene las nueve piezas: al menos nueve beginPath separados', () => {
    const ctx = new DobleDibujo();
    dibujarPersonajes(ctx, estadoBase(), estiloPersonajes);
    // Cada grupo de piezas abre su propio trayecto: patas traseras, cola, patas
    // delanteras, caparazón, muesca, marca, cuello+cabeza, ojos, Kiro (domo,
    // estela, ojos) y lápiz.
    const begins = ctx.llamadas.filter((l) => l.metodo === 'beginPath').length;
    expect(begins).toBeGreaterThanOrEqual(10);
  });

  it('el módulo personajes.ts no contiene literales de color ni de grosor de dibujo', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const ruta = fileURLToPath(new URL('./personajes.ts', import.meta.url));
    const fuente = readFileSync(ruta, 'utf8');
    const codigo = fuente
      .split('\n')
      .filter((linea) => !linea.trimStart().startsWith('//') && !linea.trimStart().startsWith('*'))
      .join('\n');
    expect(codigo).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(codigo).not.toMatch(/\brgba?\(/);
  });
});

// ============================================================================
// El lápiz: punta abajo ≤ 1 unidad, arriba ≥ 8 unidades (Req 13.5)
// ============================================================================

describe('personajes · lápiz', () => {
  /**
   * Recupera la posición dibujada de la punta del lápiz. El lápiz es la última
   * cápsula trazada; la punta está a distancia mínima de la posición de la tortuga.
   * Con la tortuga en el origen y rumbo 0, la distancia de la punta al origen es
   * la que fija el diseño: 0 abajo, 8.6 arriba.
   */
  function distanciaPuntaAlOrigen(lapizAbajo: boolean): number {
    const ctx = new DobleDibujo();
    dibujarPersonajes(ctx, estadoBase({ lapizAbajo }), estiloPersonajes);
    // Recorremos todas las llamadas moveTo/lineTo y tomamos el punto más cercano
    // al origen entre las del último subtrazado (el lápiz se dibuja al final).
    const puntos: Array<[number, number]> = [];
    for (const l of ctx.llamadas) {
      if (l.metodo === 'moveTo' || l.metodo === 'lineTo') {
        puntos.push([l.args[0] as number, l.args[1] as number]);
      }
    }
    // El lápiz abajo tiene su punta en el origen; buscamos el mínimo radio global.
    let minimo = Infinity;
    for (const [x, y] of puntos) {
      const r = Math.hypot(x, y);
      if (r < minimo) minimo = r;
    }
    return minimo;
  }

  it('con el lápiz abajo la punta cae a 1 unidad o menos del origen', () => {
    expect(distanciaPuntaAlOrigen(true)).toBeLessThanOrEqual(1);
  });

  it('con el lápiz arriba el punto más cercano se aleja del origen (punta a 8.6)', () => {
    // Al subir el lápiz, la punta se traslada 8.6 a lo largo de su eje, así que ya
    // ningún vértice del lápiz cae junto al origen. Comprobamos sobre el lápiz solo.
    const ctxAbajo = new DobleDibujo();
    dibujarPersonajes(ctxAbajo, estadoBase({ lapizAbajo: true }), estiloPersonajes);
    const ctxArriba = new DobleDibujo();
    dibujarPersonajes(ctxArriba, estadoBase({ lapizAbajo: false }), estiloPersonajes);

    // Extraemos el último subtrazado (el lápiz) de cada dibujo por sus vértices.
    const lapizDe = (ctx: DobleDibujo): Array<[number, number]> => {
      const grupos: Array<Array<[number, number]>> = [];
      let actual: Array<[number, number]> = [];
      for (const l of ctx.llamadas) {
        if (l.metodo === 'moveTo') {
          if (actual.length > 0) grupos.push(actual);
          actual = [[l.args[0] as number, l.args[1] as number]];
        } else if (l.metodo === 'lineTo') {
          actual.push([l.args[0] as number, l.args[1] as number]);
        }
      }
      if (actual.length > 0) grupos.push(actual);
      return grupos[grupos.length - 1]!;
    };

    const puntaMin = (grupo: Array<[number, number]>): number =>
      Math.min(...grupo.map(([x, y]) => Math.hypot(x, y)));

    expect(puntaMin(lapizDe(ctxAbajo))).toBeLessThanOrEqual(1);
    expect(puntaMin(lapizDe(ctxArriba))).toBeGreaterThanOrEqual(8);
  });
});

// ============================================================================
// Tortuga oculta: no dibuja nada (Req 13.7)
// ============================================================================

describe('personajes · tortuga oculta', () => {
  it('con visible false no traza ni rellena nada', () => {
    const ctx = new DobleDibujo();
    const r = dibujarPersonajes(ctx, estadoBase({ visible: false }), estiloPersonajes);
    expect(r.valido).toBe(true);
    expect(ctx.llamadas.length).toBe(0);
    expect(ctx.encendidos()).toBe(0);
  });
});

// ============================================================================
// Inclinación de Kiro fuera de rango se acota (Req 13.8)
// ============================================================================

describe('personajes · inclinación de Kiro', () => {
  it('una inclinación de 100 grados produce el mismo dibujo que 20', () => {
    const ctx100 = new DobleDibujo();
    dibujarPersonajes(ctx100, { ...estadoBase(), inclinacionKiro: 100 }, estiloPersonajes);
    const ctx20 = new DobleDibujo();
    dibujarPersonajes(ctx20, { ...estadoBase(), inclinacionKiro: 20 }, estiloPersonajes);
    expect(mascarasIguales(ctx100.mascara(), ctx20.mascara())).toBe(true);
  });

  it('una inclinación de −100 grados produce el mismo dibujo que −20', () => {
    const ctxNeg = new DobleDibujo();
    dibujarPersonajes(ctxNeg, { ...estadoBase(), inclinacionKiro: -100 }, estiloPersonajes);
    const ctx20 = new DobleDibujo();
    dibujarPersonajes(ctx20, { ...estadoBase(), inclinacionKiro: -20 }, estiloPersonajes);
    expect(mascarasIguales(ctxNeg.mascara(), ctx20.mascara())).toBe(true);
  });

  it('con inclinación 0 Kiro no se gira (dibujo determinista)', () => {
    const a = new DobleDibujo();
    dibujarPersonajes(a, { ...estadoBase(), inclinacionKiro: 0 }, estiloPersonajes);
    const b = new DobleDibujo();
    dibujarPersonajes(b, { ...estadoBase(), inclinacionKiro: 0 }, estiloPersonajes);
    expect(mascarasIguales(a.mascara(), b.mascara())).toBe(true);
  });
});

// ============================================================================
// Los tres campos reservados dan el mismo dibujo (Req 13.11)
// ============================================================================

describe('personajes · campos reservados', () => {
  const identidades: IdentidadTortuga[] = ['jugador', 'kiro'];

  it('kiroMontado, identidad y celebracion no cambian el dibujo', () => {
    const referencia = new DobleDibujo();
    dibujarPersonajes(referencia, estadoBase(), estiloPersonajes);
    const mReferencia = referencia.mascara();

    for (const kiroMontado of [true, false]) {
      for (const identidad of identidades) {
        for (const celebracion of [true, false]) {
          const ctx = new DobleDibujo();
          dibujarPersonajes(
            ctx,
            { ...estadoBase(), kiroMontado, identidad, celebracion },
            estiloPersonajes,
          );
          expect(mascarasIguales(ctx.mascara(), mReferencia)).toBe(true);
        }
      }
    }
  });
});

// ============================================================================
// Escala visual: agranda el conjunto en torno a la tortuga sin cambiar la geometría
// ============================================================================

describe('personajes · escala visual', () => {
  /** Todos los puntos (moveTo/lineTo/curvas) que el dibujo registró, en orden. */
  function puntosDibujados(ctx: DobleDibujo): number[][] {
    const metodos = ['moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo'];
    return ctx.llamadas.filter((l) => metodos.includes(l.metodo)).map((l) => l.args as number[]);
  }

  it('sin escala, con escala 1 y con una escala inválida el dibujo es idéntico', () => {
    const base = new DobleDibujo();
    dibujarPersonajes(base, estadoBase(), estiloPersonajes);
    const esperado = puntosDibujados(base);

    for (const escala of [undefined, 1, 0, -2, NaN, Infinity]) {
      const ctx = new DobleDibujo();
      dibujarPersonajes(ctx, { ...estadoBase(), escala }, estiloPersonajes);
      expect(puntosDibujados(ctx), `escala ${String(escala)}`).toEqual(esperado);
    }
  });

  it('con escala k cada punto queda k veces más lejos de la posición de la tortuga', () => {
    const base = new DobleDibujo();
    dibujarPersonajes(base, estadoBase({ rumbo: 37 }), estiloPersonajes);
    const sin = puntosDibujados(base);

    const k = 2.4;
    const ctx = new DobleDibujo();
    dibujarPersonajes(ctx, { ...estadoBase({ rumbo: 37 }), escala: k }, estiloPersonajes);
    const con = puntosDibujados(ctx);

    expect(con.length).toBe(sin.length);
    // Con la tortuga en el origen, escalar en torno a ella es multiplicar por k.
    sin.forEach((args, i) => {
      args.forEach((valor, j) => expect(con[i]![j]!).toBeCloseTo(valor * k, 9));
    });
  });

  it('escala en torno a la posición de la tortuga, no del origen', () => {
    const posicion = { x: 120, y: -80 };
    const sin = new DobleDibujo();
    dibujarPersonajes(sin, estadoBase({ posicion }), estiloPersonajes);
    const k = 2;
    const con = new DobleDibujo();
    dibujarPersonajes(con, { ...estadoBase({ posicion }), escala: k }, estiloPersonajes);

    const a = puntosDibujados(sin);
    const b = puntosDibujados(con);
    a.forEach((args, i) => {
      args.forEach((valor, j) => {
        const centro = j % 2 === 0 ? posicion.x : posicion.y;
        expect(b[i]![j]!).toBeCloseTo(centro + (valor - centro) * k, 9);
      });
    });
  });

  it('no cambia el grosor del trazo ni los colores', () => {
    const base = new DobleDibujo();
    dibujarPersonajes(base, estadoBase(), estiloPersonajes);
    const grande = new DobleDibujo();
    dibujarPersonajes(grande, { ...estadoBase(), escala: 3 }, estiloPersonajes);

    const ajustes = (ctx: DobleDibujo) =>
      ctx.llamadas.filter((l) => !['moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo'].includes(l.metodo));
    expect(ajustes(grande)).toEqual(ajustes(base));
  });
});

// ============================================================================
// Presentación: opciones de estilo y Kiro completo
// ============================================================================

/** Doble que anota con qué color se rellenó y se trazó cada vez. */
class DobleConColores extends DobleDibujo {
  readonly rellenos: string[] = [];
  readonly trazos: string[] = [];

  override fill(): void {
    this.rellenos.push(String(this.fillStyle));
    super.fill();
  }

  override stroke(): void {
    this.trazos.push(String(this.strokeStyle));
    super.stroke();
  }
}

function dibujarConColores(
  estilo: EstiloPersonajes,
  estado: EstadoPersonajes = estadoBase(),
): DobleConColores {
  const ctx = new DobleConColores();
  dibujarPersonajes(ctx, estado, () => estilo);
  return ctx;
}

describe('personajes · Kiro se dibuja completo', () => {
  it('pinta su cuerpo con el relleno de Kiro y sus ojos aparte, después del resto de la tortuga', () => {
    const base = estiloPersonajes();
    const ctx = dibujarConColores({ ...base, kiroOjos: '#111111' });
    // Los dos últimos rellenos son Kiro: primero el cuerpo y luego los ojos.
    expect(ctx.rellenos.slice(-2)).toEqual([base.kiroRelleno, '#111111']);
  });

  it('sin color propio para los ojos, estos usan el contorno de Kiro', () => {
    const base = estiloPersonajes();
    const ctx = dibujarConColores(base);
    expect(ctx.rellenos.slice(-2)).toEqual([base.kiroRelleno, base.kiroContorno]);
  });

  it('contornea el cuerpo y la estela de Kiro con su color', () => {
    const base = estiloPersonajes();
    const ctx = dibujarConColores(base);
    const deKiro = ctx.trazos.filter((c) => c === base.kiroContorno);
    // Cuerpo y estela: dos trazos con el contorno de Kiro.
    expect(deKiro.length).toBe(2);
  });

  it('con la inclinación en el extremo sigue pintando las mismas piezas', () => {
    const normal = dibujarConColores(estiloPersonajes());
    const inclinado = dibujarConColores(estiloPersonajes(), { ...estadoBase(), inclinacionKiro: INCLINACION_MAXIMA });
    expect(inclinado.rellenos).toEqual(normal.rellenos);
    expect(inclinado.trazos).toEqual(normal.trazos);
  });
});

describe('personajes · opciones de presentación del tema', () => {
  it('sin ninguna opción, el dibujo es el del diseño: flecha, lápiz siempre y concha del color de la piel', () => {
    const base = estiloPersonajes();
    const ctx = dibujarConColores(base);
    expect(ctx.trazos).toContain(base.marcaRumbo);
    expect(ctx.trazos).toContain(base.lapizContorno);
    // Todo el cuerpo con el mismo relleno: patas, cola, caparazón y cabeza.
    expect(ctx.rellenos.slice(0, 5)).toEqual(Array(5).fill(base.relleno));
  });

  it('caparazon da otro tono solo a la concha', () => {
    const base = estiloPersonajes();
    const ctx = dibujarConColores({ ...base, caparazon: '#0a8f66' });
    // Orden de trazado: patas traseras, cola, patas delanteras, caparazón, cabeza.
    expect(ctx.rellenos.slice(0, 5)).toEqual([base.relleno, base.relleno, base.relleno, '#0a8f66', base.relleno]);
  });

  it('detalle dibuja los escudos del caparazón con ese color, y sin él no se dibujan', () => {
    const base = estiloPersonajes();
    const sin = dibujarConColores(base);
    const con = dibujarConColores({ ...base, detalle: '#06503b' });
    expect(con.trazos.filter((c) => c === '#06503b').length).toBe(1);
    expect(sin.trazos).not.toContain('#06503b');
    expect(con.trazos.length).toBe(sin.trazos.length + 1);
  });

  it('los escudos son más finos que el contorno y no cambian el grosor de lo que se pinta después', () => {
    const base = estiloPersonajes();
    const ctx = new DobleDibujo();
    const grosores: number[] = [];
    const original = ctx.stroke.bind(ctx);
    ctx.stroke = () => {
      grosores.push(ctx.lineWidth);
      original();
    };
    dibujarPersonajes(ctx, estadoBase(), () => ({ ...base, detalle: '#06503b' }));
    expect(Math.min(...grosores)).toBeCloseTo(base.grosor * 0.6, 9);
    // Lo que se traza después de los escudos vuelve al grosor normal.
    expect(grosores[grosores.length - 1]).toBe(base.grosor);
  });

  it('mostrarMarcaRumbo false quita la flecha y nada más', () => {
    const base = estiloPersonajes();
    const con = dibujarConColores(base);
    const sin = dibujarConColores({ ...base, mostrarMarcaRumbo: false });
    expect(sin.trazos).not.toContain(base.marcaRumbo);
    expect(sin.trazos.length).toBe(con.trazos.length - 1);
    expect(sin.rellenos).toEqual(con.rellenos);
  });

  it('mostrarLapiz solo-arriba oculta el lápiz mientras escribe', () => {
    const base = estiloPersonajes();
    const abajo = dibujarConColores({ ...base, mostrarLapiz: 'solo-arriba' }, estadoBase({ lapizAbajo: true }));
    expect(abajo.trazos).not.toContain(base.lapizContorno);
  });

  it('mostrarLapiz solo-arriba lo dibuja igual que siempre cuando está levantado: el cambio sigue siendo visible', () => {
    const base = estiloPersonajes();
    const estado = estadoBase({ lapizAbajo: false });
    const siempre = new DobleDibujo();
    dibujarPersonajes(siempre, estado, () => base);
    const soloArriba = new DobleDibujo();
    dibujarPersonajes(soloArriba, estado, () => ({ ...base, mostrarLapiz: 'solo-arriba' }));
    expect(mascarasIguales(soloArriba.mascara(), siempre.mascara())).toBe(true);
    expect(dibujarConColores({ ...base, mostrarLapiz: 'solo-arriba' }, estado).trazos).toContain(base.lapizContorno);
  });

  it('con solo-arriba, levantar el lápiz cambia el dibujo y bajarlo lo devuelve', () => {
    const base = { ...estiloPersonajes(), mostrarLapiz: 'solo-arriba' as const };
    const dibujo = (lapizAbajo: boolean): DobleDibujo => {
      const ctx = new DobleDibujo();
      dibujarPersonajes(ctx, estadoBase({ lapizAbajo }), () => base);
      return ctx;
    };
    expect(mascarasIguales(dibujo(true).mascara(), dibujo(false).mascara())).toBe(false);
    expect(mascarasIguales(dibujo(true).mascara(), dibujo(true).mascara())).toBe(true);
  });

  it('las opciones no mueven ningún punto: la geometría y el radio máximo siguen siendo los del diseño', () => {
    const base = estiloPersonajes();
    const diseno = new DobleDibujo();
    dibujarPersonajes(diseno, estadoBase({ rumbo: 70 }), () => base);
    const presentado = new DobleDibujo();
    dibujarPersonajes(presentado, estadoBase({ rumbo: 70 }), () => ({
      ...base,
      caparazon: '#0a8f66',
      detalle: '#06503b',
      kiroOjos: '#111111',
      mostrarLapiz: 'solo-arriba',
      mostrarMarcaRumbo: false,
    }));
    expect(presentado.radioMaximoDesdeOrigen()).toBeLessThanOrEqual(diseno.radioMaximoDesdeOrigen() + 1e-9);
  });
});

// ============================================================================
// Estado inválido (Req 13.10)
// ============================================================================

describe('personajes · estado inválido', () => {
  it('una posición no finita devuelve inválido sin dibujar ni lanzar', () => {
    for (const malo of [NaN, Infinity, -Infinity]) {
      const ctx = new DobleDibujo();
      const r = dibujarPersonajes(
        ctx,
        estadoBase({ posicion: { x: malo, y: 0 } }),
        estiloPersonajes,
      );
      expect(r.valido).toBe(false);
      if (!r.valido) {
        expect(r.campo).toBe('posicion.x');
        expect(r.valorRecibido).toBe(malo);
      }
      expect(ctx.llamadas.length).toBe(0);
    }
  });

  it('un rumbo no finito devuelve inválido nombrando el campo', () => {
    const ctx = new DobleDibujo();
    const r = dibujarPersonajes(ctx, estadoBase({ rumbo: NaN }), estiloPersonajes);
    expect(r.valido).toBe(false);
    if (!r.valido) expect(r.campo).toBe('rumbo');
    expect(ctx.llamadas.length).toBe(0);
  });

  it('una inclinación no finita devuelve inválido nombrando el campo', () => {
    const ctx = new DobleDibujo();
    const r = dibujarPersonajes(
      ctx,
      { ...estadoBase(), inclinacionKiro: Infinity },
      estiloPersonajes,
    );
    expect(r.valido).toBe(false);
    if (!r.valido) expect(r.campo).toBe('inclinacionKiro');
    expect(ctx.llamadas.length).toBe(0);
  });
});

// ============================================================================
// Property 14 (parte A, personajes): legibilidad del rumbo y círculo de 40
// Valida: Requisitos 13.3, 13.6, 13.8, 13.9
// ============================================================================

describe('Property 14A: legibilidad del rumbo e inscripción en el círculo', () => {
  /** Dibuja la silueta de la tortuga con un rumbo dado, en un doble fresco. */
  function siluetaConRumbo(
    rumbo: number,
    lapizAbajo: boolean,
    inclinacion: number,
  ): DobleDibujo {
    const ctx = new DobleDibujo();
    dibujarPersonajes(
      ctx,
      { ...estadoBase({ rumbo, lapizAbajo }), inclinacionKiro: inclinacion },
      estiloPersonajes,
    );
    return ctx;
  }

  it('el IoU de la silueta contra ella misma girada 15..345 grados es menor que 0.90', () => {
    // Medimos con el rumbo base 0. Cada múltiplo de 15 entre 15 y 345 debe dar un
    // IoU estrictamente menor que 0.90 contra el rumbo 0.
    const base = siluetaConRumbo(0, true, 0).mascara();
    let peorIoU = 0;
    for (let g = 15; g <= 345; g += 15) {
      const girada = siluetaConRumbo(g, true, 0).mascara();
      const valor = iou(base, girada);
      peorIoU = Math.max(peorIoU, valor);
      expect(valor).toBeLessThan(0.9);
    }
    // Deja constancia del peor IoU medido (debe quedar bajo 0.90).
    expect(peorIoU).toBeLessThan(0.9);
  }, 30_000);

  it('el radio máximo de todo punto trazado es ≤ 20 para todo rumbo, lápiz y extremos de inclinación', () => {
    const margen = GROSOR_TRAZO / 2; // 0.75
    for (let g = 0; g < 360; g += 15) {
      for (const lapizAbajo of [true, false]) {
        for (const inclinacion of [-INCLINACION_MAXIMA, 0, INCLINACION_MAXIMA]) {
          const ctx = siluetaConRumbo(g, lapizAbajo, inclinacion);
          const radio = ctx.radioMaximoDesdeOrigen() + margen;
          expect(radio).toBeLessThanOrEqual(20);
        }
      }
    }
  }, 30_000);

  it('Property: sobre 200 semillas el radio máximo (con mitad de trazo) es ≤ 20', () => {
    const margen = GROSOR_TRAZO / 2;
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4_294_967_295 }), (semilla) => {
        const prng = crearPrng(semilla);
        const rumbo = prng.siguiente() * 360;
        const lapizAbajo = prng.siguiente() < 0.5;
        const inclinacion = (prng.siguiente() * 2 - 1) * INCLINACION_MAXIMA;
        const ctx = siluetaConRumbo(rumbo, lapizAbajo, inclinacion);
        const radio = ctx.radioMaximoDesdeOrigen() + margen;
        expect(radio).toBeLessThanOrEqual(20);
      }),
      { seed: 141, numRuns: 200 },
    );
  }, 30_000);
});

// ============================================================================
// Hueco de la tarea 3.1: el lápiz en sus dos posiciones y la marca de rumbo apagada
//
// `personajes.ts` consume las opciones ya resueltas del tema: `mostrarLapiz`
// (`siempre` | `solo-arriba`) y `mostrarMarcaRumbo` (booleano). El mapeo desde las
// variables del tema vive en `main.ts`: `--lapiz-mostrar: arriba` → `solo-arriba`,
// cualquier otro valor o ausente → `siempre`; `--marca-rumbo-mostrar: no` → false,
// cualquier otro valor o ausente → true (eso ya está probado en `main.test.ts`).
//
// Lo ya cubierto arriba: el lápiz abajo (punta ≤ 1), el lápiz arriba (se aleja),
// `solo-arriba` oculta el lápiz al escribir, y «mostrarMarcaRumbo false quita la
// flecha» al rumbo 0. Aquí se cierra el hueco de la semántica base por defecto:
// con el lápiz dibujándose SIEMPRE se ve en SUS DOS posiciones, y la marca de rumbo
// apagada no deja ni un solo trazo de marca, para cualquier rumbo.
// Valida: Requisitos 3.1, 3.3, 3.4
// ============================================================================

describe('personajes · lápiz en sus dos posiciones por omisión (Req 3.3)', () => {
  // Con `--lapiz-mostrar` ausente o con cualquier valor distinto de `arriba`,
  // `main.ts` entrega `mostrarLapiz: 'siempre'`; además, cuando la propiedad falta
  // por completo, `personajes.ts` también debe dibujar el lápiz en ambas posiciones.
  const sinOpcion = (): EstiloPersonajes => estiloPersonajes();
  const conSiempre = (): EstiloPersonajes => ({ ...estiloPersonajes(), mostrarLapiz: 'siempre' });

  for (const [nombre, estilo] of [
    ['sin la opción mostrarLapiz', sinOpcion],
    ['con mostrarLapiz: siempre', conSiempre],
  ] as const) {
    it(`${nombre}, el lápiz se dibuja con el lápiz abajo y con el lápiz arriba`, () => {
      const base = estilo();
      const abajo = dibujarConColores(estilo(), estadoBase({ lapizAbajo: true }));
      const arriba = dibujarConColores(estilo(), estadoBase({ lapizAbajo: false }));
      // En ambos estados aparece el trazo del lápiz: se dibuja en sus dos posiciones.
      expect(abajo.trazos).toContain(base.lapizContorno);
      expect(arriba.trazos).toContain(base.lapizContorno);
      // Y el lápiz cae en un lugar distinto según su estado, así que el cambio se ve.
      const ctxAbajo = new DobleDibujo();
      dibujarPersonajes(ctxAbajo, estadoBase({ lapizAbajo: true }), estilo);
      const ctxArriba = new DobleDibujo();
      dibujarPersonajes(ctxArriba, estadoBase({ lapizAbajo: false }), estilo);
      expect(mascarasIguales(ctxAbajo.mascara(), ctxArriba.mascara())).toBe(false);
    });
  }

  it('un valor desconocido de mostrarLapiz se trata como «siempre»: dibuja en ambas posiciones', () => {
    // El tipo admite solo `siempre | solo-arriba`; un tema mal formado podría colar
    // otro texto. `personajes.ts` solo oculta el lápiz cuando es exactamente
    // `solo-arriba`, de modo que cualquier otro valor cae en «dibujar siempre».
    const raro = { ...estiloPersonajes(), mostrarLapiz: 'cualquier-cosa' as unknown as 'siempre' };
    const abajo = dibujarConColores(raro, estadoBase({ lapizAbajo: true }));
    const arriba = dibujarConColores(raro, estadoBase({ lapizAbajo: false }));
    expect(abajo.trazos).toContain(raro.lapizContorno);
    expect(arriba.trazos).toContain(raro.lapizContorno);
  });
});

describe('personajes · marca de rumbo apagada (Req 3.4)', () => {
  it('con mostrarMarcaRumbo false no se dibuja ninguna marca de rumbo, para cualquier rumbo', () => {
    const base = estiloPersonajes();
    for (let rumbo = 0; rumbo < 360; rumbo += 30) {
      const sin = dibujarConColores(
        { ...base, mostrarMarcaRumbo: false },
        estadoBase({ rumbo }),
      );
      // Ni un solo trazo lleva el color de la marca de rumbo: la marca no existe.
      expect(sin.trazos, `rumbo ${rumbo}`).not.toContain(base.marcaRumbo);
    }
  });

  it('apagar la marca de rumbo solo quita ese trazo: el resto del dibujo no cambia', () => {
    const base = estiloPersonajes();
    const con = dibujarConColores(base);
    const sin = dibujarConColores({ ...base, mostrarMarcaRumbo: false });
    // Exactamente un trazo menos —el de la marca— y los rellenos intactos.
    expect(sin.trazos.length).toBe(con.trazos.length - 1);
    expect(sin.rellenos).toEqual(con.rellenos);
    // Esos trazos restantes son los mismos, salvo la única marca retirada.
    const restanteEsperado = [...con.trazos];
    restanteEsperado.splice(con.trazos.indexOf(base.marcaRumbo), 1);
    expect(sin.trazos).toEqual(restanteEsperado);
  });
});
