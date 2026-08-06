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
  const license = await License.findOne({ code });

  if (!license) {
    return NextResponse.json({ ok: false, reason: "INVALID_CODE" }, { status: 404 });
  }
  if (!license.active) {
    return NextResponse.json({ ok: false, reason: "DEACTIVATED" }, { status: 403 });
  }
  if (license.deviceId && license.deviceId !== deviceId) {
    return NextResponse.json({ ok: false, reason: "ALREADY_USED" }, { status: 409 });
  }

  if (!license.deviceId) {
    license.deviceId = deviceId;
    license.redeemedAt = new Date();
  }
  license.lastCheckInAt = new Date();
  await license.save();

  return NextResponse.json({
    ok: true,
    active: license.active,
    midiPurchased: license.midiPurchased,
  });
}
