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
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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

const currencyFormat = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '--';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(amount));
  } catch {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));
  }
};

export default function InvoiceV1() {
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

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice.pdf`);
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

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

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

  const fullAddress = [
    billing.billing_address,
    billing.billing_state,
    billing.billing_country,
  ]
    .filter(Boolean)
    .join(', ');

  // Calculate tax (assuming 18% GST)
  const subtotal = parseFloat(sale.milestone_amount) || 0;
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

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
                  <Text>Invoice</Text>
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
          <Box ref={invoiceRef} bg="white" p="40px" color="black">
            {/* Header */}
            <Flex justify="space-between" align="start" mb="40px">
              <VStack align="start" spacing={2}>
                <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                  INVOICE
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Invoice No: {sale.invoice_no || `INV-${Date.now()}`}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Date: {new Date().toLocaleDateString('en-IN')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Due Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                </Text>
              </VStack>
              <Box textAlign="right">
                <Text fontSize="xl" fontWeight="bold">
                  HaloGig Technologies
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Your Technology Partner
                </Text>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  GST No: 29ABCDE1234F1Z5
                </Text>
              </Box>
            </Flex>

            <Divider mb="30px" />

            {/* Billing Information */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="40px" mb="40px">
              <VStack align="start" spacing={3}>
                <Text fontSize="lg" fontWeight="bold" color="brand.500">
                  Bill To:
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="600">{billing.billing_name || '--'}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {billing.billing_email || '--'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {billing.billing_contact_number || '--'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {fullAddress || '--'}
                  </Text>
                  {billing.gst_number && (
                    <Text fontSize="sm" color="gray.600">
                      GST: {billing.gst_number}
                    </Text>
                  )}
                </VStack>
              </VStack>

              <VStack align="start" spacing={3}>
                <Text fontSize="lg" fontWeight="bold" color="brand.500">
                  Project Details:
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="600">{project.project_title || '--'}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Category: {project.category_name || '--'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Sales Order: {sale.sale_order_no || '--'}
                  </Text>
                </VStack>
              </VStack>
            </SimpleGrid>

            {/* Invoice Items */}
            <Box mb="40px">
              <Text fontSize="lg" fontWeight="bold" color="brand.500" mb="20px">
                Invoice Details:
              </Text>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th borderColor="gray.200">Description</Th>
                    <Th borderColor="gray.200" textAlign="center">Hours</Th>
                    <Th borderColor="gray.200" textAlign="right">Rate</Th>
                    <Th borderColor="gray.200" textAlign="right">Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td borderColor="gray.200">{sale.milestone_scope || 'Development Services'}</Td>
                    <Td borderColor="gray.200" textAlign="center">{sale.milestone_hours || '--'}</Td>
                    <Td borderColor="gray.200" textAlign="right">
                      {sale.milestone_hours ? currencyFormat(subtotal / parseFloat(sale.milestone_hours)) : '--'}
                    </Td>
                    <Td borderColor="gray.200" textAlign="right" fontWeight="600">
                      {currencyFormat(subtotal)}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>

            {/* Totals */}
            <Flex justify="flex-end" mb="40px">
              <Box minW="300px">
                <Flex justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontWeight="600">Subtotal:</Text>
                  <Text fontWeight="600">{currencyFormat(subtotal)}</Text>
                </Flex>
                <Flex justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontWeight="600">GST (18%):</Text>
                  <Text fontWeight="600">{currencyFormat(taxAmount)}</Text>
                </Flex>
                <Flex justify="space-between" py={3} borderBottom="3px solid" borderColor="brand.500">
                  <Text fontSize="lg" fontWeight="bold">Total Amount:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="brand.500">
                    {currencyFormat(totalAmount)}
                  </Text>
                </Flex>
              </Box>
            </Flex>

            {/* Payment Terms */}
            <Box mb="30px">
              <Text fontSize="md" fontWeight="bold" mb="10px">
                Payment Terms:
              </Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  • Payment due within 30 days of invoice date
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Late payments may incur additional charges
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • All payments should be made in INR
                </Text>
              </VStack>
            </Box>

            {/* Bank Details */}
            <Box mb="30px">
              <Text fontSize="md" fontWeight="bold" mb="10px">
                Bank Details:
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="600">Bank Name:</Text> HDFC Bank
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="600">Account Name:</Text> HaloGig Technologies
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="600">Account Number:</Text> 1234567890
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="600">IFSC Code:</Text> HDFC0001234
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="600">Branch:</Text> Electronic City
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="600">Swift Code:</Text> HDFCINBB
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Footer */}
            <Box pt="20px" borderTop="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Thank you for your business! For any queries, please contact us at support@halogig.com
              </Text>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
