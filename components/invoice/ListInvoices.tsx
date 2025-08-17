"use client";

import Stripe from "stripe";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Pagination,
  Alert,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Key } from "@react-types/shared";
import Link from "next/link";
import { getTotalPages, paginate } from "@/helpers";
import { QUESTIONS_PER_PAGE } from "@/constants/constants";

export const columns = [
  { name: "Invoice", uid: "invoice" },
  { name: "BILL PAID", uid: "bill" },
  { name: "BILLING DATE", uid: "date" },
  { name: "ACTIONS", uid: "actions" },
];

export default function ListInvoices({
  invoices,
}: {
  invoices: Stripe.Invoice[];
}) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex justify-center">
        <p>No invoices found</p>
      </div>
    );
  }

  const lastInvoice = invoices[0];

  // State to manage current page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages
  const totalPages = getTotalPages(invoices.length, QUESTIONS_PER_PAGE);

  // Get the current questions for the page
  const currentInvoices = paginate(invoices, currentPage, QUESTIONS_PER_PAGE);

  // Handle page change
  const handlePageChange = (page: number) => {
    // Update the current page state
    setCurrentPage(page);
  };

  const renderCell = React.useCallback(
    (invoice: Stripe.Invoice, columnKey: Key) => {
      const cellValue = invoice[columnKey as keyof Stripe.Invoice];

      switch (columnKey) {
        case "invoice":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {invoice.account_name}
              </p>
              <p className="text-bold text-sm capitalize text-default-400">
                {invoice.id}
              </p>
            </div>
          );
        case "bill":
          return (
            <Chip
              className="capitalize"
              color="success"
              size="sm"
              variant="flat"
            >
              ฿{(invoice.amount_paid / 100).toFixed(2)}
            </Chip>
          );
        case "date":
          return (
            <p className="text-bold text-sm text-default-400">
              {new Date(
                invoice.lines.data[0].period.end * 1000
              ).toLocaleDateString()}
            </p>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button
                className=" bg-foreground font-medium text-background"
                variant="flat"
                color="secondary"
                endContent={<Icon icon="solar:download-linear" fontSize={20} />}
                as={Link}
                href={invoice?.invoice_pdf || "#"}
                target="_blank"
              >
                Download Invoice
              </Button>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );
  return (
    <div className="my-4">
      <div className="flex items-center justify-center w-full mb-5">
        <Alert
          title="Next Billing"
          color="success"
          description={`Your next billing of ฿${(
            lastInvoice.amount_due / 100
          ).toFixed(2)} for ${lastInvoice.account_name} will be on ${new Date(
            lastInvoice.lines.data[0].period.end * 1000
          ).toLocaleDateString()}`}
        />
      </div>
      <Table aria-label="Interviews Table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={currentInvoices}>
          {(item: Stripe.Invoice) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey) as React.ReactNode}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className=" flex justify-center items-center mt-10">
        <Pagination
          isCompact
          showControls
          showShadow
          initialPage={1}
          total={totalPages}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
}
