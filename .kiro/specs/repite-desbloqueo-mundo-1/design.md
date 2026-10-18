# repite-desbloqueo-mundo-1 Bugfix Design

## Overview

El comando `REPITE` (mundo 1, concepto de iteración) aparece como no disponible aunque el jugador
esté en un nivel del mundo 1: el editor reporta `comandoBloqueado` para `REPITE`. La causa raíz ya
está verificada y vive en la interfaz, no en la cadena léxico → sintáctico ni en el vocabulario.

El editor (`src/ui/editor.ts`) y el panel de comandos (`src/ui/panel-comandos.ts`) reciben `mundo`
como dependencia **una sola vez al crearse** y lo fijan en su clausura. En `src/main.ts` ambos se
crean al arrancar con `mundo: reto.nivel.mundo` (la app suele arrancar en `0.1`, mundo 0).
`cambiarANivel` reasigna `reto` y llama a `montarReto`, pero `montarReto` nunca actualiza el `mundo`
del editor ni del panel. El editor analiza con `analizar(lexico.tokens, { mundo: deps.mundo })`,
siempre con el mundo del arranque; el panel construye sus botones con `comandosDelMundo(deps.mundo)`
una sola vez.

La estrategia del arreglo es **sincronizar el `mundo` del editor y del panel con el mundo del nivel
en curso al cambiar de nivel**. Es el arreglo mínimo que corrige la condición del bug
(`mundoDelEditor <> mundoDelNivelEnCurso`) sin tocar la cadena del intérprete ni el comportamiento de
las entradas que no la disparan. La UI sigue consumiendo del motor y del lenguaje
(`comandosDelMundo` de `vocabulario.ts`), nunca al revés.

## Glossary

- **Bug_Condition (C)**: El mundo con el que el editor analiza (`mundoDelEditor`) no coincide con el
  mundo del nivel que el jugador está jugando (`mundoDelNivelEnCurso`). Formalmente,
  `mundoDelEditor <> mundoDelNivelEnCurso`.
- **Property (P)**: Tras navegar a un nivel, el editor analiza con el mundo del nivel en curso y el
  panel muestra el vocabulario de ese mundo, de modo que todo comando con `comando.mundo <=
  mundoDelNivelEnCurso` esté disponible y no se reporte `comandoBloqueado` para él.
- **Preservation**: El análisis, el bloqueo de comandos de mundos posteriores, el conteo de
  instrucciones, la ejecución de la referencia y el reinicio de presupuesto/conteo/texto de
  `presentarReto` no cambian para las entradas que no disparan el bug.
- **Mundo**: Tipo `0 | 1 | 2 | 3 | 4 | 5` declarado en `src/lenguaje/vocabulario.ts`. Determina qué
  comandos están desbloqueados (`comandosDelMundo(mundo)` devuelve las entradas con `mundo <= n`).
- **crearEditor(deps)**: Crea el editor sobre un contenedor. Hoy lee `deps.mundo` en cada análisis
  (`analizarTexto` → `analizar(lexico.tokens, { mundo: deps.mundo })`). `deps.mundo` es fijo.
- **Editor.presentarReto(presupuestoEstrella)**: Se llama en cada cambio de nivel desde `montarReto`.
  Vacía el área, pone el presupuesto, reinicia el conteo y limpia marcas. Hoy NO toca el mundo.
- **crearPanelComandos(deps)**: Crea el panel. Construye los botones una sola vez con
  `comandosDelMundo(deps.mundo)` al crearse. No tiene ningún método que se llame al cambiar de nivel.
- **montarReto(opciones)**: En `src/main.ts`, prepara la pantalla del reto en curso. Llama a
  `editor.presentarReto(reto.presupuestoEstrella)` y a `panelSemilla.presentarReto(...)`, pero no
  sincroniza el mundo del editor ni del panel.
- **cambiarANivel(idNivel, semilla?)**: Reasigna `reto = r.reto` y llama a `montarReto`. Es el único
  camino por el que el mundo del nivel en curso puede cambiar tras el arranque.

## Bug Details

### Bug Condition

El bug se manifiesta cuando el jugador navega de un nivel de un mundo a un nivel de otro mundo: el
editor conserva el `mundo` con el que se creó y el panel conserva el vocabulario con el que se creó.
El editor analiza con un mundo que no es el del nivel en curso, así que un comando cuyo `mundo` es
menor o igual al mundo del nivel puede quedar tratado como comando de un mundo posterior y disparar
`comandoBloqueado`.

