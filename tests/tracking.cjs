const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText, filename);
const { TRACKS, WAYPOINTS, posicionEn, distanciaHasta, distanciaTotal, movilidad, eventosDe } = require('../src/data/seguimiento.ts');
const { routeState, roadLegs, splitLeg } = require('../src/data/routeGeometry.ts');
const track = id => TRACKS.find(t => t.id === id);
const samePoint = (actual, expected) => {assert.ok(Math.abs(actual.x-expected.x)<1e-10);assert.ok(Math.abs(actual.y-expected.y)<1e-10);};
test('CO2 stays at destination during work and only returns after 09:52', () => {
  for(const time of [20,40,80,112])samePoint(posicionEn(track('CO2'),time),WAYPOINTS.B07);
  assert.equal(routeState(track('CO2'),113,WAYPOINTS).moving,true);
  samePoint(posicionEn(track('CO2'),120),WAYPOINTS.base_sur);
});
test('CO3 stays at A12 until departure; each view shares exact road samples', () => {
  for(const time of [20,30,54,55])samePoint(posicionEn(track('CO3'),time),WAYPOINTS.A12);
  samePoint(posicionEn(track('CO3'),78),WAYPOINTS.B03);
  const state=routeState(track('CO3'),65,WAYPOINTS),split=splitLeg(roadLegs(track('CO3'),WAYPOINTS)[1],state.fraction);
  samePoint(state.point,split.executed.at(-1));samePoint(state.point,split.planned[0]);
});
test('GPS gap freezes position and distance without invented motion', () => {
  const tr=track('CO4');const p=posicionEn(tr,102);samePoint(p,WAYPOINTS.A08);assert.equal(p.desactualizada,true);assert.equal(p.antiguedadMin,88);
  assert.equal(distanciaHasta(tr,102),distanciaHasta(tr,14));
});
test('ending a gap does not count as receiving a new position', () => {
  const tr={...track('CO3'),hueco:{from:20,to:50}};
  assert.equal(posicionEn(tr,60).desactualizada,true);samePoint(posicionEn(tr,60),WAYPOINTS.A12);
  assert.equal(posicionEn(tr,78).desactualizada,false);
});
test('all tracks have exact endpoints, bounded monotone distances and visible events', () => {
  for(const tr of TRACKS){samePoint(posicionEn(tr,-1),WAYPOINTS[tr.origen]);let before=0;for(let t=0;t<=120;t++){const d=distanciaHasta(tr,t);assert.ok(d>=before-1e-9);assert.ok(d<=distanciaTotal(tr)+1e-9);before=d;}assert.equal(eventosDe(tr,120).filter(e=>e.tipo==='llegada').length,tr.ruta.length-1);}
});
test('CO5 does not move during service; CO6 is available after returning', () => {
  samePoint(posicionEn(track('CO5'),70),WAYPOINTS.A08);assert.equal(movilidad(track('CO6'),102),'disponible');
});
const {readGeography,boundsOf}=require('../src/data/geo/geometry.ts');
test('Zona Cero retains its original geographic extent and closed polygon',()=>{
  const zone=require('../src/data/geo/zona-cero.json');readGeography(zone);
  const [[w,s],[e,n]]=boundsOf(zone);assert.ok(w>-68&&e<-67.8&&s>-45.9&&n<-45.7);
  const ring=zone.features[0].geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));
});
test('geographic imports reject projected coordinates, empty files and oversized geometry',()=>{
  const data=coords=>({type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:coords}}]});
  assert.throws(()=>readGeography(data([585000,4920000])),/WGS84/);
  assert.throws(()=>readGeography({type:'FeatureCollection',features:[]}),/geometrías/);
  assert.throws(()=>readGeography({type:'FeatureCollection',features:Array(10001).fill(data([0,0]).features[0])}),/10.000/);
  assert.deepEqual(boundsOf(readGeography(data([-67.86,-45.82]))),[[-67.86,-45.82],[-67.86,-45.82]]);
});
