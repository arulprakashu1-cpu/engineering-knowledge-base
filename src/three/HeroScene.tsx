import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Theme } from "../types";

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

/** Deterministic PRNG so the board layout is stable across renders. */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface HeroPalette {
  bg: string;
  board: string;
  boardEdge: string;
  trace: string;
  traceGlow: string;
  copper: string;
  chip: string;
  chipTop: string;
  particle: string;
  keyLight: string;
  fillLight: string;
  led: string;
  bloomIntensity: number;
  vignette: number;
}

const HERO_PALETTES: Record<Theme, HeroPalette> = {
  light: {
    bg: "#F2F5F6",
    board: "#11666C",
    boardEdge: "#0C4C51",
    trace: "#2CB9AC",
    traceGlow: "#3DE0CE",
    copper: "#C06A20",
    chip: "#20262D",
    chipTop: "#2C333B",
    particle: "#0E7C82",
    keyLight: "#FFFFFF",
    fillLight: "#C06A20",
    led: "#E8A566",
    bloomIntensity: 0.35,
    vignette: 0.12,
  },
  dark: {
    bg: "#04070A",
    board: "#0C272E",
    boardEdge: "#081A1F",
    trace: "#2ED0BE",
    traceGlow: "#3DE0CE",
    copper: "#E8A566",
    chip: "#090E12",
    chipTop: "#131B21",
    particle: "#3DE0CE",
    keyLight: "#BFFFF4",
    fillLight: "#E8A566",
    led: "#FFB877",
    bloomIntensity: 1.05,
    vignette: 0.42,
  },
};

const BOARD_W = 8.2;
const BOARD_D = 4.4;
const BOARD_T = 0.14;
const TRACE_Y = BOARD_T / 2 + 0.012;

interface Seg {
  x: number;
  z: number;
  w: number;
  d: number;
}

interface Chip {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

const CHIPS: Chip[] = [
  { x: -1.5, z: -0.55, w: 1.25, d: 1.25, h: 0.2 },
  { x: 1.25, z: 0.65, w: 1.7, d: 1.05, h: 0.24 },
  { x: 2.5, z: -1.15, w: 0.85, d: 0.85, h: 0.15 },
  { x: -2.95, z: 0.95, w: 0.95, d: 0.6, h: 0.12 },
  { x: 0.15, z: -1.5, w: 0.6, d: 0.6, h: 0.12 },
  { x: 3.35, z: 0.9, w: 0.55, d: 0.9, h: 0.13 },
];

/** Small status LEDs scattered near the chips. */
const LEDS: Array<{ x: number; z: number; phase: number }> = [
  { x: -0.6, z: -0.15, phase: 0.0 },
  { x: 2.05, z: 0.15, phase: 1.4 },
  { x: -2.3, z: 0.5, phase: 2.6 },
  { x: 0.9, z: -1.15, phase: 3.9 },
  { x: 3.0, z: -0.45, phase: 5.1 },
];

function buildTraces(): { segs: Seg[]; vias: Array<[number, number]> } {
  const rand = mulberry32(1337);
  const segs: Seg[] = [];
  const vias: Array<[number, number]> = [];
  const maxX = BOARD_W / 2 - 0.35;
  const maxZ = BOARD_D / 2 - 0.3;
  const clampX = (v: number) => Math.max(-maxX, Math.min(maxX, v));
  const clampZ = (v: number) => Math.max(-maxZ, Math.min(maxZ, v));

  for (let i = 0; i < 22; i++) {
    const x0 = clampX((rand() - 0.5) * BOARD_W * 0.92);
    const z0 = clampZ((rand() - 0.5) * BOARD_D * 0.92);
    const dir1 = rand() > 0.5 ? 1 : -1;
    const dir2 = rand() > 0.5 ? 1 : -1;
    const x1 = clampX(x0 + dir1 * (0.6 + rand() * 1.9));
    const z1 = clampZ(z0 + dir2 * (0.4 + rand() * 1.3));
    // horizontal run, then vertical bend — classic PCB routing
    segs.push({ x: (x0 + x1) / 2, z: z0, w: Math.abs(x1 - x0), d: 0.05 });
    segs.push({ x: x1, z: (z0 + z1) / 2, w: 0.05, d: Math.abs(z1 - z0) });
    vias.push([x0, z0]);
    vias.push([x1, z1]);
  }
  return { segs, vias };
}

function buildParticles(): Float32Array {
  const rand = mulberry32(99);
  const n = 130;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = (rand() - 0.5) * 10;
    arr[i * 3 + 1] = 0.2 + rand() * 3.2;
    arr[i * 3 + 2] = (rand() - 0.5) * 6;
  }
  return arr;
}

