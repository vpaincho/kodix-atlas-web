/* Grafo de relaciones del evento. Nodos con halo, aristas documentadas (línea
   llena violeta) vs hipotéticas (punteada gris). Seleccionar un nodo resalta
   sus conexiones y su evidencia (vía onNode -> el padre sincroniza la cronología). */
import { ALERT_DETAIL, type NodoTipo } from "../../data/alertas";

const VB_W = 560, VB_H = 340;
const COLOR_TIPO: Record<NodoTipo, string> = {
  cuadrilla: "var(--violet)",
  frente: "var(--blue)",
  permiso: "var(--amber)",
  evento: "var(--grey)",
};

export default function EventGraph({
  alertId, nodeSel, onNode,
}: { alertId: string; nodeSel: string | null; onNode: (id: string | null) => void }) {
  const det = ALERT_DETAIL[alertId];
  if (!det) return null;
  const { nodos, aristas } = det.grafo;
  const px = (n: { x: number; y: number }) => ({ x: n.x * VB_W, y: n.y * VB_H });
  const byId = Object.fromEntries(nodos.map((n) => [n.id, n]));

  return (
    <div className="graph-wrap">
      <div className="graph-legend">
        <span className="lg"><span className="ln" /> Documentada</span>
        <span className="lg"><span className="ln ln--hip" /> Hipótesis</span>
      </div>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label="Grafo de relaciones del evento">
        {/* aristas */}
        {aristas.map((e, i) => {
          const a = px(byId[e.from]), b = px(byId[e.to]);
          const on = nodeSel && (e.from === nodeSel || e.to === nodeSel);
          const cls = e.tipo === "documentada" ? "gedge gedge--doc" : "gedge gedge--hip";
          return <line key={i} className={`${cls} ${on ? "gedge--on" : ""}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
        {/* nodos */}
        {nodos.map((n) => {
          const p = px(n);
          const sel = nodeSel === n.id;
          return (
            <g
              key={n.id}
              className={`gnode ${sel ? "gnode--sel" : ""}`}
              style={{ ["--c" as string]: COLOR_TIPO[n.tipo] }}
              onClick={() => onNode(sel ? null : n.id)}
              role="button" tabIndex={0}
              aria-label={n.label}
            >
              <circle className="gnode__halo" cx={p.x} cy={p.y} r={26} />
              <circle className="gnode__core" cx={p.x} cy={p.y} r={13} />
              <text className="gnode__lbl" x={p.x} y={p.y - 20} textAnchor="middle">{n.label}</text>
              {n.sub && <text className="gnode__sub" x={p.x} y={p.y + 30} textAnchor="middle">{n.sub}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
