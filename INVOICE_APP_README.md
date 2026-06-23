# SAF Invoice Manager

A modern invoice management web application built with Next.js that displays your shop's sales invoices.

## Features

- 📋 **Invoice Listing** - Browse all sales invoices with pagination (25 per page)
- 🔍 **Invoice Details** - View full line items, quantities, prices, taxes, and totals
- 💾 **Real-time Data** - Fetches live data from your REST APIs
- 🎨 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Performance** - Built with Next.js for optimal speed

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── invoices/
│   │       ├── route.ts          # API endpoint for listing invoices
│   │       └── [id]/route.ts     # API endpoint for invoice details
│   ├── invoices/
│   │   ├── page.tsx              # Invoices listing page
│   │   └── [id]/page.tsx         # Invoice detail page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── InvoiceList.tsx           # Invoice listing table component
│   └── InvoiceDetails.tsx        # Invoice details component
└── lib/
    └── api.ts                    # API client and type definitions
```

## Configuration

Update the API endpoints in [src/lib/api.ts](src/lib/api.ts):

```typescript
const BASE_URL = "https://mydomain.com";
```

Change the listing parameters in `getInvoicesList()` function:
- `listingId`: Your listing ID
- `listingViewId`: Your listing view ID

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update API configuration:**
   - Edit [src/lib/api.ts](src/lib/api.ts) with your actual API base URL and listing IDs

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### 1. GET /api/invoices
Lists all customer invoices with pagination.

**Query Parameters:**
- `skip` (number): Offset for pagination (default: 0)
- `take` (number): Number of records per page (default: 25)

**Response:**
```json
{
  "data": [
    {
      "SalesInvoices_SysId": "...",
      "SalesInvoices_TxnDate": "2026-06-23T00:00:00",
      "SalesInvoices_TxnNum": 41324,
      "Customers_Name": "...",
      "Salesmans_Name": "...",
      "GrossValue": 12.0,
      "PaymentStatus": "Unpaid",
      ...
    }
  ],
  "totalCount": 41276
}
```

### 2. GET /api/invoices/[id]
Gets detailed information for a specific invoice including line items.

**Query Parameters:**
- `txnId` (string): Transaction instance ID

**Response:**
```json
{
  "data": [
    {
      "SalesInvoiceId": "...",
      "ItemDescription": "WATER AQUA COOL 12X200ML",
      "Qty": 155.0,
      "UnitPrice": 0.2,
      "GrossValue": 31.0,
      "Item": { ... },
      ...
    }
  ],
  "totalCount": 1
}
```

## Pages

### Home Page (`/`)
Landing page with quick navigation to the invoices listing.

### Invoices Listing (`/invoices`)
- Displays all invoices in a paginated table
- Shows: Invoice #, Date, Customer, Salesman, Warehouse, Amount, Status
- Pagination controls for easy navigation
- Click "View" to see invoice details

### Invoice Details (`/invoices/[id]`)
- Shows all line items for the selected invoice
- Displays: Item Code, Description, Category, Qty, Unit, Price, Discount, Tax, Amount
- Calculates and shows: Gross Value, Discounts, Tax, and Total

## Customization

### Styling
The application uses Tailwind CSS. Modify styles in individual components or update [src/app/globals.css](src/app/globals.css).

### Display Fields
Edit the components to show/hide different fields:
- [src/components/InvoiceList.tsx](src/components/InvoiceList.tsx) - Listing table
- [src/components/InvoiceDetails.tsx](src/components/InvoiceDetails.tsx) - Details page

### API Integration
Modify [src/lib/api.ts](src/lib/api.ts) to:
- Change API endpoints
- Add authentication headers
- Add error handling or logging
- Cache responses

## Building for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, you may need to:
1. Add CORS headers to your backend API
2. Use a CORS proxy (for development only)
3. Enable CORS in your API server

### API Connection Issues
- Verify the `BASE_URL` in [src/lib/api.ts](src/lib/api.ts) is correct
- Ensure your listing IDs are accurate
- Check network requests in browser DevTools

## Technologies Used

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks

## License

MIT
