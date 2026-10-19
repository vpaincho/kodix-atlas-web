import { lazy, Suspense, useRef, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { readGeography } from '../data/geo/geometry';
import '../styles/geography.css';
const GeographicMap=lazy(()=>import('../components/tracking/GeographicMap'));

export default function Campo() {
  const [boundary,setBoundary]=useState(true), [imported,setImported]=useState<FeatureCollection|null>(null), [filename,setFilename]=useState(''), [error,setError]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const load=async(file:File|undefined)=>{
    if(!file)return;setError('');
    try {if(file.size>5*1024*1024)throw new Error('El archivo debe pesar menos de 5 MB.');const data=readGeography(JSON.parse(await file.text()));setImported(data);setFilename(file.name);}
    catch(e){setError(e instanceof Error?e.message:'No se pudo leer el archivo.');}
    if(input.current)input.current.value='';
  };
  return <div className="screen screen--geography">
    <div className="screen__head"><div className="screen__titles"><h1 className="screen__title">Campo operativo</h1><p className="screen__sub">Cuenca Golfo San Jorge · base geográfica de Atlas</p></div><span className="geo-live">Geografía real</span></div>
    <div className="geo-workspace"><Suspense fallback={<div className="geo-map" role="status">Preparando mapa…</div>}><GeographicMap imported={imported} boundary={boundary}/></Suspense>
      <aside className="geo-sidebar">
        <section><span className="geo-eyebrow">ÁREA DE OPERACIÓN</span><h2>Zona Cero<span>Patagonia, Argentina</span></h2><p>El mismo polígono trabajado en QGIS, convertido de UTM 19S a coordenadas geográficas.</p><div className="geo-data"><span>Fuente</span><strong>GeoPackage original</strong><span>Cartografía</span><strong>OpenStreetMap</strong><span>Posiciones GPS</span><strong>Pendientes de conexión</strong></div></section>
        <section><h3>Capas del campo</h3><label className="geo-toggle">Límite de Zona Cero<input type="checkbox" checked={boundary} onChange={e=>setBoundary(e.target.checked)}/></label><div className="geo-layer-status"><i/>Mapa de caminos y localidades</div><p>La cobertura de caminos depende de OpenStreetMap. Las rutas operativas se incorporan como una capa propia.</p></section>
        <section><h3>Incorporar datos reales</h3><p>Cargá pozos, caminos o locaciones en GeoJSON WGS84. La capa se procesa en este navegador.</p><input hidden ref={input} type="file" accept=".geojson,.json,application/geo+json" onChange={e=>void load(e.target.files?.[0])}/><button className="geo-import" onClick={()=>input.current?.click()}>＋ Cargar capa GeoJSON</button>{imported&&<div className="geo-imported"><strong>{filename}</strong><span>{imported.features.length} elementos geográficos</span><button onClick={()=>{setImported(null);setFilename('');}}>Quitar capa</button></div>}{error&&<p className="geo-error" role="alert">{error}</p>}</section>
        <section className="geo-next"><span className="geo-eyebrow">PRÓXIMA CAPA</span><h3>Operación sobre el territorio</h3><p>Pozos identificados, caminos validados y recorridos GPS permitirán ubicar equipos y cuadrillas con precisión.</p><span className="geo-demo-note">El replay de Seguimiento conserva su escenario demo.</span></section>
      </aside>
    </div>
  </div>;
}
