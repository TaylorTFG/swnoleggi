import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Equipment {
  id: string;
  name: string;
  category: string;
  _count: {
    rentals: number;
  };
}

export async function GET() {
  try {
    const topEquipment = await prisma.equipment.findMany({
      take: 5, // Limita a 5 attrezzature
      include: {
        _count: {
          select: {
            rentals: true,
          },
        },
      },
      orderBy: {
        rentals: {
          _count: 'desc', // Ordina per numero di noleggi decrescente
        },
      },
    });

    // Trasforma i risultati nel formato desiderato
    const formattedTopEquipment = topEquipment.map((item: Equipment) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      rentalCount: item._count.rentals,
    }));

    return NextResponse.json(formattedTopEquipment);
  } catch (error) {
    console.error("Errore durante il recupero delle attrezzature più noleggiate:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero delle attrezzature più noleggiate" },
      { status: 500 }
    );
  }
} 