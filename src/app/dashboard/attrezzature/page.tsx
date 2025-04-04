"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Upload, ChevronUp, ChevronDown, Filter } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string | null;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RETIRED";
  quantity: number;
  availableQuantity: number;
  totalQuantity: number;
  futureRentals: {
    startDate: string;
    endDate: string | null;
    quantity: number;
  }[];
}

type SortField = "name" | "category" | "quantity";
type SortOrder = "asc" | "desc";

export default function AttrezzaturePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/attrezzature/categorie");
      if (!response.ok) throw new Error("Errore durante il recupero delle categorie");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Errore nel caricamento delle categorie:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch("/api/attrezzature");
      if (!response.ok) {
        throw new Error("Errore durante il recupero delle attrezzature");
      }
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      setError("Si è verificato un errore durante il caricamento delle attrezzature");
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa attrezzatura?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/attrezzature/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Errore durante l'eliminazione dell'attrezzatura");
      }

      setEquipment(equipment.filter(item => item.id !== id));
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert(error instanceof Error ? error.message : "Si è verificato un errore durante l'eliminazione");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadgeColor = (status: Equipment["status"], availableQuantity: number) => {
    if (availableQuantity === 0) return "bg-red-100 text-red-800";
    if (availableQuantity < 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (status: Equipment["status"], availableQuantity: number, totalQuantity: number) => {
    return `${availableQuantity}/${totalQuantity} disponibili`;
  };

  const getFutureAvailabilityText = (futureRentals: Equipment["futureRentals"]) => {
    if (futureRentals.length === 0) return null;
    
    const nextRental = futureRentals[0];
    return `${nextRental.quantity} prenotati dal ${new Date(nextRental.startDate).toLocaleDateString()}`;
  };

  const filteredAndSortedEquipment = equipment
    .filter(
      (item) =>
        (selectedCategory === "" || item.category === selectedCategory) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (item.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const modifier = sortOrder === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name) * modifier;
        case "category":
          return a.category.localeCompare(b.category) * modifier;
        case "quantity":
          return (a.totalQuantity - b.totalQuantity) * modifier;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Caricamento attrezzature...</div>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Attrezzature</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/attrezzature/importa"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 font-medium"
          >
            <Upload size={20} />
            Importa da Excel
          </Link>
          <Link
            href="/dashboard/attrezzature/nuovo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium"
          >
            <Plus size={20} />
            Nuova Attrezzatura
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow flex-1">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="Cerca attrezzature..."
              className="flex-1 outline-none text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
            <Filter size={20} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="outline-none text-gray-900 pr-8"
            >
              <option value="">Tutte le categorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Nome
                  {getSortIcon("name")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  Categoria
                  {getSortIcon("category")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Descrizione
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("quantity")}
              >
                <div className="flex items-center gap-1">
                  Quantità
                  {getSortIcon("quantity")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Disponibilità
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEquipment.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {item.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {item.totalQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                        item.status,
                        item.availableQuantity
                      )}`}
                    >
                      {getStatusText(item.status, item.availableQuantity, item.totalQuantity)}
                    </span>
                    {getFutureAvailabilityText(item.futureRentals) && (
                      <span className="text-xs text-gray-500">
                        {getFutureAvailabilityText(item.futureRentals)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/dashboard/attrezzature/${item.id}/modifica`}
                    className="text-blue-700 hover:text-blue-900 font-medium mr-4"
                  >
                    Modifica
                  </Link>
                  {item.status !== "RENTED" && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteLoading === item.id}
                      className="text-red-700 hover:text-red-900 font-medium disabled:opacity-50"
                    >
                      {deleteLoading === item.id ? "Eliminazione..." : "Elimina"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredAndSortedEquipment.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-900">
                  Nessuna attrezzatura trovata
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 