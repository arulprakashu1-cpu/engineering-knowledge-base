import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Billboard, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Theme } from "../types";
import type { InterfaceStat } from "../pages/Dashboard";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface GalaxyPalette {
  bg: string;
  teal: string;
  tealBright: string;
  copper: string;
  dim: string;
  text: string;
  sub: string;
  star: string;
  starFar: string;
  core: string;
  link: string;
  bloomIntensity: number;
  vignette: number;
}

const GALAXY_PALETTES: Record<Theme, GalaxyPalette> = {
  light: {
    bg: "#F2F5F6",
    teal: "#0E7C82",
    tealBright: "#0A5E63",
    copper: "#C06A20",
    dim: "#C2CCD2",
    text: "#14191D",
    sub: "#58676D",
    star: "#9FB3BC",
    starFar: "#C3D0D6",
    core: "#0E7C82",
    link: "#0E7C82",
    bloomIntensity: 0.3,
    vignette: 0.1,
  },
  dark: {
    bg: "#04070A",
    teal: "#3DE0CE",
    tealBright: "#8CF5E7",
    copper: "#E8A566",
    dim: "#33414A",
    text: "#E9F5F2",
    sub: "#90A6AC",
    star: "#4E6670",
    starFar: "#2C3B44",
    core: "#3DE0CE",
    link: "#3DE0CE",
    bloomIntensity: 1.0,
    vignette: 0.4,
  },
};

/* ------------------------------------------------------------------ */
/* Background stars — two depth layers for parallax richness           */
/* ------------------------------------------------------------------ */

function makeStarPositions(seed: number, n: number, rMin: number, rSpan: number): Float32Array {
  const rand = mulberry32(seed);
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rMin + rand() * rSpan;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.cos(phi) * 0.62;
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  return arr;
}

function Stars({ pal, reduced }: { pal: GalaxyPalette; reduced: boolean }) {
  const near = useRef<THREE.Points>(null);
  const far = useRef<THREE.Points>(null);
  const nearPositions = useMemo(() => makeStarPositions(7, 420, 11, 9), []);
  const farPositions = useMemo(() => makeStarPositions(31, 300, 17, 11), []);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (near.current) near.current.rotation.y = t * 0.009;
    if (far.current) far.current.rotation.y = -t * 0.004;
  });

  return (
    <>
      <points ref={near}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nearPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.075} color={pal.star} transparent opacity={0.8} sizeAttenuation depthWrite={false} />
      </points>
      <points ref={far}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.055} color={pal.starFar} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
      </points>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Interface node                                                      */
/* ------------------------------------------------------------------ */

interface NodeData {
  stat: InterfaceStat;
  pos: [number, number, number];
  phase: number;
}

