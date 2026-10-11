import { FoodLogEntry, NutrientTargets } from '../food-log/types';

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  iconName: string;
}

export const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'first_log',
    title: 'Initiate Metabolism',
    description: 'Logged your very first food entry into NutriTrack',
    xpReward: 50,
    iconName: 'Zap',
  },
  {
    id: 'three_meals',
    title: 'Balanced Cadence',
    description: 'Recorded Breakfast, Lunch, and Dinner in a single day',
    xpReward: 75,
    iconName: 'Clock',
  },
  {
    id: 'streak_3',
    title: 'Metabolic Momentum',
    description: 'Maintained a 3-day continuous logging streak',
    xpReward: 100,
    iconName: 'Flame',
  },
  {
    id: 'target_met',
    title: 'Caloric Equilibrium',
    description: 'Met daily calorie target within optimal bounds (90-110%)',
    xpReward: 100,
    iconName: 'Target',
  },
];

/**
 * Calculates user logging streak in days based on recorded entries.
 */
export function calculateStreak(entries: FoodLogEntry[]): number {
  if (entries.length === 0) return 0;

  const dates = Array.from(new Set(entries.map((e) => e.date))).sort().reverse();
  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If latest entry is neither today nor yesterday, streak is broken
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i]);
    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      streak += 1;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Evaluates all milestone conditions and returns newly earned milestones only.
 */
export function evaluateMilestones(
  entries: FoodLogEntry[],
  currentDate: string,
  targets: NutrientTargets,
  achievedIds: string[]
): MilestoneDefinition[] {
  const newMilestones: MilestoneDefinition[] = [];
  const achievedSet = new Set(achievedIds);

  // 1. First food entry
  if (entries.length >= 1 && !achievedSet.has('first_log')) {
    newMilestones.push(MILESTONES.find((m) => m.id === 'first_log')!);
  }

  // 2. Three meals in a single day
  const dayEntries = entries.filter((e) => e.date === currentDate);
  const categories = new Set(dayEntries.map((e) => e.mealCategory));
  if (
    categories.has('breakfast') &&
    categories.has('lunch') &&
    categories.has('dinner') &&
    !achievedSet.has('three_meals')
  ) {
    newMilestones.push(MILESTONES.find((m) => m.id === 'three_meals')!);
  }

  // 3. Streak >= 3
  const streak = calculateStreak(entries);
  if (streak >= 3 && !achievedSet.has('streak_3')) {
    newMilestones.push(MILESTONES.find((m) => m.id === 'streak_3')!);
  }

  // 4. Calorie target met within 90-110%
  const totalCal = dayEntries.reduce((acc, curr) => {
    return acc + (curr.nutrients.calories.isAvailable ? curr.nutrients.calories.value || 0 : 0);
  }, 0);

  if (
    totalCal >= targets.calories * 0.9 &&
    totalCal <= targets.calories * 1.1 &&
    !achievedSet.has('target_met')
  ) {
    newMilestones.push(MILESTONES.find((m) => m.id === 'target_met')!);
  }

  return newMilestones;
}
