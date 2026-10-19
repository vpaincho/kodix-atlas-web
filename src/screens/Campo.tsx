/* Campo operativo · incluye la superficie reservada al futuro mundo geográfico.
   La superficie es un ADAPTADOR DEMO rotulado; su posición NO es geografía
   validada (brief). Los controles reales (capas, encuadre) ya quedan cableados
   al WorldBridge para cuando llegue el transporte a Unreal. */
import { Panel } from "../components/shell/ui";
import { useOps } from "../state/useOps";
import { world } from "../world/WorldBridge";
import { FRENTES } from "../data/scenario";

const CAPAS = [
  { id: "pozos", label: "Pozos" },
  { id: "rutas", label: "Rutas operativas" },
  { id: "esperas", label: "Esperas" },
  { id: "cobertura", label: "Cobertura" },
  { id: "incidentes", label: "Incidentes" },
];

export default function Campo() {
  const capas = useOps((s) => s.capas);
  const toggleCapa = useOps((s) => s.toggleCapa);
  const frenteSel = useOps((s) => s.frenteSel);
  const selFrente = useOps((s) => s.selFrente);

  const setCapa = (id: string) => { toggleCapa(id); world.setLayerVisible(id, !capas[id]); };
  const encuadrar = (id: string) => { selFrente(id); world.focusAsset(id); };

  return (
    <div className="screen">
      <div className="screen__head">
        <div className="screen__titles">
          <h1 className="screen__title">Campo operativo</h1>
          <p className="screen__sub">Cuenca Golfo San Jorge · Patagonia Argentina</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, height: "calc(100% - 70px)" }}>
        <div className="world-surface">
          <div className="world-surface__tag demo-badge">Superficie demo · no es geografía validada</div>
          <div className="world-surface__hint">
            Superficie reservada al mundo geográfico (Unreal + Cesium).<br />
            El contrato de integración ya está activo mediante un adaptador demo:
            seleccionar activo, centrar, mostrar/ocultar capa y establecer instante.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          <Panel title="Capas de terreno">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CAPAS.map((c) => (
                <label key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: "var(--fs-body)" }}>
                  {c.label}
                  <input type="checkbox" checked={!!capas[c.id]} onChange={() => setCapa(c.id)} />
                </label>
              ))}
            </div>
          </Panel>
          <Panel title="Encuadre rápido" subtitle="Centrar cámara en un frente">
            <div className="frente-pills" style={{ flexWrap: "wrap" }}>
              {FRENTES.map((f) => (
                <button key={f.id} className={frenteSel === f.id ? "active" : ""} onClick={() => encuadrar(f.id)}>
                  {f.id}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
