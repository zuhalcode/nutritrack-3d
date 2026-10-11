'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationStore } from '../orchestrator/animation-store';
import { useDailySummary } from '../../food-log/store';

export function NutritionalCore() {
  const meshRef = useRef<THREE.Group>(null);
  const innerSphereRef = useRef<THREE.Mesh>(null);
  const outerCageRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  const energyPulseTrigger = useAnimationStore((s) => s.energyPulseTrigger);
  const isReducedMotion = useAnimationStore((s) => s.isReducedMotion);

  // Read actual nutrition data
  const summary = useDailySummary();
  const progressRatio = summary.calorieProgressRatio; // 0 to 1+

  // Animation tracking refs (avoid allocations in useFrame)
  const pulseAge = useRef(999);
  const lastPulseTimestamp = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Track save energy pulse
    if (energyPulseTrigger !== lastPulseTimestamp.current) {
      lastPulseTimestamp.current = energyPulseTrigger;
      pulseAge.current = 0;
    }

    pulseAge.current += delta;

    if (!isReducedMotion) {
      // Ambient rotation (core and cage counter-rotate)
      if (innerSphereRef.current) {
        innerSphereRef.current.rotation.y += delta * 0.4;
        innerSphereRef.current.rotation.x += delta * 0.2;
      }

      if (outerCageRef.current) {
        outerCageRef.current.rotation.y -= delta * 0.25;
        outerCageRef.current.rotation.z += delta * 0.15;
      }
    }

    // Breathing / scale dynamics based on progress
    const baseScale = 1.0 + Math.min(0.35, progressRatio * 0.25);
    const breathing = isReducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.5) * 0.035;

    // Pulse shockwave calculation
    let pulseScaleAdd = 0;
    let emissiveBoost = 0;
    if (pulseAge.current < 1.2) {
      const t = pulseAge.current / 1.2;
      pulseScaleAdd = Math.sin(t * Math.PI) * 0.28;
      emissiveBoost = Math.sin(t * Math.PI) * 2.5;
    }

    const currentScale = baseScale + breathing + pulseScaleAdd;
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    // Material emissive reactivity
    if (glowMaterialRef.current) {
      const baseEmissiveIntensity = 0.6 + Math.min(0.8, progressRatio * 0.5) + emissiveBoost;
      glowMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        glowMaterialRef.current.emissiveIntensity,
        baseEmissiveIntensity,
        0.1
      );
    }
  });

  return (
    <group ref={meshRef}>
      {/* Inner Glowing Crystal Core */}
      <mesh ref={innerSphereRef}>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshStandardMaterial
          ref={glowMaterialRef}
          color="#b6f028"
          emissive="#b6f028"
          emissiveIntensity={0.8}
          roughness={0.18}
          metalness={0.85}
          wireframe={false}
        />
      </mesh>

      {/* Internal Core Accent Seed */}
      <mesh>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Outer Geometric Energy Lattice Cage */}
      <mesh ref={outerCageRef}>
        <dodecahedronGeometry args={[1.32, 1]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive="#22d3ee"
          emissiveIntensity={0.25}
          wireframe={true}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}
