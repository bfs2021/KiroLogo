# Requirements Document

**KiroLogo · Spec 08 · Diseño visual**

## Introduction

Esta spec **no parte de cero**: el diseño visual de KiroLogo ya existe en el repositorio como una
propuesta aprobada por el líder del equipo, aún sin confirmar. El trabajo de esta spec es
**formalizar ese diseño como requisitos verificables** y **conciliar diez desvíos** con las specs 00
(Cimientos) y 01 (Mundo 0), que ya están terminadas, de modo que los mundos que vienen (02 a 07) se
construyan encima del diseño y no lo contradigan.

Los requisitos de esta spec describen lo que el diseño debe cumplir, que es lo que el código ya hace.
Ningún requisito describe una conducta que el código no tenga. Cuando una decisión de diseño se aparta
de un criterio de la spec 00, esta spec lo cierra de forma explícita de una de tres maneras: **enmienda**
(se cita el criterio de la spec 00 y esta spec pasa a prevalecer sobre él), **corrección** (se cambia el
diseño para cumplir el criterio) o **excepción** (se admite el desvío con su justificación). La sección
«Decisiones cerradas en esta fase» y la sección «Conciliación con las specs anteriores» registran cada
cierre.

Idea del diseño: una mesa de trazado de noche, en tonos suaves para jugar mucho rato sin cansar la
vista. La referencia es la web de Kiro: casi negro con un matiz violeta, violeta suave y lavanda clara.
Se descartó el verde lima neón de la primera versión porque cansaba.

### Fuera de alcance

Queda **fuera de alcance** de esta spec:

- Mundos, niveles, vocabulario y generadores nuevos.
- Cambiar los umbrales del Validador o la forma en que se ganan las Estrellas.
- Más paletas que la única paleta Kiro, un modo claro, sonido y otros idiomas.
- Tres cosas que el diseño actual tiene y que **cambian en la spec 09**, que esta spec no debe fijar: los
  números que aparecen en los atajos de los comandos de movimiento, los degradados y resplandores de la
  presentación, y la ruta de niveles de la cabecera. Donde esta spec las menciona lo hace solo como
  **estado actual que la spec 09 sustituye**, sin convertirlas en requisitos.

### Patrones EARS en español

Cada criterio de aceptación sigue exactamente uno de los seis patrones EARS. Las palabras clave se
escriben en español porque el proyecto entero es en español; la equivalencia es literal:

| Patrón | Forma en este documento | EARS |
|---|---|---|
| Ubicuo | EL/LA \<sistema\> DEBERÁ \<respuesta\> | THE … SHALL |
| Dirigido por evento | CUANDO \<disparador\>, EL/LA \<sistema\> DEBERÁ \<respuesta\> | WHEN … |
| Dirigido por estado | MIENTRAS \<condición\>, EL/LA \<sistema\> DEBERÁ \<respuesta\> | WHILE … |
| Evento no deseado | SI \<condición\>, ENTONCES EL/LA \<sistema\> DEBERÁ \<respuesta\> | IF … THEN … |
| Opcional | DONDE \<opción\>, EL/LA \<sistema\> DEBERÁ \<respuesta\> | WHERE … |
| Complejo | DONDE → MIENTRAS → CUANDO/SI → EL/LA \<sistema\> DEBERÁ | WHERE/WHILE/WHEN/IF … |

## Glossary

Sistemas y módulos (los nombres coinciden con los archivos de `estructura.md` y con el glosario de la
spec 00):

- **Juego**: la aplicación completa servida por `index.html` y `src/main.ts`.
- **Pantalla**: la composición visual de la interfaz, definida por `index.html` y por
  `src/estilos/pantalla.css`.
- **Tema**: `src/estilos/tema.css`. Única fuente de verdad del color, el grosor y la tipografía; declara
  las fichas de color de la única paleta, Kiro, y deriva de ellas el resto de las variables.
- **Lienzo**: `src/motor/lienzo.ts`. El lienzo lógico de 800 × 800 unidades y el dibujo de la estela, que
  lee del Tema el color y el grosor de cada trazo.
- **Personajes**: `src/motor/personajes.ts`. Render de la tortuga con Kiro montado y el lápiz, con trazos
  de Canvas 2D.
