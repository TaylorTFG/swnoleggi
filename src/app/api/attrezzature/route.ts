import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dati di esempio per l'inizializzazione
const sampleEquipment = [
  {
    name: "Sedia a Rotelle Standard",
    category: "Mobilità",
    description: "Sedia a rotelle pieghevole con braccioli e poggiapiedi rimovibili",
    status: "AVAILABLE",
  },
  {
    name: "Letto Ospedaliero Elettrico",
    category: "Letti",
    description: "Letto regolabile elettricamente con sponde e materasso antidecubito",
    status: "AVAILABLE",
  },
  {
    name: "Deambulatore con Ruote",
    category: "Mobilità",
    description: "Deambulatore in alluminio con 4 ruote e freni",
    status: "AVAILABLE",
  },
  {
    name: "Sollevatore Paziente",
    category: "Movimentazione",
    description: "Sollevatore elettrico con imbragatura per trasferimento pazienti",
    status: "AVAILABLE",
  },
  {
    name: "Concentratore di Ossigeno",
    category: "Terapia Respiratoria",
    description: "Concentratore di ossigeno portatile con batteria ricaricabile",
    status: "AVAILABLE",
  },
  {
    name: "Materasso Antidecubito",
    category: "Prevenzione",
    description: "Materasso a bolle d'aria con compressore silenzioso",
    status: "AVAILABLE",
  },
  {
    name: "Stampelle Regolabili",
    category: "Mobilità",
    description: "Coppia di stampelle in alluminio con altezza regolabile",
    status: "AVAILABLE",
  },
  {
    name: "Comoda con Ruote",
    category: "Igiene",
    description: "Sedia comoda con ruote e freni, braccioli ribaltabili",
    status: "AVAILABLE",
  },
  {
    name: "Montascale Mobile",
    category: "Mobilità",
    description: "Montascale a cingoli per superare le barriere architettoniche",
    status: "AVAILABLE",
  },
  {
    name: "Lettino da Visita",
    category: "Arredo Medico",
    description: "Lettino da visita regolabile con portarotolo",
    status: "AVAILABLE",
  }
];

// Funzione per inizializzare il database con i dati di esempio
async function initializeDatabase() {
  const count = await prisma.equipment.count();
  if (count === 0) {
    for (const item of sampleEquipment) {
      await prisma.equipment.create({
        data: item,
      });
    }
  }
}

export async function GET() {
  try {
    // Recupera tutte le attrezzature
    const equipment = await prisma.equipment.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Recupera tutti i noleggi attivi
    const activeRentals = await prisma.rental.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
    });

    // Calcola la disponibilità effettiva per ogni attrezzatura
    const equipmentWithAvailability = await Promise.all(
      equipment.map(async (item) => {
        // Trova tutti i noleggi attivi per questa attrezzatura
        const rentals = activeRentals.filter(
          (rental) => rental.equipmentId === item.id
        );

        // Calcola il totale noleggiato
        const rentedQuantity = rentals.reduce(
          (total, rental) => total + rental.quantity,
          0
        );

        // Calcola la disponibilità effettiva
        const availableQuantity = item.quantity - rentedQuantity;

        // Aggiungi le informazioni sui noleggi futuri
        const futureRentals = await prisma.rental.findMany({
          where: {
            equipmentId: item.id,
            status: "ACTIVE",
            startDate: {
              gt: new Date(),
            },
          },
          orderBy: {
            startDate: "asc",
          },
          select: {
            startDate: true,
            endDate: true,
            quantity: true,
          },
        });

        return {
          ...item,
          availableQuantity,
          totalQuantity: item.quantity,
          futureRentals: futureRentals.map((rental) => ({
            startDate: rental.startDate,
            endDate: rental.endDate,
            quantity: rental.quantity,
          })),
        };
      })
    );

    return NextResponse.json(equipmentWithAvailability);
  } catch (error) {
    console.error("Errore durante il recupero delle attrezzature:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero delle attrezzature" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Valida i dati
    if (!data.name || !data.category) {
      return NextResponse.json(
        { error: "Nome e categoria sono obbligatori" },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        quantity: data.quantity || 1,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Errore durante la creazione dell'attrezzatura:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione dell'attrezzatura" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "ID mancante" },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.update({
      where: { id: data.id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        status: data.status,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID mancante" },
        { status: 400 }
      );
    }

    // Verifica che l'attrezzatura non sia noleggiata
    const equipment = await prisma.equipment.findUnique({
      where: { id },
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
      where: { id },
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