import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Bridge4China",
  description: "Privacy Policy for Bridge4China.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Privacy policy coming soon. We are committed to protecting your
          personal data and will publish our full privacy policy before launch.
          For any privacy-related enquiries, please contact us at{" "}
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
