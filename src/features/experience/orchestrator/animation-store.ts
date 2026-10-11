import { create } from 'zustand';
import { AnimationEvent, AnimationOrchestratorState, AnimationState } from './types';

export const useAnimationStore = create<AnimationOrchestratorState>((set, get) => ({
  currentState: 'intro',
  previousState: 'idle',
  isReducedMotion: false,
  isWebGLSupported: true,
  eventSequenceNumber: 0,
  energyPulseTrigger: 0,
  celebrationTrigger: 0,
  selectedFoodCalorieImpact: 0,

  setReducedMotion: (enabled) => set({ isReducedMotion: enabled }),
  setWebGLSupported: (supported) => set({ isWebGLSupported: supported }),

  triggerEnergyPulse: () => {
    set({ energyPulseTrigger: Date.now() });
  },

  triggerCelebration: () => {
    set({ celebrationTrigger: Date.now() });
  },

  dispatch: (event: AnimationEvent) => {
    const current = get().currentState;
    let next: AnimationState = current;
    let pulse = get().energyPulseTrigger;
    let celebration = get().celebrationTrigger;
    let impact = get().selectedFoodCalorieImpact;

    switch (event.type) {
      case 'dashboard:ready':
        if (current === 'intro') {
          next = 'idle';
        }
        break;

      case 'food-search:started':
        next = 'searching';
        break;

      case 'food:selected':
        next = 'food-selected';
        impact = event.payload?.calories || 0;
        break;

      case 'food:save-started':
        next = 'saving';
        break;

      case 'food:saved':
        next = 'saved';
        pulse = Date.now();
        // Return to idle automatically after save sequence
        setTimeout(() => {
          if (get().currentState === 'saved') {
            get().dispatch({ type: 'reset:idle' });
          }
        }, 1200);
        break;

      case 'milestone:achieved':
        next = 'celebrating';
        celebration = Date.now();
        // Return to idle after celebration sequence
        setTimeout(() => {
          if (get().currentState === 'celebrating') {
            get().dispatch({ type: 'reset:idle' });
          }
        }, 2200);
        break;

      case 'food-search:failed':
        next = 'error';
        setTimeout(() => {
          if (get().currentState === 'error') {
            get().dispatch({ type: 'reset:idle' });
          }
        }, 2500);
        break;

      case 'dialog:closed':
      case 'reset:idle':
        next = 'idle';
        impact = 0;
        break;
    }

    set({
      previousState: current,
      currentState: next,
      eventSequenceNumber: get().eventSequenceNumber + 1,
      lastEvent: event,
      energyPulseTrigger: pulse,
      celebrationTrigger: celebration,
      selectedFoodCalorieImpact: impact,
    });
  },
}));
