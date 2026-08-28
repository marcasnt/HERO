const equipmentPrefixes: Array<[RegExp, string]> = [
  [/^barbell\s+/, "con barra"], [/^dumbbell\s+/, "con mancuernas"], [/^cable\s+/, "en polea"],
  [/^band\s+/, "con banda"], [/^kettlebell\s+/, "con pesa rusa"], [/^smith\s+/, "en máquina Smith"],
  [/^lever\s+/, "en máquina"], [/^weighted\s+/, "con peso"], [/^bodyweight\s+/, "con peso corporal"],
];

const exactNames: Record<string, string> = {
  "air bike": "bicicleta de aire", "bench press": "press de banca", deadlift: "peso muerto",
  "romanian deadlift": "peso muerto rumano", "sumo deadlift": "peso muerto sumo",
  "hip thrust": "empuje de cadera", "glute bridge": "puente de glúteos", "pull-up": "dominada",
  "pull up": "dominada", "chin-up": "dominada supina", "push-up": "flexión de brazos",
  "military press": "press militar", "shoulder press": "press de hombros", "chest press": "press de pecho",
  "leg press": "prensa de piernas", "front squat": "sentadilla frontal", "hack squat": "sentadilla hack",
  "goblet squat": "sentadilla goblet", "bulgarian split squat": "sentadilla búlgara",
  "lateral raise": "elevación lateral", "front raise": "elevación frontal",
  "calf raise": "elevación de pantorrillas", "leg extension": "extensión de cuádriceps",
  "leg curl": "curl femoral", "lat pulldown": "jalón al pecho", "triceps extension": "extensión de tríceps",
  "biceps curl": "curl de bíceps", "hammer curl": "curl martillo", "russian twist": "giro ruso",
  "sit-up": "abdominal completo", plank: "plancha",
};

const phrases: Array<[RegExp, string]> = [
  [/wide[- ]grip/g, "agarre amplio"], [/close[- ]grip/g, "agarre cerrado"], [/underhand/g, "agarre supino"],
  [/overhand/g, "agarre prono"], [/single[- ]arm|one arm/g, "a un brazo"], [/single[- ]leg|one leg/g, "a una pierna"],
  [/alternating/g, "alterno"], [/assisted/g, "asistido"], [/incline/g, "inclinado"], [/decline/g, "declinado"],
  [/seated/g, "sentado"], [/standing/g, "de pie"], [/kneeling/g, "de rodillas"], [/lying/g, "tumbado"],
  [/reverse/g, "inverso"], [/bent[- ]over/g, "inclinado"], [/overhead/g, "sobre la cabeza"],
  [/romanian deadlift/g, "peso muerto rumano"], [/sumo deadlift/g, "peso muerto sumo"], [/deadlift/g, "peso muerto"],
  [/bench press/g, "press de banca"], [/shoulder press/g, "press de hombros"], [/chest press/g, "press de pecho"],
  [/leg press/g, "prensa de piernas"], [/hip thrust/g, "empuje de cadera"], [/glute bridge/g, "puente de glúteos"],
  [/lat(?:eral)? pulldown/g, "jalón al pecho"], [/pulldown/g, "jalón"], [/pull[- ]?up/g, "dominada"],
  [/chin[- ]?up/g, "dominada supina"], [/push[- ]?up/g, "flexión de brazos"],
  [/split squat/g, "sentadilla dividida"], [/squat/g, "sentadilla"], [/lunge/g, "zancada"],
  [/calf raise/g, "elevación de pantorrillas"], [/lateral raise/g, "elevación lateral"],
  [/front raise/g, "elevación frontal"], [/leg extension/g, "extensión de cuádriceps"],
  [/leg curl/g, "curl femoral"], [/triceps extension/g, "extensión de tríceps"],
  [/biceps curl/g, "curl de bíceps"], [/hammer curl/g, "curl martillo"], [/wrist curl/g, "curl de muñeca"],
  [/row/g, "remo"], [/fly/g, "apertura"], [/dip/g, "fondos"], [/shrug/g, "encogimiento de hombros"],
  [/crunch/g, "crunch abdominal"], [/sit[- ]?up/g, "abdominal completo"], [/plank/g, "plancha"],
  [/leg raise/g, "elevación de piernas"], [/knee raise/g, "elevación de rodillas"],
  [/back extension/g, "extensión lumbar"], [/stretch/g, "estiramiento"], [/rotation/g, "rotación"],
  [/twist/g, "giro"], [/jump/g, "salto"],
];

export const bodyPartSpanish: Record<string, string> = {
  back: "Espalda", cardio: "Cardio", chest: "Pecho", "lower arms": "Antebrazos", "lower legs": "Pantorrillas",
  neck: "Cuello", shoulders: "Hombros", "upper arms": "Brazos", "upper legs": "Piernas", waist: "Abdomen",
};

const termSpanish: Record<string, string> = {
  abdominals: "Abdominales", abductors: "Abductores", adductors: "Aductores", biceps: "Bíceps",
  calves: "Pantorrillas", cardiovascular: "Cardiovascular", delts: "Deltoides", forearms: "Antebrazos",
  glutes: "Glúteos", hamstrings: "Isquiotibiales", lats: "Dorsales", pectorals: "Pectorales",
  quads: "Cuádriceps", spine: "Columna", traps: "Trapecios", triceps: "Tríceps",
  "body weight": "Peso corporal", band: "Banda", barbell: "Barra", dumbbell: "Mancuernas", cable: "Polea",
  kettlebell: "Pesa rusa", leverage: "Máquina", "smith machine": "Máquina Smith",
  "stability ball": "Pelota de estabilidad", weighted: "Con peso", assisted: "Asistido",
};

export function translateExerciseTerm(value: string) {
  return termSpanish[value.toLowerCase()] || bodyPartSpanish[value.toLowerCase()] || value;
}

export function spanishExerciseName(original: string) {
  let name = original.toLowerCase().trim();
  if (exactNames[name]) name = exactNames[name];
  else {
    let equipment = "";
    for (const [pattern, translated] of equipmentPrefixes) {
      if (pattern.test(name)) { name = name.replace(pattern, ""); equipment = translated; break; }
    }
    for (const [pattern, translated] of phrases) name = name.replace(pattern, translated);
    name = `${name}${equipment ? ` ${equipment}` : ""}`;
  }
  name = name.replace(/\s+/g, " ").replace(/\s+([,)])/g, "$1").trim();
  return name ? name[0].toUpperCase() + name.slice(1) : original;
}
