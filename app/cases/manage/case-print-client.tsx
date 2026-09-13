"use client"

import { useState } from "react"

export default function CasePrintClient() {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting}
      className="bg-[#1e3a8a] text-white px-6 py-2 font-semibold hover:bg-[#1e40af] transition-colors border-2 border-[#1e3a8a] disabled:opacity-50"
    >
      {isPrinting ? "Preparing..." : "Print Case Report"}
    </button>
  )
}
