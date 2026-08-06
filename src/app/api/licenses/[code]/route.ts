import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import License from "@/models/License";
import { requireAdmin } from "@/lib/requireAdmin";

type Params = { params: Promise<{ code: string }> };

// PATCH — toggle active / midiPurchased, edit note, or unbind the device
// (so the same code can be redeemed on a new phone).
export async function PATCH(req: NextRequest, { params }: Params) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { code } = await params;
  const body = await req.json().catch(() => ({}));

  const update: Record<string, unknown> = {};
  if (typeof body.active === "boolean") update.active = body.active;
  if (typeof body.midiPurchased === "boolean") update.midiPurchased = body.midiPurchased;
  if (typeof body.note === "string") update.note = body.note;
  if (body.unbindDevice === true) {
    update.deviceId = null;
    update.redeemedAt = null;
  }

  await connectToDatabase();
  const doc = await License.findOneAndUpdate({ code }, update, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ license: doc });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { code } = await params;
  await connectToDatabase();
  const doc = await License.findOneAndDelete({ code });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