- **Animador**: `src/motor/animador.ts`. Consume Operaciones y las reproduce en el tiempo.
- **Validador**: `src/motor/validador.ts`. Comparación geométrica; devuelve el veredicto, las tres
  regiones, la traslación y el ángulo.
- **Comparacion**: `src/ui/comparacion.ts`. Vista lado a lado y vista de superposición de las dos figuras.
- **Diff**: `src/ui/diff.ts`. Dibujo de las tres regiones —coincidencia, exceso y falta— sobre la vista de
  superposición.
- **Panel_Comandos**: `src/ui/panel-comandos.ts`. La barra de herramientas con el vocabulario
  desbloqueado.
- **Editor**: `src/ui/editor.ts`. El área de escritura con números de línea y contador de instrucciones.
- **Controles**: `src/ui/controles.ts`. Ejecutar, detener, paso a paso, velocidad, reiniciar y repetir la
  demostración.
- **Marcador_Estrellas**: `src/ui/marcador-estrellas.ts`. Las tres tarjetas de estrellas del intento.
- **Globo_Kiro**: `src/ui/globo-kiro.ts`. Diálogos, pistas y celebración, con la mascota de Kiro.
- **Panel_Semilla**: `src/ui/panel-semilla.ts`. El código del reto, «otro reto» y «reproducir un código».
- **Info_Mundos**: `src/niveles/mundos.ts`. El nombre y la insignia de concepto de cada mundo.
- **Estrellas**: `src/juego/estrellas.ts`. Cálculo de precisión, economía y abstracción.
- **Progreso**: `src/juego/progreso.ts`. Persistencia en `localStorage`.
- **Suite_Pruebas**: el conjunto de pruebas de Vitest que ejecuta `npm test`.
- **Bitacora**: `docs/bitacora.md`. Registro de cómo se concibió el juego y de las decisiones del
  proyecto.

Términos del dominio y de esta spec:

- **Ficha de color**: una de las 19 variables del primer bloque del Tema (`--tinta-*`, `--acento`, `--texto`…)
  de la que se deriva todo lo demás de la paleta Kiro.
- **Ranura**: un contenedor con identificador fijo de `index.html` (`ranura-ruta`,
  `programa`, `ranura-comparacion`, `ranura-leyenda`, `ranura-reto`, `ranura-marcador`) donde la capa de
  interfaz cuelga su DOM. `index.html` conserva además `ranura-paleta` sin pieza de interfaz asignada en
  esta spec.
- **Región_Anuncios**: el único elemento `aria-live` del Juego (`#anuncios`, con cortesía `polite` y
  `aria-atomic`).
- **Estado inicial de la tortuga**: el Estado_Tortuga con el que empieza el Reto, antes de la primera
  Operacion. En el Nivel `0.1` es el centro del Lienzo con rumbo 0.
- **Posiciones reales**: las coordenadas del Lienzo lógico en las que la tortuga dibujó cada estela, sin
  traslación ni rotación de alineación.
- **Alineación del Validador**: la traslación y el ángulo que devuelve el Validador para llevar la figura
  del jugador sobre la de referencia.
- **Pila de fuentes del sistema**: la lista de familias de respaldo que el Tema declara para cada rol
  tipográfico (título, interfaz y código).

## Decisiones cerradas en esta fase

Las once decisiones que el prompt de la spec dejó abiertas quedan resueltas así, confirmadas en la fase
de requisitos, y cada una está reflejada en criterios de aceptación. La columna «Cierre» indica si la
decisión enmienda la spec 00, corrige el diseño o declara una excepción.

