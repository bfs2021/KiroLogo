# Requirements Document

**KiroLogo · Spec 09 · Ajustes de interfaz**

## Introduction

Esta spec **no parte de cero**: la pantalla de KiroLogo ya existe y está documentada por la spec 08
(Diseño visual) como estado aprobado del repositorio. El trabajo de esta spec es **tres ajustes de
experiencia acotados** sobre esa pantalla, y nada más. Todo lo demás —paletas, tipografías,
distribución de columnas, panel de semilla, marcador de estrellas, comparación y globo de Kiro— se
conserva sin cambios.

Los tres ajustes son:

1. **Atajos de movimiento sin números.** Hoy los botones de `AVANZA`, `RETROCEDE`, `GIRADERECHA` y
   `GIRAIZQUIERDA` muestran e insertan un ejemplo con cantidad (`AVANZA 100`, `GIRADERECHA 90`…). Pasan
   a mostrar e insertar solo el nombre del comando y un espacio, para que el jugador escriba la cantidad.
2. **Colores planos.** Se retiran los degradados y los resplandores difuminados de `pantalla.css` y
   `tema.css` —el halo del logo, los fondos del `body`, el glow del botón en curso, el degradado y glow
   de la medalla y el `linear-gradient` de la pluma—, de modo que todo sea color sólido, conservando el
   relieve de sombra dura, la paleta Kiro y el contraste. Se conservan, como excepciones documentadas, el
   resplandor de las estelas del lienzo y el de la estrella otorgada.
3. **Menú de mundos desplegable.** La fila de botones de nivel del mundo en curso se sustituye por un
   menú donde cada uno de los seis mundos de concepto es un desplegable que muestra sus niveles, con lo
   que por fin se puede ir de un mundo a otro.

Como la spec 08 ya anticipa que estas tres cosas cambian aquí (las deja declaradas como «estado actual
que la spec 09 sustituye»), esta spec **cierra de forma explícita** cada desvío respecto de las specs
00, 01 y 08, citando el criterio anterior y registrando el cierre en la Bitacora. Cuando un criterio
anterior deja de ser cierto, esta spec lo **enmienda** (se cita el criterio y esta spec pasa a prevalecer
sobre él) o lo **reemplaza** (el estado actual que la spec 08 describía queda sustituido por el
comportamiento de esta spec).

Ningún requisito de esta spec describe una conducta que el código no vaya a tener al terminarla, y
ninguna prueba existente se debilita: las pruebas que cambian por estos tres ajustes quedan listadas con
su motivo.

### Fuera de alcance

Queda **fuera de alcance** de esta spec:

- Cambiar las paletas, las tipografías, la distribución de columnas o el texto de cualquier otro botón o
  control que no sea uno de los cuatro atajos de movimiento.
- El Selector_Paleta y la paleta Océano: se retiran en un trabajo aparte (spec 08, decisión D11) y no
  entran en esta spec.
- Cambiar lo que significa un comando, su aridad o sus mensajes de error: solo cambia lo que el botón de
  un atajo de movimiento muestra e inserta.
- Agregar mundos, niveles o reglas de desbloqueo nuevas. La regla de desbloqueo de la spec 01
  (Requisito 7) no cambia.
- Rediseñar el Panel_Semilla, el Marcador_Estrellas, la Comparacion o el Globo_Kiro.

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

Sistemas y módulos (los nombres coinciden con `estructura.md` y con los glosarios de las specs 00 y 08):

- **Juego**: la aplicación completa servida por `index.html` y `src/main.ts`.
- **Pantalla**: la composición visual de la interfaz, definida por `index.html` y por
  `src/estilos/pantalla.css`.
- **Tema**: `src/estilos/tema.css`. Única fuente de verdad del color, el grosor y la tipografía de la
  paleta Kiro.
- **Vocabulario**: `src/lenguaje/vocabulario.ts`. Tabla única de comandos con nombre, abreviatura,
  aridad, tipos de argumento, mundo, descripción, ejemplo y marca de ejecutable. Única fuente de verdad
  de los comandos.
- **Atajo_Movimiento**: cada uno de los cuatro botones del Panel_Comandos cuyo comando tiene aridad 1 y
  recibe una cantidad que decide el jugador: `AVANZA`, `RETROCEDE`, `GIRADERECHA` y `GIRAIZQUIERDA`.
- **Panel_Comandos**: `src/ui/panel-comandos.ts`. La barra de herramientas con el vocabulario
  desbloqueado del mundo en curso.
