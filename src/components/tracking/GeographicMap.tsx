import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MapInstance, type GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { useReducedMotion } from 'framer-motion';
import zone from '../../data/geo/zona-cero.json';
import { boundsOf } from '../../data/geo/geometry';
import 'maplibre-gl/dist/maplibre-gl.css';

const geography=zone as FeatureCollection;
const bounds=boundsOf(geography);
export default function GeographicMap({ imported, boundary }: { imported: FeatureCollection|null; boundary: boolean }) {
  const host=useRef<HTMLDivElement>(null), map=useRef<MapInstance|null>(null);
  const reduced=useReducedMotion();
  const [ready,setReady]=useState(false), [failure,setFailure]=useState(false), [revision,setRevision]=useState(0), [pitched,setPitched]=useState(false);
  const coordinates=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    if(!host.current)return;
    let instance: MapInstance;
    setReady(false);setFailure(false);setPitched(false);
    try {
      instance=new maplibregl.Map({container:host.current,attributionControl:{compact:false},bounds,fitBoundsOptions:{padding:65},maxZoom:19,style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}},layers:[{id:'background',type:'background',paint:{'background-color':'#10131c'}},{id:'base',type:'raster',source:'osm',paint:{'raster-saturation':-.85,'raster-brightness-max':.52,'raster-contrast':.18}}]}});
    } catch {setFailure(true);return;}
    map.current=instance;
    instance.addControl(new maplibregl.NavigationControl(),'bottom-right');
    instance.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
    instance.on('error',()=>setFailure(true));
    instance.on('load',()=>{
      instance.addSource('zone',{type:'geojson',data:geography});
      instance.addLayer({id:'zone-fill',type:'fill',source:'zone',paint:{'fill-color':'#9a70ff','fill-opacity':.07}});
      instance.addLayer({id:'zone-halo',type:'line',source:'zone',paint:{'line-color':'#9561ff','line-width':10,'line-blur':6,'line-opacity':.6}});
      instance.addLayer({id:'zone-line',type:'line',source:'zone',paint:{'line-color':'#d9c5ff','line-width':1.5,'line-dasharray':[3,2]}});
      instance.addSource('imported',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      instance.addLayer({id:'import-fill',type:'fill',source:'imported',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':'#a578ff','fill-opacity':.12}});
      instance.addLayer({id:'import-halo',type:'line',source:'imported',filter:['!=',['geometry-type'],'Point'],paint:{'line-color':'#9561ff','line-width':12,'line-blur':7,'line-opacity':.8}});
      instance.addLayer({id:'import-line',type:'line',source:'imported',filter:['!=',['geometry-type'],'Point'],paint:{'line-color':'#e5d8ff','line-width':2.5}});
      instance.addLayer({id:'import-point',type:'circle',source:'imported',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':6,'circle-color':'#b68aff','circle-stroke-width':2,'circle-stroke-color':'#eee3ff'}});
      setReady(true);
    });
    instance.on('mousemove',e=>{if(coordinates.current)coordinates.current.textContent=`${e.lngLat.lat.toFixed(5)}° · ${e.lngLat.lng.toFixed(5)}°`;});
    const observer=new ResizeObserver(()=>instance.resize());observer.observe(host.current);
    return ()=>{observer.disconnect();instance.remove();map.current=null;};
  },[revision]);
  useEffect(()=>{if(!ready||!map.current)return;for(const id of ['zone-fill','zone-halo','zone-line'])map.current.setLayoutProperty(id,'visibility',boundary?'visible':'none');},[boundary,ready]);
  useEffect(()=>{if(!ready||!map.current)return;(map.current.getSource('imported') as GeoJSONSource).setData(imported??{type:'FeatureCollection',features:[]});if(imported)map.current.fitBounds(boundsOf(imported),{padding:80,duration:reduced?0:800});},[imported,ready,reduced]);
  return <div className="geo-map">
    <div ref={host} className="geo-map__canvas" role="region" aria-label="Mapa geográfico de Zona Cero" />
    <div className="geo-map__heading"><span>CAMPO GEOGRÁFICO / 01</span><h2>Zona Cero</h2><p>Cartografía real · límite del archivo original</p></div>
    <div className="geo-map__tools"><button disabled={!ready} onClick={()=>{map.current?.fitBounds(bounds,{padding:65,pitch:0,bearing:0,duration:reduced?0:900});setPitched(false);}}>Encuadrar zona</button><button disabled={!ready} aria-pressed={pitched} onClick={()=>{map.current?.easeTo({pitch:pitched?0:50,duration:reduced?0:700});setPitched(!pitched);}}>{pitched?'Vista cenital':'Vista inclinada'}</button></div>
    {!ready&&!failure&&<div className="geo-map__notice" role="status">Cargando cartografía…</div>}
    {failure&&<div className="geo-map__notice" role="alert">No se pudo cargar parte del mapa. Revisá la conexión.<button onClick={()=>setRevision(n=>n+1)}>Reintentar</button></div>}
    <div className="geo-map__coordinates"><span ref={coordinates}>Zona Cero · Cuenca Golfo San Jorge</span><small>EPSG:4326 · vista inclinada sin relieve DEM</small></div>
  </div>;
}
