/* Barra superior: marca, navegación entre pantallas, reloj (hora AR) y avatar. */
import { useOps, type Pantalla } from "../../state/useOps";
import { useAlerts } from "../../state/useAlerts";
import { minToHHMM, alertasActivas } from "../../data/derive";
import {
  IconCampo, IconSeguimiento, IconTerritorio, IconOperaciones, IconAlertas,
} from "../icons";
import { motion } from "framer-motion";

const TABS: { id: Pantalla; label: string; Icon: typeof IconCampo }[] = [
  { id: "campo", label: "Campo", Icon: IconCampo },
  { id: "seguimiento", label: "Seguimiento", Icon: IconSeguimiento },
  { id: "territorio", label: "Territorio", Icon: IconTerritorio },
  { id: "operaciones", label: "Operaciones", Icon: IconOperaciones },
  { id: "alertas", label: "Alertas", Icon: IconAlertas },
];

export default function TopNav() {
  const pantalla = useOps((s) => s.pantalla);
  const irA = useOps((s) => s.irA);
  const now = useOps((s) => s.now);
  const gestion = useAlerts((s) => s.gestion);
  // pendientes = alertas ya ocurridas (en simulación) y aún sin resolver
  const pend = alertasActivas(now).filter(
    (a) => (gestion[a.id]?.estado ?? "sin_reconocer") !== "resuelta"
  ).length;

  return (
    <header className="topbar frame__topbar">
      <div className="brand">
        <div className="brand__logo">K</div>
        <div>
          <div className="brand__name">KODIX <b>ATLAS</b></div>
          <div className="brand__kicker">Centro de Operaciones</div>
        </div>
      </div>

      <nav className="nav">
        {TABS.map(({ id, label, Icon }) => {
          const active = pantalla === id;
          return (
            <button
              key={id}
              className={`nav__item ${active ? "nav__item--active" : ""}`}
              onClick={() => irA(id)}
              aria-current={active ? "page" : undefined}
            >
              <Icon width={16} height={16} />
              {label}
              {id === "alertas" && pend > 0 && <span className="nav__badge num">{pend}</span>}
              {active && <motion.span layoutId="nav-underline" className="nav__underline" />}
            </button>
          );
        })}
      </nav>

      <div className="topbar__right">
        <span className="demo-badge">Demo</span>
        <span className="clock mono">{minToHHMM(now)}</span>
        <div className="avatar">AR</div>
      </div>
    </header>
  );
}
