"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface PoliceStation {
  _id: string;
  name: string;
  sarkariId: string;
  district: string;
  address: string;
  phone?: string;
  status: string;
  createdAt: string;
}

export default function PoliceStationsPage() {
  const { data: session } = useSession();
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPoliceStations();
  }, []);

  const fetchPoliceStations = async () => {
    try {
      const response = await fetch("/api/police-stations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch police stations");
      }

      setPoliceStations(data.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this police station?")) {
      return;
    }

    try {
      const response = await fetch(`/api/police-stations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete police station");
      }

      setPoliceStations(policeStations.filter(station => station._id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a8a]">Police Stations</h1>
        {session?.user?.role === "ADMIN" && (
          <Link
            href="/police-stations/new"
            className="bg-[#1e3a8a] text-white px-4 py-2 rounded hover:bg-[#152a63]"
          >
            Add Police Station
          </Link>
        )}
      </div>

      {policeStations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No police stations found.</p>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/police-stations/new"
              className="text-[#1e3a8a] hover:underline mt-2 inline-block"
            >
              Create the first police station
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policeStations.map((station) => (
            <div
              key={station._id}
              className="bg-white rounded-lg shadow-md p-6 border border-black-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-[#1e3a8a]">
                  {station.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    station.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {station.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Sarkari ID:</strong> {station.sarkariId}</p>
                <p><strong>District:</strong> {station.district}</p>
                <p><strong>Address:</strong> {station.address}</p>
                {station.phone && <p><strong>Phone:</strong> {station.phone}</p>}
              </div>

              {session?.user?.role === "ADMIN" && (
                <div className="flex space-x-2 mt-4">
                  <Link
                    href={`/police-stations/${station._id}/edit`}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(station._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}