| # | Decisión | Resolución | Cierre | Requisito |
|---|---|---|---|---|
| D1 | Posición de la tortuga al terminar o detener | Al terminar o detener, la tortuga vuelve al Estado inicial de la tortuga del Nivel; en el Nivel 0.1, cuya figura es un tramo abierto que termina lejos del inicio, la silueta en reposo no se solapa con la punta del trazo | Enmienda de 00·14.8 y 00·24.7 | 3, 7 |
| D2 | Dibujo del lápiz | El lápiz se dibuja únicamente levantado cuando `--lapiz-mostrar: arriba`; con cualquier otro valor o sin valor se dibuja en sus dos posiciones, abajo y arriba | Enmienda de 00·13.5 | 3 |
| D3 | Marca de rumbo | La marca de rumbo no se dibuja (`--marca-rumbo-mostrar: no`); la cabeza de la tortuga ya comunica el rumbo | Enmienda de 00·13.3 | 3 |
| D4 | Tamaño del conjunto de personajes | El conjunto tortuga + Kiro + lápiz se dibuja a escala 2,4 respecto del círculo de 40 unidades; se fija ese tamaño y, en el Nivel 0.1, la silueta en reposo no se solapa con el extremo final del trazo | Enmienda de 00·13.6 | 3 |
| D5 | Texto del Panel_Comandos | El ejemplo de cada comando es texto visible permanente; el nombre largo, la abreviatura y la descripción se revelan al pasar el cursor o enfocar, y siempre están completos en el nombre accesible | Enmienda de 00·26.2 | 5 |
| D6 | Origen de las fuentes | El Juego aloja en el propio origen las dos familias tipográficas bajo licencia OFL, compatible con MIT, sin ninguna solicitud a otro origen durante el flujo del Nivel `0.1`; la pila de fuentes del sistema del Tema queda como reserva | Corrección del diseño para cumplir 00·27.8 | 6 |
| D7 | Logo y mascota de marca | El logo y la mascota son imágenes de boceto en `public/marca/`, fuera del control de versiones, hasta que el líder decida; se declara una excepción temporal a la regla del steering `tecnologia` y se exige que el nombre accesible no dependa de la imagen | Excepción (temporal) a `tecnologia` | 7 |
| D8 | Vista del Diff | La superposición dibuja las dos estelas en sus Posiciones reales y el Diff dibuja sus tres regiones con la Alineación del Validador; las Estrellas salen siempre del veredicto oficial; se enmienda 00·23.5 para admitir que las estelas se muestren en Posiciones reales sin cambiar la fuente de las Estrellas | Enmienda de 00·23.5 | 4 |
| D9 | Contraste de los controles | El diseño aprobado por el líder mantiene el contraste actual de los controles (medido entre 1,07:1 y 2,07:1); se enmienda 00·28.3 para exigir 3:1 solo a los elementos interactivos que lo necesitan para identificarse como control, no a todo borde y fondo de control, conservando el aspecto | Enmienda de 00·28.3 | 8 |
| D10 | Indicador de foco con el ratón | El indicador de foco se muestra según `:focus-visible`, el comportamiento estándar para el foco, que ya venía en el Tema desde la spec 00; se enmienda 00·28.6, que exigía mostrarlo con independencia de si el foco llegó por teclado o por puntero. | Enmienda de 00·28.6 | 8 |
| D11 | Única paleta | Se adopta una única paleta (Kiro). Se retiran de la spec el Selector_Paleta y la paleta Océano; no hay segunda clave de `localStorage`, por lo que desaparece la enmienda de 00·27.8 por la paleta. El retiro del código del selector y de las paletas se hace en un trabajo aparte; las tareas de esta spec no tocan ese código | Decisión de producto | 2 |

## Conciliación con las specs anteriores

Cada desvío del diseño respecto de un criterio de la spec 00 queda resuelto por el requisito indicado y
cerrado de la forma indicada. Ninguna contradicción queda silenciosa.

