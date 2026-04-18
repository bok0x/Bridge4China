// quizData.ts — Quiz questions and matching logic (not a React component)

export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: QuizOption[];
}

export interface Recommendation {
  major: string;
  university: string;
  city: string;
  match: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Category 1: Academic Background (Q1-5)
  {
    id: "q1",
    category: "Academic Background",
    question: "What is your highest completed level of education?",
    options: [
      { label: "High School", value: "high_school" },
      { label: "Bachelor's", value: "bachelors" },
      { label: "Master's", value: "masters" },
      { label: "Other", value: "other" },
    ],
  },
  {
    id: "q2",
    category: "Academic Background",
    question: "What was your approximate GPA?",
    options: [
      { label: "Below 2.5", value: "below_2_5" },
      { label: "2.5–3.0", value: "2_5_to_3_0" },
      { label: "3.0–3.5", value: "3_0_to_3_5" },
      { label: "3.5–4.0", value: "3_5_to_4_0" },
    ],
  },
  {
    id: "q3",
    category: "Academic Background",
    question: "What was your main field of study?",
    options: [
      { label: "Engineering & Tech", value: "engineering" },
      { label: "Business & Economics", value: "business" },
      { label: "Medicine & Health", value: "medicine" },
      { label: "Arts & Humanities", value: "arts" },
      { label: "Sciences", value: "sciences" },
      { label: "Law & Social Sciences", value: "law" },
    ],
  },
  {
    id: "q4",
    category: "Academic Background",
    question: "How would you rate your English proficiency?",
    options: [
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
      { label: "Native/Near-Native", value: "native" },
    ],
  },
  {
    id: "q5",
    category: "Academic Background",
    question: "Have you studied or traveled in China before?",
    options: [
      { label: "Never", value: "never" },
      { label: "Visited briefly", value: "visited" },
      { label: "Studied short-term", value: "studied_short" },
      { label: "Lived there", value: "lived" },
    ],
  },

