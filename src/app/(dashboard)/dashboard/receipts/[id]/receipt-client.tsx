"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Printer, Download } from "lucide-react";

interface ReceiptClientProps {
    payment: any;
}

export function ReceiptClient({ payment }: ReceiptClientProps) {
    const [generating, setGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        const element = document.getElementById('receipt-content');
        if (!element) return;
        setGenerating(true);

        try {
            // Wait a moment for any images/fonts to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            // A4 dimensions in mm: 210 x 297
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`receipt-${payment?.transaction_ref}.pdf`);
        } catch (e) {
            console.error("PDF Gen failed", e);
            alert("Failed to generate PDF. Please try printing instead.");
        } finally {
            setGenerating(false);
        }
    };

    if (!payment) return <div>Receipt not found</div>;

    return (
        <div className="bg-white text-black p-8 max-w-[800px] mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8 no-print gap-2">
                <div className="flex gap-2">
                    <Button onClick={() => window.print()} variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={generating}>
                        <Download className="mr-2 h-4 w-4" />
                        {generating ? "Generating..." : "Download PDF"}
                    </Button>
                </div>
                <Button variant="ghost" onClick={() => window.close()}>Close</Button>
            </div>

            <div id="receipt-content" className="border p-8">
                <div className="flex justify-between items-start mb-8 border-b pb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Acrely</h1>
                        <p className="text-sm text-gray-500">Real Estate Management</p>
                        <p className="text-sm text-gray-500">123 Business Road, Lagos</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold">PAYMENT RECEIPT</h2>
                        <p className="text-gray-500">#{payment.transaction_ref}</p>
                        <p className="text-sm text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
                    <p className="font-semibold text-lg">{payment.customers?.full_name}</p>
                    <p>{payment.customers?.email}</p>
                    <p>{payment.customers?.phone}</p>
                    <p>{payment.customers?.address}</p>
                </div>

                <div className="mb-8 border-t border-b py-4">
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">Description</span>
                        <span className="font-semibold">Amount</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Payment via {payment.method?.replace('_', ' ')}</span>
                        <span>₦{payment.amount?.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-end mb-8">
                    <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                        <p className="text-3xl font-bold text-primary">₦{payment.amount?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="text-center pt-8 border-t text-sm text-gray-400">
                    <p>Thank you for your business!</p>
                    <p>For inquiries, contact support@acrely.com</p>
                </div>
            </div>
        </div>
    );
}
