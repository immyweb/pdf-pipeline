# PDF Pipeline

Generates PDF invoices from a CSV file. Used for Claude Code training.

## Usage

1. Put invoice rows in `invoice.csv` (see existing file for the expected columns).
2. Run:

```
npm start
```

PDFs are written to `./output/invoice-<Invoice Number>.pdf`.

## Scripts

- `npm start` — generate invoices from `invoice.csv`
- `npm test` — run tests
- `npm run typecheck` — type-check the project
