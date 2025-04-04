import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching customer rentals:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dei noleggi del cliente" },
      { status: 500 }
    );
  }
} 