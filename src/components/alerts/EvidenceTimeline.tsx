/* Cronología de evidencia · HECHOS en la línea de simulación (no acciones de
   gestión). Sincronizada con el replay: los puntos ya ocurridos (at<=now) van
   llenos; click en un punto salta el replay a ese instante. Resalta la evidencia
   del nodo seleccionado en el grafo. */
import { useOps } from "../../state/useOps";
import { minToHHMM } from "../../data/derive";
import { WINDOW_MIN } from "../../data/scenario";
import { ALERT_DETAIL } from "../../data/alertas";

export default function EvidenceTimeline({
  alertId, nodeSel,
}: { alertId: string; nodeSel: string | null }) {
  const now = useOps((s) => s.now);
  const setNow = useOps((s) => s.setNow);
  const pause = useOps((s) => s.pause);
  const det = ALERT_DETAIL[alertId];
  if (!det) return null;

  const resaltados = nodeSel ? new Set(det.evidenciaPorNodo[nodeSel] ?? []) : null;
  const pct = (m: number) => (m / WINDOW_MIN) * 100;
  const saltar = (at: number) => { pause(); setNow(at); };

  return (
    <div className="evts">
      <div className="evts__line">
        <div className="evts__rail" />
        <div className="evts__now" style={{ left: `${pct(now)}%` }} />
        {det.evidencia.map((ev) => {
          const past = ev.at <= now;
          const sel = resaltados?.has(ev.at);
          const dim = resaltados && !sel;
          return (
            <button
              key={ev.at}
              className={`evdot ${past ? "evdot--past" : ""} ${sel ? "evdot--sel" : ""} ${dim ? "evdot--dim" : ""}`}
              style={{ left: `${pct(ev.at)}%` }}
              onClick={() => saltar(ev.at)}
              title={`Saltar a ${minToHHMM(ev.at)} · ${ev.titulo}`}
            >
              <span className="evdot__c" />
              <span className="evdot__t">{minToHHMM(ev.at)}</span>
            </button>
          );
        })}
      </div>

      <div className="ev-detail">
        {det.evidencia.map((ev) => {
          const future = ev.at > now;
          const sel = resaltados?.has(ev.at);
          return (
            <div key={ev.at} className={`ev-item ${sel ? "ev-item--sel" : ""} ${future ? "ev-item--future" : ""}`}>
              <div className="ev-item__h">
                <span className="ev-item__t">{ev.titulo}</span>
                <span className="ev-item__clock">{minToHHMM(ev.at)}</span>
              </div>
              <div className="ev-item__d">{ev.detalle}</div>
              <div className="ev-item__src">Fuente: {ev.fuente}{future ? " · (aún no ocurre)" : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
