import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  Text,
  Button,
  useColorModeValue,
  Spinner,
  Flex,
  HStack,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
} from '@chakra-ui/react';
import {
  MdArrowBack,
  MdHome,
  MdAssignment,
  MdInfo,
  MdGetApp,
  MdSave,
} from 'react-icons/md';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  getBillingInformation,
  saveInvoiceInformation,
  clearSaveInvoiceState,
} from '../../../features/admin/projectBidsSlice';
import { showSuccess, showError } from '../../../helpers/messageHelper';
import logo from '../../../assets/img/logo/logo.png';

const currencyFormat = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  try {
    return new Intl.NumberFormat('en-IN', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(Number(amount));
  } catch {
    return '0.00';
  }
};

export default function InvoiceV2() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const invoiceRef = useRef(null);
  const { milestoneId, projectbidId } = useParams();

  const [billingInfo, setBillingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redux state for save invoice
  const { isSavingInvoice, saveInvoiceSuccess, saveInvoiceError } = useSelector(
    (state) => state.projectBidsReducer
  );

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.800');

  // Handle success/error states
  useEffect(() => {
    if (saveInvoiceSuccess) {
      showSuccess('Invoice created successfully!');
      dispatch(clearSaveInvoiceState());
    }
    if (saveInvoiceError) {
      showError('Failed to create invoice');
      dispatch(clearSaveInvoiceState());
    }
  }, [saveInvoiceSuccess, saveInvoiceError, dispatch]);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        setIsLoading(true);
        const res = await dispatch(getBillingInformation({ milestoneId, projectbidId }));
        const apiData = res?.payload?.data?.data;
        if (apiData) {
          setBillingInfo(apiData);
        } else {
          console.warn('Unexpected API structure:', res);
        }
      } catch (error) {
        console.error('Error fetching billing info:', error);
        showError('Failed to fetch billing information');
      } finally {
        setIsLoading(false);
      }
    };
    if (milestoneId && projectbidId) fetchBillingInfo();
  }, [dispatch, milestoneId, projectbidId]);

  const handleDownloadPDF = async () => {
    try {
      const element = invoiceRef.current;
      if (!element) {
        showError('Invoice element not found');
        return;
      }

      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If content is longer than one page, add multiple pages
      if (imgHeight > pageHeight) {
        let remainingHeight = imgHeight;
        let position = 0;

        while (remainingHeight > 0) {
          const pageImgHeight = Math.min(pageHeight, remainingHeight);
          
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
          
          position += pageHeight;
          remainingHeight -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`Invoice-${billingInfo?.saleOrderDetails?.invoice_no || Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Failed to generate PDF');
    }
  };

  const handleCreateInvoice = async () => {
    if (!billingInfo) {
      showError('Billing information not available');
      return;
    }

    try {
      // Generate PDF
      const element = invoiceRef.current;
      if (!element) {
        showError('Invoice element not found');
        return;
      }

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Handle multi-page content
      if (imgHeight > pageHeight) {
        let remainingHeight = imgHeight;
        let position = 0;

        while (remainingHeight > 0) {
          const pageImgHeight = Math.min(pageHeight, remainingHeight);
          
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
          
          position += pageHeight;
          remainingHeight -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Convert PDF to blob
      const pdfBlob = pdf.output('blob');

      // Create FormData
      const formData = new FormData();
      formData.append('milestoneId', milestoneId);
      formData.append('projectBidId', projectbidId);
      formData.append('file', pdfBlob, 'invoice.pdf');
      formData.append('fileType', 'invoice');
      formData.append('jsonDetails', JSON.stringify(billingInfo));

      // Call API
      await dispatch(saveInvoiceInformation(formData));
    } catch (error) {
      console.error('Error creating invoice:', error);
      showError('Failed to create invoice');
    }
  };

  if (isLoading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Box>
    );
  }

  if (!billingInfo) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Card bg={cardBg}>
          <Box p="24px" textAlign="center">
            <Alert status="error" mb={4}>
              <AlertIcon />
              Failed to load billing information
            </Alert>
            <Button
              leftIcon={<MdArrowBack />}
              colorScheme="brand"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  const billing = billingInfo?.userBillingInformation || {};
  const sale = billingInfo?.saleOrderDetails || {};
  const project = billingInfo?.projectDetails || {};

  // Calculate amounts
  const baseAmount = parseFloat(sale.milestone_amount) || 1000.00;
  const igstRate = 0.18; // 18% IGST
  const igstAmount = baseAmount * igstRate;
  const totalAmount = baseAmount + igstAmount;

  // Generate invoice number and dates
  const invoiceNo = sale.invoice_no || `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString('en-GB');
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Breadcrumb */}
      <Card mb="20px" bg={cardBg}>
        <Box p="24px">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">
                <HStack spacing={1}>
                  <MdHome />
                  <Text>Home</Text>
                </HStack>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/project-bids">
                <HStack spacing={1}>
                  <MdAssignment />
                  <Text>Project Bids</Text>
                </HStack>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>
                <HStack spacing={1}>
                  <MdInfo />
                  <Text>Invoice (New Design)</Text>
                </HStack>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>
      </Card>

      {/* Top Bar */}
      <Card mb="20px" bg={cardBg}>
        <Box p="24px">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Button
              leftIcon={<MdArrowBack />}
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <HStack spacing={4}>
              <Button
                leftIcon={<MdGetApp />}
                colorScheme="brand"
                variant="outline"
                onClick={handleDownloadPDF}
              >
                Download Invoice
              </Button>
              <Button
                leftIcon={<MdSave />}
                colorScheme="brand"
                onClick={handleCreateInvoice}
                isLoading={isSavingInvoice}
                loadingText="Creating Invoice..."
              >
                Create Invoice
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Card>

      {/* Invoice Content */}
      <Card bg={cardBg}>
        <Box p="24px">
          <Box 
            ref={invoiceRef} 
            bg="white" 
            color="black"
            fontFamily="Arial, sans-serif"
          >
            {/* Invoice Container with border */}
            <Box border="2px solid black" minH="297mm" p="20px">
              
              {/* Header */}
              <Flex justify="space-between" align="flex-start" mb="30px">
                {/* Logo Section */}
                <Box>
                  <Image 
                    src={logo} 
                    alt="HaloGig Logo" 
                    h="40px" 
                    w="auto"
                    mb="8px"
                    objectFit="contain"
                  />
                  <Text fontSize="10px" color="gray.600">
                    Your Technology Partner
                  </Text>
                </Box>
                
                {/* Invoice Title */}
                <Box textAlign="right">
                  <Text fontSize="24px" fontWeight="bold">
                    TAX INVOICE
                  </Text>
                  <Text fontSize="12px" color="gray.600">
                    Invoice No: {invoiceNo}
                  </Text>
                </Box>
              </Flex>

              {/* Company Details Section */}
              <Box mb="25px">
                <Text fontSize="14px" fontWeight="bold" color="blue.600" mb="8px">
                  HaloGig Technologies Private Limited
                </Text>
                <VStack align="start" spacing="2px" fontSize="11px" color="gray.700">
                  <Text>Electronic City, Bangalore</Text>
                  <Text>Karnataka, India</Text>
                  <Text>560100</Text>
                  <Text>PAN: AABCH9738C</Text>
                  <Text>GSTIN: 29AABCH9738C1ZU</Text>
                  <Text>India</Text>
                </VStack>
              </Box>

              {/* Bill To and Invoice Details */}
              <Flex justify="space-between" mb="25px">
                {/* Bill To Section */}
                <Box>
                  <Text fontSize="12px" fontWeight="bold" mb="8px">
                    Bill To
                  </Text>
                  <VStack align="start" spacing="2px" fontSize="11px" color="gray.700">
                    <Text fontWeight="bold">
                      {billing.billing_name || 'Client Company Name'}
                    </Text>
                    <Text>{billing.billing_address || 'Client Address Line 1'}</Text>
                    <Text>{billing.billing_state || 'State'}, {billing.billing_country || 'Country'}</Text>
                    <Text>{billing.billing_contact_number || 'Contact Number'}</Text>
                    <Text>{billing.billing_email || 'client@email.com'}</Text>
                    {billing.gst_number && <Text>GSTIN: {billing.gst_number}</Text>}
                    <Text>Place of Supply: {billing.billing_state || 'State'}</Text>
                  </VStack>
                </Box>

                {/* Invoice Details */}
                <Box textAlign="right" minW="200px">
                  <VStack align="end" spacing="8px" fontSize="11px">
                    <HStack>
                      <Text minW="80px">Balance Due</Text>
                      <Text fontWeight="bold">₹{currencyFormat(totalAmount)}</Text>
                    </HStack>
                    <HStack>
                      <Text minW="80px">Invoice Date:</Text>
                      <Text>{invoiceDate}</Text>
                    </HStack>
                    <HStack>
                      <Text minW="80px">Terms:</Text>
                      <Text>Payment received</Text>
                    </HStack>
                    <HStack>
                      <Text minW="80px">Due Date:</Text>
                      <Text>{dueDate}</Text>
                    </HStack>
                  </VStack>
                </Box>
              </Flex>

              {/* Items Table */}
              <Box mb="20px">
                <Table variant="simple" size="sm" fontSize="11px">
                  <Thead>
                    <Tr bg="gray.100">
                      <Th border="1px solid" borderColor="gray.400" p="8px" fontSize="10px" textAlign="center" w="40px">
                        #
                      </Th>
                      <Th border="1px solid" borderColor="gray.400" p="8px" fontSize="10px" textAlign="center">
                        Item & Description
                      </Th>
                      <Th border="1px solid" borderColor="gray.400" p="8px" fontSize="10px" textAlign="center" w="80px">
                        HSN/SAC
                      </Th>
                      <Th border="1px solid" borderColor="gray.400" p="8px" fontSize="10px" textAlign="center" w="60px">
                        Qty
                      </Th>
                      <Th border="1px solid" borderColor="gray.400" p="8px" fontSize="10px" textAlign="center" w="80px">
                        Rate
                      </Th>
                      <Th border="1px solid" borderColor="gray.400" p="8px" fontSize="10px" textAlign="center" w="80px">
                        IGST
                      </Th>
                      <Th border="1px solid" borderColor="gray.400" p="8px" fontSize="10px" textAlign="center" w="100px">
                        Amount
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td border="1px solid" borderColor="gray.400" p="8px" textAlign="center">
                        1
                      </Td>
                      <Td border="1px solid" borderColor="gray.400" p="8px">
                        {sale.milestone_scope || 'WhatsApp Service'}
                      </Td>
                      <Td border="1px solid" borderColor="gray.400" p="8px" textAlign="center">
                        998310
                      </Td>
                      <Td border="1px solid" borderColor="gray.400" p="8px" textAlign="center">
                        1.000.00
                      </Td>
                      <Td border="1px solid" borderColor="gray.400" p="8px" textAlign="right">
                        {currencyFormat(baseAmount)}
                      </Td>
                      <Td border="1px solid" borderColor="gray.400" p="8px" textAlign="right">
                        18.00
                      </Td>
                      <Td border="1px solid" borderColor="gray.400" p="8px" textAlign="right" fontWeight="bold">
                        1,000.00
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              {/* Totals Section */}
              <Flex justify="flex-end" mb="25px">
                <Box minW="300px">
                  <HStack justify="space-between" py="4px">
                    <Text fontSize="12px">Sub Total</Text>
                    <Text fontSize="12px" fontWeight="bold">1,000.00</Text>
                  </HStack>
                  <HStack justify="space-between" py="4px">
                    <Text fontSize="12px">IGST (18%)</Text>
                    <Text fontSize="12px" fontWeight="bold">180.00</Text>
                  </HStack>
                  <Box borderTop="2px solid black" pt="4px">
                    <HStack justify="space-between">
                      <Text fontSize="14px" fontWeight="bold">Total</Text>
                      <Text fontSize="14px" fontWeight="bold">₹1,180.00</Text>
                    </HStack>
                  </Box>
                  <HStack justify="space-between" py="4px" mt="8px">
                    <Text fontSize="12px" fontWeight="bold">Balance Due</Text>
                    <Text fontSize="12px" fontWeight="bold">₹1,180.00</Text>
                  </HStack>
                </Box>
              </Flex>

              {/* Footer Section */}
              <Box mt="40px">
                <Text fontSize="12px" color="gray.600" textAlign="center" mb="20px">
                  Total in Words: <Text as="span" fontWeight="bold">Rupees One Thousand One Hundred</Text>
                </Text>
                <Text fontSize="12px" color="gray.600" textAlign="center" mb="20px">
                  <Text as="span" fontWeight="bold">Eighty Only</Text>
                </Text>
                
                {/* Notes Section */}
                <Box mb="20px">
                  <Text fontSize="12px" fontWeight="bold" mb="8px">Notes</Text>
                  <Text fontSize="11px" color="gray.600">
                    Thank you for choosing HaloGig Technologies as your technology partner.
                  </Text>
                </Box>

                {/* Bank Details */}
                <Box mb="20px">
                  <Text fontSize="12px" fontWeight="bold" mb="8px">
                    Company Name: HALOGIG TECHNOLOGIES PRIVATE LIMITED
                  </Text>
                  <Text fontSize="11px" color="gray.600" mb="4px">
                    Bank Name: HDFC BANK
                  </Text>
                  <HStack spacing="40px" fontSize="11px" color="gray.600">
                    <VStack align="start" spacing="2px">
                      <Text>Account No: 1234567890123456</Text>
                      <Text>RTGS/NEFT/IFSC CODE: HDFC0001234</Text>
                    </VStack>
                  </HStack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

