"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { ArrowLeft } from "lucide-react";

interface ExcelRow {
  categoria: string;
  nome: string;
  quantita: number;
}

export default function ImportaAttrezzaturePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converte il foglio Excel in un array di oggetti
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Verifica e formatta i dati
        const formattedData = jsonData.map((row: any, index) => {
          const keys = Object.keys(row);
          if (keys.length !== 3) {
            throw new Error(`Riga ${index + 1}: Il formato non è corretto. Sono richieste esattamente 3 colonne.`);
          }

          const categoria = row[keys[0]];
          const nome = row[keys[1]];
          const quantita = parseInt(row[keys[2]]);

          if (!categoria || !nome || isNaN(quantita)) {
            throw new Error(`Riga ${index + 1}: Dati mancanti o non validi.`);
          }

          return {
            categoria: categoria.trim(),
            nome: nome.trim(),
            quantita: quantita
          };
        });

        setPreview(formattedData);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Errore durante la lettura del file");
        setPreview([]);
      }
    };

    reader.onerror = () => {
      setError("Errore durante la lettura del file");
      setPreview([]);
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/attrezzature/importa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preview),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Errore durante l'importazione");
      }

      router.push("/dashboard/attrezzature");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Errore durante l'importazione");
    } finally {
      setLoading(false);
    }
  };

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
          Importa Attrezzature da Excel
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Carica un file Excel con le seguenti colonne:
          </p>
          <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
            <li>Categoria</li>
            <li>Nome Attrezzatura/Ausilio</li>
            <li>Quantità</li>
          </ul>
        </div>

        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <span className="text-gray-600">
              {fileName || "Clicca o trascina qui il tuo file Excel"}
            </span>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {error && (
          <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Anteprima ({preview.length} attrezzature)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantità
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.quantita}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={loading || preview.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Importazione in corso..." : "Importa Attrezzature"}
          </button>
        </div>
      </div>
    </div>
  );
} 