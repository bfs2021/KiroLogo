# Prompt · Spec 09 · Ajustes de interfaz

> Pegar el texto de abajo al iniciar la spec.

---

Quiero crear la spec **09-ajustes-de-interfaz** de KiroLogo. Las specs 00 y 01 están terminadas, y la
08 (diseño visual) documenta la pantalla tal como está hoy, con una sola paleta, la de Kiro.

## Objetivo

Tres ajustes de experiencia de usuario sobre la pantalla actual, y nada más. Todo lo demás se queda como
está.

- Que el jugador escriba los números: los atajos de movimiento no traen cantidades puestas.
- Colores planos: sin degradados ni resplandores difusos.
- Que los niveles se elijan en un menú desplegable por mundo.

## Alcance

**1. Atajos de movimiento sin números**

Hoy los botones del panel de comandos muestran e insertan un ejemplo con cantidad: `AVANZA 100`,
`RETROCEDE 50`, `GIRADERECHA 90` y `GIRAIZQUIERDA 45`. Eso le da hecha al jugador la parte que tiene que
pensar.

- Esos cuatro botones muestran e insertan **solo el nombre del comando**. Al insertar queda un espacio
  detrás y el cursor al final, listo para escribir la cantidad.
- `CENTRO` y `BORRAPANTALLA` no llevan número: quedan como están.
- Regla para los mundos siguientes: un atajo nunca predice una cantidad que le toca decidir al jugador.
- `vocabulario.ts` sigue siendo la única fuente de verdad de los comandos: lo que inserta el botón sale de
  ahí, no de una lista aparte.
- Un programa con el comando sin cantidad ya produce un error del catálogo; hay que comprobar que dice
  qué falta.

**2. Colores planos**

Quitar el halo difuminado del logo y los degradados, de modo que todo sea color sólido. Lo que hay hoy en
`pantalla.css`:

- `body`: dos resplandores de color de fondo y una cuadrícula de puntos hecha con un degradado radial.
- `.kl-logo`: halo difuminado alrededor del logo.
- `.kl-selector-boton[aria-current]`: resplandor en el botón del nivel en curso.
- `.kl-insignia-medalla`: degradado radial dorado y resplandor.
- `.kl-capa-estela-referencia` y `.kl-capa-estela-jugador`: resplandor sobre las estelas del lienzo.
- `.kl-estrella-icono` de una estrella otorgada: resplandor del icono.
- `.kl-pluma`: degradado de una pieza que ya se quitó del HTML. Es CSS sin uso.

Los botones llevan color sólido. Se conserva el relieve de sombra dura (sin desenfoque), los colores de
la paleta Kiro y el contraste.

**3. Menú de mundos desplegable**

Hoy la cabecera muestra los cinco niveles del mundo en curso como una fila de botones, con la etiqueta del
mundo y la medalla. No hay forma de ir a otro mundo: es la razón por la que, al terminar el mundo 0, no
se llega al 1.

Se sustituye por un menú donde **cada mundo es un desplegable** que, al abrirse, muestra sus niveles.

- Un desplegable por cada uno de los seis mundos de concepto de `niveles/mundos.ts`, con su número, su
  nombre y su estado. La insignia del mundo aparece en su encabezado cuando se ha ganado.
- Dentro de cada mundo, sus niveles con identificador, título y estado: bloqueado, desbloqueado sin
  aprobar, aprobado o con tres estrellas. Por texto y forma además de por color.
- Elegir un nivel desbloqueado, de **cualquier** mundo, carga ese nivel: resuelve el reto, reinicia el
  intento y actualiza semilla y pistas. Un nivel bloqueado no se puede elegir y dice por qué.
- Los mundos se desbloquean con la regla de siempre (spec 01, requisito 7). Esta spec no la cambia.
- El mundo y el nivel en curso se ven siempre, aunque el menú esté cerrado.
- No agranda la cabecera ni empuja el resto de la pantalla.

## Fuera de alcance

- Cambiar paletas, tipografías, distribución de columnas o el texto de cualquier otro botón o control.
- El selector de paletas y la paleta Océano: se retiran en un trabajo aparte (spec 08, decisión D11) y no
  entran en esta spec.
- Cambiar lo que significa un comando, su aridad o sus errores: solo cambia lo que el botón muestra e
  inserta.
- Agregar mundos, niveles o reglas de desbloqueo nuevas.
- Rediseñar el panel de semilla, el marcador de estrellas, la comparación o el globo de Kiro.

## Criterios de aceptación

1. Pulsar `AVANZA`, `RETROCEDE`, `GIRADERECHA` o `GIRAIZQUIERDA` inserta solo el nombre y un espacio en la
   posición del cursor, con el cursor justo detrás.
