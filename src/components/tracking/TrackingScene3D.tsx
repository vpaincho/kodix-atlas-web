import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Html, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import * as THREE from "three";
import { useOps } from "../../state/useOps";
import { world } from "../../world/WorldBridge";
import { TRACKS, WAYPOINTS, movilidad, MOVILIDAD_LABEL, type ResourceTrack } from "../../data/seguimiento";
import { roadLegs, routeState, splitLeg, type Point2 } from "../../data/routeGeometry";
import VehicleModel from "./scene/VehicleModel";

const W=64,D=48;
const STATUS={en_servicio:'#55d8ad',traslado:'#65b2ff',espera:'#ffc25c',disponible:'#55d8ad'};
const VIOLET=new THREE.Color('#a26aff').multiplyScalar(2.5);
// Illustrative terrain, not a DEM. Every road/model uses this same height field.
function height(x:number,z:number) {return .5*Math.sin(x*.16)*Math.cos(z*.13)+.35*Math.sin(z*.22+x*.08);}
function project(p:Point2,lift=.12) {const x=(p.x-.5)*W,z=(p.y-.5)*D;return new THREE.Vector3(x,height(x,z)+lift,z);}
function points3(points:Point2[],lift=.12) {return points.map(p=>project(p,lift));}
const ORIGIN=new THREE.Vector3(0,0,0);

