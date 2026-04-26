"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MapPin, GraduationCap } from "lucide-react";
import { DEGREE_LABELS, SCHOLARSHIP_TYPE_LABELS } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Program } from "@/types";

interface UniversityCardProps {
  program: Program;
}

export function UniversityCard({ program }: UniversityCardProps) {
  const { convert } = useCurrency();
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const hasScholarship = (program.scholarships?.length ?? 0) > 0;
  const primaryScholarship = program.scholarships?.[0];
  const uni = program.university;

  const rawCover = uni?.coverUrl;
  const isPlaceholder = !rawCover || rawCover.includes("school_rank.png");
  const coverSrc = isPlaceholder ? (uni?.logoUrl ?? null) : rawCover;
  const slug = uni?.slug ?? program.universityId;

  return (
    <article
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--glass-border-subtle)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── Cover image (links to program detail) ──────────────────────── */}
      <Link href={`/programs/${program.id}`} className="block relative w-full aspect-[16/9] overflow-hidden bg-[var(--color-bg-tertiary)]">
        {coverSrc && !coverError ? (
          <Image
            src={coverSrc}
            alt={`${uni?.name ?? "University"} campus`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
            onError={() => setCoverError(true)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-hover) 0%, var(--color-accent) 100%)",
              opacity: 0.35,
            }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(5,13,26,0.85) 0%, transparent 55%)",
          }}
        />

        {/* Logo pill */}
        {uni?.logoUrl && !logoError && (
          <div
            className="absolute bottom-3 left-3 w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <Image
              src={uni.logoUrl}
              alt={`${uni.name} logo`}
              fill
              sizes="40px"
              className="object-contain p-1"
              unoptimized
              onError={() => setLogoError(true)}
            />
          </div>
        )}

        {/* Ranking badge */}
        {uni?.ranking && (
          <span
            className="absolute top-3 right-3 text-xs font-heading font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(54,180,137,0.4)",
            }}
          >
            #{uni.ranking}
          </span>
        )}

        {/* Scholarship ribbon */}
        {hasScholarship && (
          <span
            className="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(54,180,137,0.9)",
              color: "#fff",
              backdropFilter: "blur(4px)",
            }}
          >
            <GraduationCap size={11} />
            {primaryScholarship ? (SCHOLARSHIP_TYPE_LABELS[primaryScholarship.type] ?? "Scholarship") : "Scholarship"}
          </span>
        )}
      </Link>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 gap-3 p-4">
        {/* University name + city — links to university page */}
        <div>
          <Link
            href={`/discover/${slug}`}
            className="font-heading font-bold text-base leading-snug line-clamp-1 hover:underline block"
          >
            {uni?.name ?? "University"}
          </Link>
          <div
            className="flex items-center gap-1 mt-1 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <MapPin size={11} />
            <span>{uni?.city}, China</span>
          </div>
        </div>

        {/* Program — links to program detail */}
        <Link href={`/programs/${program.id}`} className="flex-1">
          <p className="font-medium text-sm leading-snug line-clamp-2">{program.programName}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="badge badge-gray">{DEGREE_LABELS[program.degree]}</span>
            <span className="badge badge-gray">
              {program.teachingLanguage === "ENGLISH"
                ? "English"
                : program.teachingLanguage === "CHINESE"
                ? "Chinese"
                : program.teachingLanguage === "RUSSIAN"
                ? "Russian"
                : "Bilingual"}
            </span>
            {program.field && <span className="badge badge-gray">{program.field}</span>}
          </div>
        </Link>

        {/* Fees */}
        <div
          className="mt-auto pt-3 flex items-end justify-between"
          style={{ borderTop: "1px solid var(--glass-border-subtle)" }}
        >
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              Tuition / year
            </p>
            <p className="font-heading font-bold text-lg">{convert(program.originalTuition)}</p>
            {program.tuitionAfterScholarship != null && (
              <p className="text-xs" style={{ color: "var(--color-accent)" }}>
                After scholarship: {convert(program.tuitionAfterScholarship)}
              </p>
            )}
          </div>
          {program.applicationDeadline && (
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Deadline
              </p>
              <p className="text-xs font-semibold">
                {new Date(program.applicationDeadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

    </article>
  );
}
