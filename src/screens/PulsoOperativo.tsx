/* =============================================================================
   Pantalla 1 · Pulso operativo (alta fidelidad, con replay funcional).
   ========================================================================== */
import { motion } from "framer-motion";
import { Panel } from "../components/shell/ui";
import KpiRow from "../components/charts/KpiRow";
import ResponseRadar from "../components/charts/ResponseRadar";
import CapacityDemand from "../components/charts/CapacityDemand";
import MissionFlow from "../components/charts/MissionFlow";
import ResourceTimeline from "../components/charts/ResourceTimeline";
import { useOps } from "../state/useOps";
import { FRENTES } from "../data/scenario";
import { world } from "../world/WorldBridge";
import "../styles/charts.css";
import "../styles/screens.css";

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export default function PulsoOperativo() {
  const frenteSel = useOps((s) => s.frenteSel);
  const selFrente = useOps((s) => s.selFrente);

  const elegirFrente = (id: string) => { selFrente(id); world.focusAsset(id); };

  return (
    <div className="screen">
      <div className="screen__head">
        <div className="screen__titles">
          <h1 className="screen__title">Pulso operativo</h1>
          <p className="screen__sub">Coordinación de recursos · Cuencas patagónicas</p>
        </div>
        <KpiRow />
      </div>

      <div className="pulso__grid">
        <motion.div {...fade}>
          <Panel
            title="Radar de respuesta"
            subtitle="ETA estimada hacia el frente seleccionado"
            right={
              <div className="frente-pills" role="group" aria-label="Frente foco">
                {FRENTES.slice(0, 4).map((f) => (
                  <button
                    key={f.id}
                    className={frenteSel === f.id ? "active" : ""}
                    onClick={() => elegirFrente(f.id)}
                  >
                    {f.id}
                  </button>
                ))}
              </div>
            }
          >
            <ResponseRadar />
          </Panel>
        </motion.div>

        <div className="pulso__right">
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.05 }}>
            <Panel title="Capacidad / Demanda" subtitle="Evolución de recursos en frentes activos">
              <CapacityDemand />
            </Panel>
          </motion.div>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.1 }}>
            <Panel title="Flujo operacional de misiones" subtitle="Distribución de tiempo de las cuadrillas">
              <MissionFlow />
            </Panel>
          </motion.div>
        </div>
      </div>

      <motion.div {...fade} transition={{ ...fade.transition, delay: 0.14 }}>
        <Panel title="Línea de tiempo de recursos" subtitle="Misiones por cuadrilla · eventos e intervalos">
          <ResourceTimeline />
        </Panel>
      </motion.div>
    </div>
  );
}