function InterfaceNode({
  data,
  maxTotal,
  pal,
  reduced,
  onSelect,
}: {
  data: NodeData;
  maxTotal: number;
  pal: GalaxyPalette;
  reduced: boolean;
  onSelect: (name: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { stat, pos, phase } = data;
  const inactive = stat.total === 0;
  const hot = !inactive && stat.total >= Math.max(1, maxTotal * 0.65);
  const radius = inactive
    ? 0.26
    : 0.32 + Math.min(1, Math.sqrt(stat.total) / 3.5) * 0.5;
  const color = inactive ? pal.dim : hot ? pal.copper : pal.teal;

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const target = hovered ? 1.22 : 1;
    const s = THREE.MathUtils.lerp(g.scale.x, target, 0.12);
    g.scale.setScalar(s);
    if (!reduced) {
      const t = state.clock.elapsedTime;
      g.position.y = pos[1] + Math.sin(t * 0.7 + phase) * 0.14;
      if (shell.current) {
        shell.current.rotation.y = t * 0.35 + phase;
        shell.current.rotation.x = t * 0.18;
      }
    }
  });

  return (
    <group ref={group} position={pos}>
      {/* core orb */}
      <mesh
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(stat.name);
        }}
      >
        <icosahedronGeometry args={[radius, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={inactive ? 0.1 : hovered ? 2.4 : 1.0}
          roughness={0.25}
          metalness={0.45}
          transparent
          opacity={inactive ? 0.4 : 1}
        />
      </mesh>
      {/* inner bright kernel — feeds the bloom halo */}
      {!inactive && (
        <mesh>
          <sphereGeometry args={[radius * 0.45, 16, 16]} />
          <meshBasicMaterial color={hovered ? pal.tealBright : color} transparent opacity={hovered ? 0.95 : 0.7} />
        </mesh>
      )}
      {/* wireframe shell */}
      <mesh ref={shell} scale={1.45}>
        <icosahedronGeometry args={[radius, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={inactive ? 0.08 : hovered ? 0.45 : 0.22}
        />
      </mesh>
      {/* hot nodes get a copper halo ring */}
      {hot && (
        <mesh rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[radius * 1.9, 0.018, 10, 48]} />
          <meshBasicMaterial color={pal.copper} transparent opacity={0.6} />
        </mesh>
      )}
      {/* labels */}
      <Billboard>
        <Text
          position={[0, -radius - 0.45, 0]}
          fontSize={0.27}
          color={inactive ? pal.sub : pal.text}
          anchorX="center"
          anchorY="middle"
          fillOpacity={inactive ? 0.6 : 1}
          outlineWidth={0.012}
          outlineColor={pal.bg}
          outlineOpacity={0.85}
        >
          {stat.name}
        </Text>
        <Text
          position={[0, -radius - 0.78, 0]}
          fontSize={0.16}
          color={hovered ? pal.tealBright : pal.sub}
          anchorX="center"
          anchorY="middle"
          fillOpacity={inactive ? 0.5 : 0.9}
          outlineWidth={0.008}
          outlineColor={pal.bg}
          outlineOpacity={0.8}
        >
          {inactive ? "no entries yet" : `${stat.total} ${stat.total === 1 ? "entry" : "entries"}`}
        </Text>
      </Billboard>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Center core                                                         */
/* ------------------------------------------------------------------ */

function Core({ pal, reduced }: { pal: GalaxyPalette; reduced: boolean }) {
  const rings = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (rings.current) {
      rings.current.rotation.y = t * 0.25;
      rings.current.rotation.x = Math.sin(t * 0.2) * 0.25;
    }
    if (coreMat.current) coreMat.current.emissiveIntensity = 1.5 + Math.sin(t * 1.3) * 0.5;
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.42, 3]} />
        <meshStandardMaterial
          ref={coreMat}
          color={pal.core}
          emissive={pal.core}
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.015, 10, 64]} />
          <meshBasicMaterial color={pal.teal} transparent opacity={0.45} />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 5, 0]}>
          <torusGeometry args={[1.12, 0.012, 10, 64]} />
          <meshBasicMaterial color={pal.copper} transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, -Math.PI / 6, 0]}>
          <torusGeometry args={[1.38, 0.008, 8, 64]} />
          <meshBasicMaterial color={pal.tealBright} transparent opacity={0.18} />
        </mesh>
      </group>
      <pointLight position={[0, 0, 0]} intensity={18} color={pal.core} distance={13} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export function InterfaceGalaxy({
  perInterface,
  onSelect,
  theme,
}: {
  perInterface: InterfaceStat[];
  onSelect: (name: string) => void;
  theme: Theme;
}) {
  const reduced = usePrefersReducedMotion();
  const pal = GALAXY_PALETTES[theme];

  const maxTotal = useMemo(
    () => perInterface.reduce((m, s) => Math.max(m, s.total), 0),
    [perInterface]
  );

  const nodes = useMemo<NodeData[]>(() => {
    const n = Math.max(1, perInterface.length);
    return perInterface.map((stat, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const radius = 4.3 + ((i % 3) - 1) * 0.55;
      const y = Math.sin(angle * 2.3 + i * 0.9) * 1.15;
      return {
        stat,
        pos: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        phase: i * 0.73,
      };
    });
  }, [perInterface]);

  return (
    <>
      <Canvas
        style={{ position: "absolute", inset: 0 }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 2.4, 9.2], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[pal.bg]} />
        <fog attach="fog" args={[pal.bg, 12, 24]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 7, 4]} intensity={1.1} />
        <directionalLight position={[-6, -2, -4]} intensity={0.4} color={pal.copper} />

        <Stars pal={pal} reduced={reduced} />
        <Core pal={pal} reduced={reduced} />

        {/* Circuit links: faint traces from the core out to each interface node */}
        {nodes.map((d) => (
          <Line
            key={`link-${d.stat.name}`}
            points={[
              [0, 0, 0],
              [d.pos[0] * 0.42, d.pos[1] * 0.55, d.pos[2] * 0.42],
              d.pos,
            ]}
            color={d.stat.total === 0 ? pal.dim : pal.link}
            transparent
            opacity={d.stat.total === 0 ? 0.07 : 0.16}
            lineWidth={1}
            depthWrite={false}
          />
        ))}

        {nodes.map((d) => (
          <InterfaceNode
            key={d.stat.name}
            data={d}
            maxTotal={maxTotal}
            pal={pal}
            reduced={reduced}
            onSelect={onSelect}
          />
        ))}

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!reduced}
          autoRotateSpeed={0.55}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.72}
        />

        {/* Neon glow — skipped under prefers-reduced-motion for perf */}
        {!reduced && (
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={pal.bloomIntensity}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.3}
              mipmapBlur
              radius={0.8}
            />
            <Vignette eskil={false} offset={0.14} darkness={pal.vignette} />
          </EffectComposer>
        )}
      </Canvas>
      <div className="galaxy-hint">Drag to orbit · Click a node to open</div>
    </>
  );
}
