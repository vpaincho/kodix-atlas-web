/* =============================================================================
   Pantalla 5 · Centro de alertas. Lista priorizada + investigación + grafo de
   relaciones + cronología de evidencia, todo sobre el escenario demo y conectado
   al Pulso (FOCO entra acá; "Ver misión" vuelve conservando recurso y tiempo).
   ========================================================================== */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Panel } from "../components/shell/ui";
import AlertList from "../components/alerts/AlertList";
import AlertMapSurface from "../components/alerts/AlertMapSurface";
import EventGraph from "../components/alerts/EventGraph";
import EvidenceTimeline from "../components/alerts/EvidenceTimeline";
import AlertInvestigation from "../components/alerts/AlertInvestigation";
import { useOps } from "../state/useOps";
import { useAlerts } from "../state/useAlerts";
import { alertasActivas } from "../data/derive";
import { ALERTAS } from "../data/scenario";
import "../styles/alerts.css";

export default function CentroAlertas() {
  const now = useOps((s) => s.now);
  const alertaSel = useOps((s) => s.alertaSel);
  const selAlerta = useOps((s) => s.selAlerta);
  const setCuadrilla = useOps((s) => s.setCuadrilla);
  const irA = useOps((s) => s.irA);
  const resetDemo = useAlerts((s) => s.resetDemo);

  const [nodeSel, setNodeSel] = useState<string | null>(null);

  const activas = alertasActivas(now);
  // alerta efectiva: la seleccionada si sigue activa, si no la primera activa
  const efectiva = ALERTAS.find((a) => a.id === alertaSel && activas.some((x) => x.id === a.id))
    ?? activas[0] ?? null;

  // si no hay selección, fijamos la primera activa
  useEffect(() => {
    if (!alertaSel && efectiva) selAlerta(efectiva.id);
  }, [alertaSel, efectiva, selAlerta]);

  // al cambiar de alerta, limpiamos el nodo resaltado del grafo
  useEffect(() => { setNodeSel(null); }, [efectiva?.id]);

  const verMision = () => {
    if (efectiva) setCuadrilla(efectiva.cuadrillaId);
    irA("operaciones"); // el tiempo global se conserva
  };

  return (
    <div className="screen">
      <div className="screen__head">
        <div className="screen__titles">
          <h1 className="screen__title">Centro de alertas</h1>
          <p className="screen__sub">Detección, análisis e investigación de eventos</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="demo-badge">Escenario demo</span>
          <button className="btn" style={{ width: "auto" }} onClick={resetDemo}>Reiniciar escenario</button>
        </div>
      </div>

      {efectiva ? (
        <div className="alertas__grid">
          <div className="alertas__col"><AlertList /></div>

          <div className="alertas__center">
            <AlertMapSurface alerta={efectiva} />
            <Panel title="Relaciones del evento" subtitle="Correlación · causa por confirmar">
              <EventGraph alertId={efectiva.id} nodeSel={nodeSel} onNode={setNodeSel} />
            </Panel>
            <Panel title="Evidencia cronológica" subtitle="Hechos en la línea de tiempo · click para saltar el replay">
              <EvidenceTimeline alertId={efectiva.id} nodeSel={nodeSel} />
            </Panel>
          </div>

          <motion.div
            className="alertas__col"
            key={efectiva.id}
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
          >
            <Panel title="Investigación" className="inv-panel" pad>
              <AlertInvestigation alerta={efectiva} onVerMision={verMision} />
            </Panel>
          </motion.div>
        </div>
      ) : (
        <div className="stub"><div className="stub__card">
          <div className="demo-badge stub__badge">Sin alertas</div>
          <h2>No hay alertas en este instante</h2>
          <p>Avanzá el replay para ver los eventos a medida que ocurren.</p>
        </div></div>
      )}
    </div>
  );
}
