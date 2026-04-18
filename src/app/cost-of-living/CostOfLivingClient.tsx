"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { useCurrency } from "@/contexts/CurrencyContext";

// ── City data ─────────────────────────────────────────────────────────────────

const CITIES = [
  // Tier 1
  { name: "Beijing",    tier: 1, housing: { dorm: "80–150",  apartment: "500–1,200" }, food: { canteen: "100–150", restaurants: "200–350" }, transport: "25–40",  lifestyle: "100–250", monthly: "700–1,500" },
  { name: "Shanghai",   tier: 1, housing: { dorm: "100–200", apartment: "600–1,500" }, food: { canteen: "100–160", restaurants: "220–380" }, transport: "30–45",  lifestyle: "120–300", monthly: "800–1,800" },
  { name: "Guangzhou",  tier: 1, housing: { dorm: "80–160",  apartment: "450–1,100" }, food: { canteen: "90–140",  restaurants: "180–320" }, transport: "25–35",  lifestyle: "100–220", monthly: "650–1,400" },

  // Tier 2
  { name: "Chengdu",    tier: 2, housing: { dorm: "60–120",  apartment: "300–700" },   food: { canteen: "70–110",  restaurants: "130–250" }, transport: "15–25",  lifestyle: "80–180",  monthly: "450–900" },
  { name: "Wuhan",      tier: 2, housing: { dorm: "50–100",  apartment: "250–600" },   food: { canteen: "60–100",  restaurants: "120–220" }, transport: "15–25",  lifestyle: "70–160",  monthly: "400–850" },
  { name: "Xi'an",      tier: 2, housing: { dorm: "50–100",  apartment: "250–580" },   food: { canteen: "60–100",  restaurants: "120–210" }, transport: "15–20",  lifestyle: "70–150",  monthly: "380–800" },
  { name: "Nanjing",    tier: 2, housing: { dorm: "60–120",  apartment: "300–700" },   food: { canteen: "70–110",  restaurants: "130–240" }, transport: "15–25",  lifestyle: "80–180",  monthly: "450–900" },
  { name: "Hangzhou",   tier: 2, housing: { dorm: "70–130",  apartment: "350–800" },   food: { canteen: "75–120",  restaurants: "140–260" }, transport: "20–30",  lifestyle: "90–200",  monthly: "500–1,000" },
  { name: "Shenzhen",   tier: 2, housing: { dorm: "90–170",  apartment: "500–1,100" }, food: { canteen: "90–140",  restaurants: "180–320" }, transport: "25–35",  lifestyle: "110–240", monthly: "650–1,300" },
  { name: "Tianjin",    tier: 2, housing: { dorm: "55–110",  apartment: "280–650" },   food: { canteen: "65–105",  restaurants: "120–230" }, transport: "15–25",  lifestyle: "75–170",  monthly: "420–880" },
  { name: "Qingdao",    tier: 2, housing: { dorm: "50–100",  apartment: "260–600" },   food: { canteen: "60–95",   restaurants: "115–210" }, transport: "15–22",  lifestyle: "70–155",  monthly: "390–820" },
  { name: "Dalian",     tier: 2, housing: { dorm: "50–100",  apartment: "260–580" },   food: { canteen: "60–95",   restaurants: "110–200" }, transport: "14–22",  lifestyle: "65–150",  monthly: "380–800" },

  // Tier 3
  { name: "Changsha",   tier: 3, housing: { dorm: "40–80",   apartment: "180–400" },   food: { canteen: "50–80",   restaurants: "90–170" },  transport: "10–20",  lifestyle: "50–120",  monthly: "280–600" },
  { name: "Lanzhou",    tier: 3, housing: { dorm: "30–70",   apartment: "150–350" },   food: { canteen: "40–70",   restaurants: "80–150" },  transport: "10–15",  lifestyle: "40–100",  monthly: "220–500" },
  { name: "Kunming",    tier: 3, housing: { dorm: "40–80",   apartment: "180–400" },   food: { canteen: "50–80",   restaurants: "90–160" },  transport: "10–18",  lifestyle: "50–110",  monthly: "260–550" },
  { name: "Hefei",      tier: 3, housing: { dorm: "35–70",   apartment: "170–380" },   food: { canteen: "45–75",   restaurants: "85–155" },  transport: "10–16",  lifestyle: "45–105",  monthly: "240–520" },
  { name: "Nanchang",   tier: 3, housing: { dorm: "35–70",   apartment: "160–360" },   food: { canteen: "42–70",   restaurants: "80–148" },  transport: "10–15",  lifestyle: "42–98",   monthly: "230–500" },
  { name: "Guiyang",    tier: 3, housing: { dorm: "30–65",   apartment: "150–340" },   food: { canteen: "40–68",   restaurants: "78–144" },  transport: "9–15",   lifestyle: "40–95",   monthly: "220–480" },
  { name: "Urumqi",     tier: 3, housing: { dorm: "35–70",   apartment: "165–370" },   food: { canteen: "42–70",   restaurants: "82–148" },  transport: "10–16",  lifestyle: "43–100",  monthly: "230–500" },
  { name: "Harbin",     tier: 3, housing: { dorm: "35–72",   apartment: "170–385" },   food: { canteen: "43–72",   restaurants: "83–150" },  transport: "10–16",  lifestyle: "44–102",  monthly: "235–510" },
];

// ── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Are these cost estimates accurate?",
    a: "These are realistic averages based on 2024-2025 community data from students studying in China. Individual costs vary based on lifestyle choices.",
  },
  {
    q: "Is university accommodation mandatory?",
    a: "Many universities require first-year international students to live on campus. After that, you can choose to rent privately.",
  },
  {
    q: "How much is a typical meal in China?",
    a: "$1.50–$4 at university canteens, $5–$12 at local restaurants. Street food is even cheaper and delicious.",
  },
  {
    q: "Can I open a Chinese bank account as a student?",
    a: "Yes. Most students open accounts at Bank of China or ICBC. You'll need your passport and student ID. This enables Alipay and WeChat Pay.",
  },
  {
    q: "Is China cheaper than my home country?",
    a: "For most international students, especially from Europe, North America, or Gulf countries, China offers significantly lower living costs with high quality of life.",
  },
  {
    q: "Do Chinese universities provide health insurance?",
    a: "Most universities offer affordable health insurance for international students. Some scholarships include it. Check with your specific university.",
  },
];

type TierFilter = "all" | 1 | 2 | 3;

const TIER_CONFIG: Record<1 | 2 | 3, { label: string; color: string }> = {
  1: { label: "Tier 1 — Major Cities",      color: "#F5C518" },
  2: { label: "Tier 2 — Large Cities",      color: "#3B9EE8" },
  3: { label: "Tier 3 — Affordable Cities", color: "#48C59C" },
};

// ── CityCard ──────────────────────────────────────────────────────────────────

