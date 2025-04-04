import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Attrezzatura non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Errore durante il recupero dell'attrezzatura:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dell'attrezzatura" },
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
    if (!data.name || !data.category || !data.quantity) {
      return NextResponse.json(
        { error: "Nome, categoria e quantità sono obbligatori" },
        { status: 400 }
      );
    }

    // Verifica se l'attrezzatura è noleggiata
    const currentEquipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: {
        rentals: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!currentEquipment) {
      return NextResponse.json(
        { error: "Attrezzatura non trovata" },
        { status: 404 }
      );
    }

    // Se l'attrezzatura è noleggiata, non permettere il cambio di stato
    if (currentEquipment.rentals.length > 0 && data.status !== currentEquipment.status) {
      return NextResponse.json(
        { error: "Non è possibile modificare lo stato di un'attrezzatura noleggiata" },
        { status: 400 }
      );
    }

    // Se ci sono noleggi attivi, verifica che la nuova quantità sia sufficiente
    if (currentEquipment.rentals.length > 0) {
      const totalRented = currentEquipment.rentals.reduce((acc, rental) => acc + rental.quantity, 0);
      if (data.quantity < totalRented) {
        return NextResponse.json(
          { error: `Non è possibile ridurre la quantità sotto ${totalRented} poiché ci sono ${totalRented} unità attualmente noleggiate` },
          { status: 400 }
        );
      }
    }

    const equipment = await prisma.equipment.update({
      where: { id: params.id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        status: data.status,
        quantity: data.quantity
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'attrezzatura:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento dell'attrezzatura" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica se l'attrezzatura è noleggiata
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: {
        rentals: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Attrezzatura non trovata" },
        { status: 404 }
      );
    }

    if (equipment.rentals.length > 0) {
      return NextResponse.json(
        { error: "Impossibile eliminare un'attrezzatura noleggiata" },
        { status: 400 }
      );
    }

    await prisma.equipment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'attrezzatura:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione dell'attrezzatura" },
      { status: 500 }
    );
  }
} 