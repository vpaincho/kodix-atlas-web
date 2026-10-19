/* =============================================================================
   Seguimiento de recursos · rutas, eventos y posición por instante.
   -----------------------------------------------------------------------------
   Mismo escenario determinista (minutos desde 08:00). Coordenadas DEMO en un
   lienzo normalizado (0..1); NO son geografía validada. Reglas honradas:
   - Una "detención" es una observación GPS, no prueba una espera operativa.
   - No se interpola a través de huecos de datos prolongados (se marca el hueco).
   - Sin posición válida: se muestra la última conocida y su antigüedad.
   - Distancia recorrida (hasta el cursor) ≠ distancia total planificada.
   - Interpolación demo claramente distinguida de la observación registrada.
   ========================================================================== */
import { CUADRILLAS, type Fase } from "./scenario";
import { faseAt, tramoAt } from "./derive";
import { roadLegs, routeState } from "./routeGeometry";

export interface Waypoint { id: string; label: string; x: number; y: number; }

export const WAYPOINTS: Record<string, Waypoint> = {
  base_sur: { id: "base_sur", label: "Base Sur", x: 0.16, y: 0.80 },
  A12:      { id: "A12", label: "Pozo A-12", x: 0.30, y: 0.30 },
  B07:      { id: "B07", label: "Pozo B-07", x: 0.74, y: 0.24 },
  B03:      { id: "B03", label: "Pozo B-03", x: 0.82, y: 0.58 },
  A08:      { id: "A08", label: "Pozo A-08", x: 0.42, y: 0.66 },
  S400:     { id: "S400", label: "Pozo S-400", x: 0.60, y: 0.84 },
  B08:      { id: "B08", label: "Pozo B-08", x: 0.88, y: 0.40 },
};

export type LegKind = "ejecutado" | "retorno";
export interface RoutePoint { wp: string; t: number; departAt?: number; kind?: LegKind; }

export type VehTipo = "camioneta" | "camion" | "maquinaria";

export interface ResourceTrack {
  id: string;            // CO1..CO6 (misma identidad que Pulso/Alertas)
  patente: string;
  veh: VehTipo;          // tipo de vehículo (sustituto SVG explícito, no asset final)
  origen: string;        // waypoint de origen
  ruta: RoutePoint[];    // waypoints con su minuto de arribo (desde origen)
  /** hueco de datos GPS: sin observaciones entre [from,to]; no interpolar */
  hueco?: { from: number; to: number };
  /** no tiene misión asignada (recurso "vacío") */
  sinMision?: boolean;
}

/* Rutas alineadas con las fases del escenario (salida, llegada, retorno). */
export const TRACKS: ResourceTrack[] = [
  { id: "CO1", patente: "KDX-301", veh: "maquinaria", origen: "base_sur",
    ruta: [{ wp: "base_sur", t: 0 }, { wp: "A12", t: 16, kind: "ejecutado" }] },
  { id: "CO2", patente: "KDX-302", veh: "camioneta", origen: "base_sur",
    ruta: [{ wp: "base_sur", t: 0 }, { wp: "B07", t: 20, kind: "ejecutado" }, { wp: "base_sur", t: 120, departAt: 112, kind: "retorno" }] },
  { id: "CO3", patente: "KDX-303", veh: "camioneta", origen: "base_sur",
    ruta: [{ wp: "base_sur", t: 0 }, { wp: "A12", t: 20, kind: "ejecutado" }, { wp: "B03", t: 78, departAt: 55, kind: "ejecutado" }] },
  { id: "CO4", patente: "KDX-304", veh: "camioneta", origen: "base_sur",
    ruta: [{ wp: "base_sur", t: 0 }, { wp: "A08", t: 14, kind: "ejecutado" }],
    hueco: { from: 14, to: 120 } },   // posición desactualizada (ALR-03)
  { id: "CO5", patente: "KDX-305", veh: "camion", origen: "base_sur",
    ruta: [{ wp: "base_sur", t: 30 }, { wp: "A08", t: 48, kind: "ejecutado" }, { wp: "B03", t: 103, departAt: 86, kind: "ejecutado" }, { wp: "B08", t: 120, kind: "ejecutado" }] },
  { id: "CO6", patente: "KDX-306", veh: "camioneta", origen: "base_sur", sinMision: true,
    ruta: [{ wp: "base_sur", t: 0 }, { wp: "S400", t: 18, kind: "ejecutado" }, { wp: "base_sur", t: 58, departAt: 40, kind: "retorno" }] },
];

/** rumbo (grados, 0=arriba, horario) del recurso en el instante `now`,
    según el segmento de ruta vivo. Si está detenido, usa el último segmento. */
export function rumboEn(tr: ResourceTrack, now: number): number {
  const { tangent } = routeState(tr, now, WAYPOINTS);
  return Math.atan2(tangent.x, -tangent.y) * 180 / Math.PI;
}

