"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface FAQItem {
  q: string
  a: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className="glass rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/5"
              aria-expanded={isOpen}
            >
              <span
                className="font-semibold text-sm md:text-base"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.q}
              </span>
              <span
                className="shrink-0"
                style={{ color: "var(--color-accent)" }}
              >
                {isOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </span>
            </button>

            {isOpen && (
              <div
                className="px-6 pb-5 text-sm md:text-base leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {item.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
