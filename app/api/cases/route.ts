import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Case } from "@/models/Case"
import { Property } from "@/models/Property"
import { User } from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

  const userId = (session.user as any).id
  const userRole = (session.user as any).role
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  const status = searchParams.get("status")
  const crimeNumber = searchParams.get("crimeNumber")?.trim()
  const policeStation = searchParams.get("policeStation")?.trim()
  const seizureDateFrom = searchParams.get("seizureDateFrom")
  const seizureDateTo = searchParams.get("seizureDateTo")
  const actAndLaw = searchParams.get("actAndLaw")?.trim()
  const section = searchParams.get("section")?.trim()

  // For non-admin users, restrict to cases they own or have properties transferred to them
  let allowedCaseIds: string[] | null = null
  if (userRole !== "ADMIN") {
    const ownedCases = await Case.find({
      $or: [{ reportingOfficer: userId }, { reportedOfficer: userId }],
    }).select("_id").lean()
    const transferredProps = await Property.find({ currentOfficer: userId }).select("caseId").lean()
    const caseIdSet = new Set([
      ...ownedCases.map((c: any) => c._id.toString()),
      ...transferredProps
        .filter((p: any) => p.caseId !== null)
        .map((p: any) => p.caseId.toString()),
    ])
    allowedCaseIds = Array.from(caseIdSet)
  }

  const filter: any = {}

  if (allowedCaseIds) {
    filter._id = { $in: allowedCaseIds }
  }

  if (status && status !== "ALL") {
    filter.status = status.toUpperCase()
  }

  if (crimeNumber) {
    filter.crimeNumber = new RegExp(crimeNumber, "i")
  }

  if (policeStation) {
    // If it's a valid ObjectId, search by ObjectId, otherwise search by name
    if (mongoose.Types.ObjectId.isValid(policeStation)) {
      filter.policeStation = new mongoose.Types.ObjectId(policeStation)
    } else {
      // Populate police stations and filter by name
      const { PoliceStation } = await import("@/models/PoliceStation")
      const stations = await PoliceStation.find({
        name: new RegExp(policeStation, "i"),
      }).select("_id").lean()
      filter.policeStation = { $in: stations.map((s: any) => s._id) }
    }
  }

  if (seizureDateFrom || seizureDateTo) {
    filter.seizureDate = {}
    if (seizureDateFrom) filter.seizureDate.$gte = new Date(seizureDateFrom)
    if (seizureDateTo) filter.seizureDate.$lte = new Date(seizureDateTo)
  }

  if (actAndLaw) {
    filter.actAndLaw = { $elemMatch: { $regex: actAndLaw, $options: 'i' } }
  }

  if (section) {
    filter.section = { $elemMatch: { $regex: section, $options: 'i' } }
  }

  if (q) {
    const regex = new RegExp(q, "i")
    // For text search, we'll need to do a more complex query
    // For now, keep the basic search and handle police station search separately
    filter.$or = [
      { crimeNumber: regex },
      { caseNumber: regex },
      { investigatingOfficerName: regex },
      { investigatingOfficerId: regex },
      { actAndLaw: { $elemMatch: { $regex: regex } } },
      { section: { $elemMatch: { $regex: regex } } },
    ]

    const yearNum = Number(q)
    if (!isNaN(yearNum)) {
      filter.$or.push({ crimeYear: yearNum })
    }
  }

  const cases = await Case.find(filter)
    .populate("policeStation", "name sarkariId district")
    .populate("reportingOfficer", "fullName officerId")
    .populate("reportedOfficer", "fullName officerId")
    .sort({ createdAt: -1 })
    .limit(100)

  return NextResponse.json(cases)
  } catch (error: any) {
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const body = await req.json()

  const {
    crimeNumber,
    crimeYear,
    policeStation,
    stationAddress,
    investigatingOfficerName,
    investigatingOfficerId,
    firDate,
    seizureDate,
    actAndLaw,
    section,
  } = body

  if (
    !crimeNumber ||
    !crimeYear ||
    !policeStation ||
    !investigatingOfficerName ||
    !investigatingOfficerId ||
    !firDate ||
    !seizureDate ||
    !actAndLaw ||
    !section
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  // Validate investigatingOfficerId exists in DB
  const officerExists = await User.findOne({ officerId: investigatingOfficerId.toUpperCase() })
  if (!officerExists) {
    return NextResponse.json(
      { error: `Officer ID "${investigatingOfficerId}" not found in the system` },
      { status: 400 }
    )
  }

  const newCase = await Case.create({
    crimeNumber,
    crimeYear,
    policeStation,
    stationAddress,
    investigatingOfficerName,
    investigatingOfficerId,
    firDate: new Date(firDate),
    seizureDate: new Date(seizureDate),
    actAndLaw,
    section,
    reportingOfficer: (session.user as any).id,
  })

  return NextResponse.json({ caseId: newCase._id }, { status: 201 })
}
