# Plan visual y de investigación — KODIX ATLAS

## Objetivo
Acercar las cinco pantallas al mockup conservando los flujos operativos y el replay. El mockup dirige composición, color y jerarquía. Las referencias externas aportan mecanismos concretos; no determinan toda la identidad del producto.

## Estado y límites
Esta es una selección documental de referencias, no una investigación ejecutada con REA. REA no está conectado a la sesión de ChatGPT que elaboró este plan. No se inspeccionaron binarios ni aplicaciones privadas. Los ejemplos deben revisarse en navegador y su código antes de adoptarlos. Reutilizar código y assets conforme a su licencia; reconstruir comportamientos observables con recursos propios cuando corresponda.

## Referencias
- REA oficial: https://github.com/morluto/rea
- Instalación: https://github.com/morluto/rea/blob/main/docs/installation.md
- Motion: https://motion.dev/examples
- Linear, jerarquía visual: https://linear.app/now/behind-the-latest-design-refresh
- MapLibre, modelos sobre terreno: https://maplibre.org/maplibre-gl-js/docs/examples/adding-3d-models-using-threejs-on-terrain/
- MapLibre, cámara: https://maplibre.org/maplibre-gl-js/docs/examples/customize-camera-animations/
- deck.gl, recorridos: https://deck.gl/examples/trips-layer
- Google Maps y TripsLayer: https://developers.google.com/maps/documentation/javascript/examples/deckgl-tripslayer
- Mapbox, vehículo en ruta: https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model-and-animate-along-route/
- deck.gl, capas: https://deck.gl/examples
- React Flow: https://reactflow.dev/examples
- Cesium, operación industrial: https://cesium.com/industries/digital-transformation/smart-construction/

## Inventario de componentes, de menor a mayor
| Nivel | Componentes | Investigación | Resultado esperado |
| --- | --- | --- | --- |
| Fundamentos | Colores, contraste, tipografía, espaciado, radios | Medir mockup y comparar capturas | Tokens comunes y muestras comparables |
| Microinteracciones | Botón, toggle, pestaña, chip, tooltip, foco | Motion: estados y transiciones | Estados normal, hover, foco, activo, deshabilitado y carga |
| Identidad de recursos | Miniatura, estado, patente, cuadrilla, misión | Siluetas y jerarquía del mockup | Misma identidad en lista, mapa y detalle; distinguir persona, cuadrilla y vehículo |
| Tarjetas y paneles | Lista, detalle, filtros, encabezados | Linear como referencia de densidad y predictibilidad | Lectura clara y sin desbordamiento |
| Etiquetas de mapa | Pozos, recursos, duración y alertas | Prioridad, ocultación, colisiones | Seleccionado siempre legible; no cubrir controles |
| Recorridos | Ejecutado, planificado, retorno y huecos | TripsLayer y modelos de ruta temporales | Geometría y tiempo compartidos entre escena, paneles y replay |
| Equipos 3D | Camioneta, camión, maquinaria e instalación | Ejemplos de modelos sobre mapas | Escala, rumbo, sombras y nivel de detalle coherentes |
| Cámara | General, encuadrar, seguir y control manual | MapLibre y comportamiento de seguimiento | Transición interrumpible; usuario recupera control |
| Territorio | Satélite, relieve, pozos y caminos | MapLibre/Cesium y datos propios | Georreferenciación verificable; calidad de datos declarada |
| Capas analíticas | Heatmap, geocercas, detenciones | deck.gl | Leyenda, unidades, período y filtros explícitos |
| Gráficos operativos | Radar, capacidad, flujo y timeline | Mockup y componentes SVG actuales | Selección y tiempo coordinados, valores derivados |
| Investigación | Lista de alertas, grafo y cronología | React Flow y grafo actual | Distinguir evidencia de hipótesis y acciones actuales |
| Pantallas | Seguimiento, Campo, Territorio, Pulso, Alertas | Comparación por viewport | Identidad común y composición propia por tarea |

