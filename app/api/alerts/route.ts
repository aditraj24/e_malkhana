import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Case } from "@/models/Case"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const cases = await Case.find({
    status: "PENDING",
    createdAt: { $lt: threshold }
  }).sort({ createdAt: 1 })

  return NextResponse.json(cases)
}