/** Gold edge-connector fingers along the front edge of the board. */
function buildFingers(): number[] {
  const xs: number[] = [];
  for (let i = 0; i < 16; i++) xs.push(-2.2 + i * 0.29);
  return xs;
}

/* ------------------------------------------------------------------ */
/* Scene contents                                                      */
/* ------------------------------------------------------------------ */

function BoardScene({ pal, reduced }: { pal: HeroPalette; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points>(null);
  const orbit = useRef<THREE.PointLight>(null);
  const ledRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);

  const { segs, vias } = useMemo(buildTraces, []);
  const particlePositions = useMemo(buildParticles, []);
  const fingers = useMemo(buildFingers, []);

  const traceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: pal.trace,
        emissive: pal.traceGlow,
        emissiveIntensity: 1.6,
        roughness: 0.25,
        metalness: 0.55,
      }),
    [pal]
  );
  const viaMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: pal.copper,
        emissive: pal.copper,
        emissiveIntensity: 0.7,
        roughness: 0.3,
        metalness: 0.9,
      }),
    [pal]
  );
  useEffect(() => {
    return () => {
      traceMat.dispose();
      viaMat.dispose();
    };
  }, [traceMat, viaMat]);

  useFrame((state) => {
    const g = group.current;
    if (!g || reduced) return;
    const t = state.clock.elapsedTime;
    // gentle yaw drift + pointer parallax
    const targetY = Math.sin(t * 0.12) * 0.14 + state.pointer.x * 0.11;
    const targetX = -0.04 + state.pointer.y * 0.06;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.04);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.04);
    g.position.y = -0.25 + Math.sin(t * 0.5) * 0.045;

    traceMat.emissiveIntensity = 1.6 + Math.sin(t * 1.6) * 0.55;
    viaMat.emissiveIntensity = 0.7 + Math.sin(t * 1.6 + 1.2) * 0.3;
    for (let i = 0; i < LEDS.length; i++) {
      const m = ledRefs.current[i];
      if (m) m.emissiveIntensity = 1.6 + Math.sin(t * 2.4 + LEDS[i].phase) * 1.4;
    }
    if (particles.current) {
      particles.current.rotation.y = t * 0.03;
      particles.current.position.y = Math.sin(t * 0.35) * 0.12;
    }
    if (orbit.current) {
      orbit.current.position.x = Math.cos(t * 0.4) * 3.2;
      orbit.current.position.z = Math.sin(t * 0.4) * 1.8;
    }
  });

  return (
    <group ref={group} position={[0.85, -0.25, 0]} rotation={[-0.04, -0.08, 0]}>
      {/* Board substrate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[BOARD_W, BOARD_T, BOARD_D]} />
        <meshStandardMaterial color={pal.board} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Copper rim */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[BOARD_W + 0.08, BOARD_T * 0.55, BOARD_D + 0.08]} />
        <meshStandardMaterial color={pal.copper} roughness={0.28} metalness={0.9} />
      </mesh>
      {/* Inner ground-plane sheen */}
      <mesh position={[0, -BOARD_T * 0.35, 0]}>
        <boxGeometry args={[BOARD_W * 0.985, BOARD_T * 0.2, BOARD_D * 0.985]} />
        <meshStandardMaterial color={pal.boardEdge} roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Gold edge-connector fingers (front edge) */}
      <group>
        {fingers.map((x, i) => (
          <mesh key={i} position={[x, TRACE_Y - 0.002, BOARD_D / 2 - 0.16]}>
            <boxGeometry args={[0.11, 0.018, 0.3]} />
            <meshStandardMaterial
              color={pal.copper}
              emissive={pal.copper}
              emissiveIntensity={0.25}
              roughness={0.22}
              metalness={1}
            />
          </mesh>
        ))}
      </group>

      {/* Glowing traces (shared pulsing material) */}
      <group>
        {segs.map((s, i) => (
          <mesh key={i} position={[s.x, TRACE_Y, s.z]} material={traceMat}>
            <boxGeometry args={[Math.max(s.w, 0.05), 0.02, Math.max(s.d, 0.05)]} />
          </mesh>
        ))}
      </group>

      {/* Vias */}
      <group>
        {vias.map(([x, z], i) => (
          <mesh key={i} position={[x, TRACE_Y + 0.005, z]} material={viaMat}>
            <cylinderGeometry args={[0.055, 0.055, 0.035, 14]} />
          </mesh>
        ))}
      </group>

      {/* IC packages */}
      {CHIPS.map((c, i) => (
        <group key={i} position={[c.x, BOARD_T / 2 + c.h / 2, c.z]}>
          <mesh>
            <boxGeometry args={[c.w, c.h, c.d]} />
            <meshStandardMaterial color={pal.chip} roughness={0.42} metalness={0.4} />
          </mesh>
          {/* lid */}
          <mesh position={[0, c.h / 2 + 0.006, 0]}>
            <boxGeometry args={[c.w * 0.78, 0.012, c.d * 0.78]} />
            <meshStandardMaterial color={pal.chipTop} roughness={0.25} metalness={0.65} />
          </mesh>
          {/* pin-1 dot */}
          <mesh position={[-c.w * 0.3, c.h / 2 + 0.016, -c.d * 0.3]}>
            <cylinderGeometry args={[0.035, 0.035, 0.01, 12]} />
            <meshStandardMaterial
              color={pal.traceGlow}
              emissive={pal.traceGlow}
              emissiveIntensity={2.2}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Blinking status LEDs */}
      {LEDS.map((l, i) => (
        <mesh key={i} position={[l.x, BOARD_T / 2 + 0.035, l.z]}>
          <boxGeometry args={[0.08, 0.05, 0.05]} />
          <meshStandardMaterial
            ref={(m: THREE.MeshStandardMaterial | null) => {
              ledRefs.current[i] = m;
            }}
            color={pal.led}
            emissive={pal.led}
            emissiveIntensity={1.6}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Floating solder-mote particles */}
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={pal.particle}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Roaming accent light */}
      <pointLight ref={orbit} position={[2.5, 2.2, 1]} intensity={16} color={pal.traceGlow} distance={9} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export function HeroScene({ theme }: { theme: Theme }) {
  const reduced = usePrefersReducedMotion();
  const pal = HERO_PALETTES[theme];

  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.75]}
      frameloop={reduced ? "demand" : "always"}
      camera={{ position: [0, 3.1, 5.4], fov: 40 }}
      onCreated={({ camera }) => camera.lookAt(0.6, -0.2, 0)}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[pal.bg]} />
      <fog attach="fog" args={[pal.bg, 7.5, 15]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} color={pal.keyLight} />
      <directionalLight position={[-5, 3, -2]} intensity={0.55} color={pal.fillLight} />
      <BoardScene pal={pal} reduced={reduced} />
      {/* Neon post-processing — skipped under prefers-reduced-motion for perf */}
      {!reduced && (
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={pal.bloomIntensity}
            luminanceThreshold={0.28}
            luminanceSmoothing={0.3}
            mipmapBlur
            radius={0.75}
          />
          <Vignette eskil={false} offset={0.16} darkness={pal.vignette} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
