const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const PDFDocument = require('pdfkit');

const CSV_FILE = path.join(__dirname, 'invoice.csv');
const OUTPUT_DIR = path.join(__dirname, 'output');

function formatCurrency(value) {
  return `£${parseFloat(value).toFixed(2)}`;
}

function generateInvoicePDF(invoice, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'right' });
    doc.moveDown(0.5);

    // Invoice meta
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice Number: ${invoice['Invoice Number']}`, { align: 'right' });
    doc.text(`Invoice Date:   ${invoice['Invoice Date']}`, { align: 'right' });
    doc.text(`Due Date:       ${invoice['Due Date']}`, { align: 'right' });

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(1);

    // Bill to
    doc.fontSize(10).font('Helvetica-Bold').text('BILL TO');
    doc.font('Helvetica');
    doc.text(`Customer Code: ${invoice['Customer Code']}`);
    doc.text(invoice['Customer Reference']);

    doc.moveDown(2);

    // Line items table header
    const col = { qty: 50, desc: 100, rate: 350, charge: 430, amount: 500 };
    const tableTop = doc.y;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('QTY', col.qty, tableTop);
    doc.text('DESCRIPTION', col.desc, tableTop);
    doc.text('RATE', col.rate, tableTop);
    doc.text('TYPE', col.charge, tableTop);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.5);

    // Line item row
    const rowY = doc.y;
    doc.font('Helvetica').fontSize(10);
    doc.text(invoice['Line-Quantity'], col.qty, rowY);
    doc.text(invoice['Line-Description'], col.desc, rowY);
    doc.text(formatCurrency(invoice['Line-Rate']), col.rate, rowY);
    doc.text(invoice['Line-Charge Type'], col.charge, rowY);

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals
    const lineTotal = parseFloat(invoice['Line-Quantity']) * parseFloat(invoice['Line-Rate']);
    const vat = parseFloat(invoice['Line-Vat Amount']);
    const total = lineTotal + vat;

    doc.font('Helvetica').fontSize(10);
    doc.text(`Subtotal:`, 400, doc.y, { continued: true }).text(formatCurrency(lineTotal), { align: 'right' });
    doc.text(`VAT (${invoice['Line-Vat Rate']}%):`, 400, doc.y, { continued: true }).text(formatCurrency(vat), { align: 'right' });
    doc.font('Helvetica-Bold');
    doc.text(`TOTAL:`, 400, doc.y, { continued: true }).text(formatCurrency(total), { align: 'right' });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const invoices = parse(csvContent, { columns: true, trim: true });

  console.log(`Found ${invoices.length} invoice(s). Generating PDFs...`);

  for (const invoice of invoices) {
    const filename = `invoice-${invoice['Invoice Number']}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    await generateInvoicePDF(invoice, outputPath);
    console.log(`  ✓ ${filename}`);
  }

  console.log(`\nDone. PDFs saved to ./output/`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
