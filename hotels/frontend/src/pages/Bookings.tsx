

import PreviousBookingForm from '@/components/PreviousBookingForm';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Search,
  FileText,
  X,
  Loader2,
  Edit,
  Save,
  Ban,
  Wrench,
  RefreshCw,
  Calendar as CalendarIcon,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle,
  Clock,
  Plus,
  BarChart,
  AlertCircle,
  Building2,
  Eye,
  Users,
  IndianRupee,
  Percent,
  Home,
  CalendarDays,
  Clock3,
  CreditCard,
  Smartphone,
  Mail,
  Phone,
  User,
  Hash,
  Tag,
  MapPin,
  FileText as FileTextIcon,
  Printer,
  Info,
  ChevronRight,
  ChevronLeft,
  XCircle
} from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';
import QuotationForm from '@/components/QuotationForm';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { isAdmin } from '@/lib/permissions';

// URLs
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzd7E4FNEstLaGqYv-YTB8IElh648K1oiQNPzWGQlsa_3DP8-Bno7OrPnL83XZ0bK7V/exec';
const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ===========================================
// INTERFACES
// ===========================================

interface Booking {
  bookingId: string;
  roomId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  roomNumber: string | number;
  fromDate: string;
  toDate: string;
  status: string;
  amount: number;
  service: number;
  gst: number;
  total: number;
  createdAt: string;
  fromTime?: string;
  toTime?: string;
  source?: string;
  rawFromDate?: string;
  rawToDate?: string;
  invoiceNumber?: string;
}

interface FunctionBooking {
  id: number;
  booking_reference: string;
  event_name: string;
  event_type: string;
  booking_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  function_room_id: number;
  room_name: string;
  room_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  advance_paid: number;
  balance_due: number;
  status: string;
  payment_status: string;
  guests_expected: number;
  has_room_bookings: boolean;
  total_rooms_booked: number;
  created_at: string;
  subtotal?: number;
  gst?: number;
  discount?: number;
  other_charges?: number;
  gst_percentage?: number;
  special_requests?: string;
  catering_requirements?: string;
  room_bookings?: any[];
}

interface Quotation {
  _uniqueRowId: string;
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_phone: string;
  room_number: string;
  from_date: string;
  to_date: string;
  nights: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted';
  expiry_date: string;
  created_at: string;
  room_type?: string;
  created_by_name?: string;
}

// ===========================================
// MAIN COMPONENT
// ===========================================

