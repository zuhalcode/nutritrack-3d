export type AnimationState =
  | 'idle'
  | 'intro'
  | 'transitioning'
  | 'searching'
  | 'food-selected'
  | 'saving'
  | 'saved'
  | 'celebrating'
  | 'error';

export type AnimationEvent =
  | { type: 'dashboard:ready' }
  | { type: 'food-search:started' }
  | { type: 'food:selected'; payload?: { foodName: string; calories?: number } }
  | { type: 'food:save-started' }
  | { type: 'food:saved'; payload?: { foodName: string; calories: number } }
  | { type: 'food:deleted' }
  | { type: 'milestone:achieved'; payload?: { title: string; xp: number } }
  | { type: 'food-search:failed'; payload?: { error: string } }
  | { type: 'dialog:closed' }
  | { type: 'reset:idle' };

export interface AnimationOrchestratorState {
  currentState: AnimationState;
  previousState: AnimationState;
  isReducedMotion: boolean;
  isWebGLSupported: boolean;
  eventSequenceNumber: number;
  lastEvent?: AnimationEvent;

  // Pulse & celebration triggers for 3D shaders/loops
  energyPulseTrigger: number; // timestamp
  celebrationTrigger: number; // timestamp
  selectedFoodCalorieImpact: number; // for previewing energy impact

  // Actions
  dispatch: (event: AnimationEvent) => void;
  setReducedMotion: (enabled: boolean) => void;
  setWebGLSupported: (supported: boolean) => void;
  triggerEnergyPulse: () => void;
  triggerCelebration: () => void;
}
