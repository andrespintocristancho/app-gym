import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NutritionScreen } from "@/components/screens/NutritionScreen";
import { getTodayNutrition } from "@/actions/nutritionActions";
import { computeEcosystemData } from "@/lib/centralEngine";

export default async function NutritionPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    select: { id: true }
  });

  const clientId = profile?.id || "";
  let nutritionData = undefined;
  let ecosystem = null;

  if (clientId) {
    const [todayLog, ecoData] = await Promise.all([
      getTodayNutrition(clientId),
      computeEcosystemData(clientId)
    ]);

    ecosystem = ecoData;
    nutritionData = {
      calories: todayLog.calories,
      targetCalories: todayLog.targetCalories,
      protein: todayLog.protein,
      targetProtein: todayLog.targetProtein,
      carbs: todayLog.carbs,
      targetCarbs: todayLog.targetCarbs,
      fats: todayLog.fats,
      targetFats: todayLog.targetFats,
      mealsJson: todayLog.mealsJson
    };
  }

  return (
    <NutritionScreen
      clientId={clientId}
      nutrition={nutritionData}
      compliance={ecosystem?.nutritionSummary}
    />
  );
}
