import type { ResourceTrack } from "./seguimiento";

/** Parametric position on an ordered curve; timestamps belong to each leg. */
export function routeProgress(track: ResourceTrack, now: number) {
  const route = track.ruta;
  const stale = Boolean(track.hueco && now > track.hueco.from && now <= track.hueco.to);
  const time = stale ? track.hueco!.from : now;
  if (route.length < 2 || time <= route[0].t) return { fraction: 0, stale };
  for (let i = 1; i < route.length; i++) {
    if (time <= route[i].t) {
      const local = (time - route[i - 1].t) / Math.max(1, route[i].t - route[i - 1].t);
      return { fraction: (i - 1 + local) / (route.length - 1), stale };
    }
  }
  return { fraction: 1, stale };
}
