'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationStore } from '../orchestrator/animation-store';
import { CAMERA_CONFIG } from '../orchestrator/motion-tokens';

export function CameraController() {
  const { camera } = useThree();
  const currentState = useAnimationStore((s) => s.currentState);
  const isReducedMotion = useAnimationStore((s) => s.isReducedMotion);

  const targetPosition = useRef(new THREE.Vector3(...CAMERA_CONFIG.defaultPosition));
  const pointerTarget = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    // Select base target position based on state
    if (currentState === 'intro') {
      targetPosition.current.set(0, 0, 9.8);
    } else if (currentState === 'food-selected' || currentState === 'saving') {
      targetPosition.current.set(0, -0.2, 6.3);
    } else if (currentState === 'celebrating') {
      targetPosition.current.set(0, 0.35, 5.8);
    } else {
      targetPosition.current.set(...CAMERA_CONFIG.defaultPosition);
    }

    // Interactive pointer parallax (clamped & smoothed)
    if (!isReducedMotion) {
      pointerTarget.current.set(
        state.pointer.x * CAMERA_CONFIG.pointerSensitivity,
        state.pointer.y * CAMERA_CONFIG.pointerSensitivity * 0.7
      );
    } else {
      pointerTarget.current.set(0, 0);
    }

    // Smooth lerp camera position
    const lerpSpeed = Math.min(1.0, delta * 3.5);
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetPosition.current.x + pointerTarget.current.x,
      lerpSpeed
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetPosition.current.y + pointerTarget.current.y,
      lerpSpeed
    );
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      targetPosition.current.z,
      lerpSpeed
    );

    camera.lookAt(0, 0, 0);
  });

  return null;
}
