import { notFound } from "next/navigation";
import LessonClient from "./LessonClient";
import { getLesson, getPrevNextLessonId } from "@/lib/lessons";

// Force Node.js runtime (fs is not available on Edge)
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;

  // Helpful server-side log (shows in terminal)
  console.log("Lesson route hit:", lessonId);

  try {
    const lesson = getLesson(lessonId);
    const nav = getPrevNextLessonId(lessonId);
    return <LessonClient lesson={lesson} nav={nav} />;
  } catch (err: any) {
    // Log the real error (so we don't hide it behind 404)
    console.error("Failed to load lesson:", lessonId, err?.message || err);
    notFound();
  }
}
