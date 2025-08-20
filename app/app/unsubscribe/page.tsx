import Unsubscribe from "@/components/payment/Unsubscribe";
import { requireSubscription } from "@/sub-guard";

export default async function UnsubscribePage() {
  await requireSubscription();
  return <Unsubscribe />;
}
