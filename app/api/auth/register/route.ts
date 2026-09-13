import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { fullName, email, username, password, role, officerId, policeStation } = await req.json()

    if (!fullName || !email || !username || !password || !officerId || !policeStation) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const existedUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }, {officerId: new RegExp(`^${officerId}$`, 'i')}],
    })

    if (existedUser) {
      return NextResponse.json(
        { error: "Username, email, or officer ID already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role || "OFFICER",
      officerId: officerId.toLowerCase(),
      policeStation,
      status: "ACTIVE",
    })

    const createdUser = await User.findById(user._id).select("-password")

    return NextResponse.json(
      { message: "User created successfully", user: createdUser },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
