import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ottiene tutte le categorie uniche dalle attrezzature
    const attrezzature = await prisma.equipment.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    // Estrae le categorie e le ordina alfabeticamente
    const categories = attrezzature
      .map(item => item.category)
      .filter(Boolean)
      .sort();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Errore nel recupero delle categorie:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle categorie" },
      { status: 500 }
    );
  }
} 