# Implementation Plan

**KiroLogo · Spec 08 · Diseño visual**

## Overview

Esta spec **formaliza un diseño visual que ya existe** en el repositorio. Por eso las tareas no
construyen funcionalidad nueva: son de **verificación**, **conciliación** y **pruebas**. Cada tarea
escribe un artefacto de prueba nuevo, comprueba que el código existente cumple un requisito, o deja
registro de una enmienda en la Bitácora.

Reglas que atraviesan todas las tareas:

- **Ningún cambio visible sin aprobación del usuario.** El único cambio con efecto visible es el
  ajuste de fuentes (tarea 8), que primero escribe la prueba que falla con el estado actual y después
  **pide aprobación explícita** antes de tocar `index.html` y `package.json`.
- **No se reescriben los módulos visuales existentes.** Las tareas solo añaden artefactos de prueba,
  verifican conformidad y registran enmiendas.
- **El retiro de la segunda paleta es trabajo aparte.** Ninguna tarea toca `src/ui/selector-paleta.ts`,
  `src/estilos/paletas.css` ni la clave de `localStorage` `kirologo.paleta`. La decisión D11 solo se
  registra en la Bitácora (tarea 11).
- Herramientas ya fijadas, con versiones exactas: Vitest 5.0.0 (`npm test` corre `vitest --run`),
  jsdom 30.0.1, fast-check 4.9.0, TypeScript 7.0.2, Vite 8.2.2. No se añaden dependencias de prueba.

## Tasks

- [x] 1. Pruebas del Tema dentro de `src/main.test.ts` (NO crear `tema.test.ts`)
  - **Restricción dura:** la prueba estructural «21.3 · estructura de archivos» de `src/main.test.ts` exige que cada `.test.ts` tenga su módulo `.ts` homónimo, y sus únicas excepciones admitidas (`AYUDAS_ADMITIDAS`) son `azar/generadores-prueba.test.ts` y `motor/doble-dibujo.test.ts`. No existe `src/estilos/tema.ts`, de modo que crear `src/estilos/tema.test.ts` rompería esa regla. Por eso **todas las adiciones de esta tarea van dentro de `src/main.test.ts`**, donde ya viven las pruebas transversales del tema, y **no se modifica** la lista `AYUDAS_ADMITIDAS`.
  - **Ya cubierto por `src/main.test.ts`, no duplicar:** el grupo «21.4 · accesibilidad WCAG del tema» ya lee `tema.css` real y verifica contraste del texto principal y del secundario ≥ 4.5:1, de las dos estelas ≥ 3:1, de las tres regiones del Diff ≥ 3:1, del contorno de la tortuga ≥ 3:1 y del indicador de foco ≥ 3:1; el grupo «tema · presentación de la tortuga» cubre los ojos de Kiro y la piel/concha; y hay una prueba de que el tema puede quitar la flecha de rumbo y el lápiz y de que los lienzos repintan al cambiar de color.

  - [x] 1.1 Añadir en `src/main.test.ts` la verificación de las 19 fichas y de «ningún color literal en derivadas»
    - Leer `src/estilos/tema.css` como texto y resolver sus variables (fichas y derivadas) dentro de `src/main.test.ts`, sin crear ningún archivo de prueba nuevo
    - Verificar que el primer bloque declara **exactamente 19 fichas** de la paleta Kiro
    - Verificar que **ninguna variable derivada** contiene un color literal (hex, `rgb`/`rgba`, `hsl`/`hsla` o nombre CSS) distinto de una referencia `var()` o una mezcla `color-mix` de fichas
    - Excluir de ese chequeo los **dos conjuntos de excepciones deliberadas**, que la prueba conoce y no marca como fallo: las variables de reserva de sufijo `-reserva`, y las ocho de mascota y lápiz: `--color-tortuga-contorno`, `--color-tortuga-relleno`, `--color-tortuga-caparazon`, `--color-tortuga-detalle`, `--color-tortuga-cabeza`, `--color-kiro-relleno`, `--color-kiro-ojos`, `--color-lapiz-relleno`
    - Al fallar, identificar la variable y el literal detectado
    - _Requisitos: 2.1_

  - [x] 1.2 Cerrar en `src/main.test.ts` los huecos de contraste de 8.3/8.4 que 21.4 aún no cubra
    - Confirmar primero qué pares de contraste **ya** verifica el grupo «21.4 · accesibilidad WCAG del tema» (texto principal/secundario ≥ 4.5:1; dos estelas ≥ 3:1; tres regiones del Diff ≥ 3:1; contorno de la tortuga ≥ 3:1; indicador de foco ≥ 3:1) y **no duplicarlos**
    - Añadir **solo el hueco** que falte de los requisitos 8.3/8.4: en particular, confirmar de forma explícita las tres regiones del Diff y el **conjunto tortuga+Kiro** frente al fondo del Lienzo ≥ 3:1; si alguno de esos pares ya está, dejar la verificación como confirmación sin recálculo nuevo
    - Reutilizar el cálculo WCAG 2.1 ya presente en `src/main.test.ts` (luminancia relativa y razón `(L1 + 0.05) / (L2 + 0.05)`); si no estuviera disponible para el par faltante, implementarlo en el mismo archivo
    - _Requisitos: 2.3, 8.3, 8.4, 8.1_

  - [x] 1.3 Verificar en `src/main.test.ts` que las variables de reserva coinciden con la paleta Kiro
    - Dentro de `src/main.test.ts`, comprobar que cada valor `*-reserva` del bloque `:root` coincide con lo que la ficha equivalente resuelve en la paleta Kiro
    - _Requisitos: 2.1_

