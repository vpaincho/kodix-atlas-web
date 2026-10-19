/* =============================================================================
   Adaptador visual 3D de Seguimiento (Three.js + React Three Fiber + Drei).
   Escena pequeña y terminada conectada a la app: camino curvo + contexto,
   camioneta provisional con volumen/sombra, locación de destino, ruta violeta
   (núcleo/cuerpo/halo con bloom) y cámara elevada con selección y seguimiento,
   sincronizada al replay y respetando huecos GPS. El SVG 2D sigue como respaldo.
   Geometría REPRESENTATIVA (no validada) — se declara en pantalla.
   ========================================================================== */
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Html, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useOps } from "../../state/useOps";
import { world } from "../../world/WorldBridge";
import {
  TRACKS, WAYPOINTS, movilidad, MOVILIDAD_COLOR, MOVILIDAD_LABEL,
  type ResourceTrack,
} from "../../data/seguimiento";
import { CUADRILLAS } from "../../data/scenario";
import { faseAt, tramoAt } from "../../data/derive";
import Pickup from "./scene/Pickup";
import type { Beam } from "./VehicleMarker";

const W = 46, D = 30;
const proj = (nx: number, ny: number, y = 0.06) => new THREE.Vector3((nx - 0.5) * W, y, (ny - 0.5) * D);

const COLOR_HEX: Record<string, string> = {
  en_servicio: "#38D5A1", traslado: "#589FF0", espera: "#F7BD43", disponible: "#38D5A1",
};

interface SceneData {
  curve: THREE.CatmullRomCurve3;
  samples: THREE.Vector3[];
  nExec: number;
  truck: THREE.Vector3;
  heading: number;
  dest: THREE.Vector3;
  pads: { v: THREE.Vector3; label: string }[];
  frac: number;
  desactualizada: boolean;
}

function buildScene(tr: ResourceTrack, now: number): SceneData {
  const pts = tr.ruta.map((rp) => proj(WAYPOINTS[rp.wp].x, WAYPOINTS[rp.wp].y));
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.25);
  const samples = curve.getPoints(90);
  const t0 = tr.ruta[0].t, tN = tr.ruta[tr.ruta.length - 1].t;
  let frac: number;
  let desactualizada = false;
  if (tr.hueco && now > tr.hueco.from) { frac = (tr.hueco.from - t0) / (tN - t0); desactualizada = true; }
  else frac = (now - t0) / Math.max(1, tN - t0);
  frac = Math.max(0, Math.min(1, frac));
  const nExec = Math.max(1, Math.round(frac * (samples.length - 1)));
  const fc = Math.min(0.999, Math.max(0.001, frac));
  const truck = curve.getPointAt(fc);
  const tan = curve.getTangentAt(fc);
  const heading = Math.atan2(tan.x, tan.z);
  const dest = pts[pts.length - 1].clone();
  const pads = tr.ruta.map((rp) => ({ v: proj(WAYPOINTS[rp.wp].x, WAYPOINTS[rp.wp].y, 0), label: WAYPOINTS[rp.wp].label }));
  return { curve, samples, nExec, truck, heading, dest, pads, frac, desactualizada };
}

/* cámara elevada: encuadra la ruta o sigue a la camioneta (lerp suave) */
function Rig({ target, follow }: { target: THREE.Vector3; follow: boolean }) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const off = follow ? new THREE.Vector3(0, 11, 13) : new THREE.Vector3(0, 20, 22);
    desired.current.copy(target).add(off);
    camera.position.lerp(desired.current, Math.min(1, dt * (follow ? 2.2 : 1.4)));
    look.current.lerp(target, Math.min(1, dt * 2.5));
    camera.lookAt(look.current);
  });
  return null;
}

function Terreno() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W * 1.6, D * 1.8]} />
        <meshStandardMaterial color="#12151d" roughness={1} metalness={0} />
      </mesh>
      <gridHelper args={[W * 1.4, 28, "#222838", "#1a1f2b"]} position={[0, 0.01, 0]} />
    </>
  );
}

function Destino({ v, label }: { v: THREE.Vector3; label: string }) {
  return (
    <group position={v}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.3, 1.6, 40]} />
        <meshStandardMaterial color="#A774FF" emissive="#A774FF" emissiveIntensity={1.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.2, 8]} />
        <meshStandardMaterial color="#A774FF" emissive="#A774FF" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <Html position={[0, 2.6, 0]} center distanceFactor={26} style={{ pointerEvents: "none" }}>
        <div className="scene-wp">{label}</div>
      </Html>
    </group>
  );
}

