import { motion, useReducedMotion, useSpring, useMotionTemplate } from 'framer-motion';
import type { ReactNode } from 'react';
/** Perspective is limited and spring-smoothed; semantic children remain HTML. */
export default function TiltSurface({children,className=''}:{children:ReactNode;className?:string}) {
  const reduced=useReducedMotion();const rx=useSpring(0,{stiffness:140,damping:24}),ry=useSpring(0,{stiffness:140,damping:24});
  const x=useSpring(50,{stiffness:180,damping:28}),y=useSpring(35,{stiffness:180,damping:28});
  const glare=useMotionTemplate`radial-gradient(500px circle at ${x}% ${y}%, rgba(192,160,255,.16), transparent 60%)`;
  return <div className={`tilt-perspective ${className}`} onPointerMove={e=>{if(reduced||e.pointerType==='touch'||e.buttons>0)return;const r=e.currentTarget.getBoundingClientRect();const nx=(e.clientX-r.left)/r.width,ny=(e.clientY-r.top)/r.height;rx.set((.5-ny)*8);ry.set((nx-.5)*10);x.set(nx*100);y.set(ny*100);}} onPointerLeave={()=>{rx.set(0);ry.set(0);x.set(50);y.set(35);}}>
    <motion.div className="tilt-surface" style={{rotateX:rx,rotateY:ry,transformStyle:'preserve-3d'}}>{children}<motion.div className="tilt-glare" style={{background:glare}}/></motion.div>
  </div>;
}