- [x] 2. Prueba de literales de color en módulos TypeScript (artefacto nuevo)
  - [x] 2.1 Crear la prueba que recorre `src/motor/` y `src/ui/`
    - Recorrer todos los módulos `.ts` de `src/motor/` y `src/ui/` (excluyendo archivos de prueba)
    - Fallar si un módulo contiene un color escrito como literal (hex `#abc`/`#aabbcc`, `rgb(...)`/`rgba(...)`, `hsl(...)`/`hsla(...)` o un nombre CSS de color en posición de color)
    - Al fallar, identificar el archivo y el literal detectado; no modificar el módulo
    - **Excluir explícitamente `src/main.ts`** (mantiene a propósito los valores de reserva y las constantes de presentación)
    - **Ya cubierto parcialmente por `src/motor/personajes.test.ts`:** ese archivo ya comprueba que `personajes.ts` no contiene literales de color ni de grosor; esta tarea **generaliza** esa idea a **todos** los módulos de `src/motor/` y `src/ui/`, sin reemplazar la comprobación específica de `personajes.test.ts`
    - _Requisitos: 9.1, 9.2_

- [x] 3. Verificación de personajes y movimiento de la tortuga
  - [x] 3.1 Confirmar el dibujo gobernado por `--lapiz-mostrar` y `--marca-rumbo-mostrar`, y cerrar el hueco
    - **Ya cubierto por:** `src/motor/personajes.test.ts` prueba el lápiz **abajo** (punta ≤ 1) y **arriba** (se aleja), y que `personajes.ts` no contiene literales de color ni de grosor; `src/main.test.ts` prueba que el tema puede quitar la flecha de rumbo y el lápiz
    - **Confirmar** que esas pruebas cubren la semántica base; **añadir solo el hueco** en `personajes.test.ts`: que con `--lapiz-mostrar` **ausente o con cualquier valor distinto de `arriba`** el lápiz se dibuja en sus **dos** posiciones (abajo y arriba), y que con `--marca-rumbo-mostrar: no` **no** se dibuja ninguna marca de rumbo
    - No re-crear la comprobación de literales de `personajes.ts` (vive en `personajes.test.ts` y se generaliza en la tarea 2)
    - _Requisitos: 3.1, 3.3, 3.4_

  - [x] 3.2 Confirmar la escala del conjunto y verificar el no solapamiento en el Nivel 0.1
    - **Ya cubierto por:** `src/motor/personajes.test.ts` prueba la escala (a escala `k` los trazos quedan `k` veces más lejos; una escala inválida equivale a sin escala)
    - **Añadir solo el hueco:** verificar que `ESCALA_PERSONAJES = 2.4` vive en `src/main.ts` como decisión de presentación, y probar que en el Nivel 0.1 (tramo abierto que termina lejos del inicio) la silueta de la tortuga en reposo en el Estado inicial no se solapa con el extremo final del trazo
    - _Requisitos: 3.2_

  - [x] 3.3 Verificar la evaluación al terminar de dibujarse y la vuelta al Estado inicial
    - **Ya cubierto por:** revisar primero `src/main.test.ts` (pruebas de arranque del Nivel 0.1 y de flujo de ejecución); confirmar si ya comprueba la entrega de la calificación y la vuelta al inicio
    - **Añadir solo el hueco en `src/main.test.ts`:** que la calificación se entrega a las Estrellas cuando el Animador aplica la última Operacion y termina de dibujar, no al activarse «ejecutar»; y que al terminar o al detener, el Juego devuelve la tortuga al Estado inicial del Nivel conservando intacta la estela ya dibujada
    - _Requisitos: 3.5, 3.6, 3.7_

  - [x] 3.4 Verificar la conducta con `prefers-reduced-motion: reduce`
    - **Ya cubierto por:** revisar `src/main.test.ts` y `src/motor/animador.test.ts`; si alguno ya cubre el movimiento reducido, confirmarlo y no duplicar
    - **Añadir solo el hueco en `src/main.test.ts`:** probar en jsdom (sin `requestAnimationFrame`, con la consulta de movimiento reducido por parámetro) que el Animador dibuja la estela completa de golpe, deja la tortuga en el Estado inicial y mantiene el paso a paso aplicando una Operacion por paso
    - _Requisitos: 3.8_

