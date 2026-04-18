import { FAQAccordion } from "@/components/ui/FAQAccordion";

const FAQ_ITEMS = [
  {
    q: "Is China safe for international students?",
    a: "Yes. China consistently ranks among the safest countries for foreign students. University campuses are secure and well-monitored. Millions of international students study there safely every year.",
  },
  {
    q: "Can I study in China in English?",
    a: "Absolutely. Thousands of programs are taught entirely in English, especially at postgraduate level. Use Bridge4China to filter programs by teaching language.",
  },
  {
    q: "How much money do I need per month in China?",
    a: "Budget between $400–$800/month for a comfortable student life in Tier 2 cities, and $700–$1,500 in Tier 1 cities like Beijing or Shanghai. Costs vary significantly by lifestyle.",
  },
  {
    q: "What is the CSC scholarship and how do I apply?",
    a: "The Chinese Government Scholarship (CSC) is a fully-funded scholarship covering tuition, accommodation, and a monthly stipend. Applications open each year around February–April.",
  },
  {
    q: "Do I need to speak Chinese to study in China?",
    a: "Not necessarily. Many universities offer English-taught programs. However, learning basic Chinese will greatly enrich your experience.",
  },
  {
    q: "How long does the university application process take?",
    a: "Typically 2–4 months from submitting documents to receiving your admission letter. Apply early, especially if you're also applying for the CSC scholarship.",
  },
  {
    q: "What documents do I need to apply?",
    a: "Generally: passport, academic transcripts, degree certificate, passport photo, study plan, and language proof. Requirements vary by university and program.",
  },
  {
    q: "Can I work while studying in China?",
    a: "International students on an X1 visa can work part-time with permission from the university and local authorities. Check your specific visa conditions.",
  },
  {
    q: "What is the age limit for studying in China?",
    a: "Most universities accept students aged 18–35 for undergraduate programs and up to 45 for postgraduate. Some programs have stricter limits — always check.",
  },
  {
    q: "How does Bridge4China help me?",
    a: "We match you with the right university and program, guide your application, help you prepare for interviews, and support you through the entire process — from search to arrival.",
  },
];

export function HomeFAQ() {
  return (
    <section className="py-16" style={{ background: "var(--color-bg-secondary)" }}>
      <div className="container-app max-w-3xl">
        <div className="text-center mb-12">
          <h2
            className="font-heading font-black text-3xl md:text-4xl mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Frequently Asked{" "}
            <span
              className="relative inline-block"
              style={{ color: "var(--color-accent)" }}
            >
              Questions
              <span
                className="absolute left-0 -bottom-1 w-full h-0.5 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
            </span>
          </h2>
          <p
            className="text-base md:text-lg max-w-xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Everything you need to know about studying in China with Bridge4China.
          </p>
        </div>
        <FAQAccordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
