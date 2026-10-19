import type { VehTipo } from "../../../data/seguimiento";

/** Original lightweight models, shared silhouettes with the resource cards. */
function Box({ at, size, color, metal = 0.25 }: { at: [number, number, number]; size: [number, number, number]; color: string; metal?: number }) {
  return <mesh position={at} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.55} metalness={metal} /></mesh>;
}
export default function VehicleModel({ type, color, selected }: { type: VehTipo; color: string; selected: boolean }) {
  const truck = type === "camion", machine = type === "maquinaria";
  const wheelZ = truck ? [-1.55, -0.65, 1.45] : [-1, 1];
  return <group scale={0.58}>
    <Box at={[0, .55, 0]} size={[1.5, .4, truck ? 4.5 : 3.5]} color="#383e4b" />
    {machine ? <>
      <Box at={[0, .9, -.25]} size={[1.65, .6, 2.4]} color="#d0a448" />
      <Box at={[-.25, 1.55, .6]} size={[1.1, .9, 1.1]} color="#c7a154" />
      <Box at={[-.25, 1.6, 1.17]} size={[.9, .55, .04]} color="#263e4d" metal={0.6} />
      <group position={[.7, 1.1, .6]} rotation={[-.55, 0, 0]}><Box at={[0, 0, 1.1]} size={[.25, .25, 2.2]} color="#e3b657" /><Box at={[0, -.4, 2.1]} size={[1.3, .6, .45]} color="#a5874b" /></group>
    </> : <>
      <Box at={[0, .9, truck ? 1.15 : .45]} size={[1.48, .6, truck ? 1.5 : 2]} color="#e2e5e9" />
      <Box at={[0, 1.43, truck ? 1.2 : .55]} size={[1.32, .55, 1.2]} color="#ecedf1" />
      <Box at={[0, 1.42, truck ? 1.82 : 1.17]} size={[1.18, .42, .05]} color="#253e52" metal={0.65} />
      {[-1, 1].map(side => <Box key={side} at={[side * .671, 1.44, truck ? 1.2 : .55]} size={[.025, .38, .88]} color="#253e52" metal={.65} />)}
      {truck ? <Box at={[0, 1.1, -1]} size={[1.5, .85, 2.45]} color="#aeb7c5" /> : <>
        <Box at={[0, .85, -.95]} size={[1.35, .18, 1.25]} color="#505967" />
        {[-1, 1].map(side => <Box key={side} at={[side * .69, 1.02, -.95]} size={[.12, .42, 1.35]} color="#d9dde3" />)}
        <Box at={[0, 1.02, -1.63]} size={[1.4, .42, .1]} color="#d9dde3" />
      </>}
      <Box at={[0, .67, truck ? 2.28 : 1.8]} size={[1.4, .18, .1]} color="#6e7786" />
      {[-.5,.5].map(x => <mesh key={x} position={[x, .94, truck ? 2.3 : 1.78]}><boxGeometry args={[.28,.14,.04]} /><meshStandardMaterial color="#e5e6dc" emissive="#d9e8ff" emissiveIntensity={1.5} toneMapped={false} /></mesh>)}
    </>}
    {wheelZ.flatMap(z=>[-.78,.78].map(x=><mesh key={`${x}:${z}`} position={[x,.4,z]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.4,.4,.28,12]} /><meshStandardMaterial color="#10141a" roughness={.85} /></mesh>))}
    <mesh position={[0,machine?2.1:1.78,truck?1.2:.5]}><boxGeometry args={[.68,.09,.18]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected?2:0.6} toneMapped={false} /></mesh>
  </group>;
}
