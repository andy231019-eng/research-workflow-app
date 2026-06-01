import { NextResponse } from "next/server";

// This route is deprecated. Use /api/generate-report instead.
export async function POST() {
  return NextResponse.json(
    { error: "Deprecated. Use /api/generate-report instead." },
    { status: 410 }
  );
}
