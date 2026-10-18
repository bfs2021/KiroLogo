# Implementation Plan: KiroLogo · Spec 09 · Ajustes de interfaz

## Overview

Esta spec hace tres ajustes acotados sobre la pantalla ya aprobada por la spec 08, sin tocar nada
fuera de su alcance. El plan se agrupa en los tres ajustes del diseño y respeta sus dependencias
reales: primero el campo `insercion` del Vocabulario y el Panel_Comandos sin números; luego los
colores planos con su prueba estructural; y por último el Menu_Mundos que reemplaza al
Selector_Nivel. Cierra con el registro en la Bitacora y la verificación de `npm test`,
`npm run typecheck` y `npm run build` en verde.

Convenciones del proyecto: TypeScript estricto, ESM con imports `.js`, dominio en español, archivos
en kebab-case, pruebas junto a su módulo (`x.ts` + `x.test.ts`) y pruebas transversales en
`main.test.ts` (regla 21.3). Todo el azar pasa por `azar/prng.ts`; nada de `Math.random`.

## Tasks

- [x] 1. Ajuste 1 · Campo `insercion` en el Vocabulario y atajos sin números
  - [x] 1.1 Ampliar `EntradaVocabulario` con `insercion` y poblar las 28 entradas
    - Añadir `readonly insercion: string;` a la interfaz `EntradaVocabulario` en `src/lenguaje/vocabulario.ts`
    - Poblar `insercion` como literal en cada una de las 28 entradas de `VOCABULARIO` según la tabla de verificación del diseño: aridad 1 con `tiposArgumento[0] === 'numero'` → `nombre + ' '`; aridad 0 → `nombre`; resto → `ejemplo`
    - El mundo 0 (AVANZA, RETROCEDE, GIRADERECHA, GIRAIZQUIERDA, CENTRO, BORRAPANTALLA) queda sin ningún dígito en su `insercion`
    - No modificar el campo `ejemplo` de ninguna entrada; mantener `VOCABULARIO` como `readonly … as const`
    - _Requisitos: 1.1, 1.5, 1.6_

  - [x] 1.2 Escribir la prueba P1 de la regla de `insercion` (exhaustiva)
    - En `src/lenguaje/vocabulario.test.ts`, recorrer las 28 entradas de `VOCABULARIO` y verificar que `insercion` cumple la regla derivada: `nombre + ' '` si `aridad === 1` y `tiposArgumento[0] === 'numero'`; `nombre` si `aridad === 0`; `ejemplo` en cualquier otro caso
    - Comentario de la prueba: `// Feature: 09-ajustes-de-interfaz, Property 1: insercion cumple su regla derivada de los campos`
    - _Requisitos: 1.1, 1.5_

  - [x] 1.3 Adaptar `panel-comandos.ts` para insertar `insercion` y exponer `data-insercion`
    - Renombrar la dependencia `insertarEjemplo` → `insertarTexto` en `DependenciasPanel` (`insertarTexto: (texto: string) => number`)
    - En `activarEntrada`, insertar `entrada.insercion` (antes `entrada.ejemplo`); conservar el anuncio `Inserté ${entrada.nombre} en la línea ${linea}.`
    - En `rellenarBoton` (o en la creación del botón), añadir `boton.setAttribute('data-insercion', entrada.insercion)` junto a `data-comando`
    - No tocar `textContent` ni los trozos del botón: `.kl-comando-ejemplo` sigue con `entrada.ejemplo` íntegro y `textContent === textoDeEntrada(entrada)`; `textoDeEntrada` no cambia
    - Adaptar `main.ts` en la misma tarea: cambiar el montaje del panel para usar `insertarTexto: (t) => editor.insertarEnCursor(t)` (antes `insertarEjemplo`), de modo que el renombre del callback y su uso en `main.ts` ocurran juntos y `tsc` nunca quede en rojo entre olas
    - _Requisitos: 1.2, 1.3, 1.4, 1.5, 2.4_

  - [x] 1.4 Actualizar las pruebas afectadas de `panel-comandos.test.ts` sin debilitarlas
    - Actualizar las aserciones de inserción al nuevo contrato: «inserción», «reemplaza la selección» y «agrega al final» pasan a esperar `'AVANZA '` (y textos acumulados equivalentes); la de teclado pasa de `join(e.ejemplo)` a `join(e.insercion)`; la de «no cambia lo que hace pulsar…» pasa a `toBe(entrada.insercion)` manteniendo intacta la aserción `textContent === textoDeEntrada(entrada)`
    - Añadir una aserción de que el cursor queda tras el espacio insertado y que lo insertado de un atajo no lleva dígitos
    - Renombrar en el montaje `insertarEjemplo: (e) => editor.insertarEnCursor(e)` → `insertarTexto: (t) => editor.insertarEnCursor(t)`
    - No tocar las pruebas de fidelidad de `textContent`, la de reparto de trozos ni la de contenido de `.kl-comando-ejemplo`
    - _Requisitos: 1.2, 1.3, 9.2_

  - [x] 1.5 Hacer visible `insercion` por CSS en `pantalla.css`
    - Añadir `.kl-comando-ejemplo` a la regla de ocultación accesible que ya usan `.kl-comando-titulo`, `.kl-comando-desc` y `.kl-comando-sep` (posición absoluta, 1×1 px, `clip`), retirando el bloque que hoy lo pintaba como único trozo visible
    - Añadir `.kl-comando::before { content: attr(data-insercion); font-family: var(--fuente-codigo, monospace); font-weight: 800; color: var(--acento, …); white-space: nowrap; }`, trasladando la tipografía y color que hoy tenía `.kl-comando-ejemplo`
    - _Requisitos: 1.2, 1.6_

  - [x] 1.6 Escribir la prueba P2 (panel muestra `insercion` sin dígitos en el mundo 0)
    - En `src/ui/panel-comandos.test.ts`, para los seis botones del mundo 0: (a) `data-insercion` no contiene ningún dígito; (b) leyendo `src/estilos/pantalla.css` con `readFileSync`, existe la regla `.kl-comando::before { content: attr(data-insercion); }`; (c) como refuerzo, el `insercion` que muestra el `::before` tampoco contiene dígitos
    - Comentario de la prueba: `// Feature: 09-ajustes-de-interfaz, Property 2: Ningún botón del mundo 0 muestra un dígito`
    - _Requisitos: 1.6, 2.2_

  - [x] 1.7 Añadir el flujo de intento del atajo en `main.test.ts`
    - Pulsar `AVANZA`, escribir `100` tras el espacio insertado y ejecutar en el Nivel 0.1 → otorga las tres estrellas igual que `AVANZA 100`
    - Ejecutar `AVANZA` sin número → muestra el mensaje del Catalogo_Errores (`AVANZA necesita un número. Por ejemplo: AVANZA 100`) y no produce operación de movimiento
    - _Requisitos: 2.1, 2.3_

