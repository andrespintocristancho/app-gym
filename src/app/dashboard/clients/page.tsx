import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientsDirectoryClient } from "./ClientsDirectoryClient";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  const isTrainer = session?.user?.role === "TRAINER";

  const clients = await prisma.clientProfile.findMany({
    include: {
      user: true,
    },
    orderBy: {
      inscriptionDate: "desc",
    }
  });

  return (
    <ClientsDirectoryClient
      clients={clients as any}
      isTrainer={isTrainer}
    />
  );
}
