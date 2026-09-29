import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PhotosScreen, PhotoItem } from "@/components/screens/PhotosScreen";
import { computeEcosystemData } from "@/lib/centralEngine";

export default async function PhotosPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    select: { id: true }
  });

  const clientId = profile?.id || "";
  const ecosystem = clientId ? await computeEcosystemData(clientId) : null;

  const photos: PhotoItem[] = (ecosystem?.photosSummary.photos || []).map(p => ({
    id: p.id,
    date: p.date,
    weight: p.weight,
    url: p.url,
    tag: p.tag,
    notes: p.notes,
    correlationText: p.correlationText
  }));

  const measurementsSummary = ecosystem ? {
    weightDelta: ecosystem.measurementsSummary.initialWeightDelta,
    waistDelta: ecosystem.measurementsSummary.initialWaistDelta,
    armDelta: ecosystem.measurementsSummary.armDelta,
  } : undefined;

  return (
    <PhotosScreen
      clientId={clientId}
      photos={photos}
      measurementsSummary={measurementsSummary}
    />
  );
}
