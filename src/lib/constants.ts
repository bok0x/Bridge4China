export const SITE_NAME = "ChinaUniMatch";
export const SITE_TAGLINE = "Your gateway to Chinese universities";
export const SITE_DESCRIPTION =
  "Discover, compare, and apply to top Chinese universities. Find scholarships, compare tuition costs, and get step-by-step application guidance.";
export const WHATSAPP_NUMBER = "+212628345297";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

export const FIELDS_OF_STUDY = [
  "Engineering",
  "Medicine",
  "Business",
  "Science",
  "Arts & Humanities",
  "Law",
  "Agriculture",
  "Computer Science",
  "Economics",
  "Education",
  "Architecture",
  "Environmental Science",
  "Chinese Language",
  "International Relations",
  "Media & Communication",
];

// ── Location hierarchy: all 31 provinces + their university cities ──────────
export const CHINESE_LOCATIONS: {
  province: string;
  isMunicipality: boolean;
  cities: { city: string; count: number }[];
}[] = [
  // Municipalities (city name === province name)
  { province: "Beijing",      isMunicipality: true,  cities: [{ city: "Beijing",      count: 92 }] },
  { province: "Shanghai",     isMunicipality: true,  cities: [{ city: "Shanghai",     count: 68 }] },
  { province: "Tianjin",      isMunicipality: true,  cities: [{ city: "Tianjin",      count: 57 }] },
  { province: "Chongqing",    isMunicipality: true,  cities: [{ city: "Chongqing",    count: 65 }] },
  // Provinces sorted by total program count
  { province: "Hubei",        isMunicipality: false, cities: [{ city: "Wuhan",        count: 83 }] },
  { province: "Guangdong",    isMunicipality: false, cities: [{ city: "Guangzhou",    count: 83 }, { city: "Shenzhen", count: 14 }] },
  { province: "Henan",        isMunicipality: false, cities: [{ city: "Zhengzhou",    count: 67 }] },
  { province: "Shaanxi",      isMunicipality: false, cities: [{ city: "Xi'an",        count: 63 }] },
  { province: "Sichuan",      isMunicipality: false, cities: [{ city: "Chengdu",      count: 58 }] },
  { province: "Anhui",        isMunicipality: false, cities: [{ city: "Hefei",        count: 54 }] },
  { province: "Jiangxi",      isMunicipality: false, cities: [{ city: "Nanchang",     count: 54 }] },
  { province: "Jiangsu",      isMunicipality: false, cities: [
    { city: "Nanjing",     count: 53 },
    { city: "Suzhou",      count: 26 },
    { city: "Wuxi",        count: 12 },
    { city: "Xuzhou",      count: 12 },
    { city: "Changzhou",   count: 11 },
  ]},
  { province: "Hunan",        isMunicipality: false, cities: [{ city: "Changsha",     count: 52 }] },
  { province: "Heilongjiang", isMunicipality: false, cities: [{ city: "Harbin",       count: 51 }] },
  { province: "Zhejiang",     isMunicipality: false, cities: [
    { city: "Hangzhou",    count: 47 },
    { city: "Ningbo",      count: 15 },
    { city: "Wenzhou",     count: 11 },
  ]},
  { province: "Liaoning",     isMunicipality: false, cities: [{ city: "Shenyang",     count: 45 }, { city: "Dalian", count: 30 }] },
  { province: "Yunnan",       isMunicipality: false, cities: [{ city: "Kunming",      count: 45 }] },
  { province: "Hebei",        isMunicipality: false, cities: [{ city: "Shijiazhuang", count: 44 }] },
  { province: "Shandong",     isMunicipality: false, cities: [{ city: "Jinan",        count: 43 }, { city: "Qingdao", count: 25 }] },
  { province: "Shanxi",       isMunicipality: false, cities: [{ city: "Taiyuan",      count: 41 }] },
  { province: "Fujian",       isMunicipality: false, cities: [{ city: "Fuzhou",       count: 36 }, { city: "Xiamen", count: 16 }] },
  { province: "Guizhou",      isMunicipality: false, cities: [{ city: "Guiyang",      count: 35 }] },
  { province: "Guangxi",      isMunicipality: false, cities: [{ city: "Nanning",      count: 35 }] },
  { province: "Gansu",        isMunicipality: false, cities: [{ city: "Lanzhou",      count: 30 }] },
  { province: "Nei Mongol",   isMunicipality: false, cities: [{ city: "Hohhot",       count: 24 }] },
  { province: "Xinjiang",     isMunicipality: false, cities: [{ city: "Urumqi",       count: 26 }] },
  { province: "Ningxia",      isMunicipality: false, cities: [{ city: "Yinchuan",     count: 18 }] },
  { province: "Hainan",       isMunicipality: false, cities: [{ city: "Haikou",       count: 13 }] },
  { province: "Qinghai",      isMunicipality: false, cities: [{ city: "Xining",       count: 12 }] },
  { province: "Jilin",        isMunicipality: false, cities: [] },
  { province: "Tibet",        isMunicipality: false, cities: [{ city: "Lhasa",        count:  7 }] },
];

/** Derived: city name → province name. "Hangzhou" → "Zhejiang" */
export const CITY_TO_PROVINCE: Record<string, string> = Object.fromEntries(
  CHINESE_LOCATIONS.flatMap((loc) => loc.cities.map((c) => [c.city, loc.province]))
);

// ── Backwards-compatible aliases (existing imports keep working) ─────────────
/** @deprecated Use CHINESE_LOCATIONS instead */
export const CHINESE_PROVINCES = CHINESE_LOCATIONS.map((l) => l.province);

/** @deprecated Use CHINESE_LOCATIONS instead */
export const CHINESE_CITIES: { city: string; count: number }[] =
  CHINESE_LOCATIONS.flatMap((l) => l.cities);

export const NAV_LINKS = [
  { label: "Home",                   href: "/" },
  { label: "How It Works",           href: "/#how-it-works" },
  { label: "Before Coming to China", href: "/before-china" },
  { label: "Cost of Living",         href: "/cost-of-living" },
  { label: "Universities",           href: "/discover" },
  { label: "Lifestyle",              href: "/lifestyle" },
];
