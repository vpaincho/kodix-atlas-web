import { lazy, Suspense, useRef, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { readGeography } from '../data/geo/geometry';
import { useOps } from '../state/useOps';
import '../styles/geography.css';
const GeographicMap=lazy(()=>import('../components/tracking/GeographicMap'));

export default function Campo() {
  const vista=useOps(s=>s.geoVista), setVista=useOps(s=>s.setGeoVista);
  const capas=useOps(s=>s.geoCapas), toggleCapa=useOps(s=>s.toggleGeoCapa);
  const [imported,setImported]=useState<FeatureCollection|null>(null), [filename,setFilename]=useState(''), [error,setError]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const load=async(file:File|undefined)=>{
    if(!file)return;setError('');
    try {if(file.size>5*1024*1024)throw new Error('El archivo debe pesar menos de 5 MB.');const data=readGeography(JSON.parse(await file.text()));setImported(data);setFilename(file.name);}
    catch(e){setError(e instanceof Error?e.message:'No se pudo leer el archivo.');}
    if(input.current)input.current.value='';
  };
  return <div className="screen screen--geography">
    <input hidden ref={input} type="file" accept=".geojson,.json,application/geo+json" onChange={e=>void load(e.target.files?.[0])}/>
    <div className="screen__head"><div className="screen__titles"><h1 className="screen__title">Campo operativo</h1><p className="screen__sub">Cuenca Golfo San Jorge · base geográfica de Atlas</p></div><span className="geo-live">Geografía real</span></div>
    <div className="geo-stage">
      <Suspense fallback={<div className="geo-map" role="status">Preparando mapa…</div>}>
        <GeographicMap
          imported={imported} filename={filename} error={error}
          vista={vista} onVista={setVista}
          limite={Boolean(capas.limite)} caminos={Boolean(capas.caminos)} onToggleCapa={toggleCapa}
          onImportar={()=>input.current?.click()} onQuitarImportado={()=>{setImported(null);setFilename('');setError('');}}
        />
      </Suspense>
    </div>
  </div>;
}