- [ ] 2. Checkpoint · Ajuste 1 completo
  - Asegurar que todas las pruebas pasan; preguntar al usuario si surgen dudas.

- [x] 3. Ajuste 2 · Colores planos
  - [x] 3.1 Retirar degradados y resplandores difuminados de `pantalla.css`
    - `body`: eliminar `background-image` (los dos `radial-gradient` de color y el de puntos) y sus `background-size`/`background-attachment`; dejar solo `background-color` sólido
    - `.kl-logo`: eliminar la línea `filter: drop-shadow(…)`
    - `.kl-insignia-medalla`: cambiar `background` a dorado sólido (p. ej. `var(--aviso)`); eliminar la sombra de blur `0 0 20px`; conservar el anillo `0 0 0 3px`, la Sombra_Dura `0 4px 0 #8a5a12` y el borde
    - Eliminar por completo `.kl-pluma`, `.kl-pluma::after`, `@keyframes kl-trazar` y la regla de `prefers-reduced-motion` que apaga `.kl-pluma` (CSS sin uso)
    - Conservar intactas las excepciones: `drop-shadow` de `.kl-capa-estela-referencia` y `.kl-capa-estela-jugador`, y el `text-shadow` de `.kl-estrella[data-estado="otorgada"] .kl-estrella-icono`
    - El glow de `.kl-selector-boton[aria-current="step"]` se retira con el módulo en la tarea 5.4; no se toca aquí
    - _Requisitos: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.2 Revisar `tema.css` para color plano
    - Confirmar que `tema.css` no contiene `linear-gradient`, `radial-gradient` ni `conic-gradient` y que sus fichas de color de la paleta Kiro quedan intactas; no editar valores de color
    - _Requisitos: 3.8, 8.1_