2. Ningún botón del panel muestra un número como texto visible. Una prueba lo comprueba sobre los seis
   botones del mundo 0.
3. Un jugador que pulsa el atajo y escribe `100` obtiene lo mismo que antes: las tres estrellas en el 0.1
   con `AVANZA 100`.
4. Ejecutar con el comando sin cantidad muestra el mensaje del catálogo que dice qué falta, y no mueve la
   tortuga.
5. Los atajos siguen siendo una sola parada de Tab y se recorren con las flechas.
6. En `pantalla.css` y `tema.css` no queda ningún degradado ni ningún resplandor difuminado de los de la
   lista. Una prueba estructural lee los dos archivos y falla si vuelven.
7. El logo se ve sin halo, el fondo de la página es de color sólido y los botones son de color sólido.
8. El contraste WCAG de la paleta Kiro sigue cumpliéndose, sin tocar sus colores.
9. El menú muestra los seis mundos, cada uno desplegable, y al abrir uno se ven sus niveles con su estado.
10. Elegir un nivel desbloqueado de otro mundo lo carga y deja el juego jugable en él.
11. Un mundo cuyo anterior no está completo aparece bloqueado, no se puede abrir un nivel suyo, y se dice
    por texto.
12. El mundo y el nivel en curso se ven con el menú cerrado.
13. El menú se maneja entero con teclado: Enter y barra espaciadora abren y cierran un mundo; Escape cierra
    el menú y devuelve el foco al botón que lo abrió; desde cualquier elemento interactivo, 20 Tab o
    menos devuelven el foco al editor. Cada mundo y cada nivel tienen un nombre accesible en español con su
    estado.
14. La pantalla sigue cabiendo sin desplazarse en 1440×900, la cabecera no crece y abrir el menú no mueve
    el resto.
15. Nada más cambia. La suite anterior pasa. Las pruebas que se modifican por estos tres ajustes quedan
    listadas en la spec con su motivo, y ninguna se debilita.
16. La bitácora registra cada decisión que enmienda un requisito anterior: el 26.2 y el 26.4 de la spec
    00, el 12 de la spec 01 y, de la spec 08, los requisitos que describen el panel de comandos (5.3, 5.5
    y 5.7) y la ruta de niveles como estado actual (1).
17. Las pruebas nuevas viven en `src/main.test.ts` o junto a un módulo `.ts` del mismo nombre: la regla
    21.3 de `main.test.ts` falla si un `.test.ts` no tiene su módulo.

## Steering a consultar

`producto` para el tono y la idea del juego. `niveles-y-progresion` para los mundos, los niveles y el
desbloqueo. `lenguaje-kirologo` para el vocabulario. `estructura` para dónde va cada módulo.

## Decisiones a cerrar en la fase de requisitos

- **De dónde sale lo que inserta el botón.** El campo `ejemplo` del vocabulario lleva la cantidad, y
  alimenta la descripción y el nombre accesible. Opciones: añadir un campo aparte para lo que se inserta,
  o cambiar `ejemplo`. Hay que cuidar que el requisito 26.2 (texto visible con el ejemplo) y el 26.4
  (insertar el ejemplo) se enmienden de forma explícita.
- **La guía del nivel 0.1.** Hoy dice «escribe `AVANZA 100` y pulsa Ejecutar». No es un botón, pero enseña
  justo lo que esta spec quita de los atajos. Decidir si cambia.
- **Qué cuenta como difuminado.** Es lo más ambiguo de la spec. Recomendación: quitar el halo del logo,
  los dos resplandores y la cuadrícula de puntos del fondo, el resplandor del botón en curso, la medalla
  (dorada, sólida) y el CSS sin uso. Falta decidir sobre el resplandor de las estelas del lienzo y el de
  la estrella otorgada: son difuminado, pero no del logo ni de un botón.
- **Forma del menú.** Un desplegable en la cabecera que se abre sobre el contenido, o una columna
  aparte. Condicionante: no puede agrandar la cabecera. Y si se abre un solo mundo a la vez (acordeón) o
  varios.
- **Estado por defecto.** Qué mundo aparece abierto al entrar: recomendación, el del nivel en curso.
- **Mundos sin niveles todavía.** Hoy el catálogo solo tiene el mundo 0. Opciones: mostrar los seis, los
  que no tienen niveles como bloqueados con un texto como «próximamente», o mostrar solo los que existen.
  La primera obliga a cambiar el menú en cada spec de mundo; la segunda no.
- **Foco.** Una sola parada de Tab para todo el menú con flechas, o una por mundo. El límite de 20 Tab
  sale de la spec 00 (28.1).
- **Dónde va la medalla de la insignia** una vez que desaparece la fila de niveles.