- [x] 4. Verificación de comparación y diff
  - [x] 4.1 Confirmar la selección de vistas, la apertura automática y las tres regiones del Diff
    - **Ya cubierto por `src/ui/comparacion.test.ts`:** conmutador con texto estable y estado que cambia; empieza en lado a lado y alterna; pasa a superposición y dibuja el Diff al **negar** precisión (y no al otorgarla); anuncio en `aria-live` con IoU/exceso sin nombrar color
    - **Ya cubierto por `src/ui/diff.test.ts`:** los tres estados distinguibles por patrón/grosor aun en gris; exceso ≥ el doble de la coincidencia; nombra por significado y no por color; color tomado del Tema; sin estela, solo la falta; dibujo sobre los trazos reales; determinismo
    - **Confirmar** que entre ambos archivos quedan cubiertos los requisitos 4.1, 4.2, 4.4 y 4.6; **añadir solo el hueco** que falte en el archivo correspondiente (`comparacion.test.ts` o `diff.test.ts`), sin reescribir lo existente
    - _Requisitos: 4.1, 4.2, 4.4, 4.6_

  - [x]* 4.2 Prueba de propiedad: el veredicto de presentación nunca empeora la coincidencia
    - **Property 1: El veredicto de presentación nunca empeora la coincidencia**
    - **Validates: Requirements 4.3, 4.5**
    - Con fast-check 4.9.0 y mínimo 100 iteraciones, etiquetada `Feature: 08-diseno-visual, Property 1`
    - Para toda figura del jugador y de referencia, la coincidencia (IoU) de `veredictoParaMostrar` es mayor o igual que la del veredicto oficial, y las Estrellas no cambian: la calificación sale siempre del veredicto oficial
    - _Requisitos: 4.3, 4.5_

  - [x]* 4.3 Prueba de propiedad: idempotencia del repintado ante el mismo tema
    - **Property 2: Idempotencia del repintado ante el mismo tema**
    - **Validates: Requirements 2.2**
    - Con fast-check 4.9.0 y mínimo 100 iteraciones, etiquetada `Feature: 08-diseno-visual, Property 2`
    - Repintar dos veces con los mismos valores del Tema produce el mismo dibujo: color y grosor son función de las fichas leídas por `getComputedStyle`, no de estado acumulado
    - _Requisitos: 2.2_