- [ ] 4. Checkpoint · Ajuste 2 completo
  - Asegurar que todas las pruebas pasan; preguntar al usuario si surgen dudas.

- [x] 5. Ajuste 3 · Menú de mundos desplegable
  - [x] 5.1 Crear `src/ui/menu-mundos.ts`
    - Implementar la interfaz pública del diseño: `crearMenuMundos`, `MenuMundos`, `EstadoMundo`, `CallbacksMenuMundos`, `DependenciasMenuMundos`
    - Recorrer los seis mundos por `MUNDOS` (0..5); niveles de cada mundo con `CATALOGO.filter(n => n.mundo === m)`; disponibilidad con `mundoDesbloqueado`, `nivelDesbloqueado` y `estadoDeNivel` de `desbloqueo.ts`; insignia del mundo 0 con `insignias.ts`
    - Trasladar `TEXTO_ESTADO`/`SIMBOLO_ESTADO` desde `selector-nivel.ts`
    - Botón de cabecera en `#ranura-ruta` con resumen del nivel en curso (`etiquetaDeMundo` + id + título); panel superpuesto; acordeón (a lo sumo un mundo abierto); patrón de divulgación (`aria-expanded`, `aria-controls`, `region` con nombre accesible); roving tabindex; Enter/Espacio en encabezado; Escape devuelve el foco; clic fuera cierra; mundo del nivel en curso abierto por defecto; «próximamente» para mundos sin niveles; medalla en el encabezado del mundo ganado
    - Derivar `estadoDeMundo`: `proximamente` si el mundo no tiene niveles; `disponible` si `mundoDesbloqueado`; `bloqueado` en otro caso
    - Imports permitidos: `niveles/{catalogo,mundos,tipos}`, `juego/{desbloqueo,insignias,progreso}`, `lenguaje/vocabulario` (tipo `Mundo`). Ninguno hacia `motor/`
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

  - [x] 5.2 Crear `src/ui/menu-mundos.test.ts` migrando las 24 pruebas del selector y añadiendo las nuevas
    - Trasladar las 24 pruebas de `selector-nivel.test.ts` (7 grupos: presentación, en qué mundo estás, contenido del botón, nivel actual, navegación, insignia) al patrón nuevo, ampliadas a seis mundos, usando `crearMenuMundos`, `botonNivel`, `estadoDe`, `insigniaVisible(0)` y las clases `.kl-menu-*`
    - Añadir las pruebas nuevas de comportamiento: seis mundos siempre presentes; acordeón (uno abierto); estado de mundo incl. «próximamente»; teclado/foco (botón de cabecera = 1 parada propia, panel = 1 parada por roving, flechas, Enter/Espacio, Escape devuelve foco, clic fuera cierra); mundo del nivel en curso abierto por defecto; carga y cierre al elegir; bloqueado no carga; nombres accesibles del patrón de divulgación
    - Ninguna aserción migrada se debilita (mapa uno a uno del diseño)
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 9.2_

  - [x] 5.3 Escribir P3 y P4 con fast-check en `menu-mundos.test.ts`
    - P3: para todo progreso alcanzable del mundo 0 y todo nivel del catálogo, el `EstadoNivel` que presenta el menú es igual a `estadoDeNivel(idNivel, progreso)`; `fast-check` con `numRuns: 100` + casos borde explícitos (sin progreso, todo aprobado, todo tres estrellas). Comentario: `// Feature: 09-ajustes-de-interfaz, Property 3: El estado de un nivel en el menú coincide con desbloqueo.ts`
    - P4: para todo progreso alcanzable y todo mundo 0..5, `EstadoMundo` es `proximamente` sii el catálogo no tiene niveles de ese mundo, y `disponible` sii `mundoDesbloqueado(mundo, progreso)`; `fast-check` con `numRuns: 100`. Comentario: `// Feature: 09-ajustes-de-interfaz, Property 4: La presentación de un mundo coincide con mundoDesbloqueado y el catálogo`
    - _Requisitos: 5.1, 5.2, 5.3, 5.5, 6.3, 6.4_

  - [x] 5.4 Retirar `selector-nivel.ts` y migrar el CSS a `.kl-menu-*`
    - Eliminar `src/ui/selector-nivel.ts` y `src/ui/selector-nivel.test.ts`
    - Borrar de `pantalla.css` todas las reglas `.kl-selector-*` (incluida la media query estrecha): `.kl-selector-nivel`, `.kl-selector-mundo`, `.kl-selector-mundo-numero`, `.kl-selector-lista`, `.kl-selector-item` (y su `::after`), `.kl-selector-boton` con sus variantes (`:hover`, `:active`, `[data-estado=…]`, `.kl-bloqueado`, `[aria-current="step"]`), `.kl-selector-marca`, `.kl-selector-id`, `.kl-selector-titulo`, `.kl-selector-insignia`
    - Escribir el CSS del menú `.kl-menu-*` plano desde el inicio: sin ningún `box-shadow` con desenfoque ni `drop-shadow`/`text-shadow` en el elemento «en curso»; estado por forma+texto+color sólido de la paleta Kiro, con Sombra_Dura opcional; panel `position: absolute` con `z-index` sobre la escena, `max-height`/`overflow:auto` interno si hace falta, de modo que abrir un mundo no agrande la cabecera y la escena siga cabiendo a 1440×900 sin scroll
    - Actualizar el steering `.kiro/steering/estructura.md`: en el árbol de archivos de `src/ui/`, sustituir la entrada `selector-nivel.ts` por `menu-mundos.ts` y actualizar su línea de descripción para que describa el menú de mundos desplegable (en vez de «niveles del mundo y su estado, con el nivel en curso marcado»). El steering se versiona con el código, así que este cambio es parte de retirar el módulo
    - _Requisitos: 3.3, 4.2, 7.8, 7.9, 9.3_

  - [x] 5.5 Cablear el menú en `main.ts`
    - Reemplazar el import y la creación de `crearSelectorNivel` por `crearMenuMundos({ contenedor: ranura('ranura-ruta'), progreso, callbacks: { alElegirNivel: (id) => cambiarANivel(id) } })` (sin el parámetro `mundo`)
    - Renombrar `Aplicacion.selectorNivel: SelectorNivel` → `Aplicacion.menuMundos: MenuMundos`
    - `montarReto` llama `menuMundos.marcarActual(reto.nivel.id)`; `cambiarANivel` y `concluirIntento` llaman `menuMundos.refrescar()`; no cambiar la lógica de `cambiarANivel`
    - _Requisitos: 6.1, 6.2, 6.3, 6.5_

  - [x] 5.6 Migrar las 11 referencias de `main.test.ts` a la API del menú
    - Renombrar las 4 `…selectorNivel.estadoDe('0.2')` → `…menuMundos.estadoDe('0.2')`; las de `boton('0.1'|'0.2')` → `botonNivel(…)`; `insigniaVisible()` → `insigniaVisible(0)`
    - «cada pieza cae en su ranura»: `dentroDe('ranura-ruta', '.kl-menu-mundos')` y el resumen del botón de cabecera empieza por «Mundo 0 · Primeros pasos — 0.1 …»
    - «arranca en el 0.1 y muestra los cinco niveles»: abrir el mundo 0 y contar cinco botones de nivel `.kl-menu-nivel`
    - Verificar que el grupo de navegación/orden de Tab sigue verde: menú cerrado = 1 parada, abierto = 2; peor caso para volver al editor ≤ 20 (sin relajar ninguna aserción de 28.1)
    - _Requisitos: 6.1, 6.5, 7.1, 9.2_

