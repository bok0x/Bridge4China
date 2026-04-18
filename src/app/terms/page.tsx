import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Bridge4China",
  description: "Terms of Service for Bridge4China.",
};

export default function TermsPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg-base)" }}
    >
      <div className="container-app pt-28 pb-20 max-w-2xl">
        <h1
          className="font-heading font-bold text-4xl mb-6"
          style={{ color: "var(--color-text-primary)" }}
        >
          Terms of Service
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Terms of service coming soon. Our full terms will be published before
          launch. For any questions, please contact us at{" "}
          <a
            href="mailto:hello@bridge4china.com"
            className="hover:text-[var(--color-accent)] transition-colors"
            style={{ color: "var(--color-accent)" }}
          >
            hello@bridge4china.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
