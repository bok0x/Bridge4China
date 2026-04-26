"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Globe, GraduationCap, Calendar, Clock,
  CheckCircle, XCircle, ArrowLeft, ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedGrid, AnimatedItem } from "@/components/ui/AnimatedGrid";
import { DEGREE_LABELS, LANGUAGE_LABELS, SCHOLARSHIP_TYPE_LABELS } from "@/lib/utils";
import { WHATSAPP_URL } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Program {
  id: string;
  programName: string;
  degree: string;
  teachingLanguage: string;
  field: string;
  intakeSeason: string;
  applicationDeadline?: string;
  originalTuition: number;
  tuitionAfterScholarship?: number;
  accommodationFee?: number;
  requiresPhysicalExam: boolean;
  requiresNonCriminalRecord: boolean;
  requiresEnglishCert: boolean;
  scholarships: Array<{ type: string; name: string; coversTuition: boolean; livingAllowance?: number }>;
}

interface UniData {
  name: string;
  nameZh?: string | null;
  city: string;
  province: string;
  ranking?: number | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  website?: string | null;
  description?: string | null;
  programs: Program[];
}

export function UniversityDetailClient({ uni }: { uni: UniData }) {
  const { t } = useLanguage();
  const { convert } = useCurrency();

  const heroCover =
    uni.coverUrl && !uni.coverUrl.includes("school_rank.png") ? uni.coverUrl : null;

  return (
    <div className="min-h-screen pb-16">
      {/* ── Hero cover banner ─────────────────────────────────────────────── */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        {heroCover ? (
          <Image
            src={heroCover}
            alt={`${uni.name} campus`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-hover) 0%, var(--color-accent) 100%)",
              opacity: 0.4,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,13,26,0.3) 0%, rgba(5,13,26,0.7) 100%)",
          }}
        />
        <div className="absolute top-6 left-0 right-0 container-app">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> {t("uni_back")}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 container-app pb-8">
          <div className="flex items-end gap-4">
            {uni.logoUrl && (
              <div
                className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mb-1"
                style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
              >
                <Image
                  src={uni.logoUrl}
                  alt={`${uni.name} logo`}
                  width={64}
                  height={64}
                  className="object-contain p-1.5 w-full h-full"
                  unoptimized
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-4xl font-heading font-black text-white drop-shadow-lg">
                  {uni.name}
                </h1>
                {uni.ranking && (
                  <span className="badge badge-accent">#{uni.ranking}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-white/75">
                  <MapPin size={13} /> {uni.city}, {uni.province}
                </span>
                {uni.website && (
                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-white/75 hover:text-white transition-colors"
                  >
                    <Globe size={13} /> {t("uni_website")} <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app pt-8">
        {(uni.description || true) && (
          <GlassCard className="mb-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              {uni.description && (
                <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
                  {uni.description}
                </p>
              )}
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hi, I'm interested in ${uni.name}. Can you help me apply?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent text-sm flex-shrink-0"
              >
                {t("apply_via_whatsapp")}
              </a>
            </div>
          </GlassCard>
        )}

        <h2 className="font-heading font-bold text-2xl mb-5">
          {uni.programs?.length ?? 0} {t("uni_programs_label")}
        </h2>
        <AnimatedGrid className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {(uni.programs ?? []).map((program) => (
            <AnimatedItem key={program.id}>
            <GlassCard hover className="flex flex-col gap-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-heading font-bold text-base">{program.programName}</h3>
                  {(program.scholarships?.length ?? 0) > 0 && (
                    <span className="badge badge-accent text-xs flex-shrink-0">{t("uni_scholarship")}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="badge badge-gray">{DEGREE_LABELS[program.degree] ?? program.degree}</span>
                  <span className="badge badge-gray">{LANGUAGE_LABELS[program.teachingLanguage] ?? program.teachingLanguage}</span>
                  {program.field && <span className="badge badge-gray">{program.field}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid var(--glass-border-subtle)" }}>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>{t("uni_tuition")}</p>
                  <p className="font-heading font-bold">{convert(program.originalTuition)}</p>
                  {program.tuitionAfterScholarship != null && (
                    <p className="text-xs" style={{ color: "var(--color-accent)" }}>
                      {t("uni_after_scholarship")}: {convert(program.tuitionAfterScholarship)}
                    </p>
                  )}
                </div>
                {program.accommodationFee != null && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>Accommodation</p>
                    <p className="font-heading font-bold">{convert(program.accommodationFee)}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {program.intakeSeason}
                </span>
                {program.applicationDeadline && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {t("uni_deadline")}: {new Date(program.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>

              {(program.scholarships?.length ?? 0) > 0 && (
                <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: "var(--color-accent-muted)" }}>
                  {program.scholarships.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5" style={{ color: "var(--color-accent)" }}>
                      <GraduationCap size={12} />
                      <strong>{SCHOLARSHIP_TYPE_LABELS[s.type] ?? s.type}:</strong> {s.name}
                      {s.coversTuition && " · Free tuition"}
                      {s.livingAllowance && ` · ${convert(s.livingAllowance)}/mo allowance`}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                <DocFlag required={program.requiresPhysicalExam} label="Physical Exam" />
                <DocFlag required={program.requiresNonCriminalRecord} label="Criminal Record" />
                <DocFlag required={program.requiresEnglishCert} label="English Cert" />
              </div>

              <div className="flex gap-2">
                <Link href={`/programs/${program.id}`} className="btn-ghost text-sm flex-1 justify-center">
                  View Details
                </Link>
                <Link href={`/apply?program=${program.id}`} className="btn-accent text-sm flex-1 justify-center">
                  {t("apply_now")}
                </Link>
              </div>
            </GlassCard>
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      </div>
    </div>
  );
}

function DocFlag({ required, label }: { required: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1">
      {required
        ? <CheckCircle size={12} style={{ color: "var(--color-accent)" }} />
        : <XCircle size={12} style={{ color: "var(--color-text-tertiary)" }} />}
      {label}
    </span>
  );
}