| # | Qué hace el diseño | Criterio de la spec 00 | Cierre | Requisito que lo resuelve |
|---|---|---|---|---|
| 1 | La tortuga vuelve al Estado inicial al terminar o detener | 00·14.8, 00·24.7 | Enmienda | 3, 7 |
| 2 | El lápiz solo se dibuja levantado | 00·13.5 | Enmienda | 3 |
| 3 | No se dibuja la marca de rumbo | 00·13.3 | Enmienda | 3 |
| 4 | El conjunto de personajes se dibuja a escala 2,4 del círculo de 40 unidades | 00·13.6 | Enmienda | 3 |
| 5 | El Panel_Comandos muestra como texto visible solo el ejemplo | 00·26.2 | Enmienda | 5 |
| 6 | Las fuentes se piden a Google Fonts (otro origen) | 00·27.8 | Corrección | 6 |
| 7 | El logo y la mascota son imágenes de `public/marca/` | steering `tecnologia` (sin activos gráficos) | Excepción temporal | 7 |
| 8 | La superposición muestra las estelas en Posiciones reales, no la vista alineada | 00·23.5 | Enmienda | 4 |
| 9 | Controles por debajo de 3:1 frente a su fondo (medido entre 1,07:1 y 2,07:1): el diseño aprobado conserva ese aspecto | 00·28.3 | Enmienda | 8 |
| 10 | El foco se muestra con `:focus-visible` (comportamiento estándar, heredado del Tema de la spec 00), no al enfocar con el ratón | 00·28.6 | Enmienda | 8 |

## Requirements

### Requisito 1: Estructura de la pantalla

**Historia de usuario:** Como jugador, quiero ver en una sola pantalla la figura de Kiro, mi programa y
mi figura, para comparar y corregir sin perder de vista ninguna de las tres cosas.

#### Criterios de aceptación

1. LA Pantalla DEBERÁ presentar una cabecera que contiene el logo del Juego y una escena de tres columnas con la figura de referencia de Kiro a la izquierda, la sección del programa en el centro y la figura del jugador a la derecha, colgando cada pieza de interfaz de la Ranura de index.html que le corresponde: la sección del programa de la ranura programa, el botón de comparar de ranura-comparacion, la leyenda del diff de ranura-leyenda, el Panel_Semilla de ranura-reto y el Marcador_Estrellas de ranura-marcador.
2. SI una pieza de interfaz no encuentra su Ranura correspondiente en index.html, ENTONCES LA Pantalla DEBERÁ colgar esa pieza del contenedor raíz de la aplicación, sin omitirla ni interrumpir el montaje de las demás piezas.
3. LA Pantalla DEBERÁ colocar bajo la figura de referencia de Kiro el Panel_Semilla, y bajo la figura del jugador el botón de comparar junto al título de la figura y el Marcador_Estrellas, dejando cada uno en la columna de su figura.
4. LA Pantalla DEBERÁ presentar la sección central del programa con el Globo_Kiro, el Editor con sus números de línea y su contador de instrucciones, el Panel_Comandos dispuesto como una columna al lado del Editor, y los Controles con su selección de velocidad, todos dentro de la Ranura programa.
5. MIENTRAS el área de contenido del navegador mide 1440 píxeles de ancho por 900 de alto, LA Pantalla DEBERÁ presentar la cabecera y las tres columnas completas sin requerir ningún desplazamiento vertical ni horizontal.
6. MIENTRAS el área de contenido del navegador mide 1366 píxeles de ancho por 768 de alto, LA Pantalla DEBERÁ limitar el desplazamiento vertical necesario a 8 píxeles de pantalla o menos y no requerir ningún desplazamiento horizontal.
7. MIENTRAS el área de contenido del navegador mide menos de 720 píxeles de ancho, LA Pantalla DEBERÁ apilar en una sola columna, en este orden, la cabecera, la figura de referencia de Kiro, la sección del programa y la figura del jugador, sin recortar ninguna pieza y sin requerir desplazamiento horizontal.
8. LA Pantalla DEBERÁ exponer un único elemento aria-live, la Región_Anuncios, con cortesía «polite» y con aria-atomic activado, como único canal de anuncios de estado, sin que ninguna otra pieza declare una segunda región aria-live.

#### Estado actual (lo sustituye la spec 09)

La cabecera incluye además una ruta de niveles cuyo contenido es estado actual que la spec 09 sustituye,
no fijado por esta spec. En esa ruta, el diseño actual muestra la etiqueta del mundo en curso con el
formato «Mundo N · Nombre» (el número del mundo y su nombre tal como los declara Info_Mundos) y la
medalla de la insignia de concepto de ese mundo tal como la declara Info_Mundos; y, cuando el nombre de
un nivel excede el ancho disponible de su botón, recorta el texto visible con puntos suspensivos y
conserva el nombre completo en el nombre accesible del botón. Nada de esto es un requisito de esta spec:
se deja constancia solo como estado actual que la spec 09 reemplaza.

