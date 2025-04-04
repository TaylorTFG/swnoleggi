"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";

interface Rental {
  id: string;
  customer: {
    name: string;
    email: string | null;
  };
  equipment: {
    name: string;
    category: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
}

export default function NoleggiPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await fetch("/api/noleggi");
      if (!response.ok) {
        throw new Error("Errore durante il recupero dei noleggi");
      }
      const data = await response.json();
      setRentals(data);
    } catch (error) {
      setError("Si è verificato un errore durante il caricamento dei noleggi");
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Attivo";
      case "COMPLETED":
        return "Completato";
      case "CANCELLED":
        return "Annullato";
      case "OVERDUE":
        return "Scaduto";
      default:
        return status;
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/noleggi`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'aggiornamento del noleggio');
      }

      // Ricarica i noleggi dopo l'aggiornamento
      fetchRentals();
    } catch (error) {
      console.error('Errore:', error);
      setError('Si è verificato un errore durante l\'aggiornamento del noleggio');
    }
  };

  const filteredRentals = rentals.filter(
    (rental) =>
      rental.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.equipment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-700">Caricamento noleggi...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestione Noleggi</h1>
        <Link
          href="/dashboard/noleggi/nuovo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuovo Noleggio
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-white p-2 rounded-lg shadow">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Cerca noleggi..."
          className="flex-1 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Attrezzatura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Data Inizio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Data Fine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{rental.customer.name}</div>
                  <div className="text-sm text-gray-600">{rental.customer.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{rental.equipment.name}</div>
                  <div className="text-sm text-gray-600">{rental.equipment.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(rental.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(rental.endDate).toLocaleDateString()}
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
                    className="text-blue-700 hover:text-blue-900 font-medium mr-4"
                  >
                    Modifica
                  </Link>
                  {rental.status === "ACTIVE" && (
                    <button
                      onClick={() => handleUpdateStatus(rental.id, "COMPLETED")}
                      className="text-green-700 hover:text-green-900 font-medium mr-4"
                    >
                      Completa
                    </button>
                  )}
                  {rental.status !== "CANCELLED" && rental.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleUpdateStatus(rental.id, "CANCELLED")}
                      className="text-red-700 hover:text-red-900 font-medium"
                    >
                      Annulla
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredRentals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  Nessun noleggio trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 