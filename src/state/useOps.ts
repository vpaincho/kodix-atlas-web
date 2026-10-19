/* =============================================================================
   Store compartido (zustand) · única fuente de TIEMPO y de SELECCIÓN.
   Todas las pantallas leen de acá: seleccionar una cuadrilla la resalta en
   todos lados; mover el cursor del replay actualiza métricas y gráficos.
   Una animación decorativa NUNCA escribe acá.
   ========================================================================== */
import { create } from "zustand";
import { DEFAULT_NOW, WINDOW_MIN, ALERTAS } from "../data/scenario";

export type Pantalla = "campo" | "seguimiento" | "territorio" | "operaciones" | "alertas";
export type Velocidad = 1 | 2 | 4;

interface OpsState {
  /** instante actual en minutos desde 08:00 (0..120) */
  now: number;
  playing: boolean;
  velocidad: Velocidad;

  pantalla: Pantalla;

  /** selección compartida */
  cuadrillaSel: string | null;
  frenteSel: string;           // frente foco del radar
  alertaSel: string | null;
  intervaloSel: { cuadrillaId: string; from: number; to: number } | null;

  /** alertas reconocidas (ids) */
  reconocidas: Set<string>;

  /** capas visibles (contrato con el mundo) */
  capas: Record<string, boolean>;

  /** estado de vista de Seguimiento (se conserva al navegar) */
  segQuery: string;
  segFiltro: string;            // "todos" | movilidad
  segSeguir: boolean;           // seguir al recurso seleccionado
  segCapas: Record<string, boolean>; // trayectorias / detenciones / geocercas
  segRender: "2d" | "3d";       // adaptador visual del mapa (SVG 2D | escena 3D)

  /* acciones */
  setNow: (m: number) => void;
  tick: (dtMin: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVelocidad: (v: Velocidad) => void;
  irA: (p: Pantalla) => void;
  selCuadrilla: (id: string | null) => void;   // alterna (click en radar/timeline)
  setCuadrilla: (id: string | null) => void;    // fija sin alternar (flujos programáticos)
  selFrente: (id: string) => void;
  selAlerta: (id: string | null) => void;
  selIntervalo: (i: OpsState["intervaloSel"]) => void;
  reconocer: (id: string) => void;
  toggleCapa: (id: string) => void;
  setSegQuery: (q: string) => void;
  setSegFiltro: (f: string) => void;
  toggleSeguir: () => void;
  toggleSegCapa: (id: string) => void;
  setSegRender: (r: "2d" | "3d") => void;
}

export const useOps = create<OpsState>((set, get) => ({
  now: DEFAULT_NOW,
  playing: false,
  velocidad: 1,
  pantalla: "operaciones",

  cuadrillaSel: null,
  frenteSel: "E-1000",
  alertaSel: null,
  intervaloSel: null,

  reconocidas: new Set<string>(),
  capas: { pozos: true, rutas: true, esperas: true, cobertura: false, incidentes: false },

  segQuery: "",
  segFiltro: "todos",
  segSeguir: false,
  segCapas: { trayectorias: true, detenciones: false, geocercas: false },
  segRender: "3d",

  setNow: (m) => set({ now: Math.max(0, Math.min(WINDOW_MIN, m)) }),

  tick: (dtMin) => {
    const { now, playing } = get();
    if (!playing) return;
    let next = now + dtMin;
    if (next >= WINDOW_MIN) { next = WINDOW_MIN; set({ now: next, playing: false }); return; }
    set({ now: next });
  },

  play: () => set((s) => ({ playing: s.now >= WINDOW_MIN ? s.playing : true })),
  pause: () => set({ playing: false }),
  togglePlay: () => set((s) => ({ playing: s.now >= WINDOW_MIN ? false : !s.playing })),
  setVelocidad: (v) => set({ velocidad: v }),
  irA: (p) => set({ pantalla: p }),
  selCuadrilla: (id) => set((s) => ({ cuadrillaSel: s.cuadrillaSel === id ? null : id })),
  setCuadrilla: (id) => set({ cuadrillaSel: id }),
  selFrente: (id) => set({ frenteSel: id }),
  selAlerta: (id) => set({ alertaSel: id }),
  selIntervalo: (i) => set({ intervaloSel: i }),
  reconocer: (id) =>
    set((s) => {
      const n = new Set(s.reconocidas); n.add(id); return { reconocidas: n };
    }),
  toggleCapa: (id) => set((s) => ({ capas: { ...s.capas, [id]: !s.capas[id] } })),
  setSegQuery: (q) => set({ segQuery: q }),
  setSegFiltro: (f) => set({ segFiltro: f }),
  toggleSeguir: () => set((s) => ({ segSeguir: !s.segSeguir })),
  toggleSegCapa: (id) => set((s) => ({ segCapas: { ...s.segCapas, [id]: !s.segCapas[id] } })),
  setSegRender: (r) => set({ segRender: r }),
}));

/** cantidad de alertas no reconocidas al instante actual (para el badge del nav) */
export function alertasPendientes(now: number, reconocidas: Set<string>): number {
  return ALERTAS.filter((a) => a.at <= now && !reconocidas.has(a.id)).length;
}
