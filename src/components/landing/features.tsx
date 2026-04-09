import type { LandingFeature } from "@/types/app";

const features: LandingFeature[] = [
  {
    title: "Private by design",
    description:
      "Messages are stored securely and only shown to authorized recipients.",
  },
  {
    title: "Gift moments",
    description:
      "Attach digital gifts like coupons, audio notes, and surprise images.",
  },
  {
    title: "Timed unlocks",
    description:
      "Schedule delivery and reveal your surprise exactly when it matters.",
  },
];

export function Features() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
