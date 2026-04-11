"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Award, Sparkles,
  ArrowRight, Globe, ChevronDown, ChevronLeft,
  Info,
} from "lucide-react";
import { ScrollScatterCards } from "@/components/home/ScrollScatterCards";
import { FIELDS_OF_STUDY, CHINESE_CITIES, WHATSAPP_URL } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── GPA format configs ──────────────────────────────────── */
const GPA_FORMATS = [
  { label: "4.0",  placeholder: "3.5", max: 4.0  },
  { label: "5.0",  placeholder: "4.2", max: 5.0  },
  { label: "/20",  placeholder: "15",  max: 20   },
  { label: "%",    placeholder: "75",  max: 100  },
];

/* ── Last degree options ─────────────────────────────────── */
type LastDegreeKey = "deg_hs" | "deg_ba" | "deg_ma" | "deg_other";
const LAST_DEGREE_KEYS: LastDegreeKey[] = ["deg_hs", "deg_ba", "deg_ma", "deg_other"];


const STATS = [
  { value: "1,300+",  key: "stat_unis"         as const },
  { value: "12,000+", key: "stat_programs"     as const },
  { value: "490+",    key: "stat_scholarships" as const },
];

/* ── Wizard step indicator ───────────────────────────────── */
function StepIndicator({ step, t }: { step: 1 | 2; t: (k: string) => string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-black transition-all duration-300"
            style={
              step === n
                ? { background: "var(--color-accent)", color: "#fff" }
                : n < step
                ? { background: "var(--color-accent-deep)", color: "var(--color-accent)" }
                : { background: "rgba(255,255,255,0.08)", color: "var(--color-text-tertiary)" }
            }
          >
            {n < step ? "✓" : n}
          </div>
          {n === 1 && (
            <div
              className="w-12 h-px transition-all duration-500"
              style={{
                background:
                  step === 2
                    ? "var(--color-accent)"
                    : "rgba(255,255,255,0.12)",
              }}
            />
          )}
        </div>
      ))}
      <span
        className="text-xs font-heading font-semibold ml-1"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {t("step_label")} {step} {t("step_of")} 2
      </span>
    </div>
  );
}

