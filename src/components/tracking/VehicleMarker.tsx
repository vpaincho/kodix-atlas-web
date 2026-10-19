/* Marcador de vehículo · SUSTITUTO SVG explícito (no es el asset final).
   Vista cenital estilizada de camioneta / camión / maquinaria, orientada por
   rumbo, con haz de luz (ámbar = detenido/trabajando, azul = en movimiento).
   El cuerpo se rota con el rumbo; la etiqueta la pone el mapa, siempre horizontal. */
import type { VehTipo } from "../../data/seguimiento";

export type Beam = "azul" | "ambar" | "none";

const BEAM_COLOR: Record<Exclude<Beam, "none">, string> = { azul: "#8fc4ff", ambar: "#ffd27a" };

function Cuerpo({ tipo, color }: { tipo: VehTipo; color: string }) {
  if (tipo === "camion") {
    return (
      <g>
        <rect x="-7" y="-13" width="14" height="22" rx="2.5" fill="#20242f" stroke={color} strokeWidth="1.4" />
        <rect x="-6" y="-11" width="12" height="7" rx="1.5" fill={color} opacity="0.85" />
        <rect x="-6" y="-2" width="12" height="9" rx="1.5" fill="#2b3040" stroke={color} strokeWidth="0.8" />
      </g>
    );
  }
  if (tipo === "maquinaria") {
    return (
      <g>
        <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#20242f" stroke={color} strokeWidth="1.4" />
        <rect x="-5" y="-6" width="10" height="7" rx="1" fill={color} opacity="0.85" />
        <rect x="-1.4" y="-13" width="2.8" height="7" fill={color} />
        <circle cx="0" cy="-13" r="2.2" fill="#2b3040" stroke={color} strokeWidth="1" />
      </g>
    );
  }
  // camioneta (pickup)
  return (
    <g>
      <rect x="-6" y="-11" width="12" height="20" rx="2.5" fill="#20242f" stroke={color} strokeWidth="1.4" />
      <rect x="-5" y="-9" width="10" height="7" rx="1.5" fill={color} opacity="0.9" />
      <rect x="-5" y="-0.5" width="10" height="8" rx="1.5" fill="#2b3040" stroke={color} strokeWidth="0.7" />
    </g>
  );
}

export default function VehicleMarker({
  tipo, color, heading, beam, selected,
}: { tipo: VehTipo; color: string; heading: number; beam: Beam; selected?: boolean }) {
  const size = selected ? 46 : 38;
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" style={{ transform: `rotate(${heading}deg)`, overflow: "visible" }}>
      {beam !== "none" && (
        <>
          <defs>
            <radialGradient id={`beam-${beam}`} cx="50%" cy="100%" r="90%">
              <stop offset="0%" stopColor={BEAM_COLOR[beam]} stopOpacity="0.55" />
              <stop offset="100%" stopColor={BEAM_COLOR[beam]} stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M-5 -11 L-16 -22 L16 -22 L5 -11 Z" fill={`url(#beam-${beam})`} />
        </>
      )}
      {selected && <circle cx="0" cy="0" r="15" fill="none" stroke="var(--violet-core)" strokeWidth="1.6" opacity="0.7" />}
      <Cuerpo tipo={tipo} color={color} />
    </svg>
  );
}
