/* =============================================================================
   Superficie DEMO de seguimiento (esquema 2D en SVG; NO es geografía validada
   ni motor de mapa real). Rutas luminosas con núcleo + cuerpo + halo y chevrons
   de dirección (decorativos, NO velocidad medida). Vehículos orientados por
   rumbo. Cámara que encuadra y sigue al recurso (Motion). Respeta huecos GPS.
   ========================================================================== */
import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useOps } from "../../state/useOps";
import { world } from "../../world/WorldBridge";
import {
  TRACKS, WAYPOINTS, posicionEn, movilidad, rumboEn, MOVILIDAD_COLOR,
  type ResourceTrack,
} from "../../data/seguimiento";
import { CUADRILLAS } from "../../data/scenario";
import { faseAt, tramoAt, minToHHMM } from "../../data/derive";
import VehicleMarker, { type Beam } from "./VehicleMarker";

type Px = { w: number; h: number };
type Seg = { d: string; kind: "ejecutado" | "retorno"; state: "exec" | "plan"; mid?: { x: number; y: number; ang: number } };

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

/** geometría de la ruta en píxeles, curvada y partida por el cursor */
function segmentos(tr: ResourceTrack, now: number, sz: Px): Seg[] {
  const out: Seg[] = [];
  const P = (wp: string) => ({ x: WAYPOINTS[wp].x * sz.w, y: WAYPOINTS[wp].y * sz.h });
  for (let i = 1; i < tr.ruta.length; i++) {
    const a = P(tr.ruta[i - 1].wp), b = P(tr.ruta[i].wp);
    const t0 = tr.ruta[i - 1].t, t1 = tr.ruta[i].t;
    const ret = tr.ruta[i].kind === "retorno";
    // control de curva (perpendicular, determinista por segmento)
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const amp = ((hash(tr.id + i) % 100) / 100 - 0.5) * 0.22 * len;
    const cx = mx + (-dy / len) * amp, cy = my + (dx / len) * amp;
    const ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const full = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
    if (ret) { out.push({ d: full, kind: "retorno", state: now >= t1 ? "exec" : "plan", mid: { x: cx, y: cy, ang } }); continue; }
    if (now >= t1) out.push({ d: full, kind: "ejecutado", state: "exec", mid: { x: cx, y: cy, ang } });
    else if (now <= t0) out.push({ d: full, kind: "ejecutado", state: "plan" });
    else {
      const f = (now - t0) / Math.max(1, t1 - t0);
      const px = a.x + (b.x - a.x) * f, py = a.y + (b.y - a.y) * f;
      const c1x = a.x + (cx - a.x) * f, c1y = a.y + (cy - a.y) * f;
      out.push({ d: `M ${a.x} ${a.y} Q ${c1x} ${c1y} ${px} ${py}`, kind: "ejecutado", state: "exec", mid: { x: (a.x + px) / 2, y: (a.y + py) / 2, ang } });
      out.push({ d: `M ${px} ${py} Q ${cx} ${cy} ${b.x} ${b.y}`, kind: "ejecutado", state: "plan" });
    }
  }
  return out;
}

