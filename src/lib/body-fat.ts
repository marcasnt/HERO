export type BodyFormula = "male" | "female";

export function estimateBodyFat(input: { formula: BodyFormula; heightCm: number; neckCm: number; waistCm: number; hipCm?: number }) {
  const inches = (cm: number) => cm / 2.54;
  const height = inches(input.heightCm);
  const neck = inches(input.neckCm);
  const waist = inches(input.waistCm);
  let result: number;
  if (input.formula === "male") {
    if (waist <= neck) return null;
    result = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    const hip = inches(input.hipCm || 0);
    if (waist + hip <= neck || !input.hipCm) return null;
    result = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  }
  if (!Number.isFinite(result) || result < 2 || result > 70) return null;
  return Math.round(result * 10) / 10;
}
