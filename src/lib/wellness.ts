// Aura wellness score calculator.
// Weights: sleep 25%, water 20%, exercise 25%, mood 15%, stress 15%.

export type WellnessInputs = {
  sleep_hours: number | null;
  water_ml: number | null;
  water_target: number;
  exercise_minutes: number | null;
  mood_score: number | null; // 1-10
  stress_level: number | null; // 1-10 (10 = high)
};

export function computeWellnessScore(i: WellnessInputs): number {
  const sleep = Math.min(1, Math.max(0, (i.sleep_hours ?? 0) / 8));
  const water = Math.min(1, Math.max(0, (i.water_ml ?? 0) / Math.max(1, i.water_target)));
  const ex = Math.min(1, Math.max(0, (i.exercise_minutes ?? 0) / 30));
  const mood = Math.min(1, Math.max(0, (i.mood_score ?? 5) / 10));
  const stress = 1 - Math.min(1, Math.max(0, (i.stress_level ?? 5) / 10));
  const raw = sleep * 0.25 + water * 0.2 + ex * 0.25 + mood * 0.15 + stress * 0.15;
  return Math.round(raw * 100);
}
