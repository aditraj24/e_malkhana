"use client";

import { useState, useEffect } from "react";

interface PoliceStation {
  _id: string;
  name: string;
  sarkariId: string;
  district: string;
}

interface PoliceStationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
}

export default function PoliceStationSelect({
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
  placeholder = "Select police station",
  error
}: PoliceStationSelectProps) {
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoliceStations();
  }, []);

  const fetchPoliceStations = async () => {
    try {
      const response = await fetch("/api/police-stations");
      const data = await response.json();

      if (response.ok) {
        setPoliceStations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch police stations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        required={required}
        className={`w-full border-2 px-4 py-2 focus:outline-none text-black ${
          error ? 'border-red-500' : 'border-gray-300 focus:border-[#1e3a8a]'
        } ${className}`}
      >
        <option value="">
          {loading ? "Loading police stations..." : placeholder}
        </option>
        {policeStations.map((station) => (
          <option key={station._id} value={station._id}>
            {station.name} - {station.district} ({station.sarkariId})
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}