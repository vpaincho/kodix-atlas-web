/* =============================================================================
   Reloj de replay · ÚNICO driver del tiempo. Monta una sola vez.
   Avanza `now` con requestAnimationFrame cuando playing=true.
   Escala: 1x => 1 minuto de simulación por segundo real (la ventana de 2 h
   se reproduce en ~120 s). 2x/4x multiplican.
   ========================================================================== */
import { useEffect, useRef } from "react";
import { useOps } from "./useOps";

const MIN_POR_SEGUNDO = 1; // a 1x

export default function ReplayClock() {
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    const loop = (ts: number) => {
      if (last.current == null) last.current = ts;
      const dtSeg = (ts - last.current) / 1000;
      last.current = ts;
      const { playing, velocidad, tick } = useOps.getState();
      if (playing) tick(dtSeg * MIN_POR_SEGUNDO * velocidad);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      last.current = null;
    };
  }, []);

  return null;
}
