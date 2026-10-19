/* Detalle del recurso · pestañas Trayecto / Eventos / Estado. Respeta las reglas
   de datos: detención GPS ≠ espera, última posición + antigüedad, método de
   ETA/distancia, distancia recorrida (hasta cursor) ≠ total planificada. */
import { useState } from "react";
import { useOps } from "../../state/useOps";
import { minToHHMM } from "../../data/derive";
import {
  trackDe, eventosDe, distanciaHasta, distanciaTotal, posicionEn, movilidad,
  MOVILIDAD_LABEL, MOVILIDAD_COLOR, WAYPOINTS, type EventoTrack,
} from "../../data/seguimiento";
import { CUADRILLAS, ALERTAS } from "../../data/scenario";
import { IconTruck, IconArrow } from "../icons";

type Tab = "trayecto" | "eventos" | "estado";

export default function ResourceDetail({ id }: { id: string }) {
  const now = useOps((s) => s.now);
  const setNow = useOps((s) => s.setNow);
  const pause = useOps((s) => s.pause);
  const selAlerta = useOps((s) => s.selAlerta);
  const irA = useOps((s) => s.irA);
  const [tab, setTab] = useState<Tab>("trayecto");

  const tr = trackDe(id); const c = CUADRILLAS.find((x) => x.id === id);
  if (!tr || !c) return null;

  const mov = movilidad(tr, now);
  const eventos = eventosDe(tr, now);
  const dRec = distanciaHasta(tr, now);
  const dTot = distanciaTotal(tr);
  const pos = posicionEn(tr, now);
  const detencionTotal = eventos.filter((e) => e.tipo === "detencion").reduce((a, e) => a + (e.durMin ?? 0), 0);
  const alerta = ALERTAS.find((a) => a.cuadrillaId === id && a.at <= now);

  const saltar = (t: number) => { pause(); setNow(t); };

  return (
    <div className="rdetail">
      <div className="rdetail__head">
        <span className="rdetail__veh"><IconTruck width={26} height={26} /></span>
        <div style={{ flex: 1 }}>
          <div className="rdetail__id">{c.id} · {c.tarea}</div>
          <div className="rdetail__pat">Patente {tr.patente}{tr.sinMision ? " · sin misión" : ` · ${c.frenteId}`}</div>
        </div>
        <span className="chip chip--sm" style={{ ["--c" as string]: MOVILIDAD_COLOR[mov] }}>
          <span className="chip__dot" />{MOVILIDAD_LABEL[mov]}
        </span>
      </div>

      <div className="tabs">
        {(["trayecto", "eventos", "estado"] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            {t === "trayecto" ? "Trayecto" : t === "eventos" ? "Eventos" : "Estado"}
          </button>
        ))}
      </div>

      <div className="rdetail__body scroll">
        {tab === "trayecto" && (
          <>
            <EventosLista eventos={eventos.filter((e) => e.tipo !== "detencion" || true)} now={now} onJump={saltar} compact />
            <div className="metrics">
              <div className="metric">
                <span className="k">Distancia recorrida <small>hasta el cursor</small></span>
                <span className="v num">{dRec.toFixed(1)} km <small>de {dTot.toFixed(1)} km plan.</small></span>
              </div>
              <div className="metric">
                <span className="k">Detención total <small>GPS · no implica espera</small></span>
                <span className="v num">{detencionTotal} min</span>
              </div>
              <div className="metric">
                <span className="k">Última posición <small>{pos.interpolada ? "interpolación demo" : "waypoint observado"}</small></span>
                <span className="v">
                  {pos.desactualizada
                    ? <span className="stale">desactualizada · {pos.antiguedadMin} min</span>
                    : <>{minToHHMM(now)} <small>{(pos.x).toFixed(3)}, {(pos.y).toFixed(3)} (demo)</small></>}
                </span>
              </div>
            </div>
          </>
        )}

        {tab === "eventos" && <EventosLista eventos={eventos} now={now} onJump={saltar} />}

        {tab === "estado" && (
          <div className="metrics">
            <div className="metric"><span className="k">Misión vinculada</span><span className="v">{tr.sinMision ? "— (recurso vacío)" : `${c.tarea} · ${c.frenteId}`}</span></div>
            <div className="metric"><span className="k">Origen</span><span className="v">{WAYPOINTS[tr.origen].label}</span></div>
            <div className="metric"><span className="k">Destino</span><span className="v">{WAYPOINTS[tr.ruta[tr.ruta.length - 1].wp].label}</span></div>
            <div className="metric">
              <span className="k">ETA</span>
              <span className="v">{mov === "traslado" ? "~ estimada" : "no aplica"} <small><span className="badge-method">método: ruta demo</span></small></span>
            </div>
            <div className="metric">
              <span className="k">Distancia</span>
              <span className="v num">{dRec.toFixed(1)} / {dTot.toFixed(1)} km <small><span className="badge-method">recorrida / total plan.</span></small></span>
            </div>
            <div className="metric">
              <span className="k">Última posición</span>
              <span className="v">{pos.desactualizada ? <span className="stale">última conocida · {pos.antiguedadMin} min</span> : "vigente"} </span>
            </div>
          </div>
        )}

        <div className="linkrow">
          {alerta && (
            <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => { selAlerta(alerta.id); irA("alertas"); }}>
              Abrir alerta relacionada <IconArrow width={15} height={15} />
            </button>
          )}
          <button className="btn" style={{ flex: alerta ? "0 0 auto" : 1 }} onClick={() => irA("operaciones")}>Ver en Pulso</button>
        </div>
      </div>
    </div>
  );
}

function EventosLista({ eventos, now, onJump, compact }: { eventos: EventoTrack[]; now: number; onJump: (t: number) => void; compact?: boolean }) {
  const list = compact ? eventos.filter((e) => e.tipo !== "detencion") : eventos;
  return (
    <div className="trk">
      {list.map((e, i) => {
        const future = e.t > now;
        return (
          <div key={i} className={`trk__item ${future ? "trk__item--future" : ""}`}>
            <span className={`trk__dot ${future ? "trk__dot--future" : ""}`} />
            <div className="trk__t">{minToHHMM(e.t)}</div>
            <div className="trk__title">
              {e.label}{e.durMin ? ` · ${e.durMin} min` : ""}
              {!future && <span className="jump" onClick={() => onJump(e.t)}>saltar ⟶</span>}
            </div>
            <div className="trk__d">{e.detalle}{future ? " · (aún no ocurre)" : ""}</div>
          </div>
        );
      })}
    </div>
  );
}