- [x] 6. Checkpoint · Ajuste 3 completo
  - Asegurar que todas las pruebas pasan; preguntar al usuario si surgen dudas.

- [x] 7. Cierre · Prueba_Color_Plano, Bitácora y verificación
  - [x] 7.1 Escribir la Prueba_Color_Plano completa (P5) en `main.test.ts`
    - Se ejecuta DESPUÉS de la tarea 5.4, porque depende de que ya se hayan borrado las reglas `.kl-selector-*` y nacido el menú `.kl-menu-mundos`: así la prueba puede escribirse entera y no fallar entre olas por el glow de `.kl-selector-boton[aria-current="step"]` que 5.4 retira
    - En el grupo transversal 21 de `src/main.test.ts`, leer `src/estilos/pantalla.css` y `src/estilos/tema.css` con `readFileSync` y parsear bloques `{ … }`
    - Verificar: degradados prohibidos ausentes (`body`, `.kl-insignia-medalla`, `.kl-pluma`); ninguna sombra con radio de desenfoque > 0 en ninguna regla (tampoco en `.kl-menu-mundos` ni en el elemento «en curso» del menú); `drop-shadow`/`text-shadow` solo en los tres selectores de excepción (lista cerrada selector+propiedad); Sombra_Dura (blur 0) permitida; `.kl-pluma` ausente; `.kl-selector-*` ausente (CSS muerto ya retirado en 5.4)
    - Comentario de la prueba: `// Feature: 09-ajustes-de-interfaz, Property 5: Los estilos no reintroducen efectos prohibidos`
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4_

  - [x] 7.2 Registrar las decisiones en `docs/bitacora.md`
    - Enmienda 00·26.2 y 00·26.4 (texto visible del atajo pasa a ser el nombre vía `insercion`; el panel inserta `insercion`, no el `ejemplo`)
    - Enmienda 01·12 (navegación de niveles de un solo mundo pasa a un Menu_Mundos de seis mundos desplegables)
    - Reemplazo de elementos de la spec 08: 08·1 (ruta de niveles como estado actual), 08·5.3 (el panel mostraba el ejemplo como texto visible permanente), 08·5.5 y 08·5.7
    - Decisión de color plano: retirada de degradados y resplandores enumerados (halo del logo, fondos del `body`, glow del botón en curso, degradado y glow de la medalla, `linear-gradient` de la pluma) y conservación explícita del resplandor de las estelas y de la estrella otorgada como excepciones documentadas
    - _Requisitos: 10.1, 10.2, 10.3, 10.4_

  - [x] 7.3 Verificación final de cierre
    - Ejecutar `npm test`, `npm run typecheck` y `npm run build`; todos deben terminar con código 0
    - Confirmar que no cambian paletas, tipografías, columnas, ni el significado/aridad/errores de ningún comando, y que toda prueba nueva vive junto a su módulo o en `main.test.ts`
    - Eliminar cualquier archivo temporal creado durante la verificación
    - _Requisitos: 8.2, 9.1, 9.3, 9.4_

