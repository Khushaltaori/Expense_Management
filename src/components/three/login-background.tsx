"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

/* ─── Particle Layer ─── */
function ParticleLayer({
  count,
  seed,
  color,
  size,
  rotSpeed,
  range,
  opacity = 0.9,
}: {
  count: number;
  seed: number;
  color: string;
  size: number;
  rotSpeed: number;
  range: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      const s = seed + i;
      const v = Math.sin(s * 12.9898 + seed * 0.317) * 43758.5453;
      arr[i] = (v - Math.floor(v) - 0.5) * range;
    }
    return arr;
  }, [count, seed, range]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * rotSpeed;
    ref.current.rotation.x += delta * rotSpeed * 0.3;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </Points>
  );
}

/* ─── Holographic Login Panel (decorative) ─── */
const PANEL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PANEL_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  varying vec2  vUv;

  void main() {
    float scan = sin((vUv.y - uTime * 0.18) * 45.0) * 0.02 + 0.02;
    float ex = min(vUv.x, 1.0 - vUv.x);
    float ey = min(vUv.y, 1.0 - vUv.y);
    float edge = pow(max(0.0, 1.0 - min(ex, ey) * 12.0), 2.2);
    float gx = step(0.96, fract(vUv.x * 6.0)) * 0.04;
    float gy = step(0.96, fract(vUv.y * 4.0)) * 0.04;
    float alpha = 0.04 + scan + edge * 0.4 + gx + gy;
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.7));
  }
`;

function HoloPanel({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color,
  width = 1.2,
  height = 0.8,
  floatSpeed = 1.5,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color: string;
  width?: number;
  height?: number;
  floatSpeed?: number;
}) {
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
        vertexShader: PANEL_VERT,
        fragmentShader: PANEL_FRAG,
      }),
    [color],
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.18} floatIntensity={0.5}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh material={mat}>
          <planeGeometry args={[width, height]} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─── Orbit Ring ─── */
function OrbitRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.3;
      ref.current.rotation.x += delta * 0.12;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <torusGeometry args={[0.5, 0.01, 6, 80]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} />
    </mesh>
  );
}

/* ─── Full Scene ─── */
function LoginScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (pointer.x * 0.12 - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x += (-pointer.y * 0.06 - groupRef.current.rotation.x) * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* Particles */}
      <ParticleLayer count={900} seed={100} color="#22d3ee" size={0.007} rotSpeed={0.025} range={14} opacity={0.45} />
      <ParticleLayer count={500} seed={2000} color="#818cf8" size={0.011} rotSpeed={0.018} range={10} opacity={0.55} />
      <ParticleLayer count={200} seed={4000} color="#c084fc" size={0.015} rotSpeed={0.01} range={8} opacity={0.6} />
      <ParticleLayer count={60} seed={5500} color="#ffffff" size={0.022} rotSpeed={0.006} range={5} opacity={0.85} />

      {/* Decorative holo panels — far behind */}
      <HoloPanel position={[-3.5, 1.2, -3]} rotation={[0.05, 0.3, 0.02]} color="#22d3ee" width={1.8} height={1.1} scale={0.6} floatSpeed={1.0} />
      <HoloPanel position={[3.2, 0.8, -2.5]} rotation={[0, -0.25, 0.03]} color="#818cf8" width={1.5} height={0.9} scale={0.5} floatSpeed={1.4} />
      <HoloPanel position={[2.8, -1.2, -3.5]} rotation={[0.06, 0.15, -0.04]} color="#c084fc" width={1.3} height={0.8} scale={0.45} floatSpeed={1.7} />
      <HoloPanel position={[-3, -0.8, -2.8]} rotation={[-0.04, -0.2, 0.02]} color="#34d399" width={1.1} height={0.65} scale={0.4} floatSpeed={1.3} />

      {/* Orbit ring */}
      <OrbitRing />
    </group>
  );
}

/* ─── Export ─── */
export function LoginBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 65 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <LoginScene />
      </Canvas>
    </div>
  );
}
