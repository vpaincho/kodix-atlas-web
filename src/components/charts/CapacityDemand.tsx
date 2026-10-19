/* =============================================================================
   Capacidad vs Demanda · área = demanda operativa, línea = capacidad disponible.
   Marca el instante actual y anota la primera "brecha próxima" (demanda>capacidad).
   ========================================================================== */
import { useMemo } from "react";
import { useOps } from "../../state/useOps";
import { capacidadDemanda, minToHHMM } from "../../data/derive";
import { WINDOW_MIN } from "../../data/scenario";

const W = 640, H = 220, PAD_L = 28, PAD_R = 16, PAD_T = 14, PAD_B = 26;
const Y_MAX = 8;

export default function CapacityDemand() {
  const now = useOps((s) => s.now);
  const serie = useMemo(() => capacidadDemanda(2), []);

  const ix = (m: number) => PAD_L + (m / WINDOW_MIN) * (W - PAD_L - PAD_R);
  const iy = (v: number) => PAD_T + (1 - v / Y_MAX) * (H - PAD_T - PAD_B);

  const demandArea = useMemo(() => {
    let d = `M ${ix(serie.t[0])} ${iy(0)}`;
    serie.t.forEach((t, i) => (d += ` L ${ix(t)} ${iy(serie.demanda[i])}`));
    d += ` L ${ix(serie.t[serie.t.length - 1])} ${iy(0)} Z`;
    return d;
  }, [serie]);

  const capLine = useMemo(() => {
    // escalonada
    let d = `M ${ix(serie.t[0])} ${iy(serie.capacidad[0])}`;
    for (let i = 1; i < serie.t.length; i++) {
      d += ` L ${ix(serie.t[i])} ${iy(serie.capacidad[i - 1])} L ${ix(serie.t[i])} ${iy(serie.capacidad[i])}`;
    }
    return d;
  }, [serie]);

  const nowX = ix(now);
  const gap = serie.brecha;

  return (
    <div className="cd-wrap">
      <svg className="cd-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Capacidad frente a demanda">
        <defs>
          <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(167,116,255,0.45)" />
            <stop offset="100%" stopColor="rgba(167,116,255,0.05)" />
          </linearGradient>
        </defs>

        {/* grilla horizontal */}
        {[0, 2, 4, 6, 8].map((v) => (
          <g key={v}>
            <line className="cd-grid" x1={PAD_L} y1={iy(v)} x2={W - PAD_R} y2={iy(v)} />
            <text className="cd-axis" x={PAD_L - 6} y={iy(v) + 3} textAnchor="end">{v}</text>
          </g>
        ))}
        {/* eje x */}
        {[0, 20, 40, 60, 80, 100, 120].map((m) => (
          <text key={m} className="cd-axis" x={ix(m)} y={H - 8} textAnchor="middle">{minToHHMM(m)}</text>
        ))}

        {/* zona de brecha (demanda > capacidad) */}
        {gap && (
          <rect className="cd-gap" x={ix(gap.at)} y={PAD_T} width={W - PAD_R - ix(gap.at)} height={H - PAD_T - PAD_B} />
        )}

        <path className="cd-demand" d={demandArea} />
        <path className="cd-capacity" d={capLine} />

        {/* instante actual */}
        <line className="cd-now" x1={nowX} y1={PAD_T} x2={nowX} y2={H - PAD_B} />
        <text className="cd-axis" x={nowX} y={PAD_T - 2} textAnchor="middle" fill="var(--violet-core)">{minToHHMM(now)}</text>

        {/* anotación de brecha */}
        {gap && (
          <text className="cd-gap-lbl" x={ix(gap.at) + 8} y={PAD_T + 16}>
            Brecha próxima · +{gap.faltan} {gap.faltan === 1 ? "cuadrilla" : "cuadrillas"} ({minToHHMM(gap.at)})
          </text>
        )}
      </svg>
    </div>
  );
}
