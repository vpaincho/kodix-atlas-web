/* Raíz: marco + ruteo por pantalla + reloj de replay (único driver de tiempo). */
import { AnimatePresence, motion } from "framer-motion";
import AppFrame from "./components/shell/AppFrame";
import ReplayClock from "./state/ReplayClock";
import PulsoOperativo from "./screens/PulsoOperativo";
import Campo from "./screens/Campo";
import CentroAlertas from "./screens/CentroAlertas";
import Seguimiento from "./screens/Seguimiento";
import Stub from "./screens/Stub";
import { useOps } from "./state/useOps";

export default function App() {
  const pantalla = useOps((s) => s.pantalla);

  const render = () => {
    switch (pantalla) {
      case "operaciones": return <PulsoOperativo />;
      case "campo":       return <Campo />;
      case "seguimiento":
        return <Seguimiento />;
      case "territorio":
        return <Stub titulo="Inteligencia territorial" sub="Distribución de actividad, esperas y cobertura"
          contenido={["selector de capas y períodos", "ranking de zonas", "matriz temporal por zona"]} />;
      case "alertas":
        return <CentroAlertas />;
      default: return <PulsoOperativo />;
    }
  };

  return (
    <>
      <ReplayClock />
      <AppFrame>
        <AnimatePresence mode="wait">
          <motion.div
            key={pantalla}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ height: "100%" }}
          >
            {render()}
          </motion.div>
        </AnimatePresence>
      </AppFrame>
    </>
  );
}
