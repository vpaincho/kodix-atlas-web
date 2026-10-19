/* =============================================================================
   Primitivas compartidas de UI: Panel, StatusChip, Tooltip, SectionTitle.
   Se usan en todas las pantallas y en los labs (misma fuente, sin duplicar).
   ========================================================================== */
import { type ReactNode, useState, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLOR_FASE, LABEL_FASE, type Fase } from "../../data/scenario";
import "../../styles/shell.css";

/* Panel oscuro translúcido con título en mayúscula y subtítulo opcional ------*/
export function Panel({
  title, subtitle, right, children, className = "", pad = true,
}: {
  title?: string; subtitle?: string; right?: ReactNode;
  children: ReactNode; className?: string; pad?: boolean;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || right) && (
        <header className="panel__head">
          <div>
            {title && <h2 className="panel__title">{title}</h2>}
            {subtitle && <p className="panel__sub">{subtitle}</p>}
          </div>
          {right && <div className="panel__right">{right}</div>}
        </header>
      )}
      <div className={pad ? "panel__body" : "panel__body panel__body--flush"}>{children}</div>
    </section>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="caps section-title">{children}</div>;
}

/* Chip de estado operativo — color + texto (no depende solo del color) -------*/
export function StatusChip({ fase, small = false }: { fase: Fase; small?: boolean }) {
  return (
    <span className={`chip ${small ? "chip--sm" : ""}`} style={{ ["--c" as string]: COLOR_FASE[fase] }}>
      <span className="chip__dot" />
      {LABEL_FASE[fase]}
    </span>
  );
}

/* Tooltip accesible con fundido (framer-motion) -----------------------------*/
export function Tooltip({ label, children }: { label: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      className="tt-anchor"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id} role="tooltip" className="tt"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* Estado vacío / sin datos (brief: conservar estados sin datos) --------------*/
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
