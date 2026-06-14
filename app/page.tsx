import { getCurrentUser } from "@/lib/session";
import { MarketingHome } from "@/components/MarketingHome";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <MarketingHome isLoggedIn={Boolean(user)} />;
}
