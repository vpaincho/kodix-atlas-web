# Primera investigación aplicada: recorrido, vehículo y cámara

## Referencias revisadas
- Motion, ejemplos y movimiento reducido: https://motion.dev/examples y https://motion.dev/docs/react-use-reduced-motion
- R3F, rendimiento y bucle de frames: https://r3f.docs.pmnd.rs/advanced/scaling-performance y https://r3f.docs.pmnd.rs/advanced/pitfalls
- Drei, controles: https://drei.docs.pmnd.rs/controls/introduction
- TripsLayer, concepto de posiciones con tiempos: https://deck.gl/docs/api-reference/geo-layers/trips-layer
- Modelos sobre terreno: https://maplibre.org/maplibre-gl-js/docs/examples/adding-3d-models-using-threejs-on-terrain/

Son referencias documentales y de mecanismos. No se copió una aplicación comercial ni se adoptó otro motor de mapa. Código, miniaturas y modelos de esta entrega son propios.

## Investigación REA: resultado real
Se instaló la CLI oficial `rea-agents` 6.7.0 en un directorio de herramientas separado, sin cambiar la configuración de clientes ni instalar proveedores nativos.
Se leyó su skill `reverse-engineer-anything` v42 y la guía de aplicaciones JavaScript.

Pregunta acotada: qué mecanismos temporales declara el paquete publicado de TripsLayer. Objetivo: `@deck.gl/geo-layers` 9.4.0, solo `dist/trips-layer/trips-layer.js` y `dist/trips-layer/trips-layer.wgsl.js`.

REA produjo inventario parcial, pero el análisis semántico fue bloqueado por `capability_unavailable`: la comprobación de propiedad de procesos de Linux no puede funcionar en este entorno. No se desactivó ni sustituyó ese control. No se afirma que REA haya explicado el comportamiento de TripsLayer.
Referencia parcial: `ev_2295f3e9fa90245d280fc3a41810e6bc0c48ba43dcfe01691b349c67a63e8af9` (identificador del intento local, no artefacto público recuperable).

El mecanismo de `currentTime`, timestamps y longitud de estela se revisó directamente en documentación y JavaScript distribuido MIT. Es evidencia estática; no se ejecutó la demo externa. No se incorporó deck.gl como dependencia de Atlas.

## Problemas del código de Atlas encontrados
1. El recorrido 2D y la curva 3D no compartían geometría ni posición.
2. CO2 retornaba durante trabajo; CO3 se desplazaba durante ejecución; CO5 cambiaba de locación mientras trabajaba.
3. La escena 3D representaba todas las categorías como camioneta.
4. La cámara automática impedía navegar manualmente.
5. El encabezado del detalle podía comprimir texto hasta una letra por línea.

## Implementación
- `routeGeometry.ts`: caminos ilustrativos compartidos, muestreo por longitud, cortes ejecutado/planificado y posición por horarios de cada tramo.
- Salidas explícitas después de trabajo/espera; llegada exacta y datos de distancia derivados de la misma geometría. Distancias rotuladas como estimación demo.
- Un hueco congela posición y distancia; solo una muestra posterior lo recupera.
- Modelos diferenciados de camioneta, camión y maquinaria y miniaturas originales.
- Todas las cuadrillas se pueden seleccionar en escena o lista.
- Terreno ilustrativo con un campo de altura compartido por caminos, equipos y locaciones.
- Órbita manual; botones de vista general, encuadre y seguimiento. Control manual cancela seguimiento. Movimiento reducido evita transiciones de cámara.
- Renderizado bajo demanda y carga diferida de la escena.
- Controles de capas 3D, controles con estado semántico y replay con teclado.

## Validación
TypeScript y Vite build. Seis pruebas de datos cubren reposo en locación, retorno, geometría compartida, huecos, observaciones de recuperación y distancias acotadas.
Pruebas de UI sobre build de producción con Chromium 153 headless y SwiftShader: selección 3D, seguimiento, cancelación manual, replay por teclado, play/pausa, 2D, búsqueda y conservación de selección al navegar. Tamaños: 1672x941, 1920x1080, 1366x768 y 1147x597. Se inspeccionan capturas y desbordamientos de página/detalle; errores de página capturados.

No se midieron FPS en la Mac ni se validó hardware GPU del usuario. Persiste una escena representativa: faltan geografía real, modelos de mayor fidelidad y resolución general de colisiones entre etiquetas de vehículos muy próximos. El peso diferido del motor 3D sigue siendo considerable.