**Formal Specification:**
```
FUNCTION isBugCondition(X)
  INPUT: X = { mundoDelEditor, mundoDelNivelEnCurso, programa }
  OUTPUT: boolean

  // El bug se manifiesta cuando el mundo con el que el editor analiza
  // no es el mundo del nivel que el jugador está jugando.
  RETURN X.mundoDelEditor <> X.mundoDelNivelEnCurso
END FUNCTION
```

Instancia concreta del contraejemplo observado:
```
FUNCTION isBugCondition_REPITE_mundo1(X)
  INPUT: X = { mundoDelEditor: 0, mundoDelNivelEnCurso: 1,
               programa: "REPITE 6 [ AVANZA 120 GIRADERECHA 15 ]" }
  OUTPUT: boolean

  RETURN X.mundoDelEditor <> X.mundoDelNivelEnCurso   // 0 <> 1 = true
END FUNCTION
```

### Examples

- Arrancar en `0.1` (mundo 0) y navegar a `1.1` (mundo 1); escribir
  `REPITE 6 [ AVANZA 120 GIRADERECHA 15 ]`. Esperado: se analiza sin `comandoBloqueado` para
  `REPITE`. Actual: el editor analiza con mundo 0 y reporta `comandoBloqueado` para `REPITE`.
- Arrancar en `0.1` y navegar a `1.1`; abrir el panel de comandos. Esperado: el panel muestra el
  vocabulario del mundo 1 (incluido `REPITE`). Actual: el panel sigue mostrando el vocabulario del
  mundo 0.
- Arrancar en `1.1` (mundo 1) con `idNivel` forzado (como hacen las pruebas) y escribir `REPITE`.
  Esperado y actual: se analiza sin `comandoBloqueado` (el mundo del editor ya coincide: no es la
  condición del bug).
- Edge case: navegar de un nivel del mundo 1 a un nivel del mundo 0 y escribir `REPITE`. Esperado
  tras el arreglo: `comandoBloqueado` para `REPITE` nombrando el mundo 1 (el editor vuelve a analizar
  con mundo 0).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Cuando el mundo del editor ya coincide con el mundo del nivel en curso (arrancar directamente en un
  nivel, como hacen las pruebas con `idNivel` forzado), el análisis, el bloqueo de comandos de mundos
  posteriores y el conteo de instrucciones no cambian.
- El bloqueo de comandos de un mundo posterior al del nivel en curso se sigue reportando con
  `comandoBloqueado` nombrando el mundo correspondiente (p. ej. `SUBELAPIZ` del mundo 2 en un nivel
  del mundo 1).
- La ejecución del programa de referencia sigue usando `comandosDelMundo(nivel.mundo)` para los
  comandos permitidos, sin cambios (`reto.ts` y la ejecución en `main.ts`).
- `Editor.presentarReto` sigue reiniciando presupuesto, conteo y texto exactamente como hoy; su
  firma y comportamiento actuales no cambian para los llamadores existentes.
- El conteo de instrucciones de un programa válido con los comandos del mundo del nivel se calcula
  igual que antes.

**Scope:**
Todas las entradas que NO disparan el bug (es decir, `mundoDelEditor = mundoDelNivelEnCurso`) quedan
completamente inalteradas. Esto incluye:
- Arrancar directamente en un nivel sin navegar entre mundos distintos.
- Volver a escribir, reiniciar o pedir otro reto del mismo nivel (mismo mundo).
- La ejecución de la referencia y el cálculo del presupuesto de estrella.

El comportamiento correcto que SÍ cambia (que el editor y el panel reflejen el mundo del nivel en
curso tras navegar) está en la sección Correctness Properties, Propiedad 1.

## Hypothesized Root Cause

La causa raíz está verificada en el código; se mantiene el análisis para trazabilidad:

1. **Clausura de `mundo` en el editor**: `crearEditor` fija `deps.mundo` al crearse. `analizarTexto`
   lee siempre ese valor (`analizar(lexico.tokens, { mundo: deps.mundo })`). No hay forma de
   actualizarlo tras la creación.

2. **Botones estáticos en el panel**: `crearPanelComandos` construye los botones una sola vez con
   `comandosDelMundo(deps.mundo)` al crearse. No existe ningún método que se invoque al cambiar de
   nivel para reconstruirlos.

