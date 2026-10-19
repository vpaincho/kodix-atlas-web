/* =============================================================================
   Pantalla 2 · Seguimiento de cuadrillas. Lista + mapa demo + detalle, sobre el
   mismo escenario, selección global y replay compartido.
   ========================================================================== */
import { lazy, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { Panel } from "../components/shell/ui";
import ResourceList from "../components/tracking/ResourceList";
import TrackingMap from "../components/tracking/TrackingMap";
const TrackingScene3D = lazy(() => import("../components/tracking/TrackingScene3D"));
import ResourceDetail from "../components/tracking/ResourceDetail";
import { useOps } from "../state/useOps";
import { TRACKS } from "../data/seguimiento";
import "../styles/seguimiento.css";

export default function Seguimiento() {
  const cuadrillaSel = useOps((s) => s.cuadrillaSel);
  const setCuadrilla = useOps((s) => s.setCuadrilla);
  const render = useOps((s) => s.segRender);

  const sel = TRACKS.find((t) => t.id === cuadrillaSel) ? cuadrillaSel : TRACKS[0].id;
  useEffect(() => { if (!cuadrillaSel) setCuadrilla(TRACKS[0].id); }, [cuadrillaSel, setCuadrilla]);

  return (
    <div className="screen screen--tracking">
      <div className="screen__head">
        <div className="screen__titles">
          <h1 className="screen__title">Seguimiento de cuadrillas</h1>
          <p className="screen__sub">Movilidad, estado y progreso · replay compartido</p>
        </div>
        <span style={{ marginLeft: "auto" }} className="demo-badge">Escenario demo</span>
      </div>

      <div className="seg__grid">
        <div className="seg__col"><ResourceList /></div>
        <div className="seg__col">{render === "3d" ? <Suspense fallback={<div className="tmap" role="status">Preparando escena 3D…</div>}><TrackingScene3D /></Suspense> : <TrackingMap />}</div>
        <motion.div className="seg__col" key={sel} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <Panel title="Detalle del recurso"><ResourceDetail id={sel!} /></Panel>
        </motion.div>
      </div>
    </div>
  );
}
