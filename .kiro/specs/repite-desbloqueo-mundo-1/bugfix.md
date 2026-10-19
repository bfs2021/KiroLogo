# Documento de Requisitos del Arreglo

## Introducción

En el flujo de juego de KiroLogo, el comando `REPITE` (vocabulario del mundo 1, concepto de
iteración) aparece como **no disponible** aunque el jugador esté jugando un nivel del mundo 1. Al
escribir un programa como `REPITE 6 [ AVANZA 120 GIRADERECHA 15 ]` en el editor, se muestra el error
del catálogo `comandoBloqueado`: *"REPITE todavía no está disponible. Se desbloquea en el mundo 1."*
El mensaje es contradictorio con la situación: el nivel pertenece al mundo 1 y el comando debería
estar disponible en ese mundo.

El bug afecta a **todo el mundo 1**, incluido el nivel autorado 1.1 "El cuadrado", cuyo propósito
pedagógico es justamente introducir `REPITE`. Mientras exista, el mundo 1 completo es injugable: el
concepto que enseña no se puede escribir.

### Causa raíz (verificada en el código)

La cadena léxico → sintáctico es correcta: el parser desbloquea un comando cuando
`entrada.mundo <= estado.mundo` (la comparación `entrada.mundo > estado.mundo` marca el bloqueo), y
las pruebas confirman que `analizar(tokens, { mundo: 1 })` acepta `REPITE` sin errores. El vocabulario
también es correcto: `REPITE` declara `mundo: 1`.

El defecto está en la **interfaz**, en el ciclo de vida del editor:

- El editor (`src/ui/editor.ts`) y el panel de comandos (`src/ui/panel-comandos.ts`) reciben `mundo`
  como dependencia **una sola vez al crearse** y lo capturan en su clausura. El editor lo lee en cada
  análisis (`analizar(lexico.tokens, { mundo: deps.mundo })`), pero `deps.mundo` es un valor fijo.
- En `src/main.ts`, el editor se crea al arrancar con `mundo: reto.nivel.mundo`. La aplicación suele
  arrancar en el nivel `0.1` (mundo 0).
- Al navegar a otro nivel, `cambiarANivel` reasigna `reto = r.reto` y llama a `montarReto`, pero
  **nunca actualiza el `mundo` del editor ni del panel**. El editor expone `presentarReto(presupuesto)`
  para refrescar el presupuesto al cambiar de nivel, pero no hay un camino equivalente para el mundo.

Resultado: tras arrancar en el mundo 0 y navegar al mundo 1, el editor sigue analizando con `mundo: 0`,
así que el parser trata `REPITE` (mundo 1) como comando de un mundo posterior y emite `comandoBloqueado`.

## Análisis del Bug

### Comportamiento Actual (Defecto)

1.1 WHEN el jugador arranca en un nivel del mundo 0 y luego navega a un nivel del mundo 1 (por ejemplo 1.1 o 1.2) y escribe un programa que usa `REPITE` THEN el editor analiza el texto con el mundo del nivel inicial (0) en lugar del mundo del nivel en curso (1) y reporta el error `comandoBloqueado` para `REPITE`

1.2 WHEN el jugador navega entre niveles de distintos mundos THEN el editor conserva el `mundo` con el que se creó y no refleja el mundo del nivel en curso al analizar

1.3 WHEN el jugador navega entre niveles de distintos mundos THEN el panel de comandos conserva el `mundo` con el que se creó y sigue mostrando el vocabulario del mundo inicial en lugar del vocabulario del mundo del nivel en curso

### Comportamiento Esperado (Correcto)

2.1 WHEN el jugador está en un nivel del mundo 1 y escribe un programa que usa `REPITE` THEN el editor SHALL analizar el texto con el mundo del nivel en curso (1) y NO reportar `comandoBloqueado` para `REPITE`

2.2 WHEN el jugador navega a un nivel de cualquier mundo THEN el editor SHALL analizar el texto subsiguiente con el mundo del nivel en curso, de modo que un comando cuyo `mundo` es menor o igual al mundo del nivel esté disponible

2.3 WHEN el jugador navega a un nivel de cualquier mundo THEN el panel de comandos SHALL mostrar el vocabulario correspondiente al mundo del nivel en curso