3. **`montarReto` no sincroniza el mundo**: reasigna `reto` en `cambiarANivel` y refresca presupuesto
   (`editor.presentarReto`), semilla, globo y menú, pero nunca actualiza el mundo del editor ni del
   panel. El único hook por nivel que toca al editor (`presentarReto`) solo lleva el presupuesto.

4. **Arranque en mundo 0**: la app suele arrancar en `0.1` (mundo 0), así que el valor fijado es 0 y
   queda desfasado en cuanto el jugador navega a cualquier otro mundo.

## Correctness Properties

Property 1: Bug Condition - El editor y el panel reflejan el mundo del nivel en curso

_For any_ input donde la condición del bug se cumple (`isBugCondition` devuelve true, es decir
`mundoDelEditor <> mundoDelNivelEnCurso`), tras navegar al nivel el editor arreglado SHALL analizar
el texto con el mundo del nivel en curso —de modo que no se reporte `comandoBloqueado` para ningún
comando con `comando.mundo <= mundoDelNivelEnCurso` (en particular `REPITE` en el mundo 1)— y el
panel de comandos SHALL presentar el vocabulario correspondiente a ese mundo (`comandosDelMundo` del
mundo del nivel en curso).

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Entradas que no disparan el bug quedan inalteradas

_For any_ input donde la condición del bug NO se cumple (`isBugCondition` devuelve false, es decir
`mundoDelEditor = mundoDelNivelEnCurso`), el código arreglado SHALL producir el mismo resultado que
el código original, preservando el análisis, el bloqueo de comandos de mundos posteriores, el conteo
de instrucciones, la ejecución de la referencia con `comandosDelMundo(nivel.mundo)` y el reinicio de
presupuesto/conteo/texto de `presentarReto`.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Suponiendo que el análisis de causa raíz es correcto (lo está, verificado), el arreglo sincroniza el
mundo del editor y del panel al cambiar de nivel.

#### Decisión de diseño: método dedicado `fijarMundo` frente a extender `presentarReto`

Se evaluaron las dos opciones contra la realidad del código:

- **Extender `presentarReto`** (que el método que ya se llama por nivel reciba también el mundo, p.
  ej. `presentarReto(presupuestoEstrella, mundo)`): aprovecha un hook existente del editor. Pero
  tiene tres inconvenientes. (1) No sirve para el panel: el panel no tiene ningún `presentarReto` ni
  método por nivel, así que de todos modos necesita un método nuevo; la simetría editor/panel se
  pierde. (2) Mezcla responsabilidades: hoy `presentarReto` reinicia presupuesto, conteo, texto y
  marcas —estado del *intento*—, mientras que el mundo es la *configuración del análisis*, un eje
  distinto que no se reinicia, se fija. (3) Cambia la firma de un método con llamadores y pruebas
  existentes, chocando con la preservación 3.5 (que `presentarReto` siga igual).

- **Método dedicado `fijarMundo(mundo)`** en el editor y en el panel: como el panel necesita un
  método nuevo sí o sí, un método dedicado y simétrico en ambos es la opción más limpia. Deja
  `presentarReto` intacto (preservación 3.5), separa «configurar el mundo del análisis» de
  «reiniciar el intento», y hace el cambio en `main.ts` explícito y legible: `montarReto` llama a
  `editor.fijarMundo(reto.nivel.mundo)` y `panel.fijarMundo(reto.nivel.mundo)` junto al resto de la
  preparación por nivel.

**Elección: método dedicado `fijarMundo(mundo: Mundo)` en el editor y en el panel.** Es el arreglo
mínimo que corrige la condición del bug, preserva las firmas existentes y mantiene simetría entre las
dos piezas que comparten el defecto.

#### Archivo: `src/ui/editor.ts`

- **Mundo mutable**: convertir el `mundo` fijado en la clausura en una variable mutable interna
  (`let mundoActual = deps.mundo;`), análoga a cómo `presupuesto` ya es `let presupuesto =
  deps.presupuestoEstrella;`.
- **Leer el mundo mutable al analizar**: `analizarTexto` pasa a usar
  `analizar(lexico.tokens, { mundo: mundoActual })` en lugar de `deps.mundo`.
- **Método público `fijarMundo(mundo: Mundo)`**: en la interfaz `Editor` y en el objeto devuelto;
  asigna `mundoActual = mundo` y reanaliza el texto en curso (`analizarTexto()`), de modo que las
  marcas y el contador reflejen el mundo nuevo sin depender del próximo tecleo.