export const trackDe = (id: string) => TRACKS.find((t) => t.id === id);

/* --- geometría demo --------------------------------------------------------*/
const KM_POR_UNIDAD = 60; // escala demo lienzo->km
function dist(a: Waypoint, b: Waypoint) {
  return Math.hypot(a.x - b.x, a.y - b.y) * KM_POR_UNIDAD;
}

/** distancia total planificada de la ruta (km) */
export function distanciaTotal(tr: ResourceTrack): number {
  return roadLegs(tr, WAYPOINTS).reduce((sum, leg) => sum + leg.length, 0) * KM_POR_UNIDAD;
}

export interface PosDemo {
  x: number; y: number;
  /** true si es interpolación demo; false si es un waypoint observado */
  interpolada: boolean;
  /** true si no hay posición válida en `now` (hueco): x,y es la última conocida */
  desactualizada: boolean;
  /** antigüedad en minutos de la última posición conocida (si desactualizada) */
  antiguedadMin: number;
}

/** posición en el instante `now`. Respeta huecos (no interpola) y "antes de salir". */
export function posicionEn(tr: ResourceTrack, now: number): PosDemo {
  const state = routeState(tr, now, WAYPOINTS);
  return { ...state.point, interpolada: !state.observed, desactualizada: state.stale, antiguedadMin: state.age };
}

/** distancia recorrida hasta el cursor (km). No cuenta tramos futuros. */
export function distanciaHasta(tr: ResourceTrack, now: number): number {
  return routeState(tr, now, WAYPOINTS).travelled * KM_POR_UNIDAD;
}

/* --- eventos del recurso (hechos en la línea de simulación) -----------------*/
export type EventoTipo = "salida" | "llegada" | "detencion" | "hueco";
export interface EventoTrack {
  t: number;
  tipo: EventoTipo;
  label: string;
  detalle: string;
  wp?: string;
  durMin?: number;       // duración (detención / hueco)
}

/** eventos derivados del escenario: salida, llegada, detenciones (GPS) y hueco. */
export function eventosDe(tr: ResourceTrack, now: number): EventoTrack[] {
  const c = CUADRILLAS.find((x) => x.id === tr.id);
  const ev: EventoTrack[] = [];
  const r = tr.ruta;
  ev.push({ t: r[0].t, tipo: "salida", label: "Salida", detalle: `Desde ${WAYPOINTS[r[0].wp].label}`, wp: r[0].wp });
  for (const point of r.slice(1)) ev.push({ t: point.t, tipo: "llegada", label: point.kind === "retorno" ? "Retorno a base" : "Llegada", detalle: `A ${WAYPOINTS[point.wp].label}`, wp: point.wp });
  // detenciones GPS = fases de espera del escenario (observación, NO prueba de espera operativa)
  if (c) {
    for (const tramo of c.tramos) {
      if (tramo.fase === "espera") {
        const fin = Math.min(tramo.to, now);
        ev.push({
          t: tramo.from, tipo: "detencion",
          label: "Detención",
          detalle: "Detención GPS registrada (no implica, por sí sola, espera operativa)",
          durMin: Math.max(0, Math.round(fin - tramo.from)),
        });
      }
    }
  }
  if (tr.hueco) ev.push({
    t: tr.hueco.from, tipo: "hueco", label: "Hueco de datos",
    detalle: "Sin reportes de posición; no se interpola el movimiento.",
    durMin: Math.max(0, Math.round(Math.min(tr.hueco.to, now) - tr.hueco.from)),
  });
  return ev.sort((a, b) => a.t - b.t);
}

/* --- estado de movilidad del recurso al instante `now` ---------------------*/
export type Movilidad = "en_servicio" | "traslado" | "espera" | "disponible";
export function movilidad(tr: ResourceTrack, now: number): Movilidad {
  const c = CUADRILLAS.find((x) => x.id === tr.id);
  const fase: Fase = c ? faseAt(c, now) : "disponible";
  if (fase === "traslado") return "traslado";
  if (fase === "espera") return "espera";
  if (fase === "disponible") return "disponible"; // coherente con Pulso/Alertas
  return "en_servicio"; // ejecucion / retorno => recurso activo en servicio
}

export const MOVILIDAD_LABEL: Record<Movilidad, string> = {
  en_servicio: "En servicio", traslado: "Traslado", espera: "En espera", disponible: "Disponible",
};
export const MOVILIDAD_COLOR: Record<Movilidad, string> = {
  en_servicio: "var(--green)", traslado: "var(--blue)", espera: "var(--amber)", disponible: "var(--green)",
};

/** última posición conocida con su antigüedad (para la ficha de estado). */
export function ultimaPosicion(tr: ResourceTrack, now: number) {
  const p = posicionEn(tr, now);
  return { ...p, tramo: tramoAt(CUADRILLAS.find((x) => x.id === tr.id)!, now) };
}
