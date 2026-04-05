"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

/* ─── Shaders ─────────────────────────────────────────── */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  varying vec2  vUv;

  void main() {
    // Moving scan line
    float scan = sin((vUv.y - uTime * 0.22) * 52.0) * 0.022 + 0.022;

    // Edge glow
    float ex   = min(vUv.x, 1.0 - vUv.x);
    float ey   = min(vUv.y, 1.0 - vUv.y);
    float edge = pow(max(0.0, 1.0 - min(ex, ey) * 13.0), 2.2);

    // Subtle interior grid
    float gx   = step(0.955, fract(vUv.x * 7.0)) * 0.055;
    float gy   = step(0.955, fract(vUv.y * 5.0)) * 0.055;

    // Shimmer effect
    float shimmer = sin(vUv.x * 15.0 + uTime * 3.0) * sin(vUv.y * 12.0 - uTime * 2.0) * 0.012;

    float alpha = 0.07 + scan + edge * 0.55 + gx + gy + shimmer;
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.94));
  }
`;

/* ─── Data Bar Shader (for mini charts on panels) ─── */
const BAR_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  varying vec2  vUv;

  void main() {
    // Create bar chart effect
    float barWidth = 0.12;
    float barCount = 7.0;
    float barIndex = floor(vUv.x * barCount);
    float barCenter = (barIndex + 0.5) / barCount;
    float barX = abs(vUv.x - barCenter) * barCount;

    // Animated bar heights
    float barHeight = 0.3 + 0.6 * sin(barIndex * 1.5 + uTime * 0.8) * 0.5 + 0.5;
    barHeight = barHeight * (0.4 + sin(barIndex * 2.1 + 0.5) * 0.3);

    float bar = step(barX, barWidth * barCount * 0.5) * step(1.0 - vUv.y, barHeight);
    float glow = bar * 0.6 + bar * sin(uTime + barIndex) * 0.15;

    float alpha = glow * 0.8;
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.85));
  }
`;

/* ─── HoloPanel ───────────────────────────────────────── */
interface HoloPanelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color: string;
  floatSpeed?: number;
  width?: number;
  height?: number;
  variant?: "default" | "chart";
}

function HoloPanel({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color,
  floatSpeed = 1.5,
  width = 1.5,
  height = 0.95,
  variant = "default",
}: HoloPanelProps) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
        },
        vertexShader: VERT,
        fragmentShader: variant === "chart" ? BAR_FRAG : FRAG,
      }),
    [color, variant],
  );

  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      }),
    [color],
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.28} floatIntensity={0.7}>
      <group position={position} rotation={rotation} scale={scale}>
        {/* Glow halo behind */}
        <mesh material={glowMat} position={[0, 0, -0.015]}>
          <planeGeometry args={[width + 0.1, height + 0.1]} />
        </mesh>
        {/* Holographic panel */}
        <mesh material={mat}>
          <planeGeometry args={[width, height]} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─── Orbiting ring ───────────────────────────────────── */
function OrbitRing({ radius = 0.42, thickness = 0.018, color = "#22d3ee", speed = 0.4, opacity = 0.35 }: { radius?: number; thickness?: number; color?: string; speed?: number; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed;
      ref.current.rotation.x += delta * speed * 0.35;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.6]}>
      <torusGeometry args={[radius, thickness, 6, 80]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

/* ─── Data Particles orbiting the scene ─── */
function OrbitalParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 50;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.55 + Math.random() * 0.3;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.3;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#22d3ee" size={0.015} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ─── Scene ───────────────────────────────────────────── */
function Scene() {
  const groupRef = useRef<Group>(null);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y +=
      (pointer.x * 0.35 - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x +=
      (-pointer.y * 0.18 - groupRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef}>
      {/* Main large panel — cyan */}
      <HoloPanel
        position={[-0.75, 0.25, 0]}
        rotation={[0.05, 0.22, 0]}
        color="#22d3ee"
        floatSpeed={1.3}
        width={1.6}
        height={1.05}
      />
      {/* Top-right — indigo with chart */}
      <HoloPanel
        position={[0.82, 0.55, -0.25]}
        rotation={[0, -0.24, 0.04]}
        scale={0.82}
        color="#818cf8"
        floatSpeed={1.8}
        width={1.5}
        height={0.9}
        variant="chart"
      />
      {/* Bottom-right — violet */}
      <HoloPanel
        position={[0.65, -0.5, 0.15]}
        rotation={[0.08, 0.18, -0.06]}
        scale={0.7}
        color="#c084fc"
        floatSpeed={2.2}
        width={1.4}
        height={0.85}
      />
      {/* Small top card */}
      <HoloPanel
        position={[-0.2, 0.8, -0.4]}
        rotation={[-0.05, 0.1, 0.03]}
        scale={0.5}
        color="#34d399"
        floatSpeed={1.6}
        width={1.2}
        height={0.7}
        variant="chart"
      />
      {/* Extra: bottom-left panel */}
      <HoloPanel
        position={[-1.1, -0.55, -0.15]}
        rotation={[0.04, 0.3, 0.02]}
        scale={0.55}
        color="#38bdf8"
        floatSpeed={1.9}
        width={1.1}
        height={0.65}
      />

      {/* Orbit rings */}
      <OrbitRing radius={0.42} thickness={0.018} color="#22d3ee" speed={0.4} opacity={0.35} />
      <OrbitRing radius={0.24} thickness={0.008} color="#c084fc" speed={-0.6} opacity={0.5} />
      <OrbitRing radius={0.6} thickness={0.006} color="#818cf8" speed={0.25} opacity={0.2} />

      {/* Orbital particles */}
      <OrbitalParticles />
    </group>
  );
}

/* ─── Export ──────────────────────────────────────────── */
export function DashboardScene() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.1), rgba(34,211,238,0.06), transparent 70%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <pointLight position={[3, 3, 3]} intensity={1.8} color="#22d3ee" />
          <pointLight position={[-3, -1, 2]} intensity={1.2} color="#818cf8" />
          <pointLight position={[0, -2, 3]} intensity={0.8} color="#c084fc" />
          <ambientLight intensity={0.3} />
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
