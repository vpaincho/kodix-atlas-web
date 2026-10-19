import VehiclePortrait from "./VehiclePortrait";
/* Listado de recursos · búsqueda, filtros y conteos derivados del mismo
   escenario. La selección usa la identidad global (cuadrillaSel). */
import { useOps } from "../../state/useOps";
import { Panel } from "../shell/ui";
import { IconTruck, IconSearch, IconPin } from "../icons";
import { world } from "../../world/WorldBridge";
import {
  TRACKS, WAYPOINTS, movilidad, MOVILIDAD_LABEL, MOVILIDAD_COLOR, posicionEn, type Movilidad,
} from "../../data/seguimiento";
import { CUADRILLAS } from "../../data/scenario";
import { motion } from "framer-motion";

const FILTROS: { id: string; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "en_servicio", label: "En servicio" },
  { id: "traslado", label: "Traslado" },
  { id: "espera", label: "En espera" },
  { id: "disponible", label: "Disponible" },
];
const ORDEN: Movilidad[] = ["en_servicio", "traslado", "espera", "disponible"];

function ubicacionTexto(id: string, now: number): string {
  const tr = TRACKS.find((t) => t.id === id)!;
  const c = CUADRILLAS.find((x) => x.id === id)!;
  const mov = movilidad(tr, now);
  if (mov === "traslado") return `→ ${c.frenteId}`;
  const p = posicionEn(tr, now);
  // waypoint más cercano a la posición actual (demo)
  let best = tr.ruta[0].wp, bd = 1e9;
  for (const rp of tr.ruta) { const w = WAYPOINTS[rp.wp]; const d = Math.hypot(w.x - p.x, w.y - p.y); if (d < bd) { bd = d; best = rp.wp; } }
  return WAYPOINTS[best].label;
}

export default function ResourceList() {
  const now = useOps((s) => s.now);
  const cuadrillaSel = useOps((s) => s.cuadrillaSel);
  const setCuadrilla = useOps((s) => s.setCuadrilla);
  const query = useOps((s) => s.segQuery);
  const setQuery = useOps((s) => s.setSegQuery);
  const filtro = useOps((s) => s.segFiltro);
  const setFiltro = useOps((s) => s.setSegFiltro);

  const conMov = TRACKS.map((t) => ({ t, c: CUADRILLAS.find((x) => x.id === t.id)!, mov: movilidad(t, now) }));
  const totales = ORDEN.map((m) => ({ m, n: conMov.filter((r) => r.mov === m).length }));

  const visibles = conMov.filter(({ t, c, mov }) => {
    if (filtro !== "todos" && mov !== filtro) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${c.id} ${c.tarea} ${t.patente} ${c.frenteId}`.toLowerCase().includes(q);
  });

  const abrir = (id: string, frenteId: string) => { setCuadrilla(id); world.selectAsset(frenteId); };

  return (
    <Panel title="Recursos" right={<span className="demo-badge">{visibles.length}</span>} className="rlist">
      <div className="rlist__search">
        <IconSearch width={16} height={16} />
        <input aria-label="Buscar recurso" placeholder="Buscar recurso…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="rlist__filtros">
        {FILTROS.map((f) => (
          <button key={f.id} className={`fpill ${filtro === f.id ? "fpill--on" : ""}`} onClick={() => setFiltro(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="rlist__scroll scroll">
        {visibles.length === 0 && <div className="empty">Sin recursos para este filtro.</div>}
        {visibles.map(({ t, c, mov }) => {
          const sel = cuadrillaSel === c.id;
          return (
            <motion.button key={c.id} layout aria-pressed={sel} className={`rcard ${sel ? "rcard--sel" : ""}`} onClick={() => abrir(c.id, c.frenteId)}>
              <span className="rcard__veh"><VehiclePortrait type={t.veh} /></span>
              <span>
                <span className="rcard__id">{c.id} · {c.tarea}{t.sinMision ? " (vacío)" : ""}</span>
                <span className="rcard__sub"><IconPin width={12} height={12} /> {ubicacionTexto(c.id, now)}</span>
              </span>
              <span className="rcard__estado" style={{ color: MOVILIDAD_COLOR[mov] }}>
                <i style={{ background: MOVILIDAD_COLOR[mov] }} />{MOVILIDAD_LABEL[mov]}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="rtotals">
        <div className="rtotals__big num">{TRACKS.length}<span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>recursos</span></div>
        {totales.map(({ m, n }) => (
          <div key={m} className="rtotals__row">
            <span className="lbl"><i style={{ background: MOVILIDAD_COLOR[m] }} />{MOVILIDAD_LABEL[m]}</span>
            <span className="num" style={{ fontWeight: 700 }}>{n}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
