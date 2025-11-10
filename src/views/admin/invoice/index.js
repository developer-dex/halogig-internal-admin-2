import React from 'react';
import InvoiceV1 from './InvoiceV1'; // Original invoice
import InvoiceV2 from './InvoiceV2'; // New invoice design

// Configuration to switch between invoice versions
const INVOICE_CONFIG = {
  // Set this to 'v1' for original design or 'v2' for new design
  version: 'v2', // Change this to 'v1' to use the original design
};

export default function Invoice() {
  // Return the selected invoice version
  if (INVOICE_CONFIG.version === 'v2') {
    return <InvoiceV2 />;
  } else {
    return <InvoiceV1 />;
  }
}

// Export both versions for direct use if needed
export { InvoiceV1, InvoiceV2 };
