import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Valida i dati
    if (!data.name) {
      return NextResponse.json(
        { error: "Il nome è obbligatorio" },
        { status: 400 }
      );
    }

    // Crea il cliente
    const client = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Errore durante la creazione del cliente:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del cliente" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const clients = await prisma.customer.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Errore durante il recupero dei clienti:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dei clienti" },
      { status: 500 }
    );
  }
} 