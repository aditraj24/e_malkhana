import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/db"
import { Case } from "@/models/Case"
import { Property } from "@/models/Property"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get("caseId")

    if (!caseId) {
      return NextResponse.json({ error: "Case ID required" }, { status: 400 })
    }

    const caseData = await Case.findById(caseId)
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const properties = await Property.find({ caseId })

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Case Report - ${caseData.crimeNumber}/${caseData.crimeYear}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; margin-bottom: 20px; border-radius: 4px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .section-title { background-color: #1e3a8a; color: white; padding: 10px 15px; margin-bottom: 15px; font-size: 16px; font-weight: bold; border-radius: 4px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
        .detail-item { border-left: 4px solid #1e3a8a; padding-left: 15px; }
        .detail-label { font-weight: bold; color: #1e3a8a; font-size: 12px; margin-bottom: 5px; }
        .detail-value { color: #333; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th { background-color: #1e3a8a; color: white; padding: 10px; text-align: left; font-weight: bold; }
        table td { border: 1px solid #ddd; padding: 10px; font-size: 13px; }
        table tr:nth-child(even) { background-color: #f9f9f9; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.pending { background-color: #ffc107; color: #856404; }
        .status.disposed { background-color: #28a745; color: white; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Case Report</h1>
        <p>Crime ${caseData.crimeNumber}/${caseData.crimeYear}</p>
      </div>

      <div class="section">
        <div class="section-title">Case Information</div>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-label">Crime Number</div><div class="detail-value">${caseData.crimeNumber}</div></div>
          <div class="detail-item"><div class="detail-label">Crime Year</div><div class="detail-value">${caseData.crimeYear}</div></div>
          <div class="detail-item"><div class="detail-label">Police Station</div><div class="detail-value">${caseData.policeStation}</div></div>
          <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value"><span class="status ${caseData.status === "PENDING" ? "pending" : "disposed"}">${caseData.status}</span></div></div>
          <div class="detail-item"><div class="detail-label">Investigating Officer</div><div class="detail-value">${caseData.investigatingOfficerName}</div></div>
          <div class="detail-item"><div class="detail-label">Officer ID</div><div class="detail-value">${caseData.investigatingOfficerId}</div></div>
          <div class="detail-item"><div class="detail-label">FIR Date</div><div class="detail-value">${caseData.firDate ? new Date(caseData.firDate).toLocaleDateString("en-IN") : "N/A"}</div></div>
          <div class="detail-item"><div class="detail-label">Seizure Date</div><div class="detail-value">${caseData.seizureDate ? new Date(caseData.seizureDate).toLocaleDateString("en-IN") : "N/A"}</div></div>
          <div class="detail-item"><div class="detail-label">Act & Law</div><div class="detail-value">${caseData.actAndLaw || "N/A"}</div></div>
          <div class="detail-item"><div class="detail-label">Section</div><div class="detail-value">${caseData.section || "N/A"}</div></div>
        </div>
      </div>

      ${
        properties.length > 0
          ? `
      <div class="section">
        <div class="section-title">Seized Properties (${properties.length})</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Nature</th>
              <th>Location</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${properties
              .map(
                (p: any) => `
            <tr>
              <td>${p.category}</td>
              <td>${p.natureOfProperty}</td>
              <td>${p.storageLocation}</td>
              <td>${p.quantity} ${p.units}</td>
              <td><span class="status ${p.status === "SEIZED" ? "pending" : "disposed"}">${p.status}</span></td>
            </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      `
          : ""
      }

      <div class="footer">
        <p>Generated on: ${new Date().toLocaleString("en-IN")}</p>
        <p>© 2025 Government of India. All rights reserved.</p>
        <p>e-Malkhana - Digital Evidence Management System</p>
      </div>
    </body>
    </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="Case_${caseData.crimeNumber}_${caseData.crimeYear}.html"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to generate case report" }, { status: 500 })
  }
}
