import { requirePaidPage } from "@/lib/getUserAccessLevel";
import CoachPageClient from "./CoachPageClient";

export default async function CoachPage() {
  await requirePaidPage("/coach");
  return <CoachPageClient />;
}
