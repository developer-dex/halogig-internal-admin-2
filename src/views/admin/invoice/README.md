# Invoice System - V1 vs V2

This directory contains two different invoice designs that you can easily switch between.

## File Structure

- `InvoiceV1.jsx` - Original invoice design
- `InvoiceV2.jsx` - New invoice design (matches the Tubelight invoice template)
- `index.js` - Main export file that controls which version to use

## How to Switch Between Designs

To switch between the old and new invoice designs, simply modify the `INVOICE_CONFIG` in `index.js`:

```javascript
const INVOICE_CONFIG = {
  version: 'v2', // Change to 'v1' for original design, 'v2' for new design
};
```

### Version 1 (Original)
- Clean, simple design
- HaloGig branding
- Basic table layout
- Blue color scheme

### Version 2 (New - Tubelight Template)
- Matches the exact design from `invoice_version_1.png`
- Tubelight branding and styling
- Professional tax invoice layout
- Black border and structured sections
- Includes GST/IGST calculations
- Company details and bank information

## Features

Both versions include:
- ✅ PDF download functionality
- ✅ Invoice creation and saving
- ✅ Responsive design
- ✅ Real billing data integration
- ✅ Error handling
- ✅ Loading states

## Integration

The invoice system is automatically integrated with:
- Project Bid Details page
- Milestone management
- Billing information system
- Redux state management

## Usage

1. Navigate to Project Bids → View Bid Details → Milestones
2. Click "View Invoice" on any paid milestone
3. The system will load the selected invoice version
4. Use "Download Invoice" to generate PDF
5. Use "Create Invoice" to save to system

## Customization

To customize either version:
1. Edit the respective component file (`InvoiceV1.jsx` or `InvoiceV2.jsx`)
2. Modify styling, layout, or data fields as needed
3. The changes will be reflected immediately

## Development Notes

- Both components use the same data structure from Redux
- PDF generation uses `html2canvas` and `jsPDF`
- Multi-page PDF support is included
- Error handling and success messages are integrated
- All components are fully typed and documented