- [x] 5. Verificación del Panel de comandos
  - [x] 5.1 Confirmar navegación por teclado y texto visible/accesible, y cerrar el hueco
    - **Ya cubierto por:** revisar `src/ui/panel-comandos.test.ts` para constatar qué de lo siguiente ya verifica y no duplicarlo
    - **Confirmar / añadir solo el hueco** en `panel-comandos.test.ts`: que el Panel_Comandos es una barra de herramientas con una sola parada de Tab (exactamente un botón en el orden de tabulación) y que una sola pulsación de Tab lleva el foco fuera; el movimiento del foco con `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` y el salto al primer/último botón con `Inicio`/`Fin`; que el único texto visible permanente es el ejemplo de uso, que el nombre largo, la abreviatura y la descripción se revelan al pasar el cursor o enfocar, y que el nombre accesible incluye los cuatro, completos y carácter por carácter
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 5.2 Confirmar vocabulario vacío e inserción al activar un botón, y cerrar el hueco
    - **Ya cubierto por:** revisar `src/ui/panel-comandos.test.ts`
    - **Confirmar / añadir solo el hueco** en `panel-comandos.test.ts`: que con el vocabulario desbloqueado vacío el panel se presenta sin botones y sin lanzar excepción; y que al activar un botón (ratón, `Enter` o barra espaciadora) el Editor inserta el ejemplo en la posición del cursor y el panel conserva el foco en el botón activado
    - _Requisitos: 5.6, 5.7_

- [x] 6. Verificación de controles, estrellas y panel de semilla
  - [x] 6.1 Confirmar los Controles y la selección de velocidad, y cerrar el hueco
    - **Ya cubierto por `src/ui/controles.test.ts`:** las seis acciones, cada una interactiva; la velocidad **normal** seleccionada al entrar; nombres accesibles en español distintos; texto visible corto contenido en el nombre accesible; íconos decorativos `aria-hidden`; estados durante y después de la ejecución
    - **Confirmar** que eso cubre los requisitos 7.1, 7.2 y 7.3 (incluida la velocidad como grupo de cuatro con exactamente uno seleccionado, marcado por estado presionado y clase, nunca solo color); **añadir solo el hueco** que falte en `controles.test.ts`, sin reescribir lo existente
    - _Requisitos: 7.1, 7.2, 7.3_

  - [x] 6.2 Confirmar el Marcador de estrellas y el Panel de semilla, y cerrar el hueco
    - **Ya cubierto por `src/ui/marcador-estrellas.test.ts`:** tres estrellas nombradas en orden; pendientes por texto y forma; no es `aria-live`; pinta otorgada/negada con forma + texto + `data-estado`
    - **Ya cubierto por `src/ui/panel-semilla.test.ts`:** el código del reto en un elemento de solo lectura (`<output>`) con nombre accesible; autorado vs generado (deshabilita ambas acciones y lo dice por texto)
    - **Confirmar** que entre ambos archivos quedan cubiertos los requisitos 7.4, 7.5 y 7.6; **añadir solo el hueco** que falte en el archivo correspondiente, sin reescribir lo existente
    - _Requisitos: 7.4, 7.5, 7.6_

- [x] 7. Verificación de la marca
  - [x] 7.1 Verificar el logo como `<img>` y la mascota como imagen de fondo CSS
    - **Dato real del código:** solo el **logo** es un `<img ... alt="KiroLogo">` en `index.html`; la **mascota** NO es un `<img>`, es una imagen de **fondo CSS** declarada en `.kl-globo::before` de `src/estilos/pantalla.css` (`background: url("/marca/mascota.png") ...`)
    - Probar que el logo es un `<img>` de `public/marca/` con nombre accesible «KiroLogo» en su atributo `alt`, y que ese nombre queda disponible con independencia de que la imagen cargue
    - Probar que la mascota está declarada como `background` de `.kl-globo::before` en `pantalla.css` apuntando a `/marca/mascota.png`; **no** exigir que la mascota sea un `<img>`
    - El registro de la excepción temporal al steering `tecnologia` se hace en la tarea 11
    - _Requisitos: 7.7, 7.8_

