/* Set de iconos de línea consistente (stroke 1.6, 20x20). Sin librería externa. */
import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...p,
});

export const IconCampo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
);
export const IconSeguimiento = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 17l5-9 5 5 3-5 5 9"/><circle cx="8" cy="8" r="1.4"/></svg>
);
export const IconTerritorio = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>
);
export const IconOperaciones = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
);
export const IconAlertas = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 4a5 5 0 0 1 5 5c0 5 2 6 2 6H5s2-1 2-6a5 5 0 0 1 5-5Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>
);
export const IconGrid = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>
);
export const IconActivos = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 16V8l6-3 6 3v8"/><path d="M15 11l6 2v3l-6-2"/><path d="M3 16l6 3 6-3"/></svg>
);
export const IconPlan = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v4M16 3v4"/></svg>
);
export const IconReportes = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13v4M12 11v6M15 14v3"/></svg>
);
export const IconConfig = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M4.2 7l2.2 1.3M17.6 15.7 19.8 17M4.2 17l2.2-1.3M17.6 8.3 19.8 7"/></svg>
);
export const IconPlay = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></svg>
);
export const IconPause = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="7" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" stroke="none"/></svg>
);
export const IconTarget = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 1.5V5M12 19v3.5M1.5 12H5M19 12h3.5"/></svg>
);
export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
);
export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8M15.5 19a5.5 5.5 0 0 0-1.3-3.6"/></svg>
);
export const IconRig = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3 7 21h10L12 3Z"/><path d="M9.2 12h5.6M8.2 16h7.6"/></svg>
);
export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>
);
export const IconRoute = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h3"/></svg>
);
export const IconSignal = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M5 12.5a9 9 0 0 1 14 0M8 15.5a5 5 0 0 1 8 0"/><circle cx="12" cy="18.5" r="1" fill="currentColor" stroke="none"/></svg>
);
export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7"/></svg>
);
export const IconUserPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 7v6M15 10h6"/></svg>
);
export const IconTruck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>
);
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></svg>
);
export const IconPin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 21s6.5-5 6.5-10a6.5 6.5 0 1 0-13 0C5.5 16 12 21 12 21Z"/><circle cx="12" cy="11" r="2.3"/></svg>
);
