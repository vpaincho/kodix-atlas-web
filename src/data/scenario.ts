/* =============================================================================
   Escenario demo determinista · KODIX ATLAS
   -----------------------------------------------------------------------------
   UNA sola fuente de verdad para todas las pantallas. El tiempo se mide en
   MINUTOS desde T0 = 08:00. La ventana operativa es 0..120 (08:00..10:00) y el
   instante "ahora" por defecto es 102 (09:42). Toda métrica (KPIs, %, series,
   ETA) se DERIVA de estas fases en src/data/derive.ts — acá no hay porcentajes
   ni totales escritos a mano.

   Decisiones de unificación (los 5 mockups no coinciden 100% entre sí):
   - "frentes activos" = frentes distintos con una cuadrilla en ejecución o
     espera en el instante actual  -> con este escenario da 4 (como el header).
   - "esperas" = cuadrillas cuya fase actual es espera -> da 2 (CO3, CO4).
   - El Estado de cada cuadrilla se lee de la fase viva en "ahora", no de una
     etiqueta fija: por eso CO4 figura "En espera" (su bloque ámbar del mockup).
   ========================================================================== */

export const T0_LABEL = "08:00";
export const WINDOW_MIN = 120;      // 08:00 -> 10:00
export const DEFAULT_NOW = 102;     // 09:42

export type Fase = "traslado" | "espera" | "ejecucion" | "retorno" | "disponible";

export interface Tramo {
  fase: Fase;
  /** minutos desde 08:00 */
  from: number;
  to: number;
}

export interface Hito {
  at: number;            // minuto
  label: string;
}

export interface Frente {
  id: string;            // "E-1000"
  nombre: string;
  tipo: "desarrollo" | "produccion" | "exploracion";
  /** posición relativa normalizada en el radar (rumbo en grados, radio 0..1 por ETA) */
  rumbo: number;         // 0 = Norte, horario
}

export interface Cuadrilla {
  id: string;            // "CO1"
  tarea: string;         // "Perforación"
  frenteId: string;      // frente asignado
  color: string;         // color base (se resuelve por estado en runtime)
  tramos: Tramo[];
  hitos: Hito[];
  /** distancia base al frente (km), para radar en modo distancia */
  distanciaKm: number;
}

export const FRENTES: Frente[] = [
  { id: "E-1000", nombre: "Pozo E-1000", tipo: "desarrollo",  rumbo: 28 },
  { id: "N-200",  nombre: "Pozo N-200",  tipo: "produccion",  rumbo: 95 },
  { id: "N-850",  nombre: "Pozo N-850",  tipo: "produccion",  rumbo: 332 },
  { id: "O-300",  nombre: "Pozo O-300",  tipo: "desarrollo",  rumbo: 262 },
  { id: "S-400",  nombre: "Pozo S-400",  tipo: "exploracion", rumbo: 150 },
  { id: "E-1200", nombre: "Pozo E-1200", tipo: "produccion",  rumbo: 205 },
];

/* Fases por cuadrilla. En "ahora"=102 cada una cae en una fase concreta que
   define su Estado. Los hitos son los rombos de la línea de tiempo. */