## Notes

- La única tarea marcada opcional con `*` es la 5.3 (P3/P4 con fast-check), que se puede posponer para
  un MVP más rápido. El resto —incluidas la P2 (1.6), el flujo de intento del atajo (1.7) y la
  Prueba_Color_Plano (7.1)— es implementación o verificación requerida por los criterios de aceptación.
- Cada tarea referencia los criterios de aceptación que satisface, para trazabilidad.
- Las propiedades de corrección quedan cubiertas: P1 en la tarea 1.2, P2 en la 1.6, P3 y P4 en la 5.3
  (que corre tras 5.2 y tras la migración 5.4, con el módulo y el CSS del menú ya en su sitio), y P5 en
  la 7.1 (escrita entera tras el borrado de `.kl-selector-*` de la 5.4). Cada prueba de propiedad lleva
  el comentario `Feature: 09-ajustes-de-interfaz, Property {n}`.
- Los checkpoints validan incrementalmente al final de cada ajuste.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.2", "5.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "5.2"] },
    { "id": 2, "tasks": ["1.4", "3.1", "5.5"] },
    { "id": 3, "tasks": ["1.5", "5.6"] },
    { "id": 4, "tasks": ["1.6", "1.7", "5.4"] },
    { "id": 5, "tasks": ["5.3", "7.1"] },
    { "id": 6, "tasks": ["7.2"] },
    { "id": 7, "tasks": ["7.3"] }
  ]
}
```