- **Editor**: `src/ui/editor.ts`. El área de escritura con números de línea y contador de instrucciones,
  que recibe el texto que inserta el Panel_Comandos.
- **Interprete**: `src/lenguaje/interprete.ts`. Convierte el AST en operaciones.
- **Catalogo_Errores**: `src/lenguaje/errores.ts`. Único lugar donde viven los mensajes visibles al
  jugador.
- **Menu_Mundos**: la pieza de interfaz de la cabecera que sustituye a la fila de botones de nivel del
  Selector_Nivel. Presenta los seis mundos como desplegables y permite elegir un nivel de cualquiera.
- **Selector_Nivel**: `src/ui/selector-nivel.ts`. La pieza de interfaz de la cabecera. Esta spec
  reemplaza su presentación de fila de niveles de un solo mundo por el Menu_Mundos; conserva su cometido
  de cargar un nivel elegido.
- **Info_Mundos**: `src/niveles/mundos.ts`. El nombre y la insignia de concepto de cada uno de los seis
  mundos de concepto (0 a 5), con `etiquetaDeMundo(mundo)` dando «Mundo N · Nombre».
- **Catalogo_Niveles**: `src/niveles/catalogo.ts`. Reúne y ordena los mundos y sus niveles. Un mundo
  «sin niveles en el catálogo» es un mundo de Info_Mundos para el que el Catalogo_Niveles no aporta
  ningún nivel todavía.
- **Desbloqueo**: `src/juego/desbloqueo.ts`. Determina qué mundos y qué niveles están disponibles según
  el Progreso, con la regla de la spec 01 (Requisito 7).
- **Progreso**: `src/juego/progreso.ts`. Persistencia del avance en `localStorage`.
- **Estado_Nivel**: el estado de un nivel para el jugador, uno de: bloqueado, desbloqueado sin aprobar,
  aprobado, o completado con tres estrellas.
- **Region_Anuncios**: el único elemento `aria-live` del Juego (`polite`, `aria-atomic`), único canal de
  anuncios de estado.
- **Suite_Pruebas**: el conjunto de pruebas de Vitest que ejecuta `npm test`.
- **Bitacora**: `docs/bitacora.md`. Registro de cómo se concibió el juego y de las decisiones del
  proyecto.

Términos del dominio y de esta spec:

- **Texto_Insercion**: el texto exacto que el Panel_Comandos entrega al Editor al activar un botón, dado
  por el campo `insercion` del Vocabulario. Para un Atajo_Movimiento es el nombre del comando seguido de
  un solo espacio; para una entrada de aridad 0 (`CENTRO`, `BORRAPANTALLA`) es el nombre sin espacio
  final.
- **Resplandor_Difuminado**: un efecto visual que separa o ilumina un elemento mediante desenfoque,
  escrito en el CSS como `drop-shadow` o `text-shadow` con radio de desenfoque mayor que cero, o como la
  parte con desenfoque de un `box-shadow`. No incluye la sombra dura (`box-shadow` con radio de
  desenfoque cero), que esta spec conserva.
- **Degradado**: cualquier función de gradiente CSS —`linear-gradient`, `radial-gradient` o
  `conic-gradient`— usada como valor de color o de imagen de fondo.
- **Sombra_Dura**: un `box-shadow` con radio de desenfoque cero, usado para el relieve de los botones y
  las tarjetas. Esta spec la conserva intacta.
- **Prueba_Color_Plano**: la prueba estructural que lee el texto real de `pantalla.css` y `tema.css` y
  falla si reaparece un Degradado o un Resplandor_Difuminado de la lista cerrada de esta spec.

## Decisiones cerradas en esta fase

Las decisiones que el prompt de la spec dejó abiertas quedan resueltas así, confirmadas en la fase de
requisitos. La columna «Cierre» indica contra qué criterio anterior se concilia, cuando aplica.

