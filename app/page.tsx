import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasFullAccess } from "@/lib/hasFullAccess";

type CardDef = {
  title: string;
  description: string;
  href: string;
  requiresAuth?: boolean;
  imageSrc?: string;
  imageAlt?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Card({
  title,
  description,
  href,
  disabled,
  imageSrc,
  imageAlt,
  highlighted = false,
}: {
  title: string;
  description: string;
  href: string;
  disabled: boolean;
  imageSrc?: string;
  imageAlt?: string;
  highlighted?: boolean;
}) {
  const baseClass = cn(
    "rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg shadow-black/40 ring-1 ring-white/5 transition-all duration-200",
    highlighted
      ? "border-zinc-600"
      : ""
  );

  const enabledClass = "hover:scale-[1.02] hover:border-zinc-600";
  const disabledClass =
    "cursor-not-allowed select-none opacity-60";

  return (
    <Link href={href} prefetch={false} className="block">
      <div className={cn(baseClass, disabled ? disabledClass : enabledClass, "flex h-full flex-col")}>
        {imageSrc && (
          <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl border border-zinc-800">
            <Image
              src={imageSrc}
              alt={imageAlt ?? ""}
              fill
              sizes="(min-width: 768px) 320px, 100vw"
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/20 to-transparent" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2>

          {highlighted && (
            <span className="rounded-full border border-zinc-700 bg-zinc-800/70 px-3 py-1 text-xs text-zinc-200">
              Featured
            </span>
          )}

          {disabled && (
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
              🔒 Locked
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-zinc-300 flex-grow">{description}</p>

        {disabled && (
          <p className="mt-4 text-xs text-zinc-500">
            Subscribe to unlock this feature.
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const hasAccess = await hasFullAccess({
    email: session?.user?.email ?? undefined,
  });

  const cards: CardDef[] = [
    {
      title: "Start Music from Zero",
  description: "No theory. No jargon. Just the basics that matter.",
  href: "/start",
  requiresAuth: false,
  imageSrc: "/home/starter.jpg",
  imageAlt: "Start music from zero",
    },
    {
      title: "🎵 Practice Coach",
      description:
        "Generate lesson plans, warmups, grooves and progress tracking.",
      href: "/coach",
      requiresAuth: true,
      imageSrc: "/home/coach.jpg",
    },
    {
      title: "🎸 Guitar Lessons",
      description: "Structured beginner guitar lessons with guided practice.",
      href: "/lessons/guitar",
      requiresAuth: true,
      imageSrc: "/home/guitar-lessons.jpg",
    },
    {
      title: "🎶 Backing Track Finder",
      description: "Find YouTube backing tracks by key, style and tempo.",
      href: "/backing-tracks",
      imageSrc: "/home/backing-tracks.jpg",
    },
    {
      title: "🎧 Ear Training",
      description: "Intervals, chords, and progressions.",
      href: "/ear-training",
      requiresAuth: true,
      imageSrc: "/home/ear-training.jpg",
    },
    {
      title: "🎹 Chord & Scale Finder",
      description: "Explore chords and scales.",
      href: "/finder",
      imageSrc: "/home/finder.jpg",
    },
    {
      title: "🎼 Chord Progressions",
      description: "Generate progressions by key and style.",
      href: "/progressions",
      imageSrc: "/home/progressions.jpg",
    },
  ];

  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/home/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-950" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
       <div>
  <h1 className="text-4xl font-semibold tracking-tight">
    Tonehouse Studio Apps
  </h1>
  <p className="mt-3 text-zinc-400">
    Practice and learning tools for modern musicians.
  </p>
</div>

        <div className="mt-8 mb-8 h-px bg-zinc-800" />

   {!hasAccess && (
  <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
    🎸 Subscribe to unlock all features.
  </div>
)}

        <div className="grid gap-6 md:grid-cols-3 auto-rows-fr">
          {cards.map((c) => {
            const destination =
              c.requiresAuth && !hasAccess ? "/billing" : c.href;

            return (
              <Card
                key={c.href}
                title={c.title}
                description={c.description}
                href={destination}
                disabled={Boolean(c.requiresAuth) && !hasAccess}
                imageSrc={c.imageSrc}
                highlighted={c.href === "/coach"}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
