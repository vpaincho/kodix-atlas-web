import type { FeatureCollection, Geometry } from 'geojson';
/** Imported WGS84 only. Never assigns demo resources to invented geographic positions. */
export function positions(geometry: Geometry): number[][] {
  if (geometry.type === 'GeometryCollection') return geometry.geometries.flatMap(positions);
  const walk = (value: unknown): number[][] => Array.isArray(value) ? (typeof value[0] === 'number' ? [value as number[]] : value.flatMap(walk)) : [];
  return walk(geometry.coordinates);
}
export function boundsOf(data: FeatureCollection): [[number,number],[number,number]] {
  const points=data.features.flatMap(f=>f.geometry?positions(f.geometry):[]);
  if(!points.length) throw new Error('El archivo no contiene geometrías.');
  if(points.some(p=>p.length<2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>180||Math.abs(p[1])>85)) throw new Error('Se requieren coordenadas WGS84: longitud, latitud (EPSG:4326).');
  let west=180,south=85,east=-180,north=-85;
  for(const p of points){west=Math.min(west,p[0]);south=Math.min(south,p[1]);east=Math.max(east,p[0]);north=Math.max(north,p[1]);}
  return [[west,south],[east,north]];
}
export function readGeography(value: unknown): FeatureCollection {
  const data=value as FeatureCollection;
  if(!data||data.type!=='FeatureCollection'||!Array.isArray(data.features)||data.features.length>10000) throw new Error('Usá un GeoJSON FeatureCollection de hasta 10.000 elementos.');
  const allowed=['Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon','GeometryCollection'];
  for(const f of data.features) if(f.type!=='Feature'||!f.geometry||!allowed.includes(f.geometry.type)) throw new Error('Geometría no compatible.');
  const count=data.features.reduce((n,f)=>n+positions(f.geometry).length,0);
  if(count>100000) throw new Error('El archivo supera los 100.000 vértices. Dividilo en capas.');
  boundsOf(data); return data;
}
