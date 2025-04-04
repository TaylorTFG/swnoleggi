import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

interface RentalData {
  customerId: string;
  equipmentId: string;
  quantity: number;
  startDate: string;
  endDate?: string | null;
}

interface RentalWithQuantity {
  quantity: number;
}

export async function GET() {
  try {
    const rentals = await prisma.rental.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        equipment: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Errore durante il recupero dei noleggi:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dei noleggi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Ricevuta richiesta di creazione noleggio");
    
    // Parsing del body
    const body = await request.json();
    console.log("Dati ricevuti:", body);
    
    const { customerId, equipmentId, quantity, startDate, endDate } = body as RentalData;

    // Validazione input
    if (!customerId || !equipmentId || !quantity || !startDate) {
      console.log("Validazione fallita:", { customerId, equipmentId, quantity, startDate });
      return NextResponse.json(
        { error: "Dati mancanti o non validi" },
        { status: 400 }
      );
    }

    // Verifica che il cliente esista
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      console.log("Cliente non trovato:", customerId);
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }

    // Verifica che l'attrezzatura esista e sia disponibile
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        rentals: {
          where: {
            status: "ACTIVE",
          }
        }
      }
    });

    if (!equipment) {
      console.log("Attrezzatura non trovata:", equipmentId);
      return NextResponse.json(
        { error: "Attrezzatura non trovata" },
        { status: 404 }
      );
    }

    // Calcola quantità attualmente noleggiata
    const rentedQuantity = equipment.rentals.reduce(
      (sum: number, rental: RentalWithQuantity) => sum + rental.quantity,
      0
    );

    // Verifica disponibilità
    const availableQuantity = equipment.quantity - rentedQuantity;
    if (quantity > availableQuantity) {
      console.log("Quantità non disponibile:", { richiesta: quantity, disponibile: availableQuantity });
      return NextResponse.json(
        { error: `Quantità richiesta non disponibile. Disponibili: ${availableQuantity}` },
        { status: 400 }
      );
    }

    // Crea il noleggio
    const rental = await prisma.rental.create({
      data: {
        customerId,
        equipmentId,
        quantity,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: "ACTIVE"
      }
    });

    console.log("Noleggio creato con successo:", rental);
    return NextResponse.json(rental);
  } catch (error) {
    console.error("Errore dettagliato durante la creazione del noleggio:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore durante la creazione del noleggio" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.id || !data.status) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    // Aggiorna il noleggio e lo stato dell'attrezzatura
    const rental = await prisma.$transaction(async (tx: PrismaClient) => {
      const rental = await tx.rental.update({
        where: { id: data.id },
        data: { status: data.status },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          equipment: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      });

      // Se il noleggio è completato o annullato, rendi l'attrezzatura disponibile
      if (data.status === "COMPLETED" || data.status === "CANCELLED") {
        await tx.equipment.update({
          where: { id: rental.equipmentId },
          data: { status: "AVAILABLE" },
        });
      }

      return rental;
    });

    return NextResponse.json(rental);
  } catch (error) {
    console.error("Errore durante l'aggiornamento del noleggio:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del noleggio" },
      { status: 500 }
    );
  }
} 