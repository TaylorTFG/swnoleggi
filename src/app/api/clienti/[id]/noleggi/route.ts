import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rentals = await prisma.rental.findMany({
      where: {
        customerId: params.id,
      },
      include: {
        equipment: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
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