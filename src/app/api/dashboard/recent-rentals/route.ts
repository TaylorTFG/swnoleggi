import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rentals = await prisma.rental.findMany({
      take: 5, // Limita a 5 noleggi
      orderBy: {
        createdAt: 'desc', // Ordina per data di creazione decrescente
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        equipment: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Errore durante il recupero dei noleggi recenti:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dei noleggi recenti" },
      { status: 500 }
    );
  }
} 