import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ImportRow {
  categoria: string;
  nome: string;
  quantita: number;
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as ImportRow[];

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Dati non validi" },
        { status: 400 }
      );
    }

    console.log("Dati ricevuti:", data);

    // Processa ogni riga del file Excel
    const results = await Promise.all(
      data.map(async (row) => {
        try {
          console.log("Processando riga:", row);

          // Crea l'attrezzatura
          const result = await prisma.equipment.create({
            data: {
              name: row.nome,
              category: row.categoria,
              status: "AVAILABLE",
              description: "",
              quantity: row.quantita
            }
          });

          console.log("Attrezzatura creata:", result);
          return result;
        } catch (error) {
          console.error("Errore durante il processamento della riga:", row, error);
          throw error;
        }
      })
    );

    return NextResponse.json({
      message: "Importazione completata con successo",
      results
    });

  } catch (error) {
    console.error("Errore durante l'importazione:", error);
    // Aggiungiamo più dettagli all'errore nella risposta
    return NextResponse.json(
      { 
        error: "Errore durante l'importazione",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 