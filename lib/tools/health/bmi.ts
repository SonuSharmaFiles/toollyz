// BMI engine for the Toollyz BMI Calculator. Pure math, no DOM.
// BMI = weight(kg) / height(m)².  Categories follow the WHO classification.

export type UnitSystem = "metric" | "imperial";

export interface BmiInput {
  /** Weight in kg (metric) or lb (imperial). */
  weight: number;
  /** Height in cm (metric) or total inches (imperial). */
  height: number;
  unitSystem: UnitSystem;
}

export interface BmiResult {
  bmi: number;
  category: Category;
  /** BMI / 25 (1.0 = upper bound of healthy range). */
  bmiPrime: number;
  /** Ponderal index (kg / m³). */
  ponderalIndex: number;
  /** Range in kg for BMI 18.5–24.9 at this height. */
  idealWeightKgMin: number;
  idealWeightKgMax: number;
  heightMeters: number;
  weightKg: number;
}

export type CategoryId =
  | "severe-thin"
  | "moderate-thin"
  | "mild-thin"
  | "normal"
  | "overweight"
  | "obese-1"
  | "obese-2"
  | "obese-3";

export interface Category {
  id: CategoryId;
  label: string;
  min: number;
  max: number;
  note: string;
}

export const CATEGORIES: Category[] = [
  { id: "severe-thin", label: "Severe thinness", min: 0, max: 16, note: "Below the WHO healthy range — consult a clinician." },
  { id: "moderate-thin", label: "Moderate thinness", min: 16, max: 17, note: "Below the WHO healthy range." },
  { id: "mild-thin", label: "Mild thinness", min: 17, max: 18.5, note: "Below the WHO healthy range." },
  { id: "normal", label: "Healthy range", min: 18.5, max: 25, note: "Within the WHO recommended adult range." },
  { id: "overweight", label: "Overweight (pre-obese)", min: 25, max: 30, note: "Above the WHO healthy range." },
  { id: "obese-1", label: "Obese class I", min: 30, max: 35, note: "Class I — moderate." },
  { id: "obese-2", label: "Obese class II", min: 35, max: 40, note: "Class II — severe." },
  { id: "obese-3", label: "Obese class III", min: 40, max: Infinity, note: "Class III — very severe; clinical review recommended." },
];

const LB_TO_KG = 0.45359237;
const IN_TO_M = 0.0254;

export function toMetric(input: BmiInput): { weightKg: number; heightMeters: number } {
  if (input.unitSystem === "metric") {
    return { weightKg: input.weight, heightMeters: input.height / 100 };
  }
  return { weightKg: input.weight * LB_TO_KG, heightMeters: input.height * IN_TO_M };
}

export function compute(input: BmiInput): BmiResult | null {
  if (!Number.isFinite(input.weight) || !Number.isFinite(input.height) || input.weight <= 0 || input.height <= 0) {
    return null;
  }
  const { weightKg, heightMeters } = toMetric(input);
  if (heightMeters <= 0) return null;
  const bmi = weightKg / (heightMeters * heightMeters);
  const category = CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ?? CATEGORIES[CATEGORIES.length - 1];
  const ponderalIndex = weightKg / Math.pow(heightMeters, 3);
  const idealMin = 18.5 * heightMeters * heightMeters;
  const idealMax = 24.9 * heightMeters * heightMeters;
  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    bmiPrime: Math.round((bmi / 25) * 100) / 100,
    ponderalIndex: Math.round(ponderalIndex * 10) / 10,
    idealWeightKgMin: Math.round(idealMin * 10) / 10,
    idealWeightKgMax: Math.round(idealMax * 10) / 10,
    heightMeters,
    weightKg,
  };
}

export function kgToLb(kg: number): number {
  return kg / LB_TO_KG;
}

export function lbToKg(lb: number): number {
  return lb * LB_TO_KG;
}

export function inToCm(inches: number): number {
  return inches * 2.54;
}

export function cmToIn(cm: number): number {
  return cm / 2.54;
}
