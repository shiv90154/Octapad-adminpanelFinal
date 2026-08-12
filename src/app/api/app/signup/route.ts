import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Signup from "@/models/Signup";

// Called once by the Android app on first launch so the developer gets the
// user's name + phone number automatically ("name aur number mere paas aaye").
// Not admin-gated — this is the app calling in, not an admin.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }
  // Defense-in-depth: the app already blocks activation on an empty phone
  // client-side (ActivationScreen.kt), reject it here too.
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }

  await connectToDatabase();
  await Signup.findOneAndUpdate(
    { deviceId },
    { $set: { name, phone }, $setOnInsert: { installedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
