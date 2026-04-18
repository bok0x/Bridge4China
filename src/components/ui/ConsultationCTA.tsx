import Link from "next/link";

interface ConsultationCTAProps {
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function ConsultationCTA({
  heading = "Need Help?",
  subtext = "Our advisors are ready to guide you through every step of studying in China.",
  ctaLabel = "Chat with an Advisor",
  ctaHref = "https://wa.me/message/TOBEADDED",
}: ConsultationCTAProps) {
  const isExternal =
    ctaHref.startsWith("http://") || ctaHref.startsWith("https://");

  return (
    <div
      className="glass rounded-3xl p-10 md:p-14 text-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(72,197,156,0.07) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(72,197,156,0.18)",
      }}
    >
      <h2
        className="font-heading font-bold text-2xl md:text-3xl mb-3"
        style={{ color: "var(--color-text-primary)" }}
      >
        {heading}
      </h2>

      {subtext && (
        <p
          className="text-base mb-7 max-w-lg mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {subtext}
        </p>
      )}

      {isExternal ? (
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent text-base px-8 py-3 inline-flex"
        >
          {ctaLabel}
        </a>
      ) : (
        <Link href={ctaHref} className="btn-accent text-base px-8 py-3">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
