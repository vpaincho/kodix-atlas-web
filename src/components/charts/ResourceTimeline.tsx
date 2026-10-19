/* =============================================================================
   Línea de tiempo de recursos · una fila por cuadrilla, segmentos por fase,
   hitos (rombos) y la línea del instante actual. Click en un segmento abre su
   intervalo (se sincroniza con la selección global).
   ========================================================================== */
import { useOps } from "../../state/useOps";
import { faseAt, minToHHMM } from "../../data/derive";
import {
  CUADRILLAS, COLOR_FASE, LABEL_FASE, WINDOW_MIN, type Fase,
} from "../../data/scenario";
import { StatusChip } from "../shell/ui";

const TICKS = [0, 30, 60, 90, 120];
const FASES: Fase[] = ["traslado", "espera", "ejecucion", "retorno"];

export default function ResourceTimeline() {
  const now = useOps((s) => s.now);
  const cuadrillaSel = useOps((s) => s.cuadrillaSel);
  const selCuadrilla = useOps((s) => s.selCuadrilla);
  const selIntervalo = useOps((s) => s.selIntervalo);
  const pct = (m: number) => (m / WINDOW_MIN) * 100;

  return (
    <div className="timeline">
      <div className="tl-head">
        <span>Misión por cuadrilla</span>
        <div className="tl-axis">
          {TICKS.map((t) => (
            <span key={t} className="cd-axis" style={{ left: `${pct(t)}%` }}>{minToHHMM(t)}</span>
          ))}
        </div>
        <span style={{ textAlign: "right" }}>Estado</span>
      </div>

      {CUADRILLAS.map((c) => {
        const fNow = faseAt(c, now);
        const sel = cuadrillaSel === c.id;
        return (
          <div key={c.id} className={`tl-row ${sel ? "tl-row--sel" : ""}`}>
            <div className="tl-crew">
              <span className="tl-crew__dot" style={{ background: COLOR_FASE[fNow] }} />
              <span className="tl-crew__id">{c.id}</span>
              <span className="tl-crew__task">{c.tarea} · {c.frenteId}</span>
            </div>

            <div className="tl-track" role="group" aria-label={`Timeline ${c.id}`}>
              {c.tramos.map((tr, i) => (
                <button
                  key={i}
                  className="seg"
                  style={{
                    left: `${pct(tr.from)}%`,
                    width: `${pct(tr.to - tr.from)}%`,
                    background: COLOR_FASE[tr.fase],
                  }}
                  title={`${LABEL_FASE[tr.fase]} · ${minToHHMM(tr.from)}–${minToHHMM(tr.to)}`}
                  onClick={() => { selCuadrilla(c.id); selIntervalo({ cuadrillaId: c.id, from: tr.from, to: tr.to }); }}
                />
              ))}
              {c.hitos.map((h, i) => (
                <span key={i} className="hito" style={{ left: `${pct(h.at)}%` }} title={h.label} />
              ))}
              <span className="tl-now" style={{ left: `${pct(now)}%` }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <StatusChip fase={fNow} small />
            </div>
          </div>
        );
      })}

      <div className="tl-legend" style={{ marginTop: 12 }}>
        {FASES.map((f) => (
          <span key={f} className="lg"><i style={{ background: COLOR_FASE[f] }} /> {LABEL_FASE[f]}</span>
        ))}
        <span className="lg"><i style={{ background: "var(--violet-core)", width: 9, height: 9, transform: "rotate(45deg)", borderRadius: 1 }} /> Hito</span>
      </div>
    </div>
  );
}
