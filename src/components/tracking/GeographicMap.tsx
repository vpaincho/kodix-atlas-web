import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MapInstance, type GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { useReducedMotion } from 'framer-motion';
import zone from '../../data/geo/zona-cero.json';
import { boundsOf } from '../../data/geo/geometry';
import 'maplibre-gl/dist/maplibre-gl.css';

const geography=zone as FeatureCollection;
const bounds=boundsOf(geography);

type Vista='cartografica'|'relieve'|'satelite';
const VISTAS: { id: Vista; label: string; disabledReason?: string }[] = [
  { id:'cartografica', label:'Cartográfica' },
  { id:'relieve', label:'Relieve', disabledReason:'Requiere datos de elevación (DEM) de Zona Cero, aún no disponibles.' },
  { id:'satelite', label:'Satélite', disabledReason:'Requiere un proveedor de imágenes satelitales licenciado, aún no conectado.' },
];

export default function GeographicMap({
  imported, filename, error, vista, onVista, limite, caminos, onToggleCapa, onImportar, onQuitarImportado,
}: {
  imported: FeatureCollection|null; filename: string; error: string;
  vista: Vista; onVista: (v: Vista) => void;
  limite: boolean; caminos: boolean; onToggleCapa: (id: string) => void;
  onImportar: () => void; onQuitarImportado: () => void;
}) {
  const host=useRef<HTMLDivElement>(null), map=useRef<MapInstance|null>(null);
  const reduced=useReducedMotion();
  const [ready,setReady]=useState(false), [failure,setFailure]=useState(''), [revision,setRevision]=useState(0), [pitched,setPitched]=useState(false);
  const [capaImportadaOn,setCapaImportadaOn]=useState(true);
  const [selected,setSelected]=useState<Record<string,unknown>|null>(null);
  const selectedIdRef=useRef<number|null>(null);
  const coordinates=useRef<HTMLSpanElement>(null);
  // Selección: id vive en un ref (el listener del mapa se registra una sola vez y
  // no debe quedar con un closure viejo); las propiedades mostradas viven en estado.
  const deselect=()=>{const instance=map.current;if(instance&&selectedIdRef.current!=null)instance.setFeatureState({source:'imported',id:selectedIdRef.current},{selected:false});selectedIdRef.current=null;setSelected(null);};
  useEffect(()=>{
    if(!host.current)return;
    let instance: MapInstance;
    setReady(false);setFailure('');setPitched(false);
    let tileTimer: ReturnType<typeof setTimeout>|undefined;
    const startupTimer=setTimeout(()=>setFailure('El motor del mapa no terminó de iniciar. Reintentá; si continúa, revisá que WebGL esté habilitado en el navegador.'),10000);
    try {
      instance=new maplibregl.Map({container:host.current,attributionControl:{compact:false},bounds,fitBoundsOptions:{padding:65},maxZoom:19,style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#10131c'}}]}});
    } catch(e) {clearTimeout(startupTimer);setFailure('No se pudo iniciar WebGL: '+(e instanceof Error?e.message:'error del navegador'));return;}
    map.current=instance;
    instance.addControl(new maplibregl.NavigationControl(),'bottom-right');
    instance.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
    instance.on('error',e=>setFailure('No se pudo cargar el mapa: '+e.error.message));
    // style.load does not wait for the remote raster tiles. Local geography is usable immediately.
    instance.once('style.load',()=>{
      clearTimeout(startupTimer);setFailure('');
      instance.addSource('zone',{type:'geojson',data:geography});
      instance.addLayer({id:'zone-fill',type:'fill',source:'zone',paint:{'fill-color':'#9a70ff','fill-opacity':.07}});
      instance.addLayer({id:'zone-halo',type:'line',source:'zone',paint:{'line-color':'#9561ff','line-width':10,'line-blur':6,'line-opacity':.6}});
      instance.addLayer({id:'zone-line',type:'line',source:'zone',paint:{'line-color':'#d9c5ff','line-width':1.5,'line-dasharray':[3,2]}});
      instance.addSource('imported',{type:'geojson',data:{type:'FeatureCollection',features:[]},generateId:true});
      instance.addLayer({id:'import-fill',type:'fill',source:'imported',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':'#a578ff','fill-opacity':.12}});
      instance.addLayer({id:'import-halo',type:'line',source:'imported',filter:['!=',['geometry-type'],'Point'],paint:{'line-color':'#9561ff','line-width':12,'line-blur':7,'line-opacity':.8}});
      instance.addLayer({id:'import-line',type:'line',source:'imported',filter:['!=',['geometry-type'],'Point'],paint:{'line-color':'#e5d8ff','line-width':2.5}});
      instance.addLayer({id:'import-point',type:'circle',source:'imported',filter:['==',['geometry-type'],'Point'],paint:{
        'circle-radius':['case',['boolean',['feature-state','selected'],false],9,6],
        'circle-color':['case',['boolean',['feature-state','selected'],false],'#f3e9ff','#b68aff'],
        'circle-stroke-width':2,'circle-stroke-color':'#eee3ff'}});
      // Selección: alterna por click, conserva cámara y capas (no reconstruye el mapa).
      instance.on('mouseenter','import-point',()=>{instance.getCanvas().style.cursor='pointer';});
      instance.on('mouseleave','import-point',()=>{instance.getCanvas().style.cursor='';});
      instance.on('click','import-point',e=>{
        const f=e.features?.[0];if(!f||f.id==null)return;
        const prev=selectedIdRef.current;
        if(prev!=null)instance.setFeatureState({source:'imported',id:prev},{selected:false});
        if(prev===f.id){selectedIdRef.current=null;setSelected(null);return;}
        instance.setFeatureState({source:'imported',id:f.id},{selected:true});
        selectedIdRef.current=f.id as number;setSelected(f.properties??{});
      });
      setReady(true);
      instance.addSource('osm',{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'});
      instance.addLayer({id:'base',type:'raster',source:'osm',paint:{'raster-saturation':-.85,'raster-brightness-max':.52,'raster-contrast':.18}},'zone-fill');
      let received=false;
      instance.on('sourcedata',e=>{if(e.sourceId==='osm'&&e.tile?.state==='loaded'){received=true;clearTimeout(tileTimer);setFailure('');}});
      tileTimer=setTimeout(()=>{if(!received){setFailure('La cartografía de OpenStreetMap no respondió. El límite de Zona Cero y tus capas locales siguen disponibles.');if(instance.getLayer('base'))instance.removeLayer('base');if(instance.getSource('osm'))instance.removeSource('osm');}},12000);
    });
    instance.on('mousemove',e=>{if(coordinates.current)coordinates.current.textContent=`${e.lngLat.lat.toFixed(5)}° · ${e.lngLat.lng.toFixed(5)}°`;});
    const observer=new ResizeObserver(()=>instance.resize());observer.observe(host.current);
    return ()=>{clearTimeout(startupTimer);clearTimeout(tileTimer);observer.disconnect();instance.remove();map.current=null;};
  },[revision]);
  // Vistas, capas y selección sólo cambian propiedades del mapa existente: nunca reconstruyen la instancia ni mueven la cámara.
  useEffect(()=>{if(!ready||!map.current)return;for(const id of ['zone-fill','zone-halo','zone-line'])map.current.setLayoutProperty(id,'visibility',limite?'visible':'none');},[limite,ready]);
  useEffect(()=>{if(!ready||!map.current||!map.current.getLayer('base'))return;map.current.setLayoutProperty('base','visibility',caminos?'visible':'none');},[caminos,ready,failure]);
  useEffect(()=>{if(!ready||!map.current)return;const visible=capaImportadaOn&&Boolean(imported);for(const id of ['import-fill','import-halo','import-line','import-point'])map.current.setLayoutProperty(id,'visibility',visible?'visible':'none');},[capaImportadaOn,imported,ready]);
  useEffect(()=>{if(!ready||!map.current)return;deselect();(map.current.getSource('imported') as GeoJSONSource).setData(imported??{type:'FeatureCollection',features:[]});if(imported)map.current.fitBounds(boundsOf(imported),{padding:80,duration:reduced?0:800});},[imported,ready,reduced]);

  const propEntries=selected?Object.entries(selected).filter(([,v])=>v!==null&&v!==undefined&&v!==''):[];
  return <div className="geo-map">
    <div ref={host} className="geo-map__canvas" role="region" aria-label="Mapa geográfico de Zona Cero" />
    <div className="geo-map__heading"><span>CAMPO GEOGRÁFICO / 01</span><h2>Zona Cero</h2><p>Cartografía real · límite del archivo original</p></div>

    <div className="geo-vista" role="group" aria-label="Vistas del mapa">
      {VISTAS.map(v=><button key={v.id} aria-pressed={vista===v.id} disabled={Boolean(v.disabledReason)} title={v.disabledReason??''} className={vista===v.id?'on':''} onClick={()=>!v.disabledReason&&onVista(v.id)}>{v.label}</button>)}
      <span className="geo-vista__divider"/>
      <button disabled={!ready} onClick={()=>{map.current?.fitBounds(bounds,{padding:65,pitch:0,bearing:0,duration:reduced?0:900});setPitched(false);}}>Encuadrar zona</button>
      <button disabled={!ready} aria-pressed={pitched} onClick={()=>{map.current?.easeTo({pitch:pitched?0:50,duration:reduced?0:700});setPitched(!pitched);}}>3D {pitched?'●':'○'}</button>
    </div>

    <div className="geo-right">
      <div className="geo-layers" role="group" aria-label="Capas de terreno">
        <span className="geo-eyebrow">CAPAS DE TERRENO</span>
        <button className="geo-layers__row" aria-pressed={limite} onClick={()=>onToggleCapa('limite')}>Límite de Zona Cero<span className={`switch ${limite?'on':''}`}/></button>
        <button className="geo-layers__row" aria-pressed={caminos} onClick={()=>onToggleCapa('caminos')}>Caminos (OpenStreetMap)<span className={`switch ${caminos?'on':''}`}/></button>
        <button className="geo-layers__row" aria-pressed={capaImportadaOn} disabled={!imported} onClick={()=>setCapaImportadaOn(v=>!v)}>{imported?'Capa importada':'Capa importada (sin datos)'}<span className={`switch ${capaImportadaOn?'on':''}`}/></button>
        <div className="geo-layers__import">
          <button className="geo-import" onClick={onImportar}>＋ Cargar capa GeoJSON</button>
          {imported&&<div className="geo-imported"><strong>{filename}</strong><span>{imported.features.length} elementos geográficos</span><button onClick={onQuitarImportado}>Quitar capa</button></div>}
          {error&&<p className="geo-error" role="alert">{error}</p>}
        </div>
      </div>

      {selected&&<div className="geo-feature" role="group" aria-label="Elemento seleccionado">
        <header><span className="geo-eyebrow">ELEMENTO IMPORTADO</span><button aria-label="Cerrar selección" onClick={deselect}>×</button></header>
        <dl>{propEntries.length?propEntries.slice(0,6).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>):<div><dd>Sin propiedades en el archivo.</dd></div>}</dl>
      </div>}
    </div>

    {!ready&&!failure&&<div className="geo-map__notice" role="status">Cargando cartografía…</div>}
    {failure&&<div className="geo-map__notice" role="alert">{failure}<button onClick={()=>setRevision(n=>n+1)}>Reintentar</button></div>}
    <div className="geo-map__coordinates"><span ref={coordinates}>Zona Cero · Cuenca Golfo San Jorge</span><small>EPSG:4326 · vista inclinada sin relieve DEM</small></div>
  </div>;
}
