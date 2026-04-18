export type QuestionType = "matrix" | "number_series" | "verbal" | "spatial";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface IQQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  correctIndex: number;
  matrixGrid?: string[];
  spatialBase?: string;
}

const FULL = "#48C59C";
const MID  = "#1f6b51";
const DIM  = "#0a2a1e";

const matrixQuestions: IQQuestion[] = [
  { id:"m1",type:"matrix",difficulty:1,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,MID,DIM,FULL,MID,DIM,FULL,MID,"?"],options:["DIM","FULL","MID","DIM"],correctIndex:0 },
  { id:"m2",type:"matrix",difficulty:1,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,FULL,FULL,MID,MID,MID,DIM,DIM,"?"],options:["FULL","MID","DIM","MID"],correctIndex:2 },
  { id:"m3",type:"matrix",difficulty:2,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,MID,FULL,MID,DIM,MID,FULL,MID,"?"],options:["DIM","FULL","MID","FULL"],correctIndex:1 },
  { id:"m4",type:"matrix",difficulty:2,prompt:"Which cell completes the pattern?",matrixGrid:[DIM,MID,FULL,MID,FULL,DIM,FULL,DIM,"?"],options:["FULL","MID","DIM","FULL"],correctIndex:1 },
  { id:"m5",type:"matrix",difficulty:3,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,DIM,MID,DIM,MID,FULL,MID,FULL,"?"],options:["MID","FULL","DIM","MID"],correctIndex:2 },
  { id:"m6",type:"matrix",difficulty:3,prompt:"Which cell completes the pattern?",matrixGrid:[MID,FULL,DIM,FULL,DIM,MID,DIM,MID,"?"],options:["FULL","MID","DIM","FULL"],correctIndex:0 },
  { id:"m7",type:"matrix",difficulty:4,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,FULL,MID,FULL,MID,DIM,MID,DIM,"?"],options:["FULL","MID","DIM","MID"],correctIndex:2 },
  { id:"m8",type:"matrix",difficulty:4,prompt:"Which cell completes the pattern?",matrixGrid:[DIM,DIM,FULL,DIM,FULL,MID,FULL,MID,"?"],options:["DIM","MID","FULL","DIM"],correctIndex:1 },
  { id:"m9",type:"matrix",difficulty:5,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,MID,DIM,MID,DIM,FULL,DIM,FULL,"?"],options:["DIM","MID","FULL","DIM"],correctIndex:1 },
  { id:"m10",type:"matrix",difficulty:5,prompt:"Which cell completes the pattern?",matrixGrid:[MID,DIM,FULL,DIM,FULL,MID,FULL,MID,"?"],options:["FULL","DIM","MID","FULL"],correctIndex:1 },
  { id:"m11",type:"matrix",difficulty:2,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,MID,MID,MID,MID,DIM,MID,DIM,"?"],options:["FULL","MID","DIM","MID"],correctIndex:2 },
  { id:"m12",type:"matrix",difficulty:3,prompt:"Which cell completes the pattern?",matrixGrid:[DIM,FULL,MID,FULL,MID,DIM,MID,DIM,"?"],options:["DIM","FULL","MID","DIM"],correctIndex:1 },
  { id:"m13",type:"matrix",difficulty:3,prompt:"Which cell completes the pattern?",matrixGrid:[MID,MID,FULL,MID,FULL,MID,FULL,MID,"?"],options:["MID","FULL","DIM","MID"],correctIndex:0 },
  { id:"m14",type:"matrix",difficulty:4,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,DIM,FULL,DIM,FULL,DIM,FULL,DIM,"?"],options:["MID","DIM","FULL","MID"],correctIndex:2 },
  { id:"m15",type:"matrix",difficulty:5,prompt:"Which cell completes the pattern?",matrixGrid:[DIM,MID,FULL,FULL,DIM,MID,MID,FULL,"?"],options:["FULL","MID","DIM","FULL"],correctIndex:2 },
];

