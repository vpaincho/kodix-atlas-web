/** Shared representative roads. These normalized coordinates are NOT surveyed geography. */
export interface Point2 { x: number; y: number }
export interface RouteLike { ruta: { wp: string; t: number; departAt?: number; kind?: string }[]; hueco?: { from: number; to: number } }
export interface RoadLeg { points: Point2[]; cumulative: number[]; length: number; from: number; to: number; kind: string; wp: string }
const ROAD_ANCHORS: Record<string, number[][]> = {
  'base_sur:A12': [[.16,.8],[.2,.74],[.25,.68],[.27,.59],[.24,.52],[.28,.41],[.3,.3]],
  'base_sur:B07': [[.16,.8],[.2,.74],[.25,.68],[.31,.59],[.42,.53],[.48,.42],[.57,.35],[.67,.32],[.74,.24]],
  'A12:B03': [[.3,.3],[.39,.34],[.44,.4],[.46,.49],[.55,.56],[.66,.55],[.75,.6],[.82,.58]],
  'base_sur:A08': [[.16,.8],[.22,.78],[.29,.74],[.35,.7],[.42,.66]],
  'A08:B03': [[.42,.66],[.51,.64],[.6,.61],[.68,.64],[.76,.62],[.82,.58]],
  'B03:B08': [[.82,.58],[.85,.54],[.84,.48],[.88,.4]],
  'base_sur:S400': [[.16,.8],[.24,.84],[.35,.86],[.46,.82],[.53,.83],[.6,.84]],
};
const cache = new WeakMap<RouteLike, RoadLeg[]>();
const mix = (a: number,b: number,t: number) => a+(b-a)*t;
export function roadBetween(aId: string,bId: string,waypoints: Record<string,Point2>): Point2[] {
  const direct=ROAD_ANCHORS[aId+':'+bId], reverse=ROAD_ANCHORS[bId+':'+aId];
  const raw=direct ?? (reverse ? [...reverse].reverse() : [[waypoints[aId].x,waypoints[aId].y],[waypoints[bId].x,waypoints[bId].y]]);
  const anchors=raw.map(([x,y])=>({x,y})); const result:Point2[]=[];
  for(let i=0;i<anchors.length-1;i++) {
    const p0=anchors[Math.max(0,i-1)],p1=anchors[i],p2=anchors[i+1],p3=anchors[Math.min(anchors.length-1,i+2)];
    for(let k=0;k<12;k++) {const t=k/12;const at=(key:'x'|'y')=>.5*((2*p1[key])+(-p0[key]+p2[key])*t+(2*p0[key]-5*p1[key]+4*p2[key]-p3[key])*t*t+(-p0[key]+3*p1[key]-3*p2[key]+p3[key])*t*t*t);result.push({x:at('x'),y:at('y')});}
  }
  result.push(anchors[anchors.length-1]); return result;
}
export function roadLegs(track: RouteLike,waypoints: Record<string,Point2>): RoadLeg[] {
  const hit=cache.get(track);if(hit)return hit;
  const legs=track.ruta.slice(1).map((to,i)=>{const from=track.ruta[i];const points=roadBetween(from.wp,to.wp,waypoints);const cumulative=[0];for(let j=1;j<points.length;j++)cumulative.push(cumulative[j-1]+Math.hypot(points[j].x-points[j-1].x,points[j].y-points[j-1].y));return {points,cumulative,length:cumulative[cumulative.length-1],from:to.departAt??from.t,to:to.t,kind:to.kind??'ejecutado',wp:to.wp};});
  cache.set(track,legs);return legs;
}
export function sampleLeg(leg:RoadLeg,fraction:number) {
  const distance=Math.max(0,Math.min(1,fraction))*leg.length;
  let i=1;while(i<leg.cumulative.length-1&&leg.cumulative[i]<distance)i++;
  const a=leg.points[i-1],b=leg.points[i],f=(distance-leg.cumulative[i-1])/Math.max(1e-12,leg.cumulative[i]-leg.cumulative[i-1]);
  return {point:{x:mix(a.x,b.x,f),y:mix(a.y,b.y,f)},tangent:{x:b.x-a.x,y:b.y-a.y},index:i};
}
export function splitLeg(leg:RoadLeg,fraction:number) {
  const f=Math.max(0,Math.min(1,fraction));
  if(f===0)return {executed:[] as Point2[],planned:leg.points};
  if(f===1)return {executed:leg.points,planned:[] as Point2[]};
  const {point,index}=sampleLeg(leg,f);
  return {executed:[...leg.points.slice(0,index),point],planned:[point,...leg.points.slice(index)]};
}
export function routeState(track:RouteLike,now:number,waypoints:Record<string,Point2>) {
  const legs=roadLegs(track,waypoints);let time=now;let stale=false;let age=0;
  if(track.hueco&&now>track.hueco.from) {
    // A gap ending is not itself an observation. Resume only at a new sample.
    const recovery=track.ruta.find(p=>p.t>track.hueco!.to&&p.t<=now);
    if(!recovery) {stale=true;const last=[...track.ruta].reverse().find(p=>p.t<=track.hueco!.from)??track.ruta[0];time=last.t;age=Math.round(now-last.t);}
  }
  let travelled=0;let active=0;let fraction=0;
  const fractions=legs.map((leg,i)=>{const f=time<=leg.from?0:time>=leg.to?1:(time-leg.from)/Math.max(1e-9,leg.to-leg.from);travelled+=f*leg.length;if(time>=leg.from){active=i;fraction=f;}return f;});
  const sample=legs.length?sampleLeg(legs[active],fraction):{point:waypoints[track.ruta[0].wp],tangent:{x:0,y:-1}};
  return {...sample,active,fraction,fractions,stale,age,travelled,total:legs.reduce((n,l)=>n+l.length,0),moving:!stale&&fraction>0&&fraction<1,observed:stale||fraction===0||fraction===1};
}