function Terrain() {
  const geometry=useMemo(()=>{
    const g=new THREE.PlaneGeometry(100,88,90,80);g.rotateX(-Math.PI/2);const v=g.attributes.position;const colors=[];
    for(let i=0;i<v.count;i++){const x=v.getX(i),z=v.getZ(i),h=height(x,z);v.setY(i,h);const c=new THREE.Color('#242a32');c.multiplyScalar(1+h*.17+.04*Math.sin(x*2+z*3));colors.push(c.r,c.g,c.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial vertexColors roughness={1} metalness={0} /></mesh>;
}
function Facility({id,selected,showLabel}:{id:string;selected:boolean;showLabel:boolean}) {
  const wp=WAYPOINTS[id],at=project(wp,0);
  return <group position={at}>
    <mesh position={[0,.025,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[4.4,3.4]}/><meshStandardMaterial color="#545054" roughness={1}/></mesh>
    <group position={[1.3,0,-.9]}>{[-.55,.55].map(x=><mesh key={x} position={[x,.72,0]} castShadow><cylinderGeometry args={[.44,.44,1.44,16]}/><meshStandardMaterial color="#b9bec3" metalness={.4} roughness={.6}/></mesh>)}</group>
    <mesh position={[-1.3,.35,-.6]} castShadow><boxGeometry args={[1.4,.7,.8]}/><meshStandardMaterial color="#777e8d" roughness={.8}/></mesh>
    {selected&&<>
      <mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[2.2,2.28,64]}/><meshBasicMaterial color={VIOLET} toneMapped={false} side={THREE.DoubleSide}/></mesh>
      <Line points={[[0,.1,0],[0,3,0]]} color={VIOLET} lineWidth={1.5}/>
    </>}
    {showLabel && <Html center position={[0,selected?3.4:1.9,0]} zIndexRange={[8,0]} style={{pointerEvents:'none'}}><span className={`scene-wp ${selected?'scene-wp--selected':''}`}>{wp.label}</span></Html>}
  </group>;
}
function Road({track,now,selected,show}:{track:ResourceTrack;now:number;selected:boolean;show:boolean}) {
  const legs=useMemo(()=>roadLegs(track,WAYPOINTS),[track]);const state=routeState(track,now,WAYPOINTS);
  return <>{legs.map((leg,i)=>{const split=splitLeg(leg,state.fractions[i]);const ret=leg.kind==='retorno';
    return <group key={i}>
      <Line points={points3(leg.points)} color="#8c8391" lineWidth={selected?12:7} transparent opacity={selected?.25:.12}/>
      {show&&split.executed.length>1&&<>
        <Line points={points3(split.executed,selected?.32:.18)} color={ret?'#65b2ff':selected?VIOLET:'#67587f'} lineWidth={selected?5:1.5} transparent opacity={selected?1:.55} toneMapped={false}/>
        {selected&&<Line points={points3(split.executed,.36).map(p=>p.add(new THREE.Vector3(0,.035,0)))} color={ret?'#c8e5ff':'#f0e4ff'} lineWidth={1.4} toneMapped={false}/>}</>}
      {show&&split.planned.length>1&&<Line points={points3(split.planned,selected?.3:.17)} color={ret?'#65b2ff':'#a688cf'} lineWidth={selected?2:1} dashed dashSize={.45} gapSize={.35} transparent opacity={selected?.7:.25}/>}
    </group>;
  })}</>;
}

type FrameRequest={mode:'overview'|'focus';nonce:number};
function CameraRig({target,follow,request,onManual,reduced}:{target:THREE.Vector3;follow:boolean;request:FrameRequest;onManual:()=>void;reduced:boolean}) {
  const controls=useRef<OrbitImpl>(null);const {camera,size,invalidate}=useThree();
  const goal=useRef<{target:THREE.Vector3;position:THREE.Vector3}|null>(null);
  const wasFollowing=useRef(follow);
  useEffect(()=>{
    const center=request.mode==='focus'?target.clone():new THREE.Vector3(1,0,3);
    const distance=request.mode==='focus'?18:Math.max(45,36/Math.max(.5,size.width/size.height));
    goal.current={target:center,position:center.clone().add(new THREE.Vector3(0,distance,distance*.83))};invalidate();
    // Target changes during replay are handled by follow, not by overview framing.
  },[request.nonce,request.mode,size.width,size.height,invalidate]);
  useFrame((_,dt)=>{
    const ctl=controls.current;if(!ctl)return;
    if(follow){const delta=target.clone().sub(ctl.target);if(!wasFollowing.current){goal.current={target:target.clone(),position:target.clone().add(new THREE.Vector3(0,15,15))};}else if(!goal.current){camera.position.add(delta);ctl.target.copy(target);}}
    wasFollowing.current=follow;
    if(goal.current){const factor=reduced?1:1-Math.exp(-dt*5);camera.position.lerp(goal.current.position,factor);ctl.target.lerp(follow?target:goal.current.target,factor);ctl.update();if(camera.position.distanceTo(goal.current.position)<.01&&ctl.target.distanceTo(follow?target:goal.current.target)<.01)goal.current=null;else invalidate();}
  });
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.1} minDistance={7} maxDistance={105} maxPolarAngle={Math.PI*.46} onStart={()=>{goal.current=null;wasFollowing.current=false;onManual();}}/>;
}
function Vehicle({track,now,selected,showStop,onSelect}:{track:ResourceTrack;now:number;selected:boolean;showStop:boolean;onSelect:()=>void}) {
  const state=routeState(track,now,WAYPOINTS),p=project(state.point,.12),mov=movilidad(track,now);
  const heading=Math.atan2(state.tangent.x*W,state.tangent.y*D);const color=state.stale?'#ffc25c':STATUS[mov];
  return <group position={p}>
    <group rotation={[0,heading,0]} onClick={e=>{e.stopPropagation();onSelect();}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='';}}>
      <VehicleModel type={track.veh} color={color} selected={selected}/>
      {selected&&<mesh position={[0,.03,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.5,1.55,48]}/><meshBasicMaterial color={VIOLET} toneMapped={false}/></mesh>}
    </group>
    <Html center position={[0,selected?2.4:1.6,0]} zIndexRange={[selected?15:10,0]}>
      <button className={`scene-resource ${selected?'scene-resource--selected':''}`} onClick={onSelect} aria-label={`Seleccionar ${track.id}`} aria-pressed={selected}>
        <i style={{background:color}}/>{track.id}{state.stale&&<small>Señal · {state.age} min</small>}
        {showStop&&mov==='espera'&&<span className="scene-pill">En espera</span>}
      </button>
    </Html>
  </group>;
}
function Scene({now,selected,follow,request,onManual,onSelect,layers,reduced}:{now:number;selected:string;follow:boolean;request:FrameRequest;onManual:()=>void;onSelect:(id:string)=>void;layers:Record<string,boolean>;reduced:boolean}) {
  const track=TRACKS.find(t=>t.id===selected)??TRACKS[0];const state=routeState(track,now,WAYPOINTS);const destination=track.ruta[track.ruta.length-1].wp;
  return <>
    <CameraRig target={project(state.point)} follow={follow} request={request} onManual={onManual} reduced={reduced}/>
    <ambientLight intensity={.9}/><hemisphereLight args={['#8b9bc5','#343032',1]}/>
    <directionalLight position={[-15,30,15]} intensity={2.6} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={35} shadow-camera-bottom={-35} shadow-bias={-.001}/>
    <Terrain/>
    {TRACKS.map(t=><Road key={t.id} track={t} now={now} selected={t.id===selected} show={layers.trayectorias||t.id===selected}/>)}
    {Object.keys(WAYPOINTS).map(id=><Facility key={id} id={id} selected={id===destination} showLabel={!TRACKS.some(t=>{const p=routeState(t,now,WAYPOINTS).point;return Math.hypot(p.x-WAYPOINTS[id].x,p.y-WAYPOINTS[id].y)<.035;})}/>)}
    {layers.geocercas&&<mesh position={project(WAYPOINTS[destination],.08)} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[3.8,3.9,64]}/><meshBasicMaterial color="#65b2ff" transparent opacity={.5} side={THREE.DoubleSide}/></mesh>}
    {TRACKS.map(t=><Vehicle key={t.id} track={t} now={now} selected={t.id===selected} showStop={layers.detenciones} onSelect={()=>onSelect(t.id)}/>)}
    <EffectComposer multisampling={4}><Bloom intensity={.85} luminanceThreshold={.55} luminanceSmoothing={.2} mipmapBlur/></EffectComposer>
  </>;
}
export default function TrackingScene3D() {
  const now=useOps(s=>s.now),selected=useOps(s=>s.cuadrillaSel)??TRACKS[0].id,follow=useOps(s=>s.segSeguir);
  const layers=useOps(s=>s.segCapas),toggleLayer=useOps(s=>s.toggleSegCapa),setRender=useOps(s=>s.setSegRender),setSelected=useOps(s=>s.setCuadrilla);
  const reduced=Boolean(useReducedMotion());const [request,setRequest]=useState<FrameRequest>({mode:'overview',nonce:0});
  const setFollowing=useCallback((value:boolean)=>{if(useOps.getState().segSeguir!==value)useOps.getState().toggleSeguir();world.followResource(value?useOps.getState().cuadrillaSel:null);},[]);
  const manual=useCallback(()=>setFollowing(false),[setFollowing]);
  const frame=(mode:FrameRequest['mode'])=>{setFollowing(false);setRequest(s=>({mode,nonce:s.nonce+1}));};
  const select=useCallback((id:string)=>{setSelected(id);world.selectAsset(id);},[setSelected]);
  useEffect(()=>()=>{document.body.style.cursor='';},[]);
  return <div className="tmap tscene" data-testid="tracking-scene">
    <div className="scene-toolbar">
      <div className="scene-toolbar__views"><span className="scene-toolbar__eyebrow">CAMPO OPERATIVO</span><strong>Zona Cero <span> / Vista 3D</span></strong></div>
      <div className="tscene__switch" role="group" aria-label="Representación"><button className="on" aria-pressed="true">3D</button><button onClick={()=>setRender('2d')}>2D</button></div>
    </div>
    <div className="scene-layerbar" role="group" aria-label="Capas del mapa">{[['trayectorias','Rutas'],['detenciones','Detenciones'],['geocercas','Geocercas']].map(([key,label])=><button key={key} aria-pressed={Boolean(layers[key])} className={layers[key]?'on':''} onClick={()=>{toggleLayer(key);world.setLayerVisible(key,!layers[key]);}}>{label}</button>)}</div>
    <Canvas shadows frameloop="demand" dpr={[1,1.5]} camera={{position:[0,52,48],fov:44,near:.1,far:220}} gl={{antialias:true,powerPreference:'high-performance'}} fallback={<div className="scene-fallback">La vista 3D no está disponible.<button onClick={()=>setRender('2d')}>Abrir mapa 2D</button></div>}>
      <color attach="background" args={['#141921']}/><fog attach="fog" args={['#141921',70,145]}/>
      <Scene now={now} selected={selected} follow={follow} request={request} onManual={manual} onSelect={select} layers={layers} reduced={reduced}/>
    </Canvas>
    <div className="scene-camera" role="group" aria-label="Cámara"><button onClick={()=>frame('overview')}>Vista general</button><button onClick={()=>frame('focus')}>Encuadrar</button><button className={follow?'on':''} aria-pressed={follow} onClick={()=>setFollowing(!follow)}>Seguir <span className={`switch ${follow?'on':''}`}/></button></div>
    <div className="scene-bottom"><span>ESCENARIO DEMO · Terreno y equipos representativos</span><div className="scene-bottom__legend"><i/>Ejecutado <i className="plan"/>Planificado <i className="return"/>Retorno</div></div>
    <span className="scene-gesture">Arrastrar para orbitar · rueda para acercar</span>
  </div>;
}