- **No tocar `presentarReto`**: su firma y su comportamiento (presupuesto, conteo, texto, marcas) no
  cambian.

#### Archivo: `src/ui/panel-comandos.ts`

- **Mundo mutable y reconstrucción**: extraer la construcción de los botones a una función interna
  que lea el mundo actual (`comandosDelMundo(mundoActual)`), borre el contenido de `raiz` y lo
  reconstruya (botones, ayuda, roving tabindex y escuchas). El panel seguirá exponiendo `botones` y
  `entradas`, que pasan a reflejar el mundo vigente.
- **Método público `fijarMundo(mundo: Mundo)`**: en la interfaz `PanelComandos` y en el objeto
  devuelto; si el mundo no cambió, no hace nada; si cambió, reconstruye los botones del nuevo
  vocabulario. No llama al motor: solo a `comandosDelMundo` del lenguaje, respetando la dirección de
  dependencias.

#### Archivo: `src/main.ts`

- **Sincronizar en `montarReto`**: añadir `editor.fijarMundo(reto.nivel.mundo)` y
  `panel.fijarMundo(reto.nivel.mundo)` dentro de `montarReto`, junto a `editor.presentarReto(...)`.
  Como `montarReto` se ejecuta tanto en el arranque como en cada `cambiarANivel`, el mundo queda
  sincronizado siempre, incluido el primer montaje (donde es un no-op porque ya coincide).
- **Usar la referencia `panel`**: `panel` ya existe (`const panel = crearPanelComandos(...)`) pero
  hoy se descarta con `void panel`. Se retira ese descarte y se usa la referencia en `montarReto`.
- **Sin literales de error nuevos**: el arreglo no introduce mensajes; `comandoBloqueado` y los demás
  siguen viniendo de `src/lenguaje/errores.ts`. No hay cambios en `errores.ts`.

Ningún cambio toca la cadena léxico → sintáctico, `vocabulario.ts`, `conteo.ts` ni la ejecución de la
referencia: `vocabulario.ts` sigue siendo la única fuente de verdad de los comandos y `conteo.ts` la
del presupuesto.

## Testing Strategy

### Validation Approach

La estrategia es en dos fases: primero, provocar contraejemplos que demuestren el bug sobre el código
sin arreglar; después, verificar que el arreglo funciona y que el comportamiento de las entradas que
no disparan el bug queda inalterado. Las pruebas van junto a su módulo con Vitest (`editor.test.ts`,
`panel-comandos.test.ts`, `main.test.ts`), en jsdom, con TypeScript estricto.

### Exploratory Bug Condition Checking

**Goal**: Provocar contraejemplos que demuestren el bug ANTES del arreglo y confirmar la causa raíz.
Si se refuta, habría que re-hipotetizar.

**Test Plan**: Crear la aplicación en jsdom arrancando en un nivel del mundo 0, navegar con
`irANivel` a un nivel del mundo 1, escribir en el editor un programa con `REPITE` y comprobar
`editor.estadoContador().errores`. Correr sobre el código SIN arreglar para observar el fallo.

**Test Cases**:
1. **Navegar 0 → 1 y escribir REPITE**: arrancar en `0.1`, `irANivel('1.1')`, poner
   `REPITE 6 [ AVANZA 120 GIRADERECHA 15 ]`; esperado tras arreglo: sin `comandoBloqueado` (fallará
   sobre el código sin arreglar).
2. **Panel tras navegar 0 → 1**: arrancar en `0.1`, `irANivel('1.1')`; el panel debe listar `REPITE`
   entre sus `entradas` (fallará sobre el código sin arreglar).
3. **Editor directo en mundo 1**: `crearEditor({ mundo: 1, ... })`, escribir `REPITE`; no debe
   reportar `comandoBloqueado` (ya pasa; ancla la condición ¬C).
4. **Edge case 1 → 0**: navegar de mundo 1 a mundo 0 y escribir `REPITE`; esperado tras arreglo:
   `comandoBloqueado` nombrando el mundo 1.

**Expected Counterexamples**:
- El editor reporta `comandoBloqueado` para `REPITE` tras navegar al mundo 1.
- El panel no incluye `REPITE` entre sus comandos tras navegar al mundo 1.
- Causa: el editor y el panel conservan el `mundo` del arranque (0) en su clausura.

