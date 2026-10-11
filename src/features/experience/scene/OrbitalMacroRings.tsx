'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationStore } from '../orchestrator/animation-store';

interface RingData {
  radius: number;
  tube: number;
  color: string;
  tilt: [number, number, number];
  baseSpeed: number;
}

const RINGS: RingData[] = [
  {
    radius: 1.85,
    tube: 0.024,
    color: '#b6f028', // Calorie (Acid-lime)
    tilt: [Math.PI / 4, 0.2, 0],
    baseSpeed: 0.65,
  },
  {
    radius: 2.35,
    tube: 0.02,
    color: '#22d3ee', // Protein (Cyan)
    tilt: [-Math.PI / 3, 0.45, 0.3],
    baseSpeed: -0.45,
  },
  {
    radius: 2.85,
    tube: 0.018,
    color: '#a855f7', // Carbs/Fat (Violet)
    tilt: [0.35, Math.PI / 3, -0.4],
    baseSpeed: 0.35,
  },
];

export function OrbitalMacroRings() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Group | null)[]>([]);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  const currentState = useAnimationStore((s) => s.currentState);
  const isReducedMotion = useAnimationStore((s) => s.isReducedMotion);
  const energyPulseTrigger = useAnimationStore((s) => s.energyPulseTrigger);

  const lastPulse = useRef(0);
  const pulseAge = useRef(999);

  useFrame((state, delta) => {
    if (energyPulseTrigger !== lastPulse.current) {
      lastPulse.current = energyPulseTrigger;
      pulseAge.current = 0;
    }
    pulseAge.current += delta;

    // Speed multiplier based on state
    let speedMult = 1.0;
    if (currentState === 'searching') speedMult = 1.6;
    if (currentState === 'food-selected') speedMult = 2.2;
    if (currentState === 'saving') speedMult = 3.5;
    if (currentState === 'celebrating') speedMult = 2.8;

    // Save pulse expansion ripple
    let pulseWave = 0;
    if (pulseAge.current < 1.4) {
      const t = pulseAge.current / 1.4;
      pulseWave = Math.sin(t * Math.PI) * 0.18;
    }

    RINGS.forEach((ring, idx) => {
      const ringGroup = ringRefs.current[idx];
      const nodeMesh = nodeRefs.current[idx];

      if (ringGroup && !isReducedMotion) {
        // Orbit ring rotation
        ringGroup.rotation.z += delta * ring.baseSpeed * speedMult;

        // Scale ripple
        const targetScale = 1 + pulseWave * (1 + idx * 0.2);
        ringGroup.scale.set(targetScale, targetScale, targetScale);
      }

      if (nodeMesh && !isReducedMotion) {
        // Orbital satellite position along the circle
        const angle = state.clock.elapsedTime * ring.baseSpeed * speedMult * 1.5;
        nodeMesh.position.x = Math.cos(angle) * ring.radius;
        nodeMesh.position.y = Math.sin(angle) * ring.radius;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {RINGS.map((ring, idx) => (
        <group
          key={idx}
          ref={(el) => {
            ringRefs.current[idx] = el;
          }}
          rotation={ring.tilt}
        >
          {/* Main Torus Geometry */}
          <mesh>
            <torusGeometry args={[ring.radius, ring.tube, 16, 80]} />
            <meshStandardMaterial
              color={ring.color}
              emissive={ring.color}
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>

          {/* Secondary Semi-transparent Track Ring */}
          <mesh>
            <torusGeometry args={[ring.radius, ring.tube * 2.2, 12, 64]} />
            <meshBasicMaterial
              color={ring.color}
              transparent
              opacity={0.12}
              wireframe={false}
            />
          </mesh>

          {/* Orbiting Satellite Node Bead */}
          <mesh
            ref={(el) => {
              nodeRefs.current[idx] = el;
            }}
            position={[ring.radius, 0, 0]}
          >
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={ring.color}
              emissiveIntensity={1.8}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
