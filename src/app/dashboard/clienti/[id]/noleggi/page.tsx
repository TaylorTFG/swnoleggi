"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Equipment {
  id: string;
  name: string;
}

interface Rental {
  id: string;
  equipment: Equipment;
  startDate: string;
  endDate: string | null;
  quantity: number;
  status: string;
}

export default function CustomerRentalsPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerAndRentals();
  }, [customerId]);

  const fetchCustomerAndRentals = async () => {
    try {
      // Fetch customer details
      const customerResponse = await fetch(`/api/clienti/${customerId}`);
      if (!customerResponse.ok) {
        throw new Error("Errore durante il recupero dei dati del cliente");
      }
      const customerData = await customerResponse.json();
      setCustomer(customerData);

      // Fetch customer rentals
      const rentalsResponse = await fetch(`/api/clienti/${customerId}/noleggi`);
      if (!rentalsResponse.ok) {
        throw new Error("Errore durante il recupero dei noleggi");
      }
      const rentalsData = await rentalsResponse.json();
      setRentals(rentalsData);
    } catch (error) {
      console.error("Errore:", error);
      setError("Si è verificato un errore durante il caricamento dei dati");
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
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "In Corso";
      case "COMPLETED":
        return "Completato";
      case "OVERDUE":
        return "Scaduto";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Caricamento dati...</div>
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
      <div className="mb-6">
        <Link
          href="/dashboard/clienti"
          className="text-blue-600 hover:text-blue-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla lista clienti
        </Link>
      </div>

      {customer && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Storico Noleggi - {customer.name}
          </h1>
          <div className="text-sm text-gray-600">
            <p>Email: {customer.email}</p>
            <p>Telefono: {customer.phone}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Quantità
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
            {rentals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  Nessun noleggio trovato per questo cliente
                </td>
              </tr>
            ) : (
              rentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rental.equipment.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {format(new Date(rental.startDate), "d MMMM yyyy", { locale: it })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {rental.endDate
                        ? format(new Date(rental.endDate), "d MMMM yyyy", { locale: it })
                        : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{rental.quantity}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/noleggi/${rental.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Dettagli
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 