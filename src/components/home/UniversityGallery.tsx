"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface GalleryUni {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  ranking: number | null;
  logoUrl: string | null;
  coverUrl: string | null;
}

/* ── Static fallback for local dev (no Supabase) ───────────── */
const FALLBACK: GalleryUni[] = [
  { id: "1", name: "Peking University",            slug: "peking-university",            city: "Beijing",   province: "Beijing",   ranking: 1,  logoUrl: null, coverUrl: null },
  { id: "2", name: "Tsinghua University",           slug: "tsinghua-university",           city: "Beijing",   province: "Beijing",   ranking: 2,  logoUrl: null, coverUrl: null },
  { id: "3", name: "Fudan University",              slug: "fudan-university",              city: "Shanghai",  province: "Shanghai",  ranking: 5,  logoUrl: null, coverUrl: null },
  { id: "4", name: "Shanghai Jiao Tong University", slug: "shanghai-jiao-tong-university", city: "Shanghai",  province: "Shanghai",  ranking: 6,  logoUrl: null, coverUrl: null },
  { id: "5", name: "Zhejiang University",           slug: "zhejiang-university",           city: "Hangzhou",  province: "Zhejiang",  ranking: 7,  logoUrl: null, coverUrl: null },
  { id: "6", name: "Nanjing University",            slug: "nanjing-university",            city: "Nanjing",   province: "Jiangsu",   ranking: 13, logoUrl: null, coverUrl: null },
  { id: "7", name: "Wuhan University",              slug: "wuhan-university",              city: "Wuhan",     province: "Hubei",     ranking: 20, logoUrl: null, coverUrl: null },
  { id: "8", name: "Sun Yat-sen University",        slug: "sun-yat-sen-university",        city: "Guangzhou", province: "Guangdong", ranking: 23, logoUrl: null, coverUrl: null },
];

async function fetchFeatured(): Promise<GalleryUni[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return FALLBACK;
  }
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("University")
      .select("id, name, slug, city, province, ranking, logoUrl, coverUrl")
      .not("coverUrl", "is", null)
      .not("coverUrl", "ilike", "%school_rank.png%")
      .not("ranking", "is", null)
      .order("ranking", { ascending: true })
      .limit(12);
    const rows = (data ?? []) as GalleryUni[];
    return rows.length > 0 ? rows : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Individual card
   ─ Rises from ~50px below its grid slot
   ─ Staggered by column (left-to-right wave)
   ─ Slight rotateY that unwraps as it lands (amplifies the container 3-D feel)
   ─────────────────────────────────────────────────────────────────────────── */
