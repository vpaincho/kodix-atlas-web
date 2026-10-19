/* =============================================================================
   Radar de respuesta · modo declarado: ETA (minutos) hacia el frente foco.
   Anillos a 10/20/30 min. Las cuadrillas se ubican por rumbo y ETA.
   Click en un blip = seleccionar cuadrilla (se sincroniza con todo + el mundo).
   ========================================================================== */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useOps } from "../../state/useOps";
import { radarBlips } from "../../data/derive";
import { world } from "../../world/WorldBridge";

const CX = 200, CY = 192, RMAX = 150, ETA_MAX = 30;
const RINGS = [10, 20, 30];

function pos(rumbo: number, eta: number) {
  const r = (Math.min(eta, ETA_MAX) / ETA_MAX) * RMAX;
  const a = (rumbo - 0) * (Math.PI / 180); // 0 = Norte (arriba)
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
}

export default function ResponseRadar() {
  const now = useOps((s) => s.now);
  const frenteSel = useOps((s) => s.frenteSel);
  const cuadrillaSel = useOps((s) => s.cuadrillaSel);
  const selCuadrilla = useOps((s) => s.selCuadrilla);
  const reduce = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const blips = useMemo(() => radarBlips(now, frenteSel), [now, frenteSel]);

  const pick = (id: string, frenteId: string) => {
    selCuadrilla(id);
    world.selectAsset(frenteId);
  };

  return (
    <div className="radar-wrap">
      <div className="radar-legend">
        <span className="lg"><i style={{ background: "var(--green)" }} /> Disponible</span>
        <span className="lg"><i style={{ background: "var(--violet)" }} /> En servicio</span>
        <span className="lg"><i style={{ background: "var(--grey)" }} /> Sin asignar</span>
      </div>
      <svg className="radar-svg" viewBox="0 0 400 384" role="img" aria-label="Radar de respuesta por ETA">
        <defs>
          <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(167,116,255,0.0)" />
            <stop offset="70%" stopColor="rgba(167,116,255,0.10)" />
            <stop offset="100%" stopColor="rgba(167,116,255,0.28)" />
          </radialGradient>
        </defs>

        {/* anillos */}
        {RINGS.map((min) => (
          <circle key={min} className="radar-ring" cx={CX} cy={CY} r={(min / ETA_MAX) * RMAX} />
        ))}
        {/* cruces N-S / E-O */}
        <line className="radar-cross" x1={CX} y1={CY - RMAX} x2={CX} y2={CY + RMAX} />
        <line className="radar-cross" x1={CX - RMAX} y1={CY} x2={CX + RMAX} y2={CY} />

        {/* sector barriendo */}
        {!reduce && (
          <motion.g
            style={{ originX: `${CX}px`, originY: `${CY}px` }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 7 }}
          >
            <path className="radar-sweep" d={`M${CX},${CY} L${CX},${CY - RMAX} A${RMAX},${RMAX} 0 0 1 ${CX + RMAX * Math.sin(Math.PI / 4)},${CY - RMAX * Math.cos(Math.PI / 4)} Z`} />
          </motion.g>
        )}

        {/* etiquetas de anillo */}
        {RINGS.map((min) => (
          <text key={min} className="radar-ringlbl" x={CX + 4} y={CY - (min / ETA_MAX) * RMAX + 12}>{min} min</text>
        ))}

        {/* direcciones */}
        <text className="radar-dir" x={CX} y={CY - RMAX - 10} textAnchor="middle">NORTE</text>
        <text className="radar-dir" x={CX} y={CY + RMAX + 20} textAnchor="middle">SUR</text>
        <text className="radar-dir" x={CX + RMAX + 8} y={CY + 4} textAnchor="start">ESTE</text>
        <text className="radar-dir" x={CX - RMAX - 8} y={CY + 4} textAnchor="end">OESTE</text>

        {/* centro: plataforma */}
        <circle cx={CX} cy={CY} r={13} fill="var(--violet-016)" stroke="var(--violet-040)" />
        <path d={`M${CX} ${CY - 7} L${CX - 5} ${CY + 6} L${CX + 5} ${CY + 6} Z`} fill="var(--violet-core)" />

        {/* blips */}
        {blips.map((b) => {
          const { x, y } = pos(b.rumbo, b.etaMin);
          const color = b.fase === "disponible" ? "var(--green)" : "var(--violet)";
          const sel = cuadrillaSel === b.id;
          const crew = b.id;
          const frenteId = b.id; // placeholder, se pasa el frente real abajo
          return (
            <g
              key={b.id}
              className={`blip ${sel ? "blip--sel" : ""}`}
              style={{ ["--c" as string]: color }}
              onClick={() => pick(crew, lookupFrente(b.id))}
              role="button"
              tabIndex={0}
              aria-label={`${b.id}, ETA ${b.etaMin} minutos`}
            >
              <circle className="blip__halo" cx={x} cy={y} r={17} />
              <circle className="blip__core" cx={x} cy={y} r={6.5} />
              <text className="blip__lbl" x={x + 11} y={y - 3}>{b.id}</text>
              <text className="blip__eta" x={x + 11} y={y + 10}>{b.etaMin} min</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* el frente real de cada cuadrilla (para pasar a selectAsset) */
import { CUADRILLAS } from "../../data/scenario";
function lookupFrente(crewId: string): string {
  return CUADRILLAS.find((c) => c.id === crewId)?.frenteId ?? crewId;
}
