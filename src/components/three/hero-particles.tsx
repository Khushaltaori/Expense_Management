"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

interface LayerProps {
  count: number;
  seed: number;
  color: string;
  size: number;
  rotSpeed: number;
  range: number;
  opacity?: number;
}

function ParticleLayer({ count, seed, color, size, rotSpeed, range, opacity = 0.9 }: LayerProps) {
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
    ref.current.rotation.x += delta * rotSpeed * 0.38;
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

/* ─── Constellation Lines ─── */
function ConstellationLines({ count, seed, range }: { count: number; seed: number; range: number }) {
  const ref = useRef<THREE.LineSegments>(null);
  const threshold = 2.2;

  const geometry = useMemo(() => {
    // Generate positions
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const ix = seed + i * 3;
      const iy = seed + i * 3 + 1;
      const iz = seed + i * 3 + 2;
      const vx = Math.sin(ix * 12.9898 + seed * 0.317) * 43758.5453;
      const vy = Math.sin(iy * 12.9898 + seed * 0.317) * 43758.5453;
      const vz = Math.sin(iz * 12.9898 + seed * 0.317) * 43758.5453;
      nodes.push(
        new THREE.Vector3(
          (vx - Math.floor(vx) - 0.5) * range,
          (vy - Math.floor(vy) - 0.5) * range,
          (vz - Math.floor(vz) - 0.5) * range,
        ),
      );
    }

    // Find connections
    const segments: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < threshold) {
          segments.push(nodes[i].x, nodes[i].y, nodes[i].z);
          segments.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(segments, 3));
    return geo;
  }, [count, seed, range, threshold]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.015;
    ref.current.rotation.x += delta * 0.006;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#22d3ee" transparent opacity={0.06} />
    </lineSegments>
  );
}

function MouseReactiveField() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const targetY = pointer.x * 0.28;
    const targetX = -pointer.y * 0.14;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Deep background — faint cyan cloud */}
      <ParticleLayer
        count={1200}
        seed={0}
        color="#22d3ee"
        size={0.008}
        rotSpeed={0.032}
        range={15}
        opacity={0.5}
      />
      {/* Mid layer — indigo */}
      <ParticleLayer
        count={700}
        seed={1500}
        color="#818cf8"
        size={0.012}
        rotSpeed={0.02}
        range={11}
        opacity={0.65}
      />
      {/* Accent layer — violet */}
      <ParticleLayer
        count={350}
        seed={3000}
        color="#c084fc"
        size={0.017}
        rotSpeed={0.013}
        range={9}
        opacity={0.7}
      />
      {/* Bright hotspot nodes */}
      <ParticleLayer
        count={100}
        seed={4500}
        color="#ffffff"
        size={0.025}
        rotSpeed={0.007}
        range={6}
        opacity={0.9}
      />
      {/* Extra depth layer — emerald */}
      <ParticleLayer
        count={200}
        seed={6000}
        color="#34d399"
        size={0.01}
        rotSpeed={0.025}
        range={13}
        opacity={0.4}
      />

      {/* Constellation effect — connecting lines */}
      <ConstellationLines count={100} seed={4500} range={6} />
    </group>
  );
}

export function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 72 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <MouseReactiveField />
      </Canvas>
    </div>
  );
}
