/* =============================================================================
   Detalle de investigación por alerta · evidencia, grafo de relaciones e impacto.
   La evidencia son HECHOS en la línea de tiempo de simulación (minutos desde
   08:00) con su fuente. El grafo distingue relaciones DOCUMENTADAS de HIPÓTESIS.
   Las acciones de gestión (reconocer/asignar/resolver) NO viven acá: se manejan
   en state/useAlerts.ts con tiempo real, separado del replay (regla temporal).
   ========================================================================== */
import { minToHHMM } from "./derive";

export type NodoTipo = "cuadrilla" | "frente" | "permiso" | "evento";
export type RelTipo = "documentada" | "hipotetica";

export interface GraphNode {
  id: string;
  label: string;
  sub?: string;
  tipo: NodoTipo;
  x: number; // 0..1 (posición normalizada en el lienzo)
  y: number;
}
export interface GraphEdge { from: string; to: string; tipo: RelTipo; }

export interface EvidenceItem {
  at: number;            // minuto desde 08:00 (hecho en timeline de simulación)
  titulo: string;
  detalle: string;
  fuente: string;        // procedencia del hecho
}

export interface AlertDetail {
  impactoCuadrillas: number;
  fuente: string;
  evidencia: EvidenceItem[];
  grafo: { nodos: GraphNode[]; aristas: GraphEdge[] };
  /** nodo -> ids de evidencia que sostiene (para resaltar al seleccionar) */
  evidenciaPorNodo: Record<string, number[]>;
}

/* --- ALR-01 · CO3, espera de permiso (alerta principal) -------------------- */
const ALR01: AlertDetail = {
  impactoCuadrillas: 1,
  fuente: "Escenario simulado",
  evidencia: [
    { at: 78, titulo: "Llegada a locación", detalle: "Cuadrilla 03 registrada en el frente N-850.", fuente: "Registro GPS" },
    { at: 90, titulo: "Umbral superado", detalle: "Más de 10 min sin inicio de tarea.", fuente: "Regla de negocio" },
    { at: 102, titulo: "Sin inicio de tarea", detalle: "24 min de espera acumulada.", fuente: "Escenario" },
  ],
  grafo: {
    nodos: [
      { id: "cuadrilla", label: "Cuadrilla 03", sub: "4 personas", tipo: "cuadrilla", x: 0.26, y: 0.46 },
      { id: "frente",    label: "Frente N-850", sub: "Pozo de producción", tipo: "frente", x: 0.78, y: 0.24 },
      { id: "permiso",   label: "Permiso pendiente", sub: "Aprobación de trabajo", tipo: "permiso", x: 0.30, y: 0.82 },
      { id: "llegada",   label: "Llegada 09:18", sub: "Registro GPS", tipo: "evento", x: 0.60, y: 0.80 },
      { id: "espera",    label: "Espera 24 min", sub: "Sin inicio de tarea", tipo: "evento", x: 0.86, y: 0.66 },
    ],
    aristas: [
      { from: "cuadrilla", to: "frente",  tipo: "documentada" },
      { from: "cuadrilla", to: "llegada", tipo: "documentada" },
      { from: "cuadrilla", to: "permiso", tipo: "documentada" },
      { from: "frente",    to: "espera",  tipo: "documentada" },
      { from: "permiso",   to: "espera",  tipo: "hipotetica" }, // causa por confirmar
    ],
  },
  evidenciaPorNodo: {
    cuadrilla: [78, 90, 102],
    frente: [102],
    permiso: [90, 102],
    llegada: [78],
    espera: [90, 102],
  },
};

/* --- ALR-02 · CO5, desvío de trayecto -------------------------------------- */
const ALR02: AlertDetail = {
  impactoCuadrillas: 1,
  fuente: "Escenario simulado",
  evidencia: [
    { at: 48, titulo: "Salida de ruta prevista", detalle: "El recurso de logística dejó la traza planificada.", fuente: "Geocerca" },
    { at: 56, titulo: "Ruta alternativa", detalle: "Trayecto por camino secundario.", fuente: "Registro GPS" },
  ],
  grafo: {
    nodos: [
      { id: "cuadrilla", label: "Logística 05", sub: "Camión", tipo: "cuadrilla", x: 0.26, y: 0.5 },
      { id: "frente",    label: "Frente E-1200", sub: "Pozo de producción", tipo: "frente", x: 0.78, y: 0.3 },
      { id: "desvio",    label: "Desvío", sub: "Geocerca", tipo: "evento", x: 0.55, y: 0.78 },
    ],
    aristas: [
      { from: "cuadrilla", to: "frente", tipo: "documentada" },
      { from: "cuadrilla", to: "desvio", tipo: "documentada" },
      { from: "desvio",    to: "frente", tipo: "hipotetica" },
    ],
  },
  evidenciaPorNodo: { cuadrilla: [48, 56], frente: [56], desvio: [48, 56] },
};

/* --- ALR-03 · CO4, posición desactualizada --------------------------------- */
const ALR03: AlertDetail = {
  impactoCuadrillas: 1,
  fuente: "Escenario simulado",
  evidencia: [
    { at: 14, titulo: "Última posición", detalle: "Último reporte de equipo EX-04.", fuente: "Telemetría" },
    { at: 40, titulo: "Frescura excedida", detalle: "Sin nuevos reportes dentro del umbral.", fuente: "Regla de negocio" },
  ],
  grafo: {
    nodos: [
      { id: "cuadrilla", label: "Cuadrilla 04", sub: "Equipo EX-04", tipo: "cuadrilla", x: 0.28, y: 0.5 },
      { id: "frente",    label: "Frente O-300", sub: "Pozo de desarrollo", tipo: "frente", x: 0.76, y: 0.32 },
      { id: "senal",     label: "Señal perdida", sub: "Telemetría", tipo: "evento", x: 0.55, y: 0.8 },
    ],
    aristas: [
      { from: "cuadrilla", to: "frente", tipo: "documentada" },
      { from: "cuadrilla", to: "senal", tipo: "documentada" },
    ],
  },
  evidenciaPorNodo: { cuadrilla: [14, 40], frente: [], senal: [14, 40] },
};

export const ALERT_DETAIL: Record<string, AlertDetail> = {
  "ALR-01": ALR01,
  "ALR-02": ALR02,
  "ALR-03": ALR03,
};

/** etiqueta horaria de un item de evidencia */
export const evLabel = (ev: EvidenceItem) => minToHHMM(ev.at);
