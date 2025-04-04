"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
}

interface Rental {
  id: string;
  customerId: string;
  equipmentId: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  customer: Customer;
  equipment: Equipment;
}

interface RentalFormProps {
  id: string;
}

export default function RentalForm({ id }: RentalFormProps) {
  const router = useRouter();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRental();
  }, [id]);

  const fetchRental = async () => {
    try {
      const response = await fetch(`/api/noleggi/${id}`);
      if (!response.ok) {
        throw new Error("Errore durante il recupero del noleggio");
      }
      const data = await response.json();
      setRental(data);
      setStartDate(format(new Date(data.startDate), "yyyy-MM-dd"));
      setEndDate(data.endDate ? format(new Date(data.endDate), "yyyy-MM-dd") : "");
    } catch (error) {
      setError("Si è verificato un errore durante il caricamento del noleggio");
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/noleggi/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate: endDate || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Errore durante l'aggiornamento del noleggio");
      }

      router.push("/dashboard/noleggi");
      router.refresh();
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert(error instanceof Error ? error.message : "Si è verificato un errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Caricamento noleggio...</div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          {error || "Noleggio non trovato"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Modifica Noleggio
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Dettagli Cliente</h2>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
            {rental.customer.name}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Attrezzatura</h2>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
            {rental.equipment.name}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data Inizio
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data Fine
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Salvataggio..." : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 