"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ─── Expense Card Panel (3D plane with custom shader) ─── */
const CARD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CARD_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uOpacity;
  varying vec2  vUv;

  void main() {
    float ex = min(vUv.x, 1.0 - vUv.x);
    float ey = min(vUv.y, 1.0 - vUv.y);
    float edge = pow(max(0.0, 1.0 - min(ex, ey) * 10.0), 2.5);

    float scan = sin((vUv.y - uTime * 0.15) * 40.0) * 0.015 + 0.015;

    // Subtle shimmer
    float shimmer = sin(vUv.x * 20.0 + uTime * 2.0) * sin(vUv.y * 15.0 - uTime * 1.5) * 0.01;

    float inner = 0.04 + scan + shimmer;
    float alpha = (inner + edge * 0.6) * uOpacity;

    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.92));
  }
`;

interface CardPanelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color: string;
  width?: number;
  height?: number;
  floatSpeed?: number;
  opacity?: number;
}

function CardPanel({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color,
  width = 1.2,
  height = 0.75,
  floatSpeed = 1.5,
  opacity = 1,
}: CardPanelProps) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: opacity },
        },
        vertexShader: CARD_VERT,
        fragmentShader: CARD_FRAG,
      }),
    [color, opacity],
  );

  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      }),
    [color],
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh material={glowMat} position={[0, 0, -0.01]}>
          <planeGeometry args={[width + 0.06, height + 0.06]} />
        </mesh>
        <mesh material={mat}>
          <planeGeometry args={[width, height]} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─── Connecting Data Lines ─── */
function DataLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const lineObj = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 });
    return new THREE.Line(geometry, material);
  }, [start, end, color]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.15 + Math.sin(clock.elapsedTime * 2) * 0.1;
  });

  return <primitive object={lineObj} />;
}

/* ─── Scene ─── */
function FloatingCardsScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (pointer.x * 0.15 - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x += (-pointer.y * 0.08 - groupRef.current.rotation.x) * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* Main expense cards */}
      <CardPanel
        position={[-1.6, 0.5, 0.2]}
        rotation={[0.05, 0.3, 0.02]}
        color="#22d3ee"
        width={1.3}
        height={0.8}
        floatSpeed={1.2}
        scale={0.85}
      />
      <CardPanel
        position={[1.4, 0.3, -0.3]}
        rotation={[0, -0.25, -0.03]}
        color="#818cf8"
        width={1.1}
        height={0.7}
        floatSpeed={1.6}
        scale={0.75}
        opacity={0.85}
      />
      <CardPanel
        position={[0.2, -0.7, 0.4]}
        rotation={[0.08, 0.1, 0.04]}
        color="#c084fc"
        width={1.0}
        height={0.65}
        floatSpeed={2.0}
        scale={0.65}
        opacity={0.75}
      />
      <CardPanel
        position={[-0.8, -0.4, -0.5]}
        rotation={[-0.05, -0.15, -0.02]}
        color="#34d399"
        width={0.9}
        height={0.55}
        floatSpeed={1.8}
        scale={0.55}
        opacity={0.65}
      />
      <CardPanel
        position={[1.8, -0.5, 0.1]}
        rotation={[0.03, 0.2, 0.05]}
        color="#38bdf8"
        width={1.0}
        height={0.6}
        floatSpeed={1.4}
        scale={0.5}
        opacity={0.55}
      />

      {/* Connecting lines */}
      <DataLine start={[-1.6, 0.5, 0.2]} end={[1.4, 0.3, -0.3]} color="#22d3ee" />
      <DataLine start={[1.4, 0.3, -0.3]} end={[0.2, -0.7, 0.4]} color="#818cf8" />
      <DataLine start={[0.2, -0.7, 0.4]} end={[-0.8, -0.4, -0.5]} color="#c084fc" />
    </group>
  );
}

/* ─── Export ─── */
export function FloatingExpenseCards() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={0.8} color="#22d3ee" />
        <FloatingCardsScene />
      </Canvas>
    </div>
  );
}
