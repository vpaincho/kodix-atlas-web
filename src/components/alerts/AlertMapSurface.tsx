/* Superficie geográfica DEMO para la alerta. No es geografía validada: usa el
   WorldBridge (adaptador demo) para pedir selección y encuadre del frente. El
   mundo real es responsabilidad del desarrollo en Unreal. */
import { useEffect } from "react";
import { world } from "../../world/WorldBridge";
import { CUADRILLAS, type Alerta } from "../../data/scenario";

export default function AlertMapSurface({ alerta }: { alerta: Alerta }) {
  const crew = CUADRILLAS.find((c) => c.id === alerta.cuadrillaId);

  // Al cambiar de alerta, pedimos al mundo (demo) centrar el frente y seleccionar el activo.
  useEffect(() => {
    world.focusAsset(alerta.frenteId);
    world.selectAsset(alerta.frenteId);
  }, [alerta.id, alerta.frenteId]);

  return (
    <div className="amap">
      <span className="amap__tag demo-badge">Superficie demo · posición no validada</span>
      <div className="amap__title">Frente {alerta.frenteId}<br />Neuquén · Patagonia</div>
      <svg viewBox="0 0 640 230" preserveAspectRatio="xMidYMid slice" aria-label="Zona de impacto de la alerta (demo)">
        {/* caminos estilizados */}
        <path d="M-10 170 C 150 120, 300 190, 650 110" stroke="var(--border)" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M120 240 C 200 150, 260 120, 420 30" stroke="var(--border)" strokeWidth="1.5" fill="none" opacity="0.4" />
        {/* instalaciones */}
        <g fill="var(--text-3)">
          <rect x="150" y="150" width="7" height="7" /><rect x="470" y="150" width="7" height="7" />
          <rect x="520" y="95" width="7" height="7" />
        </g>
        {/* zona de impacto */}
        <circle cx="400" cy="120" r="74" fill="rgba(247,189,67,0.10)" stroke="var(--amber)" strokeWidth="1.4" strokeDasharray="5 5" />
        {/* cuadrilla */}
        <g transform="translate(400 120)">
          <circle r="11" fill="var(--violet)" stroke="#10131b" strokeWidth="2" />
          <circle r="20" fill="none" stroke="var(--violet-040)" strokeWidth="1" />
          <text x="18" y="4" fill="var(--text)" fontSize="12" fontWeight={650}>{crew?.id}</text>
        </g>
      </svg>
      <div className="amap__legend">
        <span className="lg"><i style={{ background: "var(--violet)" }} /> Cuadrilla</span>
        <span className="lg"><i style={{ background: "transparent", border: "1px dashed var(--amber)" }} /> Zona de impacto</span>
        <span className="lg"><i style={{ background: "var(--text-3)", borderRadius: 2 }} /> Instalaciones</span>
      </div>
    </div>
  );
}