export default function TrackingMap() {
  const now = useOps((s) => s.now);
  const cuadrillaSel = useOps((s) => s.cuadrillaSel);
  const setCuadrilla = useOps((s) => s.setCuadrilla);
  const capas = useOps((s) => s.segCapas);
  const toggleCapa = useOps((s) => s.toggleSegCapa);
  const seguir = useOps((s) => s.segSeguir);
  const toggleSeguir = useOps((s) => s.toggleSeguir);
  const setSegRender = useOps((s) => s.setSegRender);

  const ref = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState<Px>({ w: 820, h: 520 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setSz({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const setCapaWorld = (id: string) => { toggleCapa(id); world.setLayerVisible(id, !capas[id]); };
  const onSeguir = () => { toggleSeguir(); world.followResource(!seguir ? cuadrillaSel : null); };

  const mostrar = capas.trayectorias ? TRACKS : TRACKS.filter((t) => t.id === cuadrillaSel);

  // cámara: encuadra/sigue al recurso seleccionado
  const selTrack = TRACKS.find((t) => t.id === cuadrillaSel);
  const selPos = selTrack ? posicionEn(selTrack, now) : null;
  const scale = seguir && selPos ? 1.4 : 1;
  const camX = seguir && selPos ? sz.w / 2 - selPos.x * sz.w * scale : 0;
  const camY = seguir && selPos ? sz.h / 2 - selPos.y * sz.h * scale : 0;

  // relieve esquemático (curvas de nivel + caminos), memorizado por tamaño
  const terreno = useMemo(() => {
    const curvas: string[] = [];
    const rnd = (seed: number) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x); };
    for (let k = 0; k < 7; k++) {
      const cx = rnd(k + 1) * sz.w, cy = rnd(k + 9) * sz.h, r = 40 + rnd(k + 3) * 120;
      curvas.push(`M ${cx - r} ${cy} C ${cx - r} ${cy - r * 0.7}, ${cx + r} ${cy - r * 0.7}, ${cx + r} ${cy} S ${cx - r} ${cy + r * 0.7}, ${cx - r} ${cy} Z`);
    }
    return curvas;
  }, [sz.w, sz.h]);

  const px = (nx: number, ny: number) => ({ x: nx * sz.w, y: ny * sz.h });

  return (
    <div className="tmap" ref={ref}>
      {/* controles (fijos, fuera de la cámara) */}
      <div className="tmap__top">
        <div className="tmap__toggles">
          {[["trayectorias", "Trayectorias"], ["detenciones", "Detenciones"], ["geocercas", "Geocercas"]].map(([id, l]) => (
            <button key={id} className={capas[id] ? "on" : ""} onClick={() => setCapaWorld(id)}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="tscene__switch">
            <button onClick={() => setSegRender("3d")}>3D</button>
            <button className="on" disabled>2D</button>
          </div>
          <button className="tmap__seguir" onClick={onSeguir}>Seguir <span className={`switch ${seguir ? "on" : ""}`} /></button>
        </div>
      </div>

      {/* mundo (se mueve con la cámara) */}
      <motion.div
        animate={{ x: camX, y: camY, scale }}
        transition={{ type: "spring", stiffness: 110, damping: 22 }}
        style={{ position: "absolute", inset: 0, transformOrigin: "0 0" }}
      >
        <svg width={sz.w} height={sz.h} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
            <filter id="halo-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
          </defs>

          {/* relieve */}
          <g opacity="0.5">{terreno.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(120,130,160,0.10)" strokeWidth="1" />)}</g>
          {/* caminos (base gris de todas las rutas) */}
          {TRACKS.map((tr) => segmentos(tr, 120, sz).map((s, i) => (
            <path key={tr.id + "road" + i} d={s.d} fill="none" stroke="rgba(150,160,185,0.16)" strokeWidth="6" strokeLinecap="round" />
          )))}

          {/* rutas por recurso */}
          {mostrar.map((tr) => {
            const sel = tr.id === cuadrillaSel;
            return segmentos(tr, now, sz).map((s, i) => {
              const key = tr.id + i;
              if (s.kind === "retorno") {
                return <path key={key} d={s.d} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeDasharray="7 6" opacity={sel ? 0.85 : 0.3} strokeLinecap="round" />;
              }
              if (s.state === "plan") {
                return <path key={key} d={s.d} fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeDasharray="7 7" opacity={sel ? 0.55 : 0.2} strokeLinecap="round" />;
              }
              // ejecutado: halo + cuerpo + núcleo
              const op = sel ? 1 : 0.42;
              return (
                <g key={key} opacity={op}>
                  <path d={s.d} fill="none" stroke="var(--violet)" strokeWidth={sel ? 15 : 10} strokeLinecap="round" filter="url(#halo)" opacity="0.5" />
                  <path d={s.d} fill="none" stroke="var(--violet)" strokeWidth={sel ? 5 : 3.5} strokeLinecap="round" filter="url(#halo-s)" />
                  <path d={s.d} fill="none" stroke="#EDE4FF" strokeWidth={sel ? 1.8 : 1.2} strokeLinecap="round" />
                  {sel && s.mid && (
                    <g transform={`translate(${s.mid.x} ${s.mid.y}) rotate(${s.mid.ang})`}>
                      <path className="chev" d="M -4 2 L 0 -3 L 4 2" fill="none" stroke="#EDE4FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}
                </g>
              );
            });
          })}

          {/* geocercas */}
          {capas.geocercas && selTrack && (() => {
            const w = WAYPOINTS[selTrack.ruta[selTrack.ruta.length - 1].wp];
            const p = px(w.x, w.y);
            return <circle cx={p.x} cy={p.y} r={46} fill="rgba(88,159,240,0.06)" stroke="var(--blue)" strokeWidth="1.2" strokeDasharray="4 4" />;
          })()}
          {/* detenciones */}
          {capas.detenciones && TRACKS.filter((t) => movilidad(t, now) === "espera").map((t) => {
            const p = posicionEn(t, now); const q = px(p.x, p.y);
            return <circle key={t.id} className="stop-ring" cx={q.x} cy={q.y} r={16} />;
          })}
        </svg>

        {/* overlay: waypoints (pads) */}
        {Object.values(WAYPOINTS).map((w) => {
          const p = px(w.x, w.y);
          return (
            <div key={w.id} style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 2 }}>
              <div style={{ width: 9, height: 9, background: "#141926", border: "1.5px solid var(--border)", borderRadius: 2 }} />
              <div style={{ position: "absolute", left: 12, top: -3, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", whiteSpace: "nowrap", letterSpacing: "0.03em" }}>{w.label}</div>
            </div>
          );
        })}

        {/* overlay: vehículos + detención */}
        {mostrar.map((tr) => {
          const c = CUADRILLAS.find((x) => x.id === tr.id)!;
          const p = posicionEn(tr, now); const q = px(p.x, p.y);
          const mov = movilidad(tr, now);
          const sel = tr.id === cuadrillaSel;
          const beam: Beam = p.desactualizada ? "none" : mov === "traslado" ? "azul" : mov === "disponible" ? "none" : "ambar";
          const heading = rumboEn(tr, now);
          const fase = faseAt(c, now); const tramo = tramoAt(c, now);
          const enEspera = fase === "espera" && tramo;
          return (
            <div key={tr.id} style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(-50%,-50%) scale(${1 / scale})`, zIndex: sel ? 7 : 4 }}>
              <button onClick={() => setCuadrilla(tr.id)} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", display: "block", transform: "translate(-50%,-50%)", position: "absolute", left: 0, top: 0 }} title={`${c.id} · ${mov}`}>
                {p.desactualizada && <span style={{ position: "absolute", left: "50%", top: "50%", width: 30, height: 30, transform: "translate(-50%,-50%)", border: "1.5px dashed var(--amber)", borderRadius: "50%" }} />}
                <VehicleMarker tipo={tr.veh} color={MOVILIDAD_COLOR[mov]} heading={heading} beam={beam} selected={sel} />
              </button>
              <div style={{ position: "absolute", left: "50%", top: -24, transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", textShadow: "0 1px 3px #000, 0 0 8px #000", pointerEvents: "none" }}>
                {c.id}{p.desactualizada ? <span className="stale"> · {p.antiguedadMin}m</span> : null}
              </div>
              {enEspera && (capas.detenciones || sel) && (
                <div className="stop-pill" style={{ position: "absolute", left: "50%", top: -42, transform: "translateX(-50%)" }}>
                  {Math.round(now - tramo!.from)} min
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* brújula + escala + etiquetas (fijos) */}
      <div className="tmap__compass" aria-hidden>
        <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="var(--panel-translu)" stroke="var(--border-soft)" /><path d="M20 6 L23 20 L20 17 L17 20 Z" fill="var(--violet)" /><text x="20" y="14" textAnchor="middle" fontSize="8" fill="var(--text-2)" fontWeight="700">N</text></svg>
      </div>
      <div className="tmap__place">Yacimiento Zona Cero · Golfo San Jorge</div>
      <div className="tmap__scale"><span>0</span><span className="bar" /><span>2 km</span></div>

      <span className="tmap__tag demo-badge">Superficie demo · esquema 2D, recorridos interpolados (no validados)</span>
      <div className="tmap__legend">
        <span className="lg"><span className="ln" /> Ejecutado</span>
        <span className="lg"><span className="ln ln--plan" /> Planificado</span>
        <span className="lg"><span className="ln ln--ret" /> Retorno</span>
      </div>
    </div>
  );
}