### Requisito 2: Tema y paleta de color

**Historia de usuario:** Como jugador, quiero una combinación de color cómoda para la vista, para jugar
mucho rato sin cansarme.

#### Criterios de aceptación

1. EL Tema DEBERÁ declarar las Fichas de color de la paleta Kiro en un primer bloque de 19 variables, y DEBERÁ derivar del valor de esas Fichas todas las demás variables de color de la interfaz, del Lienzo y de los Personajes, sin que ninguna variable derivada contenga un valor de color literal (hexadecimal, rgb, rgba, hsl o nombre CSS) distinto de una referencia a las Fichas, salvo dos conjuntos de excepciones deliberadas: (a) las variables de reserva de sufijo `-reserva`, que dan un valor usable si una Ficha faltara; y (b) las ocho variables de color de la mascota y del lápiz, que son literales a propósito porque la tortuga y el lápiz conservan su color en todas las paletas y no se derivan de las Fichas: `--color-tortuga-contorno`, `--color-tortuga-relleno`, `--color-tortuga-caparazon`, `--color-tortuga-detalle`, `--color-tortuga-cabeza`, `--color-kiro-relleno`, `--color-kiro-ojos` y `--color-lapiz-relleno`.
2. EL Lienzo y LOS Personajes DEBERÁN leer del Tema, por getComputedStyle, el color de cada trazo y de cada relleno, de modo que un cambio en una Ficha del Tema se refleje en el siguiente repintado sin tocar ningún módulo.
3. LA Suite_Pruebas DEBERÁ verificar, con una prueba del Tema que lee el CSS real, que en la paleta Kiro cada par de texto visible sobre su fondo alcanza una relación de contraste WCAG 2.1 de 4.5:1 o mayor; que cada estela y cada trazo frente al fondo del Lienzo alcanza 3:1 o mayor; y que el indicador de foco alcanza 3:1 frente a su fondo adyacente.

### Requisito 3: Personajes y movimiento de la tortuga

**Historia de usuario:** Como jugador, quiero ver claramente a la tortuga con Kiro montado y seguir su
recorrido, sin que el personaje me tape la punta del trazo que acabo de ver dibujar.

#### Criterios de aceptación

1. LOS Personajes DEBERÁN dibujar la tortuga con su caparazón de escudos y su piel, con Kiro montado encima, y el lápiz, únicamente con trazos y rellenos de Canvas 2D, leyendo del Tema el color y el grosor de cada trazo, sin ningún valor de color literal en el módulo.
2. LOS Personajes DEBERÁN dibujar el conjunto de la tortuga, Kiro y el lápiz a escala 2,4 respecto del círculo de 40 unidades de diámetro que declara 00·13.6; y, EN EL Nivel 0.1, cuya figura es un tramo abierto que termina lejos del Estado inicial, la silueta de la tortuga en reposo en el Estado inicial no DEBERÁ solaparse con el extremo final del trazo (enmienda de 00·13.6). La garantía de no solapamiento se limita al Nivel 0.1 porque en las figuras cerradas (por ejemplo el cuadrado del Nivel 0.4) el trazo termina en el punto de partida, donde la tortuga descansa en reposo.
3. LOS Personajes DEBERÁN dibujar el lápiz según la variable --lapiz-mostrar del Tema: CUANDO --lapiz-mostrar vale arriba, DEBERÁN dibujar el lápiz únicamente en su posición levantada; SI --lapiz-mostrar tiene cualquier otro valor o no está definida, ENTONCES DEBERÁN dibujar el lápiz en sus dos posiciones, abajo y arriba (enmienda de 00·13.5).
4. LOS Personajes NO DEBERÁN dibujar ninguna marca de rumbo mientras --marca-rumbo-mostrar=no (enmienda de 00·13.3).
5. CUANDO EL jugador ejecuta su programa, EL Animador DEBERÁ animar la tortuga fotograma a fotograma a la velocidad seleccionada entre lenta (1000 ms por Operacion), normal (400 ms), rápida (120 ms) e inmediata (0 ms), dibujando la estela conforme avanza, y EL Editor DEBERÁ resaltar la línea de la Operacion en curso.
6. CUANDO EL Animador aplica la última Operacion de la secuencia y termina de dibujar su estela, EL Juego DEBERÁ entregar a las Estrellas la secuencia completa para calificar, y NO DEBERÁ calificar en el momento de activarse ejecutar.
7. CUANDO una ejecución termina, o SI EL jugador la detiene, ENTONCES EL Juego DEBERÁ devolver la tortuga al Estado inicial del Nivel conservando intacta la estela ya dibujada (enmienda de 00·14.8 y 00·24.7).
8. MIENTRAS prefers-reduced-motion es reduce, EL Animador DEBERÁ dibujar de golpe la estela completa sin posiciones intermedias, dejar la tortuga en el Estado inicial, y mantener disponible el modo paso a paso aplicando exactamente una Operacion por paso.

