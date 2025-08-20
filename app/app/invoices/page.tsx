import { getInvoices } from "@/actions/payment.action";
import ListInvoices from "@/components/invoice/ListInvoices";
import { requireSubscription } from "@/sub-guard";

export default async function InvoicesPage() {
  await requireSubscription();
  const { invoices } = await getInvoices();
  return <ListInvoices invoices={invoices} />;
}
