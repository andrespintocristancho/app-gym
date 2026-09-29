"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncCentralEcosystem } from "@/lib/centralEngine";

export async function addProgressPhoto(data: {
  clientId: string;
  photoUrl: string;
  weight?: number;
  tag?: string;
  notes?: string;
}) {
  const photo = await prisma.progressPhoto.create({
    data: {
      clientId: data.clientId,
      photoUrl: data.photoUrl,
      weight: data.weight,
      tag: data.tag || "FRONT",
      notes: data.notes
    }
  });

  // Sincronizar el ecosistema fotográfico y vincular con medidas corporales
  await syncCentralEcosystem(data.clientId);

  return { success: true, photo };
}

export async function getProgressPhotos(clientId: string) {
  return prisma.progressPhoto.findMany({
    where: { clientId },
    orderBy: { date: "asc" }
  });
}