## Método por componente
1. Elegir una pregunta técnica y una referencia principal.
2. Observar interacción y estados en navegador.
3. Revisar documentación/código público; usar REA si queda una incertidumbre que pueda resolver.
4. Registrar evidencia, conclusiones e incertidumbres. No presentar una captura estática como prueba de una animación.
5. Construir una prueba aislada usando exactamente el componente de producción.
6. Comparar con el mockup al mismo viewport.
7. Integrar con datos/selección/replay existentes.
8. Verificar comportamiento y rendimiento antes de ampliar el alcance.

Ficha mínima: componente, referencia y licencia, disparador, estados, propiedades animadas, duración observada o propuesta, easing, origen del dato, tratamiento de huecos, variante de movimiento reducido, evidencia y criterio de aceptación.

## Tres pruebas iniciales
### 1. Ruta + vehículo + cámara (prioridad máxima)
Revisar TripsLayer y el ejemplo de vehículo de Mapbox. Elegir la implementación compatible con el renderizador existente: no incorporar todos los motores. Corregir primero la discrepancia entre geometría curva 3D y posición 2D. Diferenciar retorno, respetar detenciones y huecos. Añadir modelos diferenciados y seguimiento interrumpible.

Aceptación: un mismo recurso aparece en el lugar correcto para el mismo instante; origen/destino coinciden; pausa congela datos; ruta no atraviesa huecos como si fueran observaciones; escala y etiquetas legibles en distintos encuadres.

### 2. Tarjeta + selección + panel
Revisar ejemplos Motion y jerarquía de Linear. Sustituir iconos genéricos con miniaturas consistentes, mejorar composición y coordinar la selección con mapa y detalle.

Aceptación: teclado y mouse funcionan, foco visible, sin saltos de layout ni scroll horizontal; movimiento reducido conserva toda la funcionalidad.

### 3. Terreno + locación + capa
Evaluar la necesidad de un motor geográfico web frente al adaptador 3D representativo y el mundo Unreal. Usar caminos/DEM/pozos propios solo tras confirmar archivos, CRS y transformaciones. Las posiciones normalizadas demo no se deben presentar como coordenadas reales.

Aceptación: verificar puntos de control geográficos; rutas y equipos se mantienen anclados al mover cámara; carga y estados de error disponibles. No atribuir fidelidad fotogramétrica a un DEM o modelo representativo.

## Orden de integración
1. Seguimiento: ruta, vehículo, cámara, etiquetas y paneles.
2. Campo: territorio e instalaciones y encuadres inmersivos.
3. Territorio: capas y selección espacio-temporal.
4. Pulso: gráficos y conexiones entre entidades.
5. Alertas: grafo, evidencia y acciones.

Los tokens y controles compartidos se mejoran junto con Seguimiento para que el cambio se propague al resto.

## Política de herramientas
Mantener React + Motion + Three/R3F existentes durante las primeras pruebas. MapLibre, deck.gl y React Flow son candidatos, no dependencias aprobadas automáticamente. Comparar antes de migrar. Evitar dos motores superpuestos con cámaras independientes. REA es herramienta de desarrollo; no se entrega en el bundle de producción.

## REA
La guía oficial usa `npx rea-agents setup`, configura clientes y workflow y requiere reiniciar el cliente elegido. Que esté instalado en una Mac no lo vuelve disponible en una sesión alojada de ChatGPT. Verificar herramientas expuestas antes de afirmar su uso. Instalar/configurar en el cliente que vaya a ejecutar las investigaciones, sin modificar otros clientes por defecto.

## Validación
Capturas iguales en viewport, recurso, instante y cámara. Probar 1672x941, 1920x1080, 1366x768 y ventana compacta. Recorrido: seleccionar -> seguir -> reproducir -> pausar -> inspeccionar evento -> abrir alerta -> volver. Medir rendimiento con hardware, navegador, cantidad de recursos, resolución y efectos declarados. El build no demuestra fluidez. No declarar fidelidad total sin comparación.
