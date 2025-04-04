import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/noleggi/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: "Noleggio non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error("Errore durante il recupero del noleggio:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero del noleggio" },
      { status: 500 }
    );
  }
}

// PUT /api/noleggi/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    // Verifica che le date siano valide
    if (!startDate) {
      return NextResponse.json(
        { error: "La data di inizio è obbligatoria" },
        { status: 400 }
      );
    }

    // Verifica che la data di fine sia successiva alla data di inizio
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: "La data di fine deve essere successiva alla data di inizio" },
        { status: 400 }
      );
    }

    // Recupera il noleggio esistente
    const existingRental = await prisma.rental.findUnique({
      where: { id: params.id },
    });

    if (!existingRental) {
      return NextResponse.json(
        { error: "Noleggio non trovato" },
        { status: 404 }
      );
    }

    // Se il noleggio è completato o cancellato, non permettere modifiche
    if (existingRental.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Non è possibile modificare un noleggio completato o cancellato" },
        { status: 400 }
      );
    }

    // Aggiorna il noleggio
    const updatedRental = await prisma.rental.update({
      where: { id: params.id },
      data: {
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error("Errore durante l'aggiornamento del noleggio:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del noleggio" },
      { status: 500 }
    );
  }
} 