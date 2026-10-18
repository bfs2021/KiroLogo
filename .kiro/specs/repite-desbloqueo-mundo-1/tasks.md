# Plan de Implementación

- [ ] 1. Escribir la prueba de exploración de la condición del bug (antes del arreglo)
  - **Property 1: Bug Condition** - El editor y el panel reflejan el mundo del nivel en curso
  - **CRÍTICO**: Esta prueba DEBE FALLAR sobre el código sin arreglar; el fallo confirma que el bug existe
  - **NO intentes arreglar la prueba ni el código cuando falle**: su fallo es el resultado correcto en esta fase
  - **NOTA**: Esta prueba codifica el comportamiento esperado; validará el arreglo cuando pase tras implementarlo (ver tarea 3.2)
  - **OBJETIVO**: Provocar contraejemplos que demuestren el bug (`isBugCondition(X)` con `mundoDelEditor <> mundoDelNivelEnCurso`)
  - **Enfoque PBT acotado**: el bug es determinista; anclar la propiedad al contraejemplo concreto y a los pares de mundos reproducibles `(inicial, destino)` en 0..5 con `inicial <> destino`. El azar que haga falta pasa por `azar/prng.ts`, nunca `Math.random`
  - En `src/main.test.ts` (jsdom): arrancar la app en `0.1` (mundo 0), navegar con `irANivel('1.1')` (mundo 1), escribir en el editor `REPITE 6 [ AVANZA 120 GIRADERECHA 15 ]` y leer `editor.estadoContador().errores`
  - Las aserciones deben encajar con el comportamiento esperado del diseño: NO debe haber error `comandoBloqueado` para `REPITE`, y el panel debe listar `REPITE` entre sus `entradas` tras navegar al mundo 1
  - Incluir el caso límite 1 → 0: tras navegar de mundo 1 a mundo 0, escribir `REPITE` SÍ debe reportar `comandoBloqueado` nombrando el mundo 1
  - Correr la prueba sobre el código SIN arreglar con `npm test -- --maxWorkers=2`
  - **RESULTADO ESPERADO**: la prueba FALLA (correcto: prueba que el bug existe)
  - Documentar los contraejemplos observados (p. ej. «tras `irANivel('1.1')`, `estadoContador().errores` contiene `comandoBloqueado` para `REPITE`»; «el panel no incluye `REPITE` en `entradas`»)
  - Marcar la tarea completa cuando la prueba esté escrita, ejecutada y su fallo documentado
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 2. Escribir las pruebas de preservación (antes de implementar el arreglo)
  - **Property 2: Preservation** - Entradas que no disparan el bug quedan inalteradas
  - **IMPORTANTE**: Seguir la metodología de observación primero. Observar el comportamiento sobre el código SIN arreglar para `mundoDelEditor = mundoDelNivelEnCurso` (crear el editor y el panel directamente en el mundo del nivel, como hacen las pruebas con `idNivel`/`mundo` forzado)
  - **Enfoque basado en propiedades**: el dominio es pequeño y cerrado (mundos 0..5, vocabulario fijo). Para todo mundo `m` en 0..5, con el editor y el panel creados en `m` (¬C), capturar el patrón observado. El azar que haga falta pasa por `azar/prng.ts`, nunca `Math.random`
  - En `src/ui/editor.test.ts`: observar y fijar que, con el editor creado en el mundo `m`, un programa válido del mundo `m` se analiza sin errores y con el mismo conteo que antes; que en el mundo 1 `SUBELAPIZ` (mundo 2) sigue reportando `comandoBloqueado` nombrando el mundo 2; y que `presentarReto` sigue vaciando texto, fijando presupuesto, reiniciando conteo y limpiando marcas (las pruebas existentes de `presentarReto` siguen en verde)
  - En `src/ui/panel-comandos.test.ts`: observar y fijar que el panel creado en el mundo `m` lista exactamente `comandosDelMundo(m)` en orden (la Property 23 existente sigue en verde)
  - En `src/main.test.ts`: observar y fijar que la ejecución del programa de referencia sigue usando `comandosDelMundo(nivel.mundo)` (la regresión del catálogo con tres estrellas sigue en verde)
  - Correr las pruebas sobre el código SIN arreglar con `npm test -- --maxWorkers=2`
  - **RESULTADO ESPERADO**: las pruebas PASAN (confirman el comportamiento base a preservar)
  - Marcar la tarea completa cuando las pruebas estén escritas, ejecutadas y pasando sobre el código sin arreglar
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Arreglo para el desbloqueo de `REPITE` en el mundo 1 (sincronizar el mundo del editor y del panel al cambiar de nivel)

  - [ ] 3.1 Hacer mutable el mundo del editor y añadir `fijarMundo`
    - En `src/ui/editor.ts`: convertir el `mundo` fijado en la clausura en una variable mutable interna (`let mundoActual = deps.mundo;`), análoga a `let presupuesto = deps.presupuestoEstrella;`
    - `analizarTexto` pasa a usar `analizar(lexico.tokens, { mundo: mundoActual })` en lugar de `deps.mundo`
    - Añadir el método público `fijarMundo(mundo: Mundo)` en la interfaz `Editor` y en el objeto devuelto: asigna `mundoActual = mundo` y reanaliza el texto en curso (`analizarTexto()`) para que marcas y contador reflejen el mundo nuevo sin esperar al próximo tecleo
    - No tocar `presentarReto`: su firma y comportamiento (presupuesto, conteo, texto, marcas) no cambian
    - _Bug_Condition: isBugCondition(X) = mundoDelEditor <> mundoDelNivelEnCurso (del diseño)_
    - _Expected_Behavior: tras fijar el mundo del nivel en curso, el análisis usa ese mundo y no se reporta comandoBloqueado para comandos con mundo <= mundoDelNivelEnCurso (del diseño)_
    - _Preservation: Preservation Requirements del diseño (presentarReto y análisis en el mismo mundo inalterados)_
    - _Requirements: 2.1, 2.2, 3.3, 3.5_

  - [ ] 3.2 Hacer mutable el vocabulario del panel y añadir `fijarMundo`
    - En `src/ui/panel-comandos.ts`: extraer la construcción de los botones a una función interna que lea el mundo actual (`comandosDelMundo(mundoActual)`), borre el contenido de `raiz` y lo reconstruya (botones, ayuda, roving tabindex y escuchas). `botones` y `entradas` pasan a reflejar el mundo vigente
    - Añadir el método público `fijarMundo(mundo: Mundo)` en la interfaz `PanelComandos` y en el objeto devuelto: no-op si el mundo no cambió; si cambió, reconstruye los botones del nuevo vocabulario
    - No llamar al motor: solo a `comandosDelMundo` del lenguaje, respetando la dirección de dependencias (la UI consume el lenguaje, nunca al revés)
    - _Bug_Condition: isBugCondition(X) = mundoDelEditor <> mundoDelNivelEnCurso (del diseño)_
    - _Expected_Behavior: tras fijar el mundo del nivel en curso, el panel presenta exactamente comandosDelMundo(mundoDelNivelEnCurso) (del diseño)_
    - _Preservation: el panel creado en un mundo m sigue listando comandosDelMundo(m) en orden; roving tabindex y escuchas intactos_
    - _Requirements: 2.3, 3.2_

  - [ ] 3.3 Sincronizar el mundo en `montarReto` y usar la referencia `panel`
    - En `src/main.ts`: dentro de `montarReto`, junto a `editor.presentarReto(...)`, añadir `editor.fijarMundo(reto.nivel.mundo)` y `panel.fijarMundo(reto.nivel.mundo)`. Como `montarReto` corre en el arranque y en cada `cambiarANivel`, el mundo queda sincronizado siempre (en el primer montaje es un no-op porque ya coincide)
    - Retirar el descarte `void panel` y usar la referencia `panel` en `montarReto`
    - Sin literales de error nuevos: `comandoBloqueado` y los demás siguen viniendo de `src/lenguaje/errores.ts`; no se toca `errores.ts`, ni la cadena léxico → sintáctico, ni `vocabulario.ts`, ni `conteo.ts`, ni la ejecución de la referencia
    - _Bug_Condition: isBugCondition(X) = mundoDelEditor <> mundoDelNivelEnCurso (del diseño)_
    - _Expected_Behavior: navegar a un nivel sincroniza el mundo del editor y del panel con reto.nivel.mundo (del diseño)_
    - _Preservation: montarReto sigue reiniciando el intento (presupuesto, conteo, texto, globo, semilla, menú) y la referencia sigue usando comandosDelMundo(nivel.mundo)_
    - _Requirements: 2.1, 2.2, 2.3, 3.4, 3.5_

  - [ ] 3.4 Verificar que la prueba de exploración ahora pasa
    - **Property 1: Expected Behavior** - El editor y el panel reflejan el mundo del nivel en curso
    - **IMPORTANTE**: Re-ejecutar la MISMA prueba de la tarea 1; NO escribir una prueba nueva. Esa prueba codifica el comportamiento esperado y, al pasar, confirma que el bug está resuelto
    - Añadir las pruebas unitarias y basadas en propiedades del diseño: en `editor.test.ts`, `fijarMundo(1)` deja `REPITE` disponible y `fijarMundo(0)` lo bloquea; reanaliza el texto en curso; no altera presupuesto ni texto; para todo par `(inicial, destino)` en 0..5 tras `fijarMundo(destino)` no hay `comandoBloqueado` para comandos con `mundo <= destino`. En `panel-comandos.test.ts`, `fijarMundo(destino)` reconstruye los botones con `comandosDelMundo(destino)`, `fijarMundo` con el mismo mundo es no-op, y el roving tabindex y las escuchas siguen funcionando tras reconstruir
    - Correr con `npm test -- --maxWorkers=2`
    - **RESULTADO ESPERADO**: la prueba de la tarea 1 PASA (confirma que el bug está arreglado)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.5 Verificar que las pruebas de preservación siguen pasando
    - **Property 2: Preservation** - Entradas que no disparan el bug quedan inalteradas
    - **IMPORTANTE**: Re-ejecutar las MISMAS pruebas de la tarea 2; NO escribir pruebas nuevas
    - Confirmar que `fijarMundo(m)` con el mundo ya vigente es idempotente (deja análisis, conteo y panel sin cambios)
    - Correr con `npm test -- --maxWorkers=2`
    - **RESULTADO ESPERADO**: las pruebas PASAN (sin regresiones en análisis en el mismo mundo, bloqueo de mundos posteriores, conteo, referencia ni `presentarReto`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Punto de control - Asegurar que todo está en verde
  - Correr `npm run typecheck`, `npm run build` y la suite completa con `npm test -- --maxWorkers=2`
  - Verificar la regresión obligatoria del catálogo (cada reto aprueba su nivel con tres estrellas) y las pruebas de integración de `main.test.ts` (flujo 0 → 1 con `REPITE`, y navegación entre varios mundos 0 → 1 → 2 → 1 siguiendo el mundo del nivel en curso)
  - Confirmar que no se introdujo `Math.random` (solo `azar/prng.ts`) ni `eval`/`new Function`
  - Asegurar que todas las pruebas pasan; consultar al usuario si surgen dudas
