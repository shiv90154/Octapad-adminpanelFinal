import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import License from "@/models/License";

// Periodic re-check the app calls (e.g. on launch, or every few hours in the
// background) so a remote deactivation from the admin panel actually takes
// effect on the device without requiring the user to re-enter anything.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase() ?? "";
  const deviceId = req.nextUrl.searchParams.get("deviceId")?.trim() ?? "";

  if (!code || !deviceId) {
    return NextResponse.json({ error: "code and deviceId required" }, { status: 400 });
  }

  await connectToDatabase();
  const license = await License.findOne({ code });

  if (!license || license.deviceId !== deviceId) {
    return NextResponse.json({ ok: false, reason: "NOT_BOUND" }, { status: 404 });
  }

  // Atomic update instead of findOne + mutate + save — two concurrent status
  // pings for the same device (e.g. app-launch check racing the periodic
  // background check) previously raced on lastCheckInAt via a lost update
  // (both reads happen before either write, so whichever save() runs last
  // wins and the other's timestamp is silently dropped). Same pattern
  // already used correctly in /api/app/redeem.
  await License.updateOne({ code }, { $set: { lastCheckInAt: new Date() } });

  return NextResponse.json({
    ok: true,
    active: license.active,
    midiPurchased: license.midiPurchased,
  });
}
