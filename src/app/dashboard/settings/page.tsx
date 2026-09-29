import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SettingsScreen } from "@/components/screens/SettingsScreen";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user ? {
    name: session.user.name || "Atleta",
    email: session.user.email || ""
  } : undefined;

  return <SettingsScreen user={user} />;
}