- [x] 8. Ajuste de fuentes — único cambio visible, requiere aprobación del usuario
  - [x] 8.1 Escribir la verificación del documento servido que falla con el estado actual
    - Crear la prueba que revisa `index.html` y **falla** si declara enlaces o preconexiones a un origen de fuentes distinto del propio (`fonts.googleapis.com`, `fonts.gstatic.com` u otro)
    - Confirmar que la prueba **falla** hoy, por las dos `preconnect` y el `stylesheet` a Google Fonts presentes en `index.html`
    - _Requisitos: 6.4_

  - [x] 8.2 Pedir aprobación explícita del usuario antes de tocar `index.html` y `package.json`
    - **Esta tarea no aplica ningún cambio por sí sola.** Presentar al usuario el plan (paquetes OFL autoalojados, ejes a conservar, enlaces a eliminar) y esperar su aprobación explícita
    - No continuar con 8.3 sin aprobación
    - _Requisitos: 6.1, 6.2_

  - [x] 8.3 Aplicar el reemplazo de fuentes (solo tras la aprobación de 8.2)
    - **Esta tarea toca tres archivos: `index.html`, `package.json` y `src/estilos/tema.css`.**
    - Añadir a `devDependencies` de `package.json`, con **versión exacta fija** (sin rangos) y licencia OFL: `@fontsource-variable/bricolage-grotesque` y `@fontsource-variable/jetbrains-mono`
    - Importar su CSS para que Vite los empaquete como activos con hash del propio origen, conservando los ejes: Bricolage peso 400–800 y `opsz`; JetBrains Mono 400/500/700
    - Eliminar de `index.html` las dos `preconnect` y el `stylesheet` a `fonts.googleapis.com`/`fonts.gstatic.com`
    - **Actualizar en `src/estilos/tema.css`** las variables `--fuente-titulo`, `--fuente-ui` y `--fuente-codigo` para usar los **nombres reales de familia** que declaran los paquetes variables, que llevan el sufijo **«Variable»**: `"Bricolage Grotesque Variable"` para título e interfaz y `"JetBrains Mono Variable"` para código. Confirmar el nombre exacto de cada familia inspeccionando el CSS del paquete en `node_modules` después de instalar, antes de escribirlo
    - Verificar que la fuente autoalojada **se aplica de verdad** y no cae a la pila del sistema: comprobar que la familia computada del cuerpo, del título y del código es la de Fontsource (con el sufijo «Variable»), no la de reserva
    - _Requisitos: 6.1, 6.2_

  - [x] 8.4 Verificar reserva del sistema y que la prueba de 8.1 ya pasa
    - Comprobar que la pila de fuentes del sistema declarada en `tema.css` (`--fuente-titulo`, `--fuente-ui`, `--fuente-codigo`) queda como reserva legible y operable sin solicitudes a otro origen
    - Confirmar que la verificación de 8.1 ahora pasa (cero solicitudes a un origen de fuentes externo durante el flujo del Nivel 0.1)
    - _Requisitos: 6.3, 6.4_

