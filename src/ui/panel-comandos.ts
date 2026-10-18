// Panel de comandos desbloqueados de KiroLogo. Lista los comandos que
// `comandosDelMundo` devuelve para el mundo del nivel, en su orden, sin lista
// propia. Al activar uno, pide al editor insertar su texto de inserción en el cursor.
//
// No trunca el texto: lo entrega íntegro y deja que el editor aplique su regla
// de límites y que el editor pida el mensaje al globo. Las dependencias del DOM,
// el insertador del editor y el anunciador de la región aria-live entran por
// parámetro, para poder probar en jsdom.

import { comandosDelMundo, type EntradaVocabulario, type Mundo } from '../lenguaje/vocabulario.js';

// ============================================================================
// Dependencias inyectables
// ============================================================================

export interface DependenciasPanel {
  /** Contenedor del DOM donde el panel crea sus elementos. */
  readonly contenedor: HTMLElement;
  /** Mundo del nivel en curso; determina qué comandos se presentan. */
  readonly mundo: Mundo;
  /**
   * Pide al editor insertar el texto de inserción de la entrada en la posición
   * del cursor y devuelve la línea (desde 1) donde quedó el cursor. El editor
   * aplica límites.
   */
  readonly insertarTexto: (texto: string) => number;
  /**
   * Publica un texto en la región `aria-live` `polite` del juego, sin mover el
   * foco. El panel no tiene región propia: usa la única del juego.
   */
  readonly anunciar: (texto: string) => void;
}

// ============================================================================
// Nombre accesible y texto visible de una entrada
// ============================================================================

/**
 * Compone el texto de una entrada: nombre largo, abreviatura, descripción y
 * ejemplo, carácter por carácter tal como el vocabulario los declara.
 */
export function textoDeEntrada(entrada: EntradaVocabulario): string {
  const abrev = entrada.abreviatura === null ? '' : ` (${entrada.abreviatura})`;
  return `${entrada.nombre}${abrev}. ${entrada.descripcion} Ejemplo: ${entrada.ejemplo}`;
}

/** Lo que dice la línea de ayuda cuando ningún comando tiene el cursor ni el foco. */
export const TEXTO_AYUDA_INICIAL =
  'Pulsa un comando para escribirlo en tu programa. Pasa el cursor para ver qué hace.';

/**
 * Reparte el texto de una entrada en trozos con clase propia para que la hoja de
 * estilos pueda darle forma (nombre y ejemplo destacados, descripción en pequeño)
 * SIN cambiar una letra: el `textContent` del botón es exactamente
 * `textoDeEntrada(entrada)`. Los separadores de lectura («. », «Ejemplo: ») van en
 * trozos aparte que el CSS oculta a la vista, pero que siguen en el texto.
 */
function rellenarBoton(doc: Document, boton: HTMLButtonElement, entrada: EntradaVocabulario): void {
  function trozo(etiqueta: 'span' | 'code', clase: string, texto: string): HTMLElement {
    const el = doc.createElement(etiqueta);
    el.className = clase;
    el.textContent = texto;
    return el;
  }

  const titulo = trozo('span', 'kl-comando-titulo', '');
  titulo.appendChild(trozo('span', 'kl-comando-nombre', entrada.nombre));
  if (entrada.abreviatura !== null) {
    titulo.appendChild(trozo('span', 'kl-comando-abrev', ` (${entrada.abreviatura})`));
  }

  boton.appendChild(titulo);
  boton.appendChild(trozo('span', 'kl-comando-sep', '. '));
  boton.appendChild(trozo('span', 'kl-comando-desc', entrada.descripcion));
  boton.appendChild(trozo('span', 'kl-comando-sep', ' Ejemplo: '));
  boton.appendChild(trozo('code', 'kl-comando-ejemplo', entrada.ejemplo));
}

// ============================================================================
// Interfaz pública
// ============================================================================

export interface PanelComandos {
  /** Elemento raíz del panel. */
  readonly raiz: HTMLElement;
  /** Botones de comando, en el orden en que el vocabulario los devuelve. */
  readonly botones: readonly HTMLButtonElement[];
  /** Línea de ayuda con lo que hace el comando señalado (texto inicial si no hay ninguno). */
  readonly ayuda: HTMLElement;
  /** Entradas presentadas, en orden. */
  readonly entradas: readonly EntradaVocabulario[];
  /** Activa el comando de un índice como si el jugador lo hubiese pulsado. */
  activar(indice: number): void;
}

// ============================================================================
// Creación
// ============================================================================

/**
 * Crea el panel de comandos sobre un contenedor. Un botón por entrada del
 * vocabulario del mundo, en su orden, con el texto visible y el nombre accesible
 * completos. Al activar (ratón, Enter o barra espaciadora, que el botón nativo ya
 * maneja) inserta el ejemplo íntegro por el insertador del editor y anuncia el
 * comando insertado y la línea del cursor.
 */
