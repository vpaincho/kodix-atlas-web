# KODIX ATLAS · Interfaz web (centro de operaciones)

Interfaz del centro de operaciones Oil & Gas. Stack: **Vite + React + TypeScript**,
animación con **framer-motion** (Motion), estado/tiempo con **zustand**, gráficos en
**SVG propio**. Sin dependencias de red, vídeo ni fuentes externas.

## Arranque

```bash
cd web-interface
npm install
npm run dev
```

- App: `http://localhost:5173/`
- Labs (componentes aislados): `http://localhost:5173/labs/`

Build de producción: `npm run build` · Previsualizar: `npm run preview`

## Estructura

```
src/
  data/        scenario.ts (escenario demo determinista) · derive.ts (todo derivado)
  state/       useOps.ts (store único: tiempo + selección) · ReplayClock.tsx
  world/       WorldBridge.ts (contrato con Unreal/Cesium + adaptador demo)
  styles/      tokens.css (sistema de diseño) · global/shell/charts/screens.css
  components/  shell/ (nav, rail, replay, paneles, chips, tooltip) · charts/ · icons
  screens/     PulsoOperativo · Campo · Stub (Seguimiento/Territorio/Alertas)
labs/          galería de componentes
```

## Qué está implementado (etapa 1)

- **Shell completo**: navegación superior, rail, barra de replay (play/pausa/1x·2x·4x/scrub),
  paneles, chips de estado, tooltips. Tiempo global único; mover el cursor actualiza todo.
- **Pulso operativo (alta fidelidad)**: KPIs derivados, FOCO operativo, Radar de respuesta
  (ETA), Capacidad/Demanda con brecha, Flujo de misiones (% real por fase), Línea de tiempo
  por cuadrilla con hitos. Seleccionar una cuadrilla la resalta en todos los componentes.
- **Campo**: superficie reservada al mundo (adaptador demo rotulado) + capas y encuadre
  cableados al `WorldBridge`.
- **Contrato de integración** con el mundo geográfico, espejando `CONTRATO_MUNDO.md v0.1`.
- **Labs** con los 4 componentes de Pulso e inspector de datos.

## Pendiente (próximas etapas)

Centro de alertas (relaciones evidencia/hipótesis, cronología, reconocer/asignar),
Seguimiento, Inteligencia territorial; labs `.html` individuales por componente;
transporte real a Unreal (hoy adaptador demo).

El spec `KODIX_ATLAS_Especificacion_v0.1.md` no está en el repo: se trabajó desde
los 5 mockups + el brief. Ver `DECISIONES.md`.
