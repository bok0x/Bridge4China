"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

// ── Data ─────────────────────────────────────────────────────────────────────

const FOOD_CARDS = [
  {
    emoji: "🍜",
    title: "Regional Cuisine",
    description:
      "China's eight great culinary traditions span from spicy Sichuan mapo tofu to delicate Cantonese dim sum. Every province is a new flavor universe.",
  },
  {
    emoji: "🌃",
    title: "Street Food & Night Markets",
    description:
      "Night markets like those in Chengdu, Xi'an, and Wuhan burst with skewers, dumplings, and local snacks for just a few yuan. Student life staple.",
  },
  {
    emoji: "🍱",
    title: "Campus Canteens",
    description:
      "University canteens serve subsidized hot meals — rice dishes, noodles, stir-fries — for as little as ¥5–¥15. Your stomach and wallet will thank you.",
  },
  {
    emoji: "🍵",
    title: "Tea Culture",
    description:
      "Whether it's green tea in Hangzhou or pu-erh in Yunnan, tea is everywhere. Tea houses offer a quiet social space that's both affordable and authentic.",
  },
  {
    emoji: "🫕",
    title: "Hotpot & Social Dining",
    description:
      "Hotpot is more than a meal — it's how Chinese students bond. Shared boiling broth, endless ingredients, and hours of conversation around the table.",
  },
];

const SOCIAL_CARDS = [
  {
    emoji: "🤝",
    title: "Making Friends",
    description:
      "Chinese classmates are often curious and welcoming to international students. Shared language classes and dorm floors are the fastest friendships.",
  },
  {
    emoji: "🎓",
    title: "Student Clubs",
    description:
      "Most universities have dozens of clubs — dance, sports, language exchange, entrepreneurship. Joining one is the single best way to plug into campus life.",
  },
  {
    emoji: "🌍",
    title: "International Community",
    description:
      "Major universities host thousands of international students from Africa, Southeast Asia, the Middle East, and beyond. You'll never feel alone.",
  },
  {
    emoji: "🏙️",
    title: "Weekends in the City",
    description:
      "High-speed trains make weekend trips effortless. Visit ancient temples, modern megacities, mountain parks, or coastal towns — all within reach.",
  },
];

const HEALTH_ITEMS = [
  {
    emoji: "🏥",
    title: "Campus Clinics",
    description:
      "Every major university has an on-campus medical center offering low-cost consultations, vaccinations, and basic treatment for common illnesses.",
  },
  {
    emoji: "🆘",
    title: "Emergency Numbers",
    description: "Police: 110 · Ambulance: 120 · Fire: 119 · Traffic: 122",
  },
  {
    emoji: "🌡️",
    title: "Hospitals",
    description:
      "International VIP wards at top hospitals offer English-speaking doctors. Your student health insurance (required by most universities) covers many costs.",
  },
  {
    emoji: "🛡️",
    title: "Safety Tips",
    description:
      "China ranks among the safest countries for international students. Keep copies of your passport, register at your local police station within 24 hours of arrival.",
  },
];

const CONNECT_ITEMS = [
  {
    emoji: "💬",
    title: "WeChat",
    description:
      "WeChat is essential — messaging, payments, food delivery, maps, and social all in one app. Set it up before you land. Everyone uses it.",
  },
  {
    emoji: "💳",
    title: "Alipay",
    description:
      "China is a near-cashless society. Alipay lets you pay for everything from street food to train tickets. Link it to your Chinese bank account.",
  },
  {
    emoji: "🔒",
    title: "VPN Access",
    description:
      "Some international apps and websites are restricted in China. A VPN can help — research options before you arrive and set one up in advance.",
  },
  {
    emoji: "📱",
    title: "SIM Cards",
    description:
      "Local SIMs from China Mobile, Unicom, or Telecom are affordable and fast. You can also get international SIMs with China data before departure.",
  },
  {
    emoji: "📞",
    title: "Calling Home",
    description:
      "WeChat Video Calls are free and high-quality. WhatsApp works over VPN. International calling cards are another affordable option.",
  },
];

// ── FAQ data ─────────────────────────────────────────────────────────────────

