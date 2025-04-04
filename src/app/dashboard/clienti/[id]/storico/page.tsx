"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

interface Rental {
  id: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  quantity: number;
  equipment: {
    name: string;
    category: string;
  };
}

interface StoricoNoleggioPageProps {
  params: {
    id: string;
  };
}

export default function StoricoNoleggioPage({ params }: StoricoNoleggioPageProps) {
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    fetchCustomerDetails();
    fetchRentals();
  }, [params.id]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/clienti/${params.id}`);
      if (!response.ok) throw new Error("Cliente non trovato");
      const data = await response.json();
      setCustomerName(data.name);
    } catch (error) {
      console.error("Errore:", error);
      setError("Errore nel recupero dei dettagli del cliente");
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await fetch(`/api/clienti/${params.id}/noleggi`);
      if (!response.ok) throw new Error("Errore nel recupero dei noleggi");
      const data = await response.json();
      setRentals(data);
    } catch (error) {
      console.error("Errore:", error);
      setError("Errore nel recupero dello storico noleggi");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: Rental["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Rental["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Attivo";
      case "COMPLETED":
        return "Completato";
      case "CANCELLED":
        return "Cancellato";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Caricamento storico noleggi...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Storico Noleggi - {customerName}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Attrezzatura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Quantità
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Data Inizio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Data Fine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{rental.equipment.name}</div>
                    <div className="text-sm text-gray-500">{rental.equipment.category}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {rental.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {format(new Date(rental.startDate), "dd/MM/yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {rental.endDate ? format(new Date(rental.endDate), "dd/MM/yyyy") : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                      rental.status
                    )}`}
                  >
                    {getStatusText(rental.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/dashboard/noleggi/${rental.id}/modifica`}
                    className="text-blue-700 hover:text-blue-900 font-medium"
                  >
                    Dettagli
                  </Link>
                </td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-900">
                  Nessun noleggio trovato per questo cliente
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 