- [x] 9. Verificación de la estructura de la pantalla
  - [x] 9.1 Confirmar la estructura de `index.html` y `pantalla.css`, y cerrar el hueco
    - **Ya cubierto por `src/main.test.ts` grupo «21.3 · estructura de archivos»:** que `index.html` declara una **única** región `aria-live` y que los `id` de los lienzos y de las ranuras se montan
    - **Confirmar** que 21.3 cubre la región `aria-live` única (`#anuncios`, `polite`, `aria-atomic`) y la existencia de las ranuras (`programa`, `ranura-comparacion`, `ranura-leyenda`, `ranura-reto`, `ranura-marcador`, `ranura-ruta`, `ranura-paleta`) y de los `id` de los lienzos; no duplicarlo
    - **Añadir solo el hueco** en `src/main.test.ts` si no estuviera cubierto: que `pantalla.css` declara la regla de las tres columnas y la regla `@media` de apilado a una sola columna con el orden exigido; y que al no encontrar su ranura, una pieza se cuelga del contenedor raíz `#aplicacion` sin omitirse ni interrumpir el montaje de las demás
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.8_

  - [x] 9.2 Verificación MANUAL del encuadre (no automatizable en jsdom)
    - **Tarea de verificación manual, no de código:** jsdom no hace layout, así que el encuadre real se comprueba a mano y se documenta en la Bitácora
    - Verificar a 1440 × 900 (sin desplazamiento vertical ni horizontal), a 1366 × 768 (desplazamiento vertical ≤ 8 px, sin horizontal) y a < 720 px de ancho (apilado en una columna en orden, sin recortes ni desplazamiento horizontal)
    - Dejar constancia del resultado en `docs/bitacora.md`
    - _Requisitos: 1.5, 1.6, 1.7_

- [x] 10. Documentar en la Bitácora las reglas de no debilitamiento e integración de mundos futuros
  - **Por qué documental y no automatizado:** una prueba automática que detectara el «debilitamiento de pruebas heredadas» o que «un mundo nuevo no toca el tema/pantalla» bloquearía las specs de los demás mundos (02–07). Estas reglas se **documentan** en `docs/bitacora.md`, sin crear pruebas automáticas.

  - [x]* 10.1 Documentar en la Bitácora la regla de no debilitamiento de pruebas heredadas de 00/01
    - Registrar en `docs/bitacora.md` la regla: ninguna prueba heredada de las specs 00 o 01 se debilita sin una enmienda registrada **tanto en esta spec como en la Bitácora**, dejando claro cómo debe identificarse la prueba afectada en cada enmienda
    - **No crear ninguna prueba automática** para esta regla
    - _Requisitos: 9.5_

  - [x]* 10.2 Documentar en la Bitácora la regla de integración de un mundo nuevo
    - Registrar en `docs/bitacora.md` la regla: un mundo nuevo se integra conservando identificador, orden y anidamiento de las ranuras existentes, y sin agregar, eliminar ni modificar declaraciones de `tema.css` ni reglas de `pantalla.css` ajenas a sus propias clases
    - **No crear ninguna prueba automática** para esta regla
    - _Requisitos: 9.3, 9.4_

- [x] 11. Registro de enmiendas, excepción y decisión en la Bitácora
  - [x] 11.1 Registrar cada enmienda y la decisión D11 en `docs/bitacora.md`
    - Registrar, con su porqué, cada enmienda: 00·13.3 (sin marca de rumbo), 00·13.5 (lápiz solo levantado), 00·13.6 (escala 2,4), 00·14.8 y 00·24.7 (vuelta al Estado inicial), 00·23.5 (superposición en Posiciones reales), 00·26.2 (solo el ejemplo como texto visible), 00·28.3 (contraste de controles acotado), 00·28.6 (foco con `:focus-visible`)
    - Registrar la **excepción temporal** al steering `tecnologia` por el logo y la mascota de `public/marca/`, dejando claro su carácter temporal
    - Registrar la decisión **D11 (una sola paleta)** con la nota de que el retiro del Selector_Paleta, de `paletas.css` y de la clave `kirologo.paleta` es **trabajo aparte** que las tareas de esta spec no tocan
    - _Requisitos: 9.5_

- [x] 12. Entregable: lista de pruebas reescritas o añadidas con su motivo
  - [x] 12.1 Documentar las pruebas del diseño y por qué
    - Producir la lista de pruebas reescritas o añadidas para esta spec (prueba del Tema, prueba de literales de color, verificación del documento servido, pruebas de estructura, propiedades 1 y 2, no debilitamiento, integración de mundos), con el motivo de cada una
    - Dejar explícito el principio de que «que las pruebas pasen» no basta como prueba de cumplimiento, y qué queda a verificación manual (encuadre, lectura visual de personajes, calidad del foco pintado)
    - _Requisitos: 9.5_

