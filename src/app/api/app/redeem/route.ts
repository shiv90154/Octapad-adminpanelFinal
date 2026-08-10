import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import License from "@/models/License";

// Called by the Android app when the user enters an activation code.
// One device only: the first device to redeem a code binds it permanently
// (until an admin unbinds it from the dashboard), so the same code can't be
// reused on a second phone.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";

  if (!code || !deviceId) {
    return NextResponse.json({ error: "code and deviceId required" }, { status: 400 });
  }

  await connectToDatabase();

  // Atomic claim: only one concurrent request can win the "first redeemer"
  // slot for an unbound code — Mongo matches+updates a single document
  // atomically, so two devices redeeming the same unbound code at once
  // can't both pass a separate read-then-write check and clobber each other.
  const now = new Date();
  let license = await License.findOneAndUpdate(
    { code, active: true, deviceId: null },
    { $set: { deviceId, redeemedAt: now, lastCheckInAt: now } },
    { new: true }
  );

  if (!license) {
    // Not a first-time claim — either already bound to this same device
    // (re-redeem, fine) or the code doesn't exist / is inactive / is
    // bound to someone else (all handled by the read-only check below).
    license = await License.findOneAndUpdate(
      { code, active: true, deviceId },
      { $set: { lastCheckInAt: now } },
      { new: true }
    );
  }

  if (!license) {
    const existing = await License.findOne({ code });
    if (!existing) {
      return NextResponse.json({ ok: false, reason: "INVALID_CODE" }, { status: 404 });
    }
    if (!existing.active) {
      return NextResponse.json({ ok: false, reason: "DEACTIVATED" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, reason: "ALREADY_USED" }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    active: license.active,
    midiPurchased: license.midiPurchased,
  });
}