const LIFESTYLE_FAQS = [
  {
    q: "Is the food in China suitable for different dietary needs?",
    a: "China has incredible variety. Vegetarian options are widely available. Halal restaurants are common in many cities. Communicate dietary restrictions to canteen staff.",
  },
  {
    q: "How easy is it to make friends in China?",
    a: "Very easy. Universities organize welcome events and international student clubs. Chinese students are generally curious and welcoming toward international peers.",
  },
  {
    q: "Is public transport reliable in China?",
    a: "China has world-class public transport — metro systems, high-speed rail, and buses. Getting around is cheap, safe, and efficient.",
  },
  {
    q: "Can I travel within China during holidays?",
    a: "Absolutely. China's high-speed rail network connects most cities affordably. Holiday travel is a highlight for most international students.",
  },
  {
    q: "Is English widely spoken in Chinese cities?",
    a: "In major cities and university areas, you'll find English speakers. Outside these areas, translation apps (like WeChat) make communication easy.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function LifestyleClient() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -40]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.section
        className="container-app pt-28 pb-16 text-center"
        style={{ y: heroY }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 glass">
          <span>🎓</span>
          <span style={{ color: "var(--color-accent)" }}>Student Life Guide</span>
        </div>
        <h1
          className="font-heading font-bold text-4xl md:text-6xl mb-5 leading-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Life in China<br />
          <span style={{ color: "var(--color-accent)" }}>as a Student</span>
        </h1>
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Discover what makes studying in China a truly life-changing experience.
          From street food to social life, health to staying connected — here is
          everything you need to know.
        </p>
      </motion.section>

      {/* ── Food & Culture ────────────────────────────────────── */}
      <section className="container-app py-16">
        <div className="mb-10">
          <h2
            className="font-heading font-bold text-3xl md:text-4xl mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            🍜 Food &amp; Culture
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Eating in China is one of the greatest adventures of student life.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FOOD_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="liquid-card glass rounded-2xl p-6"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div className="text-4xl mb-4">{card.emoji}</div>
              <h3
                className="font-heading font-semibold text-lg mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Social Life ──────────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="container-app">
          <div className="mb-10">
            <h2
              className="font-heading font-bold text-3xl md:text-4xl mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              🤝 Social Life
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
              China's campus culture is vibrant, diverse, and incredibly welcoming
              to international students.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SOCIAL_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="liquid-card glass rounded-2xl p-6 flex gap-4"
                style={{ position: "relative", overflow: "hidden" }}
              >
                <div className="text-3xl flex-shrink-0">{card.emoji}</div>
                <div>
                  <h3
                    className="font-heading font-semibold text-lg mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Health & Safety ──────────────────────────────────── */}
      <section className="container-app py-16">
        <div className="mb-10">
          <h2
            className="font-heading font-bold text-3xl md:text-4xl mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            🏥 Health &amp; Safety
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            China is one of the safest countries in the world for international
            students, with quality campus healthcare.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HEALTH_ITEMS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="liquid-card glass rounded-2xl p-6"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3
                className="font-heading font-semibold text-lg mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Staying Connected ─────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="container-app">
          <div className="mb-10">
            <h2
              className="font-heading font-bold text-3xl md:text-4xl mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              📱 Staying Connected
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Navigating China's digital ecosystem is part of the adventure. Here
              is what you need to know before and after arrival.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONNECT_ITEMS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="liquid-card glass rounded-2xl p-6"
                style={{ position: "relative", overflow: "hidden" }}
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3
                  className="font-heading font-semibold text-lg mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="container-app py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="font-heading font-bold text-3xl md:text-4xl mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Frequently Asked{" "}
              <span
                className="relative inline-block"
                style={{ color: "var(--color-accent)" }}
              >
                Questions
                <span
                  className="absolute left-0 -bottom-1 w-full h-0.5 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                />
              </span>
            </h2>
            <p
              className="text-base md:text-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Common questions about student life in China.
            </p>
          </div>
          <FAQAccordion items={LIFESTYLE_FAQS} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="container-app py-20">
        <div
          className="glass rounded-3xl p-10 md:p-16 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(72,197,156,0.08) 0%, rgba(255,255,255,0.04) 100%)",
            border: "1px solid rgba(72,197,156,0.25)",
          }}
        >
          <div className="text-5xl mb-5">🌏</div>
          <h2
            className="font-heading font-bold text-3xl md:text-4xl mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Ready to Experience China?
          </h2>
          <p
            className="text-lg mb-8 max-w-xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Take our 5-minute quiz and discover your ideal university, city, and
            scholarship path in China.
          </p>
          <Link href="/quiz" className="btn-accent text-base px-8 py-3">
            Take the Free Quiz →
          </Link>
        </div>
      </section>
    </div>
  );
}
