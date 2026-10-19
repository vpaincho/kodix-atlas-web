import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';
import type { VehTipo } from '../../data/seguimiento';
import VehicleModel from '../tracking/scene/VehicleModel';

function Display({type,rotating,light,reduced}:{type:VehTipo;rotating:boolean;light:number;reduced:boolean}) {
  const turntable=useRef<THREE.Group>(null);
  useFrame((_,dt)=>{if(turntable.current&&rotating&&!reduced)turntable.current.rotation.y+=dt*.2;});
  return <>
    <ambientLight intensity={.6}/><hemisphereLight args={['#c3d3ff','#151022',1.1]}/>
    <directionalLight position={[3,6,4]} intensity={3} color="#dce9ff" castShadow shadow-mapSize={[512,512]}/>
    <pointLight position={[-3,2,-1]} color="#a675ff" intensity={light*18} distance={12}/>
    <pointLight position={[3,1,-3]} color="#53b9ed" intensity={8} distance={9}/>
    <group ref={turntable} position={[0,-.1,0]}>
      <VehicleModel type={type} color="#b28aff" selected/>
    </group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.12,0]} receiveShadow><circleGeometry args={[2.8,96]}/><meshStandardMaterial color="#14121f" metalness={.65} roughness={.35}/></mesh>
    {[2.15,2.55,2.85].map((radius,i)=><mesh key={radius} rotation={[-Math.PI/2,0,0]} position={[0,-.1-i*.008,0]}><ringGeometry args={[radius,radius+(i===0?.025:.009),128]}/><meshBasicMaterial color={new THREE.Color('#9f6bff').multiplyScalar(i===0?2:1)} transparent opacity={i===0?.9:.25} toneMapped={false} side={THREE.DoubleSide}/></mesh>)}
    <ContactShadows position={[0,-.09,0]} opacity={.65} scale={8} blur={2.8} far={3} resolution={256} frames={1}/>
    <OrbitControls makeDefault enablePan={false} minDistance={3.7} maxDistance={10} minPolarAngle={.35} maxPolarAngle={Math.PI*.46}/>
    <EffectComposer multisampling={4}><Bloom intensity={light*.55} luminanceThreshold={.7} mipmapBlur/></EffectComposer>
  </>;
}
/** Reusable presentation view. Rotating the model never changes vehicle tracking. */
export default function ShowcaseStage({type,rotating=true,light=1}:{type:VehTipo;rotating?:boolean;light?:number}) {
  const reduced=Boolean(useReducedMotion());
  return <div className="showcase-stage" aria-label={`Modelo ilustrativo de ${type}`}>
    <Canvas frameloop={rotating && !reduced ? "always" : "demand"} shadows dpr={[1,1.5]} camera={{position:[4,2.7,4],fov:36}} gl={{antialias:true}} fallback={<div className="visual-fallback">La vista de equipo necesita WebGL.</div>}>
      <color attach="background" args={['#0c0a13']}/>
      <Display type={type} rotating={rotating} reduced={reduced} light={light}/>
    </Canvas>
  </div>;
}