### Requisito 4: Comparación con la figura de Kiro

**Historia de usuario:** Como jugador que falló, quiero superponer mi figura sobre la de Kiro y ver en
qué se diferencian, para corregir mi programa en lugar de probar al azar.

#### Criterios de aceptación

1. LA Comparacion DEBERÁ presentar, junto al título de la figura del jugador, un control que alterna la presentación entre exactamente dos vistas, lado a lado y superposición, y DEBERÁ exponer cuál de las dos está en curso mediante el estado presionado del propio control.
2. SI al terminar una ejecución las Estrellas niegan la precisión, ENTONCES LA Comparacion DEBERÁ pasar por su cuenta a la vista de superposición con el Diff dibujado y dejar el control en estado presionado, sin que el jugador active ningún control.
3. CUANDO LA Comparacion presenta la superposición, LA Comparacion DEBERÁ dibujar las dos estelas en un solo lienzo y EL Diff DEBERÁ colorear los trazos reales de cada figura según la región a la que pertenecen, aplicando la transformación del veredicto de presentación del Validador, que es el de las Posiciones reales o el de la Alineación del Validador, el que tenga mayor coincidencia (enmienda de 00·23.5).
4. EL Diff DEBERÁ dibujar la coincidencia en línea verde continua, el exceso en rojo con un grosor de al menos el doble del grosor de la coincidencia, y la falta en gris punteado, tomando color, grosor y patrón del Tema, de modo que las tres regiones se distingan por patrón de trazo y por grosor además de por color.
5. LAS Estrellas DEBERÁN salir siempre del veredicto oficial del Validador, con independencia del veredicto de presentación usado para dibujar y de la vista en curso.
6. CUANDO el jugador no ha ejecutado ningún programa, o su última ejecución no encendió coincidencia ni exceso, LA Comparacion DEBERÁ presentar el lienzo del jugador con cuadrícula y sin estela, EL Diff DEBERÁ dibujar solo la falta, el control de comparación DEBERÁ permanecer operable, y LA Comparacion DEBERÁ anunciar por la Región_Anuncios que todavía no hay estela del jugador que comparar.

### Requisito 5: Panel de comandos

**Historia de usuario:** Como jugador que empieza, quiero ver los comandos que puedo usar con su ejemplo
a la vista, sin que la columna se recargue con todo el texto de cada comando.

#### Criterios de aceptación

1. EL Panel_Comandos DEBERÁ presentarse como una barra de herramientas con una sola parada de Tab, con exactamente un botón en el orden de tabulación a la vez, y DEBERÁ llevar el foco fuera del Panel_Comandos con una sola pulsación de Tab desde el botón enfocado.
2. CUANDO EL jugador recorre el Panel_Comandos, EL Panel_Comandos DEBERÁ mover el foco entre sus botones con las flechas ArrowUp, ArrowDown, ArrowLeft y ArrowRight, y llevar el foco al primer y al último botón con Inicio y Fin.
3. EL Panel_Comandos DEBERÁ mostrar como texto visible permanente el ejemplo de uso de cada comando.
4. CUANDO EL jugador pasa el cursor sobre un botón o lo enfoca, EL Panel_Comandos DEBERÁ revelar el nombre largo, la abreviatura y la descripción de ese comando (enmienda de 00·26.2, que exigía mostrarlos también como texto visible permanente).
5. EL Panel_Comandos DEBERÁ incluir en el nombre accesible de cada botón el nombre largo, la abreviatura, la descripción y el ejemplo del comando, completos y carácter por carácter.
6. SI el vocabulario desbloqueado del Nivel en curso está vacío, ENTONCES EL Panel_Comandos DEBERÁ presentarse sin ningún botón y sin lanzar ninguna excepción.
7. CUANDO EL jugador activa el botón de un comando con el ratón, con Enter o con la barra espaciadora, EL Editor DEBERÁ insertar el ejemplo de uso de ese comando en la posición del cursor, y EL Panel_Comandos DEBERÁ conservar el foco en el botón activado.

