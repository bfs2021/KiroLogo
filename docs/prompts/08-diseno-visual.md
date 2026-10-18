# Prompt · Spec 08 · Diseño visual

> Pegar el texto de abajo al iniciar la spec.

---

Quiero crear la spec **08-diseno-visual** de KiroLogo. Las specs 00 y 01 están terminadas: el lenguaje,
el motor, el validador, los cinco niveles del mundo 0 y el progreso funcionan. Esta spec no agrega
mundos ni vocabulario: ordena la presentación.

## Objetivo

Convertir en spec el diseño visual que hoy existe como propuesta en el repositorio, sin commit. El líder
del equipo lo vio y quiere que se formalice. Hay que documentarlo como requisitos verificables y cerrar
lo que choca con las specs 00 y 01, para que los mundos que vienen (02 a 07) se construyan encima y no
lo contradigan.

La spec **no parte de cero**: el código ya existe. Los requisitos describen lo que el diseño debe
cumplir, y las tareas son de verificación, conciliación y pruebas, no de construcción.

Idea del diseño: una mesa de trazado de noche, en tonos suaves para poder jugar mucho rato sin cansar la
vista. La referencia visual es la web de Kiro (kiro.dev): casi negro con un matiz, violeta suave y
lavanda clara. Se descartó el verde lima neón de la primera versión porque cansaba.

## Alcance

**Lo que hay que documentar**

Los archivos: `index.html`, `src/estilos/{tema,paletas,pantalla}.css`, `src/main.ts`,
`src/motor/{personajes,animador,validador}.ts`, `src/niveles/mundos.ts` y
`src/ui/{selector-paleta,marcador-estrellas,selector-nivel,panel-comandos,controles,comparacion,diff,demostracion}.ts`,
con sus pruebas.

- **Estructura de la pantalla.** Cabecera con el logo, el selector de colores y la ruta de niveles con
  la etiqueta del mundo y la medalla de la insignia. Tres columnas: la figura de Kiro con el panel de
  semilla debajo; el programa al centro (globo de Kiro con su mascota, editor con números de línea y
  contador, panel de comandos en una columna a su lado, controles y velocidad); y tu figura con el
  botón de comparar y el marcador de estrellas debajo. Cabe sin desplazarse en 1440×900; en 1366×768
  sobran unos 8 px. Por debajo de 720 px todo se apila.
- **Tema y paletas.** 19 fichas de color por paleta en `tema.css`; el resto de variables se deriva
  de ellas. Dos paletas: *Kiro* (violeta suave, la predeterminada) y *Océano* (azul). Selector en la
  cabecera, con una sola parada de Tab. El lienzo lee sus colores del tema al pintar y se repinta al
  cambiar de paleta. Pruebas de contraste WCAG por paleta.
- **Personajes y movimiento.** Tortuga con caparazón de escudos, piel y Kiro montado, a escala 2,4. La
  flecha de rumbo no se dibuja y el lápiz solo se ve levantado (variables del tema). La tortuga se
  anima fotograma a fotograma, se resalta la línea que se ejecuta, y el intento se evalúa **al terminar
  de dibujarse**, no al pulsar Ejecutar. Al terminar o detener, la tortuga vuelve al punto inicial.
  Con movimiento reducido del sistema, todo se dibuja de golpe.
- **Comparación con Kiro.** Botón junto al título de tu figura que superpone las dos figuras en un solo
  lienzo. Si se niega la precisión, se abre sola. El diff pinta líneas limpias sobre los trazos reales:
  verde continuo lo que coincide, rojo grueso lo que sobra, gris punteado lo que falta. Se elige entre
  la comparación en las posiciones reales y la alineada por el validador, la que mejor explique el
  dibujo (`veredictoParaMostrar`). Las estrellas siguen saliendo del veredicto oficial.
- **Panel de comandos.** Barra de herramientas con una sola parada de Tab y flechas. Cada botón muestra
  el ejemplo; el nombre, la abreviatura y la descripción salen al pasar el cursor o enfocar, y están en
  el nombre accesible.
- **Controles, estrellas y semilla.** Etiquetas cortas con icono; velocidad en cuatro botones; tres
  tarjetas de estrellas que se distinguen por forma, texto y color; panel de semilla.
- **Marca.** Logo y mascota como imágenes en `public/marca/`, fuera de git. Son un boceto.

**Conciliación con las specs anteriores**

Revisé el diseño contra el texto de los requisitos. Estos son los puntos donde se aparta. Cada uno hay
que cerrarlo de una de tres formas: **enmendar la spec** citando el requisito, **corregir el diseño**, o
**declarar una excepción** con su justificación.

| # | Qué hace el diseño | Requisito |
|---|---|---|
| 1 | La tortuga vuelve al inicio al terminar o detener | 00 · 14.8 y 24.7 |
| 2 | El lápiz solo se dibuja levantado | 00 · 13.5 |
| 3 | No se dibuja la marca de rumbo | 00 · 13.3 |
| 4 | La tortuga mide 2,4 veces lo que permite el límite de 40 unidades | 00 · 13.6 |
| 5 | El panel muestra solo el ejemplo; el resto sale al pasar el cursor | 00 · 26.2 |
| 6 | Las fuentes se piden a Google Fonts, otro origen | 00 · 27.8 |
| 7 | El selector de paletas guarda una segunda clave en `localStorage` | 00 · 27.8 |
| 8 | El logo y la mascota son imágenes | steering `tecnologia`: no hay activos gráficos |
| 9 | El diff puede mostrar la comparación en posiciones reales, no la alineada | 00 · 23.5 |