### Fix Checking

**Goal**: Verificar que para toda entrada donde la condición del bug se cumple, la función arreglada
produce el comportamiento esperado.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  resultado := analizarTrasNavegar_arreglado(X.mundoDelNivelEnCurso, X.programa)
  ASSERT resultado.mundoUsadoAlAnalizar = X.mundoDelNivelEnCurso
  ASSERT NOT reportoComandoBloqueado(resultado, comando)
         FOR TODO comando CON comando.mundo <= X.mundoDelNivelEnCurso
END FOR
```

Cubre la Propiedad 1 y los requisitos 2.1, 2.2, 2.3.

### Preservation Checking

**Goal**: Verificar que para toda entrada donde la condición del bug NO se cumple, la función
arreglada produce el mismo resultado que la original.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

**Testing Approach**: Las pruebas basadas en propiedades son útiles aquí porque generan muchos casos
sobre el dominio de mundos (0..5) y comandos del vocabulario, y atrapan casos límite. El dominio es
pequeño y cerrado (6 mundos, vocabulario fijo), así que una combinación de ejemplos y generación
acotada da garantías fuertes. El azar que haga falta pasa por `azar/prng.ts`, nunca `Math.random`.

**Test Plan**: Observar el comportamiento sobre el código SIN arreglar para `mundoDelEditor =
mundoDelNivelEnCurso` (crear el editor y el panel directamente en el mundo del nivel, como hacen las
pruebas con `idNivel` forzado) y escribir pruebas que fijen ese comportamiento tras el arreglo.

**Test Cases**:
1. **Análisis en el mismo mundo inalterado**: con el editor creado en el mundo `m`, un programa
   válido del mundo `m` se analiza sin errores y con el mismo conteo que antes, para `m` en 0..5.
2. **Bloqueo de mundo posterior inalterado**: en el mundo 1, `SUBELAPIZ` (mundo 2) sigue reportando
   `comandoBloqueado` nombrando el mundo 2.
3. **`presentarReto` inalterado**: su firma y su efecto (vaciar texto, fijar presupuesto, reiniciar
   conteo, limpiar marcas) no cambian; las pruebas existentes de `editor.test.ts` siguen en verde.
4. **Referencia inalterada**: la ejecución del programa de referencia sigue usando
   `comandosDelMundo(nivel.mundo)`; la regresión del catálogo (cada reto aprueba su nivel con tres
   estrellas) sigue en verde.
5. **`fijarMundo` idempotente**: `fijarMundo(m)` con el mundo ya vigente deja el análisis, el conteo
   y el panel sin cambios.

### Unit Tests

- `editor.test.ts`: `fijarMundo` cambia el mundo del análisis (REPITE disponible tras `fijarMundo(1)`,
  bloqueado tras `fijarMundo(0)`); reanaliza el texto en curso; no altera presupuesto ni texto.
- `panel-comandos.test.ts`: `fijarMundo` reconstruye los botones con `comandosDelMundo` del nuevo
  mundo; `entradas` y `botones` reflejan el mundo vigente; `fijarMundo` con el mismo mundo es no-op;
  el roving tabindex y las escuchas siguen funcionando tras la reconstrucción.
- Casos límite: mundo fuera de secuencia (0 → 5 → 0), panel vacío imposible (siempre hay comandos del
  mundo 0).

### Property-Based Tests

- Para todo par de mundos `(inicial, destino)` en 0..5, tras `fijarMundo(destino)` el editor no
  reporta `comandoBloqueado` para ningún comando con `mundo <= destino` y el panel lista exactamente
  `comandosDelMundo(destino)`.
- Para todo mundo `m`, con el editor creado en `m` (¬C), el análisis y el conteo de un programa
  válido de `m` coinciden con el comportamiento previo (preservación).

### Integration Tests

- `main.test.ts`: flujo completo en jsdom: arrancar en `0.1`, `irANivel('1.1')`, escribir un programa
  con `REPITE`, ejecutar y comprobar que no hay `comandoBloqueado` y que el panel muestra `REPITE`.
- Navegación entre varios mundos (0 → 1 → 2 → 1) comprobando que editor y panel siguen el mundo del
  nivel en curso en cada salto.
- Que `presentarReto` siga reiniciando el intento (presupuesto, conteo, texto) en cada cambio de
  nivel, sin regresiones en el resto del montaje (globo, semilla, menú).
