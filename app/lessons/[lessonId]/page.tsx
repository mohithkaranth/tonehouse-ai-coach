import { requirePaidPage } from "@/lib/getUserAccessLevel";
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

  await requirePaidPage(`/lessons/${encodeURIComponent(lessonId)}`);
  if (!/^lesson-\d+$/.test(lessonId)) notFound();

  let lesson;
  try {
    lesson = getLesson(lessonId);
  } catch (error) {
    console.error("Failed to load lesson:", lessonId, error);
    notFound();
  }
  const nav = getPrevNextLessonId(lessonId);
  return <LessonClient lesson={lesson} nav={nav} />;
}