| # | Decisión | Resolución | Cierre | Requisito |
|---|---|---|---|---|
| D1 | Cuál es el texto visible y qué inserta un botón sin romper el nombre accesible | El texto visible permanente del botón es el campo `insercion` del Vocabulario (para un Atajo_Movimiento, el nombre del comando; el espacio final del valor insertado no necesita verse, pero el texto mostrado no lleva número). El `ejemplo` con cantidad sigue disponible en la descripción y en el nombre accesible. El Panel_Comandos inserta `insercion` | Enmienda de 00·26.2, 00·26.4 y 08·5.3 | 1, 2 |
| D2 | La guía del nivel 0.1 que hoy dice «escribe `AVANZA 100` y pulsa Ejecutar» | No cambia. El ejemplo `AVANZA 100` sigue estando en la descripción y en el nombre accesible del botón, y la guía lo cita como lo que el jugador debe escribir; solo cambia lo que el botón **muestra** e **inserta**. La guía no describe la inserción del botón, así que no se enmienda | — | 1 |
| D3 | Resplandor de las estelas del lienzo y de la estrella otorgada | Se CONSERVAN el `drop-shadow` de `.kl-capa-estela-referencia` y `.kl-capa-estela-jugador` y el `text-shadow` de `.kl-estrella[data-estado="otorgada"] .kl-estrella-icono`. La Prueba_Color_Plano los admite como EXCEPCIÓN documentada, nombrando selector y propiedad exactos. Se retiran solo el halo del logo, los resplandores y la cuadrícula del fondo del `body`, el glow del botón en curso, el degradado y glow de la medalla, y el `linear-gradient` sin uso de `.kl-pluma` | Confirmada por el usuario | 3, 4 |
| D4 | Forma del Menu_Mundos | Un desplegable en la cabecera que se abre **sobre** el contenido (capa superpuesta), en acordeón: a lo sumo un mundo abierto a la vez. Así la cabecera no crece y abrir un mundo no empuja el resto de la pantalla | — | 5, 7 |
| D5 | Qué mundo aparece abierto al entrar | El del nivel en curso | — | 7 |
| D6 | Foco del Menu_Mundos | Una sola parada de Tab para todo el menú, recorrido con las flechas (patrón «roving tabindex», el mismo que ya usa el Panel_Comandos), para no gastar paradas de Tab contra el límite de 20 de 00·28.1 | Concilia con 00·28.1 | 7 |
| D7 | Dónde va la medalla de la insignia al desaparecer la fila de niveles | En el encabezado del desplegable de cada mundo: la medalla de la insignia de concepto de ese mundo aparece en su encabezado cuando se ha ganado | — | 5 |

## Conciliación con las specs anteriores

Cada criterio anterior que deja de ser cierto por estos ajustes queda resuelto por el requisito indicado
y cerrado de la forma indicada. Ninguna contradicción queda silenciosa, y la Bitacora registra cada
cierre.

| # | Qué cambia esta spec | Criterio anterior | Cierre | Requisito que lo resuelve |
|---|---|---|---|---|
| 1 | El texto visible del botón de un Atajo_Movimiento ya no es el ejemplo con cantidad, sino el nombre (campo `insercion`); el ejemplo con cantidad pasa a la descripción y al nombre accesible | 00·26.2 (texto visible con el ejemplo) | Enmienda | 1 |
| 2 | El Panel_Comandos inserta la `insercion` del comando, no el `ejemplo` | 00·26.4 (insertar el ejemplo de uso) | Enmienda | 1 |
| 2b | El Panel_Comandos mostraba el ejemplo con cantidad como texto visible permanente del botón; pasa a mostrar el nombre (campo `insercion`) | 08·5.3 (el panel mostraba el ejemplo como texto visible) | Enmienda | 1 |
| 3 | La cabecera deja de mostrar la fila de niveles de un solo mundo y la etiqueta «Mundo N · Nombre» con la medalla al final; pasa a un menú de los seis mundos desplegables | 08·1 (ruta de niveles como estado actual que la spec 09 sustituye) | Reemplazo | 5, 7 |
| 4 | El Selector_Nivel deja de presentar los cinco niveles de un solo mundo en fila; el Menu_Mundos presenta los niveles de cualquier mundo y carga el elegido | 01·12 (navegación entre niveles del mundo) | Enmienda | 5, 6, 7 |
| 5 | Se retiran los degradados y los resplandores difuminados del halo del logo, los fondos del `body`, el glow del botón en curso, el degradado y glow de la medalla y el `linear-gradient` de la pluma; se conservan los `drop-shadow` de las estelas y el `text-shadow` de la estrella otorgada como excepciones documentadas | 08·estado visual actual (presentación con degradados y resplandores que la spec 09 sustituye) | Reemplazo | 3, 4 |

## Requirements

### Requisito 1: Atajos de movimiento sin cantidad

