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

  license.lastCheckInAt = new Date();
  await license.save();

  return NextResponse.json({
    ok: true,
    active: license.active,
    midiPurchased: license.midiPurchased,
  });
}