### Requisito 6: Tipografía sin solicitudes a otro origen

**Historia de usuario:** Como jugador, quiero que el juego cargue y funcione sin depender de ningún
servicio externo, para que ni la privacidad ni el funcionamiento dependan de otro sitio.

#### Criterios de aceptación

1. DURANTE el flujo del Nivel 0.1, desde la carga de index.html hasta mostrar la demostración completa de Kiro, EL Juego DEBERÁ emitir cero solicitudes de red a cualquier origen distinto del que sirve index.html, incluidas las de fuentes, hojas de estilo y preconexiones (corrección del diseño para cumplir 00·27.8).
2. EL Juego DEBERÁ alojar en el propio origen las dos familias tipográficas (la de título/interfaz y la de código) bajo licencia OFL, compatible con la redistribución MIT del repositorio, sin ningún enlace, preconexión ni importación a un servicio de fuentes de otro origen.
3. SI ninguna familia alojada en el propio origen está disponible al momento de renderizar, ENTONCES EL Juego DEBERÁ presentar todo el texto con la Pila de fuentes del sistema del Tema declarada en tema.css como reserva, conservando todo el contenido legible y toda la interfaz operable, y sin emitir ninguna solicitud a otro origen como consecuencia.
4. SI el documento declara enlaces o preconexiones a un origen de fuentes distinto del propio, ENTONCES una revisión del documento servido DEBERÁ fallar la verificación, al ser una condición de incumplimiento de 00·27.8.

### Requisito 7: Controles, estrellas, semilla y marca

**Historia de usuario:** Como jugador, quiero controles claros, estrellas que entienda y la marca del
juego a la vista, para manejar el ciclo de prueba y error sin depender del color.

#### Criterios de aceptación

1. LOS Controles DEBERÁN presentar cada una de sus cinco acciones (ejecutar, detener, dar un paso, reiniciar y volver a ver la demostración) como un botón nativo con un icono y una etiqueta corta en español, alcanzable por teclado en orden visual, donde la etiqueta corta está contenida en el nombre accesible del botón.
2. LOS Controles DEBERÁN presentar la velocidad como un grupo de exactamente cuatro botones, uno por cada velocidad del Animador (lenta, normal, rápida, inmediata), con exactamente uno marcado como seleccionado a la vez por estado presionado y por clase, nunca solo por color.
3. CUANDO el jugador entra a un nivel, LOS Controles DEBERÁN marcar la velocidad normal como la única seleccionada.
4. EL Marcador_Estrellas DEBERÁ presentar las tres estrellas (precisión, economía, abstracción) como tres tarjetas, cada una distinguible de las otras y en su estado (pendiente, otorgada o negada) por forma (★ para otorgada, ☆ para pendiente o negada), por texto del estado en español y por color, de modo que dos de esos tres canales basten para distinguirlas sin depender solo del color.
5. EL Panel_Semilla DEBERÁ presentarse en la ranura bajo la figura de Kiro, mostrando el código del Reto en un elemento <output> con nombre accesible, seleccionable por teclado, junto con la acción de pedir otro reto y la acción de reproducir un código.
6. SI el nivel en curso es autorado (no generado), ENTONCES EL Panel_Semilla DEBERÁ deshabilitar las acciones de otro reto y de reproducir un código, e indicar que el reto es fijo mediante texto, no solo por color.
7. EL Juego DEBERÁ presentar el logo y la mascota como imágenes de boceto ubicadas en public/marca/, fuera del control de versiones, como excepción temporal al steering tecnologia hasta que el líder decida, y la Bitacora DEBERÁ registrar la excepción y su carácter temporal.
8. EL Juego DEBERÁ exponer el nombre KiroLogo como texto accesible del logo mediante el atributo alt, de modo que el nombre quede disponible aunque la imagen no cargue.

