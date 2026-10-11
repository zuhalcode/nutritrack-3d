/**
 * Central motion design tokens for NutriTrack.
 * Controls durations, easings, spring physics, and reduced motion behavior.
 */

export const MOTION_DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  standard: 0.4,
  extended: 0.7,
  cinematic: 1.2,
  ambientOrbit: 24, // seconds per full rotation
};

export const MOTION_EASINGS = {
  // Fluid futuristic decelerate curve
  fluidOut: [0.16, 1, 0.3, 1] as const,
  // Snappy enter
  snappy: [0.25, 0.1, 0.25, 1] as const,
  // Gentle pulse
  sineInOut: [0.445, 0.05, 0.55, 0.95] as const,
};

export const SPRING_CONFIGS = {
  responsive: { type: 'spring', stiffness: 350, damping: 28 },
  gentle: { type: 'spring', stiffness: 180, damping: 24 },
  bouncy: { type: 'spring', stiffness: 400, damping: 20 },
  cardEntrance: { type: 'spring', stiffness: 260, damping: 26 },
};

export const PARTICLE_BUDGET = {
  desktop: 180,
  mobile: 80,
  reducedMotion: 0,
};

export const CAMERA_CONFIG = {
  fov: 45,
  near: 0.1,
  far: 100,
  defaultPosition: [0, 0, 7.5] as [number, number, number],
  focusedPosition: [0, 0, 6.2] as [number, number, number],
  celebrationPosition: [0, 0.3, 5.8] as [number, number, number],
  pointerSensitivity: 0.35,
};
