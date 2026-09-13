import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { connectDB } from "@/lib/db"
import { User } from "@/models/User"

export async function POST() {
  try {
    await connectDB()

    const existingAdmin = await User.findOne({ role: "ADMIN" })
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 409 })
    }

    const username = process.env.BOOTSTRAP_ADMIN_USERNAME as string
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL as string
    const fullName = process.env.BOOTSTRAP_ADMIN_NAME as string
    const passwordRaw = process.env.BOOTSTRAP_ADMIN_PASSWORD as string
    const officerId = process.env.BOOTSTRAP_ADMIN_OFFICER_ID as string
    const policeStation = process.env.BOOTSTRAP_ADMIN_STATION as string

    if (!username || !email || !fullName || !passwordRaw || !officerId || !policeStation) {
      return NextResponse.json({ error: "Bootstrap env not configured" }, { status: 500 })
    }

    const password = await bcrypt.hash(passwordRaw, 10)

    const admin = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      fullName,
      password,
      role: "ADMIN",
      officerId,
      policeStation,
      status: "ACTIVE",
    })

    return NextResponse.json(
      { message: "Admin created", adminId: admin._id },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
