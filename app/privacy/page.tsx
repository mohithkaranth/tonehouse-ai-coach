import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Tonehouse Coach",
  description: "Privacy policy for Tonehouse Coach operated by Tonehouse Studios, Singapore.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <div className="mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
        <Link href="/" className="text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-100">
          ← Back to Home
        </Link>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Privacy Policy – Tonehouse Coach
        </h1>

        <div className="mt-8 space-y-8">
          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Introduction</h2>
            <p className="text-base leading-relaxed text-zinc-300">
              Tonehouse Coach is a music coaching platform operated by Tonehouse Studios,
              Singapore.
            </p>
          </section>

          <div className="my-12 border-t border-zinc-800" />

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Information We Collect</h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-300 marker:text-zinc-500">
              <li>
                Authentication details provided through Google Sign-In (Tonehouse does not
                access or store passwords)
              </li>
              <li>Name and email provided via Google Sign-In</li>
              <li>Usage data related to practice sessions and coaching tools</li>
            </ul>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">How We Use Information</h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-300 marker:text-zinc-500">
              <li>User authentication</li>
              <li>Personalized coaching delivery</li>
              <li>Platform security and access control</li>
            </ul>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Google User Data</h2>
            <p className="text-base leading-relaxed text-zinc-300">
              Tonehouse Coach complies with Google API Services User Data Policy and Limited Use
              requirements.
            </p>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Data Storage</h2>
            <p className="text-base leading-relaxed text-zinc-300">
              Authentication and usage data are stored securely using managed cloud infrastructure.
            </p>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Cookies &amp; Sessions</h2>
            <p className="text-base leading-relaxed text-zinc-300">
              Secure session cookies are used only for authentication persistence.
            </p>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Third-Party Services</h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-300 marker:text-zinc-500">
              <li>Google OAuth</li>
              <li>Vercel hosting</li>
              <li>Neon Postgres database</li>
            </ul>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Data Security</h2>
            <p className="text-base leading-relaxed text-zinc-300">
              Reasonable safeguards are implemented to protect user data.
            </p>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">User Rights</h2>
            <p className="text-base leading-relaxed text-zinc-300">Users may request account removal.</p>
          </section>

          <section className="max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 space-y-2">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Contact</h2>
            <p className="text-sm leading-relaxed text-zinc-300">Tonehouse Studios</p>
            <p className="text-sm leading-relaxed text-zinc-400">Singapore</p>
            <p className="text-sm leading-relaxed text-zinc-300">
              Email:{" "}
              <a href="mailto:mail@tonehouse.sg" className="underline underline-offset-4 hover:text-zinc-100">
                mail@tonehouse.sg
              </a>
            </p>
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Updates</h2>
            <p className="text-base leading-relaxed text-zinc-300">This policy may be updated periodically.</p>
          </section>
        </div>
      </div>
    </section>
  );
}