**Historia de usuario:** Como jugador que empieza, quiero que el botón de un comando de movimiento me
deje escribir yo la cantidad, para aprender que la cantidad es una decisión mía y no algo que el juego
elige por mí.

#### Criterios de aceptación

1. EL Vocabulario DEBERÁ declarar, por cada entrada, un campo de inserción distinto del campo de ejemplo, con esta regla general para toda entrada del Vocabulario: toda entrada de aridad 1 con argumento numérico (aridad exactamente 1 y su único argumento de tipo numérico, incluidos los cuatro Atajo_Movimiento) tiene como campo de inserción el nombre largo del comando seguido de un solo espacio; las entradas de aridad 0 (`CENTRO`, `BORRAPANTALLA`) tienen como campo de inserción solo el nombre largo, sin espacio final; las demás entradas (por ejemplo `REPITE`, `PONCOLOR`, `PARA`, y las de dos números como `SUMA`) conservan su `ejemplo` como campo de inserción por ahora y se revisan en la spec de su propio mundo.
2. EL Panel_Comandos DEBERÁ mostrar como texto visible permanente de cada botón el campo de inserción del Vocabulario (para un Atajo_Movimiento, el nombre del comando, sin número), no el campo de ejemplo; el campo de ejemplo con cantidad permanece en la descripción y en el nombre accesible del botón (esto enmienda 00·26.2 y 08·5.3, que exigían el ejemplo como texto visible).
3. CUANDO EL jugador activa un Atajo_Movimiento con el ratón, con Enter o con la barra espaciadora, EL Editor DEBERÁ insertar en la posición del cursor el campo de inserción de ese comando —el nombre más un solo espacio— y DEBERÁ dejar el cursor inmediatamente después de ese espacio, sin ningún número y sin modificar ninguna otra parte del contenido (enmienda de 00·26.4, que insertaba el ejemplo de uso con su cantidad).
4. CUANDO EL jugador activa el botón de `CENTRO` o de `BORRAPANTALLA`, EL Editor DEBERÁ insertar el nombre largo del comando sin ningún espacio final ni número, conservando el comportamiento de un comando de aridad 0.
5. EL Panel_Comandos DEBERÁ tomar el Texto_Insercion del campo de inserción del Vocabulario, sin mantener ninguna lista propia de textos de inserción, de modo que el Vocabulario siga siendo la única fuente de verdad de lo que un botón inserta.
6. NINGÚN botón del Panel_Comandos del mundo 0 DEBERÁ insertar un número como parte de su Texto_Insercion, de modo que un atajo nunca anticipe una cantidad que le corresponde decidir al jugador.

### Requisito 2: El atajo de movimiento sigue siendo jugable

**Historia de usuario:** Como jugador, quiero que pulsar el atajo y escribir yo la cantidad me dé el
mismo resultado que antes, para que el cambio me ayude sin quitarme nada.

#### Criterios de aceptación

1. CUANDO EL jugador activa el botón de `AVANZA`, escribe `100` detrás del espacio insertado y activa la acción de ejecutar en el Nivel 0.1, EL Juego DEBERÁ otorgar las tres estrellas igual que con el programa `AVANZA 100`.
2. NINGÚN botón del Panel_Comandos del mundo 0 DEBERÁ mostrar un número como texto visible, y LA Suite_Pruebas DEBERÁ comprobarlo sobre los seis botones del mundo 0 —los cuatro Atajo_Movimiento, `CENTRO` y `BORRAPANTALLA`— verificando que el texto visible de cada botón no contiene ningún dígito.
3. SI EL jugador ejecuta un Atajo_Movimiento sin cantidad —por ejemplo `AVANZA` en una línea sin número—, ENTONCES EL Juego DEBERÁ mostrar el mensaje del Catalogo_Errores que indica que falta el número, tal como lo declara el catálogo (`AVANZA necesita un número. Por ejemplo: AVANZA 100`), y NO DEBERÁ mover la tortuga ni producir ninguna operación de movimiento para esa instrucción.
4. EL Panel_Comandos DEBERÁ conservar su barra de herramientas con una sola parada de Tab y el recorrido de sus botones con las flechas, sin que la retirada de la cantidad de los Atajo_Movimiento cambie el foco ni el orden de tabulación (conforme a 00·28.1 y a 08·5.1).

### Requisito 3: Colores planos en la presentación

**Historia de usuario:** Como jugador, quiero una pantalla de color sólido, sin halos ni degradados, para
una imagen limpia que no compita con la figura que estoy dibujando.