### Comportamiento Inalterado (Prevención de Regresiones)

3.1 WHEN el jugador está en un nivel del mundo 0 y escribe un programa que usa `REPITE` THEN el sistema SHALL CONTINUE TO reportar `comandoBloqueado` para `REPITE` nombrando el mundo 1

3.2 WHEN el jugador está en un nivel del mundo 1 y escribe un comando de un mundo posterior (por ejemplo `SUBELAPIZ`, del mundo 2) THEN el sistema SHALL CONTINUE TO reportar `comandoBloqueado` nombrando el mundo correspondiente

3.3 WHEN el jugador escribe un programa válido con los comandos del mundo del nivel en curso THEN el sistema SHALL CONTINUE TO analizarlo sin errores y calcular su conteo de instrucciones igual que antes

3.4 WHEN se resuelve un reto y se ejecuta su programa de referencia THEN el sistema SHALL CONTINUE TO usar el mundo del nivel (`comandosDelMundo(nivel.mundo)`) para los comandos permitidos, sin cambios respecto al comportamiento actual

3.5 WHEN el jugador cambia de nivel THEN el editor SHALL CONTINUE TO restablecer el presupuesto, el conteo y el texto como lo hace hoy mediante `presentarReto`

## Condición del Bug y Propiedades

### Función de Condición del Bug

```pascal
FUNCTION isBugCondition(X)
  INPUT: X = { mundoDelEditor, mundoDelNivelEnCurso, programa }
  OUTPUT: boolean

  // El bug se manifiesta cuando el mundo con el que el editor analiza
  // no es el mundo del nivel que el jugador está jugando.
  RETURN X.mundoDelEditor <> X.mundoDelNivelEnCurso
END FUNCTION
```

Instancia concreta (contraejemplo observado):

```pascal
FUNCTION isBugCondition_REPITE_mundo1(X)
  INPUT: X = { mundoDelEditor: 0, mundoDelNivelEnCurso: 1, programa: "REPITE 6 [ AVANZA 120 GIRADERECHA 15 ]" }
  OUTPUT: boolean

  RETURN X.mundoDelEditor <> X.mundoDelNivelEnCurso   // 0 <> 1 = true
END FUNCTION
```

### Especificación de la Propiedad (Fix Checking)

```pascal
// Propiedad: al cambiar de nivel, el editor analiza con el mundo del nivel en curso.
FOR ALL X WHERE isBugCondition(X) DO
  // F' = comportamiento tras el arreglo: navegar al nivel sincroniza el mundo del editor.
  resultado ← analizarTrasNavegar'(X.mundoDelNivelEnCurso, X.programa)
  ASSERT resultado.mundoUsadoAlAnalizar = X.mundoDelNivelEnCurso
  ASSERT NOT reportoComandoBloqueado(resultado, comando) FOR TODO comando CON comando.mundo <= X.mundoDelNivelEnCurso
END FOR
```

Caso específico del contraejemplo:

```pascal
// Fix Checking — REPITE disponible en el mundo 1
FOR ALL X WHERE isBugCondition(X) AND X.mundoDelNivelEnCurso = 1 DO
  resultado ← analizarTrasNavegar'(1, "REPITE 6 [ AVANZA 120 GIRADERECHA 15 ]")
  ASSERT NOT contieneError(resultado, 'comandoBloqueado')
END FOR
```

### Objetivo de Preservación (Preservation Checking)

```pascal
// Propiedad: para entradas que NO disparan el bug, F' se comporta igual que F.
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

Es decir, cuando el mundo del editor ya coincide con el mundo del nivel en curso (lo que ya ocurre al
arrancar directamente en un nivel, como hacen las pruebas con `idNivel` forzado), el análisis, el
bloqueo de comandos de mundos posteriores, el conteo de instrucciones y la ejecución de la referencia
no cambian.

- **F**: el código actual, donde el editor y el panel capturan el `mundo` al crearse y no se
  actualizan al navegar.
- **F'**: el código arreglado, donde navegar a un nivel sincroniza el `mundo` del editor y del panel
  con el mundo del nivel en curso.
