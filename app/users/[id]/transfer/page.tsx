"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PoliceStationSelect from "@/components/PoliceStationSelect";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  officerId: string;
  policeStation: {
    _id: string;
    name: string;
    sarkariId: string;
    district: string;
  };
  status: string;
}

export default function TransferOfficerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [newPoliceStation, setNewPoliceStation] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchUser();
  }, [session, status, router, params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user");
      }

      setUser(data.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!newPoliceStation) {
      alert("Please select a police station");
      return;
    }

    if (newPoliceStation === user?.policeStation?._id) {
      alert("Please select a different police station");
      return;
    }

    setTransferLoading(true);
    try {
      const response = await fetch(`/api/users/${params.id}/transfer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ policeStationId: newPoliceStation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transfer officer");
      }

      alert("Officer transferred successfully!");
      router.push("/users");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setTransferLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600 text-lg">User not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-6">
          Transfer Officer
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Officer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <p className="text-gray-900">{user.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Officer ID
                </label>
                <p className="text-gray-900">{user.officerId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Police Station
                </label>
                <p className="text-gray-900">
                  {user.policeStation ? (
                    <span>
                      {user.policeStation.name} - {user.policeStation.district} ({user.policeStation.sarkariId})
                    </span>
                  ) : (
                    <span className="text-red-500">Not assigned</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Transfer to New Police Station</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newPoliceStation"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Select New Police Station *
                </label>
                <PoliceStationSelect
                  value={newPoliceStation}
                  onChange={setNewPoliceStation}
                  placeholder="Select destination police station"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  disabled={transferLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  className="px-6 py-2 bg-[#1e3a8a] text-white rounded hover:bg-[#152a63] disabled:opacity-50"
                  disabled={transferLoading || !newPoliceStation}
                >
                  {transferLoading ? "Transferring..." : "Transfer Officer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}