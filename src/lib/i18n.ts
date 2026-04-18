/* ============================================================
   ChinaUniMatch — Internationalization Dictionary
   Languages: English (en) | Arabic (ar) | French (fr) | Russian (ru)
   ============================================================ */

export type Lang = "en" | "ar" | "fr" | "ru";

export const LANGUAGES: { code: Lang; label: string; native: string; flag: string; rtl?: boolean }[] = [
  { code: "en", label: "English",  native: "English",  flag: "🇬🇧" },
  { code: "ar", label: "Arabic",   native: "العربية",  flag: "🇸🇦", rtl: true },
  { code: "fr", label: "French",   native: "Français", flag: "🇫🇷" },
  { code: "ru", label: "Russian",  native: "Русский",  flag: "🇷🇺" },
];

export type TranslationKey = keyof typeof translations.en;

export const translations = {
  // ── English ──────────────────────────────────────────────────────────────
  en: {
    // Nav
    nav_discover:     "Discover",
    nav_compare:      "Compare",
    nav_scholarships: "Scholarships",
    nav_apply:        "Apply",
    apply_now:        "Apply Now",

    // Hero
    badge:            "AI-Powered University Matching",
    headline_1:       "Find Your Perfect",
    headline_2:       "University in China",
    sub:              "Tell us about yourself — we'll match you with programs from 1,300+ Chinese universities, including CSC scholarship opportunities.",

    // Wizard steps
    step_label:       "Step",
    step_of:          "of",
    step1_title:      "Your Previous Academic Background",
    step1_sub:        "Tell us where you're coming from",
    step2_title:      "What You Want to Study in China",
    step2_sub:        "Tell us what you're looking for",

    // Step 1 fields
    last_degree:      "LAST DEGREE OBTAINED",
    deg_hs:           "High School",
    deg_ba:           "Bachelor's",
    deg_ma:           "Master's",
    deg_other:        "Other",
    gpa_grade:        "GPA / GRADE",

    // Step 2 fields
    target_degree:    "TARGET DEGREE",
    deg_bachelor:     "Bachelor",
    deg_master:       "Master",
    deg_phd:          "PhD",
    field_of_study:   "PREFERRED MAJOR",
    any_field:        "Any field…",
    city:             "PREFERRED CITY / REGION",
    anywhere:         "Anywhere in China",
    teaching_lang:    "TEACHING LANGUAGE",
    lang_en:          "English",
    lang_zh:          "Chinese",
    lang_any:         "Any",
    scholarship:      "SCHOLARSHIP",
    need_scholarship: "Need Scholarship",

    // HeroPremium
    hero_badge:       "#1 Platform for Studying in China",
    hero_headline:    "Your Future in China Starts Here",
    hero_sub:         "Match with the perfect university and scholarship in minutes. 500+ programs, 100+ universities, trusted by students from 80+ countries.",
    hero_cta1:        "Help Me Find My Major",
    hero_cta2:        "I Need Help Applying",
    hero_stat_programs:     "Programs",
    hero_stat_universities: "Universities",
    hero_stat_countries:    "Countries",

    // Buttons
    next_step:        "Next Step",
    back:             "Back",
    find_matches:     "Find My Matches",
    talk_advisor:     "Talk to an Advisor",
    browse_schol:     "Browse Scholarships",

    // Right panel
    uni_tagline:      "China's Top Universities",
    uni_verified:     "Verified data from 30+ provinces",
    top_matches:      "TOP MATCHES FOR YOU",
    students_from:    "Students from",
    countries:        "100+ countries",
    enrolled:         "enrolled in Chinese universities this year",
    scroll:           "Scroll",

    // Stats
    stat_unis:        "Universities",
    stat_programs:    "Programs",
    stat_scholarships:"Scholarships",
  },

  // ── Arabic ────────────────────────────────────────────────────────────────
  ar: {
    nav_discover:     "اكتشف",
    nav_compare:      "قارن",
    nav_scholarships: "المنح",
    nav_apply:        "التقديم",
    apply_now:        "قدّم الآن",

    badge:            "مطابقة الجامعات بالذكاء الاصطناعي",
    headline_1:       "ابحث عن جامعتك المثالية",
    headline_2:       "في الصين",
    sub:              "أخبرنا عن نفسك — سنجد لك البرامج المناسبة من بين أكثر من 1,300 جامعة صينية، بما فيها فرص المنح الدراسية.",

    step_label:       "الخطوة",
    step_of:          "من",
    step1_title:      "خلفيتك الأكاديمية السابقة",
    step1_sub:        "أخبرنا عن مستواك الدراسي الحالي",
    step2_title:      "ما تريد دراسته في الصين",
    step2_sub:        "أخبرنا عمّا تبحث عنه",

    last_degree:      "آخر شهادة حصلت عليها",
    deg_hs:           "الثانوية العامة",
    deg_ba:           "بكالوريوس",
    deg_ma:           "ماجستير",
    deg_other:        "أخرى",
    gpa_grade:        "المعدل / الدرجة",

    target_degree:    "الدرجة العلمية المطلوبة",
    deg_bachelor:     "بكالوريوس",
    deg_master:       "ماجستير",
    deg_phd:          "دكتوراه",
    field_of_study:   "التخصص المفضل",
    any_field:        "أي تخصص…",
    city:             "المدينة / المنطقة المفضلة",
    anywhere:         "أي مكان في الصين",
    teaching_lang:    "لغة التدريس",
    lang_en:          "الإنجليزية",
    lang_zh:          "الصينية",
    lang_any:         "أي لغة",
    scholarship:      "المنحة الدراسية",
    need_scholarship: "أحتاج منحة دراسية",

    // HeroPremium
    hero_badge:       "المنصة الأولى للدراسة في الصين",
    hero_headline:    "مستقبلك في الصين يبدأ هنا",
    hero_sub:         "اعثر على الجامعة والمنحة المثالية في دقائق. أكثر من 500 برنامج، 100+ جامعة، يثق بها طلاب من 80+ دولة.",
    hero_cta1:        "ساعدني في اختيار تخصصي",
    hero_cta2:        "أحتاج مساعدة في التقديم",
    hero_stat_programs:     "برنامج",
    hero_stat_universities: "جامعة",
    hero_stat_countries:    "دولة",

    next_step:        "الخطوة التالية",
    back:             "رجوع",
    find_matches:     "ابحث عن تطابقاتي",
    talk_advisor:     "تحدث مع مستشار",
    browse_schol:     "تصفح المنح",

    uni_tagline:      "أفضل الجامعات في الصين",
    uni_verified:     "بيانات موثقة من أكثر من 30 مقاطعة",
    top_matches:      "أفضل التطابقات لك",
    students_from:    "طلاب من",
    countries:        "أكثر من 100 دولة",
    enrolled:         "التحقوا بالجامعات الصينية هذا العام",
    scroll:           "تمرير",

    stat_unis:        "جامعة",
    stat_programs:    "برنامج",
    stat_scholarships:"منحة",
  },

  // ── French ────────────────────────────────────────────────────────────────
  fr: {
    nav_discover:     "Découvrir",
    nav_compare:      "Comparer",
    nav_scholarships: "Bourses",
    nav_apply:        "Postuler",
    apply_now:        "Postuler",

    badge:            "Correspondance Universitaire par IA",
    headline_1:       "Trouvez Votre Université",
    headline_2:       "Idéale en Chine",
    sub:              "Parlez-nous de vous — nous vous trouverons des programmes parmi 1 300+ universités chinoises, dont des opportunités de bourses CSC.",

    step_label:       "Étape",
    step_of:          "sur",
    step1_title:      "Votre Parcours Académique Antérieur",
    step1_sub:        "Dites-nous d'où vous venez",
    step2_title:      "Ce Que Vous Voulez Étudier en Chine",
    step2_sub:        "Dites-nous ce que vous recherchez",

    last_degree:      "DERNIER DIPLÔME OBTENU",
    deg_hs:           "Lycée (Bac)",
    deg_ba:           "Licence",
    deg_ma:           "Master",
    deg_other:        "Autre",
    gpa_grade:        "MOYENNE / NOTE",

    target_degree:    "DIPLÔME VISÉ",
    deg_bachelor:     "Licence",
    deg_master:       "Master",
    deg_phd:          "Doctorat",
    field_of_study:   "FILIÈRE PRÉFÉRÉE",
    any_field:        "Toute filière…",
    city:             "VILLE / RÉGION PRÉFÉRÉE",
    anywhere:         "N'importe où en Chine",
    teaching_lang:    "LANGUE D'ENSEIGNEMENT",
    lang_en:          "Anglais",
    lang_zh:          "Chinois",
    lang_any:         "Peu importe",
    scholarship:      "BOURSE",
    need_scholarship: "J'ai besoin d'une bourse",

    // HeroPremium
    hero_badge:       "Plateforme N°1 pour Étudier en Chine",
    hero_headline:    "Votre Avenir en Chine Commence Ici",
    hero_sub:         "Trouvez l'université et la bourse idéales en quelques minutes. 500+ programmes, 100+ universités, choisis par des étudiants de 80+ pays.",
    hero_cta1:        "Aidez-moi à Choisir ma Filière",
    hero_cta2:        "J'ai Besoin d'Aide pour Postuler",
    hero_stat_programs:     "Programmes",
    hero_stat_universities: "Universités",
    hero_stat_countries:    "Pays",

    next_step:        "Étape Suivante",
    back:             "Retour",
    find_matches:     "Trouver Mes Correspondances",
    talk_advisor:     "Parler à un Conseiller",
    browse_schol:     "Voir les Bourses",

    uni_tagline:      "Meilleures Universités de Chine",
    uni_verified:     "Données vérifiées dans 30+ provinces",
    top_matches:      "VOS MEILLEURES CORRESPONDANCES",
    students_from:    "Étudiants de",
    countries:        "100+ pays",
    enrolled:         "inscrits dans des universités chinoises cette année",
    scroll:           "Défiler",

    stat_unis:        "Universités",
    stat_programs:    "Programmes",
    stat_scholarships:"Bourses",
  },

  // ── Russian ───────────────────────────────────────────────────────────────
  ru: {
    nav_discover:     "Обзор",
    nav_compare:      "Сравнение",
    nav_scholarships: "Стипендии",
    nav_apply:        "Поступление",
    apply_now:        "Подать заявку",

    badge:            "Подбор университетов с ИИ",
    headline_1:       "Найдите Идеальный",
    headline_2:       "Университет в Китае",
    sub:              "Расскажите о себе — мы подберём программы из 1300+ китайских университетов, включая возможности стипендий КНС.",

    step_label:       "Шаг",
    step_of:          "из",
    step1_title:      "Ваш Предыдущий Академический Уровень",
    step1_sub:        "Расскажите нам о своём образовании",
    step2_title:      "Что Вы Хотите Изучать в Китае",
    step2_sub:        "Расскажите, что вы ищете",

    last_degree:      "ПОСЛЕДНЯЯ ПОЛУЧЕННАЯ СТЕПЕНЬ",
    deg_hs:           "Среднее образование",
    deg_ba:           "Бакалавриат",
    deg_ma:           "Магистратура",
    deg_other:        "Другое",
    gpa_grade:        "GPA / ОЦЕНКА",

    target_degree:    "ЖЕЛАЕМАЯ СТЕПЕНЬ",
    deg_bachelor:     "Бакалавр",
    deg_master:       "Магистр",
    deg_phd:          "Докторантура",
    field_of_study:   "ПРЕДПОЧТИТЕЛЬНАЯ СПЕЦИАЛЬНОСТЬ",
    any_field:        "Любая специальность…",
    city:             "ПРЕДПОЧТИТЕЛЬНЫЙ ГОРОД / РЕГИОН",
    anywhere:         "Везде в Китае",
    teaching_lang:    "ЯЗЫК ОБУЧЕНИЯ",
    lang_en:          "Английский",
    lang_zh:          "Китайский",
    lang_any:         "Любой",
    scholarship:      "СТИПЕНДИЯ",
    need_scholarship: "Нужна стипендия",

    // HeroPremium
    hero_badge:       "Платформа №1 для Учёбы в Китае",
    hero_headline:    "Ваше Будущее в Китае Начинается Здесь",
    hero_sub:         "Найдите идеальный университет и стипендию за несколько минут. 500+ программ, 100+ университетов, доверяют студенты из 80+ стран.",
    hero_cta1:        "Помогите выбрать специальность",
    hero_cta2:        "Нужна помощь с поступлением",
    hero_stat_programs:     "Программ",
    hero_stat_universities: "Университетов",
    hero_stat_countries:    "Стран",

    next_step:        "Следующий шаг",
    back:             "Назад",
    find_matches:     "Найти мои совпадения",
    talk_advisor:     "Поговорить с консультантом",
    browse_schol:     "Смотреть стипендии",

    uni_tagline:      "Лучшие университеты Китая",
    uni_verified:     "Данные из 30+ провинций",
    top_matches:      "ЛУЧШИЕ СОВПАДЕНИЯ ДЛЯ ВАС",
    students_from:    "Студенты из",
    countries:        "100+ стран",
    enrolled:         "поступили в китайские университеты в этом году",
    scroll:           "Прокрутить",

    stat_unis:        "Университетов",
    stat_programs:    "Программ",
    stat_scholarships:"Стипендий",
  },
} as const;
