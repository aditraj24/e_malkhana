"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { linkPropertyToCase } from "@/app/properties/[propertyId]/actions"


interface LinkPropertyFormProps {
  propertyId: string
  availableCases: Array<{ _id: string; caseNumber: string }>
}

export default function LinkPropertyForm({
  propertyId,
  availableCases,
}: LinkPropertyFormProps) {
  const router = useRouter()
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    const newFieldErrors: Record<string, string> = {};
    if (!selectedCaseId) {
      newFieldErrors.caseId = "Fill this field";
    }
    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) {
      return;
    }

    setIsLoading(true)

    try {
      const result = await linkPropertyToCase({ propertyId, caseId: selectedCaseId })
      if (!result.success) {
        setError(result.error || "Failed to link property to case")
        setIsLoading(false)
        return
      }
      setSuccess("Property linked to case successfully!")
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        Link to Case
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="caseId"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Select a Case
          </label>
          <select
            id="caseId"
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            disabled={isLoading}
            className={`w-full border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 text-black ${fieldErrors.caseId ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'}`}
            required
          >
            <option value="">-- Select Case --</option>
            {availableCases.map((caseObj) => (
              <option key={caseObj._id} value={caseObj._id}>
                {caseObj.caseNumber}
              </option>
            ))}
          </select>
          {fieldErrors.caseId && <p className="text-red-500 text-sm mt-1">{fieldErrors.caseId}</p>}
        </div>

        {error && (
          <div className="bg-[#f8d7da] border-l-4 border-[#dc3545] p-3 rounded-r-lg">
            <p className="text-sm text-[#721c24] font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-[#d4edda] border-l-4 border-[#28a745] p-3 rounded-r-lg">
            <p className="text-sm text-[#155724] font-semibold">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedCaseId}
          className="w-full bg-[#1e3a8a] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1e40af] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Linking...
            </span>
          ) : (
            "Link Property to Case"
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          This will link this independent property to the selected case
        </p>
      </form>
    </div>
  )
}
