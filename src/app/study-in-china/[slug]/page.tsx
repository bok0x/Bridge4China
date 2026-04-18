import { SEO_PAGES } from "@/lib/seo-pages"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { WHATSAPP_URL, SITE_NAME } from "@/lib/constants"
import { MessageCircle, BookOpen, ArrowRight } from "lucide-react"

export function generateStaticParams() {
  return SEO_PAGES.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const page = SEO_PAGES.find((p) => p.slug === params.slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.metaDescription,
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      type: "article",
    },
    alternates: {
      canonical: `/study-in-china/${page.slug}`,
    },
  }
}

export default function SeoLandingPage({
  params,
}: {
  params: { slug: string }
}) {
  const page = SEO_PAGES.find((p) => p.slug === params.slug)
  if (!page) notFound()

  const relatedPages = SEO_PAGES.filter((p) =>
    page.relatedSlugs.includes(p.slug)
  )

  // JSON-LD FAQPage schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in studying in China and found your guide: "${page.h1}". Can you help me?`
  )
  const whatsappLink = `${WHATSAPP_URL}?text=${whatsappMessage}`

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen pt-24 pb-20">
        <div className="container-app max-w-4xl">

          {/* ── Hero ──────────────────────────────────────────── */}
          <section className="mb-12">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{
                background: "var(--color-accent-muted)",
                color: "var(--color-accent)",
                border: "1px solid var(--color-accent-muted)",
              }}
            >
              <BookOpen size={12} />
              {SITE_NAME} Study Guide
            </div>

            <h1
              className="text-3xl md:text-5xl font-heading font-black leading-tight mb-5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {page.h1}
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed max-w-3xl"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {page.intro}
            </p>
          </section>

          {/* ── Key Facts Table ───────────────────────────────── */}
          <section className="mb-12">
            <h2
              className="text-xl font-heading font-bold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Key Facts
            </h2>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {page.facts.map((fact, i) => (
                    <tr
                      key={i}
                      className={
                        i < page.facts.length - 1
                          ? "border-b"
                          : ""
                      }
                      style={
                        i < page.facts.length - 1
                          ? { borderColor: "var(--glass-border-subtle)" }
                          : undefined
                      }
                    >
                      <td
                        className="px-5 py-3.5 font-semibold w-2/5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {fact.label}
                      </td>
                      <td
                        className="px-5 py-3.5 font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {fact.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Related Guides ────────────────────────────────── */}
          {relatedPages.length > 0 && (
            <section className="mb-12">
              <h2
                className="text-xl font-heading font-bold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Related Guides
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {relatedPages.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/study-in-china/${rel.slug}`}
                    className="glass glass-hover rounded-xl px-4 py-4 flex items-start gap-3 group transition-all"
                  >
                    <ArrowRight
                      size={16}
                      className="shrink-0 mt-0.5 transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--color-accent)" }}
                    />
                    <span
                      className="text-sm font-medium leading-snug"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {rel.h1}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── FAQ Accordion ─────────────────────────────────── */}
          <section className="mb-14">
            <h2
              className="text-xl font-heading font-bold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Frequently Asked Questions
            </h2>
            <FAQAccordion items={page.faqs} />
          </section>

          {/* ── CTA Section ───────────────────────────────────── */}
          <section
            className="glass rounded-2xl px-6 py-10 text-center"
            style={{ background: "var(--color-accent-muted)" }}
          >
            <h2
              className="text-2xl md:text-3xl font-heading font-black mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Ready to Study in China?
            </h2>
            <p
              className="mb-7 max-w-lg mx-auto text-sm md:text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Our advisors help you find the right university, apply for
              scholarships, and navigate the visa process — completely free.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                {page.ctaText}
              </a>

              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all glass glass-hover"
                style={{ color: "var(--color-text-primary)" }}
              >
                <BookOpen size={18} />
                Take the Matching Quiz
              </Link>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
