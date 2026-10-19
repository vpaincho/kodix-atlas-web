/* =============================================================================
   Derivaciones del escenario · todo se calcula desde las fases, nunca a mano.
   ========================================================================== */
import {
  CUADRILLAS, FRENTES, ALERTAS, WINDOW_MIN,
  type Fase, type Cuadrilla, type Tramo,
} from "./scenario";

/** minuto desde 08:00 -> etiqueta "HH:MM" (hora argentina de interfaz) */
export function minToHHMM(min: number): string {
  const total = 8 * 60 + Math.round(min);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** fase viva de una cuadrilla en el instante `now` */
export function faseAt(c: Cuadrilla, now: number): Fase {
  const t = c.tramos.find((tr) => now >= tr.from && now < tr.to);
  if (t) return t.fase;
  // fuera de rango: antes de empezar o después de terminar
  if (now < c.tramos[0].from) return "disponible";
  return c.tramos[c.tramos.length - 1].fase;
}

/** tramo vivo (para saber cuánto lleva / cuánto falta) */
export function tramoAt(c: Cuadrilla, now: number): Tramo | undefined {
  return c.tramos.find((tr) => now >= tr.from && now < tr.to);
}

export interface EstadoCuadrilla {
  cuadrilla: Cuadrilla;
  fase: Fase;
  frente: string;
  /** minutos dentro de la fase actual */
  enFaseMin: number;
  /** ETA en minutos al frente si está en traslado, si no null */
  etaMin: number | null;
}

export function estadoCuadrillas(now: number): EstadoCuadrilla[] {
  return CUADRILLAS.map((c) => {
    const fase = faseAt(c, now);
    const tr = tramoAt(c, now);
    const enFaseMin = tr ? Math.round(now - tr.from) : 0;
    const etaMin = fase === "traslado" && tr ? Math.max(0, Math.round(tr.to - now)) : null;
    return {
      cuadrilla: c, fase,
      frente: c.frenteId,
      enFaseMin, etaMin,
    };
  });
}

/* --- KPIs del header (derivados) ------------------------------------------- */
export interface Kpis {
  cuadrillas: number;
  frentesActivos: number;   // frentes distintos con ejecución o espera ahora
  esperas: number;          // cuadrillas en espera ahora
}

export function kpis(now: number): Kpis {
  const est = estadoCuadrillas(now);
  const frentes = new Set<string>();
  let esperas = 0;
  for (const e of est) {
    if (e.fase === "ejecucion" || e.fase === "espera") frentes.add(e.frente);
    if (e.fase === "espera") esperas++;
  }
  return { cuadrillas: CUADRILLAS.length, frentesActivos: frentes.size, esperas };
}

/* --- Flujo operacional: % de tiempo por fase en toda la ventana ------------- */
export interface FaseAgregada {
  fase: Fase;
  minutos: number;
  pct: number;        // 0..100
}

const FASES_FLUJO: Fase[] = ["traslado", "espera", "ejecucion", "retorno"];

export function flujoMisiones(): { total: number; fases: FaseAgregada[] } {
  const acc: Record<string, number> = {};
  let total = 0;
  for (const c of CUADRILLAS) {
    for (const tr of c.tramos) {
      if (!FASES_FLUJO.includes(tr.fase)) continue; // "disponible" no cuenta como fase de misión
      const d = tr.to - tr.from;
      acc[tr.fase] = (acc[tr.fase] ?? 0) + d;
      total += d;
    }
  }
  const fases = FASES_FLUJO.map((f) => ({
    fase: f,
    minutos: acc[f] ?? 0,
    pct: total ? Math.round(((acc[f] ?? 0) / total) * 100) : 0,
  }));
  return { total, fases };
}

/* --- Capacidad vs Demanda: series por minuto -------------------------------
   Demanda = cuadrillas que requieren frente (ejecución + espera).
   Capacidad = roster disponible planificado; cae hacia el fin de ventana
   (cambio de turno) y genera la "brecha próxima". Ambas derivadas, deterministas. */
export interface SerieCapDem {
  t: number[];          // minutos
  demanda: number[];
  capacidad: number[];
  brecha: { at: number; faltan: number } | null;
}

export function capacidadDemanda(step = 2): SerieCapDem {
  const t: number[] = [];
  const demanda: number[] = [];
  const capacidad: number[] = [];
  for (let m = 0; m <= WINDOW_MIN; m += step) {
    let dem = 0;
    for (const c of CUADRILLAS) {
      const f = faseAt(c, m);
      if (f === "ejecucion" || f === "espera") dem++;
    }
    // capacidad planificada: 6 estable, baja a 4 en el último tramo (turno)
    let cap = 6;
    if (m >= 108) cap = 5;
    if (m >= 118) cap = 4;
    t.push(m); demanda.push(dem); capacidad.push(cap);
  }
  // primera brecha futura (demanda > capacidad) a partir de ahora
  let brecha: { at: number; faltan: number } | null = null;
  for (let i = 0; i < t.length; i++) {
    if (demanda[i] > capacidad[i]) { brecha = { at: t[i], faltan: demanda[i] - capacidad[i] }; break; }
  }
  return { t, demanda, capacidad, brecha };
}

/* --- Radar: ETA de cada cuadrilla a un frente seleccionado ------------------
   Modo declarado: ETA (minutos). Para cuadrillas en traslado usa el tiempo real
   restante del tramo; para el resto, una estimación estable por distancia. */
export interface BlipRadar {
  id: string;
  rumbo: number;        // grados, 0 = Norte
  etaMin: number;
  fase: Fase;
}

export function radarBlips(now: number, frenteSel: string): BlipRadar[] {
  const frente = FRENTES.find((f) => f.id === frenteSel) ?? FRENTES[0];
  return CUADRILLAS.map((c) => {
    const fase = faseAt(c, now);
    const tr = tramoAt(c, now);
    let eta: number;
    if (fase === "traslado" && tr) eta = Math.max(1, Math.round(tr.to - now));
    else eta = Math.max(3, Math.round(c.distanciaKm * 1.0)); // ~1 min/km estable
    // rumbo del frente propio de la cuadrilla, desviado levemente por el frente foco
    const own = FRENTES.find((f) => f.id === c.frenteId)!;
    const rumbo = (own.rumbo * 0.8 + frente.rumbo * 0.2) % 360;
    return { id: c.id, rumbo, etaMin: Math.min(eta, 30), fase };
  });
}

/* --- Alertas activas al instante `now` ------------------------------------- */
export function alertasActivas(now: number) {
  return ALERTAS.filter((a) => a.at <= now).sort((a, b) => {
    const sev = { alta: 0, media: 1, baja: 2 };
    return sev[a.severidad] - sev[b.severidad] || b.at - a.at;
  });
}
