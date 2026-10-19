/* Fila de KPIs del header de Pulso operativo + tarjeta FOCO OPERATIVO. */
import { useOps } from "../../state/useOps";
import { kpis, estadoCuadrillas, minToHHMM } from "../../data/derive";
import { CUADRILLAS, FRENTES, ALERTAS } from "../../data/scenario";
import { IconUsers, IconRig, IconClock, IconTarget, IconArrow } from "../icons";
import { world } from "../../world/WorldBridge";

export default function KpiRow() {
  const now = useOps((s) => s.now);
  const irA = useOps((s) => s.irA);
  const setCuadrilla = useOps((s) => s.setCuadrilla);
  const selAlerta = useOps((s) => s.selAlerta);
  const k = kpis(now);

  // foco: primera cuadrilla en espera (p. ej. espera de permiso)
  const foco = estadoCuadrillas(now).find((e) => e.fase === "espera");
  const focoCrew = foco?.cuadrilla ?? CUADRILLAS[2];
  const focoFrente = FRENTES.find((f) => f.id === focoCrew.frenteId);

  const abrirFoco = () => {
    // FOCO abre la alerta de esta cuadrilla conservando recurso y tiempo
    const alerta = ALERTAS.find((a) => a.cuadrillaId === focoCrew.id);
    setCuadrilla(focoCrew.id);
    if (alerta) selAlerta(alerta.id);
    world.selectAsset(focoCrew.frenteId);
    irA("alertas");
  };

  return (
    <div className="kpis">
      <div className="kpi">
        <IconUsers className="kpi__icon" />
        <div><div className="kpi__val num">{k.cuadrillas}</div><div className="kpi__lbl">cuadrillas</div></div>
      </div>
      <div className="kpi">
        <IconRig className="kpi__icon" />
        <div><div className="kpi__val num">{k.frentesActivos}</div><div className="kpi__lbl">frentes activos</div></div>
      </div>
      <div className="kpi">
        <IconClock className="kpi__icon" />
        <div><div className="kpi__val num">{k.esperas}</div><div className="kpi__lbl">esperas</div></div>
      </div>
      <div className="kpi">
        <div><div className="kpi__val mono" style={{ fontSize: 16 }}>08:00–{minToHHMM(now)}</div><div className="kpi__lbl">ventana operativa</div></div>
      </div>

      <div className="kpi kpi--foco">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconTarget className="kpi__icon" />
          <div>
            <div className="caps foco__k">Foco operativo</div>
            <div style={{ fontWeight: 650, marginTop: 2 }}>
              {focoCrew.tarea === "Reparación" ? "Espera de permiso" : "Espera prolongada"} · {focoFrente?.nombre}
            </div>
          </div>
        </div>
        <button className="foco__btn" onClick={abrirFoco}>
          Inspeccionar <IconArrow width={15} height={15} />
        </button>
      </div>
    </div>
  );
}
