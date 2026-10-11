import { describe, it, expect, beforeEach } from 'vitest';
import { useAnimationStore } from '../features/experience/orchestrator/animation-store';

describe('Animation Orchestrator State Machine', () => {
  beforeEach(() => {
    useAnimationStore.getState().dispatch({ type: 'reset:idle' });
  });

  it('initializes and responds to dashboard:ready event', () => {
    useAnimationStore.setState({ currentState: 'intro' });
    expect(useAnimationStore.getState().currentState).toBe('intro');

    useAnimationStore.getState().dispatch({ type: 'dashboard:ready' });
    expect(useAnimationStore.getState().currentState).toBe('idle');
  });

  it('transitions through food selection and saving sequence', () => {
    const { dispatch } = useAnimationStore.getState();

    dispatch({ type: 'food-search:started' });
    expect(useAnimationStore.getState().currentState).toBe('searching');

    dispatch({
      type: 'food:selected',
      payload: { foodName: 'Oatmeal', calories: 389 },
    });
    expect(useAnimationStore.getState().currentState).toBe('food-selected');
    expect(useAnimationStore.getState().selectedFoodCalorieImpact).toBe(389);

    const prevPulse = useAnimationStore.getState().energyPulseTrigger;
    dispatch({
      type: 'food:saved',
      payload: { foodName: 'Oatmeal', calories: 389 },
    });
    expect(useAnimationStore.getState().currentState).toBe('saved');
    expect(useAnimationStore.getState().energyPulseTrigger).toBeGreaterThan(prevPulse);
  });

  it('triggers celebration state and updates celebration trigger on milestone:achieved', () => {
    const { dispatch } = useAnimationStore.getState();
    const prevCelebration = useAnimationStore.getState().celebrationTrigger;

    dispatch({
      type: 'milestone:achieved',
      payload: { title: 'First Log', xp: 50 },
    });

    expect(useAnimationStore.getState().currentState).toBe('celebrating');
    expect(useAnimationStore.getState().celebrationTrigger).toBeGreaterThan(prevCelebration);
  });

  it('correctly toggles reduced motion mode', () => {
    const { setReducedMotion } = useAnimationStore.getState();

    setReducedMotion(true);
    expect(useAnimationStore.getState().isReducedMotion).toBe(true);

    setReducedMotion(false);
    expect(useAnimationStore.getState().isReducedMotion).toBe(false);
  });
});
