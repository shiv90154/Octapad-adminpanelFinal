import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Signup from "@/models/Signup";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  await connectToDatabase();
  const signups = await Signup.find().sort({ installedAt: -1 }).lean();
  return NextResponse.json({ signups });
}
