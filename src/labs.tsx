import React, { lazy, Suspense, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import TiltSurface from './components/visual/TiltSurface';
import VehiclePortrait from './components/tracking/VehiclePortrait';
import { TRACKS } from './data/seguimiento';
import { CUADRILLAS } from './data/scenario';
import './styles/tokens.css';
import './styles/global.css';
import './styles/visual.css';
const ShowcaseStage=lazy(()=>import('./components/visual/ShowcaseStage'));
const ParticleCore=lazy(()=>import('./components/visual/ParticleCore'));

function VisualLab() {
  const [tab,setTab]=useState<'equipo'|'particulas'>('equipo');const [index,setIndex]=useState(2);const [rotating,setRotating]=useState(true);const [energy,setEnergy]=useState(.7);
  const reduced=useReducedMotion(),track=TRACKS[index],crew=CUADRILLAS.find(c=>c.id===track.id)!;
  return <div className="visual-lab">
    <header className="lab-header"><a href="/" className="lab-brand"><b>K</b><span>KODIX <em>ATLAS</em><small>LABORATORIO VISUAL / 01</small></span></a><a className="lab-back" href="/">Volver a operaciones ↗</a></header>
    <main className="lab-main">
      <div className="lab-intro"><p className="lab-eyebrow"><i/> ESTUDIOS DE PROFUNDIDAD E INTERACCIÓN</p><h1>Una operación.<br/><span>Otra dimensión.</span></h1><p>Explorá el equipo, cambiá la luz y sentí la respuesta. Un espacio para definir cómo se ve y se mueve Atlas.</p></div>
      <nav className="lab-tabs" aria-label="Estudios visuales"><button className={tab==='equipo'?'active':''} aria-pressed={tab==='equipo'} onClick={()=>setTab('equipo')}><small>01</small> Equipo en foco</button><button className={tab==='particulas'?'active':''} aria-pressed={tab==='particulas'} onClick={()=>setTab('particulas')}><small>02</small> Campo de partículas</button></nav>
      <div className="lab-workspace">
        <aside className="lab-resources"><p className="lab-eyebrow">SELECCIONÁ UN RECURSO</p>{TRACKS.map((t,i)=><motion.button key={t.id} whileHover={reduced?undefined:{x:3}} whileTap={reduced?undefined:{scale:.98}} className={index===i?'selected':''} aria-pressed={index===i} onClick={()=>setIndex(i)}><VehiclePortrait type={t.veh}/><span><strong>{t.id}</strong><small>{t.veh==='camion'?'Camión':t.veh==='maquinaria'?'Maquinaria':'Camioneta'}</small></span><b>↗</b></motion.button>)}<div className="lab-note"><span>REFERENCIA → INTERPRETACIÓN</span><p>Perspectiva, luz y movimiento inspirados en tus videos. Modelos y efectos propios, todavía representativos.</p></div></aside>
        <TiltSurface className="lab-hero">
          <div className="lab-hero__head"><span><i/> {tab==='equipo'?'VISUALIZACIÓN DE EQUIPO':'ESTUDIO DE PARTÍCULAS'}</span><span>ATLAS / 01</span></div>
          <Suspense fallback={<div className="visual-loading" role="status">Preparando escena…</div>}>
            {tab==='equipo'?<ShowcaseStage type={track.veh} rotating={rotating} light={energy+0.5}/>:<ParticleCore energy={energy} paused={!rotating}/>}
          </Suspense>
          <div className="lab-hero__caption"><AnimatePresence mode="wait"><motion.div key={tab+track.id} initial={reduced?false:{opacity:0,y:14,filter:'blur(5px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} exit={reduced?undefined:{opacity:0,y:-8}} transition={{duration:.25}}><p>{tab==='equipo'?track.patente:'SISTEMA VISUAL EXPERIMENTAL'}</p><h2>{tab==='equipo'?crew.tarea:'La energía del movimiento.'}</h2><span>{tab==='equipo'?`${track.id} · modelo ${track.veh}`:'16.000 puntos · respuesta al cursor'}</span></motion.div></AnimatePresence><span className="lab-hero__hint">{tab==='equipo'?'Arrastrá para explorar ↗':'Mové el cursor ↗'}</span></div>
        </TiltSurface>
        <aside className="lab-controls"><p className="lab-eyebrow">DIRECCIÓN VISUAL</p><h3>Controlá<br/>la sensación.</h3><label className="lab-range">{tab==='equipo'?'Luz de acento':'Deformación'}<span>{Math.round(energy*100)}%</span><input aria-label={tab==='equipo'?'Luz de acento':'Deformación'} type="range" min="0" max="1" step=".01" value={energy} onChange={e=>setEnergy(Number(e.target.value))}/></label><button className={`lab-motion ${rotating?'on':''}`} aria-pressed={rotating} onClick={()=>setRotating(v=>!v)}><span>{rotating?'Pausar movimiento':'Activar movimiento'}</span><b>{rotating?'Ⅱ':'▷'}</b></button>{reduced&&<p className="lab-reduced">Movimiento reducido del dispositivo activo.</p>}<div className="lab-spec"><span>01 / PROFUNDIDAD</span><p>Objetos con volumen, capas y perspectiva.</p><span>02 / RESPUESTA</span><p>Inercia suave y luz que sigue al cursor.</p><span>03 / IDENTIDAD</span><p>Grafito, violeta y brillo concentrado.</p></div><a className="lab-open-app" href="/">Ver en operaciones <span>↗</span></a></aside>
      </div>
      <footer className="lab-footer"><span>ESTUDIO VISUAL · NO REPRESENTA TELEMETRÍA</span><span>Motion / Three.js · Componentes compartidos con Atlas</span></footer>
    </main>
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><VisualLab/></React.StrictMode>);
