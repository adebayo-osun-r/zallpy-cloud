
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  User
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Invoice } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { InvoiceDetailsDialog } from "@/components/invoice/InvoiceDetailsDialog";
import { EditInvoiceDialog } from "@/components/invoice/EditInvoiceDialog"; // adjust path as needed
import { NewInvoiceDialog } from "@/components/invoice/NewInvoiceDialog"

import { jsPDF } from "jspdf";
import Papa from "papaparse";



export default function Billing() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSaveNewInvoice = async (newInvoice: Invoice) => {
    try {
      // 1. Insert invoice
      const { id, items, guestName, reservationId, guestId, subtotal, taxAmount, totalAmount, issueDate, dueDate, status } = newInvoice;
      // Create a compatible object for the Supabase "invoices" table
      const invoiceToInsert = {
        reservation_id: reservationId,
        guest_id: guestId,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        issue_date: issueDate,
        due_date: dueDate,
        status: status,
      };

      const { data: insertedInvoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([invoiceToInsert])
        .select()
        .single(); // Gets the inserted invoice back

      if (invoiceError) throw invoiceError;

      const invoiceId = insertedInvoice.id;

      // 2. Prepare and insert billing items
      const billingItemsToInsert = items.map((item) => ({
        invoice_id: invoiceId,
        guest_id: item.guestId,
        reservation_id: item.reservationId,
        description: item.description,
        amount: item.amount,
        category: item.category,
        date: item.date,
        status: item.status,
      }));

      const { error: billingError } = await supabase
        .from("billing_items")
        .insert(billingItemsToInsert);

      if (billingError) throw billingError;

      console.log("Invoice and billing items saved successfully");

    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditDialogOpen(true);
  };

  // Export to CSV function
  const exportToCSV = (invoice: Invoice) => {
    const csvData = [
      ["Description", "Amount"],
      ...invoice.items.map((item) => [item.description, item.amount]),
    ];

    // Convert to CSV string
    const csv = Papa.unparse(csvData);

    // Create a blob for CSV download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_INV-${invoice.id}.csv`;
    a.click();
  };

  // Export to PDF function
  const exportToPDF = (invoice: Invoice) => {
    const doc = new jsPDF();

    doc.text(`Invoice #INV-${invoice.id}`, 10, 10);
    doc.text(`Guest: ${invoice.guestName}`, 10, 20);
    doc.text(`Issue Date: ${format(new Date(invoice.issueDate), 'MMM dd, yyyy')}`, 10, 30);
    doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}`, 10, 40);
    doc.text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, 10, 50);

    invoice.items.forEach((item, index) => {
      doc.text(`${item.description}: $${item.amount.toFixed(2)}`, 10, 60 + index * 10);
    });

    doc.save(`Invoice_INV-${invoice.id}.pdf`);
  };

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            guests!inner (
              first_name,
              last_name
            )
          `)
          .order('issue_date', { ascending: false });

        if (error) throw error;

        // Map database fields to our Invoice type with proper type casting
        const formattedData: Invoice[] = data.map((invoice) => ({
          id: invoice.id,
          reservationId: invoice.reservation_id,
          guestId: invoice.guest_id,
          guestName: `${invoice.guests.first_name} ${invoice.guests.last_name}`,
          items: [],  // We'd need another query to get billing items
          subtotal: invoice.subtotal,
          taxAmount: invoice.tax_amount,
          totalAmount: invoice.total_amount,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          status: invoice.status as "Draft" | "Issued" | "Paid" | "Overdue" | "Cancelled"
        }));

        setInvoices(formattedData);
      } catch (error: any) {
        toast({
          title: "Error fetching invoices",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    // First filter by tab
    let tabMatch = true;
    if (activeTab === "draft") tabMatch = invoice.status === "Draft";
    else if (activeTab === "issued") tabMatch = invoice.status === "Issued";
    else if (activeTab === "paid") tabMatch = invoice.status === "Paid";
    else if (activeTab === "overdue") tabMatch = invoice.status === "Overdue";

    // Then filter by search term
    const searchMatch =
      invoice.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());

    return tabMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-500";
      case "Issued": return "bg-blue-500";
      case "Draft": return "bg-gray-500";
      case "Overdue": return "bg-red-500";
      case "Cancelled": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <AppLayout title="Billing">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground">
              Manage invoices and financial transactions
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>

            <Button variant="default" size="sm" onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Render the New Invoice Dialog */}

        <NewInvoiceDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveNewInvoice}
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="issued">Issued</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Manage guest invoices and payments</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            No invoices found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>INV-{invoice.id.substring(0, 8)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{invoice.guestName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>₦{invoice.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(invoice.status)} text-white`}>
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditDialog(invoice)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    const { error } = await supabase
                                      .from("invoices")
                                      .update({ status: "Paid" })
                                      .eq("id", invoice.id);

                                    if (!error) {
                                      setInvoices((prev) =>
                                        prev.map((inv) =>
                                          inv.id === invoice.id ? { ...inv, status: "Paid" } : inv
                                        )
                                      );
                                      toast({ title: "Invoice marked as Paid" });
                                    }
                                  }}
                                >
                                  Mark as Paid
                                </Button>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => exportToPDF(invoice)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => exportToCSV(invoice)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>

                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}

                <InvoiceDetailsDialog
                  invoice={selectedInvoice}
                  open={detailsOpen}
                  onClose={() => setDetailsOpen(false)}
                />
                <EditInvoiceDialog
                  open={editDialogOpen}
                  onClose={() => setEditDialogOpen(false)}
                  invoice={editingInvoice}
                  onSave={async (updatedInvoice) => {
                    try {
                      // Save updated items
                      for (const item of updatedInvoice.items) {
                        await supabase
                          .from("billing_items")
                          .update({
                            description: item.description,
                            amount: item.amount,
                          })
                          .eq("id", item.id);
                      }

                      // Update invoice totals
                      await supabase
                        .from("invoices")
                        .update({
                          subtotal: updatedInvoice.subtotal,
                          total_amount: updatedInvoice.totalAmount,
                        })
                        .eq("id", updatedInvoice.id);

                      // Refresh the list
                      setInvoices((prev) =>
                        prev.map((inv) => (inv.id === updatedInvoice.id ? { ...inv, ...updatedInvoice } : inv))
                      );

                      toast({
                        title: "Invoice updated",
                        description: "The invoice has been successfully updated.",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error updating invoice",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                />

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
