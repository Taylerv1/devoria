"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { heroSceneConfig } from "./sceneConfig";
import type { HeroSceneSettings } from "./useHeroSceneSettings";

interface HeroSceneCanvasProps {
  settings: HeroSceneSettings;
}

interface OrbitNodesProps {
  animated: boolean;
  color: string;
  count: number;
  radius: number;
  reverse?: boolean;
  rotation: [number, number, number];
  scale?: [number, number, number];
}

interface FieldParticlesProps {
  animated: boolean;
  color: string;
  count: number;
  innerRadius: number;
  opacity: number;
  outerRadius: number;
  rotationSpeed: number;
  size: number;
  verticalScale?: number;
}

interface DataPanelProps {
  accentColor: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

function DataPanel({
  accentColor,
  position,
  rotation,
  scale,
}: DataPanelProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <boxGeometry args={[1.6, 0.86, 0.06]} />
        <meshStandardMaterial
          color={heroSceneConfig.colors.surface}
          emissive={accentColor}
          emissiveIntensity={0.03}
          metalness={0.3}
          roughness={0.78}
          transparent
          opacity={0.48}
        />
      </mesh>

      <mesh scale={[1.04, 1.06, 1.18]}>
        <boxGeometry args={[1.6, 0.86, 0.06]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      <mesh position={[-0.24, 0.22, 0.05]}>
        <boxGeometry args={[0.72, 0.08, 0.02]} />
        <meshBasicMaterial
          color={heroSceneConfig.colors.text}
          transparent
          opacity={0.38}
        />
      </mesh>

      <mesh position={[0.08, -0.02, 0.05]}>
        <boxGeometry args={[1.04, 0.08, 0.02]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.45} />
      </mesh>

      <mesh position={[-0.4, -0.24, 0.05]}>
        <boxGeometry args={[0.42, 0.08, 0.02]} />
        <meshBasicMaterial
          color={heroSceneConfig.colors.text}
          transparent
          opacity={0.22}
        />
      </mesh>
    </group>
  );
}

function OrbitNodes({
  animated,
  color,
  count,
  radius,
  reverse = false,
  rotation,
  scale = [1, 1, 1],
}: OrbitNodesProps) {
  const group = useRef<THREE.Group>(null);

  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2;

        return [
          Math.cos(angle) * radius * scale[0],
          Math.sin(angle) * radius * 0.72 * scale[1],
          Math.sin(angle * 1.5) * 0.28 * scale[2],
        ] as [number, number, number];
      }),
    [count, radius, scale]
  );

  useFrame((_, delta) => {
    if (!animated || !group.current) {
      return;
    }

    group.current.rotation.y += delta * (reverse ? -0.3 : 0.24);
  });

  return (
    <group ref={group} rotation={rotation}>
      {nodes.map((position, index) => (
        <mesh key={`${color}-${index}`} position={position}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function FieldParticles({
  animated,
  color,
  count,
  innerRadius,
  opacity,
  outerRadius,
  rotationSpeed,
  size,
  verticalScale = 0.85,
}: FieldParticlesProps) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = THREE.MathUtils.randFloat(innerRadius, outerRadius);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      values[index * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      values[index * 3 + 1] = Math.cos(phi) * radius * verticalScale;
      values[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    }

    return values;
  }, [count, innerRadius, outerRadius, verticalScale]);

  useFrame((_, delta) => {
    if (!animated || !points.current) {
      return;
    }

    points.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        depthWrite={false}
        opacity={opacity}
        size={size}
        sizeAttenuation
        transparent
      />
    </points>
  );
}

function HeroScene({ settings }: HeroSceneCanvasProps) {
  const sceneGroup = useRef<THREE.Group>(null);
  const coreGroup = useRef<THREE.Group>(null);
  const primaryRing = useRef<THREE.Mesh>(null);
  const accentRing = useRef<THREE.Mesh>(null);
  const haloRing = useRef<THREE.Mesh>(null);
  const panelGroup = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    pointer.current.set(0, 0);

    if (!settings.allowParallax || typeof window === "undefined") {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    const resetPointer = () => pointer.current.set(0, 0);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetPointer);
    };
  }, [settings.allowParallax]);

  useFrame((state, delta) => {
    if (!sceneGroup.current) {
      return;
    }

    const pointerX = settings.allowParallax ? pointer.current.x : 0;
    const pointerY = settings.allowParallax ? pointer.current.y : 0;
    const xOffset = settings.isCompact ? 0.08 : 0.28;
    const yOffset = settings.isCompact ? 0.05 : 0.16;

    sceneGroup.current.position.x = THREE.MathUtils.damp(
      sceneGroup.current.position.x,
      settings.sceneOffset[0] + pointerX * xOffset,
      2.4,
      delta
    );
    sceneGroup.current.position.y = THREE.MathUtils.damp(
      sceneGroup.current.position.y,
      settings.sceneOffset[1] + pointerY * yOffset,
      2.4,
      delta
    );
    sceneGroup.current.rotation.y = THREE.MathUtils.damp(
      sceneGroup.current.rotation.y,
      pointerX * 0.16,
      2.8,
      delta
    );
    sceneGroup.current.rotation.x = THREE.MathUtils.damp(
      sceneGroup.current.rotation.x,
      -pointerY * 0.1,
      2.8,
      delta
    );

    if (settings.prefersReducedMotion) {
      return;
    }

    const elapsed = state.clock.elapsedTime;

    if (coreGroup.current) {
      coreGroup.current.rotation.y += delta * 0.22;
      coreGroup.current.rotation.z = Math.sin(elapsed * 0.34) * 0.1;
    }

    if (primaryRing.current) {
      primaryRing.current.rotation.z += delta * 0.18;
    }

    if (accentRing.current) {
      accentRing.current.rotation.x -= delta * 0.11;
    }

    if (haloRing.current) {
      haloRing.current.rotation.y += delta * 0.08;
    }

    if (panelGroup.current) {
      panelGroup.current.position.y = Math.sin(elapsed * 0.42) * 0.08;
      panelGroup.current.rotation.z = Math.sin(elapsed * 0.24) * 0.04;
    }
  });

  return (
    <>
      <fog attach="fog" args={[heroSceneConfig.colors.backdrop, 10, 19]} />

      <ambientLight intensity={0.68} color={heroSceneConfig.colors.text} />
      <directionalLight
        color={heroSceneConfig.colors.primaryLight}
        intensity={1.05}
        position={[4.8, 4, 4.5]}
      />
      <pointLight
        color={heroSceneConfig.colors.accent}
        intensity={0.82}
        position={[-4.2, -2, 2.5]}
      />

      <group
        ref={sceneGroup}
        position={settings.sceneOffset}
        scale={settings.sceneScale}
      >
        <FieldParticles
          animated={!settings.prefersReducedMotion}
          color={heroSceneConfig.colors.text}
          count={settings.particleCount}
          innerRadius={3.8}
          opacity={0.16}
          outerRadius={settings.isCompact ? 6.2 : 7.4}
          rotationSpeed={0.015}
          size={settings.isCompact ? 0.032 : 0.04}
        />

        <FieldParticles
          animated={!settings.prefersReducedMotion}
          color={heroSceneConfig.colors.accent}
          count={Math.max(12, Math.floor(settings.particleCount / 3))}
          innerRadius={2.8}
          opacity={0.11}
          outerRadius={settings.isCompact ? 5 : 6}
          rotationSpeed={-0.02}
          size={settings.isCompact ? 0.026 : 0.032}
          verticalScale={0.7}
        />

        <group ref={coreGroup}>
          <mesh>
            <icosahedronGeometry args={[1.34, settings.icosahedronDetail]} />
            <meshStandardMaterial
              color={heroSceneConfig.colors.surfaceSoft}
              emissive={heroSceneConfig.colors.primary}
              emissiveIntensity={0.16}
              flatShading
              metalness={0.64}
              roughness={0.24}
            />
          </mesh>

          <mesh scale={1.18}>
            <icosahedronGeometry args={[1.34, 1]} />
            <meshBasicMaterial
              color={heroSceneConfig.colors.primaryLight}
              opacity={settings.quality === "low" ? 0.08 : 0.12}
              transparent
              wireframe
            />
          </mesh>

          <mesh rotation={[0.48, 0.3, -0.42]} scale={0.64}>
            <octahedronGeometry args={[1.06, 0]} />
            <meshStandardMaterial
              color={heroSceneConfig.colors.accent}
              emissive={heroSceneConfig.colors.accent}
              emissiveIntensity={0.08}
              metalness={0.4}
              opacity={0.78}
              roughness={0.34}
              transparent
            />
          </mesh>
        </group>

        <mesh
          ref={primaryRing}
          rotation={[0.9, 0.1, 0.42]}
          scale={[1.14, 0.8, 1]}
        >
          <torusGeometry args={[2.06, 0.034, 16, settings.ringSegments]} />
          <meshBasicMaterial
            color={heroSceneConfig.colors.primaryLight}
            opacity={0.22}
            transparent
          />
        </mesh>

        <mesh
          ref={accentRing}
          rotation={[-0.54, 0.82, 0.18]}
          scale={[1.34, 0.8, 1]}
        >
          <torusGeometry args={[2.62, 0.02, 12, settings.ringSegments]} />
          <meshBasicMaterial
            color={heroSceneConfig.colors.accent}
            opacity={0.18}
            transparent
          />
        </mesh>

        <mesh
          ref={haloRing}
          rotation={[0.2, -0.72, 1.16]}
          scale={[1.5, 0.72, 1]}
        >
          <torusGeometry args={[1.56, 0.028, 12, settings.ringSegments]} />
          <meshBasicMaterial color={heroSceneConfig.colors.text} opacity={0.08} transparent />
        </mesh>

        <OrbitNodes
          animated={!settings.prefersReducedMotion}
          color={heroSceneConfig.colors.accentSoft}
          count={settings.orbitNodeCount}
          radius={2.22}
          rotation={[0.9, 0.18, 0.42]}
        />

        <OrbitNodes
          animated={!settings.prefersReducedMotion}
          color={heroSceneConfig.colors.primaryLight}
          count={Math.max(4, Math.floor(settings.orbitNodeCount * 0.6))}
          radius={2.82}
          reverse
          rotation={[-0.54, 0.82, 0.18]}
          scale={[1.08, 1, 1]}
        />

        {!settings.isCompact ? (
          <group ref={panelGroup}>
            {heroSceneConfig.panelLayouts
              .slice(0, settings.panelCount)
              .map((panel, index) => (
                <DataPanel
                  key={`${panel.position.join("-")}-${index}`}
                  accentColor={
                    index % 2 === 0
                      ? heroSceneConfig.colors.primaryLight
                      : heroSceneConfig.colors.accent
                  }
                  position={panel.position}
                  rotation={panel.rotation}
                  scale={panel.scale}
                />
              ))}
          </group>
        ) : null}
      </group>
    </>
  );
}

export default function HeroSceneCanvas({ settings }: HeroSceneCanvasProps) {
  const cameraPosition = settings.isCompact
    ? heroSceneConfig.camera.mobilePosition
    : heroSceneConfig.camera.desktopPosition;

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          far: 40,
          fov: settings.isCompact ? 52 : 46,
          near: 0.1,
          position: cameraPosition,
        }}
        className="h-full w-full"
        dpr={settings.dpr}
        frameloop={settings.prefersReducedMotion ? "demand" : "always"}
        gl={{
          alpha: true,
          antialias: settings.antialias,
          powerPreference: settings.powerPreference,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        performance={{ min: 0.6 }}
      >
        <AdaptiveDpr />
        <HeroScene settings={settings} />
      </Canvas>
    </div>
  );
}
