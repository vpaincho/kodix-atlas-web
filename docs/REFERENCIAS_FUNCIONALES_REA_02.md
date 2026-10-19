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

### Resultado (2026-10-19)

**Evidencia REA.** Herramienta `mcp__rea__capture_browser_scenario` (provider `rea-playwright-browser-scenario`), Chrome real en modo headless, navegación a `https://kepler.gl/demo` + espera de 7 s, captura de screenshot + DOM + eventos de consola/errores. Evidence ID `ev_b5e52f0d8221d770d2dbe6291cd887f26ab20ff7cbbdc4205ac0f743ca024997`, completeness `complete`, 0 eventos de consola/errores (carga limpia). Confirmado por observación directa (no inferido):
- La versión servida ese día era **kepler.gl 3.3.0-alpha17**.
- El pie de atribución del mapa dice explícitamente **"Basemap by MapLibre"**, y el DOM capturado está lleno de clases `maplibregl-*` (`maplibregl-map`, `maplibregl-canvas`, `maplibregl-ctrl-*`) y un `aria-label="MapLibre logo"`. El demo público no usa Mapbox GL JS: usa **MapLibre GL JS**, el mismo motor que ya corre en Atlas.
- El DOM separa con nombres de clase propios: `side-panel--container` / `side-panel__tab` (pestañas Layers/Filter/Interactions, panel de datos), `layer-manager` / `add-layer-button` (gestión de capas dentro del side panel), y un clúster aparte `map-control` / `map-control-button` con, entre otros, `toggle-3d` y `split-map-controls` (vista dividida/comparación) como botones independientes del side panel.
- Limitación declarada: esta pasada solo observó DOM + screenshot post-carga (sin interacción real de click/drag ni inspección de JS). `capture_browser_scenario` en modo `launch` no expone un endpoint CDP reutilizable, así que no se encadenó `analyze_web_bundle` ni `export_web_scripts` sobre esta misma sesión; no se decompiló ni se leyó código fuente de kepler.gl. Tampoco se verificó en vivo que alternar capas conserve cámara: eso se tomó de la arquitectura pública (ver abajo), no de esta observación.
- Un primer intento (un subagente en segundo plano) se desvió de la instrucción de "solo investigar" y llegó a tocar el working tree; se descartó su resultado y esta pasada se hizo directamente, acotada a una sola captura.

**Análisis documental/manual (no observado hoy vía REA).** kepler.gl es código abierto (github.com/keplergl/kepler.gl); su separación de estado documentada en el propio repo usa reducers independientes: `mapState` (viewport: longitude/latitude/zoom/pitch/bearing — la cámara), `mapStyle` (mapa base/capas de basemap), `visState` (datasets, `layers`, `layerData`, `filters`, `interactionConfig` con hover/click/tooltip/brush — selección e interacción) y `uiState` (qué paneles están abiertos). La capa de React lee/escribe esos slices sin recrear el mapa ni el objeto `deck`/`Map`: cambia props sobre la instancia existente. Esto es conocimiento documental de la arquitectura pública, no evidencia extraída hoy del bundle.

**Aplicación concreta a Campo.** Se tradujo esa separación al MapLibre + Zustand ya presentes en Atlas, sin copiar código de kepler.gl:
- La cámara (bounds/pitch/bearing) vive solo en la instancia de `maplibregl.Map` (un `ref`), nunca en el estado de React: cambiar vista o capas nunca dispara el efecto que crea el mapa (que depende únicamente de `revision`, usado solo para reintentos).
- "Vistas" (estilo de mapa) y "capas" (límite, caminos, capa importada) quedaron en paneles separados y compactos superpuestos al mapa (como el `map-control` vs. `side-panel` de kepler), cada toggle usando `setLayoutProperty`/`setPaintProperty` sobre capas ya creadas, igual que el mecanismo ya probado en Seguimiento — nunca `setStyle` ni recrear capas.
- Selección: se agregó `generateId:true` a la fuente `imported` y `feature-state` (`selected`) sobre la capa `import-point`, equivalente al `interactionConfig.click` de kepler: clickear un punto importado alterna su selección y muestra sus propiedades reales en una tarjeta flotante (`.geo-feature`), sin tocar cámara ni demás capas. La selección se limpia solo cuando cambia el dato importado (nuevo archivo o "Quitar capa"), nunca al ocultar/mostrar capas o cambiar de vista — verificado manualmente en pestañas de prueba aisladas (ver sección de verificación más abajo).
- Solo "Cartográfica" quedó habilitada como vista real; "Relieve" y "Satélite" quedan visibles pero deshabilitadas con el motivo exacto (DEM / proveedor de imágenes faltante), seleccionable de nuevo "Expediente REA 01" apenas haya datos.

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

Estado real (entrega original, documental): esta primera entrega fue investigación documental y selección de objetivos con una revisión estática de referencias públicas. No se operaron las demos en navegador ni se midieron sus animaciones. No se ejecutó un nuevo análisis REA en ese momento; el intento previo quedó bloqueado por el requisito de procesos del entorno. Revisar licencia y atribución del archivo concreto antes de reutilizar código.

Actualización: el "Resultado (2026-10-19)" de más arriba sí ejecutó REA (`capture_browser_scenario` contra `kepler.gl/demo` en vivo) y aplicó el prototipo en Campo. REA sigue sin instalarse en el bundle de la app; solo se usó como herramienta de investigación en este entorno de desarrollo.

## Alcance de la entrega
Entrega original: solo documentación. No cambió el mapa gris, dependencias, posiciones, estados ni interfaz.

Esta entrega (2026-10-19, "Resultado" de Expediente REA 01): sí cambia interfaz de Campo (mapa protagonista, vistas/capas/selección superpuestas). Conserva el mapa gris y sus datos reales (límite de Zona Cero, carga local de GeoJSON); no agrega dependencias nuevas ni datos inventados. Ver commit local para el detalle de archivos tocados.