- [x] 13. Cierre — build y pruebas verdes
  - [x] 13.1 Ejecutar `npm run build` y `npm test` y dejar todo en verde
    - Correr `vite build` y `vitest --run`; corregir cualquier fallo de las pruebas nuevas antes de cerrar
    - Ensure all tests pass, ask the user if questions arise.
    - _Requisitos: 9.1, 9.2, 9.5_

## Notes

- Las tareas marcadas con `*` son opcionales. Son: las propiedades 4.2 y 4.3, y las dos reglas documentales 10.1 y 10.2 (documentación en la Bitácora, sin pruebas automáticas).
- Esta spec formaliza un diseño existente: salvo el ajuste de fuentes (tarea 8) y los artefactos de prueba nuevos, ninguna tarea reescribe módulos visuales.
- **No crear `src/estilos/tema.test.ts`:** la regla «21.3 · estructura de archivos» de `src/main.test.ts` exige un módulo `.ts` homónimo por cada `.test.ts` y no existe `tema.ts`. Las pruebas nuevas del Tema (tarea 1) viven dentro de `src/main.test.ts`, junto a las de contraste que ya están allí (grupo 21.4). No se modifica `AYUDAS_ADMITIDAS`.
- **Confirmar antes de añadir:** las verificaciones de las tareas 3, 4, 5, 6, 7 y 9.1 nombran las pruebas existentes que ya cubren cada conducta y solo añaden el hueco que falte, sin reescribir lo heredado.
- **Aprobación del usuario:** la tarea 8 es la única con efecto visible; 8.2 bloquea hasta la aprobación explícita. 8.3 toca `index.html`, `package.json` y `src/estilos/tema.css`.
- **Verificación manual:** la tarea 9.2 (encuadre) no es automatizable en jsdom; su resultado se documenta en la Bitácora.
- **Reglas documentales, no automatizadas:** las tareas 10.1 y 10.2 se limitan a registrar reglas en `docs/bitacora.md`. Una prueba automática de «no debilitamiento» o de «no tocar el tema» bloquearía las specs de los mundos 02–07.
- **Trabajo aparte:** el retiro de la segunda paleta (Selector_Paleta, `paletas.css`, clave `kirologo.paleta`) no es tarea de esta spec; solo se registra en la Bitácora (11.1).
- Las propiedades 1 y 2 usan fast-check 4.9.0, mínimo 100 iteraciones, etiquetadas `Feature: 08-diseno-visual, Property N`.

## Task Dependency Graph

Nota de serialización: `10.1`, `10.2`, `11.1` y `9.2` escriben en `docs/bitacora.md`, por lo que van en
olas distintas para no colisionar sobre el mismo archivo. Las adiciones de la tarea 1, 3.3, 3.4 y 9.1
escriben todas en `src/main.test.ts`, así que también se serializan entre sí.

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "8.1"] },
    { "id": 1, "tasks": ["1.2", "3.1", "3.2", "4.1", "5.1", "5.2", "6.1", "6.2", "7.1"] },
    { "id": 2, "tasks": ["1.3", "3.3", "4.2", "4.3"] },
    { "id": 3, "tasks": ["3.4"] },
    { "id": 4, "tasks": ["9.1"] },
    { "id": 5, "tasks": ["8.2"] },
    { "id": 6, "tasks": ["8.3"] },
    { "id": 7, "tasks": ["8.4"] },
    { "id": 8, "tasks": ["9.2"] },
    { "id": 9, "tasks": ["10.1"] },
    { "id": 10, "tasks": ["10.2"] },
    { "id": 11, "tasks": ["11.1"] },
    { "id": 12, "tasks": ["12.1"] },
    { "id": 13, "tasks": ["13.1"] }
  ]
}
```