#### Criterios de aceptación

1. LA Pantalla DEBERÁ presentar el fondo de la página con color sólido, sin ningún Degradado de color ni ninguna cuadrícula de puntos hecha con gradiente en el fondo del elemento `body`.
2. LA Pantalla DEBERÁ presentar el logo del Juego sin ningún Resplandor_Difuminado, retirando el `filter: drop-shadow` de la clase `.kl-logo`.
3. LA Pantalla DEBERÁ presentar el botón del nivel en curso sin ningún Resplandor_Difuminado, retirando la parte con desenfoque del `box-shadow` de `.kl-selector-boton[aria-current="step"]` y conservando su relieve de Sombra_Dura.
4. LA Pantalla DEBERÁ presentar la medalla de la insignia con color dorado sólido, retirando el `radial-gradient` dorado y el Resplandor_Difuminado del `box-shadow` de `.kl-insignia-medalla`, conservando la medalla, su borde y su relieve de Sombra_Dura.
5. LA Pantalla DEBERÁ conservar el Resplandor_Difuminado de las dos estelas del lienzo, manteniendo el `filter: drop-shadow` de `.kl-capa-estela-referencia` y de `.kl-capa-estela-jugador` como excepción documentada de color plano.
6. LA Pantalla DEBERÁ conservar el Resplandor_Difuminado del icono de una estrella otorgada, manteniendo el `text-shadow: 0 0 14px color-mix(in srgb, var(--aviso) 70%, transparent)` de `.kl-estrella[data-estado="otorgada"] .kl-estrella-icono` como excepción documentada de color plano.
7. LA Pantalla DEBERÁ retirar el `linear-gradient` de `.kl-pluma`, que es CSS sin uso en el HTML.
8. LA Pantalla DEBERÁ presentar los botones de la interfaz con color sólido, conservando su relieve de Sombra_Dura (sin desenfoque), los colores de la paleta Kiro y su contraste.

### Requisito 4: La prueba estructural de color plano

**Historia de usuario:** Como persona que mantiene KiroLogo, quiero una prueba que impida que vuelvan los
degradados y los resplandores, para que la decisión de color plano no se erosione con el tiempo.

#### Criterios de aceptación

1. LA Suite_Pruebas DEBERÁ incluir la Prueba_Color_Plano, que lee el texto real de `pantalla.css` y de `tema.css` y falla si alguno de los dos archivos contiene un Degradado o un Resplandor_Difuminado de la lista cerrada de esta spec.
2. LA Prueba_Color_Plano DEBERÁ marcar como prohibidos cada uno de estos efectos y fallar si reaparece cualquiera de ellos: los `radial-gradient` del fondo del `body`; el `drop-shadow` de `.kl-logo`; el glow con desenfoque del `box-shadow` de `.kl-selector-boton[aria-current="step"]`; el `radial-gradient` y el glow del `box-shadow` de `.kl-insignia-medalla`; y el `linear-gradient` de `.kl-pluma`.
3. LA Prueba_Color_Plano DEBERÁ permitir la Sombra_Dura —`box-shadow` con radio de desenfoque cero— de modo que el relieve de los botones y las tarjetas no la haga fallar.
4. LA Prueba_Color_Plano DEBERÁ permitir, como excepciones documentadas que nombran su propiedad CSS y su selector exactos, el `drop-shadow` de `.kl-capa-estela-referencia` y de `.kl-capa-estela-jugador`, y el `text-shadow: 0 0 14px color-mix(in srgb, var(--aviso) 70%, transparent)` de `.kl-estrella[data-estado="otorgada"] .kl-estrella-icono`.

### Requisito 5: Menú de mundos desplegable

**Historia de usuario:** Como jugador, quiero ver todos los mundos y abrir cualquiera para ver sus
niveles, para poder pasar del mundo 0 al 1 cuando lo complete, en lugar de quedarme sin salida.

#### Criterios de aceptación

