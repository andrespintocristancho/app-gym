import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AttendanceDashboardClient } from "./AttendanceDashboardClient";

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "TRAINER") {
    redirect("/dashboard");
  }

  const [attendances, clients] = await Promise.all([
    prisma.attendance.findMany({
      include: {
        client: {
          include: { user: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 100
    }),
    prisma.clientProfile.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } }
    })
  ]);

  return (
    <AttendanceDashboardClient
      attendances={attendances as any}
      clients={clients as any}
    />
  );
}
