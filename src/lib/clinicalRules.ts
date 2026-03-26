// Clinical Rules Engine - Interpretação clínica baseada em referências médicas

export type ClinicalClassification = {
  label: string;
  level: "normal" | "warning" | "critical";
  color: string;
  bgColor: string;
};

// === SINAIS VITAIS ===

export function classifyHeartRate(hr: number, ageYears?: number): ClinicalClassification {
  // Pediatric ranges
  if (ageYears !== undefined && ageYears < 18) {
    if (ageYears < 1) {
      if (hr < 100) return { label: "Bradicardia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
      if (hr > 160) return { label: "Taquicardia", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
      return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
    }
    if (ageYears < 5) {
      if (hr < 80) return { label: "Bradicardia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
      if (hr > 140) return { label: "Taquicardia", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
      return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
    }
    if (ageYears < 12) {
      if (hr < 70) return { label: "Bradicardia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
      if (hr > 120) return { label: "Taquicardia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
      return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
    }
  }
  // Adult
  if (hr < 60) return { label: "Bradicardia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (hr > 100) return { label: "Taquicardia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (hr > 120) return { label: "Taquicardia", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

export function classifyBloodPressure(systolic: number, diastolic: number): ClinicalClassification {
  if (systolic < 90 || diastolic < 60) return { label: "Hipotensão", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (systolic >= 180 || diastolic >= 120) return { label: "Crise Hipertensiva", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (systolic >= 140 || diastolic >= 90) return { label: "Hipertensão", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (systolic >= 130 || diastolic >= 85) return { label: "Limítrofe", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (systolic <= 120 && diastolic <= 80) return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

export function classifyTemperature(temp: number): ClinicalClassification {
  if (temp < 35) return { label: "Hipotermia", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (temp < 36) return { label: "Hipotermia Leve", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (temp <= 37.5) return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  if (temp <= 38) return { label: "Subfebril", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (temp <= 39) return { label: "Febre", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  return { label: "Febre Alta", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
}

export function classifyOxygenSaturation(spo2: number): ClinicalClassification {
  if (spo2 >= 95) return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  if (spo2 >= 90) return { label: "Hipoxemia Leve", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Hipoxemia Grave", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
}

export function classifyRespiratoryRate(rr: number, ageYears?: number): ClinicalClassification {
  if (ageYears !== undefined && ageYears < 1) {
    if (rr < 30) return { label: "Bradipneia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
    if (rr > 60) return { label: "Taquipneia", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
    return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  }
  if (ageYears !== undefined && ageYears < 5) {
    if (rr < 20) return { label: "Bradipneia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
    if (rr > 40) return { label: "Taquipneia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
    return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  }
  // Adult
  if (rr < 12) return { label: "Bradipneia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (rr > 20) return { label: "Taquipneia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (rr > 30) return { label: "Taquipneia Grave", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

export function classifyGlucose(glucose: number): ClinicalClassification {
  if (glucose < 54) return { label: "Hipoglicemia Grave", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (glucose < 70) return { label: "Hipoglicemia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (glucose <= 99) return { label: "Normal", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  if (glucose <= 125) return { label: "Pré-diabetes", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (glucose <= 200) return { label: "Hiperglicemia", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Hiperglicemia Grave", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
}

export function classifyGlasgow(score: number): ClinicalClassification {
  if (score <= 8) return { label: "Grave (IOT)", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (score <= 12) return { label: "Moderado", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Leve", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

export function classifyBraden(score: number): ClinicalClassification {
  if (score <= 9) return { label: "Risco Muito Alto", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (score <= 12) return { label: "Alto Risco", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (score <= 14) return { label: "Risco Moderado", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (score <= 18) return { label: "Baixo Risco", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  return { label: "Sem Risco", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

export function classifyMorse(score: number): ClinicalClassification {
  if (score >= 45) return { label: "Alto Risco Queda", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (score >= 25) return { label: "Risco Moderado", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Baixo Risco", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

// === PEDIATRIA (WHO/CDC simplified) ===

interface PediatricRange { min: number; max: number; }

// Weight ranges by age in months (simplified WHO references)
const weightRangesKg: Record<string, { male: PediatricRange; female: PediatricRange }> = {
  "0": { male: { min: 2.5, max: 4.4 }, female: { min: 2.4, max: 4.2 } },
  "3": { male: { min: 5.0, max: 8.0 }, female: { min: 4.5, max: 7.5 } },
  "6": { male: { min: 6.4, max: 9.8 }, female: { min: 5.7, max: 9.3 } },
  "12": { male: { min: 7.7, max: 12.0 }, female: { min: 7.0, max: 11.5 } },
  "24": { male: { min: 9.7, max: 15.3 }, female: { min: 9.0, max: 14.8 } },
  "36": { male: { min: 11.3, max: 18.3 }, female: { min: 10.8, max: 18.1 } },
  "48": { male: { min: 12.7, max: 21.2 }, female: { min: 12.3, max: 21.5 } },
  "60": { male: { min: 14.1, max: 24.2 }, female: { min: 13.7, max: 24.9 } },
  "72": { male: { min: 15.9, max: 27.1 }, female: { min: 15.3, max: 27.8 } },
  "96": { male: { min: 18.6, max: 34.7 }, female: { min: 17.7, max: 34.8 } },
  "120": { male: { min: 22.0, max: 44.6 }, female: { min: 21.0, max: 45.0 } },
  "144": { male: { min: 26.0, max: 55.0 }, female: { min: 25.0, max: 56.0 } },
  "168": { male: { min: 33.0, max: 68.0 }, female: { min: 32.0, max: 65.0 } },
  "192": { male: { min: 40.0, max: 80.0 }, female: { min: 38.0, max: 72.0 } },
  "216": { male: { min: 47.0, max: 90.0 }, female: { min: 42.0, max: 75.0 } },
};

// Height ranges by age in months (simplified WHO references)
const heightRangesCm: Record<string, { male: PediatricRange; female: PediatricRange }> = {
  "0": { male: { min: 46.1, max: 53.7 }, female: { min: 45.4, max: 52.9 } },
  "3": { male: { min: 57.3, max: 65.5 }, female: { min: 55.6, max: 64.0 } },
  "6": { male: { min: 63.3, max: 71.9 }, female: { min: 61.2, max: 70.3 } },
  "12": { male: { min: 71.0, max: 80.5 }, female: { min: 68.9, max: 79.2 } },
  "24": { male: { min: 81.7, max: 93.9 }, female: { min: 80.0, max: 92.9 } },
  "36": { male: { min: 88.7, max: 103.5 }, female: { min: 87.4, max: 102.7 } },
  "48": { male: { min: 94.9, max: 111.7 }, female: { min: 93.9, max: 111.3 } },
  "60": { male: { min: 100.7, max: 119.2 }, female: { min: 99.9, max: 118.9 } },
  "72": { male: { min: 106.1, max: 125.8 }, female: { min: 105.0, max: 125.4 } },
  "96": { male: { min: 116.0, max: 138.0 }, female: { min: 115.0, max: 138.0 } },
  "120": { male: { min: 125.0, max: 150.0 }, female: { min: 124.0, max: 151.0 } },
  "144": { male: { min: 134.0, max: 163.0 }, female: { min: 133.0, max: 162.0 } },
  "168": { male: { min: 145.0, max: 176.0 }, female: { min: 145.0, max: 169.0 } },
  "192": { male: { min: 155.0, max: 185.0 }, female: { min: 150.0, max: 172.0 } },
  "216": { male: { min: 160.0, max: 190.0 }, female: { min: 152.0, max: 174.0 } },
};

function findClosestAgeKey(ageMonths: number, ranges: Record<string, any>): string {
  const keys = Object.keys(ranges).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (Math.abs(k - ageMonths) <= Math.abs(closest - ageMonths)) closest = k;
  }
  return closest.toString();
}

export function classifyPediatricWeight(weightKg: number, ageMonths: number, gender: "M" | "F"): ClinicalClassification {
  const key = findClosestAgeKey(ageMonths, weightRangesKg);
  const range = weightRangesKg[key]?.[gender === "M" ? "male" : "female"];
  if (!range) return { label: "Sem referência", level: "normal", color: "text-muted-foreground", bgColor: "bg-muted" };

  if (weightKg < range.min * 0.85) return { label: "Muito abaixo", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (weightKg < range.min) return { label: "Abaixo do esperado", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (weightKg > range.max * 1.15) return { label: "Muito acima", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (weightKg > range.max) return { label: "Acima do esperado", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Adequado", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

export function classifyPediatricHeight(heightCm: number, ageMonths: number, gender: "M" | "F"): ClinicalClassification {
  const key = findClosestAgeKey(ageMonths, heightRangesCm);
  const range = heightRangesCm[key]?.[gender === "M" ? "male" : "female"];
  if (!range) return { label: "Sem referência", level: "normal", color: "text-muted-foreground", bgColor: "bg-muted" };

  if (heightCm < range.min * 0.95) return { label: "Muito abaixo", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (heightCm < range.min) return { label: "Abaixo do esperado", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (heightCm > range.max * 1.05) return { label: "Muito acima", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (heightCm > range.max) return { label: "Acima do esperado", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Adequado", level: "normal", color: "text-success", bgColor: "bg-success/10" };
}

export function classifyBMI(bmi: number, ageYears?: number): ClinicalClassification {
  // Pediatric BMI (simplified CDC)
  if (ageYears !== undefined && ageYears < 18) {
    if (bmi < 14) return { label: "Baixo peso", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
    if (bmi < 18.5) return { label: "Adequado", level: "normal", color: "text-success", bgColor: "bg-success/10" };
    if (bmi < 25) return { label: "Adequado", level: "normal", color: "text-success", bgColor: "bg-success/10" };
    if (bmi < 30) return { label: "Sobrepeso", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
    return { label: "Obesidade", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  }
  // Adult
  if (bmi < 18.5) return { label: "Baixo peso", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (bmi < 25) return { label: "Eutrófico", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  if (bmi < 30) return { label: "Sobrepeso", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  if (bmi < 35) return { label: "Obesidade I", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  if (bmi < 40) return { label: "Obesidade II", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
  return { label: "Obesidade III", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
}

// === PAIN LEVEL ===

export function classifyPainLevel(pain: number): ClinicalClassification {
  if (pain === 0) return { label: "Sem dor", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  if (pain <= 3) return { label: "Dor leve", level: "normal", color: "text-success", bgColor: "bg-success/10" };
  if (pain <= 6) return { label: "Dor moderada", level: "warning", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Dor intensa", level: "critical", color: "text-destructive", bgColor: "bg-destructive/10" };
}

// === UTILITY: Classification Badge ===

export function getClassificationBadge(classification: ClinicalClassification) {
  return {
    text: classification.label,
    className: `${classification.bgColor} ${classification.color} border-0 text-[9px] font-medium px-1.5 py-0.5 rounded`,
  };
}

// === EXTRACT SPECIALTY FROM EVOLUTION CONTENT ===

export function extractSpecialtyFromContent(content: string): string | null {
  const match = content.match(/^\[([^\]]+)\]/);
  return match ? match[1] : null;
}
