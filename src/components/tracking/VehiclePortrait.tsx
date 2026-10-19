import { useId } from "react";
import type { VehTipo } from "../../data/seguimiento";
export default function VehiclePortrait({ type, className }: { type: VehTipo; className?: string }) {
  const id=useId(); const label=type==='camion'?'Camión':type==='maquinaria'?'Maquinaria':'Camioneta';
  return <svg className={className} viewBox="0 0 120 64" role="img" aria-label={label}>
    <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#f3f5fa"/><stop offset="1" stopColor="#8e9cad"/></linearGradient></defs>
    <ellipse cx="60" cy="53" rx="50" ry="5" fill="#080a10" opacity=".55" />
    {type==='maquinaria'?<g fill="#cfaa58" stroke="#8c7039" strokeWidth="1"><path d="M12 35H82L90 45H10Z"/><path d="M28 16H53L62 35H27Z"/><path d="M61 30L87 12L92 16L70 36Z"/><path d="M85 13L109 37L103 42L88 21Z"/><path d="M98 37L116 41L111 48H96Z"/><path d="M32 20H49L55 30H32Z" fill="#304958"/></g>:
    <g stroke="#717f90" strokeWidth="1"><path d={type==='camion'?"M8 20H74V43H8Z":"M8 33H43V25H68L85 36H105L112 44V49H8Z"} fill={`url(#${id})`} />
      {type==='camion'?<><path d="M75 25H92L109 37V47H75Z" fill={`url(#${id})`}/><path d="M81 28H91L102 37H81Z" fill="#2d485b"/></>:<><path d="M47 28H65L77 36H47Z" fill="#2d485b"/><path d="M13 34H40V40H13Z" fill="#566272"/><path d="M62 37V47"/></>}
      <path d="M104 39H111V42H104Z" fill="#ecf4ff" stroke="none"/>
    </g>}
    {[25,90].map(x=><g key={x}><circle cx={x} cy="48" r="9" fill="#111720"/><circle cx={x} cy="48" r="4.5" fill="#8591a1"/><circle cx={x} cy="48" r="2" fill="#3c495b"/></g>)}
  </svg>;
}
