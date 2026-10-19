import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

// Original GPU effect reconstructed from the uploaded video's visual cues.
const vertex=`
  uniform float uTime; uniform float uEnergy; uniform vec2 uPointer;
  attribute float aSeed; varying float vGlow; varying float vSeed;
  void main(){
    vec3 n=normalize(position);
    float wave=sin(n.x*7.0+uTime*.8)*sin(n.y*6.0-uTime*.55)*sin(n.z*8.0+uTime*.4);
    vec3 p=position+n*wave*(.11+.16*uEnergy);
    p.x+=sin(n.y*5.0+uTime*.4)*.08;
    p.xy+=uPointer*.055*(1.0+n.z);
    vec4 view=modelViewMatrix*vec4(p,1.0);
    vec3 viewNormal=normalize(normalMatrix*n);
    vGlow=.18+pow(1.0-abs(viewNormal.z),1.9)*.82;
    vSeed=aSeed;
    gl_Position=projectionMatrix*view;
    gl_PointSize=clamp((10.0+9.0*aSeed)/-view.z,1.0,4.0);
  }
`;
const fragment=`
  varying float vGlow; varying float vSeed;
  void main(){
    float r=length(gl_PointCoord-.5);
    if(r>.5)discard;
    float alpha=(1.0-smoothstep(.08,.5,r))*vGlow;
    vec3 color=mix(vec3(.38,.10,.9),vec3(.88,.76,1.0),vSeed*.65+vGlow*.35);
    gl_FragColor=vec4(color*1.5,alpha*.85);
  }
`;
function Core({energy,paused,reduced}:{energy:number;paused:boolean;reduced:boolean}) {
  const mesh=useRef<THREE.Points>(null);const elapsed=useRef(0);
  const geometry=useMemo(()=>{
    const n=16000,g=new THREE.BufferGeometry(),pos=new Float32Array(n*3),seeds=new Float32Array(n);
    for(let i=0;i<n;i++){const y=1-(i/(n-1))*2,r=Math.sqrt(1-y*y),theta=i*Math.PI*(3-Math.sqrt(5));pos[i*3]=Math.cos(theta)*r*2;pos[i*3+1]=y*2;pos[i*3+2]=Math.sin(theta)*r*2;seeds[i]=(Math.sin(i*12.9898)*43758.5453)%1;seeds[i]=Math.abs(seeds[i]);}
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));return g;
  },[]);
  const uniforms=useMemo(()=>({uTime:{value:0},uEnergy:{value:energy},uPointer:{value:new THREE.Vector2()}}),[]);
  useFrame(({pointer},dt)=>{
    if(!mesh.current)return;
    if(!paused&&!reduced)elapsed.current+=Math.min(dt,.05);
    uniforms.uTime.value=elapsed.current;uniforms.uEnergy.value=energy;
    if(reduced)uniforms.uPointer.value.set(0,0);else uniforms.uPointer.value.lerp(pointer,1-Math.exp(-dt*4));
    mesh.current.rotation.y=elapsed.current*.07;
  });
  return <>
    <mesh><sphereGeometry args={[1.75,48,32]}/><meshBasicMaterial color="#090710"/></mesh>
    <points ref={mesh} geometry={geometry}><shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></points>
  </>;
}
/** Decorative research effect: never a metric or a live connectivity indicator. */
export default function ParticleCore({energy=.6,paused=false}:{energy?:number;paused?:boolean}) {
  const reduced=Boolean(useReducedMotion());
  return <div className="particle-core" aria-label="Estudio visual de partículas, sin datos operativos"><Canvas frameloop={!paused && !reduced ? "always" : "demand"} dpr={[1,1.5]} camera={{position:[0,0,6.8],fov:44}} gl={{antialias:true}}><color attach="background" args={['#090710']}/><Core energy={energy} paused={paused} reduced={reduced}/></Canvas></div>;
}
