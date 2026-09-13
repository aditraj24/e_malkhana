"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PoliceStationForm from "@/components/PoliceStationForm";

interface PoliceStation {
  _id: string;
  name: string;
  sarkariId: string;
  district: string;
  address: string;
  phone?: string;
  status: string;
}

export default function EditPoliceStationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [policeStation, setPoliceStation] = useState<PoliceStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    fetchPoliceStation();
  }, [session, status, router, params.id]);

  const fetchPoliceStation = async () => {
    try {
      const response = await fetch(`/api/police-stations/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch police station");
      }

      setPoliceStation(data.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
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

  if (!policeStation) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600 text-lg">Police station not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-6">
          Edit Police Station
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <PoliceStationForm
            initialData={policeStation}
            onSuccess={() => router.push("/police-stations")}
          />
        </div>
      </div>
    </div>
  );
}