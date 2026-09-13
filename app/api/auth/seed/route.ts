import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST() {
  await connectDB();

  const existing = await User.findOne({ role: "ADMIN" });
  if (existing) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
  }

  const password = await bcrypt.hash("admin123", 10);

  await User.create({
    username: "admin",
    email: "admin@malkhana.gov.in",
    fullName: "System Administrator",
    password,
    role: "ADMIN",
    officerId: "ADMIN001",
    policeStation: "HEADQUARTERS",
  });

  return NextResponse.json({ success: true });
}
