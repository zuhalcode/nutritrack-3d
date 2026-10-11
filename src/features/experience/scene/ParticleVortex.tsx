'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationStore } from '../orchestrator/animation-store';

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 140;

interface SimulationBuffers {
  positions: Float32Array;
  angles: Float32Array;
  radii: Float32Array;
  speeds: Float32Array;
  yOffsets: Float32Array;
  count: number;
}

function initBuffers(): SimulationBuffers {
  const count = PARTICLE_COUNT;
  const pos = new Float32Array(count * 3);
  const ang = new Float32Array(count);
  const rad = new Float32Array(count);
  const spd = new Float32Array(count);
  const yOff = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.6 + Math.random() * 2.4;
    const speed = 0.2 + Math.random() * 0.45;
    const y = (Math.random() - 0.5) * 2.2;

    ang[i] = angle;
    rad[i] = radius;
    spd[i] = speed;
    yOff[i] = y;

    pos[i * 3] = Math.cos(angle) * radius;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(angle) * radius;
  }

    return {
      positions: pos,
      angles: ang,
      radii: rad,
      speeds: spd,
      yOffsets: yOff,
      count,
    };
}

export function ParticleVortex() {
  const pointsRef = useRef<THREE.Points>(null);
  const isReducedMotion = useAnimationStore((s) => s.isReducedMotion);
  const celebrationTrigger = useAnimationStore((s) => s.celebrationTrigger);
  const currentState = useAnimationStore((s) => s.currentState);

  const lastCelebration = useRef(0);
  const celebrationAge = useRef(999);

  // Store mutable simulation arrays in ref so hooks immutability is respected
  const buffersRef = useRef<SimulationBuffers | null>(null);
  if (!buffersRef.current) {
    buffersRef.current = initBuffers();
  }

  useFrame((state, delta) => {
    if (!pointsRef.current || isReducedMotion || !buffersRef.current) return;

    if (celebrationTrigger !== lastCelebration.current) {
      lastCelebration.current = celebrationTrigger;
      celebrationAge.current = 0;
    }
    celebrationAge.current += delta;

    let burstRadius = 0;
    if (celebrationAge.current < 2.0) {
      const t = celebrationAge.current / 2.0;
      burstRadius = Math.sin(t * Math.PI) * 1.8;
    }

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;
    const { angles, radii, speeds, yOffsets, count } = buffersRef.current;

    for (let i = 0; i < count; i++) {
      angles[i] += delta * speeds[i] * (currentState === 'saving' ? 2.5 : 1.0);

      const currentRadius = radii[i] + burstRadius;
      const x = Math.cos(angles[i]) * currentRadius;
      const z = Math.sin(angles[i]) * currentRadius;
      const y = yOffsets[i] + Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.12;

      array[i * 3] = x;
      array[i * 3 + 1] = y;
      array[i * 3 + 2] = z;
    }

    posAttr.needsUpdate = true;
  });

  if (isReducedMotion || !buffersRef.current) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[buffersRef.current.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#b6f028"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
