# Referencias funcionales para Atlas — investigación 02
Fecha: 2026-10-19

## Decisión de diseño
Conservar el mapa gris actual como vista Cartográfica. El mockup sigue definiendo composición, violeta, superficies y jerarquía. Las referencias se seleccionan por mecanismos concretos. No hay una sola aplicación identificada que reúna el terreno de Campo, el radar ETA, las cuadrillas y las alertas tal como el mockup.

## Selección priorizada
| Área | Referencia y demo | Qué estudiar | Aplicación en Atlas | Prioridad |
| --- | --- | --- | --- | --- |
| Mapa y capas | Kepler.gl: https://kepler.gl/demo ; guía https://docs.kepler.gl/docs/user-guides/m-map-settings | Selector de mapas, visibilidad por capa, vista dividida, cámara y filtros temporales | Conservar gris; agregar vistas y comparación con selección compartida | 1 |
| Relieve y modelos | MapLibre Terrain: https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/ ; modelos: https://maplibre.org/maplibre-gl-js/docs/examples/adding-3d-models-using-threejs-on-terrain/ | Separación de mapa base, raster DEM, cámara y capa Three | Vista Relieve sobre el mismo territorio y equipos georreferenciados | 1 |
| Rutas y replay | deck.gl TripsLayer: https://deck.gl/examples/trips-layer ; fuente https://github.com/visgl/deck.gl/blob/master/examples/website/trips/app.tsx | Posiciones con tiempos, tiempo actual, longitud de estela, iluminación | Ejecutado/planificado/retorno, posición y replay global de Atlas | 2 |
| Radar y seguimiento | tar1090: https://github.com/wiedehopf/tar1090 ; instancia pública encontrada https://tbgmap.airframes.io/ | Anillos de alcance, orientación, selección de contactos, etiquetas y trazas históricas | Radar de respuesta propio: radio ETA y ángulo rumbo, no distancia de recepción ADS-B | 3 |
| Dashboard | Grafana Play: https://play.grafana.org/ ; State timeline https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/state-timeline/ | Ventana temporal común, paneles y cronología de estados | Pulso y línea de tiempo sincronizados con useOps.now | 4 |
| Alertas | Grafana Alert list: https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/alert-list/ ; historia https://grafana.com/docs/grafana/latest/alerting/monitor-status/view-alert-state-history/ | Filtros por estado, agrupación e historia | Centro de alertas: transiciones y evidencia temporal vinculadas al mapa | 4 |

Kepler.gl es la referencia principal de interacción de mapa; MapLibre es la referencia técnica más próxima al motor ya instalado. No se propone incorporar Kepler completo ni Grafana completo a Atlas.

## Hallazgos de esta revisión
- La documentación de Kepler separa ajustes de mapa y visibilidad de capas por vista; la guía de playback documenta una ventana temporal sobre el mapa.
- La fuente pública del ejemplo Trips combina MapLibre y DeckGL. Declara rutas con timestamps y parámetros de tiempo/estela; es candidato para investigar cómo evitar regenerar geometría en cada frame.
- tar1090 documenta múltiples mapas, oscurecimiento, selección múltiple, etiquetas y trazas históricas. Su metáfora operacional es más próxima a nuestro radar que un gráfico multivariable de telaraña. La equivalencia con ETA es una adaptación nuestra.
- Grafana documenta lista de alertas e historial de estados. Su State timeline es referencia para lectura temporal; sus estados técnicos no sustituyen los estados operativos de Atlas.
- Los ejemplos actuales de MapLibre pueden usar versiones posteriores a la 5.6 instalada. Cada API debe comprobarse contra el lockfile antes de portarla.
- Traccar se consideró como candidato de flota, pero su página de demo no fue accesible por la herramienta de consulta en esta revisión. No se selecciona por encima de las referencias verificables.
- React Flow tiene ejemplos útiles de grafos; algunos diseños automáticos son Pro. No es necesario para la primera investigación y no se propone copiar esos ejemplos.

## Vistas de mapa propuestas
1. Cartográfica: gris actual, pozos y rutas legibles.
2. Relieve: base gris con elevación DEM real; indicar resolución y cualquier exageración.
3. Satélite: imagen del mismo lugar con fecha/procedencia y atribución.
4. Operación: misma geografía con rutas, estado de cuadrillas y controles de seguimiento.
5. Análisis: densidad, esperas y cobertura calculadas desde datos.
6. Comparación: dos vistas con centro, escala y selección coordinados.

Son modos de presentación/capas sobre la misma referencia geográfica. No deben cambiar las posiciones al alternar. Satélite y DEM requieren proveedores o assets disponibles; una referencia visual no suministra cobertura de Zona Cero. Un efecto violeta no se interpreta como dato sin métrica y leyenda.

## Expediente REA 01: vistas y capas
Objetivo: entender cómo una referencia conserva cámara y selección mientras cambia presentación y capas.
Objetivos acotados: controles de mapa de Kepler y ejemplo de terreno de MapLibre. Fijar commit/versiones de los archivos antes de iniciar el análisis.
Preguntas:
- ¿Qué estado corresponde a cámara, mapa base y capas?
- ¿Cómo se actualiza una capa sin reconstruir el mapa?
- ¿Cómo se coordinan dos vistas?
- ¿Qué provoca una reconstrucción costosa o un salto de cámara?
- ¿Qué sucede si el proveedor tarda o falla?

Entregable: tabla evento -> estado -> actualización visual; archivos y líneas de evidencia; limitaciones; prototipo en Campo que conserva la vista gris.
Prueba de aceptación: alternar Cartográfica/Operación conserva encuadre y selección; apagar pozos no borra selección; fallar una fuente mantiene capas locales; vista general y encuadre funcionan después del cambio. No anunciar Relieve/Satélite como funcionales hasta disponer de sus datos.

## Expedientes siguientes
- 02 TripsLayer: timestamps -> currentTime -> geometría visible. Mapear a minutos globales de Atlas; no usar el reloj decorativo como reloj operacional.
- 03 tar1090: contacto seleccionado -> etiqueta -> traza -> detalle. Adaptar las unidades a ETA, conservar huecos y última observación.
- 04 Grafana: intervalo -> paneles -> eventos y estado. Separar observación, hipótesis y acción del operador.

## Cómo aplicar REA
1. Congelar objetivo, versión y pregunta.
2. Reproducir el gesto en una demo o una copia local con datos de ejemplo y registrar el resultado.
3. Analizar con REA el módulo acotado; conservar evidencia y declarar lo no observado.
4. Diseñar la adaptación a React, Zustand, MapLibre y Three ya presentes.
5. Implementar una porción integrada de Atlas y comparar con el mockup al mismo viewport.
6. Verificar selección, replay, errores de red y rendimiento antes de ampliar.

Estado real: esta entrega es investigación documental y selección de objetivos con una revisión estática de referencias públicas. No se operaron las demos en navegador ni se midieron sus animaciones. No se ejecutó un nuevo análisis REA; el intento previo quedó bloqueado por el requisito de procesos del entorno. REA no se instala en el bundle de la app. Si sigue bloqueado, el análisis directo del código debe identificarse como tal. Revisar licencia y atribución del archivo concreto antes de reutilizar código.

## Alcance de la entrega
Solo documentación. No cambia el mapa gris, dependencias, posiciones, estados ni interfaz.
