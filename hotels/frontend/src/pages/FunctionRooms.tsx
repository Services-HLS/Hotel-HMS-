import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, QrCode, Info, ChevronRight, ChevronLeft, Check, User } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AddRoomModal from '@/components/AddRoomModal';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Calendar as CalendarIcon,
  Users,
  IndianRupee,
  Wifi,
  Utensils,
  ParkingCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  Smartphone,
  Mail,
  CreditCard,
  Eye,
  Hotel,
  Bed,
  MinusCircle,
  Percent,
  Edit,
  Save,
  Bug
} from 'lucide-react';

// Import API functions
import {
  getFunctionRooms,
  deleteFunctionRoom,
  getFunctionRoomStats,
  getFunctionBookings,
  getFunctionBookingById,
  createFunctionBooking,
  checkFunctionRoomAvailability
} from '@/lib/functionRoomApi';

import {
  getAvailableRooms,
  createBooking,
  checkRoomAvailability as checkStandardRoomAvailability,
  searchCustomersByPhone,
  createCustomer,
  getAvailableRoomsCorrectly,
} from '@/lib/bookingApi';

import { FunctionRoom, FunctionBooking } from '@/types/hotel';

// ===========================================
// HELPER FUNCTIONS
// ===========================================

const getRoomIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'banquet': '🎉',
    'conference': '💼',
    'meeting': '🤝',
    'party': '🎊',
    'wedding': '💒',
    'seminar': '📚',
    'training': '📝',
    'other': '🏛️'
  };
  return icons[type] || '🏛️';
};

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; class: string }> = {
    'available': { label: 'Available', class: 'bg-green-100 text-green-800 border-green-200' },
    'booked': { label: 'Booked', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    'maintenance': { label: 'Maintenance', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'blocked': { label: 'Blocked', class: 'bg-red-100 text-red-800 border-red-200' },
    'confirmed': { label: 'Confirmed', class: 'bg-green-100 text-green-800 border-green-200' },
    'pending': { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'cancelled': { label: 'Cancelled', class: 'bg-red-100 text-red-800 border-red-200' },
    'completed': { label: 'Completed', class: 'bg-gray-100 text-gray-800 border-gray-200' }
  };
  const cfg = config[status] || { label: status, class: 'bg-gray-100 text-gray-800 border-gray-200' };
  return <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>;
};

const getPaymentBadge = (status: string) => {
  const config: Record<string, { label: string; class: string }> = {
    'completed': { label: 'Paid', class: 'bg-green-100 text-green-800 border-green-200' },
    'partial': { label: 'Partial', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'pending': { label: 'Pending', class: 'bg-orange-100 text-orange-800 border-orange-200' },
    'refunded': { label: 'Refunded', class: 'bg-purple-100 text-purple-800 border-purple-200' }
  };
  const cfg = config[status] || { label: status, class: 'bg-gray-100 text-gray-800 border-gray-200' };
  return <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

interface SelectedRoom {
  room_id: number;
  room_number: string;
  room_type: string;
  nights: number;
  check_in: string;
  check_out: string;
  price_per_night: number;
  total_price: number;
  guests: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

export default function FunctionRooms() {
  const navigate = useNavigate();
  const { toast } = useToast();



  // ===========================================
  // STATE
  // ===========================================

  // Main state
  const [rooms, setRooms] = useState<FunctionRoom[]>([]);
  const [bookings, setBookings] = useState<FunctionBooking[]>([]);
  const [standardRooms, setStandardRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Date selection for availability
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilityMap, setAvailabilityMap] = useState<Record<number, boolean>>({});
  const [checkingAvailability, setCheckingAvailability] = useState<Record<number, boolean>>({});

  // Tabs
  const [activeTab, setActiveTab] = useState('rooms');

  // Booking form modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<FunctionRoom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking details modal
  const [selectedBooking, setSelectedBooking] = useState<FunctionBooking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Room accommodation selection
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');

  // Customer search
  const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Multi-day & pricing
  const [bookingDays, setBookingDays] = useState<number>(1);
  const [customBasePrice, setCustomBasePrice] = useState<number>(0);
  const [customGstPercentage, setCustomGstPercentage] = useState<number>(18);
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [isEditingGst, setIsEditingGst] = useState<boolean>(false);
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [customDiscountType, setCustomDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [customOtherCharges, setCustomOtherCharges] = useState<number>(0);
  const [otherChargesDescription, setOtherChargesDescription] = useState<string>('');
  const [filteredBookingsByDate, setFilteredBookingsByDate] = useState<FunctionBooking[]>([]);
  const [editingRoomPricing, setEditingRoomPricing] = useState(false);
  const [customRoomSubtotal, setCustomRoomSubtotal] = useState(0);
  const [customRoomGstPercentage, setCustomRoomGstPercentage] = useState(18);
  const [isEditingRoomGst, setIsEditingRoomGst] = useState(false);

  // Payment QR Code states
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash' | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [hotelQRCode, setHotelQRCode] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  // Add this with your other state declarations
  // Replace your existing dateRange state with this
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(1)), // First day of current month
    to: new Date() // Today
  });

  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    function_room_id: 0,
    event_name: '',
    event_type: '',
    booking_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '10:00',
    end_time: '18:00',
    rate_type: 'full_day',
    guests_expected: 50,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_gst: '',
    billing_address: '',
    billing_state: '',
    billing_state_code: '',
    billing_city: '',
    billing_pincode: '',
    business_type: 'b2c',
    special_requests: '',
    catering_requirements: '',
    advance_paid: 0,
    payment_method: 'cash',
    has_room_bookings: false
  });

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isProUser = currentUser?.plan === 'pro' && currentUser?.source === 'database';


  useEffect(() => {
    const fetchHotelQRCode = async () => {
      if (currentUser?.source === 'database' && paymentMethod === 'online') {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/hotels/settings`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data?.qrcode_image) {
              setHotelQRCode(data.data.qrcode_image);
            }
          }
        } catch (error) {
          console.error('Error fetching hotel QR code:', error);
        }
      }
    };

    fetchHotelQRCode();
  }, [currentUser?.source, paymentMethod]);

  // Generate UPI QR Code
  const generateUPIQrCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Use hotel QR if available, otherwise generate dummy
      if (!hotelQRCode) {
        const upiId = 'hotel@upi'; // Replace with actual hotel UPI ID
        const merchantName = 'Hotel Management';
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${calculateGrandTotal()}&cu=INR&tn=${encodeURIComponent(transactionId)}`;
        setQrCodeData(upiString);
      }

      // Store transaction data
      localStorage.setItem('currentTransaction', JSON.stringify({
        id: `TXN${Date.now()}`,
        amount: calculateGrandTotal(),
        roomId: selectedRoom?.id,
        timestamp: Date.now()
      }));

      toast({
        title: "QR Code Generated",
        description: "Scan to pay",
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Verify payment
  const verifyPayment = async () => {
    setIsVerifyingPayment(true);

    // Simulate payment verification with 2 second delay
    setTimeout(() => {
      setPaymentStatus('completed');
      toast({
        title: "✅ Payment Successful",
        description: "Payment verified successfully!",
        variant: "default"
      });
      setIsVerifyingPayment(false);
    }, 2000);
  };

  // Add validation function for steps
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Event Details
        if (!bookingForm.event_name) {
          toast({ title: 'Event name required', variant: 'destructive' });
          return false;
        }
        if (!bookingForm.booking_date) {
          toast({ title: 'Event date required', variant: 'destructive' });
          return false;
        }
        if (!bookingForm.start_time || !bookingForm.end_time) {
          toast({ title: 'Event time required', variant: 'destructive' });
          return false;
        }
        return true;

      case 2: // Customer Information
        if (!bookingForm.customer_name) {
          toast({ title: 'Customer name required', variant: 'destructive' });
          return false;
        }
        if (!bookingForm.customer_phone || bookingForm.customer_phone.length < 10) {
          toast({ title: 'Valid phone number required', variant: 'destructive' });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // ===========================================
  // FETCH DATA
  // ===========================================

  const fetchFunctionRooms = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('🔄 Fetching function rooms...');
      const data = await getFunctionRooms();
      setRooms(data);

      await fetchStats();
      await fetchFunctionBookings();

      if (isRefresh) {
        toast({
          title: 'Success',
          description: `Loaded ${data.length} function rooms`,
        });
      }

    } catch (error: any) {
      console.error('❌ Error fetching function rooms:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load function rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getFunctionRoomStats('month');

      // Calculate available rooms properly
      const bookedRoomIdsOnSelectedDate = bookings
        .filter(booking => {
          const bookingDate = format(new Date(booking.booking_date), 'yyyy-MM-dd');
          const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
          return bookingDate === selectedDateStr;
        })
        .map(booking => booking.function_room_id);

      const availableCount = rooms.filter(room => {
        const isBookedOnDate = bookedRoomIdsOnSelectedDate.includes(room.id);
        const canBeBooked = room.status !== 'maintenance' && room.status !== 'blocked';
        return !isBookedOnDate && canBeBooked;
      }).length;

      setStats({
        roomStats: {
          total_rooms: rooms.length,
          available_rooms: availableCount,
          booked_rooms: rooms.filter(r => r.status === 'booked').length,
          maintenance_rooms: rooms.filter(r => r.status === 'maintenance').length,
          blocked_rooms: rooms.filter(r => r.status === 'blocked').length
        },
        bookingStats: {
          total_bookings: bookings.length,
          total_revenue: data?.bookingStats?.total_revenue || 0,
          total_advance: data?.bookingStats?.total_advance || 0,
          unique_customers: data?.bookingStats?.unique_customers || 0,
          avg_booking_value: data?.bookingStats?.avg_booking_value || 0
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFunctionBookings = async () => {
    try {
      console.log('📡 Fetching ALL function bookings...');
      // Remove the date filter to get ALL bookings
      const data = await getFunctionBookings({});
      console.log('✅ Received bookings data:', data);
      setBookings(data);
    } catch (error) {
      console.error('❌ Error fetching function bookings:', error);
      setBookings([]);
    }
  };


  const fetchStandardRooms = async (date?: string) => {
    try {
      // If no date provided, use the booking form date or today
      const checkDate = date || bookingForm.booking_date || format(selectedDate, 'yyyy-MM-dd');
      const checkOutDate = format(addDays(new Date(checkDate), 1), 'yyyy-MM-dd');

      console.log('🔍 Fetching rooms available from:', checkDate, 'to:', checkOutDate);

      // Use the corrected function
      const data = await getAvailableRoomsCorrectly({
        from_date: checkDate,
        to_date: checkOutDate
      });

      console.log('✅ API returned rooms:', data.length);
      console.log('📋 Rooms data:', data);

      setStandardRooms(data);
    } catch (error) {
      console.error('Error fetching standard rooms:', error);
      setStandardRooms([]);
    }
  };


  const fetchStatsForDateRange = async (from: Date, to: Date) => {
    try {
      console.log('📊 Fetching stats for date range:', { from, to });

      const fromDate = format(from, 'yyyy-MM-dd');
      const toDate = format(to, 'yyyy-MM-dd');

      // Filter function bookings by date range and STORE them
      const filtered = bookings.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        return bookingDate >= from && bookingDate <= to;
      });

      // Store filtered bookings for availability calculation
      setFilteredBookingsByDate(filtered);

      // Calculate total revenue
      const totalRevenue = filtered.reduce((sum, booking) => {
        const amount = booking.total_amount || 0;
        return sum + Number(amount);
      }, 0);

      const totalAdvance = filtered.reduce((sum, booking) => {
        const advance = booking.advance_paid || 0;
        return sum + Number(advance);
      }, 0);

      // Count unique customers
      const uniqueCustomers = new Set(
        filtered
          .map(b => b.customer_id)
          .filter(id => id != null)
      ).size;

      // Calculate average booking value
      const avgBookingValue = filtered.length > 0
        ? totalRevenue / filtered.length
        : 0;

      setStats({
        roomStats: {
          total_rooms: rooms.length,
          available_rooms: rooms.filter(r => r.status === 'available').length,
          booked_rooms: rooms.filter(r => r.status === 'booked').length,
          maintenance_rooms: rooms.filter(r => r.status === 'maintenance').length,
          blocked_rooms: rooms.filter(r => r.status === 'blocked').length
        },
        bookingStats: {
          total_bookings: filtered.length,
          total_revenue: totalRevenue,
          total_advance: totalAdvance,
          unique_customers: uniqueCustomers,
          avg_booking_value: avgBookingValue
        },
        period: {
          from: format(from, 'yyyy-MM-dd'),
          to: format(to, 'yyyy-MM-dd')
        }
      });

      toast({
        title: 'Statistics Updated',
        description: `Showing data from ${format(from, 'MMM d, yyyy')} to ${format(to, 'MMM d, yyyy')}`,
      });
    } catch (error) {
      console.error('Error fetching stats for date range:', error);
    }
  };

  // Update this function to use filteredBookingsByDate
  const calculateAvailableRooms = () => {
    if (rooms.length === 0) return 0;

    // Use filteredBookingsByDate instead of all bookings
    const bookingsToCheck = filteredBookingsByDate.length > 0 ? filteredBookingsByDate : bookings;

    // Get room IDs that are booked on selected date
    const bookedRoomIdsOnDate = bookingsToCheck
      .filter(booking => {
        const bookingDate = format(new Date(booking.booking_date), 'yyyy-MM-dd');
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        return bookingDate === selectedDateStr;
      })
      .map(booking => booking.function_room_id);

    console.log('Booked rooms on', format(selectedDate, 'yyyy-MM-dd'), ':', bookedRoomIdsOnDate);
    console.log('Using bookings:', bookingsToCheck.length, 'Filtered:', filteredBookingsByDate.length);

    // Count rooms that are:
    // 1. Not booked on selected date
    // 2. AND have status that allows booking (not maintenance/blocked)
    const availableCount = rooms.filter(room => {
      const isBookedOnDate = bookedRoomIdsOnDate.includes(room.id);
      const canBeBooked = room.status !== 'maintenance' && room.status !== 'blocked';

      return !isBookedOnDate && canBeBooked;
    }).length;

    return availableCount;
  };

  const calculateRoomsAvailableInPeriod = () => {
    if (rooms.length === 0 || !dateRange.from || !dateRange.to) return 0;

    // Get all room IDs that are booked ANYTIME in the selected period
    const bookedRoomIdsInPeriod = new Set(
      filteredBookingsByDate.map(booking => booking.function_room_id)
    );

    console.log('Booked rooms in period:', Array.from(bookedRoomIdsInPeriod));
    console.log('Total bookings in period:', filteredBookingsByDate.length);

    // Count rooms that are NOT booked in the period AND are available
    const availableCount = rooms.filter(room => {
      const isBookedInPeriod = bookedRoomIdsInPeriod.has(room.id);
      const canBeBooked = room.status !== 'maintenance' && room.status !== 'blocked';
      return !isBookedInPeriod && canBeBooked;
    }).length;

    return availableCount;
  };

  // Add this after your other useEffects (around line 300)
  useEffect(() => {
    if (bookings.length > 0) {
      // Initialize filteredBookingsByDate with current date range
      if (dateRange.from && dateRange.to) {
        const filtered = bookings.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          return bookingDate >= dateRange.from && bookingDate <= dateRange.to;
        });
        setFilteredBookingsByDate(filtered);
      } else {
        setFilteredBookingsByDate(bookings);
      }
    }
  }, [bookings, dateRange.from, dateRange.to]);


  useEffect(() => {
    console.log('🔄 bookingForm.booking_date CHANGED TO:', bookingForm.booking_date);
    if (bookingForm.booking_date && showBookingModal) {
      console.log('🔄 Calling fetchStandardRooms from useEffect');
      fetchStandardRooms(bookingForm.booking_date);
    }
  }, [bookingForm.booking_date, showBookingModal]);

  const checkAllRooms = async () => {
    try {
      // Call without date filters to see all rooms
      const allRooms = await getAvailableRooms(); // No params
      console.log('🏨 ALL ROOMS (no date filter):', allRooms);
    } catch (error) {
      console.error('Error fetching all rooms:', error);
    }
  };

  useEffect(() => {
    if (isProUser) {
      fetchFunctionRooms();
      fetchStandardRooms(format(selectedDate, 'yyyy-MM-dd'));
      checkAllRooms(); // ADD THIS LINE
    }
  }, [selectedDate, isProUser]);

  useEffect(() => {
    if (isProUser && activeTab === 'bookings') {
      fetchFunctionBookings();
    }
  }, [selectedDate, activeTab]);

  // ===========================================
  // CHECK AVAILABILITY FOR SELECTED DATE
  // ===========================================

  const checkRoomAvailability = async (roomId: number) => {
    try {
      setCheckingAvailability(prev => ({ ...prev, [roomId]: true }));

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log(`🔍 Checking availability for room ${roomId} on ${dateStr}`);

      const isAvailable = await checkFunctionRoomAvailability(
        roomId,
        dateStr,
        '00:00',
        '23:59'
      );

      setAvailabilityMap(prev => ({ ...prev, [roomId]: isAvailable }));
      return isAvailable;
    } catch (error) {
      console.error(`❌ Error checking availability for room ${roomId}:`, error);
      setAvailabilityMap(prev => ({ ...prev, [roomId]: false }));
      return false;
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [roomId]: false }));
    }
  };


  useEffect(() => {
    const checkAllRoomsAvailability = async () => {
      if (rooms.length > 0) {
        const availability: Record<number, boolean> = {};

        // Initialize all rooms as available by default
        rooms.forEach(room => {
          availability[room.id] = true;
        });

        // Then check actual availability from bookings
        for (const room of rooms) {
          try {
            const isAvailable = await checkFunctionRoomAvailability(
              room.id,
              format(selectedDate, 'yyyy-MM-dd'),
              '00:00',
              '23:59'
            );
            availability[room.id] = isAvailable;
            console.log(`Room ${room.id} (${room.name}) availability on ${format(selectedDate, 'yyyy-MM-dd')}:`, isAvailable);
          } catch (error) {
            console.error(`Error checking availability for room ${room.id}:`, error);
            // Keep as true (available) if there's an error, or set to false?
            // Since bookings are 0, they should be available
            availability[room.id] = true;
          }
        }

        console.log('Final availability map:', availability);
        setAvailabilityMap(availability);
      }
    };

    if (rooms.length > 0) {
      checkAllRoomsAvailability();
    }
  }, [selectedDate, rooms]);

  // ===========================================
  // BOOKING FORM HANDLERS
  // ===========================================

  const handleOpenBookingModal = async (room: FunctionRoom) => {
    try {
      const isAvailable = await checkRoomAvailability(room.id);

      if (isAvailable) {
        setSelectedRoom(room);
        setCustomBasePrice(room.base_price);
        setBookingDays(1);
        setCustomGstPercentage(18);
        setCustomDiscount(0);
        setCustomOtherCharges(0);
        setSelectedRooms([]);
        setSelectedCustomer(null);
        setBookingForm({
          function_room_id: room.id,
          event_name: '',
          event_type: room.type,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: '10:00',
          end_time: '18:00',
          rate_type: 'full_day',
          guests_expected: Math.min(room.capacity, 50),
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          customer_gst: '',
          billing_address: '',
          billing_state: '',
          billing_state_code: '',
          billing_city: '',
          billing_pincode: '',
          business_type: 'b2c',
          special_requests: '',
          catering_requirements: '',
          advance_paid: 0,
          payment_method: 'cash',
          has_room_bookings: false
        });
        setShowBookingModal(true);
      } else {
        toast({
          title: 'Not Available',
          description: `"${room.name}" is already booked for ${format(selectedDate, 'MMMM d, yyyy')}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  // ===========================================
  // CUSTOMER HANDLERS
  // ===========================================

  // const handleCustomerPhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const rawPhone = e.target.value;
  //   const digitsOnly = rawPhone.replace(/\D/g, '');
  //   const limitedPhone = digitsOnly.slice(0, 10);

  //   setBookingForm({ ...bookingForm, customer_phone: limitedPhone });

  //   if (limitedPhone.length === 10) {
  //     console.log('🔍 Searching for customer with phone:', limitedPhone);
  //     try {
  //       const customers = await searchCustomersByPhone(limitedPhone);
  //       console.log('✅ Found customers:', customers);
  //       setFoundCustomers(customers || []);
  //       setShowCustomerSearch(customers && customers.length > 0);
  //     } catch (error) {
  //       console.error('❌ Error searching customers:', error);
  //       setFoundCustomers([]);
  //       setShowCustomerSearch(false);
  //     }
  //   } else {
  //     setShowCustomerSearch(false);
  //     setFoundCustomers([]);
  //     setSelectedCustomer(null);
  //   }
  // };

  const handleCustomerPhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawPhone = e.target.value;
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const limitedPhone = digitsOnly.slice(0, 10);

    console.log('Raw input:', rawPhone);
    console.log('Digits only:', digitsOnly);
    console.log('Limited phone (sending to API):', limitedPhone);

    setBookingForm({ ...bookingForm, customer_phone: limitedPhone });

    if (limitedPhone.length === 10) {
      console.log('🔍 Searching for customer with phone:', limitedPhone);
      try {
        const customers = await searchCustomersByPhone(limitedPhone);
        console.log('✅ API Response:', customers);
        console.log('Found customers count:', customers?.length);
        setFoundCustomers(customers || []);
        setShowCustomerSearch(customers && customers.length > 0);
      } catch (error) {
        console.error('❌ Error searching customers:', error);
        setFoundCustomers([]);
        setShowCustomerSearch(false);
      }
    } else {
      setShowCustomerSearch(false);
      setFoundCustomers([]);
      setSelectedCustomer(null);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setBookingForm({
      ...bookingForm,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email || ''
    });
    setShowCustomerSearch(false);
    setFoundCustomers([]);
  };

  // ===========================================
  // ROOM SELECTION HANDLERS
  // ===========================================

  const addRoomToSelection = async (room: any) => {
    const checkIn = bookingForm.booking_date;
    const checkOutDate = addDays(new Date(checkIn), 1);
    const checkOut = format(checkOutDate, 'yyyy-MM-dd');

    if (selectedRooms.some(r => r.room_id === room.id)) {
      toast({
        title: 'Room already selected',
        description: `Room ${room.room_number} is already in your selection`,
        variant: 'destructive'
      });
      return;
    }

    const isAvailable = await checkStandardRoomAvailability(room.id, checkIn, checkOut);

    if (!isAvailable) {
      toast({
        title: 'Room not available',
        description: `Room ${room.room_number} is not available for the selected dates`,
        variant: 'destructive'
      });
      return;
    }

    const pricePerNight = Number(room.price) || 0;

    setSelectedRooms([
      ...selectedRooms,
      {
        room_id: room.id,
        room_number: room.room_number,
        room_type: room.type,
        nights: 1,
        check_in: checkIn,
        check_out: checkOut,
        price_per_night: pricePerNight,
        total_price: pricePerNight,
        guests: 2
      }
    ]);

    setBookingForm({
      ...bookingForm,
      has_room_bookings: true
    });

    toast({
      title: 'Room added',
      description: `Room ${room.room_number} added to your booking`
    });
  };

  const removeRoomFromSelection = (roomId: number) => {
    setSelectedRooms(selectedRooms.filter(r => r.room_id !== roomId));
    if (selectedRooms.length === 1) {
      setBookingForm({
        ...bookingForm,
        has_room_bookings: false
      });
    }
  };

  const updateRoomNights = (roomId: number, nights: number) => {
    if (nights < 1) return;
    setSelectedRooms(selectedRooms.map(room => {
      if (room.room_id === roomId) {
        const checkIn = new Date(room.check_in);
        const checkOut = addDays(checkIn, nights);
        const pricePerNight = Number(room.price_per_night) || 0;
        const totalPrice = pricePerNight * nights;
        return {
          ...room,
          nights,
          check_out: format(checkOut, 'yyyy-MM-dd'),
          total_price: totalPrice
        };
      }
      return room;
    }));
  };

  const updateRoomGuests = (roomId: number, guests: number) => {
    if (guests < 1 || guests > 4) return;
    setSelectedRooms(selectedRooms.map(room => {
      if (room.room_id === roomId) {
        return { ...room, guests };
      }
      return room;
    }));
  };

  // ===========================================
  // PRICE CALCULATIONS
  // ===========================================

  useEffect(() => {
    if (selectedRoom) {
      let basePrice = selectedRoom.base_price * bookingDays;

      const start = new Date(`2000-01-01T${bookingForm.start_time}`);
      const end = new Date(`2000-01-01T${bookingForm.end_time}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (bookingDays === 1) {
        if (hours <= 4 && selectedRoom.half_day_price) {
          basePrice = selectedRoom.half_day_price;
        } else if (hours <= 2 && selectedRoom.hourly_rate) {
          basePrice = selectedRoom.hourly_rate * hours;
        }
      }
      setCustomBasePrice(basePrice);
    }
  }, [selectedRoom, bookingDays, bookingForm.start_time, bookingForm.end_time]);

  const calculateSubtotal = (): number => {
    return Number(customBasePrice) || 0;
  };

  const calculateGST = (): number => {
    const subtotal = calculateSubtotal();
    const gstPercent = Number(customGstPercentage) || 0;
    return (subtotal * gstPercent) / 100;
  };

  const calculateDiscount = (): number => {
    const subtotal = calculateSubtotal();
    const discountValue = Number(customDiscount) || 0;
    if (customDiscountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    } else {
      return discountValue;
    }
  };

  const calculateFunctionTotal = (): number => {
    const subtotal = calculateSubtotal();
    const gst = calculateGST();
    const discount = calculateDiscount();
    const otherCharges = Number(customOtherCharges) || 0;
    return Number(subtotal) + Number(gst) - Number(discount) + Number(otherCharges);
  };

  const calculateRoomTotal = (): number => {
    return selectedRooms.reduce((sum, room) => {
      return Number(sum) + Number(room.total_price || 0);
    }, 0);
  };

  const calculateRoomGST = (): number => {
    const roomTotal = calculateRoomTotal();
    return (Number(roomTotal) * 18) / 100;
  };

  // const calculateGrandTotal = (): number => {
  //   const functionTotal = calculateFunctionTotal();
  //   const roomTotal = calculateRoomTotal();
  //   const roomGST = calculateRoomGST();
  //   return Number(functionTotal) + Number(roomTotal) + Number(roomGST);
  // };




  // ===========================================
  // BOOKING SUBMISSION
  // ===========================================


  const calculateRoomTotalWithGst = (): number => {
    if (selectedRooms.length === 0) return 0;

    // Use custom values if they've been set (either from edit or initialized)
    const roomSubtotal = customRoomSubtotal > 0 ? customRoomSubtotal : calculateRoomTotal();
    const roomGst = (roomSubtotal * customRoomGstPercentage) / 100;

    return roomSubtotal + roomGst;
  };

  const calculateGrandTotal = (): number => {
    const functionTotal = calculateFunctionTotal();
    const roomTotalWithGst = calculateRoomTotalWithGst();
    return Number(functionTotal) + Number(roomTotalWithGst);
  };
  // Add this to reset room pricing when closing modal
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedRoom(null);
    setSelectedRooms([]);
    setEditingRoomPricing(false);
    setCustomRoomSubtotal(0); // Reset to 0 so it recalculates next time
    setCustomRoomGstPercentage(18);
    setIsEditingRoomGst(false);
    setPaymentMethod(null);
    setPaymentStatus('pending');
    setQrCodeData('');
    setActiveStep(1);
  };

  // Add this with your other useEffect hooks
  useEffect(() => {
    if (selectedRooms.length > 0 && customRoomSubtotal === 0) {
      // Initialize custom values with calculated totals
      setCustomRoomSubtotal(calculateRoomTotal());
      setCustomRoomGstPercentage(18);
    }
  }, [selectedRooms]);
  // const handleBookingSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!selectedRoom) {
  //     toast({
  //       title: 'Error',
  //       description: 'No function room selected',
  //       variant: 'destructive'
  //     });
  //     return;
  //   }

  //   if (!bookingForm.event_name || !bookingForm.customer_name || !bookingForm.customer_phone) {
  //     toast({
  //       title: 'Validation Error',
  //       description: 'Event name, customer name and phone are required',
  //       variant: 'destructive'
  //     });
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const eventStartDate = bookingForm.booking_date;
  //     const eventEndDate = format(addDays(new Date(eventStartDate), bookingDays - 1), 'yyyy-MM-dd');

  //     // Check function room availability
  //     const isFunctionRoomAvailable = await checkFunctionRoomAvailability(
  //       selectedRoom.id,
  //       eventStartDate,
  //       bookingForm.start_time,
  //       bookingForm.end_time
  //     );

  //     if (!isFunctionRoomAvailable) {
  //       toast({
  //         title: 'Not Available',
  //         description: `"${selectedRoom.name}" is already booked for ${format(new Date(eventStartDate), 'MMM d, yyyy')}`,
  //         variant: 'destructive'
  //       });
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // Check standard rooms availability
  //     if (selectedRooms.length > 0) {
  //       for (const room of selectedRooms) {
  //         const isAvailable = await checkStandardRoomAvailability(  // <-- Use the renamed function
  //           room.room_id,
  //           room.check_in,
  //           room.check_out
  //         );
  //         if (!isAvailable) {
  //           toast({
  //             title: 'Room Not Available',
  //             description: `Room ${room.room_number} is already booked for ${format(new Date(room.check_in), 'MMM d, yyyy')}`,
  //             variant: 'destructive'
  //           });
  //           setIsSubmitting(false);
  //           return;
  //         }
  //       }
  //     }

  //     // Calculate pricing
  //     let finalPrice = customBasePrice;
  //     let rateType = bookingDays > 1 ? 'multi_day' : 'full_day';

  //     if (bookingDays === 1) {
  //       const start = new Date(`2000-01-01T${bookingForm.start_time}`);
  //       const end = new Date(`2000-01-01T${bookingForm.end_time}`);
  //       const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  //       if (hours <= 4 && selectedRoom.half_day_price) {
  //         finalPrice = Number(selectedRoom.half_day_price) || 0;
  //         rateType = 'half_day';
  //       } else if (hours <= 2 && selectedRoom.hourly_rate) {
  //         const hourlyRate = Number(selectedRoom.hourly_rate) || 0;
  //         finalPrice = hourlyRate * hours;
  //         rateType = 'hourly';
  //       }
  //     }

  //     // Handle customer
  //     let customerId = null;
  //     const cleanPhone = bookingForm.customer_phone.replace(/\D/g, '');
  //     const formattedPhone = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;

  //     if (selectedCustomer) {
  //       customerId = selectedCustomer.id;
  //     } else {
  //       try {
  //         const existingCustomers = await searchCustomersByPhone(formattedPhone);
  //         if (existingCustomers && existingCustomers.length > 0) {
  //           customerId = existingCustomers[0].id;
  //         } else {
  //           const newCustomer = await createCustomer({
  //             name: bookingForm.customer_name,
  //             phone: formattedPhone,
  //             email: bookingForm.customer_email || null
  //           });
  //           customerId = newCustomer?.data?.customerId || newCustomer?.customerId;
  //         }
  //       } catch (error) {
  //         console.error('❌ Customer handling error:', error);
  //       }
  //     }

  //     // Create room bookings
  //     const roomBookingIds: number[] = [];
  //     if (selectedRooms.length > 0) {
  //       for (const room of selectedRooms) {
  //         try {
  //           const roomBookingData = {
  //             room_id: room.room_id,
  //             customer_id: customerId,
  //             from_date: room.check_in,
  //             to_date: room.check_out,
  //             amount: Number(room.total_price) || 0,
  //             service: 0,
  //             gst: (Number(room.total_price) * 0.18) || 0,
  //             total: (Number(room.total_price) * 1.18) || 0,
  //             status: 'booked',
  //             guests: room.guests || 2,
  //             payment_method: bookingForm.payment_method,
  //             payment_status: bookingForm.advance_paid > 0 ? 'partial' : 'pending',
  //             customer_name: bookingForm.customer_name,
  //             customer_phone: bookingForm.customer_phone,
  //             customer_email: bookingForm.customer_email || null
  //           };
  //           const roomBookingResult = await createBooking(roomBookingData);
  //           if (roomBookingResult && roomBookingResult.success) {
  //             roomBookingIds.push(roomBookingResult.data.bookingId);
  //           }
  //         } catch (error) {
  //           console.error('Error creating room booking:', error);
  //         }
  //       }
  //     }

  //     // Create function booking
  //     const functionBookingData = {
  //       function_room_id: selectedRoom.id,
  //       event_name: bookingForm.event_name,
  //       event_type: bookingForm.event_type || selectedRoom.type,
  //       booking_date: eventStartDate,
  //       end_date: eventEndDate,
  //       booking_days: bookingDays,
  //       start_time: bookingForm.start_time,
  //       end_time: bookingForm.end_time,
  //       rate_type: rateType,
  //       rate_amount: finalPrice,
  //       subtotal: finalPrice,
  //       service_charge: 0,
  //       gst_percentage: customGstPercentage,
  //       gst: calculateGST(),
  //       discount: calculateDiscount(),
  //       discount_type: customDiscountType,
  //       other_charges: customOtherCharges,
  //       other_charges_description: otherChargesDescription || null,
  //       total_amount: calculateFunctionTotal(),
  //       advance_paid: Number(bookingForm.advance_paid) || 0,
  //       guests_expected: Number(bookingForm.guests_expected) || 1,
  //       payment_method: bookingForm.payment_method,
  //       payment_status: bookingForm.advance_paid > 0 ? 'partial' : 'pending',
  //       status: 'confirmed',
  //       customer_name: bookingForm.customer_name,
  //       customer_phone: bookingForm.customer_phone,
  //       customer_email: bookingForm.customer_email || null,
  //       special_requests: bookingForm.special_requests || null,
  //       catering_requirements: bookingForm.catering_requirements || null,
  //       customer_id: customerId,
  //       has_room_bookings: selectedRooms.length > 0,
  //       room_booking_ids: JSON.stringify(roomBookingIds),
  //       total_rooms_booked: selectedRooms.length
  //     };

  //     console.log('📤 Creating function booking:', functionBookingData);
  //     const result = await createFunctionBooking(functionBookingData);

  //     if (result && result.success) {
  //       toast({
  //         title: '✅ Booking Created Successfully',
  //         description: `Booking reference: ${result.data.booking_reference}`,
  //       });

  //       // Close modal and reset
  //       setShowBookingModal(false);
  //       setSelectedRoom(null);
  //       setSelectedRooms([]);
  //       setSelectedCustomer(null);
  //       setBookingDays(1);
  //       setCustomGstPercentage(18);
  //       setCustomDiscount(0);
  //       setCustomOtherCharges(0);

  //       // Refresh data
  //       fetchFunctionRooms();
  //       fetchFunctionBookings();
  //     } else {
  //       throw new Error(result?.message || 'Failed to create booking');
  //     }

  //   } catch (error: any) {
  //     console.error('❌ Booking error:', error);
  //     toast({
  //       title: 'Error',
  //       description: error.message || 'Failed to create booking. Please try again.',
  //       variant: 'destructive'
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };



  // ===========================================
  // BOOKING DETAILS
  // ===========================================


  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom) {
      toast({
        title: 'Error',
        description: 'No function room selected',
        variant: 'destructive'
      });
      return;
    }

    if (!bookingForm.event_name || !bookingForm.customer_name || !bookingForm.customer_phone) {
      toast({
        title: 'Validation Error',
        description: 'Event name, customer name and phone are required',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const eventStartDate = bookingForm.booking_date;
      const eventEndDate = format(addDays(new Date(eventStartDate), bookingDays - 1), 'yyyy-MM-dd');

      // Check function room availability
      const isFunctionRoomAvailable = await checkFunctionRoomAvailability(
        selectedRoom.id,
        eventStartDate,
        bookingForm.start_time,
        bookingForm.end_time
      );

      if (!isFunctionRoomAvailable) {
        toast({
          title: 'Not Available',
          description: `"${selectedRoom.name}" is already booked for ${format(new Date(eventStartDate), 'MMM d, yyyy')}`,
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      // Check standard rooms availability
      if (selectedRooms.length > 0) {
        for (const room of selectedRooms) {
          const isAvailable = await checkStandardRoomAvailability(
            room.room_id,
            room.check_in,
            room.check_out
          );
          if (!isAvailable) {
            toast({
              title: 'Room Not Available',
              description: `Room ${room.room_number} is already booked for ${format(new Date(room.check_in), 'MMM d, yyyy')}`,
              variant: 'destructive'
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Calculate function room pricing
      let finalPrice = customBasePrice;
      let rateType = bookingDays > 1 ? 'multi_day' : 'full_day';

      if (bookingDays === 1) {
        const start = new Date(`2000-01-01T${bookingForm.start_time}`);
        const end = new Date(`2000-01-01T${bookingForm.end_time}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (hours <= 4 && selectedRoom.half_day_price) {
          finalPrice = Number(selectedRoom.half_day_price) || 0;
          rateType = 'half_day';
        } else if (hours <= 2 && selectedRoom.hourly_rate) {
          const hourlyRate = Number(selectedRoom.hourly_rate) || 0;
          finalPrice = hourlyRate * hours;
          rateType = 'hourly';
        }
      }

      // Handle customer
      let customerId = null;
      const cleanPhone = bookingForm.customer_phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;

      if (selectedCustomer) {
        customerId = selectedCustomer.id;
      } else {
        try {
          const existingCustomers = await searchCustomersByPhone(formattedPhone);
          if (existingCustomers && existingCustomers.length > 0) {
            customerId = existingCustomers[0].id;
          } else {
            const newCustomer = await createCustomer({
              name: bookingForm.customer_name,
              phone: formattedPhone,
              email: bookingForm.customer_email || null
            });
            customerId = newCustomer?.data?.customerId || newCustomer?.customerId;
          }
        } catch (error) {
          console.error('❌ Customer handling error:', error);
        }
      }

      // Create room bookings with edited prices if applicable
      const roomBookingIds: number[] = [];
      let totalRoomAmount = 0;
      let totalRoomGst = 0;

      if (selectedRooms.length > 0) {
        // Use edited prices if available, otherwise calculate from selected rooms
        const roomSubtotal = customRoomSubtotal > 0 ? customRoomSubtotal : calculateRoomTotal();
        const roomGstPercentage = customRoomGstPercentage;
        const roomGst = (roomSubtotal * roomGstPercentage) / 100;

        totalRoomAmount = roomSubtotal;
        totalRoomGst = roomGst;

        for (const room of selectedRooms) {
          try {
            // Calculate proportion for this room if we're using edited total
            let roomAmount = room.total_price;
            if (customRoomSubtotal > 0 && customRoomSubtotal !== calculateRoomTotal()) {
              // If edited total is different, distribute proportionally
              const originalTotal = calculateRoomTotal();
              const proportion = originalTotal > 0 ? room.total_price / originalTotal : 1 / selectedRooms.length;
              roomAmount = Math.round(customRoomSubtotal * proportion);
            }

            const roomBookingData = {
              room_id: room.room_id,
              customer_id: customerId,
              from_date: room.check_in,
              to_date: room.check_out,
              amount: Number(roomAmount) || 0,
              service: 0,
              gst: Number(roomAmount * roomGstPercentage / 100) || 0,
              total: Number(roomAmount * (1 + roomGstPercentage / 100)) || 0,
              status: 'booked',
              guests: room.guests || 2,
              payment_method: bookingForm.payment_method,
              payment_status: bookingForm.advance_paid > 0 ? 'partial' : 'pending',
              customer_name: bookingForm.customer_name,
              customer_phone: bookingForm.customer_phone,
              customer_email: bookingForm.customer_email || null,
              // Add GST fields to room booking
              customer_gst: bookingForm.customer_gst || null,
              billing_address: bookingForm.billing_address || null,
              billing_state: bookingForm.billing_state || null,
              billing_state_code: bookingForm.billing_state_code || null,
              billing_city: bookingForm.billing_city || null,
              billing_pincode: bookingForm.billing_pincode || null,
              business_type: bookingForm.business_type || 'b2c'
            };

            const roomBookingResult = await createBooking(roomBookingData);
            if (roomBookingResult && roomBookingResult.success) {
              roomBookingIds.push(roomBookingResult.data.bookingId);
            }
          } catch (error) {
            console.error('Error creating room booking:', error);
          }
        }
      }

      // Create function booking with all details including GST
      const functionBookingData = {
        function_room_id: selectedRoom.id,
        event_name: bookingForm.event_name,
        event_type: bookingForm.event_type || selectedRoom.type,
        booking_date: eventStartDate,
        end_date: eventEndDate,
        booking_days: bookingDays,
        start_time: bookingForm.start_time,
        end_time: bookingForm.end_time,
        rate_type: rateType,
        rate_amount: finalPrice,
        subtotal: finalPrice,
        service_charge: 0,
        gst_percentage: customGstPercentage,
        gst: calculateGST(),
        discount: calculateDiscount(),
        discount_type: customDiscountType,
        other_charges: customOtherCharges,
        other_charges_description: otherChargesDescription || null,
        total_amount: calculateFunctionTotal(),
        advance_paid: Number(bookingForm.advance_paid) || 0,
        guests_expected: Number(bookingForm.guests_expected) || 1,
        payment_method: bookingForm.payment_method,
        payment_status: bookingForm.advance_paid > 0 ? 'partial' : 'pending',
        status: 'confirmed',

        // Customer details with GST
        customer_name: bookingForm.customer_name,
        customer_phone: bookingForm.customer_phone,
        customer_email: bookingForm.customer_email || null,
        customer_gst: bookingForm.customer_gst || null,
        billing_address: bookingForm.billing_address || null,
        billing_state: bookingForm.billing_state || null,
        billing_state_code: bookingForm.billing_state_code || null,
        billing_city: bookingForm.billing_city || null,
        billing_pincode: bookingForm.billing_pincode || null,
        business_type: bookingForm.business_type || 'b2c',

        customer_id: customerId,

        // Room booking details with edited amounts
        has_room_bookings: selectedRooms.length > 0,
        room_booking_ids: JSON.stringify(roomBookingIds),
        total_rooms_booked: selectedRooms.length,
        total_room_amount: totalRoomAmount,
        total_room_gst: totalRoomGst,
        total_room_gst_percentage: customRoomGstPercentage,

        // Special requests
        special_requests: bookingForm.special_requests || null,
        catering_requirements: bookingForm.catering_requirements || null
      };

      console.log('📤 Creating function booking with edited prices:', functionBookingData);
      const result = await createFunctionBooking(functionBookingData);

      if (result && result.success) {
        toast({
          title: '✅ Booking Created Successfully',
          description: `Booking reference: ${result.data.booking_reference}`,
        });

        // Close modal and reset
        handleCloseBookingModal();

        // Refresh data
        fetchFunctionRooms();
        fetchFunctionBookings();
      } else {
        throw new Error(result?.message || 'Failed to create booking');
      }

    } catch (error: any) {
      console.error('❌ Booking error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewBookingDetails = async (booking: FunctionBooking) => {
    try {
      const data = await getFunctionBookingById(booking.id);
      if (data) {
        setSelectedBooking(data);
        setShowBookingDetails(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load booking details',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (bookings.length > 0 && dateRange.from && dateRange.to) {
      fetchStatsForDateRange(dateRange.from, dateRange.to);
    }
  }, [bookings, dateRange.from, dateRange.to]); // Remove selectedDate and rooms from here


  // ===========================================
  // DELETE HANDLER
  // ===========================================

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteFunctionRoom(id);
      toast({
        title: 'Success',
        description: 'Function room deleted successfully',
      });
      fetchFunctionRooms();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete function room',
        variant: 'destructive',
      });
    }
  };

  // ===========================================
  // FILTERS
  // ===========================================

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const filteredStandardRooms = standardRooms
    .filter(room => {
      // Apply search filter
      const matchesSearch = roomSearchTerm === '' ||
        room.room_number?.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
        room.type?.toLowerCase().includes(roomSearchTerm.toLowerCase());

      // Apply type filter
      const matchesType = roomTypeFilter === 'all' || room.type === roomTypeFilter;

      return matchesSearch && matchesType;
    });

  // Get unique room types for the filter dropdown
  const roomTypes = ['all', ...new Set(standardRooms.map(r => r.type).filter(Boolean))];


  const filteredBookings = bookings.filter(booking =>
    booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // ===========================================
  // RENDER
  // ===========================================

  if (!isProUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">PRO Plan Feature</CardTitle>
              <p className="text-muted-foreground mt-2">
                Function room management is available exclusively for PRO plan users.
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4 pt-4">
              <Button
                onClick={() => navigate('/upgrade')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade to PRO
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Function Rooms
              </h1>
              {/* <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                PRO Plan
              </Badge> */}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage banquet halls, conference rooms, and event spaces
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchFunctionRooms(true)}
              variant="outline"
              disabled={refreshing}
              className="border-2"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Function Room
            </Button>
          </div>
        </div>




        <Card className="border-none shadow-md">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">Statistics Period:</span>
            </div>

            <Popover open={showDateRangePicker} onOpenChange={setShowDateRangePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-auto border-2 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      // Type assertion to handle the DateRange type
                      const newRange = {
                        from: range.from,
                        to: range.to
                      };
                      setDateRange(newRange);
                      fetchStatsForDateRange(range.from, range.to);
                      setShowDateRangePicker(false);
                    }
                  }}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Quick date range buttons */}
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  setDateRange({ from: firstDay, to: today });
                  fetchStatsForDateRange(firstDay, today);
                }}
              >
                This Month
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  setDateRange({ from: thirtyDaysAgo, to: today });
                  fetchStatsForDateRange(thirtyDaysAgo, today);
                }}
              >
                Last 30 Days
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Statistics Cards */}
        {stats && (
          <>
            {/* Date range indicator */}
            {dateRange.from && dateRange.to && (
              <div className="text-sm text-muted-foreground mb-2">
                Showing data from {format(dateRange.from, 'MMMM d, yyyy')} to {format(dateRange.to, 'MMMM d, yyyy')}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Function Rooms */}
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Function Rooms</p>
                    <p className="text-2xl font-bold">{rooms.length || 0}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-primary" />
                </CardContent>
              </Card>

              {/* Available Function Rooms - For the selected period */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Available in selected period
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {calculateRoomsAvailableInPeriod()}
                    </p>

                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Booked Function Rooms - For the selected period */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Events {dateRange.from && dateRange.to && '(Selected Period)'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.bookingStats?.total_bookings || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Revenue - For the selected period */}
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Revenue {dateRange.from && dateRange.to && '(Selected Period)'}
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      ₹{(stats.bookingStats?.total_revenue || 0).toLocaleString('en-IN')}
                    </p>
                    {stats.bookingStats?.avg_booking_value > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: ₹{Math.round(stats.bookingStats.avg_booking_value || 0).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  <IndianRupee className="h-8 w-8 text-amber-600" />
                </CardContent>
              </Card>
            </div>
          </>
        )}




        {/* Date Selector for Availability */}
        <Card className="border-none shadow-md">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">Check Availability for:</span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-auto border-2"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              {Object.values(availabilityMap).filter(Boolean).length} rooms available on this date
            </p>
          </CardContent>
        </Card>


        {/* Main Tabs - Rooms and Bookings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Responsive TabsList */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-4">
            <TabsList className="inline-flex w-full min-w-[250px] sm:grid sm:grid-cols-2 gap-2 bg-transparent sm:bg-muted p-1">
              <TabsTrigger
                value="rooms"
                className={`
          flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
          data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
          data-[state=active]:shadow-md data-[state=active]:font-semibold
          data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700
          hover:bg-gray-200 hover:text-gray-900
          transition-all duration-200
          rounded-md whitespace-nowrap
          border-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent
        `}
              >
                <Building2 className={`h-4 w-4 ${activeTab === 'rooms' ? 'text-white' : 'text-gray-600'}`} />
                <span>Function Venues</span>
                {rooms.length > 0 && (
                  <Badge
                    variant="outline"
                    className={`
              ml-1 px-1.5 py-0 text-xs
              ${activeTab === 'rooms'
                        ? 'bg-primary-foreground text-primary border-primary-foreground'
                        : 'bg-gray-200 text-gray-700 border-gray-200'}
            `}
                  >
                    {rooms.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="bookings"
                className={`
          flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
          data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
          data-[state=active]:shadow-md data-[state=active]:font-semibold
          data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700
          hover:bg-gray-200 hover:text-gray-900
          transition-all duration-200
          rounded-md whitespace-nowrap
          border-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent
        `}
              >
                <CalendarIcon className={`h-4 w-4 ${activeTab === 'bookings' ? 'text-white' : 'text-gray-600'}`} />
                <span>Event Bookings</span>
                {bookings.length > 0 && (
                  <Badge
                    variant="outline"
                    className={`
              ml-1 px-1.5 py-0 text-xs
              ${activeTab === 'bookings'
                        ? 'bg-primary-foreground text-primary border-primary-foreground'
                        : 'bg-gray-200 text-gray-700 border-gray-200'}
            `}
                  >
                    {bookings.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* =========================================== */}
          {/* ROOMS TAB - Function Rooms List */}
          {/* =========================================== */}
          <TabsContent value="rooms" className="space-y-6">
            {/* Search */}
            <Card className="border-none shadow-md">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search function rooms by name, number, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rooms List */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading function rooms...</p>
                </div>
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-3xl">{getRoomIcon(room.type)}</span>
                              <div>
                                <h3 className="text-lg font-semibold">{room.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Room {room.room_number} • Floor {room.floor}
                                </p>
                              </div>
                              {getStatusBadge(room.status)}
                              {availabilityMap[room.id] !== undefined && (
                                <Badge
                                  variant="outline"
                                  className={availabilityMap[room.id]
                                    ? 'bg-green-100 text-green-800 border-green-200 ml-2'
                                    : 'bg-red-100 text-red-800 border-red-200 ml-2'
                                  }
                                >
                                  {availabilityMap[room.id]
                                    ? `✓ Available on ${format(selectedDate, 'MMM d')}`
                                    : `✗ Booked on ${format(selectedDate, 'MMM d')}`
                                  }
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-muted-foreground block text-xs">Type</span>
                                <div className="font-medium capitalize">{room.type}</div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-muted-foreground block text-xs">Capacity</span>
                                <div className="font-medium flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {room.capacity}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-muted-foreground block text-xs">Full Day</span>
                                <div className="font-medium text-primary">₹{room.base_price.toLocaleString()}</div>
                              </div>
                              {room.area_sqft && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-muted-foreground block text-xs">Area</span>
                                  <div className="font-medium">{room.area_sqft} sq.ft</div>
                                </div>
                              )}
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-2">
                              {room.has_ac && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  ❄️ AC
                                </Badge>
                              )}
                              {room.has_projector && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  📽️ Projector
                                </Badge>
                              )}
                              {room.has_sound_system && (
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                  🎤 Sound
                                </Badge>
                              )}
                              {room.has_wifi && (
                                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                                  <Wifi className="h-3 w-3 mr-1" />
                                  WiFi
                                </Badge>
                              )}
                              {room.has_catering && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <Utensils className="h-3 w-3 mr-1" />
                                  Catering
                                </Badge>
                              )}
                              {room.has_parking && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  <ParkingCircle className="h-3 w-3 mr-1" />
                                  Parking
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={availabilityMap[room.id] ? "default" : "outline"}
                              onClick={() => handleOpenBookingModal(room)}
                              disabled={availabilityMap[room.id] === false || checkingAvailability[room.id]}
                              className={`
                                min-w-[120px]
                                ${availabilityMap[room.id] === true
                                  ? 'bg-primary text-white hover:bg-primary/90'
                                  : availabilityMap[room.id] === false
                                    ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'
                                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                                }
                              `}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {checkingAvailability[room.id]
                                ? 'Checking...'
                                : availabilityMap[room.id] === undefined
                                  ? 'Check'
                                  : availabilityMap[room.id]
                                    ? 'Book Now'
                                    : 'Not Available'
                              }
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDelete(room.id, room.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Building2 className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No function rooms found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    {searchTerm
                      ? 'No rooms match your search criteria'
                      : 'Add your first function room to get started'}
                  </p>
                  {searchTerm ? (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  ) : (
                    <Button onClick={() => setShowAddModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Function Room
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* =========================================== */}
          {/* BOOKINGS TAB - Event Bookings List */}
          {/* =========================================== */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search bookings by event name, customer, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="bg-gray-100">
                              {booking.booking_reference}
                            </Badge>
                            {getStatusBadge(booking.status)}
                            {getPaymentBadge(booking.payment_status)}
                          </div>
                          <h3 className="font-semibold text-lg">{booking.event_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.customer_name} • {booking.customer_phone}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Room:</span> {booking.room_name || 'N/A'} •
                              <span className="font-medium ml-1">Date:</span> {format(new Date(booking.booking_date), 'MMM d, yyyy')} •
                              <span className="font-medium ml-1">Time:</span> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </p>
                            {booking.has_room_bookings && (
                              <div className="text-sm text-green-600">
                                <Bed className="h-3 w-3 inline mr-1" />
                                {booking.total_rooms_booked} accommodation room(s) booked
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            {formatCurrency(booking.total_amount)}
                          </div>
                          {booking.advance_paid > 0 && (
                            <div className="text-sm text-green-600">
                              Paid: {formatCurrency(booking.advance_paid)}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2"
                            onClick={() => viewBookingDetails(booking)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No bookings found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm ? 'Try a different search term' : `No events booked for ${format(selectedDate, 'MMMM d, yyyy')}`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* =========================================== */}
      {/* BOOKING FORM MODAL - Opens when clicking Book */}
      {/* =========================================== */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            {/* <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Book {selectedRoom.name}</h2>
                  <p className="text-muted-foreground">
                    Capacity: {selectedRoom.capacity} guests • {selectedRoom.type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedRoom(null);
                    setSelectedRooms([]);
                  }}
                >
                  <XCircle className="h-6 w-6" />
                </Button>
              </div>
            </div> */}
            {/* <div className="sticky top-0 bg-white border-b p-6">
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-2xl font-bold">Book {selectedRoom.name}</h2>
      <p className="text-muted-foreground">
        Capacity: {selectedRoom.capacity} guests • {selectedRoom.type}
      </p>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCloseBookingModal}
    >
      <XCircle className="h-6 w-6" />
    </Button>
  </div>
</div> */}
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Book {selectedRoom.name}</h2>
                  <p className="text-muted-foreground">
                    Capacity: {selectedRoom.capacity} guests • {selectedRoom.type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseBookingModal}
                >
                  <XCircle className="h-6 w-6" />
                </Button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between px-4 mt-4">
                {[
                  { number: 1, label: 'Event Details', icon: CalendarIcon },
                  { number: 2, label: 'Customer Info', icon: User },
                  { number: 3, label: 'Payment', icon: CreditCard }
                ].map((step) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${activeStep >= step.number
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'}
        `}>
                      {activeStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${activeStep >= step.number ? 'font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    {step.number < 3 && (
                      <div className={`h-0.5 w-16 mt-5 ${activeStep > step.number ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-6">
              {/* Step 1: Event Details */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Event Details */}
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-4">Event Details</h3>
                        <div className="space-y-4">
                          <div>
                            <Label>Event Name *</Label>
                            <Input
                              value={bookingForm.event_name}
                              onChange={(e) => setBookingForm({ ...bookingForm, event_name: e.target.value })}
                              placeholder="e.g., Annual Conference, Wedding Reception"
                              required
                            />
                          </div>

                          {/* Multi-day booking selector */}
                          <div>
                            <Label>Number of Days *</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setBookingDays(Math.max(1, bookingDays - 1))}
                                disabled={bookingDays <= 1}
                              >
                                -
                              </Button>
                              <div className="flex-1 text-center">
                                <span className="text-xl font-bold">{bookingDays}</span>
                                <span className="text-sm text-muted-foreground ml-1">
                                  {bookingDays === 1 ? 'Day' : 'Days'}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setBookingDays(bookingDays + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Event from {format(new Date(bookingForm.booking_date), 'MMM d, yyyy')}
                              {' to '}
                              {format(addDays(new Date(bookingForm.booking_date), bookingDays - 1), 'MMM d, yyyy')}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date *</Label>
                              <Input
                                type="date"
                                value={bookingForm.booking_date}
                                onChange={(e) => {
                                  setBookingForm({ ...bookingForm, booking_date: e.target.value });
                                  setBookingDays(1);
                                }}
                                min={format(new Date(), 'yyyy-MM-dd')}
                                required
                              />
                            </div>
                            <div>
                              <Label>Expected Guests</Label>
                              <Input
                                type="number"
                                min="1"
                                max={selectedRoom?.capacity || 100}
                                value={bookingForm.guests_expected}
                                onChange={(e) => setBookingForm({ ...bookingForm, guests_expected: Number(e.target.value) })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Time *</Label>
                              <Input
                                type="time"
                                value={bookingForm.start_time}
                                onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label>End Time *</Label>
                              <Input
                                type="time"
                                value={bookingForm.end_time}
                                onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Special Requests</Label>
                            <Input
                              value={bookingForm.special_requests}
                              onChange={(e) => setBookingForm({ ...bookingForm, special_requests: e.target.value })}
                              placeholder="e.g., Stage setup, specific seating arrangement"
                            />
                          </div>

                          {selectedRoom?.has_catering && (
                            <div>
                              <Label>Catering Requirements</Label>
                              <Input
                                value={bookingForm.catering_requirements}
                                onChange={(e) => setBookingForm({ ...bookingForm, catering_requirements: e.target.value })}
                                placeholder="e.g., Vegetarian for 30 people"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Accommodation Rooms */}
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-4 flex items-center">
                          <Hotel className="h-5 w-5 mr-2" />
                          Add Accommodation Rooms (Optional)
                          {selectedRooms.length > 0 && (
                            <Badge className="ml-2 bg-primary">
                              {selectedRooms.length} Selected
                            </Badge>
                          )}
                        </h3>

                        {/* Search and Filter Controls */}
                        <div className="space-y-3 mb-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              placeholder="Search rooms by number or type..."
                              value={roomSearchTerm}
                              onChange={(e) => setRoomSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>

                          {standardRooms.length > 0 && (
                            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="Filter by room type" />
                              </SelectTrigger>
                              <SelectContent>
                                {roomTypes.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type === 'all' ? 'All Types' : type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {/* Rooms List */}
                        <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                          {standardRooms.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No rooms available for the selected dates</p>
                              <p className="text-sm mt-2">Try selecting different dates</p>
                            </div>
                          ) : filteredStandardRooms.length > 0 ? (
                            filteredStandardRooms.map((room) => {
                              const isSelected = selectedRooms.some(r => r.room_id === room.id);
                              return (
                                <div
                                  key={room.id}
                                  className={`flex items-center justify-between p-3 rounded-lg border ${isSelected
                                      ? 'bg-green-50 border-green-200'
                                      : 'hover:bg-gray-50 border-gray-100'
                                    }`}
                                >
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      Room {room.room_number}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {room.type || 'Standard Room'} • {formatCurrency(room.price || 0)}/night
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? "destructive" : "outline"}
                                    onClick={() => isSelected
                                      ? removeRoomFromSelection(room.id)
                                      : addRoomToSelection(room)
                                    }
                                    className={isSelected ? "" : "border-primary text-primary hover:bg-primary hover:text-white"}
                                  >
                                    {isSelected ? (
                                      <><MinusCircle className="h-4 w-4 mr-1" /> Remove</>
                                    ) : (
                                      <><Plus className="h-4 w-4 mr-1" /> Add</>
                                    )}
                                  </Button>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No rooms match your search criteria</p>
                              {(roomSearchTerm || roomTypeFilter !== 'all') && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    setRoomSearchTerm('');
                                    setRoomTypeFilter('all');
                                  }}
                                  className="mt-2"
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Selected Rooms Summary */}
                        {selectedRooms.length > 0 && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <span>Selected Rooms ({selectedRooms.length})</span>
                              <Badge variant="outline" className="text-xs">
                                Total: {formatCurrency(selectedRooms.reduce((sum, r) => sum + (r.total_price || 0), 0))}
                              </Badge>
                            </h4>
                            <div className="space-y-2">
                              {selectedRooms.map((room) => (
                                <div key={room.room_id} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium">Room {room.room_number}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {room.room_type} • {room.guests} guest(s)
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 h-6 w-6 p-0"
                                      onClick={() => removeRoomFromSelection(room.room_id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                      <Label className="text-xs">Nights</Label>
                                      <Select
                                        value={room.nights.toString()}
                                        onValueChange={(v) => updateRoomNights(room.room_id, parseInt(v))}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                            <SelectItem key={n} value={n.toString()}>
                                              {n} {n === 1 ? 'Night' : 'Nights'}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Guests</Label>
                                      <Select
                                        value={room.guests.toString()}
                                        onValueChange={(v) => updateRoomGuests(room.room_id, parseInt(v))}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {[1, 2, 3, 4].map(g => (
                                            <SelectItem key={g} value={g.toString()}>
                                              {g} Guest{g > 1 ? 's' : ''}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="flex justify-between mt-2 text-sm border-t pt-2">
                                    <span className="text-muted-foreground">
                                      {formatCurrency(room.price_per_night)} × {room.nights} nights
                                    </span>
                                    <span className="font-semibold text-primary">
                                      {formatCurrency(room.total_price)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation for Step 1 */}
                  <div className="flex justify-end border-t pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (validateStep(1)) setActiveStep(2);
                      }}
                    >
                      Next: Customer Information
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Customer Information */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information with GST */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-4">Customer Information</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Phone Number *</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={bookingForm.customer_phone}
                              onChange={handleCustomerPhoneChange}
                              placeholder="10-digit mobile number"
                              className="pl-10"
                              maxLength={10}
                              required
                            />
                          </div>
                          {showCustomerSearch && foundCustomers.length > 0 && (
                            <div className="mt-2 border rounded-lg divide-y max-h-40 overflow-y-auto">
                              {foundCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => selectCustomer(customer)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                                >
                                  <div>
                                    <div className="font-medium">{customer.name}</div>
                                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50">
                                    Existing Customer
                                  </Badge>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={bookingForm.customer_name}
                            onChange={(e) => setBookingForm({ ...bookingForm, customer_name: e.target.value })}
                            placeholder="Customer name"
                            required
                          />
                        </div>

                        <div>
                          <Label>Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              value={bookingForm.customer_email}
                              onChange={(e) => setBookingForm({ ...bookingForm, customer_email: e.target.value })}
                              placeholder="customer@example.com"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* GST Information Section */}
                        <div className="border-t pt-4 mt-2">
                          <h4 className="font-medium mb-3 flex items-center">
                            <Percent className="h-4 w-4 mr-2" />
                            GST Information (Optional)
                          </h4>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">GST Number</Label>
                              <Input
                                value={bookingForm.customer_gst || ''}
                                onChange={(e) => setBookingForm({ ...bookingForm, customer_gst: e.target.value })}
                                placeholder="e.g., 22AAAAA0000A1Z5"
                                className="font-mono text-sm"
                                maxLength={15}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                15-character GSTIN (Format: 22AAAAA0000A1Z5)
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm">Billing Address</Label>
                              <textarea
                                value={bookingForm.billing_address || ''}
                                onChange={(e) => setBookingForm({ ...bookingForm, billing_address: e.target.value })}
                                placeholder="Enter complete billing address"
                                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                rows={3}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">State</Label>
                                <Input
                                  value={bookingForm.billing_state || ''}
                                  onChange={(e) => setBookingForm({ ...bookingForm, billing_state: e.target.value })}
                                  placeholder="e.g., Maharashtra"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">State Code</Label>
                                <Input
                                  value={bookingForm.billing_state_code || ''}
                                  onChange={(e) => setBookingForm({ ...bookingForm, billing_state_code: e.target.value })}
                                  placeholder="e.g., 27"
                                  maxLength={2}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">City</Label>
                                <Input
                                  value={bookingForm.billing_city || ''}
                                  onChange={(e) => setBookingForm({ ...bookingForm, billing_city: e.target.value })}
                                  placeholder="e.g., Mumbai"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Pincode</Label>
                                <Input
                                  value={bookingForm.billing_pincode || ''}
                                  onChange={(e) => setBookingForm({ ...bookingForm, billing_pincode: e.target.value })}
                                  placeholder="e.g., 400001"
                                  maxLength={6}
                                />
                              </div>
                            </div>

                            {/* Business Type Selection */}
                            <div>
                              <Label className="text-sm">Business Type</Label>
                              <Select
                                value={bookingForm.business_type || 'b2c'}
                                onValueChange={(v) => setBookingForm({ ...bookingForm, business_type: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="b2c">B2C (Regular Customer)</SelectItem>
                                  <SelectItem value="b2b">B2B (Registered Business)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* GST Validation Message */}
                            {bookingForm.customer_gst && bookingForm.customer_gst.length === 15 && (
                              <div className="bg-green-50 border border-green-200 rounded-md p-2 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-green-700">
                                  <p className="font-medium">Valid GST format</p>
                                  <p className="text-green-600">GST details will appear on the invoice</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-4">Price Summary</h3>

                        <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              Price Details
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingPrice(!isEditingPrice)}
                              className="h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              {isEditingPrice ? 'Done' : 'Edit'}
                            </Button>
                          </div>

                          {/* Function Room Charges */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Function Room ({bookingDays} day{bookingDays > 1 ? 's' : ''})</span>
                            {isEditingPrice ? (
                              <div className="flex items-center gap-1">
                                <span className="text-sm">₹</span>
                                <Input
                                  type="number"
                                  value={customBasePrice}
                                  onChange={(e) => setCustomBasePrice(e.target.value === '' ? 0 : Number(e.target.value))}
                                  className="w-24 h-7 text-right"
                                  min="0"
                                  step="100"
                                />
                              </div>
                            ) : (
                              <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                            )}
                          </div>

                          {/* GST */}
                          <div className="flex justify-between items-center">
                            <span className="flex items-center text-sm">
                              <Percent className="h-3 w-3 mr-1" />
                              GST
                            </span>
                            <div className="flex items-center gap-2">
                              {isEditingGst ? (
                                <>
                                  <Input
                                    type="number"
                                    value={customGstPercentage}
                                    onChange={(e) => setCustomGstPercentage(e.target.value === '' ? 0 : Number(e.target.value))}
                                    className="w-16 h-7 text-right"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                  />
                                  <span className="text-sm">%</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditingGst(false)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm">{customGstPercentage}%</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditingGst(true)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <span className="font-medium">{formatCurrency(calculateGST())}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Discount */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Discount</span>
                            <div className="flex items-center gap-2">
                              <Select
                                value={customDiscountType}
                                onValueChange={(v) => setCustomDiscountType(v as 'percentage' | 'fixed')}
                              >
                                <SelectTrigger className="w-24 h-7">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">%</SelectItem>
                                  <SelectItem value="fixed">₹</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                value={customDiscount}
                                onChange={(e) => setCustomDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                                className="w-20 h-7 text-right"
                                min="0"
                                step={customDiscountType === 'percentage' ? '1' : '100'}
                              />
                            </div>
                          </div>
                          {customDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount Amount</span>
                              <span>- {formatCurrency(calculateDiscount())}</span>
                            </div>
                          )}

                          {/* Other Charges */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Other Charges</span>
                            <Input
                              type="number"
                              value={customOtherCharges}
                              onChange={(e) => setCustomOtherCharges(e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-24 h-7 text-right"
                              min="0"
                              step="100"
                            />
                          </div>
                          {customOtherCharges > 0 && otherChargesDescription && (
                            <div className="text-xs text-muted-foreground text-right">
                              {otherChargesDescription}
                            </div>
                          )}
                          {customOtherCharges > 0 && (
                            <Input
                              placeholder="Description for charges"
                              value={otherChargesDescription}
                              onChange={(e) => setOtherChargesDescription(e.target.value)}
                              className="text-xs h-7"
                            />
                          )}

                          {/* Room Accommodation Total */}
                          {selectedRooms.length > 0 && (
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium flex items-center gap-2">
                                  <Hotel className="h-4 w-4" />
                                  Accommodation
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (editingRoomPricing) {
                                      setEditingRoomPricing(false);
                                      setIsEditingRoomGst(false);
                                    } else {
                                      setCustomRoomSubtotal(calculateRoomTotal());
                                      setCustomRoomGstPercentage(18);
                                      setEditingRoomPricing(true);
                                    }
                                  }}
                                  className="h-7 px-2"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  {editingRoomPricing ? 'Done' : 'Edit Pricing'}
                                </Button>
                              </div>

                              {/* Room Subtotal */}
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Room Charges</span>
                                {editingRoomPricing ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">₹</span>
                                    <Input
                                      type="number"
                                      value={customRoomSubtotal}
                                      onChange={(e) => setCustomRoomSubtotal(e.target.value === '' ? 0 : Number(e.target.value))}
                                      className="w-24 h-7 text-right"
                                      min="0"
                                      step="100"
                                    />
                                  </div>
                                ) : (
                                  <span className="font-medium">
                                    {formatCurrency(customRoomSubtotal > 0 ? customRoomSubtotal : calculateRoomTotal())}
                                  </span>
                                )}
                              </div>

                              {/* Room GST */}
                              <div className="flex justify-between items-center mt-1">
                                <span className="flex items-center text-sm">
                                  <Percent className="h-3 w-3 mr-1" />
                                  GST on Rooms
                                </span>
                                <div className="flex items-center gap-2">
                                  {editingRoomPricing && isEditingRoomGst ? (
                                    <>
                                      <Input
                                        type="number"
                                        value={customRoomGstPercentage}
                                        onChange={(e) => setCustomRoomGstPercentage(e.target.value === '' ? 0 : Number(e.target.value))}
                                        className="w-16 h-7 text-right"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                      />
                                      <span className="text-sm">%</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingRoomGst(false)}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Save className="h-3 w-3" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      {editingRoomPricing ? (
                                        <>
                                          <span className="text-sm">{customRoomGstPercentage}%</span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditingRoomGst(true)}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-sm">{customRoomGstPercentage}%</span>
                                        </>
                                      )}
                                      <span className="font-medium">
                                        {formatCurrency(
                                          (customRoomSubtotal > 0 ? customRoomSubtotal : calculateRoomTotal()) *
                                          customRoomGstPercentage / 100
                                        )}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Room Total with GST */}
                              <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t border-dashed">
                                <span>Room Total (incl. GST)</span>
                                <span className="text-primary">
                                  {formatCurrency(calculateRoomTotalWithGst())}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Grand Total */}
                          <div className="border-t-2 border-primary pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Grand Total</span>
                              <span className="text-xl font-bold text-primary">
                                {formatCurrency(calculateGrandTotal())}
                              </span>
                            </div>
                            {bookingForm.advance_paid > 0 && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Advance Paid</span>
                                <span className="font-medium text-green-600">
                                  - {formatCurrency(bookingForm.advance_paid)}
                                </span>
                              </div>
                            )}
                            {bookingForm.advance_paid > 0 && (
                              <div className="flex justify-between text-sm font-medium mt-1">
                                <span>Balance Due</span>
                                <span>{formatCurrency(calculateGrandTotal() - bookingForm.advance_paid)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Advance Payment */}
                        <div className="mt-4">
                          <Label>Advance Payment (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            value={bookingForm.advance_paid}
                            onChange={(e) => setBookingForm({ ...bookingForm, advance_paid: Number(e.target.value) })}
                            placeholder="Optional advance payment"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation for Step 2 */}
                  <div className="flex justify-between border-t pt-4">
                    <Button variant="outline" onClick={() => setActiveStep(1)}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Event Details
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (validateStep(2)) setActiveStep(3);
                      }}
                    >
                      Next: Payment
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Payment Method</h3>
                    <Badge variant="outline" className={isProUser ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {isProUser ? 'Pro Plan' : 'Basic Plan'}
                    </Badge>
                  </div>

                  {/* Payment Method Selection */}
                  {isProUser ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={paymentMethod === 'online' ? "default" : "outline"}
                        className="h-28 flex flex-col gap-2 py-4"
                        onClick={() => {
                          setPaymentMethod('online');
                          if (!qrCodeData) generateUPIQrCode();
                        }}
                        disabled={isGeneratingQR}
                      >
                        <div className="flex items-center gap-2">
                          <QrCode className="h-6 w-6" />
                          <span className="font-medium">Online Payment</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Pay now via UPI QR Code
                        </span>
                        {isGeneratingQR && (
                          <Loader2 className="h-4 w-4 animate-spin mt-1" />
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant={paymentMethod === 'cash' ? "default" : "outline"}
                        className="h-28 flex flex-col gap-2 py-4"
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="h-6 w-6" />
                          <span className="font-medium">Cash Payment</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Pay at hotel reception on arrival
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                          Basic Plan: Online payments are available in Pro Plan.
                          Cash payment is automatically selected.
                        </AlertDescription>
                      </Alert>

                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="default"
                          className="h-28 w-full max-w-md flex flex-col gap-2 py-4"
                          onClick={() => setPaymentMethod('cash')}
                        >
                          <Wallet className="h-6 w-6" />
                          <span className="font-medium">Cash Payment</span>
                          <span className="text-sm text-muted-foreground">
                            Pay at hotel reception on arrival
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Online Payment Section */}
                  {paymentMethod === 'online' && isProUser && (
                    <div className="space-y-6">
                      <div className="border rounded-xl p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* QR Code Section */}
                          <div className="md:w-1/2 space-y-4">
                            <h4 className="font-semibold text-center">QR Code Payment</h4>

                            <div className="bg-white p-4 rounded-lg border flex flex-col items-center">
                              {hotelQRCode ? (
                                <>
                                  <img
                                    src={hotelQRCode}
                                    alt="Hotel UPI QR Code"
                                    className="w-48 h-48 object-contain mx-auto"
                                    onError={(e) => {
                                      console.error('Hotel QR code failed to load');
                                      e.currentTarget.src = 'https://via.placeholder.com/200x200?text=QR+Code';
                                    }}
                                  />
                                  <div className="mt-3 text-center">
                                    <div className="text-sm font-medium mb-1">
                                      Amount: <span className="text-lg font-bold text-green-600">₹{calculateGrandTotal().toFixed(2)}</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <QRCode
                                    value={`upi://pay?pa=hotel@upi&pn=Hotel&am=${calculateGrandTotal()}&cu=INR`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    className="mx-auto"
                                  />
                                  <div className="mt-3 text-center">
                                    <div className="text-sm font-medium mb-1">
                                      Amount: <span className="text-lg font-bold text-green-600">₹{calculateGrandTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                      UPI ID: hotel@upi
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Payment Instructions */}
                          <div className="md:w-1/2 space-y-4">
                            <h4 className="font-semibold">Payment Instructions</h4>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">1</span>
                                </div>
                                <p className="text-sm">Scan QR Code with any UPI app</p>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">2</span>
                                </div>
                                <p className="text-sm">Enter amount: <strong>₹{calculateGrandTotal().toFixed(2)}</strong></p>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">3</span>
                                </div>
                                <p className="text-sm">Complete payment and verify</p>
                              </div>
                            </div>

                            {/* Payment Status & Verification */}
                            <div className="space-y-4 mt-6">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Payment Status:</span>
                                <Badge variant="outline" className={
                                  paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                    paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                }>
                                  {paymentStatus === 'completed' ? '✅ Completed' :
                                    paymentStatus === 'failed' ? '❌ Failed' :
                                      '🔄 Pending'}
                                </Badge>
                              </div>

                              {paymentStatus === 'pending' ? (
                                <Button
                                  onClick={verifyPayment}
                                  className="w-full"
                                  disabled={isVerifyingPayment}
                                >
                                  {isVerifyingPayment ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      I have made the payment
                                    </>
                                  )}
                                </Button>
                              ) : paymentStatus === 'completed' && (
                                <Alert className="bg-green-50 border-green-200">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <AlertDescription>Payment Verified Successfully!</AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Payment Section */}
                  {paymentMethod === 'cash' && (
                    <div className="border rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Cash Payment at Hotel</h4>
                          <p className="text-sm text-muted-foreground">
                            Pay when you arrive
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Amount Due:</span>
                          <span className="text-2xl font-bold text-blue-700">
                            ₹{calculateGrandTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-medium">Instructions:</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Booking will be confirmed immediately</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Pay at hotel reception during check-in</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Receipt will be provided at reception</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation for Step 3 */}
                  <div className="flex justify-between border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveStep(2)}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Customer Info
                    </Button>

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !paymentMethod ||
                        (paymentMethod === 'online' && paymentStatus !== 'completed')
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : paymentMethod === 'online' && paymentStatus !== 'completed' ? (
                        'Complete Payment First'
                      ) : (
                        'Confirm Booking'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* =========================================== */}
      {/* BOOKING DETAILS MODAL */}
      {/* =========================================== */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Booking Details</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowBookingDetails(false)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Reference</p>
                    <p className="font-semibold">{selectedBooking.booking_reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div>{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Event</p>
                  <p className="font-semibold text-lg">{selectedBooking.event_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>{format(new Date(selectedBooking.booking_date), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p>{formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Function Room</p>
                  <p className="font-semibold">{selectedBooking.room_name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedBooking.customer_name}</p>
                  <p className="text-sm">{selectedBooking.customer_phone}</p>
                  {selectedBooking.customer_email && (
                    <p className="text-sm">{selectedBooking.customer_email}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Payment Details</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Room Charges:</span>
                      <span>{formatCurrency(selectedBooking.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({selectedBooking.gst_percentage || 18}%):</span>
                      <span>{formatCurrency(selectedBooking.gst || 0)}</span>
                    </div>
                    {selectedBooking.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(selectedBooking.discount)}</span>
                      </div>
                    )}
                    {selectedBooking.other_charges > 0 && (
                      <div className="flex justify-between">
                        <span>Other Charges:</span>
                        <span>{formatCurrency(selectedBooking.other_charges)}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">{formatCurrency(selectedBooking.total_amount)}</span>
                    </div>
                    {selectedBooking.advance_paid > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Advance Paid:</span>
                        <span className="text-green-600">{formatCurrency(selectedBooking.advance_paid)}</span>
                      </div>
                    )}
                    {selectedBooking.advance_paid > 0 && selectedBooking.total_amount > selectedBooking.advance_paid && (
                      <div className="flex justify-between text-sm font-medium">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(selectedBooking.total_amount - selectedBooking.advance_paid)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.has_room_bookings && (
                  <div>
                    <p className="text-sm text-muted-foreground">Accommodation Rooms</p>
                    <p className="font-medium">{selectedBooking.total_rooms_booked} room(s) booked</p>
                  </div>
                )}

                {selectedBooking.special_requests && (
                  <div>
                    <p className="text-sm text-muted-foreground">Special Requests</p>
                    <p className="text-sm">{selectedBooking.special_requests}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowBookingDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Function Room Modal */}
      {showAddModal && (
        <AddRoomModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            fetchFunctionRooms();
          }}
          spreadsheetId={currentUser?.spreadsheetId}
          userSource={currentUser?.source}
          onRoomAdded={fetchFunctionRooms}
          roomType="function"
        />
      )}
    </Layout>
  );
}


