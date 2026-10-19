/* =============================================================================
   Gestión de alertas · reconocer / asignar / resolver, con PERSISTENCIA local.
   -----------------------------------------------------------------------------
   REGLA TEMPORAL (clave): el tiempo de los HECHOS (evidencia) vive en la línea
   de simulación (minutos, controlada por el replay). El tiempo de las ACCIONES
   de gestión vive en tiempo REAL (Date.now) y es independiente del replay:
   reconocer ahora NO se dibuja como un evento del pasado al retroceder el cursor.
   Por eso la bitácora guarda `tsReal` (reloj real) y, solo como referencia, el
   `simNow` del replay en que se ejecutó — pero el estado persiste pase lo que
   pase con el cursor.
   ========================================================================== */
import { create } from "zustand";

export type EstadoAlerta = "sin_reconocer" | "reconocida" | "resuelta";
export type AccionTipo = "reconocer" | "asignar" | "resolver";

export interface AccionGestion {
  tipo: AccionTipo;
  tsReal: number;      // Date.now() — tiempo real de gestión
  simNow: number;      // minuto del replay en que se hizo (referencia, no se grafica)
  meta?: string;       // responsable / motivo
}

export interface GestionAlerta {
  estado: EstadoAlerta;
  responsable?: string;
  motivo?: string;
  bitacora: AccionGestion[];
}

interface AlertsState {
  gestion: Record<string, GestionAlerta>;
  reconocer: (id: string, simNow: number) => void;
  asignar: (id: string, responsable: string, simNow: number) => void;
  resolver: (id: string, motivo: string, simNow: number) => void;
  resetDemo: () => void;
  estadoDe: (id: string) => GestionAlerta;
}

const LS_KEY = "kodix.alerts.v1";
const vacio = (): GestionAlerta => ({ estado: "sin_reconocer", bitacora: [] });

function cargar(): Record<string, GestionAlerta> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage no disponible: arrancamos limpio */ }
  return {};
}
function guardar(g: Record<string, GestionAlerta>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(g)); } catch { /* ignorar */ }
}

export const useAlerts = create<AlertsState>((set, get) => ({
  gestion: cargar(),

  estadoDe: (id) => get().gestion[id] ?? vacio(),

  reconocer: (id, simNow) =>
    set((s) => {
      const g = { ...s.gestion };
      const cur = g[id] ?? vacio();
      if (cur.estado === "sin_reconocer") {
        g[id] = {
          ...cur, estado: "reconocida",
          bitacora: [...cur.bitacora, { tipo: "reconocer", tsReal: Date.now(), simNow }],
        };
        guardar(g);
      }
      return { gestion: g };
    }),

  asignar: (id, responsable, simNow) =>
    set((s) => {
      const g = { ...s.gestion };
      const cur = g[id] ?? vacio();
      const estado: EstadoAlerta = cur.estado === "sin_reconocer" ? "reconocida" : cur.estado;
      g[id] = {
        ...cur, estado, responsable,
        bitacora: [...cur.bitacora, { tipo: "asignar", tsReal: Date.now(), simNow, meta: responsable }],
      };
      guardar(g);
      return { gestion: g };
    }),

  resolver: (id, motivo, simNow) =>
    set((s) => {
      const g = { ...s.gestion };
      const cur = g[id] ?? vacio();
      g[id] = {
        ...cur, estado: "resuelta", motivo,
        bitacora: [...cur.bitacora, { tipo: "resolver", tsReal: Date.now(), simNow, meta: motivo }],
      };
      guardar(g);
      return { gestion: g };
    }),

  resetDemo: () => { try { localStorage.removeItem(LS_KEY); } catch { /* ignorar */ } set({ gestion: {} }); },
}));

export const ESTADO_LABEL: Record<EstadoAlerta, string> = {
  sin_reconocer: "Sin reconocer",
  reconocida: "Reconocida",
  resuelta: "Resuelta",
};
export const ESTADO_COLOR: Record<EstadoAlerta, string> = {
  sin_reconocer: "var(--amber)",
  reconocida: "var(--blue)",
  resuelta: "var(--green)",
};

/** hora real "HH:MM" para la bitácora de gestión (no es tiempo de simulación) */
export function horaReal(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
