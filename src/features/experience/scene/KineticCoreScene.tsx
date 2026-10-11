'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { NutritionalCore } from './NutritionalCore';
import { OrbitalMacroRings } from './OrbitalMacroRings';
import { ParticleVortex } from './ParticleVortex';
import { SceneLighting } from './SceneLighting';
import { CameraController } from './CameraController';
import { WebGLFallback } from '../fallback/WebGLFallback';
import { useAnimationStore } from '../orchestrator/animation-store';
import { CAMERA_CONFIG } from '../orchestrator/motion-tokens';

class CanvasErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[KineticCoreScene] WebGL error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function KineticCoreScene() {
  const [webglFailed, setWebglFailed] = useState(false);

  const dispatch = useAnimationStore((s) => s.dispatch);
  const setReducedMotion = useAnimationStore((s) => s.setReducedMotion);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [setReducedMotion]);

  useEffect(() => {
    dispatch({ type: 'dashboard:ready' });
  }, [dispatch]);

  if (webglFailed) {
    return <WebGLFallback />;
  }

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px]">
      <CanvasErrorBoundary fallback={<WebGLFallback />}>
        <Canvas
          camera={{
            fov: CAMERA_CONFIG.fov,
            near: CAMERA_CONFIG.near,
            far: CAMERA_CONFIG.far,
            position: CAMERA_CONFIG.defaultPosition,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          onError={() => {
            setWebglFailed(true);
          }}
        >
          <Suspense fallback={null}>
            <SceneLighting />
            <CameraController />
            <NutritionalCore />
            <OrbitalMacroRings />
            <ParticleVortex />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
