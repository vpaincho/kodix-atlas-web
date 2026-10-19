# Decisiones de diseño e implementación · KODIX ATLAS web

Registro breve (brief: "Registrá brevemente las decisiones y continuá").

1. **Sin frontend previo** en el repo (ni `web-interface` ni `package.json`): se
   arranca de cero con Vite + React + TS, opción autorizada por el brief.

2. **Spec ausente**: `KODIX_ATLAS_Especificacion_v0.1.md` no está en el repo. Fuente
   de verdad = los 5 mockups + el brief. No se inventó contenido de spec.

3. **Unificación de cifras de los mockups** (no coinciden 100% entre sí). Todo se
   deriva de un único escenario (`scenario.ts`):
   - `frentes activos` = frentes distintos con una cuadrilla en ejecución o espera → **4**.
   - `esperas` = cuadrillas en espera en el instante actual → **2** (CO3, CO4).
   - El **Estado** de cada cuadrilla se lee de la fase viva en "ahora" (no de una
     etiqueta fija): por eso CO4 figura "En espera" (su bloque ámbar del mockup) y no
     "En ejecución". Es el comportamiento guiado por datos que pide el brief.

4. **Radar declara ETA** (no distancia), anillos a 10/20/30 min. Colores por 3 estados
   (Disponible / En servicio / Sin asignar), como la leyenda del mockup.

5. **Flujo de misiones**: el ancho de banda es el **% real** del tiempo agregado por fase
   sobre toda la ventana; no son valores fijos.

6. **Capacidad/Demanda**: demanda = cuadrillas en ejecución+espera por minuto (derivada);
   capacidad = roster planificado que baja al cierre de turno y genera la "brecha próxima".

7. **Tiempo**: UTC interno, interfaz en hora argentina. Un único reloj (`ReplayClock`)
   maneja play/pausa/velocidad/scrub. Las animaciones decorativas no tocan los datos.

8. **Contrato de mundo**: `WorldBridge` espeja `CONTRATO_MUNDO.md v0.1` del track de
   Unreal (SelectAsset, FocusAsset, SetLayerVisible, SetTime, ApplySnapshot + eventos).
   Hoy con adaptador **demo** rotulado; la superficie del mapa no es geografía validada.

9. **Dependencias mínimas**: framer-motion, zustand. Gráficos en SVG propio (sin lib de
   charts). GSAP se sumará solo si un lab necesita animación SVG de timing preciso.
