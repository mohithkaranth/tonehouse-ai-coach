import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Tonehouse AI Coach via email in Singapore.",
  openGraph: {
    title: "Contact Tonehouse AI Coach",
    description: "Reach Tonehouse AI Coach at mail@tonehouse.sg.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-4 text-zinc-300">
          Email:{" "}
          <a
            href="mailto:mail@tonehouse.sg"
            className="underline underline-offset-4 hover:text-zinc-100"
          >
            mail@tonehouse.sg
          </a>
        </p>
        <p className="mt-3 text-zinc-300">Location: Singapore</p>
      </div>
    </section>
  );
}