1. EL Menu_Mundos DEBERÁ presentar en la cabecera los seis mundos de concepto que declara Info_Mundos (mundos 0 a 5), cada uno como un desplegable con su número, su nombre y su Estado_Nivel resumido, leyendo el nombre y la insignia de cada mundo de Info_Mundos y sus niveles del Catalogo_Niveles (enmienda de 08·1, que describía una ruta de niveles de un solo mundo como estado actual).
2. CUANDO EL jugador abre el desplegable de un mundo, EL Menu_Mundos DEBERÁ presentar los niveles de ese mundo tomados del Catalogo_Niveles, cada uno con su identificador, su título y su Estado_Nivel —bloqueado, desbloqueado sin aprobar, aprobado, o completado con tres estrellas— comunicado por texto y forma además de por color.
3. DONDE un mundo de Info_Mundos no tiene ningún nivel en el Catalogo_Niveles, EL Menu_Mundos DEBERÁ presentar ese mundo como bloqueado y mostrar el texto «próximamente», sin ofrecer ningún nivel que elegir, de modo que cuando el Catalogo_Niveles incorpore los niveles de un mundo el Menu_Mundos los muestre sin cambiar el código del menú.
4. DONDE la insignia de concepto de un mundo se ha ganado, EL Menu_Mundos DEBERÁ mostrar la medalla de esa insignia en el encabezado del desplegable de ese mundo, con su nombre disponible por texto además de por la medalla.
5. EL Menu_Mundos DEBERÁ leer la disponibilidad de cada mundo y de cada nivel del Desbloqueo, sin cambiar la regla de desbloqueo de la spec 01 (Requisito 7): el mundo *n* se abre al aprobar con estrella de precisión todos los niveles del mundo *n-1*.

### Requisito 6: Cargar un nivel desde el menú

**Historia de usuario:** Como jugador, quiero elegir un nivel de cualquier mundo desbloqueado y empezar a
jugarlo, para moverme por el juego sin fricción.

#### Criterios de aceptación

1. CUANDO EL jugador elige un nivel desbloqueado de cualquier mundo en el Menu_Mundos, EL Juego DEBERÁ resolver el reto de ese nivel, presentar su figura de referencia, reiniciar el intento, y actualizar el Panel_Semilla y las pistas al nivel elegido, dejando el Juego jugable en ese nivel (conforme al cometido de 01·12.2, ahora extendido a niveles de cualquier mundo).
2. CUANDO EL jugador elige un nivel desbloqueado de cualquier mundo en el Menu_Mundos, EL Menu_Mundos DEBERÁ cerrarse además de cargar el nivel.
3. SI EL jugador intenta elegir un nivel bloqueado, ENTONCES EL Menu_Mundos NO DEBERÁ cargar ese nivel y DEBERÁ indicar por texto el motivo por el que está bloqueado.
4. SI un mundo tiene su mundo anterior sin completar, o no tiene niveles en el Catalogo_Niveles, ENTONCES EL Menu_Mundos DEBERÁ presentar ese mundo como bloqueado, impedir que se abra un nivel suyo, y decir el motivo por texto.
5. EL Menu_Mundos DEBERÁ tener en la cabecera un botón que lo abre y que muestra el mundo y el nivel en curso, de modo que con el menú cerrado el mundo y el nivel en curso se vean en ese botón.

### Requisito 7: Teclado, foco y encuadre del menú

**Historia de usuario:** Como jugador que usa teclado o lector de pantalla, quiero manejar el menú entero
sin ratón y sin que crezca la pantalla, porque la accesibilidad es parte del producto.

#### Criterios de aceptación

1. EL Menu_Mundos DEBERÁ ser una sola parada de Tab, con sus mundos y niveles recorribles con las flechas (patrón «roving tabindex»), de modo que desde cualquier elemento interactivo del Juego, 20 pulsaciones de Tab o menos devuelvan el foco al área de escritura del Editor (conforme a 00·28.1).
2. CUANDO EL foco está en el encabezado de un mundo, EL Menu_Mundos DEBERÁ abrir y cerrar ese mundo con Enter y con la barra espaciadora.
3. CUANDO EL jugador abre el desplegable de un mundo mientras otro está abierto, EL Menu_Mundos DEBERÁ cerrar el que estaba abierto, de modo que a lo sumo un mundo quede abierto a la vez (acordeón).
4. CUANDO EL jugador pulsa Escape con el Menu_Mundos abierto, EL Menu_Mundos DEBERÁ cerrarse y devolver el foco al elemento desde el que se abrió.
5. CUANDO EL jugador hace clic fuera del Menu_Mundos estando abierto, EL Menu_Mundos DEBERÁ cerrarse, sin que el clic fuera tenga que devolver el foco al botón de la cabecera.
6. EL Menu_Mundos DEBERÁ declarar un nombre accesible en español para cada mundo y para cada nivel que incluya su identificador y su Estado_Nivel, sin atrapar el foco.
7. CUANDO EL jugador abre el Menu_Mundos, EL Menu_Mundos DEBERÁ dejar abierto por defecto el desplegable del mundo del nivel en curso.
8. EL Menu_Mundos DEBERÁ abrirse como una capa superpuesta sobre el contenido, de modo que la cabecera no crezca ni empuje el resto de la Pantalla al abrir o cerrar un mundo.
9. MIENTRAS el área de contenido del navegador mide 1440 píxeles de ancho por 900 de alto, LA Pantalla con el Menu_Mundos DEBERÁ presentarse sin requerir ningún desplazamiento vertical ni horizontal (conforme a 08·1.5).