function GalleryCard({
  uni,
  idx,
  isHero,
  progress,
}: {
  uni: GalleryUni;
  idx: number;
  isHero: boolean;
  progress: MotionValue<number>;
}) {
  /* Column approximation for stagger:
     hero (idx 0) → col 0 | idx 1 → col 2 | idx 2 → col 3
     idx 3 → col 2 | idx 4 → col 3 | idx 5+ → col 0-3 cycling */
  const colOrder = [0, 2, 3, 2, 3, 0, 1, 2, 3, 0, 1, 2];
  const col = colOrder[Math.min(idx, colOrder.length - 1)];

  /* Each card waits a little more based on its natural order */
  const lag = idx * 0.048;
  const s0  = 0.05 + lag;
  const s1  = Math.min(0.58 + lag, 0.94);

  const y       = useTransform(progress, [s0, s1], [52, 0]);
  const opacity = useTransform(progress, [s0, Math.min(s0 + 0.18, s1)], [0, 1]);

  /* rotateY: left cards start with slight negative tilt, right cards positive.
     Combined with the container rotateX this creates a full 3-D "bowl" feel. */
  const yawStart = (col - 1.5) * 7; // -10.5 … +10.5 deg
  const rotateY  = useTransform(progress, [s0, s1], [yawStart, 0]);

  return (
    <motion.div
      style={{ y, opacity, rotateY }}
      className={isHero ? "col-span-2 row-span-2" : ""}
    >
      <Link
        href={`/discover?province=${encodeURIComponent(uni.province)}`}
        className="group relative rounded-2xl overflow-hidden block w-full h-full"
        style={{
          aspectRatio: isHero ? "1 / 1" : "4 / 3",
          boxShadow: "0 4px 32px rgba(0,0,0,0.30)",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-6px) scale(1.02)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.45)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 32px rgba(0,0,0,0.30)";
        }}
      >
        {/* Cover image */}
        {uni.coverUrl ? (
          <Image
            src={uni.coverUrl}
            alt={`${uni.name} campus`}
            fill
            sizes={isHero ? "50vw" : "25vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
        ) : (
          /* Gradient placeholder — tinted differently per card for variety */
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg,
                hsl(${160 + idx * 22}deg 55% 18%) 0%,
                hsl(${180 + idx * 18}deg 60% 12%) 100%)`,
            }}
          >
            {/* Subtle grid texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.15) 39px,rgba(255,255,255,.15) 40px)," +
                  "repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.15) 39px,rgba(255,255,255,.15) 40px)",
              }}
            />
            {/* University initial monogram */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-heading font-black opacity-20 select-none"
                style={{ fontSize: isHero ? "7rem" : "4rem", color: "var(--color-accent)" }}
              >
                {uni.name.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,13,26,0.95) 0%, rgba(5,13,26,0.15) 55%, transparent 100%)",
          }}
        />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between mb-2">
            {uni.logoUrl && (
              <div
                className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.95)" }}
              >
                <Image
                  src={uni.logoUrl}
                  alt={`${uni.name} logo`}
                  width={32}
                  height={32}
                  className="object-contain p-0.5 w-full h-full"
                  unoptimized
                />
              </div>
            )}
            {uni.ranking && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto"
                style={{ background: "var(--color-accent)", color: "#fff" }}
              >
                #{uni.ranking}
              </span>
            )}
          </div>

          <h3
            className={`font-heading font-bold leading-tight text-white ${
              isHero ? "text-xl md:text-2xl" : "text-sm"
            }`}
          >
            {uni.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-white/70">
            <MapPin size={10} />
            {uni.city}, China
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section

   The WOW effect lives here — the grid container:
     1. Starts tilted in 3-D (rotateX ≈ 40°) like a table viewed from an angle
     2. Simultaneously blurred (focus clears as it levels)
     3. Slightly zoomed out (scale 0.74 → 1)
     4. Translates up from below (y 80 → 0)
   All driven by scrollYProgress — pause mid-scroll and it freezes exactly there.

   Inside the tilting container each card rises with a left-to-right column wave
   + a slight rotateY that unwinds, reinforcing the 3-D bowl impression.
   ─────────────────────────────────────────────────────────────────────────── */
export function UniversityGallery() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 95%", "start 8%"],
  });

  const [universities, setUniversities] = useState<GalleryUni[]>([]);
  useEffect(() => { fetchFeatured().then(setUniversities); }, []);

  /* ── Container 3-D tilt ─────────────────────────────────────── */
  const rotateX    = useTransform(scrollYProgress, [0, 0.68], [40, 0]);
  const gridScale  = useTransform(scrollYProgress, [0, 0.68], [0.74, 1]);
  const gridY      = useTransform(scrollYProgress, [0, 0.68], [88, 0]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.10], [0, 1]);

  /* Blur clears as the grid levels flat — "comes into focus" */
  const blurVal = useTransform(scrollYProgress, [0, 0.60], [10, 0]);
  const filter  = useTransform(blurVal, (v) => `blur(${v.toFixed(2)}px)`);

  /* ── Header ─────────────────────────────────────────────────── */
  const headerOpacity = useTransform(scrollYProgress, [0, 0.22], [0, 1]);
  const headerY       = useTransform(scrollYProgress, [0, 0.22], [28, 0]);

  if (universities.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-16">
      <div className="container-app">

        {/* Header */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="flex items-end justify-between mb-10 gap-4"
        >
          <div>
            <div className="badge badge-accent mb-3">Explore</div>
            <h2 className="text-3xl md:text-4xl font-heading font-black">
              Discover by Campus
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Browse top-ranked universities across China
            </p>
          </div>
          <Link
            href="/discover"
            className="flex items-center gap-2 text-sm font-semibold flex-shrink-0 transition-colors hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* ── Perspective wrapper — makes the 3-D tilt visible ── */}
        <div style={{ perspective: "1200px", perspectiveOrigin: "50% 30%" }}>
          <motion.div
            style={{
              rotateX,
              scale: gridScale,
              y: gridY,
              opacity: gridOpacity,
              filter,
              transformOrigin: "center top",
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {universities.map((uni, idx) => (
              <GalleryCard
                key={uni.id}
                uni={uni}
                idx={idx}
                isHero={idx === 0}
                progress={scrollYProgress}
              />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
