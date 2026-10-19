/* Camioneta PROVISIONAL (sustituto) construida con primitivas — volumen,
   orientación y faros. Pendiente: reemplazar por un modelo GLB con licencia.
   Mira hacia +Z local; el grupo padre la rota según el rumbo de la ruta. */
import type { Beam } from "../VehicleMarker";

const BEAM_HEX: Record<Exclude<Beam, "none">, string> = { azul: "#8fc4ff", ambar: "#ffcf7a" };

export default function Pickup({ estadoColor, beam }: { estadoColor: string; beam: Beam }) {
  return (
    <group>
      {/* chasis */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.3, 0.5, 2.9]} />
        <meshStandardMaterial color="#e9e9ef" metalness={0.35} roughness={0.5} />
      </mesh>
      {/* caja trasera */}
      <mesh castShadow position={[0, 0.72, -0.95]}>
        <boxGeometry args={[1.24, 0.32, 1.2]} />
        <meshStandardMaterial color="#cfcfd8" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* cabina */}
      <mesh castShadow position={[0, 1.02, 0.45]}>
        <boxGeometry args={[1.2, 0.55, 1.15]} />
        <meshStandardMaterial color="#dcdce4" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* parabrisas */}
      <mesh position={[0, 1.05, 1.05]}>
        <boxGeometry args={[1.08, 0.42, 0.06]} />
        <meshStandardMaterial color="#2a2f3d" metalness={0.7} roughness={0.15} />
      </mesh>
      {/* barra de estado en el techo (emisiva, color por estado) */}
      <mesh position={[0, 1.34, 0.45]}>
        <boxGeometry args={[0.82, 0.09, 0.22]} />
        <meshStandardMaterial color={estadoColor} emissive={estadoColor} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* ruedas */}
      {([[-0.66, 0.26, 0.95], [0.66, 0.26, 0.95], [-0.66, 0.26, -0.95], [0.66, 0.26, -0.95]] as const).map((p, i) => (
        <mesh key={i} castShadow position={p as unknown as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.29, 0.29, 0.26, 18]} />
          <meshStandardMaterial color="#14151b" roughness={0.9} />
        </mesh>
      ))}
      {/* faros + haz (hacia +Z) */}
      {beam !== "none" && (
        <>
          <mesh position={[0, 0.55, 1.5]}>
            <boxGeometry args={[1.0, 0.12, 0.06]} />
            <meshStandardMaterial color={BEAM_HEX[beam]} emissive={BEAM_HEX[beam]} emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.5, 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1.2, 3.0, 24, 1, true]} />
            <meshBasicMaterial color={BEAM_HEX[beam]} transparent opacity={0.14} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}
