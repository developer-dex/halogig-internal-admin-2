# Invoice V2 - HaloGig Branding Updates

## Changes Made

### 1. Logo Replacement
- ✅ Replaced TubeLight black text logo with HaloGig logo image
- ✅ Updated logo path to use `src/assets/img/logo/logo.png`
- ✅ Set proper logo dimensions (40px height, auto width)

### 2. Company Information Updates
- ✅ **Company Name**: "Tubelight Communications Limited" → "HaloGig Technologies Private Limited"
- ✅ **Tagline**: "communication is evolution..." → "Your Technology Partner"
- ✅ **Address**: Updated to Bangalore, Karnataka location
- ✅ **PAN**: Updated to AABCH9738C
- ✅ **GSTIN**: Updated to 29AABCH9738C1ZU

### 3. Bank Details Updates
- ✅ **Bank Name**: "DEUTSCHE BANK" → "HDFC BANK"
- ✅ **Account Number**: Updated to HaloGig account
- ✅ **IFSC Code**: Updated to HDFC0001234

### 4. Dynamic Billing Information
- ✅ Made Bill To section fully dynamic using billing data
- ✅ Replaced hardcoded client information with dynamic fields
- ✅ Added proper fallback values for missing data

### 5. Content Updates
- ✅ Updated Notes section to reflect HaloGig branding
- ✅ Removed all TubeLight references throughout the invoice

## Features Maintained
- ✅ PDF generation functionality
- ✅ Multi-page support
- ✅ Tax calculations (IGST 18%)
- ✅ Professional invoice layout
- ✅ Dynamic data integration
- ✅ Error handling and loading states

## How to Use
1. The invoice will automatically use HaloGig branding
2. Logo loads from `src/assets/img/logo/logo.png`
3. All company details are now HaloGig-specific
4. Client information dynamically populated from billing data

## Configuration
To switch between V1 (old) and V2 (new) designs, update `src/views/admin/invoice/index.js`:
```javascript
const INVOICE_CONFIG = {
  version: 'v2', // 'v1' for old design, 'v2' for new HaloGig design
};
```