/* ── Tooltip helper ──────────────────────────────────────── */
function FieldLabel({
  label,
  tooltip,
}: {
  label: string;
  tooltip?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <label
        className="block text-xs font-heading font-bold tracking-widest"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </label>
      {tooltip && (
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onFocus={() => setShow(true)}
            onBlur={() => setShow(false)}
            className="flex items-center"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <Info size={11} />
          </button>
          {show && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-6 w-52 text-xs rounded-xl px-3 py-2 z-50 pointer-events-none"
              style={{
                background: "rgba(10,25,18,0.96)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "var(--color-text-secondary)",
                backdropFilter: "blur(20px)",
              }}
            >
              {tooltip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Hero component ─────────────────────────────────── */
export function Hero() {
  const router = useRouter();
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  /* Parallax for atmospheric orbs */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  /* Form state */
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [gpaFmt, setGpaFmt] = useState(0);
  const [form, setForm] = useState({
    lastDegree: "",
    gpa:        "",
    field:      "",
    degree:     "",
    city:       "",
    language:   "",
    scholarship: false,
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function goNext() {
    setDirection(1);
    setStep(2);
  }

  function goBack() {
    setDirection(-1);
    setStep(1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (form.field)                                   p.set("field",          form.field);
    if (form.degree)                                  p.set("degree",         form.degree);
    if (form.language && form.language !== "any")     p.set("language",       form.language);
    if (form.city)                                    p.set("province",       form.city);
    if (form.scholarship)                             p.set("hasScholarship", "true");
    router.push(`/discover?${p.toString()}`);
  }

  /* ── Toggle button shared style ── */
  const toggleBtn = (active: boolean) =>
    `py-2.5 px-3 text-xs font-heading font-bold rounded-xl border transition-all duration-200 ${
      active
        ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_12px_var(--color-accent-glow)]"
        : "border-transparent bg-white/5 hover:bg-white/10 hover:border-white/15"
    }`;

  /* ── Step content variants ── */
  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir * -40, opacity: 0 }),
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ paddingTop: "7rem", paddingBottom: "4rem" }}
    >
      {/* ── Video background ────────────────────────────────── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 0, opacity: 0.35 }}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay so text stays readable over video */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1, background: "rgba(5,13,26,0.55)" }}
      />

      {/* ── Atmospheric orbs with parallax ──────────────────── */}
      <div aria-hidden className="pointer-events-none select-none" style={{ position: "relative", zIndex: 2 }}>
        <motion.div
          style={{ y: orb1Y }}
          className="absolute -top-32 -left-40 w-[700px] h-[700px] rounded-full opacity-60"
          css-comment="orb1"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(72,197,156,0.28) 0%, transparent 65%)",
              filter: "blur(90px)",
            }}
          />
        </motion.div>
        <motion.div
          style={{ y: orb2Y }}
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-50"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(100,218,227,0.22) 0%, transparent 65%)",
              filter: "blur(90px)",
            }}
          />
        </motion.div>
        <motion.div
          style={{ y: orb3Y }}
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-40"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(80,50,180,0.16) 0%, transparent 65%)",
              filter: "blur(100px)",
            }}
          />
        </motion.div>
      </div>

      <div className="container-app relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT: Copy + Form ─────────────────────────── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 badge badge-accent mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                  style={{ background: "var(--color-accent)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                />
              </span>
              {t("badge")}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-4xl md:text-5xl xl:text-6xl font-heading font-black mb-4 leading-[1.05] tracking-tight"
            >
              {t("headline_1")}
              <br />
              <span className="text-gradient">{t("headline_2")}</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base md:text-lg mb-8 leading-relaxed max-w-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("sub")}
            </motion.p>

            {/* ── 2-Step Matching Wizard ─────────────────────── */}
            <motion.form
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              onSubmit={handleSubmit}
              className="glass rounded-3xl p-6"
              style={{ minHeight: "320px" }}
            >
              {/* Step indicator */}
              <StepIndicator step={step} t={t as unknown as (k: string) => string} />

              {/* Animated step content */}
              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Section heading */}
                    <div className="mb-5">
                      <h3
                        className="font-heading font-black text-base mb-0.5"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {t("step1_title")}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        {t("step1_sub")}
                      </p>
                    </div>

                    {/* Last Degree Obtained */}
                    <div className="mb-5">
                      <FieldLabel
                        label={t("last_degree")}
                        tooltip="Select the highest level of education you have completed so far."
                      />
                      <div className="grid grid-cols-4 gap-1.5">
                        {LAST_DEGREE_KEYS.map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => set("lastDegree", key)}
                            className={toggleBtn(form.lastDegree === key)}
                            style={{
                              color:
                                form.lastDegree === key
                                  ? undefined
                                  : "var(--color-text-secondary)",
                            }}
                          >
                            {t(key as any)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* GPA / Grade */}
                    <div className="mb-6">
                      <FieldLabel
                        label={t("gpa_grade")}
                        tooltip="Enter your cumulative grade in any format — select the scale that matches your transcript."
                      />
                      <div className="flex gap-2">
                        <div
                          className="flex rounded-xl overflow-hidden border border-white/8 flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        >
                          {GPA_FORMATS.map((fmt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setGpaFmt(i)}
                              className={`px-2.5 py-2 text-xs font-heading font-bold transition-all duration-150 ${
                                gpaFmt === i
                                  ? "text-white"
                                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                              }`}
                              style={gpaFmt === i ? { background: "var(--color-accent)" } : {}}
                            >
                              {fmt.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={GPA_FORMATS[gpaFmt].max}
                          placeholder={GPA_FORMATS[gpaFmt].placeholder}
                          className="input-glass flex-1 min-w-0"
                          value={form.gpa}
                          onChange={(e) => set("gpa", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Next button */}
                    <button
                      type="button"
                      onClick={goNext}
                      className="btn-accent w-full py-3 text-[0.9rem] justify-center gap-2"
                    >
                      {t("next_step")}
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4"
                  >
                    {/* Section heading */}
                    <div className="mb-1">
                      <h3
                        className="font-heading font-black text-base mb-0.5"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {t("step2_title")}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        {t("step2_sub")}
                      </p>
                    </div>

                    {/* Row: Target Degree + Field */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Target Degree */}
                      <div>
                        <FieldLabel label={t("target_degree")} />
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["BACHELOR", "MASTER", "PHD"] as const).map((d) => {
                            const lbl =
                              d === "BACHELOR"
                                ? t("deg_bachelor")
                                : d === "MASTER"
                                ? t("deg_master")
                                : t("deg_phd");
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() => set("degree", form.degree === d ? "" : d)}
                                className={toggleBtn(form.degree === d)}
                                style={{
                                  color:
                                    form.degree === d
                                      ? undefined
                                      : "var(--color-text-secondary)",
                                }}
                              >
                                {lbl}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Field of Study */}
                      <div>
                        <FieldLabel label={t("field_of_study")} />
                        <select
                          className="input-glass w-full"
                          value={form.field}
                          onChange={(e) => set("field", e.target.value)}
                        >
                          <option value="">{t("any_field")}</option>
                          {FIELDS_OF_STUDY.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row: City + Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* City / Province */}
                      <div>
                        <FieldLabel label={t("city")} />
                        <select
                          className="input-glass w-full"
                          value={form.city}
                          onChange={(e) => set("city", e.target.value)}
                        >
                          <option value="">{t("anywhere")}</option>
                          {CHINESE_CITIES.map(({ city, count }) => (
                            <option key={city} value={city}>
                              {city} ({count})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Teaching Language */}
                      <div>
                        <FieldLabel label={t("teaching_lang")} />
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { v: "ENGLISH", tKey: "lang_en" },
                              { v: "CHINESE", tKey: "lang_zh" },
                              { v: "any",     tKey: "lang_any" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.v}
                              type="button"
                              onClick={() =>
                                set("language", form.language === opt.v ? "" : opt.v)
                              }
                              className={toggleBtn(form.language === opt.v)}
                              style={{
                                color:
                                  form.language === opt.v
                                    ? undefined
                                    : "var(--color-text-secondary)",
                              }}
                            >
                              {t(opt.tKey)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scholarship toggle */}
                    <div>
                      <FieldLabel label={t("scholarship")} />
                      <button
                        type="button"
                        onClick={() => set("scholarship", !form.scholarship)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-heading font-bold transition-all duration-200 ${
                          form.scholarship
                            ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                        }`}
                        style={{
                          color: form.scholarship ? undefined : "var(--color-text-secondary)",
                        }}
                      >
                        <Award size={14} />
                        {t("need_scholarship")}
                      </button>
                    </div>

                    {/* Back + Submit */}
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={goBack}
                        className="btn-ghost py-3 px-4 gap-2 flex-shrink-0"
                      >
                        <ChevronLeft size={16} />
                        {t("back")}
                      </button>
                      <button
                        type="submit"
                        className="btn-accent flex-1 py-3 text-[0.9rem] justify-center gap-2"
                      >
                        <Sparkles size={16} />
                        {t("find_matches")}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-3 mt-5"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm py-2"
              >
                {t("talk_advisor")}
              </a>
              <a href="/scholarships" className="btn-ghost text-sm py-2">
                {t("browse_schol")}
              </a>
            </motion.div>
          </div>

          {/* ── RIGHT: Match Preview Panel ────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex flex-col gap-4"
          >
            {/* Stats glass card */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-accent-muted)" }}
                >
                  <GraduationCap size={20} style={{ color: "var(--color-accent)" }} />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm">{t("uni_tagline")}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {t("uni_verified")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {STATS.map((s) => (
                  <div
                    key={s.key}
                    className="text-center p-3 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="font-heading font-black text-xl"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {t(s.key)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll-scatter university cards */}
            <div>
              <p
                className="text-xs font-heading font-bold tracking-widest px-1 mb-3"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {t("top_matches")}
              </p>
              <ScrollScatterCards progress={scrollYProgress} />
            </div>

            {/* Globe decoration */}
            <div
              className="glass rounded-2xl p-4 flex items-center gap-3 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Globe size={18} style={{ color: "var(--color-accent)" }} />
              <span>
                {t("students_from")}{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  {t("countries")}
                </strong>{" "}
                {t("enrolled")}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">{t("scroll")}</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
