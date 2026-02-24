import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Tonehouse AI Coach, built by Tonehouse Studios in Singapore to help musicians practice better.",
  openGraph: {
    title: "About Tonehouse AI Coach",
    description:
      "Built by Tonehouse Studios in Singapore to help musicians practice better with structured systems.",
    url: "/about",
    type: "website",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tonehouse Studios",
  url: "https://www.tonehouse.sg",
  sameAs: [],
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="mt-4 text-zinc-300">
          Tonehouse AI Coach is built by a real physical studio in Singapore:
          Tonehouse Studios.
        </p>
        <p className="mt-3 text-zinc-300">
          The purpose is simple: help musicians practice better with structured
          practice systems that are clear and consistent.
        </p>
        <p className="mt-3 text-zinc-300">Built by Mohith.</p>
      </div>
    </section>
  );
}