Además, dos incumplimientos que ya venían de la base y que conviene cerrar aquí: el anillo de foco no se
ve al hacer clic con el ratón, por usar `:focus-visible` (28.6); y los controles no llegan a 3:1 frente
a su fondo adyacente (28.3), medido entre 1,07:1 y 2,07:1.

**Reglas para los mundos que vienen**

Cómo agregar una paleta, cómo colocar una pieza de interfaz en una ranura de `index.html`, y la regla de
que ningún módulo escribe un color a mano: todo sale de las variables del tema.

## Fuera de alcance

- Mundos, niveles, vocabulario y generadores nuevos.
- Cambiar los umbrales del validador o la forma en que se ganan las estrellas.
- Más paletas que las dos existentes, modo claro, sonido, otros idiomas.
- Tres cosas que el diseño actual tiene y que **cambian en la spec 09**: los números en los atajos de
  movimiento, los degradados y resplandores, y la ruta de niveles. Los requisitos de esta spec no deben
  fijarlas; que queden fuera o descritas como estado actual que la 09 sustituye.

## Criterios de aceptación

1. Cada decisión de «Lo que hay que documentar» tiene al menos un requisito con criterios
   verificables, y ningún requisito describe algo que el código no hace.
2. Cada uno de los nueve desvíos de la tabla queda resuelto y citado por número de requisito. No
   queda ninguna contradicción silenciosa con las specs 00 y 01.
3. Durante el flujo del nivel 0.1 no hay solicitudes a otro origen, salvo que una enmienda lo apruebe
   y lo diga.
4. El almacenamiento del navegador cumple el requisito 27.8 de la spec 00 o su enmienda, con la prueba
   correspondiente.
5. Cada paleta cumple WCAG 2.1 AA, con una prueba por paleta que lee el CSS real; y los controles
   cumplen 3:1 frente a su fondo, o 28.3 queda enmendado.
6. El indicador de foco se ve también al enfocar con el ratón, o 28.6 queda enmendado.
7. La pantalla cabe sin desplazarse en 1440×900, y el desplazamiento máximo aceptado en 1366×768 queda
   fijado por un requisito.
8. Un mundo nuevo se integra sin tocar el tema ni `pantalla.css` más allá de sus propias clases,
   siguiendo las reglas documentadas.
9. Hay una lista de las pruebas que se reescribieron para el diseño nuevo, con el motivo de cada una.
   Ninguna se debilita sin una enmienda que lo justifique: que las pruebas pasen no basta como prueba de
   cumplimiento.
10. `npm run build` y `npm test` pasan, y la bitácora registra cada enmienda y por qué se hizo.

## Steering a consultar

`producto` para la idea del juego y el tono. `tecnologia` para los personajes por código y la regla
sobre imágenes. `estructura` para las capas y la ubicación de cada módulo. `validacion-geometrica` para
el veredicto y el diff.

## Decisiones a cerrar en la fase de requisitos

- **Tortuga al terminar (1).** El usuario pidió que vuelva al inicio porque, tan grande, tapaba la punta
  del trazo. Opciones: enmendar 14.8 y 24.7, o dejarla donde acabó y resolver de otra forma que la punta
  se vea.
- **Lápiz y flecha (2 y 3).** Enmendar 13.3 y 13.5, o restaurar el dibujo completo. Ambos son una variable
  del tema, así que volver es barato.
- **Tamaño (4).** Si se queda, fijar el tamaño nuevo como requisito y exigir que la punta del trazo siga
  visible, que era la razón del límite de 40 unidades.
- **Panel de comandos (5).** Cómo cumplir «texto visible» sin recargar la columna. Hoy el nombre accesible
  tiene todo; la duda es la vista.
- **Fuentes (6).** Recomendación: alojar las dos familias en el propio origen, con licencia OFL, o
  quitar el enlace y usar solo la pila de fuentes del sistema que ya existe como reserva.
- **Clave extra (7).** O se guarda la paleta dentro del objeto del progreso, con una sola clave y la
  migración que haga falta, o se enmienda 27.8 para admitir una clave de preferencias. La primera cambia
  el formato persistido; la segunda cambia una spec.
- **Imágenes (8).** Dibujar el logo y la mascota por código, como los personajes, o aprobar una excepción
  para la marca y subir los archivos al repositorio. Hoy no están en git, así que quien clone verá la
  imagen rota.
- **Diff (9).** Fijar como requisito la regla de cuándo se muestra la comparación en posiciones reales y
  cuándo la alineada, incluido el desempate.
- **Contraste de controles (28.3).** Subir el contraste de bordes y fondos de los controles, o enmendar
  el requisito para exigir 3:1 solo a lo que lo necesita para identificarse.
- Si el selector de paletas es permanente o provisional hasta que se elija una.

## Regla de trabajo

El aspecto actual está aprobado por el líder. Si propones un cambio visible, descríbelo y espera mi
respuesta antes de aplicarlo.