export function crearPanelComandos(deps: DependenciasPanel): PanelComandos {
  const doc = deps.contenedor.ownerDocument;
  const entradas = comandosDelMundo(deps.mundo);

  const raiz = doc.createElement('div');
  raiz.className = 'kl-panel-comandos';
  // Barra de herramientas con UNA sola parada de Tab (patrón «roving tabindex»): los
  // seis atajos van junto al editor y se recorren con las flechas. Así el foco sigue el
  // orden visual sin añadir seis Tabs antes de «Ejecutar» (requisitos 24.5 y 28.1), y
  // un Tab nunca queda atrapado: sale del panel.
  raiz.setAttribute('role', 'toolbar');
  raiz.setAttribute('aria-label', 'Comandos disponibles');

  const botones: HTMLButtonElement[] = [];

  // Ayuda: lo que hace el comando sobre el que está el cursor o el foco, para que cada
  // botón pueda ser solo lo que se va a escribir y todos quepan a la vez. Junto al
  // editor es un globo que aparece al lado del botón señalado (`kl-activa`, y `top`
  // alineado con él); en pantallas estrechas es una línea fija bajo los botones. Es
  // solo para la vista: cada botón ya lleva su texto completo como nombre accesible,
  // así que a los lectores de pantalla no se les repite.
  const ayuda = doc.createElement('p');
  ayuda.className = 'kl-comandos-ayuda';
  ayuda.setAttribute('aria-hidden', 'true');
  ayuda.textContent = TEXTO_AYUDA_INICIAL;

  function activarEntrada(entrada: EntradaVocabulario): void {
    // Inserta el texto de inserción de la entrada (el nombre más un espacio para
    // los comandos con argumento, el nombre solo para los de aridad cero); el
    // editor aplica límites y pide el mensaje.
    const linea = deps.insertarTexto(entrada.insercion);
    deps.anunciar(`Inserté ${entrada.nombre} en la línea ${linea}.`);
  }

  for (const entrada of entradas) {
    const boton = doc.createElement('button');
    boton.type = 'button';
    boton.className = 'kl-comando';
    boton.setAttribute('data-comando', entrada.nombre);
    // Lo que el botón escribe en el editor, expuesto para que el CSS lo muestre
    // como texto visible del atajo (`::before` con `attr(data-insercion)`).
    boton.setAttribute('data-insercion', entrada.insercion);
    // Texto visible: nombre, abreviatura, descripción y ejemplo.
    rellenarBoton(doc, boton, entrada);
    // Nombre accesible en español con el mismo contenido.
    boton.setAttribute('aria-label', textoDeEntrada(entrada));
    // Un botón nativo se activa con ratón, Enter y barra espaciadora, y conserva
    // el foco al activarse; no captura el foco (Tab lo mueve al siguiente).
    boton.addEventListener('click', () => activarEntrada(entrada));
    // La ayuda sigue al cursor y al teclado por igual.
    for (const evento of ['mouseenter', 'focus']) {
      boton.addEventListener(evento, () => {
        ayuda.textContent = textoDeEntrada(entrada);
        ayuda.style.top = `${boton.offsetTop}px`;
        ayuda.classList.add('kl-activa');
      });
    }
    for (const evento of ['mouseleave', 'blur']) {
      boton.addEventListener(evento, () => {
        ayuda.textContent = TEXTO_AYUDA_INICIAL;
        ayuda.classList.remove('kl-activa');
      });
    }
    raiz.appendChild(boton);
    botones.push(boton);
  }
  raiz.appendChild(ayuda);

  // Una sola parada de Tab: solo el último botón con el foco (al inicio, el primero) es
  // alcanzable con Tab; los demás, con las flechas.
  function marcarActivo(i: number): void {
    botones.forEach((b, k) => {
      b.tabIndex = k === i ? 0 : -1;
    });
  }
  function enfocar(i: number): void {
    const n = botones.length;
    if (n === 0) return;
    botones[((i % n) + n) % n]!.focus();
  }
  botones.forEach((b, i) => b.addEventListener('focus', () => marcarActivo(i)));
  raiz.addEventListener('keydown', (e: KeyboardEvent) => {
    const i = botones.indexOf(doc.activeElement as HTMLButtonElement);
    if (i < 0) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        enfocar(i + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        enfocar(i - 1);
        break;
      case 'Home':
        enfocar(0);
        break;
      case 'End':
        enfocar(botones.length - 1);
        break;
      default:
        return; // Tab, Enter y la barra espaciadora siguen su curso normal
    }
    e.preventDefault();
  });
  marcarActivo(0);

  deps.contenedor.appendChild(raiz);

  return {
    raiz,
    botones,
    ayuda,
    entradas,
    activar(indice: number): void {
      const entrada = entradas[indice];
      if (entrada === undefined) return;
      activarEntrada(entrada);
    },
  };
}
