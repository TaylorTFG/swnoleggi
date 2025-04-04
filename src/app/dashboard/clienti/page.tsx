"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export default function ClientiPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clienti");
      if (!response.ok) {
        throw new Error("Errore durante il recupero dei clienti");
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      setError("Si è verificato un errore durante il caricamento dei clienti");
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo cliente?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/clienti/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Errore durante l'eliminazione del cliente");
      }

      // Aggiorna la lista dei clienti
      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert("Si è verificato un errore durante l'eliminazione del cliente");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-700">Caricamento clienti...</div>
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
        <h1 className="text-2xl font-bold text-gray-800">Gestione Clienti</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/clienti/importa"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Upload size={20} />
            Importa da Excel
          </Link>
          <Link
            href="/dashboard/clienti/nuovo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuovo Cliente
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-white p-2 rounded-lg shadow">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Cerca clienti..."
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
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Telefono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Indirizzo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {client.email || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {client.phone || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {client.address || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/dashboard/clienti/${client.id}/storico`}
                    className="text-blue-700 hover:text-blue-900 font-medium mr-4"
                  >
                    Storico Noleggi
                  </Link>
                  <Link
                    href={`/dashboard/clienti/${client.id}/modifica`}
                    className="text-blue-700 hover:text-blue-900 font-medium mr-4"
                  >
                    Modifica
                  </Link>
                  <button
                    onClick={() => handleDelete(client.id)}
                    disabled={deleteLoading === client.id}
                    className="text-red-700 hover:text-red-900 font-medium disabled:opacity-50"
                  >
                    {deleteLoading === client.id ? "Eliminazione..." : "Elimina"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  Nessun cliente trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 