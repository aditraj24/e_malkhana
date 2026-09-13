import Link from "next/link"
import { connectDB } from "@/lib/db"
import { Property } from "@/models/Property"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await connectDB()

  const userId = (session.user as any).id
  const userRole = (session.user as any).role

  let filter: any = {}
  if (userRole !== "ADMIN") {
    filter.currentOfficer = userId
  }

  const properties = await Property.find(filter)
    .populate("caseId", "caseNumber")
    .sort({ createdAt: -1 })
    .lean()

  const independentProperties = properties.filter(p => !p.caseId)


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-[#1e3a8a] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/dashboard" className="hover:text-[#1e3a8a] transition-colors">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-[#1e3a8a] font-semibold">Properties</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-2">
              Registered Properties
            </h2>
            <p className="text-gray-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Manage all registered evidence and properties
            </p>
          </div>

          {(session.user as any)?.role !== "ADMIN" && (
            <Link
              href="/properties/new"
              className="mt-4 md:mt-0 bg-[#1e3a8a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition shadow-md text-center"
            >
              + Register New Property
            </Link>
          )}
        </div>

        {/* Independent Properties */}
        {independentProperties.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#1e3a8a] p-4 rounded-r-lg mb-4">
              <h3 className="font-bold text-[#1e3a8a] text-lg flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Independent Properties
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Properties registered without linking to a case
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {independentProperties.map((property: any) => (
                <Link
                  key={property._id}
                  href={`/properties/${property._id}`}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-[#1e3a8a] hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-[#1e3a8a]">{property.propertyTag}</h4>
                    <span className="bg-blue-100 text-[#1e3a8a] px-2 py-1 rounded text-xs font-semibold">
                      {property.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{property.natureOfProperty}</p>
                  <p className="text-xs text-gray-500">
                    <strong>Category:</strong> {property.category}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Quantity:</strong> {property.quantity} {property.units}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}



        {properties.length === 0 && (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              No properties registered yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by registering your first property or linking one to a case
            </p>
            {(session.user as any)?.role !== "ADMIN" && (
              <Link
                href="/properties/new"
                className="inline-block bg-[#1e3a8a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition"
              >
                Register Property Now
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
