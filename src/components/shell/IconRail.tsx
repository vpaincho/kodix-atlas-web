/* Rail vertical de accesos. El ítem activo se sincroniza con la pantalla. */
import { useOps, type Pantalla } from "../../state/useOps";
import {
  IconGrid, IconCampo, IconActivos, IconOperaciones, IconPlan, IconReportes, IconConfig,
} from "../icons";

type RailItem = { key: string; label: string; Icon: typeof IconGrid; pantalla?: Pantalla };

const ITEMS: RailItem[] = [
  { key: "vista", label: "Vista", Icon: IconGrid },
  { key: "campo", label: "Campo", Icon: IconCampo, pantalla: "campo" },
  { key: "activos", label: "Activos", Icon: IconActivos },
  { key: "ops", label: "Ops", Icon: IconOperaciones, pantalla: "operaciones" },
  { key: "plan", label: "Plan", Icon: IconPlan },
  { key: "rep", label: "Reportes", Icon: IconReportes },
  { key: "cfg", label: "Config", Icon: IconConfig },
];

export default function IconRail() {
  const pantalla = useOps((s) => s.pantalla);
  const irA = useOps((s) => s.irA);
  return (
    <aside className="rail frame__rail">
      {ITEMS.map(({ key, label, Icon, pantalla: p }) => {
        const active = p ? pantalla === p : false;
        return (
          <button
            key={key}
            className={`rail__item ${active ? "rail__item--active" : ""}`}
            onClick={() => p && irA(p)}
            title={label}
          >
            <Icon />
            <span className="rail__label">{label}</span>
          </button>
        );
      })}
    </aside>
  );
}
