export type VideoRec = { title: string; url: string };

export function fallbackVideos(instrument: string): VideoRec[] {
  const x = (instrument || "").toLowerCase();

  if (x.includes("drum")) {
    return [
      {
        title: "Single Stroke Roll – Rudiment Lesson",
        url: "https://www.youtube.com/watch?v=KjpGoOq-0gc",
      },
      {
        title: "Practice Pad Warmup – Hands & Timing",
        url: "https://www.youtube.com/watch?v=nxM7i_GPars",
      },
    ];
  }

  if (x.includes("guitar")) {
    return [
      {
        title: "One Minute Changes – Faster Chord Switching",
        url: "https://www.youtube.com/watch?v=Ck73R_GjowE",
      },
      {
        title: "Strumming & Rhythm Control",
        url: "https://www.youtube.com/watch?v=9iVDuMN1BJA",
      },
    ];
  }

  if (x.includes("bass")) {
    return [
      {
        title: "Beginning The Major Scale (Bass Lesson)",
        url: "https://www.youtube.com/watch?v=2bvgAbWRdIA",
      },
      {
        title: "How To Practice Scales Like A Pro (Bass)",
        url: "https://www.youtube.com/watch?v=J7NxTxpklHY",
      },
    ];
  }

  if (x.includes("keyboard") || x.includes("keys") || x.includes("piano")) {
    return [
      {
        title: "Beginner Piano Practice Routine (Search)",
        url: "https://www.youtube.com/results?search_query=beginner+piano+practice+routine",
      },
      {
        title: "Piano Hand Independence Beginner (Search)",
        url: "https://www.youtube.com/results?search_query=piano+hand+independence+beginner",
      },
    ];
  }

  if (x.includes("vocal") || x.includes("sing")) {
    return [
      {
        title: "Vocal Warmups for Beginners (Search)",
        url: "https://www.youtube.com/results?search_query=vocal+warmups+for+beginners",
      },
      {
        title: "Breath Support Basics for Singing (Search)",
        url: "https://www.youtube.com/results?search_query=breath+support+basics+singing",
      },
    ];
  }

  return [
    {
      title: "How to practice music effectively (Search)",
      url: "https://www.youtube.com/results?search_query=how+to+practice+music+effectively",
    },
  ];
}
