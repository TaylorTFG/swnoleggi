"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { debounce } from "lodash";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  availableQuantity: number;
}

export default function NuovoNoleggioPage() {
  const router = useRouter();
  
  // Stati per la gestione del form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stati per la ricerca
  const [customerSearch, setCustomerSearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingSearch, setLoadingSearch] = useState({
    customers: false,
    equipment: false
  });

  // Stati per i valori selezionati
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");

  // Carica i dati iniziali
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingSearch({ customers: true, equipment: true });
        await Promise.all([
          fetchCustomers(""),
          fetchEquipment("")
        ]);
      } catch (error) {
        console.error("Errore nel caricamento dei dati iniziali:", error);
        setError("Errore nel caricamento dei dati. Riprova più tardi.");
      } finally {
        setLoadingSearch({ customers: false, equipment: false });
      }
    };
    loadInitialData();
  }, []);

  // Funzioni per la ricerca
  const fetchCustomers = async (search: string) => {
    try {
      const response = await fetch(`/api/clienti/search?q=${encodeURIComponent(search)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Errore durante la ricerca dei clienti");
      }
      
      setCustomers(data);
      setError(null);
    } catch (error) {
      console.error("Errore nella ricerca dei clienti:", error);
      setError("Errore durante la ricerca dei clienti");
      setCustomers([]);
    }
  };

  const fetchEquipment = async (search: string) => {
    try {
      const response = await fetch(`/api/attrezzature/search?q=${encodeURIComponent(search)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Errore durante la ricerca delle attrezzature");
      }
      
      setEquipment(data);
      setError(null);
    } catch (error) {
      console.error("Errore nella ricerca delle attrezzature:", error);
      setError("Errore durante la ricerca delle attrezzature");
      setEquipment([]);
    }
  };

  // Gestione dei cambiamenti nella ricerca
  const debouncedSearchCustomers = debounce((search: string) => {
    setLoadingSearch(prev => ({ ...prev, customers: true }));
    fetchCustomers(search).finally(() => 
      setLoadingSearch(prev => ({ ...prev, customers: false }))
    );
  }, 300);

  const debouncedSearchEquipment = debounce((search: string) => {
    setLoadingSearch(prev => ({ ...prev, equipment: true }));
    fetchEquipment(search).finally(() => 
      setLoadingSearch(prev => ({ ...prev, equipment: false }))
    );
  }, 300);

  useEffect(() => {
    if (customerSearch.length >= 2 || customerSearch === "") {
      debouncedSearchCustomers(customerSearch);
    }
  }, [customerSearch]);

  useEffect(() => {
    if (equipmentSearch.length >= 2 || equipmentSearch === "") {
      debouncedSearchEquipment(equipmentSearch);
    }
  }, [equipmentSearch]);

  // Gestione del submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedEquipment) {
      setError("Seleziona un cliente e un'attrezzatura");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/noleggi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          equipmentId: selectedEquipment.id,
          quantity,
          startDate,
          endDate: endDate || null,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la creazione del noleggio");
      }

      router.push("/dashboard/noleggi");
      router.refresh();
    } catch (error) {
      console.error("Errore nella creazione del noleggio:", error);
      setError("Errore durante la creazione del noleggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Nuovo Noleggio</h1>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-gray-900 mb-1">
            Cliente
          </label>
          <div className="relative">
            <input
              type="text"
              id="customer"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Cerca cliente..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
            {loadingSearch.customers && (
              <div className="absolute z-10 w-full bg-white border rounded-md mt-1 p-2 text-gray-700 shadow-lg">
                Ricerca in corso...
              </div>
            )}
            {!loadingSearch.customers && customers.length > 0 && customerSearch && !selectedCustomer && (
              <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                {customers.map((customer) => (
                  <li
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setCustomerSearch(customer.name);
                    }}
                    className="px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-900"
                  >
                    {customer.name}
                    {customer.phone && ` - ${customer.phone}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="equipment" className="block text-sm font-medium text-gray-900 mb-1">
            Attrezzatura
          </label>
          <div className="relative">
            <input
              type="text"
              id="equipment"
              value={equipmentSearch}
              onChange={(e) => setEquipmentSearch(e.target.value)}
              placeholder="Cerca attrezzatura..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
            {loadingSearch.equipment && (
              <div className="absolute z-10 w-full bg-white border rounded-md mt-1 p-2 text-gray-700 shadow-lg">
                Ricerca in corso...
              </div>
            )}
            {!loadingSearch.equipment && equipment.length > 0 && equipmentSearch && !selectedEquipment && (
              <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                {equipment.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setSelectedEquipment(item);
                      setEquipmentSearch(item.name);
                      setQuantity(1);
                    }}
                    className="px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-900"
                  >
                    {item.name} - {item.category} (Disponibili: {item.availableQuantity})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-900 mb-1">
            Quantità
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            max={selectedEquipment?.availableQuantity || 1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-1">
              Data Inizio
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-1">
              Data Fine (opzionale)
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !selectedCustomer || !selectedEquipment}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {loading ? 'Creazione in corso...' : 'Crea Noleggio'}
        </button>
      </div>
    </div>
  );
} 