function Escena({ tr, now, seguir }: { tr: ResourceTrack; now: number; seguir: boolean }) {
  const c = CUADRILLAS.find((x) => x.id === tr.id)!;
  const data = useMemo(() => buildScene(tr, now), [tr, now]);
  const mov = movilidad(tr, now);
  const estHex = COLOR_HEX[mov] ?? "#A774FF";
  const beam: Beam = data.desactualizada ? "none" : mov === "traslado" ? "azul" : mov === "disponible" ? "none" : "ambar";
  const fase = faseAt(c, now); const tramo = tramoAt(c, now);
  const enEspera = fase === "espera" && tramo;

  const exec = data.samples.slice(0, data.nExec + 1);
  const plan = data.samples.slice(data.nExec);

  return (
    <>
      <Rig target={data.truck} follow={seguir} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#5566aa", "#0a0c12", 0.5]} />
      <directionalLight position={[12, 20, 8]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} />
      <Terreno />

      {/* contexto: pads de la ruta */}
      {data.pads.map((p, i) => (
        <mesh key={i} position={[p.v.x, 0.03, p.v.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.4, 2.4]} />
          <meshStandardMaterial color="#1b2130" roughness={0.9} />
        </mesh>
      ))}

      {/* camino (base oscura) */}
      <Line points={data.samples} color="#232838" lineWidth={15} />

      {/* ruta planificada (tenue, punteada) */}
      {plan.length >= 2 && (
        <Line points={plan} color="#7a5bc0" lineWidth={3} dashed dashSize={0.7} gapSize={0.5} transparent opacity={0.55} />
      )}
      {/* ruta ejecutada: cuerpo violeta + núcleo claro (el bloom aporta el halo) */}
      {exec.length >= 2 && <Line points={exec} color="#A774FF" lineWidth={7} />}
      {exec.length >= 2 && <Line points={exec} color="#EDE4FF" lineWidth={2.2} />}

      {/* destino */}
      <Destino v={data.dest} label={WAYPOINTS[tr.ruta[tr.ruta.length - 1].wp].label} />

      {/* camioneta */}
      <group position={data.truck} rotation={[0, data.heading, 0]}>
        <Pickup estadoColor={estHex} beam={beam} />
        {data.desactualizada && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
            <ringGeometry args={[1.8, 2.0, 40]} />
            <meshStandardMaterial color="#F7BD43" emissive="#F7BD43" emissiveIntensity={1} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
      {/* etiqueta de la camioneta (billboard) */}
      <Html position={[data.truck.x, 2.4, data.truck.z]} center distanceFactor={24} style={{ pointerEvents: "none" }}>
        <div className="scene-veh">
          {c.id}{data.desactualizada ? <span className="stale"> · desactualizada</span> : null}
          {enEspera && <span className="scene-pill">{Math.round(now - tramo!.from)} min</span>}
        </div>
      </Html>

      <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={60} blur={2.4} far={8} resolution={512} color="#000000" />
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.28} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
      </EffectComposer>
    </>
  );
}

export default function TrackingScene3D() {
  const now = useOps((s) => s.now);
  const cuadrillaSel = useOps((s) => s.cuadrillaSel);
  const seguir = useOps((s) => s.segSeguir);
  const toggleSeguir = useOps((s) => s.toggleSeguir);
  const setSegRender = useOps((s) => s.setSegRender);

  const tr = TRACKS.find((t) => t.id === cuadrillaSel) ?? TRACKS[0];
  const c = CUADRILLAS.find((x) => x.id === tr.id)!;
  const mov = movilidad(tr, now);

  return (
    <div className="tmap tscene">
      {/* controles (HTML, Motion lo maneja el resto de la UI) */}
      <div className="tmap__top">
        <div className="tscene__switch">
          <button className="on" disabled>3D</button>
          <button onClick={() => setSegRender("2d")}>2D</button>
        </div>
        <button className="tmap__seguir" onClick={() => { toggleSeguir(); world.followResource(!seguir ? tr.id : null); }}>
          Seguir <span className={`switch ${seguir ? "on" : ""}`} />
        </button>
      </div>

      <Canvas shadows dpr={[1, 1.6]} camera={{ position: [0, 20, 24], fov: 42 }} gl={{ antialias: true }}>
        <color attach="background" args={["#0b0e15"]} />
        <fog attach="fog" args={["#0b0e15", 40, 90]} />
        <Escena tr={tr} now={now} seguir={seguir} />
      </Canvas>

      {/* etiqueta de estado del recurso en escena */}
      <div className="tscene__badge" style={{ ["--c" as string]: MOVILIDAD_COLOR[mov] }}>
        <span className="dot" /> {c.id} · {c.tarea} — {MOVILIDAD_LABEL[mov]}
      </div>

      <span className="tmap__tag demo-badge">Escena demo 3D · geometría representativa, no validada · camioneta provisional (GLB pendiente)</span>
      <div className="tmap__legend">
        <span className="lg"><span className="ln" /> Ejecutado</span>
        <span className="lg"><span className="ln ln--plan" /> Planificado</span>
      </div>
    </div>
  );
}