const Bookings = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [currentUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  });

  const spreadsheetId = currentUser?.spreadsheetId;
  const userSource = currentUser?.source;
  const userPlan = currentUser?.plan;

  // ===========================================
  // STATE VARIABLES
  // ===========================================

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Booking>>({});
  const [fromDateCalendarOpen, setFromDateCalendarOpen] = useState(false);
  const [toDateCalendarOpen, setToDateCalendarOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [showPreviousBookingForm, setShowPreviousBookingForm] = useState(false);

  // Function Bookings state
  const [functionBookings, setFunctionBookings] = useState<FunctionBooking[]>([]);
  const [loadingFunctionBookings, setLoadingFunctionBookings] = useState(false);
  const [functionSearchTerm, setFunctionSearchTerm] = useState('');
  const [selectedFunctionBooking, setSelectedFunctionBooking] = useState<FunctionBooking | null>(null);
  const [showFunctionBookingDetails, setShowFunctionBookingDetails] = useState(false);

  // ADD THESE TWO NEW LINES 👇
  const [editingFunctionBookingId, setEditingFunctionBookingId] = useState<number | null>(null);
  const [functionEditForm, setFunctionEditForm] = useState<Partial<FunctionBooking>>({});
  const [showFunctionInvoiceModal, setShowFunctionInvoiceModal] = useState(false);
  const [selectedFunctionInvoiceData, setSelectedFunctionInvoiceData] = useState<any>(null);

  // Quotations state
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [quotationSearchTerm, setQuotationSearchTerm] = useState('');
  const [selectedQuotationStatus, setSelectedQuotationStatus] = useState<string>('all');

  // Tab state
  const [activeTab, setActiveTab] = useState<'bookings' | 'function-bookings' | 'quotations'>('bookings');

  // Calendar filter states for bookings
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined
  });
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Report states
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportDateRange, setReportDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Check if current user is admin
  const isUserAdmin = isAdmin();
  const isProUser = userSource === 'database' || userPlan === 'pro';


  // Add this after your state declarations (around line 200)
  useEffect(() => {
    console.log('📊 Bookings updated - Total:', bookings.length);
    console.log('📊 Completed bookings:', bookings.filter(b => b.status === 'completed').length);
    console.log('📊 Booked bookings:', bookings.filter(b => b.status === 'booked').length);
    console.log('📊 Current status filter:', selectedStatus);
  }, [bookings, selectedStatus]);

  // ===========================================
  // HELPER FUNCTIONS
  // ===========================================

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('🔍 Current auth token:', token ? `${token.substring(0, 20)}...` : 'No token');
  }, []);

  const formatDate = (value: any) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      return !isNaN(date.getTime())
        ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : value;
    } catch {
      return value;
    }
  };

  const formatTime = (value: any) => {
    if (!value) return '';
    try {
      const date = new Date(`2000-01-01T${value}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      return value;
    } catch {
      return value;
    }
  };

  const formatDateForInput = (value: any): string => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return value;
    } catch {
      return value;
    }
  };

  const formatDateForDisplay = (value: any): string => {
    if (!value) return '';
    try {
      const date = new Date(value);
      return !isNaN(date.getTime())
        ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : value;
    } catch {
      return value;
    }
  };

  const parseAmount = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^\d.-]/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const formatCurrency = (amount: number): string => {
    return '₹' + (amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // ===========================================
  // API FUNCTIONS
  // ===========================================

  // JSONP loader for Google Sheets
  const loadScript = (src: string) =>
    new Promise<any>((resolve, reject) => {
      const callbackName = 'cb_' + Date.now();
      (window as any)[callbackName] = (data: any) => {
        resolve(data);
        delete (window as any)[callbackName];
        const script = document.getElementById(callbackName);
        if (script && script.parentNode) script.parentNode.removeChild(script);
      };
      const script = document.createElement('script');
      script.src = src + (src.includes('?') ? '&' : '?') + 'callback=' + callbackName;
      script.id = callbackName;
      script.onerror = () => {
        reject(new Error('Failed to load script'));
        delete (window as any)[callbackName];
        if (script && script.parentNode) script.parentNode.removeChild(script);
      };
      document.body.appendChild(script);
    });

  // Backend request helper
  async function fetchBackendRequest(endpoint: string, data?: any, method: string = 'GET'): Promise<any> {
    const token = localStorage.getItem('authToken');

    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${NODE_BACKEND_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }

  // ===========================================
  // FETCH BOOKINGS
  // ===========================================

  const fetchFromBackend = async (): Promise<Booking[]> => {
    try {
      const data = await fetchBackendRequest('/bookings');

      const transformedBookings = data.data.map((booking: any) => {
        const amount = parseAmount(booking.amount);
        const service = parseAmount(booking.service);
        const gst = parseAmount(booking.gst);
        const total = parseAmount(booking.total) || Math.round((amount + service + gst) * 100) / 100;

        const bookingId = booking?.id?.toString() || `booking-${Date.now()}-${Math.random()}`;
        const roomId = booking?.room_id?.toString() || '';
        const customerId = booking?.customer_id?.toString() || '';
        const roomNumber = booking?.room_number || '';

        let customerName = 'Unknown Customer';
        if (booking?.customer_name) {
          customerName = booking.customer_name;
        } else if (booking?.customerName) {
          customerName = booking.customerName;
        }

        return {
          id: bookingId,
          bookingId: bookingId,
          roomId: roomId,
          invoiceNumber: booking?.invoice_number || `INV-${Date.now().toString().slice(-6)}-${booking.id}`,
          customerId: customerId,
          customerName: customerName,
          customerPhone: booking?.customer_phone || booking?.phone || '',
          roomNumber: roomNumber,
          fromDate: formatDateForDisplay(booking?.from_date),
          toDate: formatDateForDisplay(booking?.to_date),
          fromTime: formatTime(booking?.from_time),
          toTime: formatTime(booking?.to_time),
          status: booking?.status || 'booked',
          amount,
          service,
          gst,
          total,
          createdAt: formatDateForDisplay(booking?.created_at || new Date().toISOString()),
          source: 'database',
          rawFromDate: booking?.from_date,
          rawToDate: booking?.to_date
        } as Booking;
      });

      return transformedBookings;
    } catch (error) {
      console.error('Error fetching from backend:', error);
      throw error;
    }
  };

  const fetchFromGoogleSheets = async (): Promise<Booking[]> => {
    if (!spreadsheetId) return [];

    try {
      const url = `${APPS_SCRIPT_URL}?action=getBookings&spreadsheetid=${encodeURIComponent(
        spreadsheetId
      )}`;
      const data = await loadScript(url);

      if (Array.isArray(data.bookings)) {
        const formatted = data.bookings.map((b: any) => {
          const record = Object.keys(b).reduce((acc: any, key: string) => {
            acc[key.trim().toLowerCase()] = b[key];
            return acc;
          }, {});

          const amount = parseAmount(record.amount);
          const service = parseAmount(record.service);
          const gst = parseAmount(record.gst);
          const total =
            parseAmount(record.total) || Math.round((amount + service + gst) * 100) / 100;

          return {
            id: record.bookingid,
            bookingId: record.bookingid,
            roomId: record.roomid,
            customerId: record.customerid,
            customerName: record.customername,
            customerPhone: record.customerphone?.toString(),
            roomNumber: record.roomnumber,
            fromDate: formatDate(record.fromdate),
            toDate: formatDate(record.todate),
            fromTime: formatTime(record.fromtime),
            toTime: formatTime(record.totime),
            status: record.status,
            amount,
            service,
            gst,
            total,
            createdAt: formatDate(record.createdat || record.created_at),
            source: 'google_sheets'
          } as Booking;
        });

        return formatted;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading bookings from Google Sheets:', error);
      throw error;
    }
  };

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let bookingsData: Booking[] = [];

      if (isProUser) {
        bookingsData = await fetchFromBackend();
      } else {
        bookingsData = await fetchFromGoogleSheets();
      }

      setBookings(bookingsData);

      if (isRefresh) {
        toast({
          title: "Success",
          description: `Bookings refreshed successfully (${bookingsData.length} bookings)`
        });
      }

    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: `Failed to load bookings: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ===========================================
  // FETCH FUNCTION BOOKINGS
  // ===========================================

  const fetchFunctionBookings = async () => {
    if (!isProUser) return;

    try {
      setLoadingFunctionBookings(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${NODE_BACKEND_URL}/function-rooms/bookings/with-rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        const transformedBookings = result.data.map((booking: any) => ({
          id: booking.id,
          booking_reference: booking.booking_reference,
          event_name: booking.event_name,
          event_type: booking.event_type,
          booking_date: formatDateForDisplay(booking.booking_date),
          end_date: formatDateForDisplay(booking.end_date || booking.booking_date),
          start_time: formatTime(booking.start_time),
          end_time: formatTime(booking.end_time),
          function_room_id: booking.function_room_id,
          room_name: booking.room_name || 'N/A',
          room_number: booking.room_number || 'N/A',
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          customer_email: booking.customer_email || '',
          total_amount: booking.total_amount,
          advance_paid: booking.advance_paid || 0,
          balance_due: (booking.total_amount - (booking.advance_paid || 0)),
          status: booking.status,
          payment_status: booking.payment_status,
          guests_expected: booking.guests_expected,
          has_room_bookings: booking.has_room_bookings || false,
          total_rooms_booked: booking.total_rooms_booked || 0,
          subtotal: booking.subtotal,
          gst: booking.gst,
          discount: booking.discount,
          other_charges: booking.other_charges,
          gst_percentage: booking.gst_percentage || 18,
          special_requests: booking.special_requests,
          catering_requirements: booking.catering_requirements,
          room_bookings: booking.room_bookings || [],
          created_at: formatDateForDisplay(booking.created_at)
        }));

        setFunctionBookings(transformedBookings);
      }
    } catch (error) {
      console.error('❌ Error fetching function bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load function bookings",
        variant: "destructive"
      });
    } finally {
      setLoadingFunctionBookings(false);
    }
  };

  // ===========================================
  // FETCH QUOTATIONS
  // ===========================================

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${NODE_BACKEND_URL}/quotations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Quotations response:', data);

      if (data.success && Array.isArray(data.data)) {
        const uniqueQuotations = [];
        const seenIds = new Set();

        data.data.forEach((quotation, index) => {
          const baseId = quotation.id || quotation.quotation_number || `quotation-${index}`;
          let uniqueId = baseId;

          if (seenIds.has(uniqueId)) {
            uniqueId = `${baseId}-dup-${Date.now()}-${index}`;
          }

          seenIds.add(uniqueId);
          uniqueQuotations.push({
            ...quotation,
            _uniqueRowId: uniqueId
          });
        });

        setQuotations(uniqueQuotations);
      } else {
        console.error('Failed to fetch quotations:', data);
        setQuotations([]);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive"
      });
    }
  };

  // ===========================================
  // FUNCTION BOOKING INVOICE
  // ===========================================

  // const downloadFunctionBookingInvoice = async (bookingId: number, bookingReference: string) => {
  //   try {
  //     const token = localStorage.getItem('authToken');

  //     toast({
  //       title: "Generating Invoice",
  //       description: "Please wait while we generate the function booking invoice...",
  //       duration: 2000
  //     });

  //     const response = await fetch(`${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}/invoice`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Accept': 'application/pdf'
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to download invoice: ${response.status}`);
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `function-booking-invoice-${bookingReference}.pdf`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);

  //     toast({
  //       title: "✅ Invoice Downloaded",
  //       description: "Function booking invoice has been downloaded successfully",
  //       duration: 3000
  //     });

  //   } catch (error: any) {
  //     console.error('❌ Error downloading function booking invoice:', error);
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to download invoice",
  //       variant: "destructive",
  //       duration: 5000
  //     });
  //   }
  // };

  const getFunctionBookingInvoiceData = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}/invoice/json`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching function invoice data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive"
      });
      return null;
    }
  };

  // Download function booking invoice as PDF
  // const downloadFunctionBookingInvoicePDF = (bookingId: number, bookingReference: string) => {
  //   const token = localStorage.getItem('authToken');
  //   const url = `${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}/invoice/pdf`;

  //   toast({
  //     title: "Generating Invoice",
  //     description: "Please wait while we generate the PDF...",
  //     duration: 2000
  //   });

  //   // Open in new tab for download
  //   window.open(url, '_blank');
  // };
  // Download function booking invoice as PDF
  const downloadFunctionBookingInvoicePDF = async (bookingId: number, bookingReference: string) => {
    try {
      const token = localStorage.getItem('authToken');

      console.log('🔐 Token being sent:', token ? 'Token exists' : 'No token found');

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token found. Please login again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Generating Invoice",
        description: "Please wait while we generate the PDF...",
        duration: 2000
      });

      const url = `${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}/invoice/pdf`;
      console.log('📡 Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          throw new Error(errorData.message || `Failed to download invoice: ${response.status}`);
        } else {
          const errorText = await response.text();
          console.error('❌ Error text:', errorText);
          throw new Error(`Failed to download invoice: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }

      // Check if response is PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        console.warn('⚠️ Response is not PDF:', contentType);
        const text = await response.text();
        console.error('Response content:', text.substring(0, 200));
        throw new Error('Response is not a PDF file');
      }

      const blob = await response.blob();
      console.log('📦 Blob received:', { size: blob.size, type: blob.type });

      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Create download link
      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObject;
      link.download = `function-booking-invoice-${bookingReference}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlObject);

      toast({
        title: "✅ Invoice Downloaded",
        description: "Function booking invoice has been downloaded successfully",
        duration: 3000
      });

    } catch (error: any) {
      console.error('❌ Error downloading function booking invoice:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Add this function in your Bookings component
  const downloadFunctionInvoiceHTML = async (bookingId, bookingReference) => {
    try {
      const token = localStorage.getItem('authToken');

      toast({
        title: "Generating Invoice",
        description: "Please wait while we generate the invoice...",
        duration: 2000
      });

      const response = await fetch(
        `${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}/invoice/html`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/html'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download invoice: ${response.status} ${errorText}`);
      }

      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `function-invoice-${bookingReference}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Invoice Downloaded",
        description: "Function booking invoice has been downloaded successfully as HTML",
        duration: 3000
      });

    } catch (error) {
      console.error('❌ Error downloading function invoice HTML:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Get function booking invoice info
  const getFunctionBookingInvoiceInfo = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}/invoice/info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoice info');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching function invoice info:', error);
      return null;
    }
  };

  // Show invoice in modal
  const showFunctionInvoiceModalWithData = async (bookingId: number) => {
    const data = await getFunctionBookingInvoiceData(bookingId);
    if (data) {
      setSelectedFunctionInvoiceData(data);
      setShowFunctionInvoiceModal(true);
    }
  };

  // ===========================================
  // VIEW FUNCTION BOOKING DETAILS
  // ===========================================

  const viewFunctionBookingDetails = (booking: FunctionBooking) => {
    setSelectedFunctionBooking(booking);
    setShowFunctionBookingDetails(true);
  };

  // ===========================================
  // DELETE BOOKING
  // ===========================================

  const deleteBooking = async (bookingId: string) => {
    if (!isUserAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete bookings",
        variant: "destructive"
      });
      return false;
    }

    if (!isProUser) {
      toast({
        title: "Not Available",
        description: "Delete function is only available for Pro Plan users",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await fetchBackendRequest(`/bookings/${bookingId}`, null, 'DELETE');

      if (result.success) {
        setBookings(prev => prev.filter(booking => booking.bookingId !== bookingId));
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('❌ Error deleting booking:', error);
      throw error;
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

    try {
      const success = await deleteBooking(bookingId);
      if (success) {
        toast({
          title: "Success",
          description: "Booking deleted successfully"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive"
      });
    }
  };

  // ===========================================
  // DOWNLOAD INVOICE
  // ===========================================

  const downloadInvoice = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('authToken');

      toast({
        title: "Generating Invoice",
        description: "Please wait while we generate your invoice...",
        duration: 2000
      });

      const response = await fetch(`${NODE_BACKEND_URL}/bookings/${bookingId}/invoice/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download invoice: ${response.status} ${errorText}`);
      }

      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${bookingId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Invoice Downloaded",
        description: "Invoice has been downloaded successfully as HTML file",
        duration: 3000
      });

    } catch (error: any) {
      console.error('❌ Error downloading invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // ===========================================
  // BLOCK/MAINTENANCE REPORTS
  // ===========================================

  const downloadBlockPDF = async (bookingId: string) => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem('authToken');

      toast({
        title: "Generating Block Report",
        description: "Please wait while we generate the block report...",
        duration: 2000
      });

      const response = await fetch(`${NODE_BACKEND_URL}/bookings/block/${bookingId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download block report: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `block-report-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Block Report Downloaded",
        description: "Block room report has been downloaded successfully",
        duration: 3000
      });

    } catch (error: any) {
      console.error('❌ Error downloading block report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download block report",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setReportLoading(false);
    }
  };

  const downloadMaintenancePDF = async (bookingId: string) => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem('authToken');

      toast({
        title: "Generating Maintenance Report",
        description: "Please wait while we generate the maintenance report...",
        duration: 2000
      });

      const response = await fetch(`${NODE_BACKEND_URL}/bookings/maintenance/${bookingId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to download PDF`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.substring(0, 200);
          }
        } catch (e) { }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance-report-${bookingId}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Success",
        description: "Maintenance report downloaded successfully",
        duration: 3000
      });

    } catch (error: any) {
      console.error('❌ Error downloading maintenance PDF:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download maintenance report: ${error.message}`,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setReportLoading(false);
    }
  };

  const downloadCombinedReport = async (startDate?: string, endDate?: string) => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem('authToken');
      let url = `${NODE_BACKEND_URL}/bookings/combined-report/pdf`;

      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      toast({
        title: "Generating Combined Report",
        description: "Please wait while we generate the combined report...",
        duration: 2000
      });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download combined report: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObject;
      link.download = startDate && endDate
        ? `room-status-report-${startDate}-to-${endDate}.pdf`
        : `room-status-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlObject);

      toast({
        title: "✅ Combined Report Downloaded",
        description: "Combined report has been downloaded successfully",
        duration: 3000
      });

    } catch (error: any) {
      console.error('❌ Error downloading combined report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download combined report",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setReportLoading(false);
    }
  };

  // ===========================================
  // UPDATE BOOKING
  // ===========================================

  // const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
  //   try {
  //     let result;

  //     const currentBooking = bookings.find(b => b.bookingId === bookingId);
  //     if (!currentBooking) {
  //       toast({
  //         title: 'Error',
  //         description: 'Booking not found',
  //         variant: 'destructive',
  //       });
  //       return false;
  //     }

  //     const backendUpdates: any = {};

  //     if (updates.amount !== undefined) backendUpdates.amount = updates.amount;
  //     if (updates.service !== undefined) backendUpdates.service = updates.service;
  //     if (updates.gst !== undefined) backendUpdates.gst = updates.gst;
  //     if (updates.total !== undefined) backendUpdates.total = updates.total;
  //     if (updates.status !== undefined) backendUpdates.status = updates.status;

  //     if (updates.fromDate !== undefined) {
  //       const date = new Date(updates.fromDate);
  //       if (!isNaN(date.getTime())) {
  //         backendUpdates.from_date = date.toISOString().split('T')[0];
  //       }
  //     }

  //     if (updates.toDate !== undefined) {
  //       const date = new Date(updates.toDate);
  //       if (!isNaN(date.getTime())) {
  //         backendUpdates.to_date = date.toISOString().split('T')[0];
  //       }
  //     }

  //     if (updates.fromTime !== undefined) backendUpdates.from_time = updates.fromTime;
  //     if (updates.toTime !== undefined) backendUpdates.to_time = updates.toTime;

  //     if (updates.customerName !== undefined) backendUpdates.customer_name = updates.customerName;
  //     if (updates.customerPhone !== undefined) backendUpdates.customer_phone = updates.customerPhone;

  //     console.log('📤 Sending to backend:', backendUpdates);

  //     if (isProUser) {
  //       result = await fetchBackendRequest(`/bookings/${bookingId}`, backendUpdates, 'PUT');
  //     } else {
  //       if (!spreadsheetId) throw new Error('No spreadsheet ID found');

  //       const url = `${APPS_SCRIPT_URL}?action=updatebooking&spreadsheetid=${encodeURIComponent(spreadsheetId)}`;
  //       const updateData = {
  //         bookingId,
  //         ...updates
  //       };

  //       result = await loadScript(url + '&' + new URLSearchParams(updateData as any).toString());
  //     }

  //     if (result.success) {
  //       setBookings(prev => prev.map(booking => {
  //         if (booking.bookingId === bookingId) {
  //           const updatedBooking = { ...booking, ...updates };

  //           if (updates.fromDate !== undefined) {
  //             updatedBooking.fromDate = formatDateForDisplay(updates.fromDate);
  //             updatedBooking.rawFromDate = updates.fromDate;
  //           }

  //           if (updates.toDate !== undefined) {
  //             updatedBooking.toDate = formatDateForDisplay(updates.toDate);
  //             updatedBooking.rawToDate = updates.toDate;
  //           }

  //           if (updates.customerName !== undefined) updatedBooking.customerName = updates.customerName;
  //           if (updates.customerPhone !== undefined) updatedBooking.customerPhone = updates.customerPhone;
  //           if (updates.fromTime !== undefined) updatedBooking.fromTime = updates.fromTime;
  //           if (updates.toTime !== undefined) updatedBooking.toTime = updates.toTime;
  //           if (updates.status !== undefined) updatedBooking.status = updates.status;
  //           if (updates.amount !== undefined) updatedBooking.amount = updates.amount;
  //           if (updates.service !== undefined) updatedBooking.service = updates.service;
  //           if (updates.gst !== undefined) updatedBooking.gst = updates.gst;
  //           if (updates.total !== undefined) updatedBooking.total = updates.total;

  //           return updatedBooking;
  //         }
  //         return booking;
  //       }));

  //       toast({
  //         title: 'Success',
  //         description: 'Booking and customer details updated successfully.',
  //       });

  //       return true;
  //     } else {
  //       throw new Error(result.error || 'Failed to update booking');
  //     }
  //   } catch (error) {
  //     console.error('❌ Error updating booking:', error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to update booking.',
  //       variant: 'destructive',
  //     });
  //     return false;
  //   }
  // };

  // In Bookings component - updateBooking function
  // const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
  //   try {
  //     let result;

  //     const currentBooking = bookings.find(b => b.bookingId === bookingId);
  //     if (!currentBooking) {
  //       toast({
  //         title: 'Error',
  //         description: 'Booking not found',
  //         variant: 'destructive',
  //       });
  //       return false;
  //     }

  //     const backendUpdates: any = {};

  //     if (updates.amount !== undefined) backendUpdates.amount = updates.amount;
  //     if (updates.service !== undefined) backendUpdates.service = updates.service;
  //     if (updates.gst !== undefined) backendUpdates.gst = updates.gst;
  //     if (updates.total !== undefined) backendUpdates.total = updates.total;
  //     if (updates.status !== undefined) backendUpdates.status = updates.status;

  //     // IMPORTANT: Include room_id to update room status on completion
  //     if (updates.status === 'completed' || updates.status === 'cancelled') {
  //       backendUpdates.room_id = currentBooking.roomId;
  //     }

  //     if (updates.fromDate !== undefined) {
  //       const date = new Date(updates.fromDate);
  //       if (!isNaN(date.getTime())) {
  //         backendUpdates.from_date = date.toISOString().split('T')[0];
  //       }
  //     }

  //     if (updates.toDate !== undefined) {
  //       const date = new Date(updates.toDate);
  //       if (!isNaN(date.getTime())) {
  //         backendUpdates.to_date = date.toISOString().split('T')[0];
  //       }
  //     }

  //     if (updates.fromTime !== undefined) backendUpdates.from_time = updates.fromTime;
  //     if (updates.toTime !== undefined) backendUpdates.to_time = updates.toTime;
  //     if (updates.customerName !== undefined) backendUpdates.customer_name = updates.customerName;
  //     if (updates.customerPhone !== undefined) backendUpdates.customer_phone = updates.customerPhone;

  //     console.log('📤 Sending to backend:', backendUpdates);

  //     if (isProUser) {
  //       result = await fetchBackendRequest(`/bookings/${bookingId}`, backendUpdates, 'PUT');
  //     } else {
  //       if (!spreadsheetId) throw new Error('No spreadsheet ID found');
  //       const url = `${APPS_SCRIPT_URL}?action=updatebooking&spreadsheetid=${encodeURIComponent(spreadsheetId)}`;
  //       const updateData = { bookingId, ...updates };
  //       result = await loadScript(url + '&' + new URLSearchParams(updateData as any).toString());
  //     }

  //     if (result.success) {
  //       // Update local state
  //       setBookings(prev => prev.map(booking => {
  //         if (booking.bookingId === bookingId) {
  //           const updatedBooking = { ...booking, ...updates };

  //           if (updates.fromDate !== undefined) {
  //             updatedBooking.fromDate = formatDateForDisplay(updates.fromDate);
  //             updatedBooking.rawFromDate = updates.fromDate;
  //           }

  //           if (updates.toDate !== undefined) {
  //             updatedBooking.toDate = formatDateForDisplay(updates.toDate);
  //             updatedBooking.rawToDate = updates.toDate;
  //           }

  //           if (updates.customerName !== undefined) updatedBooking.customerName = updates.customerName;
  //           if (updates.customerPhone !== undefined) updatedBooking.customerPhone = updates.customerPhone;
  //           if (updates.fromTime !== undefined) updatedBooking.fromTime = updates.fromTime;
  //           if (updates.toTime !== undefined) updatedBooking.toTime = updates.toTime;
  //           if (updates.status !== undefined) updatedBooking.status = updates.status;
  //           if (updates.amount !== undefined) updatedBooking.amount = updates.amount;
  //           if (updates.service !== undefined) updatedBooking.service = updates.service;
  //           if (updates.gst !== undefined) updatedBooking.gst = updates.gst;
  //           if (updates.total !== undefined) updatedBooking.total = updates.total;

  //           return updatedBooking;
  //         }
  //         return booking;
  //       }));

  //       // ✅ IMPORTANT: Force refresh rooms data when status changes to completed/cancelled
  //       if (updates.status === 'completed' || updates.status === 'cancelled') {
  //         // If you have a context or global state for rooms, update it
  //         // Or trigger a refresh of the RoomBooking page data
  //         toast({
  //           title: 'Success',
  //           description: `Booking marked as ${updates.status}. Room is now available.`,
  //         });

  //         // Optional: Dispatch a custom event that RoomBooking component can listen to
  //         window.dispatchEvent(new CustomEvent('booking-status-changed', { 
  //           detail: { 
  //             roomId: currentBooking.roomId,
  //             status: updates.status 
  //           } 
  //         }));
  //       } else {
  //         toast({
  //           title: 'Success',
  //           description: 'Booking and customer details updated successfully.',
  //         });
  //       }

  //       return true;
  //     } else {
  //       throw new Error(result.error || 'Failed to update booking');
  //     }
  //   } catch (error) {
  //     console.error('❌ Error updating booking:', error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to update booking.',
  //       variant: 'destructive',
  //     });
  //     return false;
  //   }
  // };


  // In Bookings component - updateBooking function
  // ===========================================
  // UPDATE BOOKING
  // ===========================================

  // In Bookings component - replace your entire updateBooking function with this:
 const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
  try {
    console.log('='.repeat(50));
    console.log('📤 SENDING UPDATE TO BACKEND');
    console.log('='.repeat(50));
    console.log('Booking ID:', bookingId);
    console.log('Updates being sent:', JSON.stringify(updates, null, 2));
    console.log('Auth Token exists:', !!localStorage.getItem('authToken'));
    console.log('Backend URL:', NODE_BACKEND_URL);
    
    const currentBooking = bookings.find(b => b.bookingId === bookingId);
    console.log('Current booking:', currentBooking);
    
    // Build backend updates
    const backendUpdates: any = {};
    
    if (updates.amount !== undefined) backendUpdates.amount = updates.amount;
    if (updates.service !== undefined) backendUpdates.service = updates.service;
    if (updates.gst !== undefined) backendUpdates.gst = updates.gst;
    if (updates.total !== undefined) backendUpdates.total = updates.total;
    if (updates.status !== undefined) backendUpdates.status = updates.status;
    
    if (updates.status === 'completed' || updates.status === 'cancelled') {
      backendUpdates.room_id = currentBooking?.roomId;
    }
    
    if (updates.fromDate !== undefined) {
      const date = new Date(updates.fromDate);
      if (!isNaN(date.getTime())) {
        backendUpdates.from_date = date.toISOString().split('T')[0];
      }
    }
    
    if (updates.toDate !== undefined) {
      const date = new Date(updates.toDate);
      if (!isNaN(date.getTime())) {
        backendUpdates.to_date = date.toISOString().split('T')[0];
      }
    }
    
    if (updates.fromTime !== undefined) backendUpdates.from_time = updates.fromTime;
    if (updates.toTime !== undefined) backendUpdates.to_time = updates.toTime;
    if (updates.customerName !== undefined) backendUpdates.customer_name = updates.customerName;
    if (updates.customerPhone !== undefined) backendUpdates.customer_phone = updates.customerPhone;
    
    console.log('📤 FINAL BACKEND UPDATE PAYLOAD:', JSON.stringify(backendUpdates, null, 2));
    console.log('📤 Sending to URL:', `${NODE_BACKEND_URL}/bookings/${bookingId}`);

    let result;
    
    if (isProUser) {
      // Use fetch directly to get better error handling
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${NODE_BACKEND_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendUpdates)
      });
      
      // Try to parse the response
      const responseData = await response.json();
      
      if (!response.ok) {
        // Check if it's a duplicate booking error
        if (responseData.error === 'DUPLICATE_BOOKING' || responseData.message?.includes('already exists')) {
          console.log('❌ DUPLICATE BOOKING DETECTED:', responseData);
          
          // Show detailed toast with existing booking info
          if (responseData.data) {
            toast({
              title: "Room Already Booked",
              description: `This room is already booked for ${responseData.data.from_date} to ${responseData.data.to_date} by ${responseData.data.customer_name || 'another customer'}`,
              variant: "destructive",
              duration: 5000
            });
          } else {
            toast({
              title: "Room Not Available",
              description: responseData.message || "This room is already booked for the selected dates",
              variant: "destructive"
            });
          }
          return false;
        }
        
        // Check if it's a room availability error
        if (responseData.error === 'ROOM_NOT_AVAILABLE') {
          console.log('❌ ROOM NOT AVAILABLE:', responseData);
          toast({
            title: "Room Not Available",
            description: responseData.message || "This room is already booked for the selected dates",
            variant: "destructive"
          });
          return false;
        }
        
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }
      
      result = responseData;
    } else {
      // Google Sheets fallback
      if (!spreadsheetId) throw new Error('No spreadsheet ID found');
      const url = `${APPS_SCRIPT_URL}?action=updatebooking&spreadsheetid=${encodeURIComponent(spreadsheetId)}`;
      const updateData = { bookingId, ...updates };
      result = await loadScript(url + '&' + new URLSearchParams(updateData as any).toString());
    }

    if (result.success) {
      // Update local state
      setBookings(prev => prev.map(booking => {
        if (booking.bookingId === bookingId) {
          const updatedBooking = { ...booking, ...updates };

          if (updates.fromDate !== undefined) {
            updatedBooking.fromDate = formatDateForDisplay(updates.fromDate);
            updatedBooking.rawFromDate = updates.fromDate;
          }

          if (updates.toDate !== undefined) {
            updatedBooking.toDate = formatDateForDisplay(updates.toDate);
            updatedBooking.rawToDate = updates.toDate;
          }

          if (updates.customerName !== undefined) updatedBooking.customerName = updates.customerName;
          if (updates.customerPhone !== undefined) updatedBooking.customerPhone = updates.customerPhone;
          if (updates.fromTime !== undefined) updatedBooking.fromTime = updates.fromTime;
          if (updates.toTime !== undefined) updatedBooking.toTime = updates.toTime;
          if (updates.status !== undefined) updatedBooking.status = updates.status;
          if (updates.amount !== undefined) updatedBooking.amount = updates.amount;
          if (updates.service !== undefined) updatedBooking.service = updates.service;
          if (updates.gst !== undefined) updatedBooking.gst = updates.gst;
          if (updates.total !== undefined) updatedBooking.total = updates.total;

          return updatedBooking;
        }
        return booking;
      }));

      if (updates.status === 'completed' || updates.status === 'cancelled') {
        toast({
          title: 'Success',
          description: `Booking marked as ${updates.status}. Room is now available.`,
        });

        window.dispatchEvent(new CustomEvent('booking-status-changed', {
          detail: {
            roomId: currentBooking?.roomId,
            status: updates.status
          }
        }));

        setSelectedStatus('all');
        await fetchBookings(true);
        setTimeout(() => {
          fetchBookings(true);
        }, 500);
      } else {
        toast({
          title: 'Success',
          description: 'Booking and customer details updated successfully.',
        });
      }

      return true;
    } else {
      throw new Error(result.error || 'Failed to update booking');
    }
  } catch (error: any) {
    console.error('❌ Error updating booking:', error);
    
    // Check for specific error messages
    if (error.message?.includes('DUPLICATE_BOOKING') || error.message?.includes('already exists')) {
      toast({
        title: "Room Already Booked",
        description: "This room is already booked for the selected dates by another customer",
        variant: "destructive"
      });
    } else if (error.message?.includes('ROOM_NOT_AVAILABLE')) {
      toast({
        title: "Room Not Available",
        description: "This room is not available for the selected dates",
        variant: "destructive"
      });
    } else {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update booking.',
        variant: 'destructive',
      });
    }
    return false;
  }
};
  // ===========================================
  // UPDATE FUNCTION BOOKING - ADD THIS 👇
  // ===========================================

  const updateFunctionBooking = async (bookingId: number, updates: Partial<FunctionBooking>) => {
    try {
      const token = localStorage.getItem('authToken');

      toast({
        title: "Updating",
        description: "Updating function booking...",
        duration: 2000
      });

      const response = await fetch(`${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setFunctionBookings(prev => prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, ...updates }
            : booking
        ));

        toast({
          title: "✅ Success",
          description: "Function booking updated successfully",
          duration: 3000
        });

        return true;
      } else {
        throw new Error(result.message || 'Failed to update function booking');
      }
    } catch (error: any) {
      console.error('❌ Error updating function booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update function booking",
        variant: "destructive",
        duration: 5000
      });
      return false;
    }
  };

  const handleFunctionEditSave = async (bookingId: number) => {
    const success = await updateFunctionBooking(bookingId, functionEditForm);
    if (success) {
      setEditingFunctionBookingId(null);
      setFunctionEditForm({});
    }
  };

  // ===========================================
  // UPDATE INVOICE NUMBER
  // ===========================================

  const updateInvoiceNumber = async (bookingId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`${NODE_BACKEND_URL}/bookings/${bookingId}/invoice-number`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_number: invoiceNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice number updated successfully"
        });

        setBookings(prev => prev.map(booking =>
          booking.bookingId === bookingId
            ? { ...booking, invoiceNumber: data.data.invoice_number }
            : booking
        ));

        return true;
      } else {
        throw new Error(data.message || 'Failed to update invoice number');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice number",
        variant: "destructive"
      });
      return false;
    }
  };

  // // ===========================================
  // // DOWNLOAD QUOTATION
  // // ===========================================

  // const downloadQuotation = async (quotationId: string, autoPrint: boolean = false) => {
  //   try {
  //     const token = localStorage.getItem('authToken');

  //     const url = `${NODE_BACKEND_URL}/quotations/${quotationId}/download?autoprint=${autoPrint}`;

  //     toast({
  //       title: "Opening Quotation",
  //       description: "Opening quotation in new tab...",
  //       duration: 2000
  //     });

  //     window.open(url, '_blank', 'noopener,noreferrer');

  //   } catch (error: any) {
  //     console.error('❌ Error downloading quotation:', error);
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to open quotation",
  //       variant: "destructive",
  //       duration: 5000
  //     });
  //   }
  // };


  // ===========================================
  // DOWNLOAD QUOTATION - DOWNLOAD HTML AS HTML
  // ===========================================

  const downloadQuotation = async (quotationId: string, autoPrint: boolean = false) => {
    try {
      const token = localStorage.getItem('authToken');

      toast({
        title: "Downloading Quotation",
        description: "Please wait...",
        duration: 2000
      });

      const url = `${NODE_BACKEND_URL}/quotations/${quotationId}/download?autoprint=${autoPrint}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const html = await response.text();

      // Create HTML blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `quotation-${quotationId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "✅ Success",
        description: "Quotation downloaded as HTML file",
        duration: 3000
      });

    } catch (error: any) {
      console.error('❌ Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download quotation",
        variant: "destructive"
      });
    }
  };
  // ===========================================
  // CONVERT QUOTATION TO BOOKING
  // ===========================================

  const convertQuotationToBooking = async (quotationId: string) => {
    if (!window.confirm('Convert this quotation to a booking?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${NODE_BACKEND_URL}/quotations/${quotationId}/convert-to-booking`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payment_method: 'cash',
            payment_status: 'pending'
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "✅ Success",
          description: "Quotation converted to booking successfully"
        });
        fetchBookings(true);
        fetchQuotations();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to convert quotation",
        variant: "destructive"
      });
    }
  };

  // ===========================================
  // EDIT HANDLERS
  // ===========================================

  const handleEditStart = (booking: Booking) => {
    setEditingBookingId(booking.bookingId);
    setEditForm({
      amount: booking.amount,
      service: booking.service,
      gst: booking.gst,
      total: booking.total,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      fromDate: formatDateForInput(booking.rawFromDate || booking.fromDate),
      toDate: formatDateForInput(booking.rawToDate || booking.toDate),
      fromTime: booking.fromTime,
      toTime: booking.toTime,
      status: booking.status
    });
  };

  const handleEditCancel = () => {
    setEditingBookingId(null);
    setEditForm({});
  };

  // const handleEditSave = async (bookingId: string) => {
  //   const success = await updateBooking(bookingId, editForm);
  //   if (success) {
  //     setEditingBookingId(null);
  //     setEditForm({});
  //   }
  // };