  // Category 2: Career & Goals (Q6-10)
  {
    id: "q6",
    category: "Career & Goals",
    question: "What industry do you want to work in?",
    options: [
      { label: "Technology", value: "technology" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Finance", value: "finance" },
      { label: "Education", value: "education" },
      { label: "Manufacturing", value: "manufacturing" },
      { label: "Government", value: "government" },
      { label: "Creative Industries", value: "creative" },
    ],
  },
  {
    id: "q7",
    category: "Career & Goals",
    question: "Where do you see yourself in 5 years?",
    options: [
      { label: "Building a startup", value: "startup" },
      { label: "Working at a top company", value: "top_company" },
      { label: "Academic/research career", value: "academic" },
      { label: "Government or NGO", value: "government_ngo" },
      { label: "Not sure yet", value: "unsure" },
    ],
  },
  {
    id: "q8",
    category: "Career & Goals",
    question: "How important is salary potential to your choice?",
    options: [
      { label: "Very important", value: "very_important" },
      { label: "Somewhat important", value: "somewhat_important" },
      { label: "Not my priority", value: "not_priority" },
    ],
  },
  {
    id: "q9",
    category: "Career & Goals",
    question: "Do you prefer theoretical learning or hands-on practice?",
    options: [
      { label: "Mostly theory", value: "theory" },
      { label: "Mix of both", value: "mixed" },
      { label: "Mostly practical", value: "practical" },
    ],
  },
  {
    id: "q10",
    category: "Career & Goals",
    question: "Are you interested in conducting research?",
    options: [
      { label: "Yes, definitely", value: "yes" },
      { label: "Maybe", value: "maybe" },
      { label: "No preference", value: "no" },
    ],
  },

  // Category 3: Lifestyle & Preferences (Q11-15)
  {
    id: "q11",
    category: "Lifestyle & Preferences",
    question: "What city size do you prefer?",
    options: [
      { label: "Mega-city (10M+)", value: "mega_city" },
      { label: "Large city (3-10M)", value: "large_city" },
      { label: "Medium city (1-3M)", value: "medium_city" },
      { label: "Small city or town", value: "small_city" },
    ],
  },
  {
    id: "q12",
    category: "Lifestyle & Preferences",
    question: "What is your monthly budget for living expenses (USD)?",
    options: [
      { label: "Under $400", value: "under_400" },
      { label: "$400–$700", value: "400_to_700" },
      { label: "$700–$1,200", value: "700_to_1200" },
      { label: "$1,200+", value: "over_1200" },
    ],
  },
  {
    id: "q13",
    category: "Lifestyle & Preferences",
    question: "What climate do you prefer?",
    options: [
      { label: "Cold winters", value: "cold" },
      { label: "Hot summers", value: "hot" },
      { label: "Mild year-round", value: "mild" },
      { label: "No preference", value: "no_preference" },
    ],
  },
  {
    id: "q14",
    category: "Lifestyle & Preferences",
    question: "How social are you?",
    options: [
      { label: "Very social, love meeting people", value: "very_social" },
      { label: "Balanced", value: "balanced" },
      { label: "Prefer quieter environments", value: "quiet" },
    ],
  },
  {
    id: "q15",
    category: "Lifestyle & Preferences",
    question: "How far are you comfortable being from home?",
    options: [
      { label: "Within 5 hours flight", value: "near" },
      { label: "Up to 10 hours", value: "medium_distance" },
      { label: "Distance doesn't matter", value: "any_distance" },
    ],
  },

  // Category 4: Personality (Q16-20)
  {
    id: "q16",
    category: "Personality",
    question: "How do you make big decisions?",
    options: [
      { label: "Research everything thoroughly", value: "research" },
      { label: "Trust my gut", value: "gut" },
      { label: "Ask people I trust", value: "ask_others" },
      { label: "Go with the flow", value: "flow" },
    ],
  },
  {
    id: "q17",
    category: "Personality",
    question: "What motivates you most?",
    options: [
      { label: "Achievement & recognition", value: "achievement" },
      { label: "Learning & growth", value: "learning" },
      { label: "Security & stability", value: "security" },
      { label: "Making an impact", value: "impact" },
    ],
  },
  {
    id: "q18",
    category: "Personality",
    question: "How do you handle challenges?",
    options: [
      { label: "Push through independently", value: "independent" },
      { label: "Seek help immediately", value: "seek_help" },
      { label: "Take breaks and return", value: "take_breaks" },
      { label: "Step back and reassess", value: "reassess" },
    ],
  },
  {
    id: "q19",
    category: "Personality",
    question: "Describe your learning style:",
    options: [
      { label: "Visual learner", value: "visual" },
      { label: "Hands-on", value: "hands_on" },
      { label: "Reading & writing", value: "reading_writing" },
      { label: "Discussion & debate", value: "discussion" },
    ],
  },
  {
    id: "q20",
    category: "Personality",
    question: "What's your primary reason for studying in China?",
    options: [
      { label: "Quality education at lower cost", value: "cost" },
      { label: "Unique experience", value: "experience" },
      { label: "Career in China/Asia", value: "career_china" },
      { label: "CSC scholarship", value: "csc_scholarship" },
      { label: "Language & culture", value: "language_culture" },
    ],
  },
];

// Matching logic
const MATCH_TABLE: Record<string, Recommendation> = {
  engineering: {
    major: "Computer Science",
    university: "Tsinghua University",
    city: "Beijing",
    match: 97,
  },
  business: {
    major: "International Business",
    university: "Fudan University",
    city: "Shanghai",
    match: 94,
  },
  medicine: {
    major: "Clinical Medicine (MBBS)",
    university: "China Medical University",
    city: "Shenyang",
    match: 93,
  },
  arts: {
    major: "Fine Arts",
    university: "Central Academy of Fine Arts",
    city: "Beijing",
    match: 89,
  },
  sciences: {
    major: "Applied Chemistry",
    university: "Peking University",
    city: "Beijing",
    match: 91,
  },
  law: {
    major: "International Law",
    university: "Wuhan University",
    city: "Wuhan",
    match: 88,
  },
  default: {
    major: "Business Administration",
    university: "Beijing Normal University",
    city: "Beijing",
    match: 85,
  },
};

// Secondary options for variety in the 3-recommendation list
const SECONDARY_MATCHES: Record<string, Recommendation[]> = {
  engineering: [
    { major: "Artificial Intelligence", university: "Shanghai Jiao Tong University", city: "Shanghai", match: 93 },
    { major: "Electrical Engineering", university: "Zhejiang University", city: "Hangzhou", match: 90 },
  ],
  business: [
    { major: "Finance & Accounting", university: "Peking University", city: "Beijing", match: 91 },
    { major: "Marketing & Management", university: "Sun Yat-sen University", city: "Guangzhou", match: 87 },
  ],
  medicine: [
    { major: "Pharmacy", university: "Peking Union Medical College", city: "Beijing", match: 90 },
    { major: "Public Health", university: "Fudan University", city: "Shanghai", match: 87 },
  ],
  arts: [
    { major: "Architecture & Design", university: "Tongji University", city: "Shanghai", match: 86 },
    { major: "Media & Communication", university: "Communication University of China", city: "Beijing", match: 83 },
  ],
  sciences: [
    { major: "Biotechnology", university: "Tsinghua University", city: "Beijing", match: 89 },
    { major: "Environmental Science", university: "Nanjing University", city: "Nanjing", match: 86 },
  ],
  law: [
    { major: "Political Science", university: "Renmin University", city: "Beijing", match: 85 },
    { major: "Economics", university: "Fudan University", city: "Shanghai", match: 84 },
  ],
  default: [
    { major: "Chinese Language & Culture", university: "Beijing Language and Culture University", city: "Beijing", match: 82 },
    { major: "Tourism Management", university: "Sun Yat-sen University", city: "Guangzhou", match: 80 },
  ],
};

// Industry-to-field secondary refinement
const INDUSTRY_FIELD_MAP: Record<string, string> = {
  technology: "engineering",
  healthcare: "medicine",
  finance: "business",
  education: "law",
  manufacturing: "engineering",
  government: "law",
  creative: "arts",
};

export function getRecommendations(answers: Record<string, string>): Recommendation[] {
  const fieldOfStudy = answers["q3"] ?? "";
  const industry = answers["q6"] ?? "";

  // Determine primary key: field of study takes precedence
  let primaryKey = fieldOfStudy in MATCH_TABLE ? fieldOfStudy : "default";

  // Secondary refinement: if industry points to a different field and primary is default, use industry mapping
  if (primaryKey === "default" && industry && INDUSTRY_FIELD_MAP[industry]) {
    primaryKey = INDUSTRY_FIELD_MAP[industry];
  }

  // If field is default but industry maps to a field, blend
  let secondaryKey = primaryKey;
  if (industry && INDUSTRY_FIELD_MAP[industry] && INDUSTRY_FIELD_MAP[industry] !== primaryKey) {
    secondaryKey = INDUSTRY_FIELD_MAP[industry];
  }

  const primary = MATCH_TABLE[primaryKey] ?? MATCH_TABLE["default"];
  const secondaries = SECONDARY_MATCHES[secondaryKey] ?? SECONDARY_MATCHES["default"];

  // Adjust match scores slightly based on GPA
  const gpa = answers["q2"] ?? "";
  const gpaBonus = gpa === "3_5_to_4_0" ? 1 : gpa === "3_0_to_3_5" ? 0 : gpa === "2_5_to_3_0" ? -1 : -2;

  return [
    { ...primary, match: Math.min(99, primary.match + gpaBonus) },
    { ...secondaries[0], match: Math.min(98, secondaries[0].match + gpaBonus) },
    { ...secondaries[1], match: Math.min(97, secondaries[1].match + gpaBonus) },
  ];
}
