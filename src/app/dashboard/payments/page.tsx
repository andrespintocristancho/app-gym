import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentsHubClient } from "./PaymentsHubClient";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") redirect("/dashboard");

  const [payments, clients] = await Promise.all([
    prisma.payment.findMany({
      include: { client: { include: { user: true } } },
      orderBy: { dueDate: "desc" }
    }),
    prisma.clientProfile.findMany({
      include: { user: true },
      where: { status: { not: "INACTIVE" } },
      orderBy: { user: { name: "asc" } }
    })
  ]);

  return (
    <PaymentsHubClient
      payments={payments as any}
      clients={clients as any}
    />
  );
}