/* Barra de replay inferior — control ÚNICO del tiempo global.
   Play/pausa, velocidad y scrub mantienen sincronizadas todas las pantallas. */
import { useRef } from "react";
import { useOps, type Velocidad } from "../../state/useOps";
import { minToHHMM } from "../../data/derive";
import { WINDOW_MIN } from "../../data/scenario";
import { IconPlay, IconPause } from "../icons";

const SPEEDS: Velocidad[] = [1, 2, 4];
const TICKS = [0, 60, 120]; // 08:00, 09:00, 10:00

export default function ReplayBar() {
  const now = useOps((s) => s.now);
  const playing = useOps((s) => s.playing);
  const velocidad = useOps((s) => s.velocidad);
  const togglePlay = useOps((s) => s.togglePlay);
  const setVelocidad = useOps((s) => s.setVelocidad);
  const setNow = useOps((s) => s.setNow);
  const pause = useOps((s) => s.pause);
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = (now / WINDOW_MIN) * 100;

  const scrubTo = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setNow(ratio * WINDOW_MIN);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pause();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    scrubTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 1) scrubTo(e.clientX);
  };

  return (
    <footer className="replay frame__replay">
      <div className="replay__title">
        <span className="caps">Replay operativo</span>
        <span className="replay__date">Hoy · escenario demo</span>
      </div>

      <button className="replay__btn" onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproducir"}>
        {playing ? <IconPause /> : <IconPlay />}
      </button>

      <div className="speeds" role="group" aria-label="Velocidad">
        {SPEEDS.map((v) => (
          <button key={v} className={velocidad === v ? "active" : ""} onClick={() => setVelocidad(v)}>
            {v}x
          </button>
        ))}
      </div>

      <div className="scrub">
        <div
          className="scrub__track"
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={WINDOW_MIN}
          aria-valuenow={Math.round(now)}
          aria-label="Línea de tiempo"
          aria-valuetext={minToHHMM(now)}
          onKeyDown={(e) => {
            const values: Record<string, number> = { ArrowLeft: now - 1, ArrowRight: now + 1, PageDown: now - 10, PageUp: now + 10, Home: 0, End: WINDOW_MIN };
            if (e.key in values) { e.preventDefault(); pause(); setNow(values[e.key]); }
          }}
          tabIndex={0}
        >
          <div className="scrub__rail" />
          <div className="scrub__fill" style={{ width: `${pct}%` }} />
          <div className="scrub__head" style={{ left: `${pct}%` }} />
        </div>
        <div className="scrub__ticks mono">
          {TICKS.map((t) => <span key={t}>{minToHHMM(t)}</span>)}
        </div>
      </div>

      <div className="replay__now mono">{minToHHMM(now)}</div>

      <div className="replay__src">
        <span className="dot" /> Datos simulados
      </div>
    </footer>
  );
}