const numberQuestions: IQQuestion[] = [
  { id:"n1",type:"number_series",difficulty:1,prompt:"2, 4, 6, 8, ?",options:["9","10","12","11"],correctIndex:1 },
  { id:"n2",type:"number_series",difficulty:1,prompt:"3, 6, 9, 12, ?",options:["14","15","16","13"],correctIndex:1 },
  { id:"n3",type:"number_series",difficulty:2,prompt:"2, 6, 18, 54, ?",options:["108","162","216","144"],correctIndex:1 },
  { id:"n4",type:"number_series",difficulty:2,prompt:"1, 1, 2, 3, 5, 8, ?",options:["11","12","13","14"],correctIndex:2 },
  { id:"n5",type:"number_series",difficulty:2,prompt:"100, 50, 25, 12.5, ?",options:["5","6","6.25","7"],correctIndex:2 },
  { id:"n6",type:"number_series",difficulty:3,prompt:"2, 3, 5, 9, 17, ?",options:["31","33","35","30"],correctIndex:1 },
  { id:"n7",type:"number_series",difficulty:3,prompt:"1, 4, 9, 16, 25, ?",options:["30","36","42","49"],correctIndex:1 },
  { id:"n8",type:"number_series",difficulty:3,prompt:"3, 5, 9, 15, 23, ?",options:["31","33","35","37"],correctIndex:1 },
  { id:"n9",type:"number_series",difficulty:4,prompt:"1, 2, 6, 24, 120, ?",options:["480","600","720","840"],correctIndex:2 },
  { id:"n10",type:"number_series",difficulty:4,prompt:"7, 14, 28, 56, ?",options:["84","100","112","120"],correctIndex:2 },
  { id:"n11",type:"number_series",difficulty:4,prompt:"2, 5, 10, 17, 26, ?",options:["35","37","39","41"],correctIndex:1 },
  { id:"n12",type:"number_series",difficulty:5,prompt:"1, 3, 7, 13, 21, 31, ?",options:["41","43","45","47"],correctIndex:1 },
  { id:"n13",type:"number_series",difficulty:5,prompt:"2, 4, 12, 48, 240, ?",options:["960","1200","1440","1680"],correctIndex:2 },
  { id:"n14",type:"number_series",difficulty:5,prompt:"0, 1, 3, 6, 10, 15, ?",options:["20","21","22","23"],correctIndex:1 },
  { id:"n15",type:"number_series",difficulty:5,prompt:"1, 8, 27, 64, 125, ?",options:["196","210","216","225"],correctIndex:2 },
];

const verbalQuestions: IQQuestion[] = [
  { id:"v1",type:"verbal",difficulty:1,prompt:"Book is to Library as Painting is to ___",options:["Artist","Museum","Canvas","Gallery"],correctIndex:1 },
  { id:"v2",type:"verbal",difficulty:1,prompt:"Dog is to Puppy as Cat is to ___",options:["Cub","Kitten","Foal","Lamb"],correctIndex:1 },
  { id:"v3",type:"verbal",difficulty:2,prompt:"Surgeon is to Hospital as Professor is to ___",options:["Clinic","Studio","University","Laboratory"],correctIndex:2 },
  { id:"v4",type:"verbal",difficulty:2,prompt:"Warm is to Hot as Cool is to ___",options:["Chilly","Freezing","Cold","Icy"],correctIndex:2 },
  { id:"v5",type:"verbal",difficulty:2,prompt:"Symphony is to Composer as Novel is to ___",options:["Reader","Publisher","Author","Editor"],correctIndex:2 },
  { id:"v6",type:"verbal",difficulty:3,prompt:"Archipelago is to Islands as Constellation is to ___",options:["Planets","Stars","Galaxies","Comets"],correctIndex:1 },
  { id:"v7",type:"verbal",difficulty:3,prompt:"Tenacious is to Resolve as Compassionate is to ___",options:["Strength","Empathy","Courage","Wisdom"],correctIndex:1 },
  { id:"v8",type:"verbal",difficulty:3,prompt:"Prologue is to Book as Overture is to ___",options:["Symphony","Film","Poem","Painting"],correctIndex:0 },
  { id:"v9",type:"verbal",difficulty:4,prompt:"Cartography is to Maps as Numismatics is to ___",options:["Numbers","Stamps","Coins","Antiques"],correctIndex:2 },
  { id:"v10",type:"verbal",difficulty:4,prompt:"Ephemeral is to Permanence as Lucid is to ___",options:["Clarity","Confusion","Brightness","Opacity"],correctIndex:1 },
  { id:"v11",type:"verbal",difficulty:4,prompt:"Penitent is to Remorse as Sanguine is to ___",options:["Anger","Optimism","Sadness","Fear"],correctIndex:1 },
  { id:"v12",type:"verbal",difficulty:5,prompt:"Solipsism is to Self as Anthropocentrism is to ___",options:["Nature","Humanity","Cosmos","Society"],correctIndex:1 },
  { id:"v13",type:"verbal",difficulty:5,prompt:"Apocryphal is to Authenticity as Specious is to ___",options:["Logic","Validity","Truth","Reality"],correctIndex:1 },
  { id:"v14",type:"verbal",difficulty:5,prompt:"Obsequious is to Flattery as Laconic is to ___",options:["Verbosity","Brevity","Silence","Eloquence"],correctIndex:1 },
  { id:"v15",type:"verbal",difficulty:5,prompt:"Hegemony is to Control as Dialectic is to ___",options:["Power","Discourse","Revolution","Order"],correctIndex:1 },
];

