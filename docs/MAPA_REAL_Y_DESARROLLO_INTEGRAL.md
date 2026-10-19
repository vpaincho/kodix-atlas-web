# Campo real y desarrollo integral del mockup

## Primera integración
Campo reemplaza el adaptador vacío por MapLibre GL JS. Cartografía raster de OpenStreetMap, atribución visible y solicitudes estándar del navegador (sin precarga, proxy ni descarga masiva). Requiere conexión y disponibilidad del proveedor. El polígono original de `zona_cero_utm19s.gpkg` se convirtió de EPSG:32719 a EPSG:4326 con PROJ/pyproj, orden longitud/latitud. Una entidad Polygon válida, límites aproximados -67.90120/-45.84496 a -67.82604/-45.79447. El GeoJSON conserva procedencia. No representa el recorte cuadrado del Landscape con buffer: es el núcleo original.

Controles: zoom, brújula, encuadre, inclinación, escala métrica y límite visible. La inclinación es perspectiva de mapa plano, sin relieve DEM. Capa local importable GeoJSON WGS84 (hasta 5 MB, 10.000 entidades y 100.000 vértices), con puntos, líneas luminosas y polígonos. Se conserva solo durante la visita a Campo; no se sube a servidor. Quitar una capa no elimina su archivo. No se convierten KMZ ni GeoPackage desde el navegador en esta entrega: exportarlos a GeoJSON WGS84 desde QGIS.

Seguimiento sigue en su escenario ilustrativo. No se han trasladado coordenadas normalizadas a posiciones geográficas inventadas. No hay API GPS ni pozos reales suministrados en este archivo. La cartografía general puede tener caminos incompletos.

## Secuencia del producto integral
1. Campo geográfico: polígono original, navegación y capas locales (esta entrega).
2. Incorporar caminos y pozos originales: identificadores, procedencia y selección sobre el mapa. Validar coincidencia con QGIS y el sector E782 antes de integrar recorridos.
3. Motor visual compartido con Seguimiento: rutas ejecutadas/planificadas/retorno y posición en el mismo CRS; acoplar selección, replay y paneles. El proveedor GPS debe aportar timestamps y rumbo; conservar antigüedad y huecos.
4. Terreno e imagen satelital: publicar el DEM y la imagen de Zona Cero como teselas adecuadas o conectar proveedor autorizado. Resolver cobertura, atribución, resolución, credenciales y rendimiento. El archivo DEM del proyecto Unreal no está en este repo.
5. Equipos sobre el terreno: modelos glTF por categoría y nivel de detalle, orientación y escala física, cámara cercana y transiciones. Mantener la lista operativa y el panel de inspección como una sola selección.
6. Composición del mockup: mapa protagonista, paneles superpuestos, jerarquía de indicadores, iluminación violeta concentrada en rutas/selección y superficies grafito. Ajustar cada pantalla usando referencias iguales de cámara, instante y viewport.
7. Territorio y Pulso: reutilizar límites y entidades geográficas para mapas de actividad y focos vinculados. Medir FPS en la Mac real y presupuestar puntos, líneas, modelos y postprocesado.

Los shaders del laboratorio se reutilizan donde aporten lectura: halos para foco y rutas, perspectiva para inspección. La esfera de partículas no representa datos de operación. La composición integral se implementa progresivamente sobre el mismo sistema; el mockup completo aún no está cerrado.

## Referencias técnicas
- https://maplibre.org/maplibre-gl-js/docs/examples/add-a-raster-tile-source/
- https://maplibre.org/maplibre-gl-js/docs/examples/satellite-map/
- https://operations.osmfoundation.org/policies/tiles/

## Validación y límites
Build TypeScript/Vite y ocho pruebas de datos, incluyendo extensión y cierre del polígono, rechazo de coordenadas proyectadas, archivos vacíos y exceso de entidades. UI en Chromium headless: contenedor del mapa con tamaño visible, atribución, controles de cámara, límite, carga/quita de capa, rechazo de CRS y anchos de escritorio 1920, 1672, 1366 y 1147. Las teselas remotas se sustituyen por un fixture local en esta prueba para no automatizar descargas del servicio OSM. No certifica disponibilidad externa ni cobertura cartográfica; confirmar al abrir Campo en la Mac. El marco general de Atlas aún necesita adaptación para anchos móviles. El mapa y el motor Three se cargan de forma diferida; ambos siguen generando chunks grandes. No se midieron FPS en hardware real.
