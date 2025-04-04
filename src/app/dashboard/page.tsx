"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Users, 
  Package, 
  Calendar,
  AlertTriangle 
} from "lucide-react";

interface DashboardStats {
  totalClients: number;
  totalEquipment: number;
  activeRentals: number;
  overdueRentals: number;
}

interface RecentRental {
  id: string;
  customer: {
    name: string;
  };
  equipment: {
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
}

interface TopEquipment {
  id: string;
  name: string;
  category: string;
  rentalCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalEquipment: 0,
    activeRentals: 0,
    overdueRentals: 0
  });
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([]);
  const [topEquipment, setTopEquipment] = useState<TopEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchRecentRentals(),
      fetchTopEquipment()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Errore nel recupero delle statistiche');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const fetchRecentRentals = async () => {
    try {
      const response = await fetch('/api/dashboard/recent-rentals');
      if (!response.ok) throw new Error('Errore nel recupero dei noleggi recenti');
      const data = await response.json();
      setRecentRentals(data);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const fetchTopEquipment = async () => {
    try {
      const response = await fetch('/api/dashboard/top-equipment');
      if (!response.ok) throw new Error('Errore nel recupero delle attrezzature più noleggiate');
      const data = await response.json();
      setTopEquipment(data);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-gray-700">Caricamento...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const statsCards = [
    {
      name: "Clienti Totali",
      value: stats.totalClients.toString(),
      icon: Users,
      color: "text-blue-600",
      link: "/dashboard/clienti",
    },
    {
      name: "Attrezzature",
      value: stats.totalEquipment.toString(),
      icon: Package,
      color: "text-green-600",
      link: "/dashboard/attrezzature",
    },
    {
      name: "Noleggi Attivi",
      value: stats.activeRentals.toString(),
      icon: Calendar,
      color: "text-purple-600",
      link: "/dashboard/noleggi",
    },
    {
      name: "Noleggi in Ritardo",
      value: stats.overdueRentals.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      link: "/dashboard/noleggi?filter=overdue",
    },
  ];

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Benvenuto nel sistema di gestione noleggi attrezzature mediche
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
            <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a
                  href={stat.link}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Visualizza tutto
                  <span className="sr-only"> {stat.name}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Noleggi Recenti
          </h2>
          {recentRentals.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                      Attrezzatura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                      Stato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentRentals.map((rental) => (
                    <tr key={rental.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rental.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rental.equipment.name}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Nessun noleggio recente da mostrare
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Attrezzature più Noleggiate
          </h2>
          {topEquipment.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                      Attrezzatura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">
                      Noleggi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topEquipment.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.rentalCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Nessuna statistica disponibile
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 