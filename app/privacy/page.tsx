import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Tonehouse Coach",
  description: "Privacy policy for Tonehouse Coach operated by Tonehouse Studios, Singapore.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
        <Link href="/" className="text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-100">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy – Tonehouse Coach</h1>

        <div className="mt-6 space-y-6 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Introduction</h2>
            <p className="mt-2">
              Tonehouse Coach is a music coaching platform operated by Tonehouse Studios,
              Singapore.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Information We Collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-zinc-500">
              <li>Google authentication information</li>
              <li>Name and email provided via Google Sign-In</li>
              <li>Application usage related to coaching features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">How We Use Information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-zinc-500">
              <li>User authentication</li>
              <li>Personalized coaching delivery</li>
              <li>Platform security and access control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Google User Data</h2>
            <p className="mt-2">
              Tonehouse Coach complies with Google API Services User Data Policy and Limited Use
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Data Storage</h2>
            <p className="mt-2">
              Authentication and usage data are stored securely using managed cloud infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Cookies &amp; Sessions</h2>
            <p className="mt-2">Secure session cookies are used only for authentication persistence.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Third-Party Services</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-zinc-500">
              <li>Google OAuth</li>
              <li>Vercel hosting</li>
              <li>Neon Postgres database</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Data Security</h2>
            <p className="mt-2">Reasonable safeguards are implemented to protect user data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">User Rights</h2>
            <p className="mt-2">Users may request account removal.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Contact</h2>
            <p className="mt-2">Tonehouse Studios</p>
            <p>Singapore</p>
            <p>
              Email:{" "}
              <a href="mailto:mail@tonehouse.sg" className="underline underline-offset-4 hover:text-zinc-100">
                mail@tonehouse.sg
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Updates</h2>
            <p className="mt-2">This policy may be updated periodically.</p>
          </section>
        </div>
      </div>
    </section>
  );
}