### Requisito 8: Contraste conservado

**Historia de usuario:** Como jugador, quiero que la pantalla de color plano siga siendo legible, para no
perder contraste a cambio de limpieza visual.

#### Criterios de aceptación

1. EL Juego DEBERÁ conservar sin cambios las fichas de color de la paleta Kiro del Tema, sin tocar ningún valor de color de la paleta al retirar los degradados y los resplandores.
2. LA Suite_Pruebas DEBERÁ mantener verde la prueba de contraste de la paleta Kiro (08·2.3): cada texto visible sobre su fondo a 4.5:1 o más, cada estela y cada trazo frente al fondo del Lienzo a 3:1 o más, y el indicador de foco a 3:1 frente a su fondo adyacente.

### Requisito 9: Nada más cambia

**Historia de usuario:** Como persona que mantiene KiroLogo, quiero que estos tres ajustes no toquen nada
fuera de su alcance, para que el resto de la pantalla y la suite anterior sigan intactos.

#### Criterios de aceptación

1. LA Suite_Pruebas DEBERÁ mantener verdes todas las pruebas de las specs 00, 01 y 08 que no cambien por estos tres ajustes, y `npm test`, `npm run typecheck` y `npm run build` DEBERÁN terminar con código de salida 0.
2. EL diseño de esta spec DEBERÁ listar cada prueba existente que se modifique por estos tres ajustes junto con su motivo, y NINGUNA de esas pruebas DEBERÁ quedar más débil que antes (ningún caso eliminado ni ninguna aserción relajada sin una prueba que la sustituya con igual o mayor cobertura).
3. EL Juego NO DEBERÁ cambiar las paletas, las tipografías, la distribución de columnas, ni el texto visible de ningún botón o control distinto de los cuatro Atajo_Movimiento, ni el significado, la aridad o los mensajes de error de ningún comando.
4. TODA prueba nueva DEBERÁ vivir en `src/main.test.ts` o junto a un módulo `.ts` del mismo nombre, de modo que la regla 21.3 de `main.test.ts` —cada `.test.ts` acompaña a su módulo homónimo, salvo las ayudas admitidas— siga cumpliéndose.

### Requisito 10: Registro en la bitácora

**Historia de usuario:** Como persona que mantiene KiroLogo, quiero que cada enmienda a un requisito
anterior quede registrada, para que la historia de las decisiones esté en el repositorio y no en la
memoria de nadie.

#### Criterios de aceptación

1. LA Bitacora DEBERÁ registrar la enmienda de 00·26.2 (el texto visible de un Atajo_Movimiento deja de ser el ejemplo con cantidad y pasa a ser el nombre, quedando el ejemplo en la descripción y en el nombre accesible) y de 00·26.4 (el Panel_Comandos inserta el campo de inserción, no el ejemplo).
2. LA Bitacora DEBERÁ registrar la enmienda de 01·12 (la navegación de niveles de un solo mundo pasa a un menú de los seis mundos desplegables).
3. LA Bitacora DEBERÁ registrar el reemplazo de los elementos de la spec 08 que describían la ruta de niveles como estado actual (08·1) y el panel de comandos (08·5.3 —el panel mostraba el ejemplo como texto visible permanente—, 08·5.5 y 08·5.7), indicando qué queda sustituido por esta spec.
4. LA Bitacora DEBERÁ registrar la decisión de color plano: la retirada de los degradados y de los resplandores difuminados enumerados como retirados —el halo del logo, los fondos del `body`, el glow del botón en curso, el degradado y glow de la medalla y el `linear-gradient` de la pluma— y la conservación explícita del resplandor de las estelas y del de la estrella otorgada como excepciones documentadas.