const spatialQuestions: IQQuestion[] = [
  { id:"s1",type:"spatial",difficulty:1,prompt:"Which shape is the original rotated 90° clockwise?",options:["A","B","C","D"],correctIndex:0,spatialBase:"L-shape pointing up-right" },
  { id:"s2",type:"spatial",difficulty:1,prompt:"Which shape is the original rotated 180°?",options:["A","B","C","D"],correctIndex:2,spatialBase:"T-shape pointing up" },
  { id:"s3",type:"spatial",difficulty:2,prompt:"Which shape is the original rotated 90° counter-clockwise?",options:["A","B","C","D"],correctIndex:1,spatialBase:"F-shape pointing right" },
  { id:"s4",type:"spatial",difficulty:2,prompt:"Which shape matches the original viewed from behind?",options:["A","B","C","D"],correctIndex:3,spatialBase:"Z-shape" },
  { id:"s5",type:"spatial",difficulty:2,prompt:"Which shape is the original rotated 270° clockwise?",options:["A","B","C","D"],correctIndex:1,spatialBase:"J-shape pointing down" },
  { id:"s6",type:"spatial",difficulty:3,prompt:"Which shape is NOT a rotation of the original?",options:["A","B","C","D"],correctIndex:2,spatialBase:"S-shape" },
  { id:"s7",type:"spatial",difficulty:3,prompt:"Which shape is the original rotated 45°?",options:["A","B","C","D"],correctIndex:0,spatialBase:"Arrow pointing right" },
  { id:"s8",type:"spatial",difficulty:3,prompt:"Which 3D cube matches the unfolded net?",options:["A","B","C","D"],correctIndex:3,spatialBase:"Cross-shaped net" },
  { id:"s9",type:"spatial",difficulty:4,prompt:"Which shape is the original rotated 90° and flipped horizontally?",options:["A","B","C","D"],correctIndex:2,spatialBase:"R-shape" },
  { id:"s10",type:"spatial",difficulty:4,prompt:"Which shape completes the mirror pair?",options:["A","B","C","D"],correctIndex:1,spatialBase:"Irregular 6-pointed shape" },
  { id:"s11",type:"spatial",difficulty:4,prompt:"After two 90° clockwise rotations, which shows the result?",options:["A","B","C","D"],correctIndex:0,spatialBase:"P-shape" },
  { id:"s12",type:"spatial",difficulty:5,prompt:"Which 3D object matches all three views shown?",options:["A","B","C","D"],correctIndex:3,spatialBase:"Three orthographic projections" },
  { id:"s13",type:"spatial",difficulty:5,prompt:"Which shape is the original after rotating 90° CW then reflecting over vertical axis?",options:["A","B","C","D"],correctIndex:2,spatialBase:"Complex L-shape" },
  { id:"s14",type:"spatial",difficulty:5,prompt:"Which shape cannot be made by rotating the original?",options:["A","B","C","D"],correctIndex:1,spatialBase:"Asymmetric 5-cell shape" },
  { id:"s15",type:"spatial",difficulty:5,prompt:"Which cube face is opposite the shaded face?",options:["A","B","C","D"],correctIndex:0,spatialBase:"Net of cube with marked face" },
];

export const ALL_QUESTIONS: IQQuestion[] = [
  ...matrixQuestions,
  ...numberQuestions,
  ...verbalQuestions,
  ...spatialQuestions,
];

