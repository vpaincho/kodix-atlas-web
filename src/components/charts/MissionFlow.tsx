/* =============================================================================
   Flujo operacional de misiones · el ANCHO de cada banda = % del tiempo total
   de las cuadrillas en esa fase (derivado de las fases, no fijo).
   ========================================================================== */
import { flujoMisiones } from "../../data/derive";
import { COLOR_FASE, LABEL_FASE, CUADRILLAS, type Fase } from "../../data/scenario";

function fmtTiempo(min: number) {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h > 0 ? `~ ${h}h ${String(m).padStart(2, "0")}m` : `~ ${m} min`;
}

export default function MissionFlow() {
  const { fases } = flujoMisiones();
  // tiempo promedio por cuadrilla en cada fase (para la etiqueta inferior)
  const porCuadrilla = (min: number) => min / CUADRILLAS.length;

  return (
    <div>
      <div className="flow">
        <div className="flow__count">
          <b className="num">{CUADRILLAS.length}</b>
          <span>cuadrillas</span>
        </div>
        <div className="flow__bands">
          {fases.map((f) => (
            <div
              key={f.fase}
              className="band"
              style={{ flex: `${Math.max(f.pct, 6)} 1 0`, background: bandBg(f.fase) }}
              title={`${LABEL_FASE[f.fase]} · ${f.pct}%`}
            >
              <span className="band__pct num">{f.pct}%</span>
              <span className="band__name">{LABEL_FASE[f.fase]}</span>
              <span className="band__time">{fmtTiempo(porCuadrilla(f.minutos))}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flow__legend">
        {fases.map((f) => (
          <span key={f.fase} className="lg">
            <i style={{ background: COLOR_FASE[f.fase] }} /> {LABEL_FASE[f.fase]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* degradado suave por fase para dar volumen (brief: degradados con volumen) */
function bandBg(fase: Fase) {
  const c = COLOR_FASE[fase];
  return `linear-gradient(180deg, color-mix(in srgb, ${c} 92%, white 8%), color-mix(in srgb, ${c} 74%, black 26%))`;
}
