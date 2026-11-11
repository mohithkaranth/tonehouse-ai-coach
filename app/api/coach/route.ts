import { handleCoachRequest } from "@/lib/coach-api";

export const runtime = "nodejs";
export const maxDuration = 50;

export async function POST(request: Request) {
  return handleCoachRequest(request);
}
