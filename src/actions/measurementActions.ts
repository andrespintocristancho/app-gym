"use server";
import { prisma } from "@/lib/prisma";
import { computeDerivedFields } from "@/lib/bodyAnalysis";
import { syncCentralEcosystem } from "@/lib/centralEngine";

export async function createMeasurement(clientId: string, data: Record<string, string | number>) {
  const floatFields = [
    "weight", "height", "neck", "shoulders", "chest", "rightArm", "leftArm",
    "rightForearm", "leftForearm", "waist", "abdomen", "hip", "rightThigh", "leftThigh", "rightCalf", "leftCalf"
  ];
  
  const clean: Record<string, number | null | string | undefined> = {};
  for (const key of floatFields) {
    const val = data[key];
    clean[key] = val !== "" && val !== undefined ? parseFloat(String(val)) : null;
  }
  if (data.age) clean.age = parseInt(String(data.age));
  if (data.sex) clean.sex = String(data.sex);
  if (data.notes) clean.notes = String(data.notes);

  // Heredar altura, sexo y edad de mediciones previas o perfil si no se ingresaron en esta toma
  const [lastMeasurement, clientProfile] = await Promise.all([
    prisma.measurement.findFirst({
      where: { clientId },
      orderBy: { date: "desc" }
    }),
    prisma.clientProfile.findUnique({
      where: { id: clientId }
    })
  ]);

  if (!clean.height && lastMeasurement?.height) clean.height = lastMeasurement.height;
  if (!clean.sex) clean.sex = lastMeasurement?.sex || (clientProfile?.gender === "FEMALE" ? "FEMALE" : "MALE");
  if (!clean.age) clean.age = lastMeasurement?.age || clientProfile?.age || 25;
  if (!clean.neck && lastMeasurement?.neck) clean.neck = lastMeasurement.neck;

  const derived = computeDerivedFields(clean as any);

  const measurement = await prisma.measurement.create({
    data: {
      clientId,
      ...clean,
      ...derived,
    } as any,
  });

  // Disparar sincronización automática total del ecosistema
  await syncCentralEcosystem(clientId);

  return { success: true, measurement };
}

export async function getMeasurementsForClient(clientId: string) {
  return prisma.measurement.findMany({
    where: { clientId },
    orderBy: { date: "desc" },
  });
}

export async function getComparisonData(clientId: string, daysAgo: number) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const [current, past] = await Promise.all([
    prisma.measurement.findFirst({ where: { clientId }, orderBy: { date: "desc" } }),
    prisma.measurement.findFirst({ where: { clientId, date: { lte: pastDate } }, orderBy: { date: "desc" } }),
  ]);

  return { current, past };
}
