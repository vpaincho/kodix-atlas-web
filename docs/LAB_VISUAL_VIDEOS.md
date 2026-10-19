# Estudios visuales a partir de los videos de referencia

## Evidencia observada
Se revisaron cuadros de los dos MP4 entregados por el usuario. En el primer video: tarjetas con perspectiva/rotación (aprox. 0,8 s) y una esfera violeta de partículas con borde ondulante (aprox. 2,3 s). En el segundo: objetos y vegetación a distintas profundidades alrededor del contenido (aprox. 4,2 s).

La grabación no revela código, estructura interna ni librerías originales. Estas implementaciones son reconstrucciones propias de mecanismos visuales observables. No son hallazgos atribuidos a REA ni una copia del sitio mostrado.

## Implementado
1. `TiltSurface`: perspectiva limitada, inercia de resortes y reflejo radial que sigue el cursor. Movimiento reducido y touch mantienen una tarjeta estática y utilizable.
2. `ShowcaseStage`: vehículo original sobre plataforma iluminada, luz violeta, sombras y anillos. Órbita/zoom manuales y giro opcional. Usa exactamente `VehicleModel` de Seguimiento.
3. `ParticleCore`: 16.000 puntos, deformación GPU mediante shaders propios, movimiento lento y respuesta al cursor. La energía es un control estético, no una métrica.
4. Laboratorio `/labs/`: selección de recursos, cambio de estudio, intensidad, pausa y adaptación móvil.
5. Seguimiento: inspección de equipo en diálogo modal con cierre por botón/Escape y presentación compartida. No modifica la posición GPS ni el replay.

## Fuentes técnicas consultadas
- https://motion.dev/docs/react-use-spring
- https://motion.dev/docs/react-use-reduced-motion
- https://threejs.org/docs/pages/ShaderMaterial.html

Se usaron APIs ya instaladas compatibles con React 18. No se agregaron librerías de producción ni assets externos.

## Validación y límites
Build TypeScript/Vite; Chromium 153 headless con SwiftShader. Pruebas: cambio de modelo, perspectiva al cursor, shader sin errores, pausa, viewport móvil de 390px, preferencia de movimiento reducido al cargar, diálogo y Escape desde Seguimiento. Las pruebas del laboratorio capturan también errores de consola y de página.

No se midieron FPS en hardware del usuario. No hay fidelidad fotográfica del vehículo ni terreno real. El lenguaje de objetos en primer plano y vegetación del segundo video queda como siguiente investigación; no se simuló como si ya estuviera integrado. REA sigue con el bloqueo de comprobación de procesos documentado en la investigación anterior.