export function buildSession(): IQQuestion[] {
  const pickFromType = (type: QuestionType, count: number): IQQuestion[] => {
    const pool = ALL_QUESTIONS.filter(q => q.type === type);
    const mid = pool.filter(q => q.difficulty === 3);
    const low = pool.filter(q => q.difficulty <= 2);
    const high = pool.filter(q => q.difficulty >= 4);
    const sorted = [
      ...mid.sort(() => Math.random() - 0.5),
      ...low.sort(() => Math.random() - 0.5),
      ...high.sort(() => Math.random() - 0.5),
    ];
    return sorted.slice(0, count);
  };
  return [
    ...pickFromType("matrix", 4),
    ...pickFromType("number_series", 4),
    ...pickFromType("verbal", 4),
    ...pickFromType("spatial", 3),
  ];
}

export function adaptiveTheta(theta: number, correct: boolean): number {
  return correct ? Math.min(5, theta + 0.5) : Math.max(1, theta - 0.5);
}

export interface SessionAnswer {
  questionId: string;
  selectedIndex: number;
  timeMs: number;
}

export interface IQScores {
  iq: number;
  percentile: number;
  fri: number;
  qri: number;
  vci: number;
  vsi: number;
  wmi: number;
}

export function scoreSession(answers: SessionAnswer[]): IQScores {
  const questionMap = new Map(ALL_QUESTIONS.map(q => [q.id, q]));

  let totalWeighted = 0;
  let maxWeighted = 0;
  const typeScores: Record<QuestionType, { got: number; max: number }> = {
    matrix: { got: 0, max: 0 },
    number_series: { got: 0, max: 0 },
    verbal: { got: 0, max: 0 },
    spatial: { got: 0, max: 0 },
  };

  for (const answer of answers) {
    const q = questionMap.get(answer.questionId);
    if (!q) continue;
    const correct = answer.selectedIndex === q.correctIndex ? 1 : 0;
    totalWeighted += correct * q.difficulty;
    maxWeighted += q.difficulty;
    typeScores[q.type].got += correct * q.difficulty;
    typeScores[q.type].max += q.difficulty;
  }

  const expectedPct = 0.5;
  const actualPct = maxWeighted > 0 ? totalWeighted / maxWeighted : 0.5;
  const z = (actualPct - expectedPct) / 0.18;
  const iq = Math.round(Math.min(145, Math.max(60, 100 + 15 * z)));

  const toIndex = (s: { got: number; max: number }) =>
    s.max > 0 ? Math.round((s.got / s.max) * 100) : 50;

  const fri = toIndex(typeScores.matrix);
  const qri = toIndex(typeScores.number_series);
  const vci = toIndex(typeScores.verbal);
  const vsi = toIndex(typeScores.spatial);

  const times = answers.map(a => a.timeMs).filter(t => t > 500 && t < 60000);
  const meanTime = times.reduce((a, b) => a + b, 0) / (times.length || 1);
  const variance = times.reduce((a, b) => a + Math.pow(b - meanTime, 2), 0) / (times.length || 1);
  const cvCoeff = meanTime > 0 ? Math.sqrt(variance) / meanTime : 1;
  const wmi = Math.round(Math.min(100, Math.max(20, 100 - cvCoeff * 60)));

  const zScore = (iq - 100) / 15;
  const percentile = Math.round(normalCDF(zScore) * 100);

  return { iq, percentile, fri, qri, vci, vsi, wmi };
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}

export function iqLabel(iq: number): { label: string; analysis: string } {
  if (iq >= 130) return { label: "Very Superior", analysis: "Your score places you in the top 2% of the population. You demonstrate exceptional abstract reasoning and pattern recognition abilities consistent with high academic achievement." };
  if (iq >= 120) return { label: "Superior", analysis: "Your score places you in the top 9% of the population. You show strong logical reasoning and cognitive flexibility well-suited to demanding academic environments." };
  if (iq >= 110) return { label: "High Average", analysis: "Your score is above average, placing you in the top 25%. You demonstrate solid reasoning skills that support success in rigorous academic programs." };
  if (iq >= 90)  return { label: "Average", analysis: "Your score falls in the average range, shared by 50% of the population. You show balanced reasoning across verbal, numerical, and visual domains." };
  if (iq >= 80)  return { label: "Low Average", analysis: "Your score is in the low-average range. Consider reviewing the question types you found challenging — focused practice can improve all cognitive indices." };
  return { label: "Below Average", analysis: "Your score suggests some difficulty with timed abstract reasoning. This can improve significantly with practice and familiarity with the question formats." };
}
