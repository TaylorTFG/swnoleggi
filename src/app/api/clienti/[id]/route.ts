import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Errore durante il recupero del cliente:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero del cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    // Valida i dati
    if (!data.name) {
      return NextResponse.json(
        { error: "Il nome è obbligatorio" },
        { status: 400 }
      );
    }

    const client = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Errore durante l'aggiornamento del cliente:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica se il cliente ha noleggi attivi
    const clientWithRentals = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        rentals: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!clientWithRentals) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }

    if (clientWithRentals.rentals.length > 0) {
      return NextResponse.json(
        { error: "Impossibile eliminare un cliente con noleggi attivi" },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore durante l'eliminazione del cliente:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione del cliente" },
      { status: 500 }
    );
  }
} 