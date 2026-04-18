"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const SESSION_KEY = "exit_popup_shown";

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const show = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);
  }, []);

  useEffect(() => {
    // Desktop: mouse leaves the document (heading toward browser chrome)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        show();
      }
    };

    // Mobile: fast scroll-up detection
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    const handleScroll = () => {
      const now = Date.now();
      const dy = lastScrollY - window.scrollY; // positive = scrolling up
      const dt = now - lastScrollTime;
      const velocity = dy / (dt || 1); // px/ms

      if (velocity > 2 && window.scrollY < 200) {
        // Fast upward scroll near top
        show();
      }

      lastScrollY = window.scrollY;
      lastScrollTime = now;
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [show]);

  if (!visible) return null;

  const handleCTA = () => {
    setVisible(false);
    router.push("/quiz");
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(2, 7, 5, 0.80)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setVisible(false);
      }}
    >
      <div
        className="glass rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(72,197,156,0.08) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(72,197,156,0.25)",
          boxShadow: "var(--glass-shadow-lg)",
          animation: "popIn 0.25s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{
            color: "var(--color-text-secondary)",
            background: "var(--glass-bg)",
          }}
        >
          <X size={16} />
        </button>

        <div className="text-5xl mb-5">🎁</div>

        <h2
          className="font-heading font-bold text-2xl md:text-3xl mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          Get Your Free China Match Report
        </h2>

        <p
          className="text-base mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Discover your ideal university and major in China. Takes 5 minutes.
        </p>

        <button onClick={handleCTA} className="btn-accent text-base px-8 py-3 w-full">
          Take the Quiz →
        </button>

        <p
          className="mt-4 text-xs"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Free · No signup required
        </p>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