// In Bookings.tsx - Update your handleEditSave function
const handleEditSave = async (bookingId: string) => {
  // Check availability first (if dates or room changed)
  const currentBooking = bookings.find(b => b.bookingId === bookingId);
  
  if (editForm.fromDate || editForm.toDate || editForm.roomNumber) {
    try {
      // Make API call to check availability
      const checkResponse = await fetch(`${NODE_BACKEND_URL}/bookings/check-availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id: editForm.roomNumber || currentBooking?.roomId,
          from_date: editForm.fromDate || currentBooking?.rawFromDate,
          to_date: editForm.toDate || currentBooking?.rawToDate,
          exclude_booking_id: bookingId
        })
      });

      const checkData = await checkResponse.json();
      console.log('📊 Availability check response:', checkData);
      
      if (!checkData.success || !checkData.data?.available) {
        toast({
          title: "Room Not Available",
          description: "This room is already booked for the selected dates",
          variant: "destructive"
        });
        return;
      }
      console.log('✅ Room is available - Proceeding with update');
    } catch (error) {
      console.error('❌ Availability check failed:', error);
      // Continue anyway - backend will validate
    }
  }

  // If available (or check failed), proceed with update
  const success = await updateBooking(bookingId, editForm);
  if (success) {
    setEditingBookingId(null);
    setEditForm({});
  }
};

  const handleFieldChange = (field: string, value: any) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value };

      if (['amount', 'service', 'gst'].includes(field)) {
        const amount = parseAmount(field === 'amount' ? value : prev.amount);
        const service = parseAmount(field === 'service' ? value : prev.service);
        const gst = parseAmount(field === 'gst' ? value : prev.gst);
        updated.total = Math.round((amount + service + gst) * 100) / 100;
      }

      return updated;
    });
  };


  // ===========================================
  // DELETE FUNCTION BOOKING
  // ===========================================
  const deleteFunctionBooking = async (bookingId: number) => {
    // Check if user is admin
    if (!isUserAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete function bookings",
        variant: "destructive"
      });
      return false;
    }

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setFunctionBookings(prev => prev.filter(booking => booking.id !== bookingId));

        toast({
          title: "✅ Deleted Successfully",
          description: "Function booking has been deleted",
          duration: 3000
        });

        return true;
      } else {
        throw new Error(result.message || 'Failed to delete function booking');
      }
    } catch (error: any) {
      console.error('❌ Error deleting function booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete function booking",
        variant: "destructive",
        duration: 5000
      });
      return false;
    }
  };

  // ===========================================
  // CANCEL FUNCTION BOOKING
  // ===========================================
  const cancelFunctionBooking = async (bookingId: number, reason: string = '') => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${NODE_BACKEND_URL}/function-rooms/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cancellation_reason: reason })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state - change status to cancelled
        setFunctionBookings(prev => prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        ));

        toast({
          title: "✅ Cancelled Successfully",
          description: "Function booking has been cancelled",
          duration: 3000
        });

        return true;
      } else {
        throw new Error(result.message || 'Failed to cancel function booking');
      }
    } catch (error: any) {
      console.error('❌ Error cancelling function booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel function booking",
        variant: "destructive",
        duration: 5000
      });
      return false;
    }
  };

  // ===========================================
  // HANDLE DELETE CONFIRMATION
  // ===========================================
  const handleDeleteFunctionBooking = (bookingId: number, eventName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE "${eventName}"?\n\nThis action CANNOT be undone. All associated data will be removed from the database.`
    );

    if (confirmDelete) {
      deleteFunctionBooking(bookingId);
    }
  };

  // ===========================================
  // HANDLE CANCEL WITH REASON
  // ===========================================
  const handleCancelFunctionBooking = (bookingId: number, eventName: string) => {
    const reason = window.prompt(`Enter cancellation reason for "${eventName}":`, '');

    if (reason !== null) { // User didn't click cancel
      cancelFunctionBooking(bookingId, reason);
    }
  };


  // ===========================================
  // FUNCTION BOOKING EDIT HANDLERS - ADD THESE 👇
  // ===========================================


  const handleFunctionEditStart = (booking: FunctionBooking) => {
    setEditingFunctionBookingId(booking.id);
    setFunctionEditForm({
      event_name: booking.event_name,
      event_type: booking.event_type,
      booking_date: booking.booking_date.split('T')[0], // Extract date part
      end_date: booking.end_date?.split('T')[0] || booking.booking_date.split('T')[0],
      start_time: booking.start_time,
      end_time: booking.end_time,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      customer_email: booking.customer_email || '',
      total_amount: booking.total_amount,
      advance_paid: booking.advance_paid,
      guests_expected: booking.guests_expected,
      status: booking.status,
      payment_status: booking.payment_status,
      special_requests: booking.special_requests || '',
      catering_requirements: booking.catering_requirements || '',
      gst: booking.gst,
      discount: booking.discount,
      other_charges: booking.other_charges
    });
  };

  const handleFunctionEditCancel = () => {
    setEditingFunctionBookingId(null);
    setFunctionEditForm({});
  };

  const handleFunctionFieldChange = (field: string, value: any) => {
    setFunctionEditForm(prev => {
      const updated = { ...prev, [field]: value };

      // Recalculate total if amount-related fields change
      if (['total_amount', 'advance_paid', 'gst', 'discount', 'other_charges'].includes(field)) {
        // You can add calculation logic here if needed
      }

      return updated;
    });
  };

  // ===========================================
  // FILTERS
  // ===========================================

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon?: any; className?: string }> = {
      booked: { variant: 'default', label: 'Booked' },
      blocked: {
        variant: 'destructive',
        label: 'Blocked',
        icon: Ban,
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
      },
      maintenance: {
        variant: 'outline',
        label: 'Maintenance',
        icon: Wrench,
        className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100'
      },
      available: { variant: 'secondary', label: 'Available' },
      completed: { variant: 'secondary', label: 'Checkout' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status?.toLowerCase()] || { variant: 'outline', label: status || 'Unknown' };
    const IconComponent = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 ${config.className || ''}`}
      >
        {IconComponent && <IconComponent className="w-3 h-3" />}
        {config.label}
      </Badge>
    );
  };

  const getFunctionStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      confirmed: { label: 'Confirmed', class: 'bg-green-100 text-green-800 border-green-200' },
      pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-800 border-red-200' },
      completed: { label: 'Completed', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    };
    const cfg = config[status] || { label: status, class: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      completed: { label: 'Paid', class: 'bg-green-100 text-green-800 border-green-200' },
      partial: { label: 'Partial', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      pending: { label: 'Pending', class: 'bg-orange-100 text-orange-800 border-orange-200' },
      refunded: { label: 'Refunded', class: 'bg-purple-100 text-purple-800 border-purple-200' },
    };
    const cfg = config[status] || { label: status, class: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>;
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'booked', label: 'Booked' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'completed', label: 'Checkout' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const applyDateFilter = (bookings: Booking[]) => {
    if (!dateFilter.startDate && !dateFilter.endDate && selectedStatus === 'all') {
      return bookings;
    }

    return bookings.filter(booking => {
      let datePassed = true;
      if (dateFilter.startDate || dateFilter.endDate) {
        const bookingFromDate = new Date(booking.fromDate);
        const bookingToDate = new Date(booking.toDate);

        if (dateFilter.startDate && dateFilter.endDate) {
          datePassed = !(
            bookingToDate < dateFilter.startDate ||
            bookingFromDate > dateFilter.endDate
          );
        } else if (dateFilter.startDate) {
          datePassed = bookingFromDate >= dateFilter.startDate;
        } else if (dateFilter.endDate) {
          datePassed = bookingToDate <= dateFilter.endDate;
        }
      }

      let statusPassed = true;
      if (selectedStatus !== 'all') {
        statusPassed = booking.status.toLowerCase() === selectedStatus.toLowerCase();
      }

      return datePassed && statusPassed;
    });
  };

  const clearAllFilters = () => {
    setDateFilter({ startDate: undefined, endDate: undefined });
    setSelectedStatus('all');
    setSearchTerm('');
    toast({
      title: "Filters Cleared",
      description: "All filters have been cleared"
    });
  };

  // ===========================================
  // FILTERED DATA
  // ===========================================

  const filteredBookings = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let filtered = bookings.filter(
      (b) =>
        b.customerName?.toLowerCase().includes(term) ||
        (b.customerPhone || '').includes(term) ||
        (b.roomNumber || '').toString().includes(term)
    );

    filtered = applyDateFilter(filtered);

    return filtered;
  }, [bookings, searchTerm, dateFilter, selectedStatus]);

  const filteredFunctionBookings = useMemo(() => {
    const term = functionSearchTerm.toLowerCase();
    return functionBookings.filter(b =>
      b.event_name?.toLowerCase().includes(term) ||
      b.customer_name?.toLowerCase().includes(term) ||
      b.booking_reference?.toLowerCase().includes(term) ||
      b.room_name?.toLowerCase().includes(term)
    );
  }, [functionBookings, functionSearchTerm]);

  const filteredQuotations = useMemo(() => {
    const term = quotationSearchTerm.toLowerCase();
    return quotations.filter(q =>
      (selectedQuotationStatus === 'all' || q.status === selectedQuotationStatus) &&
      (
        q.quotation_number?.toLowerCase().includes(term) ||
        q.customer_name?.toLowerCase().includes(term) ||
        q.customer_phone?.includes(term)
      )
    );
  }, [quotations, quotationSearchTerm, selectedQuotationStatus]);

  // ===========================================
  // USE EFFECTS
  // ===========================================

  useEffect(() => {
    fetchBookings();
    if (isProUser) {
      fetchQuotations();
      fetchFunctionBookings();
    }
  }, []);

  const handleRefresh = async () => {
    await fetchBookings(true);
    if (isProUser) {
      await fetchQuotations();
      await fetchFunctionBookings();
    }
  };

  // ===========================================
  // COLUMN DEFINITIONS
  // ===========================================

  // Bookings columns
  const bookingColumns: GridColDef<Booking>[] = [
    {
      field: 'bookingId',
      headerName: 'Booking ID',
      width: 120,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{params.value}</span>
        </div>
      ),
    },
    {
      field: 'invoiceNumber',
      headerName: 'Invoice #',
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {editingInvoiceId === params.row.bookingId ? (
            <div className="flex items-center gap-2">
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-32 h-8 text-xs"
                placeholder="INV-2024-0001"
              />
              <Button
                size="sm"
                variant="default"
                onClick={async () => {
                  const success = await updateInvoiceNumber(params.row.bookingId, invoiceNumber);
                  if (success) {
                    setEditingInvoiceId(null);
                    setInvoiceNumber('');
                  }
                }}
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingInvoiceId(null);
                  setInvoiceNumber('');
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{params.value || 'Not Set'}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingInvoiceId(params.row.bookingId);
                  setInvoiceNumber(params.value || '');
                }}
                className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      ),
    },
    { field: 'roomNumber', headerName: 'Room', width: 100 },
    {
      field: 'customerName',
      headerName: 'Customer',
      width: 150,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <Input
            value={editForm.customerName ?? params.row.customerName}
            onChange={(e) => handleFieldChange('customerName', e.target.value)}
            className="w-full h-8 text-xs"
          />
        ) : (
          params.row.customerName
        )
      ),
    },
    {
      field: 'customerPhone',
      headerName: 'Phone',
      width: 130,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <Input
            value={editForm.customerPhone ?? params.row.customerPhone}
            onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
            className="w-full h-8 text-xs"
          />
        ) : (
          params.row.customerPhone
        )
      ),
    },
    {
      field: 'fromDate',
      headerName: 'Check-In',
      width: 140,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <div className="w-full">
            <div className="flex gap-2">
              <Input
                type="date"
                value={editForm.fromDate ?? formatDateForInput(params.row.rawFromDate || params.row.fromDate)}
                onChange={(e) => handleFieldChange('fromDate', e.target.value)}
                className="w-32 h-8 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFromDateCalendarOpen(true)}
                className="h-8 px-2"
              >
                <CalendarIcon className="h-3 w-3" />
              </Button>
            </div>

            {fromDateCalendarOpen && (
              <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg">
                <Calendar
                  mode="single"
                  selected={editForm.fromDate ? new Date(editForm.fromDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formattedDate = format(date, 'yyyy-MM-dd');
                      handleFieldChange('fromDate', formattedDate);
                    }
                    setFromDateCalendarOpen(false);
                  }}
                  initialFocus
                  className="p-2"
                />
              </div>
            )}
          </div>
        ) : (
          params.row.fromDate
        )
      ),
    },
    {
      field: 'toDate',
      headerName: 'Check-Out',
      width: 140,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <div className="w-full">
            <div className="flex gap-2">
              <Input
                type="date"
                value={editForm.toDate ?? formatDateForInput(params.row.rawToDate || params.row.toDate)}
                onChange={(e) => handleFieldChange('toDate', e.target.value)}
                className="w-32 h-8 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setToDateCalendarOpen(true)}
                className="h-8 px-2"
              >
                <CalendarIcon className="h-3 w-3" />
              </Button>
            </div>

            {toDateCalendarOpen && (
              <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg">
                <Calendar
                  mode="single"
                  selected={editForm.toDate ? new Date(editForm.toDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formattedDate = format(date, 'yyyy-MM-dd');
                      handleFieldChange('toDate', formattedDate);
                    }
                    setToDateCalendarOpen(false);
                  }}
                  initialFocus
                  className="p-2"
                />
              </div>
            )}
          </div>
        ) : (
          params.row.toDate
        )
      ),
    },
    {
      field: 'fromTime',
      headerName: 'From Time',
      width: 100,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <Input
            type="time"
            value={editForm.fromTime ?? params.row.fromTime}
            onChange={(e) => handleFieldChange('fromTime', e.target.value)}
            className="w-full h-8 text-xs"
          />
        ) : (
          params.row.fromTime
        )
      ),
    },
    {
      field: 'toTime',
      headerName: 'To Time',
      width: 100,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <Input
            type="time"
            value={editForm.toTime ?? params.row.toTime}
            onChange={(e) => handleFieldChange('toTime', e.target.value)}
            className="w-full h-8 text-xs"
          />
        ) : (
          params.row.toTime
        )
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <select
            value={editForm.status ?? params.row.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full h-8 text-xs border rounded px-2"
          >
            <option value="booked">Booked</option>
            <option value="blocked">Blocked</option>
            <option value="maintenance">Maintenance</option>
            <option value="completed">Checkout</option>
            <option value="cancelled">Cancelled</option>
          </select>
        ) : (
          getStatusBadge(params.value as string)
        )
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <Input
            type="number"
            value={editForm.amount ?? params.row.amount}
            onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
            className="w-20 h-8 text-xs"
          />
        ) : (
          `₹${parseAmount(params.row.amount).toLocaleString('en-IN')}`
        )
      ),
    },
    {
      field: 'service',
      headerName: 'Service',
      width: 100,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <Input
            type="number"
            value={editForm.service ?? params.row.service}
            onChange={(e) => handleFieldChange('service', Number(e.target.value))}
            className="w-20 h-8 text-xs"
          />
        ) : (
          `₹${parseAmount(params.row.service).toLocaleString('en-IN')}`
        )
      ),
    },
    {
      field: 'gst',
      headerName: 'GST',
      width: 90,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <Input
            type="number"
            value={editForm.gst ?? params.row.gst}
            onChange={(e) => handleFieldChange('gst', Number(e.target.value))}
            className="w-20 h-8 text-xs"
          />
        ) : (
          `₹${parseAmount(params.row.gst).toLocaleString('en-IN')}`
        )
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 110,
      renderCell: (params) => (
        editingBookingId === params.row.bookingId ? (
          <span className="font-semibold">
            ₹{parseAmount(editForm.total ?? params.row.total).toLocaleString('en-IN')}
          </span>
        ) : (
          `₹${parseAmount(params.row.total).toLocaleString('en-IN')}`
        )
      ),
    },
    { field: 'createdAt', headerName: 'Created At', width: 160 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 350,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-1">
          {editingBookingId === params.row.bookingId ? (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleEditSave(params.row.bookingId)}
                className="h-7 px-2 min-w-[60px]"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditCancel}
                className="h-7 px-2 min-w-[40px]"
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              {/* Invoice Button - HIDE for blocked/maintenance */}
              {params.row.status !== 'blocked' && params.row.status !== 'maintenance' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (isProUser) {
                      downloadInvoice(params.row.bookingId);
                    } else {
                      setSelectedBookingId(params.row.bookingId);
                    }
                  }}
                  title={isProUser ? 'Download invoice (Pro Plan)' : 'View invoice (Free Plan)'}
                  className="h-7 px-2 min-w-[80px]"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {isProUser ? 'Download' : 'View'}
                </Button>
              )}

              {/* Block Report Button - SHOW only for blocked */}
              {params.row.status === 'blocked' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadBlockPDF(params.row.bookingId)}
                  title="Download Block Room Report (PDF)"
                  className="h-7 px-2 min-w-[70px] bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
                >
                  <Ban className="w-3 h-3 mr-1" />
                  Block PDF
                </Button>
              )}

              {/* Maintenance Report Button - SHOW only for maintenance */}
              {params.row.status === 'maintenance' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadMaintenancePDF(params.row.bookingId)}
                  title="Download Maintenance Report (PDF)"
                  className="h-7 px-2 min-w-[85px] bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800"
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  Maint. PDF
                </Button>
              )}

              {/* Edit Button - SHOW for all */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditStart(params.row)}
                title="Edit booking"
                className="h-7 px-2 min-w-[40px]"
              >
                <Edit className="w-3 h-3" />
              </Button>

              {/* Delete Button (Admin Only) */}
              {isUserAdmin && isProUser && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteBooking(params.row.bookingId)}
                  title="Delete booking (Admin only)"
                  className="h-7 px-2 min-w-[40px] bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </>
          )}
        </div>
      ),
    }
  ];

  // Function Bookings columns
  //   const functionBookingColumns: GridColDef<FunctionBooking>[] = [
  //     {
  //       field: 'booking_reference',
  //       headerName: 'Ref #',
  //       width: 130,
  //       renderCell: (params) => (
  //         <div className="font-mono font-medium text-xs">
  //           {params.value}
  //         </div>
  //       ),
  //     },
  //     {
  //       field: 'event_name',
  //       headerName: 'Event Name',
  //       width: 180,
  //       renderCell: (params) => (
  //         <div>
  //           <div className="font-medium">{params.value}</div>
  //           <div className="text-xs text-gray-500">{params.row.event_type}</div>
  //         </div>
  //       ),
  //     },
  //     {
  //       field: 'room_name',
  //       headerName: 'Function Room',
  //       width: 150,
  //       renderCell: (params) => (
  //         <div>
  //           <div>{params.row.room_name}</div>
  //           <div className="text-xs text-gray-500">Room {params.row.room_number}</div>
  //         </div>
  //       ),
  //     },
  //     {
  //       field: 'customer_name',
  //       headerName: 'Customer',
  //       width: 150,
  //     },
  //     {
  //       field: 'customer_phone',
  //       headerName: 'Phone',
  //       width: 120,
  //     },
  //     {
  //       field: 'booking_date',
  //       headerName: 'Event Date',
  //       width: 150,
  //       renderCell: (params) => (
  //         <div>
  //           <div>{params.value}</div>
  //           <div className="text-xs text-gray-500">
  //             {params.row.start_time} - {params.row.end_time}
  //           </div>
  //         </div>
  //       ),
  //     },
  //     {
  //       field: 'guests_expected',
  //       headerName: 'Guests',
  //       width: 80,
  //       renderCell: (params) => (
  //         <div className="flex items-center gap-1">
  //           <Users className="w-3 h-3 text-gray-500" />
  //           {params.value || 'N/A'}
  //         </div>
  //       ),
  //     },
  //     {
  //       field: 'total_amount',
  //       headerName: 'Amount',
  //       width: 120,
  //       renderCell: (params) => (
  //         <div>
  //           <div className="font-medium">{formatCurrency(params.value)}</div>
  //           {params.row.advance_paid > 0 && (
  //             <div className="text-xs text-green-600">
  //               Paid: {formatCurrency(params.row.advance_paid)}
  //             </div>
  //           )}
  //         </div>
  //       ),
  //     },
  //     {
  //       field: 'status',
  //       headerName: 'Status',
  //       width: 120,
  //       renderCell: (params) => getFunctionStatusBadge(params.value),
  //     },
  //     {
  //       field: 'payment_status',
  //       headerName: 'Payment',
  //       width: 110,
  //       renderCell: (params) => getPaymentStatusBadge(params.value),
  //     },
  //     {
  //       field: 'has_room_bookings',
  //       headerName: 'Accommodation',
  //       width: 120,
  //       renderCell: (params) => (
  //         params.value ? (
  //           <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
  //             <Home className="w-3 h-3 mr-1" />
  //             {params.row.total_rooms_booked} Room(s)
  //           </Badge>
  //         ) : (
  //           <span className="text-xs text-gray-400">None</span>
  //         )
  //       ),
  //     },
  //     // {
  //     //   field: 'actions',
  //     //   headerName: 'Actions',
  //     //   width: 200,
  //     //   sortable: false,
  //     //   renderCell: (params) => (
  //     //     <div className="flex gap-2">
  //     //       <Button
  //     //         size="sm"
  //     //         variant="outline"
  //     //         onClick={() => downloadFunctionBookingInvoice(params.row.id, params.row.booking_reference)}
  //     //         title="Download Invoice"
  //     //         className="h-7 px-2"
  //     //       >
  //     //         <FileText className="h-3 w-3 mr-1" />
  //     //         Invoice
  //     //       </Button>
  //     //       <Button
  //     //         size="sm"
  //     //         variant="outline"
  //     //         onClick={() => viewFunctionBookingDetails(params.row)}
  //     //         title="View Details"
  //     //         className="h-7 px-2"
  //     //       >
  //     //         <Eye className="h-3 w-3 mr-1" />
  //     //         Details
  //     //       </Button>
  //     //     </div>
  //     //   ),
  //     // },

  //     {
  //   field: 'actions',
  //   headerName: 'Actions',
  //   width: 350,
  //   sortable: false,
  //   renderCell: (params) => (
  //     <div className="flex gap-2">
  //       {/* View Invoice JSON Button */}
  //       <Button
  //         size="sm"
  //         variant="outline"
  //         onClick={() => showFunctionInvoiceModalWithData(params.row.id)}
  //         title="View Invoice Data"
  //         className="h-7 px-2"
  //       >
  //         <FileText className="h-3 w-3 mr-1" />
  //         View
  //       </Button>

  //       {/* Download PDF Invoice Button */}
  //       <Button
  //         size="sm"
  //         variant="default"
  //         onClick={() => downloadFunctionBookingInvoicePDF(params.row.id, params.row.booking_reference)}
  //         title="Download PDF Invoice"
  //         className="h-7 px-2 bg-primary hover:bg-primary/90"
  //       >
  //         <Download className="h-3 w-3 mr-1" />
  //         PDF
  //       </Button>

  //       {/* NEW: Download HTML Invoice Button (like regular bookings) */}
  //       <Button
  //         size="sm"
  //         variant="outline"
  //         onClick={() => downloadFunctionInvoiceHTML(params.row.id, params.row.booking_reference)}
  //         title="Download HTML Invoice"
  //         className="h-7 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
  //       >
  //         <Download className="h-3 w-3 mr-1" />
  //         HTML
  //       </Button>

  //       {/* Get Invoice Info Button */}
  //       <Button
  //         size="sm"
  //         variant="outline"
  //         onClick={async () => {
  //           const info = await getFunctionBookingInvoiceInfo(params.row.id);
  //           if (info) {
  //             toast({
  //               title: "Invoice Info",
  //               description: `Invoice: ${info.data?.invoice_number || 'N/A'}`,
  //             });
  //           }
  //         }}
  //         title="Invoice Info"
  //         className="h-7 px-2"
  //       >
  //         <Info className="h-3 w-3" />
  //       </Button>

  //       {/* View Details Button */}
  //       <Button
  //         size="sm"
  //         variant="outline"
  //         onClick={() => viewFunctionBookingDetails(params.row)}
  //         title="View Details"
  //         className="h-7 px-2"
  //       >
  //         <Eye className="h-3 w-3 mr-1" />
  //         Details
  //       </Button>
  //     </div>
  //   ),
  // },
  //     // {
  //     //   field: 'actions',
  //     //   headerName: 'Actions',
  //     //   width: 280,
  //     //   sortable: false,
  //     //   renderCell: (params) => (
  //     //     <div className="flex gap-2">
  //     //       {/* View Invoice JSON Button */}
  //     //       <Button
  //     //         size="sm"
  //     //         variant="outline"
  //     //         onClick={() => showFunctionInvoiceModalWithData(params.row.id)}
  //     //         title="View Invoice Data"
  //     //         className="h-7 px-2"
  //     //       >
  //     //         <FileText className="h-3 w-3 mr-1" />
  //     //         View
  //     //       </Button>

  //     //       {/* Download PDF Invoice Button */}
  //     //       <Button
  //     //         size="sm"
  //     //         variant="default"
  //     //         onClick={() => downloadFunctionBookingInvoicePDF(params.row.id, params.row.booking_reference)}
  //     //         title="Download PDF Invoice"
  //     //         className="h-7 px-2 bg-primary hover:bg-primary/90"
  //     //       >
  //     //         <Download className="h-3 w-3 mr-1" />
  //     //         PDF
  //     //       </Button>

  //     //       {/* Get Invoice Info Button */}
  //     //       <Button
  //     //         size="sm"
  //     //         variant="outline"
  //     //         onClick={async () => {
  //     //           const info = await getFunctionBookingInvoiceInfo(params.row.id);
  //     //           if (info) {
  //     //             toast({
  //     //               title: "Invoice Info",
  //     //               description: `Invoice: ${info.data?.invoice_number || 'N/A'}`,
  //     //             });
  //     //           }
  //     //         }}
  //     //         title="Invoice Info"
  //     //         className="h-7 px-2"
  //     //       >
  //     //         <Info className="h-3 w-3" />
  //     //       </Button>

  //     //       {/* View Details Button - Keep existing */}
  //     //       <Button
  //     //         size="sm"
  //     //         variant="outline"
  //     //         onClick={() => viewFunctionBookingDetails(params.row)}
  //     //         title="View Details"
  //     //         className="h-7 px-2"
  //     //       >
  //     //         <Eye className="h-3 w-3 mr-1" />
  //     //         Details
  //     //       </Button>
  //     //     </div>
  //     //   ),
  //     // },
  //   ];

  // Function Bookings columns with edit functionality
  const functionBookingColumns: GridColDef<FunctionBooking>[] = [
    {
      field: 'booking_reference',
      headerName: 'Ref #',
      width: 130,
      renderCell: (params) => (
        <div className="font-mono font-medium text-xs">
          {params.value}
        </div>
      ),
    },
    {
      field: 'event_name',
      headerName: 'Event Name',
      width: 180,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <Input
            value={functionEditForm.event_name ?? params.row.event_name}
            onChange={(e) => handleFunctionFieldChange('event_name', e.target.value)}
            className="w-full h-8 text-xs"
          />
        ) : (
          <div>
            <div className="font-medium">{params.value}</div>
            <div className="text-xs text-gray-500">{params.row.event_type}</div>
          </div>
        )
      ),
    },
    {
      field: 'room_name',
      headerName: 'Function Room',
      width: 150,
      renderCell: (params) => (
        <div>
          <div>{params.row.room_name}</div>
          <div className="text-xs text-gray-500">Room {params.row.room_number}</div>
        </div>
      ),
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      width: 150,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <Input
            value={functionEditForm.customer_name ?? params.row.customer_name}
            onChange={(e) => handleFunctionFieldChange('customer_name', e.target.value)}
            className="w-full h-8 text-xs"
          />
        ) : (
          params.value
        )
      ),
    },
    {
      field: 'customer_phone',
      headerName: 'Phone',
      width: 120,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <Input
            value={functionEditForm.customer_phone ?? params.row.customer_phone}
            onChange={(e) => handleFunctionFieldChange('customer_phone', e.target.value)}
            className="w-full h-8 text-xs"
          />
        ) : (
          params.value
        )
      ),
    },
    {
      field: 'booking_date',
      headerName: 'Event Date',
      width: 150,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <div>
            <Input
              type="date"
              value={functionEditForm.booking_date ?? params.row.booking_date}
              onChange={(e) => handleFunctionFieldChange('booking_date', e.target.value)}
              className="w-full h-8 text-xs mb-1"
            />
            <div className="flex gap-1">
              <Input
                type="time"
                value={functionEditForm.start_time ?? params.row.start_time}
                onChange={(e) => handleFunctionFieldChange('start_time', e.target.value)}
                className="w-16 h-7 text-xs"
              />
              <span className="text-xs">-</span>
              <Input
                type="time"
                value={functionEditForm.end_time ?? params.row.end_time}
                onChange={(e) => handleFunctionFieldChange('end_time', e.target.value)}
                className="w-16 h-7 text-xs"
              />
            </div>
          </div>
        ) : (
          <div>
            <div>{params.value}</div>
            <div className="text-xs text-gray-500">
              {params.row.start_time} - {params.row.end_time}
            </div>
          </div>
        )
      ),
    },
    {
      field: 'guests_expected',
      headerName: 'Guests',
      width: 80,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <Input
            type="number"
            value={functionEditForm.guests_expected ?? params.row.guests_expected}
            onChange={(e) => handleFunctionFieldChange('guests_expected', parseInt(e.target.value))}
            className="w-16 h-8 text-xs"
          />
        ) : (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-500" />
            {params.value || 'N/A'}
          </div>
        )
      ),
    },
    {
      field: 'total_amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <div className="space-y-1">
            <Input
              type="number"
              value={functionEditForm.total_amount ?? params.row.total_amount}
              onChange={(e) => handleFunctionFieldChange('total_amount', parseFloat(e.target.value))}
              className="w-20 h-7 text-xs"
              placeholder="Total"
            />
            <Input
              type="number"
              value={functionEditForm.advance_paid ?? params.row.advance_paid}
              onChange={(e) => handleFunctionFieldChange('advance_paid', parseFloat(e.target.value))}
              className="w-20 h-7 text-xs"
              placeholder="Advance"
            />
          </div>
        ) : (
          <div>
            <div className="font-medium">{formatCurrency(params.value)}</div>
            {params.row.advance_paid > 0 && (
              <div className="text-xs text-green-600">
                Paid: {formatCurrency(params.row.advance_paid)}
              </div>
            )}
          </div>
        )
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <select
            value={functionEditForm.status ?? params.row.status}
            onChange={(e) => handleFunctionFieldChange('status', e.target.value)}
            className="w-full h-8 text-xs border rounded px-2"
          >
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        ) : (
          getFunctionStatusBadge(params.value)
        )
      ),
    },
    {
      field: 'payment_status',
      headerName: 'Payment',
      width: 110,
      renderCell: (params) => (
        editingFunctionBookingId === params.row.id ? (
          <select
            value={functionEditForm.payment_status ?? params.row.payment_status}
            onChange={(e) => handleFunctionFieldChange('payment_status', e.target.value)}
            className="w-full h-8 text-xs border rounded px-2"
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        ) : (
          getPaymentStatusBadge(params.value)
        )
      ),
    },
    {
      field: 'has_room_bookings',
      headerName: 'Accommodation',
      width: 120,
      renderCell: (params) => (
        params.value ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Home className="w-3 h-3 mr-1" />
            {params.row.total_rooms_booked} Room(s)
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">None</span>
        )
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 600,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          {editingFunctionBookingId === params.row.id ? (
            // EDIT MODE ACTIONS
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleFunctionEditSave(params.row.id)}
                className="h-7 px-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleFunctionEditCancel}
                className="h-7 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            // NORMAL MODE ACTIONS (keep all your existing buttons + add Edit button)
            <>
              {/* NEW EDIT BUTTON */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFunctionEditStart(params.row)}
                title="Edit booking"
                className="h-7 px-2"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>

              {/* View Invoice JSON Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => showFunctionInvoiceModalWithData(params.row.id)}
                title="View Invoice Data"
                className="h-7 px-2"
              >
                <FileText className="h-3 w-3 mr-1" />
                View
              </Button>

              {/* Download HTML Invoice Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadFunctionInvoiceHTML(params.row.id, params.row.booking_reference)}
                title="Download HTML Invoice"
                className="h-7 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>

              {/* View Details Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewFunctionBookingDetails(params.row)}
                title="View Details"
                className="h-7 px-2"
              >
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>


              {/* ✨ NEW: CANCEL BUTTON - Show for non-cancelled bookings */}
              {params.row.status !== 'cancelled' && params.row.status !== 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelFunctionBooking(params.row.id, params.row.event_name)}
                  title="Cancel booking"
                  className="h-7 px-2 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-800"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              )}

              {/* ✨ NEW: DELETE BUTTON - Admin only, for any booking */}
              {isUserAdmin && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteFunctionBooking(params.row.id, params.row.event_name)}
                  title="Permanently delete booking (Admin only)"
                  className="h-7 px-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];
  // Quotations columns
  const quotationColumns: GridColDef<Quotation>[] = [
    {
      field: 'quotation_number',
      headerName: 'Quotation #',
      width: 150,
      renderCell: (params) => (
        <div className="font-mono font-medium">
          {params.value}
        </div>
      ),
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      width: 150,
    },
    {
      field: 'customer_phone',
      headerName: 'Phone',
      width: 130,
    },
    {
      field: 'room_number',
      headerName: 'Room',
      width: 100,
    },
    {
      field: 'dates',
      headerName: 'Dates',
      width: 180,
      renderCell: (params) => {
        const formatQuotationDate = (dateStr: string) => {
          try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            });
          } catch {
            return dateStr;
          }
        };

        return (
          <div className="text-sm">
            {formatQuotationDate(params.row.from_date)} - {formatQuotationDate(params.row.to_date)}
            <div className="text-xs text-gray-500">{params.row.nights} night(s)</div>
          </div>
        );
      },
    },
    {
      field: 'total_amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <div className="font-medium">
          ₹{parseFloat(params.value.toString()).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const getQuotationStatusBadge = (status: string) => {
          const config: Record<string, { label: string; class: string }> = {
            pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            accepted: { label: 'Accepted', class: 'bg-green-100 text-green-800 border-green-200' },
            rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800 border-red-200' },
            expired: { label: 'Expired', class: 'bg-gray-100 text-gray-800 border-gray-200' },
            converted: { label: 'Converted', class: 'bg-blue-100 text-blue-800 border-blue-200' },
          };
          const cfg = config[status] || { label: status, class: 'bg-gray-100 text-gray-800 border-gray-200' };
          return <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>;
        };
        return getQuotationStatusBadge(params.value);
      },
    },
    {
      field: 'expiry_date',
      headerName: 'Valid Until',
      width: 130,
      renderCell: (params) => {
        const formatQuotationDate = (dateStr: string) => {
          try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            });
          } catch {
            return dateStr;
          }
        };

        const isExpired = new Date(params.value) < new Date();

        return (
          <div className="text-sm">
            {formatQuotationDate(params.value)}
            <div className={`text-xs ${isExpired ? 'text-red-500' : 'text-green-500'}`}>
              {isExpired ? 'Expired' : 'Valid'}
            </div>
          </div>
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 130,
      renderCell: (params) => {
        try {
          return new Date(params.value).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          });
        } catch {
          return params.value;
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadQuotation(params.row.id)}
            title="Download Quotation"
            className="h-7 px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadQuotation(params.row.id, true)}
            title="Print Quotation"
            className="h-7 px-2"
          >
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
          {/* {params.row.status === 'pending' && (
            <Button
              size="sm"
              variant="default"
              onClick={() => convertQuotationToBooking(params.row.id)}
              title="Convert to Booking"
              className="h-7 px-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Convert
            </Button>
          )} */}
        </div>
      ),
    },
  ];

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">Bookings Management</h1>
              {/* {isProUser && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  Pro Plan
                </Badge>
              )} */}
              {isUserAdmin && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {isUserAdmin
                ? 'Administrator view with full access'
                : isProUser
                  ? 'Pro plan with function room bookings'
                  : 'Free plan with basic bookings'}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing || loadingFunctionBookings}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>

            {/* Add Previous Booking Button - Only for pro users */}
            {isProUser && (
              <Button
                variant="default"
                onClick={() => setShowPreviousBookingForm(true)}
                className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Add Previous Booking
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        {/* <div className="border-b">
          <nav className="flex space-x-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'bookings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Room Bookings ({bookings.length})
              </span>
            </button>

            {/* Function Bookings Tab - Only for pro users *
            {isProUser && (
              <button
                onClick={() => setActiveTab('function-bookings')}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'function-bookings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Function Bookings ({functionBookings.length})
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('quotations')}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'quotations'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quotations ({quotations.length})
              </span>
            </button>
          </nav>
        </div> */}

        {/* Tabs Navigation with Scroll Buttons */}
        <div className="border-b relative">
          <div className="flex items-center">
            {/* Left scroll button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 rounded-full flex-shrink-0"
              onClick={() => {
                const container = document.getElementById('tabs-container');
                if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Tabs container */}
            <nav
              id="tabs-container"
              className="flex space-x-4 overflow-x-auto pb-2 px-2 scroll-smooth scrollbar-hide flex-1"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-md flex-shrink-0 ${activeTab === 'bookings'
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Room Bookings ({bookings.length})
                </span>
              </button>

              {isProUser && (
                <button
                  onClick={() => setActiveTab('function-bookings')}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-md flex-shrink-0 ${activeTab === 'function-bookings'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Function Bookings ({functionBookings.length})
                  </span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('quotations')}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-md flex-shrink-0 ${activeTab === 'quotations'
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Quotations ({quotations.length})
                </span>
              </button>
            </nav>

            {/* Right scroll button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 rounded-full flex-shrink-0"
              onClick={() => {
                const container = document.getElementById('tabs-container');
                if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile gradient indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
        </div>

        {/* Add these styles */}
        <style>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>

        {/* =========================================== */}
        {/* ROOM BOOKINGS TAB */}
        {/* =========================================== */}
        {activeTab === 'bookings' && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by customer, phone, or room..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                  </div>
                </div>

                {/* Calendar & Status Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex flex-wrap gap-3">
                    {/* Calendar Filter Toggle */}
                    <Button
                      variant="outline"
                      onClick={() => setShowCalendarFilter(!showCalendarFilter)}
                      className="flex items-center gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Date Filter
                      {showCalendarFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full h-10 px-3 text-sm border rounded-md bg-background"
                      >
                        {statusOptions.map(option => (
                          <option key={`status-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    {(dateFilter.startDate || dateFilter.endDate || selectedStatus !== 'all') && (
                      <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Report Filters */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(selectedStatus === 'all' || selectedStatus === 'blocked') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStatus('blocked');
                        toast({
                          title: "Filter Applied",
                          description: "Showing blocked rooms only. Click 'Generate Report' for PDF.",
                          duration: 3000
                        });
                      }}
                      className={`flex items-center gap-1 h-8 px-3 text-xs ${selectedStatus === 'blocked' ? 'bg-red-50 border-red-200 text-red-700' : ''}`}
                    >
                      <Ban className="w-3 h-3" />
                      Blocked Rooms ({bookings.filter(b => b.status === 'blocked').length})
                    </Button>
                  )}

                  {(selectedStatus === 'all' || selectedStatus === 'maintenance') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStatus('maintenance');
                        toast({
                          title: "Filter Applied",
                          description: "Showing maintenance rooms only. Click 'Generate Report' for PDF.",
                          duration: 3000
                        });
                      }}
                      className={`flex items-center gap-1 h-8 px-3 text-xs ${selectedStatus === 'maintenance' ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}`}
                    >
                      <Wrench className="w-3 h-3" />
                      Maintenance ({bookings.filter(b => b.status === 'maintenance').length})
                    </Button>
                  )}

                  {/* Generate Filtered Report Button */}
                  {(selectedStatus === 'blocked' || selectedStatus === 'maintenance') && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        const filtered = bookings.filter(b => b.status === selectedStatus);
                        if (filtered.length > 0) {
                          const type = selectedStatus === 'blocked' ? 'Block' : 'Maintenance';
                          downloadCombinedReport();
                          toast({
                            title: "Report Generation Started",
                            description: `${type} rooms report is being generated...`,
                            duration: 2000
                          });
                        } else {
                          toast({
                            title: "No Data",
                            description: `No ${selectedStatus} rooms found for report generation`,
                            variant: "destructive"
                          });
                        }
                      }}
                      className="flex items-center gap-1 h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                      disabled={reportLoading}
                    >
                      <FileText className="w-3 h-3" />
                      {reportLoading ? 'Generating...' : `Generate ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Report`}
                    </Button>
                  )}
                </div>

                {/* Calendar Filter Panel */}
                {showCalendarFilter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Date */}
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateFilter.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateFilter.startDate ? (
                                format(dateFilter.startDate, "PPP")
                              ) : (
                                <span>Pick a start date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateFilter.startDate}
                              onSelect={(date) => setDateFilter(prev => ({ ...prev, startDate: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* End Date */}
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateFilter.endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateFilter.endDate ? (
                                format(dateFilter.endDate, "PPP")
                              ) : (
                                <span>Pick an end date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateFilter.endDate}
                              onSelect={(date) => setDateFilter(prev => ({ ...prev, endDate: date }))}
                              disabled={(date) => dateFilter.startDate ? date < dateFilter.startDate : false}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Active Filters Display */}
                    {(dateFilter.startDate || dateFilter.endDate) && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium">Active Filters:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {dateFilter.startDate && (
                                <Badge variant="outline" className="gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  From: {format(dateFilter.startDate, "MMM dd, yyyy")}
                                </Badge>
                              )}
                              {dateFilter.endDate && (
                                <Badge variant="outline" className="gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  To: {format(dateFilter.endDate, "MMM dd, yyyy")}
                                </Badge>
                              )}
                              {selectedStatus !== 'all' && (
                                <Badge variant="outline">
                                  Status: {statusOptions.find(s => s.value === selectedStatus)?.label}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </CardHeader>

            <CardContent className="relative px-0 md:px-6 min-h-[400px] flex items-center justify-center">
              {/* Loading overlay */}
              {(loading || refreshing) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                  <p className="text-muted-foreground font-medium text-base">
                    {loading ? 'Loading bookings data...' : 'Refreshing bookings...'}
                  </p>
                </div>
              )}

              <AnimatePresence>
                {!loading && !refreshing && (
                  <motion.div
                    key="data-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full"
                    style={{ height: isMobile ? 400 : 600 }}
                  >
                    {filteredBookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mb-4" />
                        <p className="text-lg mb-2">No bookings found</p>
                        <p className="text-sm mb-4 text-center">
                          {searchTerm || dateFilter.startDate || dateFilter.endDate || selectedStatus !== 'all'
                            ? 'Try adjusting your search terms or filters'
                            : 'No bookings available in the system'}
                        </p>
                        {(dateFilter.startDate || dateFilter.endDate || selectedStatus !== 'all') && (
                          <Button onClick={clearAllFilters}>
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    ) : (
                      <DataGrid
                        rows={filteredBookings}
                        columns={bookingColumns}
                        getRowId={(row) => `${row.source}-${row.bookingId}-${row.status}-${Date.now()}`}
                        initialState={{
                          pagination: {
                            paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 },
                          },
                        }}
                        pageSizeOptions={isMobile ? [5, 10] : [5, 10, 25]}
                        disableRowSelectionOnClick
                        key={filteredBookings.length + selectedStatus}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* =========================================== */}
        {/* FUNCTION BOOKINGS TAB */}
        {/* =========================================== */}
        {activeTab === 'function-bookings' && isProUser && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by event, customer, or reference..."
                      value={functionSearchTerm}
                      onChange={(e) => setFunctionSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredFunctionBookings.length} of {functionBookings.length} function bookings
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative px-0 md:px-6 min-h-[400px] flex items-center justify-center">
              {/* Loading overlay */}
              {loadingFunctionBookings && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                  <p className="text-muted-foreground font-medium text-base">
                    Loading function bookings...
                  </p>
                </div>
              )}

              <AnimatePresence>
                {!loadingFunctionBookings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full"
                    style={{ height: isMobile ? 400 : 600 }}
                  >
                    {functionBookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Building2 className="w-12 h-12 mb-4" />
                        <p className="text-lg mb-2">No function bookings found</p>
                        <p className="text-sm mb-4 text-center">
                          {functionSearchTerm
                            ? 'Try adjusting your search terms'
                            : 'No event or function bookings available'}
                        </p>
                      </div>
                    ) : (
                      <DataGrid
                        rows={filteredFunctionBookings}
                        columns={functionBookingColumns}
                        getRowId={(row) => `func-${row.id}-${row.booking_reference}`}
                        initialState={{
                          pagination: {
                            paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 },
                          },
                        }}
                        pageSizeOptions={isMobile ? [5, 10] : [5, 10, 25]}
                        disableRowSelectionOnClick
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* =========================================== */}
        {/* QUOTATIONS TAB */}
        {/* =========================================== */}
        {activeTab === 'quotations' && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search quotations by number, customer, or phone..."
                      value={quotationSearchTerm}
                      onChange={(e) => setQuotationSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-full md:w-40">
                      <select
                        value={selectedQuotationStatus}
                        onChange={(e) => setSelectedQuotationStatus(e.target.value)}
                        className="w-full h-10 px-3 text-sm border rounded-md bg-background"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>


                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {filteredQuotations.length} of {quotations.length} quotations
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative px-0 md:px-6 min-h-[400px] flex items-center justify-center">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full"
                  style={{ height: isMobile ? 400 : 600 }}
                >
                  {quotations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileText className="w-12 h-12 mb-4" />
                      <p className="text-lg mb-2">No quotations found</p>
                      <p className="text-sm mb-4 text-center">
                        Create your first quotation to get started
                      </p>
                      <Button
                        onClick={() => setShowQuotationForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Quotation
                      </Button>
                    </div>
                  ) : (
                    <DataGrid
                      rows={filteredQuotations}
                      columns={quotationColumns}
                      getRowId={(row) => row._uniqueRowId || `quotation-${row.id || row.quotation_number}-${Math.random().toString(36).substr(2, 9)}`}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 },
                        },
                      }}
                      pageSizeOptions={isMobile ? [5, 10] : [5, 10, 25]}
                      disableRowSelectionOnClick
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* =========================================== */}
        {/* FOOTER STATS CARDS */}
        {/* =========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Total Bookings */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Active Bookings */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Bookings</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.status === 'booked').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Blocked Rooms */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blocked Rooms</p>
                  <p className="text-2xl font-bold text-red-600">
                    {bookings.filter(b => b.status === 'blocked').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Maintenance Rooms */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {bookings.filter(b => b.status === 'maintenance').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Function Bookings - Only for pro users */}
          {isProUser && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Function Bookings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {functionBookings.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {functionBookings.filter(b => b.status === 'confirmed').length} Confirmed
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* =========================================== */}
        {/* MODALS */}
        {/* =========================================== */}

        {/* Invoice Modal */}
        {selectedBookingId && (
          <InvoiceModal
            bookingId={selectedBookingId}
            source={isProUser ? 'database' : 'google_sheets'}
            bookingData={bookings.find(b => b.bookingId === selectedBookingId)}
            userData={currentUser}
            onClose={() => setSelectedBookingId(null)}
            onDownload={() => {
              if (isProUser) {
                downloadInvoice(selectedBookingId);
                setSelectedBookingId(null);
              }
            }}
          />
        )}

        {/* Function Booking Details Modal */}
        {showFunctionBookingDetails && selectedFunctionBooking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Function Booking Details</h2>
                    <p className="text-muted-foreground">
                      Reference: {selectedFunctionBooking.booking_reference}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFunctionBookingDetails(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Event Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Event Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Event Name:</span>
                          <span className="text-sm font-medium">{selectedFunctionBooking.event_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Event Type:</span>
                          <span className="text-sm capitalize">{selectedFunctionBooking.event_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Expected Guests:</span>
                          <span className="text-sm flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedFunctionBooking.guests_expected || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mt-4">
                        <MapPin className="h-4 w-4" />
                        Venue Details
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Function Room:</span>
                          <span className="text-sm font-medium">{selectedFunctionBooking.room_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Room Number:</span>
                          <span className="text-sm">{selectedFunctionBooking.room_number}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Date & Time
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Event Date:</span>
                          <span className="text-sm font-medium">{selectedFunctionBooking.booking_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Event Time:</span>
                          <span className="text-sm">
                            {selectedFunctionBooking.start_time} - {selectedFunctionBooking.end_time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mt-4">
                        <User className="h-4 w-4" />
                        Customer Information
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <span className="text-sm font-medium">{selectedFunctionBooking.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Phone:</span>
                          <span className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedFunctionBooking.customer_phone}
                          </span>
                        </div>
                        {selectedFunctionBooking.customer_email && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {selectedFunctionBooking.customer_email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accommodation Rooms */}
                {selectedFunctionBooking.has_room_bookings && selectedFunctionBooking.room_bookings && selectedFunctionBooking.room_bookings.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Home className="h-4 w-4" />
                      Accommodation Rooms ({selectedFunctionBooking.total_rooms_booked})
                    </h3>
                    <div className="space-y-2">
                      {selectedFunctionBooking.room_bookings.map((room: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-medium">Room {room.room_number}</span>
                            <span className="text-sm text-muted-foreground ml-2">({room.room_type})</span>
                          </div>
                          <div className="text-sm">
                            {formatDateForDisplay(room.from_date)} - {formatDateForDisplay(room.to_date)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                {selectedFunctionBooking.special_requests && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Special Requests</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedFunctionBooking.special_requests}
                    </p>
                  </div>
                )}

                {selectedFunctionBooking.catering_requirements && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Catering Requirements</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedFunctionBooking.catering_requirements}
                    </p>
                  </div>
                )}

                {/* Payment Details */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedFunctionBooking.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">GST ({selectedFunctionBooking.gst_percentage || 18}%):</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedFunctionBooking.gst || 0)}</span>
                    </div>
                    {selectedFunctionBooking.discount && selectedFunctionBooking.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="text-sm">Discount:</span>
                        <span className="text-sm font-medium">-{formatCurrency(selectedFunctionBooking.discount)}</span>
                      </div>
                    )}
                    {selectedFunctionBooking.other_charges && selectedFunctionBooking.other_charges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Other Charges:</span>
                        <span className="text-sm font-medium">{formatCurrency(selectedFunctionBooking.other_charges)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span className="text-primary">{formatCurrency(selectedFunctionBooking.total_amount)}</span>
                      </div>
                      {selectedFunctionBooking.advance_paid > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Advance Paid:</span>
                          <span className="font-medium text-green-600">{formatCurrency(selectedFunctionBooking.advance_paid)}</span>
                        </div>
                      )}
                      {selectedFunctionBooking.advance_paid > 0 && selectedFunctionBooking.total_amount > selectedFunctionBooking.advance_paid && (
                        <div className="flex justify-between text-sm font-medium mt-1">
                          <span>Balance Due:</span>
                          <span>{formatCurrency(selectedFunctionBooking.balance_due)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Payment Status:</span>
                      {getPaymentStatusBadge(selectedFunctionBooking.payment_status)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowFunctionBookingDetails(false)}
                  >
                    Close
                  </Button>
                  {/* <Button
                    variant="default"
                    onClick={() => {
                      downloadFunctionBookingInvoice(selectedFunctionBooking.id, selectedFunctionBooking.booking_reference);
                      setShowFunctionBookingDetails(false);
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button> */}

                  <Button
                    variant="default"
                    onClick={() => {
                      downloadFunctionBookingInvoicePDF(selectedFunctionBooking.id, selectedFunctionBooking.booking_reference);
                      setShowFunctionBookingDetails(false);
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Previous Booking Form Modal */}
        {showPreviousBookingForm && (
          <PreviousBookingForm
            open={showPreviousBookingForm}
            onClose={() => setShowPreviousBookingForm(false)}
            onSuccess={() => {
              fetchBookings();
              toast({
                title: "Previous Booking Added",
                description: "The booking has been recorded successfully",
                variant: "default"
              });
            }}
          />
        )}

        {/* Quotation Form Modal */}
        {showQuotationForm && (
          <QuotationForm
            open={showQuotationForm}
            onClose={() => setShowQuotationForm(false)}
            onSuccess={(quotationData) => {
              fetchQuotations();
              toast({
                title: "✅ Quotation Created",
                description: `Quotation ${quotationData.quotationNumber} generated successfully`,
                variant: "default"
              });
            }}
          />
        )}


        {/* Function Invoice Modal */}
        {showFunctionInvoiceModal && selectedFunctionInvoiceData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Function Booking Invoice</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFunctionInvoiceModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {selectedFunctionInvoiceData.data && (
                  <div className="space-y-6">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b pb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          Invoice #{selectedFunctionInvoiceData.data.invoiceNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Date: {selectedFunctionInvoiceData.data.invoiceDate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ref: {selectedFunctionInvoiceData.data.bookingReference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{selectedFunctionInvoiceData.data.hotel.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedFunctionInvoiceData.data.hotel.phone}</p>
                        <p className="text-sm text-muted-foreground">{selectedFunctionInvoiceData.data.hotel.email}</p>
                      </div>
                    </div>

                    {/* Customer & Event Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold mb-2">Customer Details</p>
                        <p className="text-sm">{selectedFunctionInvoiceData.data.customer.name}</p>
                        <p className="text-sm">{selectedFunctionInvoiceData.data.customer.phone}</p>
                        {selectedFunctionInvoiceData.data.customer.email && (
                          <p className="text-sm">{selectedFunctionInvoiceData.data.customer.email}</p>
                        )}
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold mb-2">Event Details</p>
                        <p className="text-sm font-medium">{selectedFunctionInvoiceData.data.event.name}</p>
                        <p className="text-sm">Type: {selectedFunctionInvoiceData.data.event.type}</p>
                        <p className="text-sm">Date: {selectedFunctionInvoiceData.data.event.date}</p>
                        <p className="text-sm">Time: {selectedFunctionInvoiceData.data.event.startTime} - {selectedFunctionInvoiceData.data.event.endTime}</p>
                        <p className="text-sm">Guests: {selectedFunctionInvoiceData.data.event.guestsExpected}</p>
                      </div>
                    </div>

                    {/* Accommodation Rooms */}
                    {selectedFunctionInvoiceData.data.accommodation && selectedFunctionInvoiceData.data.accommodation.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Accommodation Rooms</p>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-2 text-left">Room</th>
                                <th className="p-2 text-left">Check-in</th>
                                <th className="p-2 text-left">Check-out</th>
                                <th className="p-2 text-left">Nights</th>
                                <th className="p-2 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedFunctionInvoiceData.data.accommodation.map((room: any, index: number) => (
                                <tr key={index} className="border-t">
                                  <td className="p-2">Room {room.roomNumber}</td>
                                  <td className="p-2">{room.fromDate}</td>
                                  <td className="p-2">{room.toDate}</td>
                                  <td className="p-2">{room.nights}</td>
                                  <td className="p-2 text-right">₹{room.amount.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Charges Breakdown */}
                    <div>
                      <p className="font-semibold mb-2">Charges Breakdown</p>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left">Description</th>
                              <th className="p-2 text-right">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedFunctionInvoiceData.data.charges.map((charge: any, index: number) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{charge.description}</td>
                                <td className={`p-2 text-right ${charge.amount < 0 ? 'text-green-600' : ''}`}>
                                  {charge.amount < 0 ? '-' : ''}₹{Math.abs(charge.amount).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t font-semibold bg-gray-50">
                              <td className="p-2">Total Amount</td>
                              <td className="p-2 text-right text-primary">
                                ₹{selectedFunctionInvoiceData.data.totalAmount.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold mb-2">Payment Summary</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p className="font-medium capitalize">{selectedFunctionInvoiceData.data.payment.method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Status</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              selectedFunctionInvoiceData.data.payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                selectedFunctionInvoiceData.data.payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-orange-100 text-orange-800'
                            )}
                          >
                            {selectedFunctionInvoiceData.data.payment.status.toUpperCase()}
                          </Badge>
                        </div>
                        {selectedFunctionInvoiceData.data.advancePaid > 0 && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Advance Paid</p>
                              <p className="font-medium text-green-600">₹{selectedFunctionInvoiceData.data.advancePaid.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Balance Due</p>
                              <p className="font-medium">₹{selectedFunctionInvoiceData.data.balanceDue.toLocaleString('en-IN')}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedFunctionInvoiceData.data.specialRequests && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-semibold mb-1">Special Requests</p>
                        <p className="text-sm">{selectedFunctionInvoiceData.data.specialRequests}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-center text-xs text-muted-foreground border-t pt-4">
                      <p>{selectedFunctionInvoiceData.data.footer.note}</p>
                      <p className="mt-1">{selectedFunctionInvoiceData.data.footer.terms}</p>
                      <p className="mt-2">Generated by {selectedFunctionInvoiceData.data.footer.companyName}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t p-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFunctionInvoiceModal(false)}>
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    downloadFunctionBookingInvoicePDF(
                      selectedFunctionInvoiceData.data.bookingReference,
                      selectedFunctionInvoiceData.data.bookingReference
                    );
                    setShowFunctionInvoiceModal(false);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;