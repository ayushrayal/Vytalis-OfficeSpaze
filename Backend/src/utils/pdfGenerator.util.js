const PDFDocument = require('pdfkit');

const formatDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="Invoice-${invoice.invoiceNumber || 'Template'}.pdf"`
  );

  doc.pipe(res);

  const primaryColor = '#1e293b';
  const secondaryColor = '#475569';
  const lightBgColor = '#f8fafc';
  const borderColor = '#cbd5e1';

  // --- 1. HEADER SECTION ---
  const headerTop = 40;

  // Left Column: Business Details
  doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text(invoice.businessName || '', 40, headerTop);
  doc.fontSize(9).font('Helvetica').fillColor(secondaryColor);
  
  let currentY = doc.y + 3;
  if (invoice.businessAddress) {
    doc.text(invoice.businessAddress, 40, currentY, { width: 280 });
    currentY = doc.y + 2;
  }
  if (invoice.gstin) {
    doc.text(`GSTIN: ${invoice.gstin}`, 40, currentY);
    currentY = doc.y + 2;
  }
  if (invoice.email) {
    doc.text(`Email: ${invoice.email}`, 40, currentY);
    currentY = doc.y + 2;
  }
  if (invoice.website) {
    doc.text(`Website: ${invoice.website}`, 40, currentY);
    currentY = doc.y + 2;
  }

  const leftColumnBottom = doc.y;

  // Right Column: Static "INVOICE" Title & Details
  doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('INVOICE', 350, headerTop, { align: 'right' });

  let rightY = headerTop + 32;
  doc.fontSize(9).font('Helvetica').fillColor(secondaryColor);

  doc.text(`Invoice No: ${invoice.invoiceNumber || ''}`, 300, rightY, { align: 'right' });
  rightY += 14;

  if (invoice.invoiceDate) {
    doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, 300, rightY, { align: 'right' });
    rightY += 14;
  }

  if (invoice.dueDate) {
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 300, rightY, { align: 'right' });
    rightY += 14;
  }

  if (invoice.terms) {
    doc.text(`Terms: ${invoice.terms}`, 300, rightY, { align: 'right' });
    rightY += 14;
  }

  if (invoice.placeOfSupply) {
    doc.text(`Place of Supply: ${invoice.placeOfSupply}`, 300, rightY, { align: 'right' });
    rightY += 14;
  }

  const headerBottom = Math.max(leftColumnBottom, rightY) + 15;

  // Horizontal Divider Line
  doc.strokeColor(borderColor).lineWidth(1).moveTo(40, headerBottom).lineTo(555, headerBottom).stroke();

  // --- 2. BILL TO SECTION ---
  let billToY = headerBottom + 15;
  doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('BILL TO:', 40, billToY);
  billToY += 14;

  doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text(invoice.clientName || '', 40, billToY);
  billToY += 14;

  doc.fontSize(9).font('Helvetica').fillColor(secondaryColor);
  if (invoice.billingAddress) {
    doc.text(invoice.billingAddress, 40, billToY, { width: 300 });
    billToY = doc.y + 2;
  }
  if (invoice.clientGstin) {
    doc.text(`GSTIN: ${invoice.clientGstin}`, 40, billToY);
    billToY = doc.y + 2;
  }

  // --- 3. LINE ITEMS TABLE ---
  let tableTop = Math.max(billToY + 15, headerBottom + 70);

  // Table Header Background
  doc.rect(40, tableTop, 515, 20).fill(lightBgColor);

  // Table Header Titles
  doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold');
  doc.text('DESCRIPTION', 45, tableTop + 6, { width: 170 });
  doc.text('HSN/SAC', 220, tableTop + 6, { width: 50, align: 'center' });
  doc.text('QTY', 275, tableTop + 6, { width: 35, align: 'center' });
  doc.text('RATE (₹)', 315, tableTop + 6, { width: 65, align: 'right' });
  doc.text('TAX %', 385, tableTop + 6, { width: 40, align: 'right' });
  doc.text('TAX AMT (₹)', 430, tableTop + 6, { width: 55, align: 'right' });
  doc.text('AMOUNT (₹)', 490, tableTop + 6, { width: 60, align: 'right' });

  let rowY = tableTop + 24;
  doc.font('Helvetica').fontSize(8).fillColor(secondaryColor);

  if (Array.isArray(invoice.items)) {
    invoice.items.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 1) {
        doc.rect(40, rowY - 4, 515, 18).fill('#fafafa');
      }

      doc.fillColor(secondaryColor);
      doc.text(item.description || '', 45, rowY, { width: 170 });
      doc.text(item.hsnSac || '-', 220, rowY, { width: 50, align: 'center' });
      doc.text(String(item.quantity || 0), 275, rowY, { width: 35, align: 'center' });
      doc.text(formatCurrency(item.rate), 315, rowY, { width: 65, align: 'right' });
      doc.text(`${item.taxPercent || 0}%`, 385, rowY, { width: 40, align: 'right' });
      doc.text(formatCurrency(item.taxAmount), 430, rowY, { width: 55, align: 'right' });
      doc.text(formatCurrency(item.lineAmount), 490, rowY, { width: 60, align: 'right' });

      rowY += 20;
    });
  }

  doc.strokeColor(borderColor).lineWidth(0.5).moveTo(40, rowY).lineTo(555, rowY).stroke();

  // --- 4. TOTALS BLOCK ---
  let totalsY = rowY + 15;
  const totalsLeft = 350;
  const totalsWidth = 205;

  const drawSummaryLine = (label, value, isBold = false) => {
    doc.fontSize(9).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor(primaryColor);
    doc.text(label, totalsLeft, totalsY);
    doc.text(value, totalsLeft, totalsY, { width: totalsWidth, align: 'right' });
    totalsY += 16;
  };

  drawSummaryLine('Sub Total:', `₹${formatCurrency(invoice.subTotal)}`);
  drawSummaryLine('Tax Total:', `₹${formatCurrency(invoice.taxTotal)}`);
  drawSummaryLine('Total Amount:', `₹${formatCurrency(invoice.total)}`, true);

  if (invoice.amountWithheld > 0) {
    drawSummaryLine('TDS / Amount Withheld:', `- ₹${formatCurrency(invoice.amountWithheld)}`);
  }

  doc.rect(totalsLeft - 5, totalsY - 2, totalsWidth + 10, 22).fill(lightBgColor);
  doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
  doc.text('Balance Due:', totalsLeft, totalsY + 4);
  doc.text(`₹${formatCurrency(invoice.balanceDue)}`, totalsLeft, totalsY + 4, {
    width: totalsWidth,
    align: 'right'
  });
  totalsY += 28;

  // --- 5. TOTAL IN WORDS ---
  if (invoice.totalInWords) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('Amount in Words:', 40, totalsY - 30);
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(secondaryColor).text(invoice.totalInWords, 40, totalsY - 16, { width: 290 });
  }

  let bottomY = Math.max(totalsY, doc.y + 15);

  // Divider
  doc.strokeColor(borderColor).lineWidth(0.5).moveTo(40, bottomY).lineTo(555, bottomY).stroke();
  bottomY += 15;

  // --- 6. BANK DETAILS & PAYMENT OPTIONS ---
  const bankY = bottomY;

  // Left: Bank Details
  doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('BANK DETAILS', 40, bankY);
  let bY = bankY + 14;
  doc.fontSize(8).font('Helvetica').fillColor(secondaryColor);

  const bd = invoice.bankDetails || {};
  if (bd.accountName) { doc.text(`Account Name: ${bd.accountName}`, 40, bY); bY += 12; }
  if (bd.bankName) { doc.text(`Bank Name: ${bd.bankName}`, 40, bY); bY += 12; }
  if (bd.accountNumber) { doc.text(`Account No: ${bd.accountNumber}`, 40, bY); bY += 12; }
  if (bd.ifscCode) { doc.text(`IFSC Code: ${bd.ifscCode}`, 40, bY); bY += 12; }
  if (bd.accountType) { doc.text(`Account Type: ${bd.accountType}`, 40, bY); bY += 12; }
  if (bd.branch) { doc.text(`Branch: ${bd.branch}`, 40, bY); bY += 12; }

  // Right: Payment Options
  const enabledOptions = Array.isArray(invoice.paymentOptions)
    ? invoice.paymentOptions.filter((opt) => opt.enabled).map((opt) => opt.name)
    : [];

  if (enabledOptions.length > 0) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('PAYMENT OPTIONS', 320, bankY);
    let pY = bankY + 14;
    doc.fontSize(8).font('Helvetica').fillColor(secondaryColor);
    doc.text(`Accepted: ${enabledOptions.join(', ')}`, 320, pY, { width: 235 });
  }

  let notesY = Math.max(bY + 10, bankY + 45);

  // --- 7. NOTES & FOOTER ---
  if (invoice.notes) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('Notes:', 40, notesY);
    doc.fontSize(8).font('Helvetica').fillColor(secondaryColor).text(invoice.notes, 40, notesY + 12, { width: 515 });
    notesY = doc.y + 15;
  }

  if (invoice.footerMessage) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(secondaryColor).text(invoice.footerMessage, 40, Math.max(notesY, 780), {
      width: 515,
      align: 'center'
    });
  }

  doc.end();
};

module.exports = {
  generateInvoicePDF
};
