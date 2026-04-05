"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ─── A single flowing data stream ─── */

interface StreamProps {
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  midOffset: [number, number, number];
  color: string;
  count?: number;
  speed?: number;
  size?: number;
}

function DataStream({
  startPoint,
  endPoint,
  midOffset,
  color,
  count = 60,
  speed = 0.4,
  size = 0.02,
}: StreamProps) {
  const ref = useRef<THREE.Points>(null);

  const { curve, initialPositions } = useMemo(() => {
    const s = new THREE.Vector3(...startPoint);
    const e = new THREE.Vector3(...endPoint);
    const mid = new THREE.Vector3(
      (s.x + e.x) / 2 + midOffset[0],
      (s.y + e.y) / 2 + midOffset[1],
      (s.z + e.z) / 2 + midOffset[2],
    );
    const c = new THREE.QuadraticBezierCurve3(s, mid, e);

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const point = c.getPoint(t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    return { curve: c, initialPositions: positions };
  }, [startPoint, endPoint, midOffset, count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const positionAttr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const time = clock.elapsedTime * speed;

    for (let i = 0; i < count; i++) {
      const t = ((i / count + time) % 1);
      const point = curve.getPoint(t);
      positionAttr.setXYZ(i, point.x, point.y, point.z);
    }
    positionAttr.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={initialPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

/* ─── Multiple streams grouped ─── */

export function DataStreams() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (pointer.x * 0.1 - groupRef.current.rotation.y) * 0.02;
    groupRef.current.rotation.x += (-pointer.y * 0.06 - groupRef.current.rotation.x) * 0.02;
  });

  return (
    <group ref={groupRef}>
      <DataStream
        startPoint={[-3, 1, -1]}
        endPoint={[3, -0.5, -1]}
        midOffset={[0, 1.5, 1]}
        color="#22d3ee"
        count={80}
        speed={0.3}
        size={0.018}
      />
      <DataStream
        startPoint={[2.5, 1.5, -0.5]}
        endPoint={[-2.5, -1, 0]}
        midOffset={[0, -1, 1.5]}
        color="#818cf8"
        count={60}
        speed={0.25}
        size={0.015}
      />
      <DataStream
        startPoint={[-1, -1.5, 0]}
        endPoint={[2, 1, -1.5]}
        midOffset={[1, 0.5, 0.5]}
        color="#c084fc"
        count={50}
        speed={0.35}
        size={0.012}
      />
      <DataStream
        startPoint={[0, 2, -0.5]}
        endPoint={[0, -2, 0.5]}
        midOffset={[2, 0, 0.8]}
        color="#34d399"
        count={40}
        speed={0.2}
        size={0.014}
      />
    </group>
  );
}
