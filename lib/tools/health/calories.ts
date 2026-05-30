// Calorie engine for the Toollyz Calorie Calculator. Uses the Mifflin–St Jeor
// equation (which the Academy of Nutrition and Dietetics considers the most
// accurate for the general population) and standard activity multipliers.
// Pure math, no DOM.

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very"
  | "extra";

export type GoalId =
  | "cut-aggressive"
  | "cut-standard"
  | "cut-mild"
  | "maintain"
  | "bulk-mild"
  | "bulk-standard";

export interface CalorieInput {
  sex: Sex;
  ageYears: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: GoalId;
}

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Sedentary — desk job, no real exercise (×1.20)",
  light: "Light — light exercise 1–3 days/week (×1.375)",
  moderate: "Moderate — exercise 3–5 days/week (×1.55)",
  very: "Very active — exercise 6–7 days/week (×1.725)",
  extra: "Extra active — heavy training or physical job (×1.90)",
};

export interface GoalDef {
  id: GoalId;
  label: string;
  delta: number; // kcal/day relative to TDEE
  hint: string;
}

export const GOALS: GoalDef[] = [
  { id: "cut-aggressive", label: "Aggressive cut", delta: -750, hint: "~0.75 kg / 1.5 lb per week loss" },
  { id: "cut-standard", label: "Standard cut", delta: -500, hint: "~0.5 kg / 1 lb per week loss" },
  { id: "cut-mild", label: "Mild cut", delta: -250, hint: "~0.25 kg / 0.5 lb per week loss" },
  { id: "maintain", label: "Maintain", delta: 0, hint: "Match TDEE — neither lose nor gain" },
  { id: "bulk-mild", label: "Mild bulk", delta: 250, hint: "~0.25 kg / 0.5 lb per week gain" },
  { id: "bulk-standard", label: "Standard bulk", delta: 500, hint: "~0.5 kg / 1 lb per week gain" },
];

export interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  goalDeltaKcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  weeklyDeltaKg: number; // expected weight change per week
}

/**
 * Mifflin–St Jeor BMR.
 *   Male:   BMR = 10w + 6.25h − 5a + 5
 *   Female: BMR = 10w + 6.25h − 5a − 161
 * (w = kg, h = cm, a = years)
 */
export function mifflinStJeor(input: Pick<CalorieInput, "weightKg" | "heightCm" | "ageYears" | "sex">): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears;
  return input.sex === "male" ? base + 5 : base - 161;
}

export function compute(input: CalorieInput): CalorieResult | null {
  if (input.ageYears <= 0 || input.weightKg <= 0 || input.heightCm <= 0) return null;
  const bmr = Math.round(mifflinStJeor(input));
  const tdee = Math.round(bmr * ACTIVITY_FACTORS[input.activity]);
  const goal = GOALS.find((g) => g.id === input.goal) ?? GOALS[3];
  const targetCalories = Math.max(1000, tdee + goal.delta);
  // Macro split — 1.8 g protein / kg, 25% fat, rest carbs.
  const protein_g = Math.round(1.8 * input.weightKg);
  const proteinKcal = protein_g * 4;
  const fatKcal = targetCalories * 0.25;
  const fat_g = Math.round(fatKcal / 9);
  const carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbs_g = Math.round(carbKcal / 4);
  // 7700 kcal/kg of fat per the classic rule of thumb.
  const weeklyDeltaKg = Math.round(((goal.delta * 7) / 7700) * 100) / 100;
  return { bmr, tdee, targetCalories, goalDeltaKcal: goal.delta, protein_g, fat_g, carbs_g, weeklyDeltaKg };
}
