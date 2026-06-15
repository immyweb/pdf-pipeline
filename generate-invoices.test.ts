import { describe, it, expect, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { formatCurrency, parseInvoices, generateInvoicePDF, type Invoice } from './generate-invoices.ts'

const TEST_INVOICE: Invoice = {
  'Invoice Number': '999',
  'Invoice Date': '18/07/2011',
  'Due Date': '28/07/2011',
  'Customer Code': '1',
  'Customer Reference': 'Test Customer',
  'Line-Quantity': '2',
  'Line-Description': 'Test service',
  'Line-Rate': '100.00',
  'Line-Charge Type': 'Sale of goods',
  'Line-Vat Amount': '40.00',
  'Line-Vat Rate': '20',
}

describe('formatCurrency', () => {
  it('formats integer as two decimal places', () => {
    expect(formatCurrency(2000)).toBe('£2000.00')
  })

  it('formats decimal value correctly', () => {
    expect(formatCurrency(2000.01)).toBe('£2000.01')
  })

  it('rounds to two decimal places', () => {
    expect(formatCurrency('2000.5')).toBe('£2000.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('£0.00')
  })
})

describe('parseInvoices', () => {
  const CSV = `Invoice Number,Invoice Date,Due Date,Customer Code,Customer Reference,Line-Quantity,Line-Description,Line-Rate,Line-Charge Type,Line-Vat Amount,Line-Vat Rate
101,18/07/2011,28/07/2011,1,Customer 101,2,Invoice line 1,2000,Sale of goods,0,0
102,18/07/2011,29/07/2011,1,Customer 102,3,Invoice line 2,500.50,Sale of goods,100,20`

  it('parses all rows', () => {
    expect(parseInvoices(CSV)).toHaveLength(2)
  })

  it('maps column names to invoice fields', () => {
    const [invoice] = parseInvoices(CSV)
    expect(invoice['Invoice Number']).toBe('101')
    expect(invoice['Line-Rate']).toBe('2000')
    expect(invoice['Customer Reference']).toBe('Customer 101')
  })

  it('trims whitespace from values', () => {
    const csv = `Invoice Number,Invoice Date,Due Date,Customer Code,Customer Reference,Line-Quantity,Line-Description,Line-Rate,Line-Charge Type,Line-Vat Amount,Line-Vat Rate
  101 , 18/07/2011 ,28/07/2011,1,Customer 101,2,desc,2000,Sale,0,0`
    const [invoice] = parseInvoices(csv)
    expect(invoice['Invoice Number']).toBe('101')
  })
})

describe('generateInvoicePDF', () => {
  const outputPath = path.join(os.tmpdir(), 'test-invoice-999.pdf')

  afterEach(() => {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
  })

  it('writes a file starting with the PDF magic bytes', async () => {
    await generateInvoicePDF(TEST_INVOICE, outputPath)
    const bytes = fs.readFileSync(outputPath).subarray(0, 4).toString()
    expect(bytes).toBe('%PDF')
  })

  it('produces a non-empty file', async () => {
    await generateInvoicePDF(TEST_INVOICE, outputPath)
    const { size } = fs.statSync(outputPath)
    expect(size).toBeGreaterThan(1000)
  })
})
