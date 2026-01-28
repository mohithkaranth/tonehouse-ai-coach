import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const lessonsDir = path.join(process.cwd(), "data", "lessons");

    if (!fs.existsSync(lessonsDir)) {
      return NextResponse.json({
        ok: false,
        error: "data/lessons folder not found",
        lookedIn: lessonsDir,
      });
    }

    const files = fs.readdirSync(lessonsDir);
    return NextResponse.json({
      ok: true,
      lessonsDir,
      files,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