function CityCard({ city, fmt }: { city: (typeof CITIES)[number]; fmt: (range: string) => string }) {
  const tierColors: Record<1 | 2 | 3, { bg: string; color: string; border: string }> = {
    1: { bg: "rgba(245, 197, 24, 0.12)",  color: "#F5C518", border: "rgba(245, 197, 24, 0.30)" },
    2: { bg: "rgba(59, 158, 232, 0.12)",  color: "#3B9EE8", border: "rgba(59, 158, 232, 0.30)" },
    3: { bg: "rgba(72, 197, 156, 0.12)",  color: "#48C59C", border: "rgba(72, 197, 156, 0.30)" },
  };
  const tc = tierColors[city.tier as 1 | 2 | 3];

  const rows = [
    { emoji: "🏠", label: "Housing (Dorm)",       value: city.housing.dorm },
    { emoji: "🏠", label: "Housing (Apartment)",  value: city.housing.apartment },
    { emoji: "🍜", label: "Food (Canteen)",        value: city.food.canteen },
    { emoji: "🍽️", label: "Food (Restaurants)",   value: city.food.restaurants },
    { emoji: "🚇", label: "Transport",             value: city.transport },
    { emoji: "🎉", label: "Lifestyle",             value: city.lifestyle },
  ];

  return (
    <div className="glass glass-hover liquid-card flex flex-col p-6 gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading font-black text-2xl" style={{ color: "var(--color-text-primary)" }}>
          {city.name}
        </h3>
        <span
          className="text-xs font-heading font-bold px-3 py-1 rounded-full flex-shrink-0"
          style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
        >
          {TIER_CONFIG[city.tier as 1 | 2 | 3].label.split(" — ")[0]}
        </span>
      </div>

      {/* Cost rows */}
      <div className="flex flex-col gap-2 flex-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-2 py-2"
            style={{ borderBottom: "1px solid var(--glass-border-subtle)" }}
          >
            <span className="text-sm flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
              <span className="text-base leading-none">{row.emoji}</span>
              {row.label}
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--color-text-primary)" }}>
              {fmt(row.value)}/mo
            </span>
          </div>
        ))}
      </div>

      {/* Monthly total */}
      <div
        className="rounded-xl px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--color-accent-muted)", border: "1px solid rgba(72, 197, 156, 0.25)" }}
      >
        <span className="font-heading font-bold text-sm" style={{ color: "var(--color-accent)" }}>
          Monthly Total
        </span>
        <span className="font-heading font-black text-lg" style={{ color: "var(--color-accent)" }}>
          {fmt(city.monthly)}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CostOfLivingClient() {
  const [activeTier, setActiveTier] = useState<TierFilter>("all");
  const { rate, symbol } = useCurrency();

  function fmt(range: string) {
    const [lo, hi] = range.split("–").map(Number);
    return `${symbol}${Math.round(lo * rate).toLocaleString()}–${Math.round(hi * rate).toLocaleString()}`;
  }

  const tabs: Array<{ value: TierFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: 1,     label: "Tier 1" },
    { value: 2,     label: "Tier 2" },
    { value: 3,     label: "Tier 3" },
  ];

  const tiersToShow: Array<1 | 2 | 3> =
    activeTier === "all" ? [1, 2, 3] : [activeTier as 1 | 2 | 3];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>

      {/* ── Section 1: Hero ──────────────────────────────────────────────────── */}
      <section
        className="pt-28 pb-16"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="container-app max-w-3xl text-center">
          <span className="badge badge-accent mb-5 inline-flex">
            Student Budget Guide
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight">
            Cost of Living in{" "}
            <span className="text-gradient">China</span>
          </h1>
          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Compare monthly budgets across Tier 1, Tier 2, and Tier 3 cities — from megacities to affordable university towns.
          </p>
        </div>
      </section>

      {/* ── Section 2: Tier filter tabs ───────────────────────────────────────── */}
      <section
        className="pt-10 pb-4"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="container-app">
          <div className="flex justify-center">
            <div
              className="inline-flex gap-2 p-1.5 rounded-2xl"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
            >
              {tabs.map((tab) => {
                const isActive = tab.value === activeTier;
                return (
                  <button
                    key={String(tab.value)}
                    onClick={() => setActiveTier(tab.value)}
                    className="px-5 py-2.5 rounded-xl font-heading font-bold text-sm transition-all duration-200"
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)",
                            color: "#ffffff",
                            boxShadow: "0 4px 16px var(--color-accent-glow)",
                          }
                        : {
                            background: "transparent",
                            color: "var(--color-text-secondary)",
                          }
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: City cards ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-app flex flex-col gap-12">
          {tiersToShow.map((tier) => {
            const cities = CITIES.filter((c) => c.tier === tier);
            const config = TIER_CONFIG[tier];
            return (
              <div key={tier}>
                {activeTier === "all" && (
                  <h2
                    className="font-heading font-black text-2xl md:text-3xl mb-6"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cities.map((city) => (
                    <CityCard key={city.name} city={city} fmt={fmt} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 4: Disclaimer ─────────────────────────────────────────────── */}
      <section className="pb-4">
        <div className="container-app">
          <p
            className="text-xs text-center"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            All figures are estimates in USD based on 2024–2025 community data. Costs vary significantly by lifestyle and university location.
          </p>
        </div>
      </section>

      {/* ── Section 5: FAQ ───────────────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container-app max-w-3xl">
          <div className="text-center mb-12">
            <span className="badge badge-accent mb-4 inline-flex">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-black">
              Frequently Asked Questions
            </h2>
          </div>
          <FAQAccordion items={FAQS} />
        </div>
      </section>

      {/* ── Section 6: CTA ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-app max-w-xl">
          <div className="glass-elevated p-8 md:p-12 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
              style={{ background: "var(--color-accent-muted)" }}
              aria-hidden="true"
            >
              🏙️
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-3">
              Ready to Find Your{" "}
              <span className="text-gradient">City?</span>
            </h2>
            <p
              className="text-base mb-8"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Answer a few questions and we&apos;ll match you with the right university and city for your goals and budget.
            </p>
            <Link href="/quiz" className="btn-accent text-base px-8 py-4">
              Help Me Find My Major
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
