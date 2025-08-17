import { getInvoices } from "@/actions/payment.action";
import ListInvoices from "@/components/invoice/ListInvoices";

export default async function InvoicesPage() {
  const { invoices } = await getInvoices();
  return <ListInvoices invoices={invoices} />;
}
