# KODIX ATLAS · Centro de operaciones

Frontend React 18 + TypeScript + Vite. Motion para interfaz, Zustand para tiempo y selección, Three.js/R3F/Drei para la escena ilustrativa de Seguimiento. Gráficos operativos SVG propios. Adaptador WorldBridge demo, preparado para integración futura con el mundo Unreal.

## Iniciar en Mac

```bash
npm ci
npm run dev
```

Abrir la URL indicada por Vite. Para actualizar esta copia Git, detener Vite y ejecutar:

```bash
git pull --ff-only
npm ci
npm run dev
```

## Comprobaciones

```bash
npm test
npm run build
```

Pruebas visuales opcionales:

```bash
npx playwright install chromium
npm run test:ui
```

`test:ui` sirve el build de producción en un puerto libre, prueba selección, cámara, replay con teclado, búsqueda, navegación y cuatro tamaños de pantalla. Para un navegador local alternativo se puede definir `CHROMIUM_EXECUTABLE_PATH`. No se interpreta el rendimiento de un navegador software como rendimiento de una GPU real.

## Estado

- Pulso, Alertas y Seguimiento comparten datos, selección y replay.
- Seguimiento incluye vistas 2D y 3D con la misma geometría y horarios de llegada/salida; diferencia retorno y planificado. Camioneta, camión y maquinaria son modelos originales ligeros y representativos.
- Cámara 3D con vista general, encuadre, seguimiento y control manual; arrastrar cancela seguimiento.
- Las detenciones y huecos se conservan en el tiempo; finalizar un hueco no inventa una observación GPS.
- Campo mantiene adaptador demo; Territorio sigue pendiente. No hay servidor ni conexión GPS en vivo.
- El terreno, los caminos y las instalaciones de Seguimiento son ilustrativos: no tienen validación geográfica ni fidelidad fotogramétrica.
- La carpeta labs no se recibió; su entrada de build es opcional cuando existe.

## Investigación y próximas mejoras

Ver `docs/PLAN_VISUAL_REA.md` y `docs/INVESTIGACION_SEGUIMIENTO_01.md`.
La investigación REA es herramienta de desarrollo y no forma parte del bundle. Las dependencias de análisis están fuera del proyecto.
