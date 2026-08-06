import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import License from "@/models/License";
import { requireAdmin } from "@/lib/requireAdmin";
import { generateActivationCode } from "@/lib/generateCode";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  await connectToDatabase();
  const licenses = await License.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ licenses });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 100);
  const note = typeof body.note === "string" ? body.note : "";

  await connectToDatabase();

  const created = [];
  for (let i = 0; i < count; i++) {
    // Retry on the (very rare) chance of a code collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const doc = await License.create({ code: generateActivationCode(), note });
        created.push(doc);
        break;
      } catch (err: unknown) {
        const isDup = (err as { code?: number })?.code === 11000;
        if (!isDup) throw err;
      }
    }
  }

  return NextResponse.json({ created });
}