### Requisito 8: Accesibilidad del diseño

**Historia de usuario:** Como jugador que usa teclado, ratón o lector de pantalla, quiero ver siempre el
foco y distinguir los controles del fondo, porque la accesibilidad es parte del producto.

#### Criterios de aceptación

1. CUANDO :focus-visible muestra el indicador de foco en un elemento interactivo, EL Juego DEBERÁ presentar en él un indicador de foco visible de 2 píxeles de pantalla de grosor o más y con una relación de contraste de WCAG 2.1 de 3:1 o mayor frente al fondo adyacente (enmienda de 00·28.6, que exigía mostrar el foco con independencia de si llegó por teclado o por puntero; se usa :focus-visible porque es el comportamiento estándar para el indicador de foco y ya venía así en la base desde la spec 00).
2. EL Juego DEBERÁ mantener una relación de contraste de WCAG 2.1 de 3:1 o mayor entre su fondo adyacente y cada elemento interactivo de los Controles, del Panel_Comandos y del Editor que necesite ese contraste para identificarse como control (enmienda de 00·28.3, que lo exigía a todo borde y fondo de control; el diseño aprobado por el líder conserva el aspecto actual, medido entre 1,07:1 y 2,07:1, y acota la exigencia a los elementos que la necesitan para identificarse).
3. EL Juego DEBERÁ mantener una relación de contraste de WCAG 2.1 de 4.5:1 o mayor entre todo texto visible y su fondo adyacente.
4. EL Juego DEBERÁ mantener una relación de contraste de WCAG 2.1 de 3:1 o mayor, evaluada por separado, entre el fondo del Lienzo y cada uno de estos elementos: la estela del jugador, la estela de referencia, cada una de las tres regiones del Diff, y el conjunto de la tortuga con Kiro.
5. EL Juego DEBERÁ comunicar cada estado de su retroalimentación —las tres regiones del Diff, cada una de las tres Estrellas otorgada o negada, el estado habilitado o deshabilitado de cada acción de los Controles, y el estado del lápiz de la tortuga— por al menos un canal además del color: texto en español, forma, patrón de guiones o grosor de línea.

### Requisito 9: Integración de los mundos futuros sin tocar el tema

**Historia de usuario:** Como persona que construye los mundos 02 a 07, quiero reglas claras para agregar
color e interfaz, para no reescribir el tema ni la presentación en cada mundo.

#### Criterios de aceptación

1. EL Tema DEBERÁ ser la única fuente de verdad del color, de modo que ningún módulo de TypeScript de src/motor/ ni de src/ui/ contenga un valor de color escrito como literal, sino que lo tome de una variable del Tema. (src/main.ts queda excluido: mantiene a propósito valores de reserva del lector de tema.)
2. SI un módulo de TypeScript de src/motor/ o de src/ui/ contiene un valor de color escrito como literal, ENTONCES LA Suite_Pruebas DEBERÁ marcarlo como fallo, identificando el archivo y el valor literal detectado, sin modificar el módulo.
3. CUANDO se agrega una pieza de interfaz de un mundo nuevo asociándola a una Ranura de index.html por su identificador, EL Juego DEBERÁ colgarla de esa Ranura conservando sin cambios el identificador, el orden y el anidamiento de las Ranuras existentes.
4. CUANDO se integra un mundo nuevo, EL Juego DEBERÁ permitir hacerlo sin agregar, eliminar ni modificar ninguna declaración de tema.css ni ninguna regla de pantalla.css que no pertenezca a las clases propias de ese mundo nuevo.
5. SI se debilita una prueba heredada de las specs 00 o 01 sin una enmienda que lo justifique registrada tanto en esta spec como en la Bitacora, ENTONCES LA Suite_Pruebas DEBERÁ tratar ese cambio como no válido y reportarlo como fallo identificando la prueba afectada.
