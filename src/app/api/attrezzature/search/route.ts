import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  rentals: Array<{ quantity: number }>;
}

interface EquipmentResponse {
  id: string;
  name: string;
  category: string;
  availableQuantity: number;
}

export async function GET(request: Request) {
  try {
    console.log("Ricevuta richiesta di ricerca attrezzature");
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    console.log("Query di ricerca:", query);

    // Semplifica la query per il debug
    const equipment = await prisma.equipment.findMany({
      where: query.length >= 2 ? {
        name: {
          contains: query
        }
      } : undefined,
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        rentals: {
          where: {
            status: "ACTIVE",
            startDate: {
              lte: new Date()
            }
          },
          select: {
            quantity: true
          }
        }
      },
      orderBy: {
        name: "asc"
      },
      take: 10
    });

    console.log(`Trovate ${equipment.length} attrezzature`);

    // Calcola le quantità disponibili
    const equipmentWithAvailability = equipment.map((item: Equipment) => {
      const rentedQuantity = item.rentals.reduce((sum: number, rental: { quantity: number }) => sum + rental.quantity, 0);
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        availableQuantity: Math.max(0, item.quantity - rentedQuantity)
      };
    });

    return NextResponse.json(equipmentWithAvailability);
  } catch (error) {
    console.error("Errore durante la ricerca delle attrezzature:", error);
    if (error instanceof Error) {
      console.error("Dettagli errore:", error.message);
    }
    return NextResponse.json(
      { error: "Errore durante la ricerca delle attrezzature" },
      { status: 500 }
    );
  }
} 