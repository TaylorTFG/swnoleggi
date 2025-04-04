import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file caricato" },
        { status: 400 }
      );
    }

    // Leggi il file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Valida e importa i dati
    const clients = [];
    for (const row of data) {
      const client = {
        name: row["nome"],
        email: row["email"],
        phone: row["telefono"]?.toString(),
        address: row["indirizzo"],
      };

      // Verifica campi obbligatori
      if (!client.name) {
        continue;
      }

      // Aggiungi il cliente al database
      try {
        const newClient = await prisma.customer.create({
          data: client,
        });
        clients.push(newClient);
      } catch (error) {
        console.error("Errore durante l'importazione del cliente:", error);
        // Continua con il prossimo cliente
      }
    }

    return NextResponse.json({
      message: `Importati ${clients.length} clienti con successo`,
      clients,
    });
  } catch (error) {
    console.error("Errore durante l'importazione:", error);
    return NextResponse.json(
      { error: "Errore durante l'importazione" },
      { status: 500 }
    );
  }
} 