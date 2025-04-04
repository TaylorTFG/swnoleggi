import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    console.log("Ricevuta richiesta di ricerca clienti");
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    console.log("Query di ricerca:", query);

    const customers = await prisma.customer.findMany({
      where: query.length >= 2 ? {
        OR: [
          {
            name: {
              contains: query
            }
          },
          {
            email: {
              contains: query
            }
          },
          {
            phone: {
              contains: query
            }
          }
        ]
      } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      },
      orderBy: {
        name: "asc"
      },
      take: 10
    });

    console.log(`Trovati ${customers.length} clienti`);
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Errore durante la ricerca dei clienti:", error);
    return NextResponse.json(
      { error: "Errore durante la ricerca dei clienti" },
      { status: 500 }
    );
  }
} 