import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Recupera il numero totale di clienti
    const totalClients = await prisma.customer.count();

    // Recupera il numero totale di attrezzature
    const totalEquipment = await prisma.equipment.count();

    // Recupera il numero di noleggi attivi
    const activeRentals = await prisma.rental.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Recupera il numero di noleggi in ritardo
    const overdueRentals = await prisma.rental.count({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      totalClients,
      totalEquipment,
      activeRentals,
      overdueRentals,
    });
  } catch (error) {
    console.error("Errore durante il recupero delle statistiche:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero delle statistiche" },
      { status: 500 }
    );
  }
} 