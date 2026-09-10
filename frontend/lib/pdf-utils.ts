/**
 * PDF Generation Utilities for RUFA ELAN
 * Handles invoice PDF generation and download
 */

export interface InvoicePDFData {
  orderNumber: string;
  orderDate: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  paymentReference?: string;
  paymentStatus: string;
  items: Array<{
    name: string;
    variant?: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
}

/**
 * Generate and download invoice as PDF
 * Uses html2pdf library to convert HTML to PDF
 */
export async function downloadInvoicePDF(data: InvoicePDFData): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // Create HTML content for the invoice
    const htmlContent = createInvoiceHTML(data);

    // PDF options
    const options = {
      margin: 10,
      filename: `${data.orderNumber}_invoice.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generate PDF
    html2pdf().set(options).from(htmlContent).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: open print dialog
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(createInvoiceHTML(data));
      printWindow.document.close();
      printWindow.print();
    }
    throw error;
  }
}

/**
 * Create HTML content for invoice
 */
function createInvoiceHTML(data: InvoicePDFData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: left;">
        <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(item.name)}</div>
        ${item.variant ? `<div style="font-size: 12px; color: #666;">Variant: ${escapeHtml(item.variant)}</div>` : ''}
        ${item.sku ? `<div style="font-size: 12px; color: #999;">SKU: ${escapeHtml(item.sku)}</div>` : ''}
      </td>
      <td style="padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right;">GHS ${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; font-weight: 600;">GHS ${item.totalPrice.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
      line-height: 1.6;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 30px;
      margin-bottom: 30px;
    }
    .company-info h1 {
      color: #2563eb;
      font-size: 32px;
      margin-bottom: 4px;
    }
    .company-info p {
      color: #666;
      font-size: 14px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info .label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .invoice-info .value {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .invoice-info .date {
      color: #666;
      font-size: 13px;
    }
    .customer-section {
      display: flex;
      gap: 60px;
      margin-bottom: 30px;
    }
    .customer-section .col {
      flex: 1;
    }
    .section-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .customer-details {
      font-size: 13px;
      line-height: 1.8;
    }
    .customer-details .name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .items-table {
      width: 100%;
      margin-bottom: 30px;
      border-collapse: collapse;
    }
    .items-table thead {
      background-color: #f3f4f6;
      border-bottom: 2px solid #d1d5db;
    }
    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .items-table th:nth-child(2),
    .items-table th:nth-child(3),
    .items-table th:nth-child(4) {
      text-align: right;
    }
    .items-table td {
      padding: 12px;
      font-size: 13px;
    }
    .items-table td:nth-child(2),
    .items-table td:nth-child(3),
    .items-table td:nth-child(4) {
      text-align: right;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-box {
      width: 100%;
      max-width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    .total-row.final {
      background-color: #eff6ff;
      padding: 16px;
      border: none;
      font-size: 16px;
      font-weight: 700;
      color: #2563eb;
    }
    .total-row.discount {
      color: #16a34a;
    }
    .footer {
      border-top: 2px solid #e5e7eb;
      padding-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer p {
      margin-bottom: 8px;
    }
    .footer .company-name {
      color: #1f2937;
      font-weight: 600;
      margin-top: 12px;
    }
    @media print {
      body { background: white; }
      .invoice-container { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>RUFA ELAN</h1>
        <p>Premium E-commerce Solutions</p>
      </div>
      <div class="invoice-info">
        <div class="label">Invoice</div>
        <div class="value">${escapeHtml(data.orderNumber)}</div>
        <div class="date">${data.orderDate}</div>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-section">
      <div class="col">
        <div class="section-label">Bill To</div>
        <div class="customer-details">
          <div class="name">${escapeHtml(data.customerName)}</div>
          <div>${escapeHtml(data.customerAddress)}</div>
          <div>${escapeHtml(data.customerCity)}</div>
          <div>${escapeHtml(data.customerPhone)}</div>
          <div>${escapeHtml(data.customerEmail)}</div>
        </div>
      </div>
      <div class="col">
        <div class="section-label">Order Details</div>
        <div class="customer-details">
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #999; margin-bottom: 4px;">Order Date</div>
            <div style="font-weight: 600;">${data.orderDate}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #999; margin-bottom: 4px;">Due Date</div>
            <div style="font-weight: 600;">${data.dueDate}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; color: #999; margin-bottom: 4px;">Payment Status</div>
            <div style="font-weight: 600; text-transform: capitalize;">${data.paymentStatus}</div>
          </div>
          ${data.paymentReference ? `
            <div>
              <div style="font-size: 11px; color: #999; margin-bottom: 4px;">Payment Ref</div>
              <div style="font-family: monospace; font-size: 12px;">${escapeHtml(data.paymentReference)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>GHS ${data.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Shipping Fee:</span>
          <span>GHS ${data.shippingFee.toFixed(2)}</span>
        </div>
        ${data.discountAmount > 0 ? `
          <div class="total-row discount">
            <span>Discount:</span>
            <span>-GHS ${data.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-row final">
          <span>Total Amount:</span>
          <span>GHS ${data.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>For support, contact us at support@rufaelan.com | Phone: +233 (0) XXX XXX XXXX</p>
      <p class="company-name">RUFA ELAN - Quality Products, Fast Delivery</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
