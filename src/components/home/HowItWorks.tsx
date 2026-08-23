import { Dictionary } from "@/lib/i18n";

interface HowItWorksProps {
  copy: Dictionary["home"]["howItWorks"];
}

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section className="border-y border-line bg-white py-24">
      <div className="container-content">
        <p className="eyebrow text-center">{copy.eyebrow}</p>
        <h2 className="mx-auto mt-4 max-w-xl text-center text-3xl leading-tight md:text-4xl">
          {copy.heading}
        </h2>

        <ol className="mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          {copy.steps.map((step, index) => (
            <li key={step.number} className="relative flex flex-col gap-3">
              <span className="font-display text-4xl text-brass-400/70">{step.number}</span>
              <h3 className="text-[17px] text-ink-950">{step.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-ink-500">{step.description}</p>
              {index < copy.steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute end-[-14px] top-3 hidden h-px w-7 bg-ink-950/10 md:block rtl:rotate-180"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
