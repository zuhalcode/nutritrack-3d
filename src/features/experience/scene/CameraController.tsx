'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationStore } from '../orchestrator/animation-store';
import { CAMERA_CONFIG } from '../orchestrator/motion-tokens';

export function CameraController() {
  const { camera, size } = useThree();
  const currentState = useAnimationStore((s) => s.currentState);
  const isReducedMotion = useAnimationStore((s) => s.isReducedMotion);

  const targetPosition = useRef(new THREE.Vector3(...CAMERA_CONFIG.defaultPosition));
  const pointerTarget = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    // Responsive distance factor: on narrow mobile screens (aspect < 1.15), zoom out smoothly to frame orbital rings perfectly
    const aspect = size.width / Math.max(1, size.height);
    const aspectFactor = aspect < 1.15 ? Math.min(1.45, 1.15 / aspect) : 1.0;

    // Select base target position based on state scaled by aspectFactor
    if (currentState === 'intro') {
      targetPosition.current.set(0, 0, 9.8 * aspectFactor);
    } else if (currentState === 'food-selected' || currentState === 'saving') {
      targetPosition.current.set(0, -0.2, 6.3 * aspectFactor);
    } else if (currentState === 'celebrating') {
      targetPosition.current.set(0, 0.35, 5.8 * aspectFactor);
    } else {
      targetPosition.current.set(
        CAMERA_CONFIG.defaultPosition[0],
        CAMERA_CONFIG.defaultPosition[1],
        CAMERA_CONFIG.defaultPosition[2] * aspectFactor
      );
    }

    // Interactive pointer parallax (clamped & touch-dampened on small viewports)
    if (!isReducedMotion) {
      const isMobile = size.width < 640;
      const sensitivity = isMobile ? CAMERA_CONFIG.pointerSensitivity * 0.35 : CAMERA_CONFIG.pointerSensitivity;

      pointerTarget.current.set(
        state.pointer.x * sensitivity,
        state.pointer.y * sensitivity * 0.6
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
