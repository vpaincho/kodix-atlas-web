/* Lista priorizada de alertas · tarjetas con tipo, severidad, recurso, frente,
   hora y estado. El contador del header = alertas no resueltas visibles al
   instante actual (hechos ya ocurridos en la simulación). */
import { useOps } from "../../state/useOps";
import { useAlerts, ESTADO_LABEL, ESTADO_COLOR } from "../../state/useAlerts";
import { alertasActivas } from "../../data/derive";
import { CUADRILLAS, type Alerta } from "../../data/scenario";
import { minToHHMM } from "../../data/derive";
import { Panel } from "../shell/ui";
import { IconClock, IconRoute, IconSignal } from "../icons";
import { world } from "../../world/WorldBridge";
import { motion } from "framer-motion";

const ICON: Record<Alerta["tipo"], typeof IconClock> = {
  espera_prolongada: IconClock,
  desvio: IconRoute,
  posicion_desactualizada: IconSignal,
};
const SEV_CLASS = { alta: "sev--alta", media: "sev--media", baja: "sev--baja" } as const;
const SEV_LABEL = { alta: "Alta", media: "Media", baja: "Baja" } as const;

export default function AlertList() {
  const now = useOps((s) => s.now);
  const alertaSel = useOps((s) => s.alertaSel);
  const selAlerta = useOps((s) => s.selAlerta);
  const setCuadrilla = useOps((s) => s.setCuadrilla);
  const gestion = useAlerts((s) => s.gestion);

  const activas = alertasActivas(now);
  const pendientes = activas.filter((a) => (gestion[a.id]?.estado ?? "sin_reconocer") !== "resuelta").length;

  const abrir = (a: Alerta) => {
    selAlerta(a.id);
    setCuadrilla(a.cuadrillaId);
    world.selectAsset(a.frenteId);
  };

  return (
    <Panel
      title="Priorizadas"
      right={<span className="demo-badge">{pendientes} activas</span>}
      className="alist"
    >
      <div className="alist__scroll scroll">
        {activas.length === 0 && <div className="empty">Sin alertas en este instante.</div>}
        {activas.map((a) => {
          const Icon = ICON[a.tipo];
          const estado = gestion[a.id]?.estado ?? "sin_reconocer";
          const crew = CUADRILLAS.find((c) => c.id === a.cuadrillaId);
          const sel = alertaSel === a.id;
          return (
            <motion.button
              key={a.id}
              layout
              className={`acard ${sel ? "acard--sel" : ""}`}
              onClick={() => abrir(a)}
            >
              <div className="acard__top">
                <div className="acard__tag">
                  <span className="acard__icn" style={{ background: "color-mix(in srgb, var(--amber) 16%, transparent)", color: "var(--amber)" }}>
                    <Icon width={17} height={17} />
                  </span>
                  <span className="demo-badge">Demo</span>
                </div>
                <span className="acard__time">{minToHHMM(a.at)}</span>
              </div>
              <div className="acard__title">{a.titulo}</div>
              <div className="acard__meta">
                {crew?.id} · {crew?.tarea} — Frente {a.frenteId}
              </div>
              <div className="acard__foot">
                <span className={`sev ${SEV_CLASS[a.severidad]}`}>{SEV_LABEL[a.severidad]}</span>
                <span className="chip chip--sm" style={{ ["--c" as string]: ESTADO_COLOR[estado] }}>
                  <span className="chip__dot" />{ESTADO_LABEL[estado]}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </Panel>
  );
}
