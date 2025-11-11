import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  Select,
  FormControl,
  FormLabel,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  Image,
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
  saveSaleOrderInvoiceInformation,
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

const buildFinancialYears = (count = 6) => {
  const years = [];
  const now = new Date();
  // Indian FY: April to March
  const currentFYStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  for (let i = 0; i < count; i++) {
    const start = currentFYStartYear - i;
    const startTwo = String(start % 100).padStart(2, '0');
    const end = String((start + 1) % 100).padStart(2, '0');
    years.push(`${startTwo}-${end}`);
  }
  return years;
};

const overrideSalesOrderNoWithFY = (saleOrderNo, fy) => {
  if (!saleOrderNo) return '';
  const idx = saleOrderNo.lastIndexOf('/');
  if (idx === -1) return `${saleOrderNo}/${fy}`;
  const prefix = saleOrderNo.substring(0, idx + 1);
  return `${prefix}${fy}`;
};

export default function SalesOrder() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const invoiceRef = useRef(null);
  const { milestoneId, projectbidId } = useParams();

  const [billingInfo, setBillingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [financialYear, setFinancialYear] = useState('');

  // Redux state for save invoice
  const { isSavingInvoice, saveInvoiceSuccess, saveInvoiceError } = useSelector(
    (state) => state.projectBidsReducer
  );

  const fyOptions = useMemo(() => buildFinancialYears(8), []);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.800');

  // Handle success/error states
  useEffect(() => {
    if (saveInvoiceSuccess) {
      showSuccess('Sales Order created successfully!');
      dispatch(clearSaveInvoiceState());
    }
    if (saveInvoiceError) {
      showError('Failed to create sales order');
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
        showError('Sales order element not found');
        return;
      }

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`SalesOrder.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Failed to generate PDF');
    }
  };

  const handleCreateOrder = async () => {
    if (!billingInfo) {
      showError('Billing information not available');
      return;
    }

    try {
      // Generate PDF
      const element = invoiceRef.current;
      if (!element) {
        showError('Sales order element not found');
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
      formData.append('file', pdfBlob, 'sales-order.pdf');
      formData.append('fileType', 'sale-order');
      formData.append('jsonDetails', JSON.stringify(billingInfo));

      // Call API
      await dispatch(saveSaleOrderInvoiceInformation(formData));
    } catch (error) {
      console.error('Error creating order:', error);
      showError('Failed to create sales order');
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Box>
    );
  }

  if (!billingInfo) {
    return (
      <Box>
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

  const displaySaleOrderNo = financialYear
    ? overrideSalesOrderNoWithFY(sale.sale_order_no, financialYear)
    : sale.sale_order_no;

  return (
    <Box>
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
                  <Text>Sales Order</Text>
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
              <FormControl minW="160px">
                <FormLabel fontSize="sm">Financial Year</FormLabel>
                <Select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  placeholder="Select FY"
                  size="sm"
                >
                  {fyOptions.map((fy) => (
                    <option key={fy} value={fy}>
                      {fy}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button
                leftIcon={<MdGetApp />}
                colorScheme="brand"
                variant="outline"
                onClick={handleDownloadPDF}
              >
                Download Sales Order
              </Button>
              <Button
                leftIcon={<MdSave />}
                colorScheme="brand"
                onClick={handleCreateOrder}
                isLoading={isSavingInvoice}
                loadingText="Creating Order..."
              >
                Create Order
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Card>

      {/* Sales Order Content */}
      <Card bg={cardBg}>
        <Box p="24px">
          <Box ref={invoiceRef} bg="white" p="40px" color="black">
            {/* Header */}
            <Flex justify="space-between" align="start" mb="40px">
              <VStack align="start" spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  SALES ORDER
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Order No: {displaySaleOrderNo || '--'}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Date: {new Date().toLocaleDateString('en-IN')}
                </Text>
              </VStack>
              <Box textAlign="right">
                <Text fontSize="lg" fontWeight="bold">
                  HaloGig Technologies
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Your Technology Partner
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
                    Duration: {project.project_duration_min && project.project_duration_max
                      ? `${project.project_duration_min} - ${project.project_duration_max} days`
                      : '--'}
                  </Text>
                </VStack>
              </VStack>
            </SimpleGrid>

            {/* Milestone Details */}
            <Box mb="40px">
              <Text fontSize="lg" fontWeight="bold" color="brand.500" mb="20px">
                Milestone Details:
              </Text>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th borderColor="gray.200">Description</Th>
                    <Th borderColor="gray.200" textAlign="center">Hours</Th>
                    <Th borderColor="gray.200" textAlign="right">Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td borderColor="gray.200">{sale.milestone_scope || 'Milestone Work'}</Td>
                    <Td borderColor="gray.200" textAlign="center">{sale.milestone_hours || '--'}</Td>
                    <Td borderColor="gray.200" textAlign="right" fontWeight="600">
                      {currencyFormat(sale.milestone_amount)}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>

            {/* Total */}
            <Flex justify="flex-end" mb="40px">
              <Box minW="200px">
                <Flex justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontWeight="600">Subtotal:</Text>
                  <Text fontWeight="600">{currencyFormat(sale.milestone_amount)}</Text>
                </Flex>
                <Flex justify="space-between" py={2} borderBottom="2px solid" borderColor="brand.500">
                  <Text fontSize="lg" fontWeight="bold">Total:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="brand.500">
                    {currencyFormat(sale.milestone_amount)}
                  </Text>
                </Flex>
              </Box>
            </Flex>

            {/* Terms */}
            <Box>
              <Text fontSize="md" fontWeight="bold" mb="10px">
                Terms & Conditions:
              </Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  • Payment terms: As per milestone completion
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • All work will be delivered as per agreed timeline
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Any changes in scope will be charged separately
                </Text>
              </VStack>
            </Box>

            {/* Footer */}
            <Box mt="40px" pt="20px" borderTop="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Thank you for your business!
              </Text>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
