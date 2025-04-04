import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ImportRow {
  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  indirizzo: string;
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
          console.log("Processando cliente:", row);

          // Crea il cliente
          const result = await prisma.customer.create({
            data: {
              name: `${row.nome.trim()} ${row.cognome.trim()}`,
              email: row.email && row.email.trim() !== "" ? row.email.trim() : null,
              phone: row.telefono && row.telefono.trim() !== "" ? row.telefono.trim() : null,
              address: row.indirizzo && row.indirizzo.trim() !== "" ? row.indirizzo.trim() : null
            }
          });

          console.log("Cliente creato:", result);
          return { success: true, data: result };
        } catch (error) {
          console.error("Errore durante il processamento del cliente:", row, error);
          return { 
            success: false, 
            error: error instanceof Error ? error.message : "Errore sconosciuto",
            cliente: row 
          };
        }
      })
    );

    const errors = results.filter(r => !r.success);
    const successes = results.filter(r => r.success);

    if (errors.length > 0) {
      return NextResponse.json({
        message: `Importazione completata con ${successes.length} successi e ${errors.length} errori`,
        errors,
        successes: successes.map(s => s.data)
      }, { status: 207 }); // 207 Multi-Status
    }

    return NextResponse.json({
      message: "Importazione completata con successo",
      results: successes.map(s => s.data)
    });

  } catch (error) {
    console.error("Errore durante l'importazione:", error);
    return NextResponse.json(
      { 
        error: "Errore durante l'importazione",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 