import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800/60 px-6 py-6 text-center text-xs text-zinc-500">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4">
          <Link href="/about" className="underline underline-offset-4 hover:text-zinc-300">
            About
          </Link>
          <a
            href="mailto:mail@tonehouse.sg"
            className="underline underline-offset-4 hover:text-zinc-300"
          >
            Contact
          </a>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-zinc-300">
            Privacy Policy
          </Link>
        </div>

        © {new Date().getFullYear()} Tonehouse Studios.
        <br />
        Discover our studios and experiences at{" "}
        <a
          href="https://www.tonehouse.sg"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-zinc-300"
        >
          www.tonehouse.sg
        </a>
      </div>
    </footer>
  );
}
