"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string | null;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RETIRED";
  quantity: number;
}

interface EquipmentFormProps {
  id: string;
}

const statuses = [
  { value: "AVAILABLE", label: "Disponibile" },
  { value: "MAINTENANCE", label: "In Manutenzione" },
  { value: "RETIRED", label: "Ritirato" },
];

export default function EquipmentForm({ id }: EquipmentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/attrezzature/categorie");
      if (!response.ok) throw new Error("Errore nel caricamento delle categorie");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Errore nel caricamento delle categorie:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/attrezzature/${id}`);
      if (!response.ok) throw new Error("Errore nel recupero dell'attrezzatura");
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error("Errore:", error);
      setError("Errore nel recupero dell'attrezzatura");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/attrezzature/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Errore durante l'aggiornamento dell'attrezzatura");
      }

      router.push("/dashboard/attrezzature");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Si è verificato un errore");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-700">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifica Attrezzatura</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              Nome *
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-900">
              Categoria *
            </label>
            <select
              id="category"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Seleziona una categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-900">
              Quantità *
            </label>
            <input
              type="number"
              id="quantity"
              required
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900">
              Descrizione
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-900">
              Stato *
            </label>
            <select
              id="status"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Equipment["status"] })}
              disabled={formData.status === "RENTED"}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {formData.status === "RENTED" && (
              <p className="mt-1 text-sm text-gray-500">
                Non è possibile modificare lo stato di un'attrezzatura attualmente noleggiata
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-700 text-sm bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Salvataggio..." : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 