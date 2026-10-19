/* Panel de investigación · impacto, fuente, responsable, estado; hipótesis
   (separada de los hechos); acciones (reconocer / asignar / resolver con motivo)
   que persisten localmente; bitácora en TIEMPO REAL; y vuelta a la misión. */
import { useState } from "react";
import { useOps } from "../../state/useOps";
import {
  useAlerts, ESTADO_LABEL, ESTADO_COLOR, horaReal, type AccionTipo,
} from "../../state/useAlerts";
import { ALERT_DETAIL } from "../../data/alertas";
import { CUADRILLAS, type Alerta } from "../../data/scenario";
import { IconCheck, IconUserPlus, IconArrow, IconClock } from "../icons";

const RESPONSABLES = ["Coordinación Campo", "Supervisor Turno", "HSE", "Logística"];

const ACC_ICON: Record<AccionTipo, typeof IconCheck> = {
  reconocer: IconCheck, asignar: IconUserPlus, resolver: IconClock,
};
const ACC_LABEL: Record<AccionTipo, string> = {
  reconocer: "Reconocida", asignar: "Responsable asignado", resolver: "Resuelta",
};

export default function AlertInvestigation({ alerta, onVerMision }: { alerta: Alerta; onVerMision: () => void }) {
  const now = useOps((s) => s.now);
  const g = useAlerts((s) => s.gestion[alerta.id]) ?? { estado: "sin_reconocer", bitacora: [] };
  const reconocer = useAlerts((s) => s.reconocer);
  const asignar = useAlerts((s) => s.asignar);
  const resolver = useAlerts((s) => s.resolver);

  const det = ALERT_DETAIL[alerta.id];
  const crew = CUADRILLAS.find((c) => c.id === alerta.cuadrillaId);

  const [modo, setModo] = useState<null | "asignar" | "resolver">(null);
  const [responsable, setResponsable] = useState(RESPONSABLES[0]);
  const [motivo, setMotivo] = useState("");

  const reconocida = g.estado !== "sin_reconocer";
  const resuelta = g.estado === "resuelta";

  return (
    <div className="inv scroll">
      <div className="caps" style={{ marginBottom: 2 }} title="El estado de gestión es el vigente ahora; no retrocede con el replay.">
        Estado de gestión · actual (no depende del replay)
      </div>
      <div className="inv__rows">
        <div className="inv__row"><span className="k">Estado</span>
          <span className="chip chip--sm" style={{ ["--c" as string]: ESTADO_COLOR[g.estado] }}>
            <span className="chip__dot" />{ESTADO_LABEL[g.estado]}
          </span>
        </div>
        <div className="inv__row"><span className="k">Impacto</span><span className="v">{det?.impactoCuadrillas ?? 1} cuadrilla</span></div>
        <div className="inv__row"><span className="k">Fuente</span><span className="v">{det?.fuente ?? "Escenario simulado"}</span></div>
        <div className="inv__row"><span className="k">Responsable</span><span className="v">{g.responsable ?? "Sin asignar"}</span></div>
      </div>

      {/* Hipótesis — claramente separada de los hechos */}
      <div className="hyp">
        <div className="hyp__head">
          <span className="caps" style={{ color: "var(--violet-core)" }}>Hipótesis principal</span>
          <span className="hyp__badge">Requiere validación</span>
        </div>
        <div className="hyp__title">{tituloHipotesis(alerta)}</div>
        <div className="hyp__text">{alerta.hipotesis}</div>
      </div>

      {/* Acciones */}
      <div className="acciones">
        <button className="btn btn--primary" disabled={reconocida} onClick={() => reconocer(alerta.id, now)}>
          {reconocida ? "Reconocida" : "Reconocer"} <IconCheck width={16} height={16} />
        </button>

        {modo !== "asignar" ? (
          <button className="btn" disabled={resuelta} onClick={() => setModo("asignar")}>
            Asignar responsable <IconUserPlus width={16} height={16} />
          </button>
        ) : (
          <div className="inline-form">
            <select value={responsable} onChange={(e) => setResponsable(e.target.value)}>
              {RESPONSABLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <div className="inline-form__row">
              <button className="btn btn--primary" onClick={() => { asignar(alerta.id, responsable, now); setModo(null); }}>Confirmar</button>
              <button className="btn" onClick={() => setModo(null)}>Cancelar</button>
            </div>
          </div>
        )}

        {modo !== "resolver" ? (
          <button className="btn" disabled={resuelta} onClick={() => setModo("resolver")}>
            {resuelta ? "Resuelta" : "Resolver con motivo"} <IconArrow width={16} height={16} />
          </button>
        ) : (
          <div className="inline-form">
            <textarea rows={2} placeholder="Motivo de resolución…" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <div className="inline-form__row">
              <button className="btn btn--primary" disabled={!motivo.trim()} onClick={() => { resolver(alerta.id, motivo.trim(), now); setModo(null); }}>Resolver</button>
              <button className="btn" onClick={() => setModo(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Bitácora de gestión — TIEMPO REAL, no del replay */}
      {g.bitacora.length > 0 && (
        <div>
          <div className="caps" style={{ marginBottom: 8 }}>Bitácora de gestión · hora real</div>
          <div className="bitacora">
            {g.bitacora.map((b, i) => {
              const Icon = ACC_ICON[b.tipo];
              return (
                <div key={i} className="bitacora__row">
                  <Icon width={14} height={14} />
                  <span className="bitacora__note">{ACC_LABEL[b.tipo]}{b.meta ? `: ${b.meta}` : ""}</span>
                  <span className="bitacora__real">{horaReal(b.tsReal)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="inv__footer">
        <button className="btn" onClick={onVerMision}>Ver misión en Pulso <IconArrow width={16} height={16} /></button>
      </div>
    </div>
  );
}

function tituloHipotesis(a: Alerta): string {
  switch (a.tipo) {
    case "espera_prolongada": return "Posible bloqueo de permiso";
    case "desvio": return "Posible corte o condición de camino";
    case "posicion_desactualizada": return "Posible pérdida de telemetría";
  }
}
