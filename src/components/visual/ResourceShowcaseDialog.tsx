import { useEffect, useRef, useState } from 'react';
import ShowcaseStage from './ShowcaseStage';
import type { ResourceTrack } from '../../data/seguimiento';
import '../../styles/visual.css';
export default function ResourceShowcaseDialog({track,onClose}:{track:ResourceTrack;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);const [rotating,setRotating]=useState(true);
  useEffect(()=>{const el=dialog.current;if(!el)return;el.showModal();return ()=>el.close();},[]);
  return <dialog ref={dialog} className="resource-showcase-dialog" onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <header><div><small>INSPECCIÓN VISUAL</small><h2>{track.id} <span> / {track.patente}</span></h2></div><button autoFocus onClick={onClose} aria-label="Cerrar vista de equipo">×</button></header>
    <ShowcaseStage type={track.veh} rotating={rotating}/>
    <footer><span>Modelo representativo · {track.veh}</span><button onClick={()=>setRotating(v=>!v)} aria-pressed={rotating}>{rotating?'Pausar giro':'Girar modelo'}</button></footer>
  </dialog>;
}
