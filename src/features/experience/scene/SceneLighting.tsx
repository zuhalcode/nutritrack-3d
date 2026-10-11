'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationStore } from '../orchestrator/animation-store';

export function SceneLighting() {
  const limeLightRef = useRef<THREE.PointLight>(null);
  const cyanLightRef = useRef<THREE.PointLight>(null);
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

    let pulseIntensity = 0;
    if (pulseAge.current < 1.0) {
      pulseIntensity = Math.sin((pulseAge.current / 1.0) * Math.PI) * 4.0;
    }

    if (!isReducedMotion) {
      const t = state.clock.elapsedTime * 0.75;
      if (limeLightRef.current) {
        limeLightRef.current.position.x = Math.sin(t) * 3.5;
        limeLightRef.current.position.y = Math.cos(t * 0.8) * 2.2;
        limeLightRef.current.position.z = 2.5 + Math.sin(t * 0.5) * 1.5;
        limeLightRef.current.intensity = 2.2 + pulseIntensity;
      }

      if (cyanLightRef.current) {
        cyanLightRef.current.position.x = -Math.cos(t * 0.9) * 3.2;
        cyanLightRef.current.position.y = -Math.sin(t) * 2.0;
        cyanLightRef.current.position.z = 2.0 + Math.cos(t * 0.6) * 1.2;
        cyanLightRef.current.intensity = 1.8 + pulseIntensity * 0.5;
      }
    }
  });

  return (
    <>
      {/* Dark Ambient Base Fill */}
      <ambientLight color="#0b111e" intensity={1.2} />

      {/* Main Studio Key Directional Light */}
      <directionalLight
        position={[6, 8, 8]}
        color="#ffffff"
        intensity={1.8}
        castShadow
      />

      {/* Rim / Backlight for Silhouette Separation */}
      <directionalLight
        position={[-6, -4, -6]}
        color="#1e293b"
        intensity={2.0}
      />

      {/* Kinetic Acid-Lime Accent Point Light */}
      <pointLight
        ref={limeLightRef}
        position={[3, 2, 3]}
        color="#b6f028"
        intensity={2.2}
        distance={12}
        decay={2}
      />

      {/* Kinetic Cool-Cyan Accent Point Light */}
      <pointLight
        ref={cyanLightRef}
        position={[-3, -2, 2.5]}
        color="#22d3ee"
        intensity={1.8}
        distance={10}
        decay={2}
      />
    </>
  );
}