export const CUADRILLAS: Cuadrilla[] = [
  {
    id: "CO1", tarea: "Perforación", frenteId: "E-1000", color: "var(--violet)",
    distanciaKm: 12,
    tramos: [
      { fase: "traslado",  from: 0,  to: 16 },
      { fase: "ejecucion", from: 16, to: 120 },
    ],
    hitos: [{ at: 37, label: "Inicio de maniobra" }, { at: 97, label: "Cambio de turno" }],
  },
  {
    id: "CO2", tarea: "Workover", frenteId: "N-200", color: "var(--violet)",
    distanciaKm: 8,
    tramos: [
      { fase: "traslado",  from: 0,   to: 20 },
      { fase: "espera",    from: 20,  to: 40 },
      { fase: "ejecucion", from: 40,  to: 112 },
      { fase: "retorno",   from: 112, to: 120 },
    ],
    hitos: [{ at: 40, label: "Permiso habilitado" }, { at: 112, label: "Cierre de tarea" }],
  },
  {
    id: "CO3", tarea: "Reparación", frenteId: "N-850", color: "var(--amber)",
    distanciaKm: 28,
    tramos: [
      { fase: "traslado",  from: 0,  to: 20 },
      { fase: "ejecucion", from: 20, to: 55 },
      { fase: "traslado",  from: 55, to: 78 },
      { fase: "espera",    from: 78, to: 120 },   // espera de permiso (FOCO) -> 24 min a las 09:42
    ],
    hitos: [{ at: 20, label: "Llegada a locación" }, { at: 78, label: "Solicitud de permiso" }],
  },
  {
    id: "CO4", tarea: "Mantenimiento", frenteId: "O-300", color: "var(--amber)",
    distanciaKm: 14,
    tramos: [
      { fase: "traslado",  from: 0,  to: 14 },
      { fase: "ejecucion", from: 14, to: 52 },
      { fase: "espera",    from: 52, to: 120 },
    ],
    hitos: [{ at: 52, label: "Espera de repuesto" }],
  },
  {
    id: "CO5", tarea: "Logística", frenteId: "E-1200", color: "var(--blue)",
    distanciaKm: 18,
    tramos: [
      { fase: "ejecucion", from: 0,  to: 30 },   // carga en base
      { fase: "traslado",  from: 30, to: 48 },
      { fase: "espera",    from: 48, to: 58 },
      { fase: "ejecucion", from: 58, to: 86 },
      { fase: "traslado",  from: 86, to: 120 },  // en ruta al frente
    ],
    hitos: [{ at: 30, label: "Salida de base" }, { at: 86, label: "Reabastecido" }],
  },
  {
    id: "CO6", tarea: "Inspección", frenteId: "S-400", color: "var(--green)",
    distanciaKm: 25,
    tramos: [
      { fase: "traslado",   from: 0,  to: 18 },
      { fase: "ejecucion",  from: 18, to: 40 },
      { fase: "retorno",    from: 40, to: 58 },
      { fase: "disponible", from: 58, to: 120 },
    ],
    hitos: [{ at: 30, label: "Inspección completa" }],
  },
];

/* Alerta principal (Centro de alertas) — derivada del estado de CO3 ----------*/
export interface Alerta {
  id: string;
  tipo: "espera_prolongada" | "desvio" | "posicion_desactualizada";
  severidad: "alta" | "media" | "baja";
  cuadrillaId: string;
  frenteId: string;
  at: number;              // minuto en que se disparó
  titulo: string;
  hipotesis: string;
  reconocida: boolean;
}

export const ALERTAS: Alerta[] = [
  {
    id: "ALR-01", tipo: "espera_prolongada", severidad: "alta",
    cuadrillaId: "CO3", frenteId: "N-850", at: 90,
    titulo: "Espera prolongada",
    hipotesis: "La cuadrilla llegó al frente pero no cuenta con el permiso de trabajo habilitado para iniciar tareas.",
    reconocida: false,
  },
  {
    id: "ALR-02", tipo: "desvio", severidad: "media",
    cuadrillaId: "CO5", frenteId: "E-1200", at: 56,
    titulo: "Desvío de trayecto",
    hipotesis: "El recurso de logística tomó una ruta alternativa; verificar corte o condición de camino.",
    reconocida: false,
  },
  {
    id: "ALR-03", tipo: "posicion_desactualizada", severidad: "media",
    cuadrillaId: "CO4", frenteId: "O-300", at: 14,
    titulo: "Posición desactualizada",
    hipotesis: "El equipo dejó de reportar posición; última señal supera el umbral de frescura.",
    reconocida: false,
  },
];

/* Colores por estado operativo (resuelven el token según la fase viva) --------*/
export const COLOR_FASE: Record<Fase, string> = {
  traslado:   "var(--fase-traslado)",
  espera:     "var(--fase-espera)",
  ejecucion:  "var(--fase-ejecucion)",
  retorno:    "var(--fase-retorno)",
  disponible: "var(--green)",
};

export const LABEL_FASE: Record<Fase, string> = {
  traslado:   "Traslado",
  espera:     "En espera",
  ejecucion:  "En ejecución",
  retorno:    "Retorno",
  disponible: "Disponible",
};
