/* Marco de la app: rail + topbar + contenido + replay. El contenido se pasa
   por props según la pantalla activa. */
import type { ReactNode } from "react";
import IconRail from "./IconRail";
import TopNav from "./TopNav";
import ReplayBar from "./ReplayBar";

export default function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="frame">
      <IconRail />
      <TopNav />
      <main className="frame__main">{children}</main>
      <ReplayBar />
    </div>
  );
}
