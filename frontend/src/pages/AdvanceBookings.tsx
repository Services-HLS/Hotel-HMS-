


// // import { useState, useEffect } from 'react';
// // import Layout from '@/components/Layout';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Badge } from '@/components/ui/badge';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import { Input } from '@/components/ui/input';
// // import { useToast } from '@/hooks/use-toast';
// // import AdvanceBookingForm from '@/components/AdvanceBookingForm';
// // import {
// //     CalendarDays,
// //     RefreshCw,
// //     Search,
// //     IndianRupee,
// //     Clock,
// //     User,
// //     Phone,
// //     Mail,
// //     CheckCircle,
// //     AlertCircle,
// //     XCircle,
// //     ArrowRight,
// //     Download,
// //     Eye,
// //     Loader2,
// //     Calendar as CalendarIcon,
// //     X
// // } from 'lucide-react';
// // import { format } from 'date-fns';
// // import BookingForm from '@/components/BookingForm';
// // import { Calendar } from '@/components/ui/calendar';
// // import {
// //     Popover,
// //     PopoverContent,
// //     PopoverTrigger,
// // } from '@/components/ui/popover';
// // import { DateRange } from 'react-day-picker';
// // import { cn } from '@/lib/utils';

// // const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// // interface AdvanceBooking {
// //     id: number;
// //     invoice_number: string;
// //     customer_name: string;
// //     customer_phone: string;
// //     customer_email: string;
// //     room_number: string;
// //     room_type: string;
// //     from_date: string;
// //     to_date: string;
// //     total: number;
// //     advance_amount: number;
// //     remaining_amount: number;
// //     payment_method: string;
// //     payment_status: string;
// //     status: string;
// //     advance_expiry_date: string;
// //     created_at: string;
// //     transaction_id: string;
// //     room_id?: number;

// // }

// // const AdvanceBookings = () => {
// //     const { toast } = useToast();
// //     const [bookings, setBookings] = useState<AdvanceBooking[]>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [searchTerm, setSearchTerm] = useState('');

// //     // ===== ADD THIS: Date range state =====
// //     const [dateRange, setDateRange] = useState<DateRange | undefined>({
// //         from: undefined,
// //         to: undefined,
// //     });
// //     const [dateFilterType, setDateFilterType] = useState<'created' | 'booking' | 'expiry'>('created');

// //     const [showForm, setShowForm] = useState(false);
// //     const [rooms, setRooms] = useState<any[]>([]);
// //     const [stats, setStats] = useState<any>({});
// //     const [convertingId, setConvertingId] = useState<number | null>(null);
// //     const [showBookingForm, setShowBookingForm] = useState(false);
// //     const [selectedAdvanceForBooking, setSelectedAdvanceForBooking] = useState<any>(null);

// //     // Refresh trigger state
// //     const [refreshTrigger, setRefreshTrigger] = useState(0);

// //     // ===== ADD THIS: Clear date filter function =====
// //     const clearDateFilter = () => {
// //         setDateRange({ from: undefined, to: undefined });
// //     };

// //     // ===== ADD THIS: Filter bookings by date range =====
// //     // const filterByDateRange = (booking: AdvanceBooking) => {
// //     //     if (!dateRange?.from && !dateRange?.to) return true;

// //     //     let bookingDate: Date | null = null;

// //     //     // Get the appropriate date based on filter type
// //     //     switch (dateFilterType) {
// //     //         case 'created':
// //     //             bookingDate = new Date(booking.created_at);
// //     //             break;
// //     //         case 'booking':
// //     //             // Use from_date as the main date for booking range
// //     //             bookingDate = new Date(booking.from_date);
// //     //             break;
// //     //         case 'expiry':
// //     //             bookingDate = booking.advance_expiry_date ? new Date(booking.advance_expiry_date) : null;
// //     //             break;
// //     //     }

// //     //     if (!bookingDate) return false;

// //     //     // Remove time part for date comparison
// //     //     bookingDate.setHours(0, 0, 0, 0);

// //     //     if (dateRange.from && dateRange.to) {
// //     //         // Between range
// //     //         const from = new Date(dateRange.from);
// //     //         from.setHours(0, 0, 0, 0);
// //     //         const to = new Date(dateRange.to);
// //     //         to.setHours(23, 59, 59, 999);
// //     //         return bookingDate >= from && bookingDate <= to;
// //     //     } else if (dateRange.from) {
// //     //         // From date onwards
// //     //         const from = new Date(dateRange.from);
// //     //         from.setHours(0, 0, 0, 0);
// //     //         return bookingDate >= from;
// //     //     } else if (dateRange.to) {
// //     //         // Up to date
// //     //         const to = new Date(dateRange.to);
// //     //         to.setHours(23, 59, 59, 999);
// //     //         return bookingDate <= to;
// //     //     }

// //     //     return true;
// //     // };

// //     // ===== REPLACE THIS FUNCTION =====
// //     const filterByDateRange = (booking: AdvanceBooking) => {
// //         if (!dateRange?.from && !dateRange?.to) return true;

// //         let bookingDate: Date | null = null;

// //         // Get the appropriate date based on filter type
// //         switch (dateFilterType) {
// //             case 'created':
// //                 bookingDate = booking.created_at ? new Date(booking.created_at) : null;
// //                 break;
// //             case 'booking':
// //                 bookingDate = booking.from_date ? new Date(booking.from_date) : null;
// //                 break;
// //             case 'expiry':
// //                 bookingDate = booking.advance_expiry_date ? new Date(booking.advance_expiry_date) : null;
// //                 break;
// //         }

// //         if (!bookingDate) return false;

// //         // Remove time part for date comparison
// //         bookingDate.setHours(0, 0, 0, 0);

// //         if (dateRange.from && dateRange.to) {
// //             // Between range
// //             const from = new Date(dateRange.from);
// //             from.setHours(0, 0, 0, 0);
// //             const to = new Date(dateRange.to);
// //             to.setHours(23, 59, 59, 999);
// //             return bookingDate >= from && bookingDate <= to;
// //         } else if (dateRange.from) {
// //             // From date onwards
// //             const from = new Date(dateRange.from);
// //             from.setHours(0, 0, 0, 0);
// //             return bookingDate >= from;
// //         } else if (dateRange.to) {
// //             // Up to date
// //             const to = new Date(dateRange.to);
// //             to.setHours(23, 59, 59, 999);
// //             return bookingDate <= to;
// //         }

// //         return true;
// //     };

// //     // ===== UPDATE THIS: filteredBookings to include date filter =====
// //     const filteredBookings = bookings
// //         .filter(booking =>
// //             booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //             booking.customer_phone?.includes(searchTerm) ||
// //             booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //             booking.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
// //         )
// //         .filter(filterByDateRange); // Apply date filter

// //     // fetchBookings function
// //     const fetchBookings = async () => {
// //         setLoading(true);
// //         try {
// //             const token = localStorage.getItem('authToken');
// //             console.log('Fetching advance bookings...', new Date().toLocaleTimeString());

// //             const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings`, {
// //                 headers: { 'Authorization': `Bearer ${token}` }
// //             });

// //             if (!response.ok) {
// //                 throw new Error(`HTTP error! status: ${response.status}`);
// //             }

// //             const data = await response.json();
// //             console.log('Fetched bookings count:', data.data?.length || 0);
// //             setBookings(data.data || []);

// //             // Fetch stats
// //             const statsRes = await fetch(`${NODE_BACKEND_URL}/advance-bookings/stats`, {
// //                 headers: { 'Authorization': `Bearer ${token}` }
// //             });
// //             const statsData = await statsRes.json();
// //             setStats(statsData.data || {});

// //         } catch (error) {
// //             console.error('Error fetching bookings:', error);
// //             toast({
// //                 title: "Error",
// //                 description: "Failed to load advance bookings",
// //                 variant: "destructive"
// //             });
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     // Handle advance booking success
// //     const handleAdvanceBookingSuccess = async () => {
// //         console.log('Advance booking created, refreshing with delay...');

// //         toast({
// //             title: "Processing",
// //             description: "Creating advance booking...",
// //         });

// //         setTimeout(async () => {
// //             try {
// //                 await fetchBookings();
// //                 setRefreshTrigger(prev => prev + 1);
// //                 setShowForm(false);

// //                 toast({
// //                     title: "✅ Success",
// //                     description: "Advance booking created successfully",
// //                     variant: "default"
// //                 });
// //             } catch (error) {
// //                 toast({
// //                     title: "Error",
// //                     description: "Failed to refresh bookings",
// //                     variant: "destructive"
// //                 });
// //             }
// //         }, 500);
// //     };

// //     // fetchRooms function
// //     const fetchRooms = async () => {
// //         try {
// //             const token = localStorage.getItem('authToken');
// //             console.log('Fetching rooms from:', `${NODE_BACKEND_URL}/rooms`);

// //             const response = await fetch(`${NODE_BACKEND_URL}/rooms`, {
// //                 headers: {
// //                     'Authorization': `Bearer ${token}`,
// //                     'Content-Type': 'application/json'
// //                 }
// //             });

// //             if (!response.ok) {
// //                 throw new Error(`HTTP error! status: ${response.status}`);
// //             }

// //             const data = await response.json();
// //             console.log('Rooms API response:', data);

// //             let roomsData = [];

// //             if (data.success && Array.isArray(data.data)) {
// //                 roomsData = data.data;
// //             } else if (Array.isArray(data)) {
// //                 roomsData = data;
// //             } else if (data.data && Array.isArray(data.data)) {
// //                 roomsData = data.data;
// //             } else {
// //                 console.warn('Unexpected API response format:', data);
// //                 roomsData = [];
// //             }

// //             const transformedRooms = roomsData.map((room: any) => ({
// //                 id: room.id || room.room_id,
// //                 roomId: room.id?.toString() || room.room_id?.toString() || `room-${room.room_number}`,
// //                 number: room.room_number || room.number || 'N/A',
// //                 type: room.type || 'Standard',
// //                 price: parseFloat(room.price) || 0,
// //                 maxOccupancy: room.max_occupancy || room.maxOccupancy || 2,
// //                 floor: room.floor || 1,
// //                 status: room.status || 'available'
// //             }));

// //             console.log('Transformed rooms:', transformedRooms);
// //             setRooms(transformedRooms);

// //         } catch (error) {
// //             console.error('Error fetching rooms:', error);
// //             toast({
// //                 title: "Error",
// //                 description: "Failed to load rooms. Please try again.",
// //                 variant: "destructive"
// //             });
// //         }
// //     };

// //     // Use refreshTrigger in useEffect
// //     useEffect(() => {
// //         fetchBookings();
// //     }, [refreshTrigger]);

// //     // Initial fetch for rooms
// //     useEffect(() => {
// //         fetchRooms();
// //     }, []);

// //     // Event listener for conversions
// //     useEffect(() => {
// //         const handleAdvanceBookingConverted = (event: CustomEvent) => {
// //             console.log('Advance booking converted, refreshing list...', event.detail);
// //             setRefreshTrigger(prev => prev + 1);
// //             toast({
// //                 title: "✅ Advance Booking Converted",
// //                 description: `Booking has been converted to regular booking`,
// //                 variant: "default"
// //             });
// //         };

// //         window.addEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);

// //         return () => {
// //             window.removeEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);
// //         };
// //     }, []);

// //     // handleConvertAndBook function
// //     const handleConvertAndBook = (booking: AdvanceBooking) => {
// //         setSelectedAdvanceForBooking(booking);
// //         setShowBookingForm(true);
// //     };

// //     // getStatusBadge function
// //     const getStatusBadge = (status: string) => {
// //         const config: Record<string, { label: string; class: string }> = {
// //             pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
// //             confirmed: { label: 'Confirmed', class: 'bg-green-100 text-green-800 border-green-200' },
// //             cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-800 border-red-200' },
// //             expired: { label: 'Expired', class: 'bg-gray-100 text-gray-800 border-gray-200' },
// //             converted: { label: 'Converted', class: 'bg-blue-100 text-blue-800 border-blue-200' }
// //         };
// //         const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
// //         return <Badge variant="outline" className={c.class}>{c.label}</Badge>;
// //     };

// //     // getPaymentBadge function
// //     const getPaymentBadge = (status: string) => {
// //         const config: Record<string, { label: string; class: string }> = {
// //             pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
// //             partial: { label: 'Partial', class: 'bg-blue-100 text-blue-800' },
// //             completed: { label: 'Paid', class: 'bg-green-100 text-green-800' }
// //         };
// //         const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
// //         return <Badge className={c.class}>{c.label}</Badge>;
// //     };

// //     // handleViewInvoice function
// //     const handleViewInvoice = async (booking: AdvanceBooking) => {
// //         try {
// //             setLoading(true);
// //             const token = localStorage.getItem('authToken');
// //             const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings/${booking.id}/invoice`, {
// //                 headers: { 'Authorization': `Bearer ${token}` }
// //             });

// //             const result = await response.json();

// //             if (result.success) {
// //                 const invoiceWindow = window.open('', '_blank');
// //                 if (invoiceWindow) {
// //                     invoiceWindow.document.write(`
// //                     <html>
// //                         <head>
// //                             <title>Invoice - ${result.data.invoiceNumber}</title>
// //                             <style>
// //                                 body { font-family: Arial, sans-serif; padding: 20px; }
// //                                 .invoice-container { max-width: 800px; margin: 0 auto; }
// //                                 .header { text-align: center; margin-bottom: 30px; }
// //                                 .hotel-logo { max-width: 150px; max-height: 80px; }
// //                                 table { width: 100%; border-collapse: collapse; margin: 20px 0; }
// //                                 th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
// //                                 th { background-color: #f2f2f2; }
// //                                 .total { font-weight: bold; font-size: 18px; }
// //                                 .footer { margin-top: 30px; text-align: center; }
// //                             </style>
// //                         </head>
// //                         <body>
// //                             <div class="invoice-container">
// //                                 <div class="header">
// //                                     ${result.data.hotel.logo ?
// //                             `<img src="${result.data.hotel.logo}" class="hotel-logo" alt="Hotel Logo">` : ''}
// //                                     <h2>${result.data.hotel.name}</h2>
// //                                     <p>${result.data.hotel.address}</p>
// //                                     <p>Phone: ${result.data.hotel.phone} | Email: ${result.data.hotel.email}</p>
// //                                     ${result.data.hotel.gstin ? `<p>GSTIN: ${result.data.hotel.gstin}</p>` : ''}
// //                                     <h3>Advance Booking Invoice</h3>
// //                                     <p>Invoice #: ${result.data.invoiceNumber}</p>
// //                                     <p>Date: ${result.data.invoiceDate}</p>
// //                                     ${result.data.expiryDate ? `<p>Valid Until: ${result.data.expiryDate}</p>` : ''}
// //                                 </div>

// //                                 <div style="margin: 20px 0;">
// //                                     <h4>Customer Details:</h4>
// //                                     <p><strong>${result.data.customer.name}</strong><br>
// //                                     Phone: ${result.data.customer.phone}<br>
// //                                     ${result.data.customer.email ? `Email: ${result.data.customer.email}<br>` : ''}
// //                                     ${result.data.customer.address ? `Address: ${result.data.customer.address}` : ''}</p>
// //                                 </div>

// //                                 <div style="margin: 20px 0;">
// //                                     <h4>Booking Details:</h4>
// //                                     <p><strong>Room:</strong> ${result.data.booking.roomNumber} (${result.data.booking.roomType})<br>
// //                                     <strong>Check-in:</strong> ${result.data.booking.fromDate} ${result.data.booking.fromTime}<br>
// //                                     <strong>Check-out:</strong> ${result.data.booking.toDate} ${result.data.booking.toTime}<br>
// //                                     <strong>Nights:</strong> ${result.data.booking.nights}<br>
// //                                     <strong>Guests:</strong> ${result.data.booking.guests}</p>
// //                                 </div>

// //                                 <table>
// //                                     <thead>
// //                                         <tr>
// //                                             <th>Description</th>
// //                                             <th>Amount (₹)</th>
// //                                         </tr>
// //                                     </thead>
// //                                     <tbody>
// //                                         ${result.data.charges.map(charge => `
// //                                             <tr>
// //                                                 <td>${charge.description}</td>
// //                                                 <td>₹${charge.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
// //                                             </tr>
// //                                         `).join('')}
// //                                     </tbody>
// //                                     <tfoot>
// //                                         <tr>
// //                                             <td><strong>Subtotal</strong></td>
// //                                             <td><strong>₹${result.data.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
// //                                         </tr>
// //                                         <tr>
// //                                             <td><strong>Total</strong></td>
// //                                             <td><strong>₹${result.data.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
// //                                         </tr>
// //                                         <tr style="background-color: #e8f4fd;">
// //                                             <td><strong>Advance Paid</strong></td>
// //                                             <td><strong>₹${result.data.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
// //                                         </tr>
// //                                         ${result.data.remainingDue > 0 ? `
// //                                             <tr style="background-color: #fff3cd;">
// //                                                 <td><strong>Remaining Due</strong></td>
// //                                                 <td><strong>₹${result.data.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
// //                                             </tr>
// //                                         ` : ''}
// //                                     </tfoot>
// //                                 </table>

// //                                 <div style="margin: 20px 0;">
// //                                     <p><strong>Payment Method:</strong> ${result.data.payment.method}<br>
// //                                     <strong>Payment Status:</strong> ${result.data.payment.status}<br>
// //                                     ${result.data.payment.transactionId ? `<strong>Transaction ID:</strong> ${result.data.payment.transactionId}<br>` : ''}
// //                                     <strong>Booking Status:</strong> ${result.data.status}</p>
// //                                 </div>

// //                                 ${result.data.notes ? `
// //                                     <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
// //                                         <p><strong>Notes:</strong> ${result.data.notes}</p>
// //                                     </div>
// //                                 ` : ''}

// //                                 <div class="footer">
// //                                     <p>${result.data.footer.note}</p>
// //                                     <p><strong>${result.data.footer.terms}</strong></p>
// //                                     <p>${result.data.footer.companyName}</p>
// //                                 </div>
// //                             </div>
// //                         </body>
// //                     </html>
// //                 `);
// //                     invoiceWindow.document.close();
// //                 }
// //             } else {
// //                 toast({
// //                     title: "Error",
// //                     description: result.message || "Failed to generate invoice",
// //                     variant: "destructive"
// //                 });
// //             }
// //         } catch (error) {
// //             console.error('Invoice generation error:', error);
// //             toast({
// //                 title: "Error",
// //                 description: "Failed to generate invoice",
// //                 variant: "destructive"
// //             });
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     // handleDownloadInvoice function
// //     const handleDownloadInvoice = async (booking: AdvanceBooking) => {
// //         try {
// //             setLoading(true);
// //             const token = localStorage.getItem('authToken');
// //             const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings/${booking.id}/invoice`, {
// //                 headers: { 'Authorization': `Bearer ${token}` }
// //             });

// //             const result = await response.json();

// //             if (result.success) {
// //                 const invoiceData = result.data;

// //                 const htmlContent = `
// // <!DOCTYPE html>
// // <html>
// // <head>
// //     <meta charset="UTF-8">
// //     <title>Invoice - ${invoiceData.invoiceNumber}</title>
// //     <style>
// //         body { 
// //             font-family: 'Arial', sans-serif; 
// //             margin: 30px; 
// //             color: #333;
// //             line-height: 1.4;
// //         }
// //         .invoice-container {
// //             max-width: 800px;
// //             margin: 0 auto;
// //             padding: 20px;
// //             border: 1px solid #ddd;
// //             box-shadow: 0 0 10px rgba(0,0,0,0.1);
// //         }
// //         .header {
// //             display: flex;
// //             justify-content: space-between;
// //             align-items: center;
// //             border-bottom: 2px solid #2c3e50;
// //             padding-bottom: 20px;
// //             margin-bottom: 20px;
// //         }
// //         .hotel-logo {
// //             max-width: 150px;
// //             max-height: 80px;
// //             object-fit: contain;
// //         }
// //         .hotel-details {
// //             text-align: right;
// //         }
// //         .hotel-name {
// //             font-size: 24px;
// //             font-weight: bold;
// //             color: #2c3e50;
// //             margin-bottom: 5px;
// //         }
// //         .invoice-title {
// //             font-size: 20px;
// //             font-weight: bold;
// //             color: #3498db;
// //             margin: 20px 0;
// //             text-align: center;
// //         }
// //         .details-section {
// //             display: grid;
// //             grid-template-columns: 1fr 1fr;
// //             gap: 20px;
// //             margin-bottom: 30px;
// //         }
// //         .details-box {
// //             padding: 15px;
// //             background-color: #f8f9fa;
// //             border-radius: 5px;
// //             border-left: 4px solid #3498db;
// //         }
// //         .details-label {
// //             font-weight: bold;
// //             color: #2c3e50;
// //             margin-bottom: 10px;
// //             font-size: 16px;
// //         }
// //         table {
// //             width: 100%;
// //             border-collapse: collapse;
// //             margin: 20px 0;
// //         }
// //         th {
// //             background-color: #2c3e50;
// //             color: white;
// //             padding: 12px;
// //             text-align: left;
// //         }
// //         td {
// //             padding: 10px;
// //             border-bottom: 1px solid #ddd;
// //         }
// //         .total-row {
// //             font-weight: bold;
// //             background-color: #e8f4fd;
// //         }
// //         .total-row td {
// //             border-top: 2px solid #3498db;
// //         }
// //         .footer {
// //             margin-top: 40px;
// //             text-align: center;
// //             font-size: 14px;
// //             color: #666;
// //             border-top: 1px dashed #ddd;
// //             padding-top: 20px;
// //         }
// //         .payment-status {
// //             display: inline-block;
// //             padding: 5px 10px;
// //             border-radius: 3px;
// //             font-weight: bold;
// //         }
// //         .status-pending { background-color: #fff3cd; color: #856404; }
// //         .status-partial { background-color: #cce5ff; color: #004085; }
// //         .status-completed { background-color: #d4edda; color: #155724; }
// //         .status-confirmed { background-color: #d1ecf1; color: #0c5460; }
// //         @media print {
// //             body { margin: 0; }
// //             .invoice-container { border: none; box-shadow: none; }
// //         }
// //     </style>
// // </head>
// // <body>
// //     <div class="invoice-container">
// //         <!-- Header with Logo -->
// //         <div class="header">
// //             <div>
// //                 ${invoiceData.hotel.logo ?
// //                         `<img src="${invoiceData.hotel.logo}" class="hotel-logo" alt="Hotel Logo">` :
// //                         `<h1 class="hotel-name">${invoiceData.hotel.name}</h1>`
// //                     }
// //             </div>
// //             <div class="hotel-details">
// //                 <div class="hotel-name">${invoiceData.hotel.name}</div>
// //                 <p>${invoiceData.hotel.address || ''}<br>
// //                 Phone: ${invoiceData.hotel.phone || 'N/A'}<br>
// //                 Email: ${invoiceData.hotel.email || 'N/A'}<br>
// //                 ${invoiceData.hotel.gstin ? `GSTIN: ${invoiceData.hotel.gstin}` : ''}</p>
// //             </div>
// //         </div>

// //         <!-- Invoice Title -->
// //         <div class="invoice-title">
// //             ADVANCE BOOKING INVOICE
// //         </div>

// //         <!-- Invoice Number and Date -->
// //         <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
// //             <div><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</div>
// //             <div><strong>Date:</strong> ${invoiceData.invoiceDate}</div>
// //             <div><strong>Valid Until:</strong> ${invoiceData.expiryDate || 'N/A'}</div>
// //         </div>

// //         <!-- Customer and Booking Details -->
// //         <div class="details-section">
// //             <div class="details-box">
// //                 <div class="details-label">Bill To:</div>
// //                 <p><strong>${invoiceData.customer.name}</strong><br>
// //                 Phone: ${invoiceData.customer.phone}<br>
// //                 ${invoiceData.customer.email ? `Email: ${invoiceData.customer.email}<br>` : ''}
// //                 ${invoiceData.customer.address ? `Address: ${invoiceData.customer.address}` : ''}</p>
// //             </div>

// //             <div class="details-box">
// //                 <div class="details-label">Booking Details:</div>
// //                 <p><strong>Room:</strong> ${invoiceData.booking.roomNumber} (${invoiceData.booking.roomType})<br>
// //                 <strong>Check-in:</strong> ${invoiceData.booking.fromDate} ${invoiceData.booking.fromTime}<br>
// //                 <strong>Check-out:</strong> ${invoiceData.booking.toDate} ${invoiceData.booking.toTime}<br>
// //                 <strong>Nights:</strong> ${invoiceData.booking.nights}<br>
// //                 <strong>Guests:</strong> ${invoiceData.booking.guests}</p>
// //             </div>
// //         </div>

// //         <!-- Charges Table -->
// //         <table>
// //             <thead>
// //                 <tr>
// //                     <th>Description</th>
// //                     <th style="text-align: right;">Amount (₹)</th>
// //                 </tr>
// //             </thead>
// //             <tbody>
// //                 ${invoiceData.charges.map(charge => `
// //                     <tr>
// //                         <td>${charge.description}</td>
// //                         <td style="text-align: right;">₹${charge.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
// //                     </tr>
// //                 `).join('')}
// //             </tbody>
// //             <tfoot>
// //                 <tr>
// //                     <td style="text-align: right;"><strong>Subtotal:</strong></td>
// //                     <td style="text-align: right;">₹${invoiceData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
// //                 </tr>
// //                 <tr class="total-row">
// //                     <td style="text-align: right;"><strong>TOTAL:</strong></td>
// //                     <td style="text-align: right;">₹${invoiceData.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
// //                 </tr>
// //                 <tr style="background-color: #e8f4fd;">
// //                     <td style="text-align: right;"><strong>Advance Paid:</strong></td>
// //                     <td style="text-align: right;">₹${invoiceData.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
// //                 </tr>
// //                 ${invoiceData.remainingDue > 0 ? `
// //                     <tr style="background-color: #fff3cd;">
// //                         <td style="text-align: right;"><strong>Remaining Due:</strong></td>
// //                         <td style="text-align: right;">₹${invoiceData.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
// //                     </tr>
// //                 ` : ''}
// //             </tfoot>
// //         </table>

// //         <!-- Payment Details -->
// //         <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
// //             <div style="display: flex; justify-content: space-between; align-items: center;">
// //                 <div>
// //                     <strong>Payment Method:</strong> ${invoiceData.payment.method}<br>
// //                     <strong>Payment Status:</strong> 
// //                     <span class="payment-status status-${invoiceData.payment.status}">
// //                         ${invoiceData.payment.status}
// //                     </span><br>
// //                     ${invoiceData.payment.transactionId ? `<strong>Transaction ID:</strong> ${invoiceData.payment.transactionId}<br>` : ''}
// //                     <strong>Booking Status:</strong> 
// //                     <span class="payment-status status-${invoiceData.status}">
// //                         ${invoiceData.status}
// //                     </span>
// //                 </div>
// //             </div>
// //         </div>

// //         <!-- Notes -->
// //         ${invoiceData.notes ? `
// //             <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
// //                 <strong>Notes:</strong> ${invoiceData.notes}
// //             </div>
// //         ` : ''}

// //         <!-- Footer -->
// //         <div class="footer">
// //             <p>${invoiceData.footer.note}</p>
// //             <p><strong>${invoiceData.footer.terms}</strong></p>
// //             <p>${invoiceData.footer.companyName}</p>
// //         </div>
// //     </div>
// // </body>
// // </html>
// //             `;

// //                 const blob = new Blob([htmlContent], { type: 'text/html' });
// //                 const url = window.URL.createObjectURL(blob);
// //                 const link = document.createElement('a');
// //                 link.href = url;
// //                 link.download = `invoice-${booking.invoice_number}.html`;
// //                 document.body.appendChild(link);
// //                 link.click();
// //                 document.body.removeChild(link);
// //                 window.URL.revokeObjectURL(url);

// //                 toast({
// //                     title: "Success",
// //                     description: "Invoice downloaded successfully"
// //                 });
// //             } else {
// //                 toast({
// //                     title: "Error",
// //                     description: result.message || "Failed to download invoice",
// //                     variant: "destructive"
// //                 });
// //             }
// //         } catch (error) {
// //             console.error('Download error:', error);
// //             toast({
// //                 title: "Error",
// //                 description: "Failed to download invoice",
// //                 variant: "destructive"
// //             });
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <Layout>
// //             <div className="space-y-6">
// //                 {/* Header */}
// //                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
// //                     <div>
// //                         <h1 className="text-2xl md:text-3xl font-bold">Advance Bookings</h1>
// //                         <p className="text-muted-foreground mt-1">
// //                             {loading ? 'Loading...' : `${filteredBookings.length} advance bookings found`}
// //                         </p>
// //                     </div>
// //                     <div className="flex gap-2">
// //                         <Button onClick={() => {
// //                             setRefreshTrigger(prev => prev + 1);
// //                         }} variant="outline" disabled={loading}>
// //                             <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
// //                             Refresh
// //                         </Button>
// //                         <Button onClick={() => setShowForm(true)}>
// //                             <CalendarDays className="h-4 w-4 mr-2" />
// //                             New Advance Booking
// //                         </Button>
// //                     </div>
// //                 </div>

// //                 {/* Stats Cards */}
// //                 {/* {stats && (
// //                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                         <Card>
// //                             <CardContent className="p-4">
// //                                 <div className="flex justify-between items-center">
// //                                     <div>
// //                                         <p className="text-sm text-muted-foreground">Total</p>
// //                                         <p className="text-2xl font-bold">{stats.total || 0}</p>
// //                                     </div>
// //                                     <CalendarDays className="h-8 w-8 text-blue-500 opacity-50" />
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                         <Card>
// //                             <CardContent className="p-4">
// //                                 <div className="flex justify-between items-center">
// //                                     <div>
// //                                         <p className="text-sm text-muted-foreground">Advance Collected</p>
// //                                         <p className="text-2xl font-bold">₹{(stats.total_advance_collected || 0).toLocaleString('en-IN')}</p>
// //                                     </div>
// //                                     <IndianRupee className="h-8 w-8 text-green-500 opacity-50" />
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                     </div>
// //                 )} */}

// //                 {stats && (
// //                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                         <Card>
// //                             <CardContent className="p-4">
// //                                 <div className="flex justify-between items-center">
// //                                     <div>
// //                                         <p className="text-sm text-muted-foreground">Today's Total</p>
// //                                         <p className="text-2xl font-bold">{stats.total || 0}</p>
// //                                     </div>
// //                                     <CalendarDays className="h-8 w-8 text-blue-500 opacity-50" />
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                         <Card>
// //                             <CardContent className="p-4">
// //                                 <div className="flex justify-between items-center">
// //                                     <div>
// //                                         <p className="text-sm text-muted-foreground">Today's Advance Collected</p>
// //                                         <p className="text-2xl font-bold">₹{(stats.total_advance_collected || 0).toLocaleString('en-IN')}</p>
// //                                     </div>
// //                                     <IndianRupee className="h-8 w-8 text-green-500 opacity-50" />
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                     </div>
// //                 )}

// //                 {/* ===== UPDATED: Search and Filter Section with Calendar ===== */}
// //                 <Card>
// //                     <CardContent className="p-4 space-y-4">
// //                         {/* Search Input */}
// //                         <div className="relative">
// //                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
// //                             <Input
// //                                 placeholder="Search by customer name, phone, room, or invoice..."
// //                                 value={searchTerm}
// //                                 onChange={(e) => setSearchTerm(e.target.value)}
// //                                 className="pl-10"
// //                             />
// //                         </div>

// //                         {/* Calendar Filter */}
// //                         <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
// //                             {/* Date Filter Type Selector */}
// //                             <div className="flex gap-2">
// //                                 <Button
// //                                     variant={dateFilterType === 'created' ? 'default' : 'outline'}
// //                                     size="sm"
// //                                     onClick={() => setDateFilterType('created')}
// //                                 >
// //                                     Created Date
// //                                 </Button>
// //                                 <Button
// //                                     variant={dateFilterType === 'booking' ? 'default' : 'outline'}
// //                                     size="sm"
// //                                     onClick={() => setDateFilterType('booking')}
// //                                 >
// //                                     Booking Date
// //                                 </Button>
// //                                 <Button
// //                                     variant={dateFilterType === 'expiry' ? 'default' : 'outline'}
// //                                     size="sm"
// //                                     onClick={() => setDateFilterType('expiry')}
// //                                 >
// //                                     Expiry Date
// //                                 </Button>
// //                             </div>

// //                             {/* Date Range Picker */}
// //                             <div className="flex items-center gap-2 flex-1">
// //                                 <Popover>
// //                                     <PopoverTrigger asChild>
// //                                         <Button
// //                                             variant="outline"
// //                                             className={cn(
// //                                                 "w-full md:w-[300px] justify-start text-left font-normal",
// //                                                 !dateRange?.from && "text-muted-foreground"
// //                                             )}
// //                                         >
// //                                             <CalendarIcon className="mr-2 h-4 w-4" />
// //                                             {dateRange?.from ? (
// //                                                 dateRange.to ? (
// //                                                     <>
// //                                                         {format(dateRange.from, "dd/MM/yyyy")} -{" "}
// //                                                         {format(dateRange.to, "dd/MM/yyyy")}
// //                                                     </>
// //                                                 ) : (
// //                                                     format(dateRange.from, "dd/MM/yyyy")
// //                                                 )
// //                                             ) : (
// //                                                 <span>Pick a date range</span>
// //                                             )}
// //                                         </Button>
// //                                     </PopoverTrigger>
// //                                     <PopoverContent className="w-auto p-0" align="start">
// //                                         <Calendar
// //                                             initialFocus
// //                                             mode="range"
// //                                             defaultMonth={dateRange?.from}
// //                                             selected={dateRange}
// //                                             onSelect={setDateRange}
// //                                             numberOfMonths={2}
// //                                         />
// //                                     </PopoverContent>
// //                                 </Popover>

// //                                 {/* Clear Filter Button */}
// //                                 {(dateRange?.from || dateRange?.to) && (
// //                                     <Button
// //                                         variant="ghost"
// //                                         size="sm"
// //                                         onClick={clearDateFilter}
// //                                         className="h-8 px-2"
// //                                     >
// //                                         <X className="h-4 w-4 mr-1" />
// //                                         Clear
// //                                     </Button>
// //                                 )}
// //                             </div>
// //                         </div>

// //                         {/* Active Filter Indicator */}
// //                         {(dateRange?.from || dateRange?.to || searchTerm) && (
// //                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
// //                                 <span>Active filters:</span>
// //                                 {searchTerm && (
// //                                     <Badge variant="secondary" className="flex items-center gap-1">
// //                                         Search: "{searchTerm}"
// //                                         <X
// //                                             className="h-3 w-3 cursor-pointer"
// //                                             onClick={() => setSearchTerm('')}
// //                                         />
// //                                     </Badge>
// //                                 )}
// //                                 {dateRange?.from && (
// //                                     <Badge variant="secondary" className="flex items-center gap-1">
// //                                         {dateFilterType === 'created' ? 'Created' :
// //                                             dateFilterType === 'booking' ? 'Booking' : 'Expiry'}:
// //                                         {format(dateRange.from, "dd/MM/yyyy")}
// //                                         {dateRange.to && ` - ${format(dateRange.to, "dd/MM/yyyy")}`}
// //                                         <X
// //                                             className="h-3 w-3 cursor-pointer"
// //                                             onClick={clearDateFilter}
// //                                         />
// //                                     </Badge>
// //                                 )}
// //                             </div>
// //                         )}
// //                     </CardContent>
// //                 </Card>

// //                 {/* Bookings List */}
// //                 <Tabs defaultValue="all" key={refreshTrigger}>
// //                     <TabsList>
// //                         <TabsTrigger value="all">All</TabsTrigger>
// //                     </TabsList>

// //                     <TabsContent value="all" className="space-y-4 mt-4">
// //                         {loading ? (
// //                             <Card>
// //                                 <CardContent className="flex items-center justify-center py-12">
// //                                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
// //                                     <span className="ml-2 text-muted-foreground">Loading bookings...</span>
// //                                 </CardContent>
// //                             </Card>
// //                         ) : (
// //                             <>
// //                                 {filteredBookings.map((booking) => (
// //                                     <Card key={booking.id} className="hover:shadow-md transition-shadow">
// //                                         <CardContent className="p-4">
// //                                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //                                                 <div className="space-y-2 flex-1">
// //                                                     <div className="flex items-center gap-3">
// //                                                         <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
// //                                                             {booking.invoice_number}
// //                                                         </span>
// //                                                         {getStatusBadge(booking.status)}
// //                                                         {getPaymentBadge(booking.payment_status)}
// //                                                     </div>

// //                                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
// //                                                         <div>
// //                                                             <span className="text-muted-foreground">Customer:</span>
// //                                                             <div className="font-medium flex items-center gap-1">
// //                                                                 <User className="h-3 w-3" />
// //                                                                 {booking.customer_name}
// //                                                             </div>
// //                                                             <div className="text-xs flex items-center gap-1">
// //                                                                 <Phone className="h-3 w-3" />
// //                                                                 {booking.customer_phone}
// //                                                             </div>
// //                                                             {booking.customer_email && (
// //                                                                 <div className="text-xs flex items-center gap-1">
// //                                                                     <Mail className="h-3 w-3" />
// //                                                                     {booking.customer_email}
// //                                                                 </div>
// //                                                             )}
// //                                                         </div>

// //                                                         <div>
// //                                                             <span className="text-muted-foreground">Room:</span>
// //                                                             <div className="font-medium">
// //                                                                 {booking.room_number || 'Not assigned'}
// //                                                                 {booking.room_type && <span className="text-xs ml-1">({booking.room_type})</span>}
// //                                                             </div>
// //                                                             <div className="text-xs text-muted-foreground">
// //                                                                 {booking.from_date && format(new Date(booking.from_date), 'dd MMM')} - {booking.to_date && format(new Date(booking.to_date), 'dd MMM')}
// //                                                             </div>
// //                                                         </div>

// //                                                         <div>
// //                                                             <span className="text-muted-foreground">Payment:</span>
// //                                                             <div className="font-medium">
// //                                                                 <span className="text-green-600">Adv: ₹{booking.advance_amount}</span>
// //                                                                 {booking.remaining_amount > 0 && (
// //                                                                     <span className="text-orange-600 ml-2">Due: ₹{booking.remaining_amount}</span>
// //                                                                 )}
// //                                                             </div>
// //                                                             <div className="text-xs text-muted-foreground">
// //                                                                 Total: ₹{booking.total}
// //                                                             </div>
// //                                                         </div>

// //                                                         <div>
// //                                                             <span className="text-muted-foreground">Expires:</span>
// //                                                             <div className="font-medium">
// //                                                                 {booking.advance_expiry_date ? format(new Date(booking.advance_expiry_date), 'dd MMM yyyy') : 'N/A'}
// //                                                             </div>
// //                                                             <div className="text-xs text-muted-foreground">
// //                                                                 Created: {format(new Date(booking.created_at), 'dd MMM yyyy')}
// //                                                             </div>
// //                                                         </div>
// //                                                     </div>
// //                                                 </div>

// //                                                 <div className="flex gap-2">
// //                                                     <Button size="sm" variant="outline" onClick={() => handleViewInvoice(booking)}>
// //                                                         <Eye className="h-4 w-4 mr-2" />
// //                                                         View
// //                                                     </Button>
// //                                                     <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(booking)}>
// //                                                         <Download className="h-4 w-4 mr-2" />
// //                                                         Invoice
// //                                                     </Button>
// //                                                     {booking.status === 'pending' && (
// //                                                         <Button
// //                                                             size="sm"
// //                                                             className="bg-green-600 hover:bg-green-700"
// //                                                             onClick={() => handleConvertAndBook(booking)}
// //                                                         >
// //                                                             <ArrowRight className="h-4 w-4 mr-2" />
// //                                                             Convert & Book
// //                                                         </Button>
// //                                                     )}
// //                                                 </div>
// //                                             </div>
// //                                         </CardContent>
// //                                     </Card>
// //                                 ))}

// //                                 {filteredBookings.length === 0 && (
// //                                     <Card>
// //                                         <CardContent className="flex flex-col items-center justify-center py-12">
// //                                             <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
// //                                             <h3 className="text-lg font-semibold">No advance bookings found</h3>
// //                                             <p className="text-muted-foreground mb-4">
// //                                                 {searchTerm || dateRange?.from ? 'Try adjusting your filters' : 'Create your first advance booking'}
// //                                             </p>
// //                                             <Button onClick={() => setShowForm(true)}>
// //                                                 New Advance Booking
// //                                             </Button>
// //                                         </CardContent>
// //                                     </Card>
// //                                 )}
// //                             </>
// //                         )}
// //                     </TabsContent>
// //                 </Tabs>
// //             </div>

// //             {/* Booking Form for Conversion */}
// //             {showBookingForm && selectedAdvanceForBooking && (
// //                 <BookingForm
// //                     roomId={selectedAdvanceForBooking.room_id?.toString() || ''}
// //                     room={rooms.find(r => r.id?.toString() === selectedAdvanceForBooking.room_id?.toString())}
// //                     spreadsheetId=""
// //                     userSource="database"
// //                     onClose={() => {
// //                         setShowBookingForm(false);
// //                         setSelectedAdvanceForBooking(null);
// //                     }}
// //                     onSuccess={() => {
// //                         setRefreshTrigger(prev => prev + 1);
// //                         setShowBookingForm(false);
// //                         setSelectedAdvanceForBooking(null);
// //                     }}
// //                     advanceBookingData={selectedAdvanceForBooking}
// //                     isAdvanceConversion={true}
// //                 />
// //             )}

// //             {/* Advance Booking Form */}
// //             <AdvanceBookingForm
// //                 open={showForm}
// //                 onClose={() => setShowForm(false)}
// //                 onSuccess={handleAdvanceBookingSuccess}
// //                 rooms={rooms}
// //                 userSource="database"
// //             />
// //         </Layout>
// //     );
// // };

// // export default AdvanceBookings;


// import { useState, useEffect } from 'react';
// import Layout from '@/components/Layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Input } from '@/components/ui/input';
// import { useToast } from '@/hooks/use-toast';
// import AdvanceBookingForm from '@/components/AdvanceBookingForm';
// import {
//     CalendarDays,
//     RefreshCw,
//     Search,
//     IndianRupee,
//     Clock,
//     User,
//     Phone,
//     Mail,
//     CheckCircle,
//     AlertCircle,
//     XCircle,
//     ArrowRight,
//     Download,
//     Eye,
//     Loader2,
//     Calendar as CalendarIcon,
//     X
// } from 'lucide-react';
// import { format } from 'date-fns';
// import BookingForm from '@/components/BookingForm';
// import { Calendar } from '@/components/ui/calendar';
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from '@/components/ui/popover';
// import { DateRange } from 'react-day-picker';
// import { cn } from '@/lib/utils';

// const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// interface AdvanceBooking {
//     id: number;
//     invoice_number: string;
//     customer_name: string;
//     customer_phone: string;
//     customer_email: string;
//     room_number: string;
//     room_type: string;
//     from_date: string;
//     to_date: string;
//     total: number;
//     advance_amount: number;
//     remaining_amount: number;
//     payment_method: string;
//     payment_status: string;
//     status: string;
//     advance_expiry_date: string;
//     created_at: string;
//     transaction_id: string;
//     room_id?: number;
// }

// const AdvanceBookings = () => {
//     const { toast } = useToast();
//     const [bookings, setBookings] = useState<AdvanceBooking[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');

//     // Date range state
//     const [dateRange, setDateRange] = useState<DateRange | undefined>({
//         from: undefined,
//         to: undefined,
//     });
//     const [dateFilterType, setDateFilterType] = useState<'created' | 'booking' | 'expiry'>('created');

//     const [showForm, setShowForm] = useState(false);
//     const [rooms, setRooms] = useState<any[]>([]);
//     const [stats, setStats] = useState<any>({});
//     const [showBookingForm, setShowBookingForm] = useState(false);
//     const [selectedAdvanceForBooking, setSelectedAdvanceForBooking] = useState<any>(null);

//     // Refresh trigger state
//     const [refreshTrigger, setRefreshTrigger] = useState(0);

//     // ===== Helper function to get current user's hotel ID =====
//     const getCurrentHotelId = (): string | null => {
//         try {
//             const currentUser = localStorage.getItem('currentUser');
//             if (!currentUser) return null;
//             const user = JSON.parse(currentUser);
//             return user.hotel_id || user.hotelId || null;
//         } catch (error) {
//             console.error('Error getting hotel ID:', error);
//             return null;
//         }
//     };

//     // ===== Build URL with hotel_id =====
//     const buildUrlWithHotelId = (baseUrl: string): string => {
//         const hotelId = getCurrentHotelId();
//         if (!hotelId) return baseUrl;

//         const separator = baseUrl.includes('?') ? '&' : '?';
//         return `${baseUrl}${separator}hotel_id=${hotelId}`;
//     };

//     const clearDateFilter = () => {
//         setDateRange({ from: undefined, to: undefined });
//     };

//     const filterByDateRange = (booking: AdvanceBooking) => {
//         if (!dateRange?.from && !dateRange?.to) return true;

//         let bookingDate: Date | null = null;

//         switch (dateFilterType) {
//             case 'created':
//                 bookingDate = booking.created_at ? new Date(booking.created_at) : null;
//                 break;
//             case 'booking':
//                 bookingDate = booking.from_date ? new Date(booking.from_date) : null;
//                 break;
//             case 'expiry':
//                 bookingDate = booking.advance_expiry_date ? new Date(booking.advance_expiry_date) : null;
//                 break;
//         }

//         if (!bookingDate) return false;

//         bookingDate.setHours(0, 0, 0, 0);

//         if (dateRange.from && dateRange.to) {
//             const from = new Date(dateRange.from);
//             from.setHours(0, 0, 0, 0);
//             const to = new Date(dateRange.to);
//             to.setHours(23, 59, 59, 999);
//             return bookingDate >= from && bookingDate <= to;
//         } else if (dateRange.from) {
//             const from = new Date(dateRange.from);
//             from.setHours(0, 0, 0, 0);
//             return bookingDate >= from;
//         } else if (dateRange.to) {
//             const to = new Date(dateRange.to);
//             to.setHours(23, 59, 59, 999);
//             return bookingDate <= to;
//         }

//         return true;
//     };

//     // Filtered bookings
//     const filteredBookings = bookings
//         .filter(booking =>
//             booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             booking.customer_phone?.includes(searchTerm) ||
//             booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             booking.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//         .filter(filterByDateRange);

//     // ===== FIXED: fetchBookings function with proper data transformation =====
//     const fetchBookings = async () => {
//         setLoading(true);
//         try {
//             const token = localStorage.getItem('authToken');
//             console.log('Fetching advance bookings...', new Date().toLocaleTimeString());

//             // Build URL with hotel_id
//             const url = buildUrlWithHotelId(`${NODE_BACKEND_URL}/advance-bookings`);
//             console.log('Fetching from URL:', url);

//             const response = await fetch(url, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();
//             console.log('Raw API response:', data);

//             // Transform the data to match your interface
//             const transformedData = (data.data || []).map((item: any) => ({
//                 id: item.id,
//                 invoice_number: item.invoice_number || `ADV-${item.id}`,
//                 customer_name: item.customer_name || 'Unknown',
//                 customer_phone: item.customer_phone || 'N/A',
//                 customer_email: item.customer_email || '',
//                 room_number: item.room_number || 'Not assigned',
//                 room_type: item.room_type || 'Standard',
//                 from_date: item.from_date,
//                 to_date: item.to_date,
//                 total: parseFloat(item.amount || item.total || 0),
//                 advance_amount: parseFloat(item.advance_amount || 0),
//                 remaining_amount: parseFloat(item.remaining_amount || 0),
//                 payment_method: item.payment_method || 'cash',
//                 payment_status: item.payment_status || 'pending',
//                 status: item.status || 'pending',
//                 advance_expiry_date: item.advance_expiry_date,
//                 created_at: item.created_at || new Date().toISOString(),
//                 transaction_id: item.transaction_id,
//                 room_id: item.room_id
//             }));

//             console.log('Transformed bookings:', transformedData);
//             setBookings(transformedData);

//             // Fetch stats
//             const statsUrl = buildUrlWithHotelId(`${NODE_BACKEND_URL}/advance-bookings/stats`);
//             const statsRes = await fetch(statsUrl, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (statsRes.ok) {
//                 const statsData = await statsRes.json();
//                 console.log('Stats data:', statsData);
//                 setStats(statsData.data || {});
//             }

//         } catch (error) {
//             console.error('Error fetching bookings:', error);
//             toast({
//                 title: "Error",
//                 description: "Failed to load advance bookings",
//                 variant: "destructive"
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle advance booking success
//     const handleAdvanceBookingSuccess = async () => {
//         console.log('Advance booking created, refreshing...');

//         toast({
//             title: "Processing",
//             description: "Creating advance booking...",
//         });

//         setTimeout(async () => {
//             try {
//                 await fetchBookings();
//                 setRefreshTrigger(prev => prev + 1);
//                 setShowForm(false);

//                 toast({
//                     title: "✅ Success",
//                     description: "Advance booking created successfully",
//                     variant: "default"
//                 });
//             } catch (error) {
//                 toast({
//                     title: "Error",
//                     description: "Failed to refresh bookings",
//                     variant: "destructive"
//                 });
//             }
//         }, 500);
//     };

//     // fetchRooms function
//     const fetchRooms = async () => {
//         try {
//             const token = localStorage.getItem('authToken');
//             console.log('Fetching rooms...');

//             const url = buildUrlWithHotelId(`${NODE_BACKEND_URL}/rooms`);

//             const response = await fetch(url, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();

//             let roomsData = [];
//             if (data.success && Array.isArray(data.data)) {
//                 roomsData = data.data;
//             } else if (Array.isArray(data)) {
//                 roomsData = data;
//             } else if (data.data && Array.isArray(data.data)) {
//                 roomsData = data.data;
//             } else {
//                 roomsData = [];
//             }

//             const transformedRooms = roomsData.map((room: any) => ({
//                 id: room.id || room.room_id,
//                 roomId: room.id?.toString() || room.room_id?.toString() || `room-${room.room_number}`,
//                 number: room.room_number || room.number || 'N/A',
//                 type: room.type || 'Standard',
//                 price: parseFloat(room.price) || 0,
//                 maxOccupancy: room.max_occupancy || room.maxOccupancy || 2,
//                 floor: room.floor || 1,
//                 status: room.status || 'available'
//             }));

//             console.log('Transformed rooms:', transformedRooms);
//             setRooms(transformedRooms);

//         } catch (error) {
//             console.error('Error fetching rooms:', error);
//             toast({
//                 title: "Error",
//                 description: "Failed to load rooms. Please try again.",
//                 variant: "destructive"
//             });
//         }
//     };

//     // Use refreshTrigger in useEffect
//     useEffect(() => {
//         fetchBookings();
//     }, [refreshTrigger]);

//     // Initial fetch for rooms
//     useEffect(() => {
//         fetchRooms();
//     }, []);

//     // Event listener for conversions
//     useEffect(() => {
//         const handleAdvanceBookingConverted = (event: CustomEvent) => {
//             console.log('Advance booking converted, refreshing list...', event.detail);
//             setRefreshTrigger(prev => prev + 1);
//             toast({
//                 title: "✅ Advance Booking Converted",
//                 description: `Booking has been converted to regular booking`,
//                 variant: "default"
//             });
//         };

//         window.addEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);

//         return () => {
//             window.removeEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);
//         };
//     }, []);

//     // handleConvertAndBook function
//     // const handleConvertAndBook = (booking: AdvanceBooking) => {
//     //     setSelectedAdvanceForBooking(booking);
//     //     setShowBookingForm(true);
//     // };

//     // In AdvanceBookings.tsx - Update the handleConvertAndBook function
//     const handleConvertAndBook = (booking: AdvanceBooking) => {
//         // Create a deep copy of the booking data to avoid reference issues
//         const bookingCopy = { ...booking };

//         // Ensure dates are properly formatted without timezone shifts
//         if (bookingCopy.from_date) {
//             // Split the date to avoid timezone issues
//             const [year, month, day] = bookingCopy.from_date.split('T')[0].split('-');
//             bookingCopy.from_date = `${year}-${month}-${day}`;
//         }

//         if (bookingCopy.to_date) {
//             const [year, month, day] = bookingCopy.to_date.split('T')[0].split('-');
//             bookingCopy.to_date = `${year}-${month}-${day}`;
//         }
//         console.log('📋 Copied booking:', {
//             from_date: bookingCopy.from_date,
//             to_date: bookingCopy.to_date
//         });

//         setSelectedAdvanceForBooking(bookingCopy);
//         setShowBookingForm(true);
//     };

//     // getStatusBadge function
//     const getStatusBadge = (status: string) => {
//         const config: Record<string, { label: string; class: string }> = {
//             pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
//             confirmed: { label: 'Confirmed', class: 'bg-green-100 text-green-800 border-green-200' },
//             cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-800 border-red-200' },
//             expired: { label: 'Expired', class: 'bg-gray-100 text-gray-800 border-gray-200' },
//             converted: { label: 'Converted', class: 'bg-blue-100 text-blue-800 border-blue-200' }
//         };
//         const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
//         return <Badge variant="outline" className={c.class}>{c.label}</Badge>;
//     };

//     // getPaymentBadge function
//     const getPaymentBadge = (status: string) => {
//         const config: Record<string, { label: string; class: string }> = {
//             pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
//             partial: { label: 'Partial', class: 'bg-blue-100 text-blue-800' },
//             completed: { label: 'Paid', class: 'bg-green-100 text-green-800' }
//         };
//         const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
//         return <Badge className={c.class}>{c.label}</Badge>;
//     };

//     // handleViewInvoice function (unchanged from your working code)
//     const handleViewInvoice = async (booking: AdvanceBooking) => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('authToken');
//             const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings/${booking.id}/invoice`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             const result = await response.json();

//             if (result.success) {
//                 const invoiceWindow = window.open('', '_blank');
//                 if (invoiceWindow) {
//                     invoiceWindow.document.write(`
//                     <html>
//                         <head>
//                             <title>Invoice - ${result.data.invoiceNumber}</title>
//                             <style>
//                                 body { font-family: Arial, sans-serif; padding: 20px; }
//                                 .invoice-container { max-width: 800px; margin: 0 auto; }
//                                 .header { text-align: center; margin-bottom: 30px; }
//                                 .hotel-logo { max-width: 150px; max-height: 80px; }
//                                 table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//                                 th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//                                 th { background-color: #f2f2f2; }
//                                 .total { font-weight: bold; font-size: 18px; }
//                                 .footer { margin-top: 30px; text-align: center; }
//                             </style>
//                         </head>
//                         <body>
//                             <div class="invoice-container">
//                                 <div class="header">
//                                     ${result.data.hotel.logo ?
//                             `<img src="${result.data.hotel.logo}" class="hotel-logo" alt="Hotel Logo">` : ''}
//                                     <h2>${result.data.hotel.name}</h2>
//                                     <p>${result.data.hotel.address}</p>
//                                     <p>Phone: ${result.data.hotel.phone} | Email: ${result.data.hotel.email}</p>
//                                     ${result.data.hotel.gstin ? `<p>GSTIN: ${result.data.hotel.gstin}</p>` : ''}
//                                     <h3>Advance Booking Invoice</h3>
//                                     <p>Invoice #: ${result.data.invoiceNumber}</p>
//                                     <p>Date: ${result.data.invoiceDate}</p>
//                                     ${result.data.expiryDate ? `<p>Valid Until: ${result.data.expiryDate}</p>` : ''}
//                                 </div>

//                                 <div style="margin: 20px 0;">
//                                     <h4>Customer Details:</h4>
//                                     <p><strong>${result.data.customer.name}</strong><br>
//                                     Phone: ${result.data.customer.phone}<br>
//                                     ${result.data.customer.email ? `Email: ${result.data.customer.email}<br>` : ''}
//                                     ${result.data.customer.address ? `Address: ${result.data.customer.address}` : ''}</p>
//                                 </div>

//                                 <div style="margin: 20px 0;">
//                                     <h4>Booking Details:</h4>
//                                     <p><strong>Room:</strong> ${result.data.booking.roomNumber} (${result.data.booking.roomType})<br>
//                                     <strong>Check-in:</strong> ${result.data.booking.fromDate} ${result.data.booking.fromTime}<br>
//                                     <strong>Check-out:</strong> ${result.data.booking.toDate} ${result.data.booking.toTime}<br>
//                                     <strong>Nights:</strong> ${result.data.booking.nights}<br>
//                                     <strong>Guests:</strong> ${result.data.booking.guests}</p>
//                                 </div>

//                                 <table>
//                                     <thead>
//                                         <tr>
//                                             <th>Description</th>
//                                             <th>Amount (₹)</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         ${result.data.charges.map(charge => `
//                                             <tr>
//                                                 <td>${charge.description}</td>
//                                                 <td>₹${charge.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                                             </tr>
//                                         `).join('')}
//                                     </tbody>
//                                     <tfoot>
//                                         <tr>
//                                             <td><strong>Subtotal</strong></td>
//                                             <td><strong>₹${result.data.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
//                                         </tr>
//                                         <tr>
//                                             <td><strong>Total</strong></td>
//                                             <td><strong>₹${result.data.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
//                                         </tr>
//                                         <tr style="background-color: #e8f4fd;">
//                                             <td><strong>Advance Paid</strong></td>
//                                             <td><strong>₹${result.data.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
//                                         </tr>
//                                         ${result.data.remainingDue > 0 ? `
//                                             <tr style="background-color: #fff3cd;">
//                                                 <td><strong>Remaining Due</strong></td>
//                                                 <td><strong>₹${result.data.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
//                                             </tr>
//                                         ` : ''}
//                                     </tfoot>
//                                 </table>

//                                 <div style="margin: 20px 0;">
//                                     <p><strong>Payment Method:</strong> ${result.data.payment.method}<br>
//                                     <strong>Payment Status:</strong> ${result.data.payment.status}<br>
//                                     ${result.data.payment.transactionId ? `<strong>Transaction ID:</strong> ${result.data.payment.transactionId}<br>` : ''}
//                                     <strong>Booking Status:</strong> ${result.data.status}</p>
//                                 </div>

//                                 ${result.data.notes ? `
//                                     <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
//                                         <p><strong>Notes:</strong> ${result.data.notes}</p>
//                                     </div>
//                                 ` : ''}

//                                 <div class="footer">
//                                     <p>${result.data.footer.note}</p>
//                                     <p><strong>${result.data.footer.terms}</strong></p>
//                                     <p>${result.data.footer.companyName}</p>
//                                 </div>
//                             </div>
//                         </body>
//                     </html>
//                 `);
//                     invoiceWindow.document.close();
//                 }
//             } else {
//                 toast({
//                     title: "Error",
//                     description: result.message || "Failed to generate invoice",
//                     variant: "destructive"
//                 });
//             }
//         } catch (error) {
//             console.error('Invoice generation error:', error);
//             toast({
//                 title: "Error",
//                 description: "Failed to generate invoice",
//                 variant: "destructive"
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // handleDownloadInvoice function
//     const handleDownloadInvoice = async (booking: AdvanceBooking) => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('authToken');
//             const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings/${booking.id}/invoice`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             const result = await response.json();

//             if (result.success) {
//                 const invoiceData = result.data;

//                 const htmlContent = `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <title>Invoice - ${invoiceData.invoiceNumber}</title>
//     <style>
//         body { 
//             font-family: 'Arial', sans-serif; 
//             margin: 30px; 
//             color: #333;
//             line-height: 1.4;
//         }
//         .invoice-container {
//             max-width: 800px;
//             margin: 0 auto;
//             padding: 20px;
//             border: 1px solid #ddd;
//             box-shadow: 0 0 10px rgba(0,0,0,0.1);
//         }
//         .header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             border-bottom: 2px solid #2c3e50;
//             padding-bottom: 20px;
//             margin-bottom: 20px;
//         }
//         .hotel-logo {
//             max-width: 150px;
//             max-height: 80px;
//             object-fit: contain;
//         }
//         .hotel-details {
//             text-align: right;
//         }
//         .hotel-name {
//             font-size: 24px;
//             font-weight: bold;
//             color: #2c3e50;
//             margin-bottom: 5px;
//         }
//         .invoice-title {
//             font-size: 20px;
//             font-weight: bold;
//             color: #3498db;
//             margin: 20px 0;
//             text-align: center;
//         }
//         .details-section {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 20px;
//             margin-bottom: 30px;
//         }
//         .details-box {
//             padding: 15px;
//             background-color: #f8f9fa;
//             border-radius: 5px;
//             border-left: 4px solid #3498db;
//         }
//         .details-label {
//             font-weight: bold;
//             color: #2c3e50;
//             margin-bottom: 10px;
//             font-size: 16px;
//         }
//         table {
//             width: 100%;
//             border-collapse: collapse;
//             margin: 20px 0;
//         }
//         th {
//             background-color: #2c3e50;
//             color: white;
//             padding: 12px;
//             text-align: left;
//         }
//         td {
//             padding: 10px;
//             border-bottom: 1px solid #ddd;
//         }
//         .total-row {
//             font-weight: bold;
//             background-color: #e8f4fd;
//         }
//         .total-row td {
//             border-top: 2px solid #3498db;
//         }
//         .footer {
//             margin-top: 40px;
//             text-align: center;
//             font-size: 14px;
//             color: #666;
//             border-top: 1px dashed #ddd;
//             padding-top: 20px;
//         }
//         .payment-status {
//             display: inline-block;
//             padding: 5px 10px;
//             border-radius: 3px;
//             font-weight: bold;
//         }
//         .status-pending { background-color: #fff3cd; color: #856404; }
//         .status-partial { background-color: #cce5ff; color: #004085; }
//         .status-completed { background-color: #d4edda; color: #155724; }
//         .status-confirmed { background-color: #d1ecf1; color: #0c5460; }
//         @media print {
//             body { margin: 0; }
//             .invoice-container { border: none; box-shadow: none; }
//         }
//     </style>
// </head>
// <body>
//     <div class="invoice-container">
//         <!-- Header with Logo -->
//         <div class="header">
//             <div>
//                 ${invoiceData.hotel.logo ?
//                         `<img src="${invoiceData.hotel.logo}" class="hotel-logo" alt="Hotel Logo">` :
//                         `<h1 class="hotel-name">${invoiceData.hotel.name}</h1>`
//                     }
//             </div>
//             <div class="hotel-details">
//                 <div class="hotel-name">${invoiceData.hotel.name}</div>
//                 <p>${invoiceData.hotel.address || ''}<br>
//                 Phone: ${invoiceData.hotel.phone || 'N/A'}<br>
//                 Email: ${invoiceData.hotel.email || 'N/A'}<br>
//                 ${invoiceData.hotel.gstin ? `GSTIN: ${invoiceData.hotel.gstin}` : ''}</p>
//             </div>
//         </div>

//         <!-- Invoice Title -->
//         <div class="invoice-title">
//             ADVANCE BOOKING INVOICE
//         </div>

//         <!-- Invoice Number and Date -->
//         <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
//             <div><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</div>
//             <div><strong>Date:</strong> ${invoiceData.invoiceDate}</div>
//             <div><strong>Valid Until:</strong> ${invoiceData.expiryDate || 'N/A'}</div>
//         </div>

//         <!-- Customer and Booking Details -->
//         <div class="details-section">
//             <div class="details-box">
//                 <div class="details-label">Bill To:</div>
//                 <p><strong>${invoiceData.customer.name}</strong><br>
//                 Phone: ${invoiceData.customer.phone}<br>
//                 ${invoiceData.customer.email ? `Email: ${invoiceData.customer.email}<br>` : ''}
//                 ${invoiceData.customer.address ? `Address: ${invoiceData.customer.address}` : ''}</p>
//             </div>

//             <div class="details-box">
//                 <div class="details-label">Booking Details:</div>
//                 <p><strong>Room:</strong> ${invoiceData.booking.roomNumber} (${invoiceData.booking.roomType})<br>
//                 <strong>Check-in:</strong> ${invoiceData.booking.fromDate} ${invoiceData.booking.fromTime}<br>
//                 <strong>Check-out:</strong> ${invoiceData.booking.toDate} ${invoiceData.booking.toTime}<br>
//                 <strong>Nights:</strong> ${invoiceData.booking.nights}<br>
//                 <strong>Guests:</strong> ${invoiceData.booking.guests}</p>
//             </div>
//         </div>

//         <!-- Charges Table -->
//         <table>
//             <thead>
//                 <tr>
//                     <th>Description</th>
//                     <th style="text-align: right;">Amount (₹)</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 ${invoiceData.charges.map(charge => `
//                     <tr>
//                         <td>${charge.description}</td>
//                         <td style="text-align: right;">₹${charge.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                     </tr>
//                 `).join('')}
//             </tbody>
//             <tfoot>
//                 <tr>
//                     <td style="text-align: right;"><strong>Subtotal:</strong></td>
//                     <td style="text-align: right;">₹${invoiceData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                 </tr>
//                 <tr class="total-row">
//                     <td style="text-align: right;"><strong>TOTAL:</strong></td>
//                     <td style="text-align: right;">₹${invoiceData.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                 </tr>
//                 <tr style="background-color: #e8f4fd;">
//                     <td style="text-align: right;"><strong>Advance Paid:</strong></td>
//                     <td style="text-align: right;">₹${invoiceData.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                 </tr>
//                 ${invoiceData.remainingDue > 0 ? `
//                     <tr style="background-color: #fff3cd;">
//                         <td style="text-align: right;"><strong>Remaining Due:</strong></td>
//                         <td style="text-align: right;">₹${invoiceData.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                     </tr>
//                 ` : ''}
//             </tfoot>
//         </table>

//         <!-- Payment Details -->
//         <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
//             <div style="display: flex; justify-content: space-between; align-items: center;">
//                 <div>
//                     <strong>Payment Method:</strong> ${invoiceData.payment.method}<br>
//                     <strong>Payment Status:</strong> 
//                     <span class="payment-status status-${invoiceData.payment.status}">
//                         ${invoiceData.payment.status}
//                     </span><br>
//                     ${invoiceData.payment.transactionId ? `<strong>Transaction ID:</strong> ${invoiceData.payment.transactionId}<br>` : ''}
//                     <strong>Booking Status:</strong> 
//                     <span class="payment-status status-${invoiceData.status}">
//                         ${invoiceData.status}
//                     </span>
//                 </div>
//             </div>
//         </div>

//         <!-- Notes -->
//         ${invoiceData.notes ? `
//             <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
//                 <strong>Notes:</strong> ${invoiceData.notes}
//             </div>
//         ` : ''}

//         <!-- Footer -->
//         <div class="footer">
//             <p>${invoiceData.footer.note}</p>
//             <p><strong>${invoiceData.footer.terms}</strong></p>
//             <p>${invoiceData.footer.companyName}</p>
//         </div>
//     </div>
// </body>
// </html>
//             `;

//                 const blob = new Blob([htmlContent], { type: 'text/html' });
//                 const url = window.URL.createObjectURL(blob);
//                 const link = document.createElement('a');
//                 link.href = url;
//                 link.download = `invoice-${booking.invoice_number}.html`;
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);
//                 window.URL.revokeObjectURL(url);

//                 toast({
//                     title: "Success",
//                     description: "Invoice downloaded successfully"
//                 });
//             } else {
//                 toast({
//                     title: "Error",
//                     description: result.message || "Failed to download invoice",
//                     variant: "destructive"
//                 });
//             }
//         } catch (error) {
//             console.error('Download error:', error);
//             toast({
//                 title: "Error",
//                 description: "Failed to download invoice",
//                 variant: "destructive"
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Layout>
//             <div className="space-y-6">
//                 {/* Header */}
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                     <div>
//                         <h1 className="text-2xl md:text-3xl font-bold">Advance Bookings</h1>
//                         <p className="text-muted-foreground mt-1">
//                             {loading ? 'Loading...' : `${filteredBookings.length} advance bookings found`}
//                         </p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button onClick={() => {
//                             setRefreshTrigger(prev => prev + 1);
//                         }} variant="outline" disabled={loading}>
//                             <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//                             Refresh
//                         </Button>
//                         <Button onClick={() => setShowForm(true)}>
//                             <CalendarDays className="h-4 w-4 mr-2" />
//                             New Advance Booking
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Stats Cards */}
//                 {stats && (
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <Card>
//                             <CardContent className="p-4">
//                                 <div className="flex justify-between items-center">
//                                     <div>
//                                         <p className="text-sm text-muted-foreground">Today's Total</p>
//                                         <p className="text-2xl font-bold">{stats.total || 0}</p>
//                                     </div>
//                                     <CalendarDays className="h-8 w-8 text-blue-500 opacity-50" />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                         <Card>
//                             <CardContent className="p-4">
//                                 <div className="flex justify-between items-center">
//                                     <div>
//                                         <p className="text-sm text-muted-foreground">Today's Advance Collected</p>
//                                         <p className="text-2xl font-bold">₹{(stats.total_advance_collected || 0).toLocaleString('en-IN')}</p>
//                                     </div>
//                                     <IndianRupee className="h-8 w-8 text-green-500 opacity-50" />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 )}

//                 {/* Search and Filter Section */}
//                 <Card>
//                     <CardContent className="p-4 space-y-4">
//                         {/* Search Input */}
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//                             <Input
//                                 placeholder="Search by customer name, phone, room, or invoice..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="pl-10"
//                             />
//                         </div>

//                         {/* Calendar Filter */}
//                         <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
//                             {/* Date Filter Type Selector */}
//                             <div className="flex gap-2">
//                                 <Button
//                                     variant={dateFilterType === 'created' ? 'default' : 'outline'}
//                                     size="sm"
//                                     onClick={() => setDateFilterType('created')}
//                                 >
//                                     Created Date
//                                 </Button>
//                                 <Button
//                                     variant={dateFilterType === 'booking' ? 'default' : 'outline'}
//                                     size="sm"
//                                     onClick={() => setDateFilterType('booking')}
//                                 >
//                                     Booking Date
//                                 </Button>
//                                 <Button
//                                     variant={dateFilterType === 'expiry' ? 'default' : 'outline'}
//                                     size="sm"
//                                     onClick={() => setDateFilterType('expiry')}
//                                 >
//                                     Expiry Date
//                                 </Button>
//                             </div>

//                             {/* Date Range Picker */}
//                             <div className="flex items-center gap-2 flex-1">
//                                 <Popover>
//                                     <PopoverTrigger asChild>
//                                         <Button
//                                             variant="outline"
//                                             className={cn(
//                                                 "w-full md:w-[300px] justify-start text-left font-normal",
//                                                 !dateRange?.from && "text-muted-foreground"
//                                             )}
//                                         >
//                                             <CalendarIcon className="mr-2 h-4 w-4" />
//                                             {dateRange?.from ? (
//                                                 dateRange.to ? (
//                                                     <>
//                                                         {format(dateRange.from, "dd/MM/yyyy")} -{" "}
//                                                         {format(dateRange.to, "dd/MM/yyyy")}
//                                                     </>
//                                                 ) : (
//                                                     format(dateRange.from, "dd/MM/yyyy")
//                                                 )
//                                             ) : (
//                                                 <span>Pick a date range</span>
//                                             )}
//                                         </Button>
//                                     </PopoverTrigger>
//                                     <PopoverContent className="w-auto p-0" align="start">
//                                         <Calendar
//                                             initialFocus
//                                             mode="range"
//                                             defaultMonth={dateRange?.from}
//                                             selected={dateRange}
//                                             onSelect={setDateRange}
//                                             numberOfMonths={2}
//                                         />
//                                     </PopoverContent>
//                                 </Popover>

//                                 {/* Clear Filter Button */}
//                                 {(dateRange?.from || dateRange?.to) && (
//                                     <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={clearDateFilter}
//                                         className="h-8 px-2"
//                                     >
//                                         <X className="h-4 w-4 mr-1" />
//                                         Clear
//                                     </Button>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Active Filter Indicator */}
//                         {(dateRange?.from || dateRange?.to || searchTerm) && (
//                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                                 <span>Active filters:11</span>
//                                 {searchTerm && (
//                                     <Badge variant="secondary" className="flex items-center gap-1">
//                                         Search: "{searchTerm}"
//                                         <X
//                                             className="h-3 w-3 cursor-pointer"
//                                             onClick={() => setSearchTerm('')}
//                                         />
//                                     </Badge>
//                                 )}
//                                 {dateRange?.from && (
//                                     <Badge variant="secondary" className="flex items-center gap-1">
//                                         {dateFilterType === 'created' ? 'Created' :
//                                             dateFilterType === 'booking' ? 'Booking' : 'Expiry'}:
//                                         {format(dateRange.from, "dd/MM/yyyy")}
//                                         {dateRange.to && ` - ${format(dateRange.to, "dd/MM/yyyy")}`}
//                                         <X
//                                             className="h-3 w-3 cursor-pointer"
//                                             onClick={clearDateFilter}
//                                         />
//                                     </Badge>
//                                 )}
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>

//                 {/* Bookings List */}
//                 <Tabs defaultValue="all" key={refreshTrigger}>
//                     <TabsList>
//                         <TabsTrigger value="all">All</TabsTrigger>
//                     </TabsList>

//                     <TabsContent value="all" className="space-y-4 mt-4">
//                         {loading ? (
//                             <Card>
//                                 <CardContent className="flex items-center justify-center py-12">
//                                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//                                     <span className="ml-2 text-muted-foreground">Loading bookings...</span>
//                                 </CardContent>
//                             </Card>
//                         ) : (
//                             <>
//                                 {filteredBookings.map((booking) => (
//                                     <Card key={booking.id} className="hover:shadow-md transition-shadow">
//                                         <CardContent className="p-4">
//                                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                                                 <div className="space-y-2 flex-1">
//                                                     <div className="flex items-center gap-3">
//                                                         <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
//                                                             {booking.invoice_number}
//                                                         </span>
//                                                         {getStatusBadge(booking.status)}
//                                                         {getPaymentBadge(booking.payment_status)}
//                                                     </div>

//                                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                                                         <div>
//                                                             <span className="text-muted-foreground">Customer:</span>
//                                                             <div className="font-medium flex items-center gap-1">
//                                                                 <User className="h-3 w-3" />
//                                                                 {booking.customer_name}
//                                                             </div>
//                                                             <div className="text-xs flex items-center gap-1">
//                                                                 <Phone className="h-3 w-3" />
//                                                                 {booking.customer_phone}
//                                                             </div>
//                                                             {booking.customer_email && (
//                                                                 <div className="text-xs flex items-center gap-1">
//                                                                     <Mail className="h-3 w-3" />
//                                                                     {booking.customer_email}
//                                                                 </div>
//                                                             )}
//                                                         </div>

//                                                         <div>
//                                                             <span className="text-muted-foreground">Room:</span>
//                                                             <div className="font-medium">
//                                                                 {booking.room_number || 'Not assigned'}
//                                                                 {booking.room_type && <span className="text-xs ml-1">({booking.room_type})</span>}
//                                                             </div>
//                                                             <div className="text-xs text-muted-foreground">
//                                                                 {booking.from_date && format(new Date(booking.from_date), 'dd MMM')} - {booking.to_date && format(new Date(booking.to_date), 'dd MMM')}
//                                                             </div>
//                                                         </div>

//                                                         <div>
//                                                             <span className="text-muted-foreground">Payment:</span>
//                                                             <div className="font-medium">
//                                                                 <span className="text-green-600">Adv: ₹{booking.advance_amount}</span>
//                                                                 {booking.remaining_amount > 0 && (
//                                                                     <span className="text-orange-600 ml-2">Due: ₹{booking.remaining_amount}</span>
//                                                                 )}
//                                                             </div>
//                                                             <div className="text-xs text-muted-foreground">
//                                                                 Total: ₹{booking.total}
//                                                             </div>
//                                                         </div>

//                                                         <div>
//                                                             <span className="text-muted-foreground">Expires:</span>
//                                                             <div className="font-medium">
//                                                                 {booking.advance_expiry_date ? format(new Date(booking.advance_expiry_date), 'dd MMM yyyy') : 'N/A'}
//                                                             </div>
//                                                             <div className="text-xs text-muted-foreground">
//                                                                 Created: {format(new Date(booking.created_at), 'dd MMM yyyy')}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                                 <div className="flex gap-2">
//                                                     <Button size="sm" variant="outline" onClick={() => handleViewInvoice(booking)}>
//                                                         <Eye className="h-4 w-4 mr-2" />
//                                                         View
//                                                     </Button>
//                                                     <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(booking)}>
//                                                         <Download className="h-4 w-4 mr-2" />
//                                                         Invoice
//                                                     </Button>
//                                                     {booking.status === 'pending' && (
//                                                         <Button
//                                                             size="sm"
//                                                             className="bg-green-600 hover:bg-green-700"
//                                                             onClick={() => handleConvertAndBook(booking)}
//                                                         >
//                                                             <ArrowRight className="h-4 w-4 mr-2" />
//                                                             Convert & Book
//                                                         </Button>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 ))}

//                                 {filteredBookings.length === 0 && (
//                                     <Card>
//                                         <CardContent className="flex flex-col items-center justify-center py-12">
//                                             <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
//                                             <h3 className="text-lg font-semibold">No advance bookings found</h3>
//                                             <p className="text-muted-foreground mb-4">
//                                                 {searchTerm || dateRange?.from ? 'Try adjusting your filters' : 'Create your first advance booking'}
//                                             </p>
//                                             <Button onClick={() => setShowForm(true)}>
//                                                 New Advance Booking
//                                             </Button>
//                                         </CardContent>
//                                     </Card>
//                                 )}
//                             </>
//                         )}
//                     </TabsContent>
//                 </Tabs>
//             </div>

//             {/* Booking Form for Conversion */}
//             {showBookingForm && selectedAdvanceForBooking && (
//                 <BookingForm
//                     roomId={selectedAdvanceForBooking.room_id?.toString() || ''}
//                     room={rooms.find(r => r.id?.toString() === selectedAdvanceForBooking.room_id?.toString())}
//                     spreadsheetId=""
//                     userSource="database"
//                     onClose={() => {
//                         setShowBookingForm(false);
//                         setSelectedAdvanceForBooking(null);
//                     }}
//                     onSuccess={() => {
//                         setRefreshTrigger(prev => prev + 1);
//                         setShowBookingForm(false);
//                         setSelectedAdvanceForBooking(null);
//                     }}
//                     advanceBookingData={selectedAdvanceForBooking}
//                     isAdvanceConversion={true}
//                 />
//             )}

//             {/* Advance Booking Form */}
//             <AdvanceBookingForm
//                 open={showForm}
//                 onClose={() => setShowForm(false)}
//                 onSuccess={handleAdvanceBookingSuccess}
//                 rooms={rooms}
//                 userSource="database"
//             />
//         </Layout>
//     );
// };

// export default AdvanceBookings;


import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AdvanceBookingForm from '@/components/AdvanceBookingForm';
import MultiAdvanceBookingForm from '@/components/MultiAdvanceBookingForm'; // 👈 NEW IMPORT
import {
    CalendarDays,
    RefreshCw,
    Search,
    IndianRupee,
    Clock,
    User,
    Phone,
    Mail,
    CheckCircle,
    AlertCircle,
    XCircle,
    ArrowRight,
    Download,
    Eye,
    Loader2,
    Calendar as CalendarIcon,
    X,
    Layers,
    Plus,
    Home
} from 'lucide-react';
import { format } from 'date-fns';
import BookingForm from '@/components/BookingForm';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

interface AdvanceBooking {
    id: number;
    invoice_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    room_number: string;
    room_type: string;
    from_date: string;
    to_date: string;
    total: number;
    advance_amount: number;
    remaining_amount: number;
    payment_method: string;
    payment_status: string;
    status: string;
    advance_expiry_date: string;
    created_at: string;
    transaction_id: string;
    room_id?: number;
    group_booking_id?: string; // 👈 NEW FIELD
}

const AdvanceBookings = () => {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<AdvanceBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Date range state
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [dateFilterType, setDateFilterType] = useState<'created' | 'booking' | 'expiry'>('created');

    const [showForm, setShowForm] = useState(false);
    const [showMultiForm, setShowMultiForm] = useState(false); // 👈 NEW
    const [rooms, setRooms] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedAdvanceForBooking, setSelectedAdvanceForBooking] = useState<any>(null);

    // 👇 NEW: Group bookings state
    const [groupedAdvanceBookings, setGroupedAdvanceBookings] = useState<Map<string, AdvanceBooking[]>>(new Map());
    const [showGroupAdvanceModal, setShowGroupAdvanceModal] = useState(false);
    const [selectedGroupAdvance, setSelectedGroupAdvance] = useState<any>(null);

    // Refresh trigger state
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===== Helper function to get current user's hotel ID =====
    const getCurrentHotelId = (): string | null => {
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) return null;
            const user = JSON.parse(currentUser);
            return user.hotel_id || user.hotelId || null;
        } catch (error) {
            console.error('Error getting hotel ID:', error);
            return null;
        }
    };

    // ===== Build URL with hotel_id =====
    const buildUrlWithHotelId = (baseUrl: string): string => {
        const hotelId = getCurrentHotelId();
        if (!hotelId) return baseUrl;

        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}hotel_id=${hotelId}`;
    };

    const clearDateFilter = () => {
        setDateRange({ from: undefined, to: undefined });
    };

    const filterByDateRange = (booking: AdvanceBooking) => {
        if (!dateRange?.from && !dateRange?.to) return true;

        let bookingDate: Date | null = null;

        switch (dateFilterType) {
            case 'created':
                bookingDate = booking.created_at ? new Date(booking.created_at) : null;
                break;
            case 'booking':
                bookingDate = booking.from_date ? new Date(booking.from_date) : null;
                break;
            case 'expiry':
                bookingDate = booking.advance_expiry_date ? new Date(booking.advance_expiry_date) : null;
                break;
        }

        if (!bookingDate) return false;

        bookingDate.setHours(0, 0, 0, 0);

        if (dateRange.from && dateRange.to) {
            const from = new Date(dateRange.from);
            from.setHours(0, 0, 0, 0);
            const to = new Date(dateRange.to);
            to.setHours(23, 59, 59, 999);
            return bookingDate >= from && bookingDate <= to;
        } else if (dateRange.from) {
            const from = new Date(dateRange.from);
            from.setHours(0, 0, 0, 0);
            return bookingDate >= from;
        } else if (dateRange.to) {
            const to = new Date(dateRange.to);
            to.setHours(23, 59, 59, 999);
            return bookingDate <= to;
        }

        return true;
    };

    // Filtered bookings
    const filteredBookings = bookings
        .filter(booking =>
            booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer_phone?.includes(searchTerm) ||
            booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(filterByDateRange);

    // 👇 NEW: Function to group bookings
    const groupBookings = (bookingsData: AdvanceBooking[]) => {
        const grouped = new Map<string, AdvanceBooking[]>();
        bookingsData.forEach(booking => {
            if (booking.group_booking_id) {
                if (!grouped.has(booking.group_booking_id)) {
                    grouped.set(booking.group_booking_id, []);
                }
                grouped.get(booking.group_booking_id)!.push(booking);
            }
        });
        setGroupedAdvanceBookings(grouped);
        console.log('📦 Grouped advance bookings:', Object.fromEntries(grouped));
    };

    // ===== fetchBookings function with proper data transformation =====
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            console.log('Fetching advance bookings...', new Date().toLocaleTimeString());

            const url = buildUrlWithHotelId(`${NODE_BACKEND_URL}/advance-bookings`);
            console.log('Fetching from URL:', url);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Raw API response:', data);

            const transformedData = (data.data || []).map((item: any) => ({
                id: item.id,
                invoice_number: item.invoice_number || `ADV-${item.id}`,
                customer_name: item.customer_name || 'Unknown',
                customer_phone: item.customer_phone || 'N/A',
                customer_email: item.customer_email || '',
                room_number: item.room_number || 'Not assigned',
                room_type: item.room_type || 'Standard',
                from_date: item.from_date,
                to_date: item.to_date,
                total: parseFloat(item.total || 0),
                advance_amount: parseFloat(item.advance_amount || 0),
                remaining_amount: parseFloat(item.remaining_amount || 0),
                payment_method: item.payment_method || 'cash',
                payment_status: item.payment_status || 'pending',
                status: item.status || 'pending',
                advance_expiry_date: item.advance_expiry_date,
                created_at: item.created_at || new Date().toISOString(),
                transaction_id: item.transaction_id,
                room_id: item.room_id,
                group_booking_id: item.group_booking_id || null // 👈 NEW
            }));

            console.log('Transformed bookings:', transformedData);
            setBookings(transformedData);
            groupBookings(transformedData); // 👈 NEW: Group the bookings

            const statsUrl = buildUrlWithHotelId(`${NODE_BACKEND_URL}/advance-bookings/stats`);
            const statsRes = await fetch(statsUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                console.log('Stats data:', statsData);
                setStats(statsData.data || {});
            }

        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast({
                title: "Error",
                description: "Failed to load advance bookings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle advance booking success
    const handleAdvanceBookingSuccess = async () => {
        console.log('Advance booking created, refreshing...');

        toast({
            title: "Processing",
            description: "Creating advance booking...",
        });

        setTimeout(async () => {
            try {
                await fetchBookings();
                setRefreshTrigger(prev => prev + 1);
                setShowForm(false);
                setShowMultiForm(false); // 👈 NEW

                toast({
                    title: "✅ Success",
                    description: "Advance booking created successfully",
                    variant: "default"
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to refresh bookings",
                    variant: "destructive"
                });
            }
        }, 500);
    };

    // fetchRooms function
    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('Fetching rooms...');

            const url = buildUrlWithHotelId(`${NODE_BACKEND_URL}/rooms`);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            let roomsData = [];
            if (data.success && Array.isArray(data.data)) {
                roomsData = data.data;
            } else if (Array.isArray(data)) {
                roomsData = data;
            } else if (data.data && Array.isArray(data.data)) {
                roomsData = data.data;
            } else {
                roomsData = [];
            }

            const transformedRooms = roomsData.map((room: any) => ({
                id: room.id || room.room_id,
                roomId: room.id?.toString() || room.room_id?.toString() || `room-${room.room_number}`,
                number: room.room_number || room.number || 'N/A',
                type: room.type || 'Standard',
                price: parseFloat(room.price) || 0,
                maxOccupancy: room.max_occupancy || room.maxOccupancy || 2,
                floor: room.floor || 1,
                status: room.status || 'available'
            }));

            console.log('Transformed rooms:', transformedRooms);
            setRooms(transformedRooms);

        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast({
                title: "Error",
                description: "Failed to load rooms. Please try again.",
                variant: "destructive"
            });
        }
    };

    // Use refreshTrigger in useEffect
    useEffect(() => {
        fetchBookings();
    }, [refreshTrigger]);

    // Initial fetch for rooms
    useEffect(() => {
        fetchRooms();
    }, []);

    // Event listener for conversions
    useEffect(() => {
        const handleAdvanceBookingConverted = (event: CustomEvent) => {
            console.log('Advance booking converted, refreshing list...', event.detail);
            setRefreshTrigger(prev => prev + 1);
            toast({
                title: "✅ Advance Booking Converted",
                description: `Booking has been converted to regular booking`,
                variant: "default"
            });
        };

        window.addEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);

        return () => {
            window.removeEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);
        };
    }, []);

    // handleConvertAndBook function
    // const handleConvertAndBook = (booking: AdvanceBooking) => {
    //     const bookingCopy = { ...booking };

    //     if (bookingCopy.from_date) {
    //         const [year, month, day] = bookingCopy.from_date.split('T')[0].split('-');
    //         bookingCopy.from_date = `${year}-${month}-${day}`;
    //     }

    //     if (bookingCopy.to_date) {
    //         const [year, month, day] = bookingCopy.to_date.split('T')[0].split('-');
    //         bookingCopy.to_date = `${year}-${month}-${day}`;
    //     }
    //     console.log('📋 Copied booking:', {
    //         from_date: bookingCopy.from_date,
    //         to_date: bookingCopy.to_date
    //     });

    //     setSelectedAdvanceForBooking(bookingCopy);
    //     setShowBookingForm(true);
    // };

    const handleConvertAndBook = (booking: AdvanceBooking) => {
        console.log('🔄 ===== CONVERT AND BOOK DEBUG =====');
        console.log('🔄 Original booking data:', JSON.stringify(booking, null, 2));
        console.log('🔄 Booking dates:', {
            from_date: booking.from_date,
            to_date: booking.to_date,
            from_date_type: typeof booking.from_date,
            to_date_type: typeof booking.to_date
        });

        const bookingCopy = { ...booking };

        // FIX: Handle timezone correctly
        if (bookingCopy.from_date) {
            // If it's an ISO string, parse it and extract the date in local timezone
            if (bookingCopy.from_date.includes('T')) {
                const date = new Date(bookingCopy.from_date);
                // Get local date components
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                bookingCopy.from_date = `${year}-${month}-${day}`;
                console.log('🔄 Converted from_date:', {
                    original: booking.from_date,
                    parsed: date.toString(),
                    localDate: `${year}-${month}-${day}`
                });
            }
        }

        if (bookingCopy.to_date) {
            if (bookingCopy.to_date.includes('T')) {
                const date = new Date(bookingCopy.to_date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                bookingCopy.to_date = `${year}-${month}-${day}`;
                console.log('🔄 Converted to_date:', {
                    original: booking.to_date,
                    parsed: date.toString(),
                    localDate: `${year}-${month}-${day}`
                });
            }
        }

        console.log('🔄 Processed booking copy:', {
            from_date: bookingCopy.from_date,
            to_date: bookingCopy.to_date
        });

        setSelectedAdvanceForBooking(bookingCopy);
        setShowBookingForm(true);
    };

    // 👇 NEW: View group details
    const viewGroupDetails = (groupId: string, rooms: AdvanceBooking[]) => {
        const totalAmount = rooms.reduce((sum, r) => sum + (r.total || 0), 0);
        const totalAdvance = rooms.reduce((sum, r) => sum + (r.advance_amount || 0), 0);
        const totalRemaining = rooms.reduce((sum, r) => sum + (r.remaining_amount || 0), 0);

        setSelectedGroupAdvance({
            groupId,
            rooms,
            totalAmount,
            totalAdvance,
            totalRemaining,
            customerName: rooms[0]?.customer_name || 'Unknown',
            customerPhone: rooms[0]?.customer_phone || 'N/A'
        });
        setShowGroupAdvanceModal(true);
    };

    // getStatusBadge function
    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; class: string }> = {
            pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            confirmed: { label: 'Confirmed', class: 'bg-green-100 text-green-800 border-green-200' },
            cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-800 border-red-200' },
            expired: { label: 'Expired', class: 'bg-gray-100 text-gray-800 border-gray-200' },
            converted: { label: 'Converted', class: 'bg-blue-100 text-blue-800 border-blue-200' }
        };
        const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
        return <Badge variant="outline" className={c.class}>{c.label}</Badge>;
    };

    // getPaymentBadge function
    const getPaymentBadge = (status: string) => {
        const config: Record<string, { label: string; class: string }> = {
            pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
            partial: { label: 'Partial', class: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Paid', class: 'bg-green-100 text-green-800' }
        };
        const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
        return <Badge className={c.class}>{c.label}</Badge>;
    };

    // handleViewInvoice function (unchanged)
    const handleViewInvoice = async (booking: AdvanceBooking) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings/${booking.id}/invoice`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (result.success) {
                const invoiceWindow = window.open('', '_blank');
                if (invoiceWindow) {
                    invoiceWindow.document.write(`
                    <html>
                        <head>
                            <title>Invoice - ${result.data.invoiceNumber}</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .invoice-container { max-width: 800px; margin: 0 auto; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .hotel-logo { max-width: 150px; max-height: 80px; }
                                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #f2f2f2; }
                                .total { font-weight: bold; font-size: 18px; }
                                .footer { margin-top: 30px; text-align: center; }
                            </style>
                        </head>
                        <body>
                            <div class="invoice-container">
                                <div class="header">
                                    ${result.data.hotel.logo ?
                            `<img src="${result.data.hotel.logo}" class="hotel-logo" alt="Hotel Logo">` : ''}
                                    <h2>${result.data.hotel.name}</h2>
                                    <p>${result.data.hotel.address}</p>
                                    <p>Phone: ${result.data.hotel.phone} | Email: ${result.data.hotel.email}</p>
                                    ${result.data.hotel.gstin ? `<p>GSTIN: ${result.data.hotel.gstin}</p>` : ''}
                                    <h3>Advance Booking Invoice</h3>
                                    <p>Invoice #: ${result.data.invoiceNumber}</p>
                                    <p>Date: ${result.data.invoiceDate}</p>
                                    ${result.data.expiryDate ? `<p>Valid Until: ${result.data.expiryDate}</p>` : ''}
                                </div>
                                
                                <div style="margin: 20px 0;">
                                    <h4>Customer Details:</h4>
                                    <p><strong>${result.data.customer.name}</strong><br>
                                    Phone: ${result.data.customer.phone}<br>
                                    ${result.data.customer.email ? `Email: ${result.data.customer.email}<br>` : ''}
                                    ${result.data.customer.address ? `Address: ${result.data.customer.address}` : ''}</p>
                                </div>
                                
                                <div style="margin: 20px 0;">
                                    <h4>Booking Details:</h4>
                                    <p><strong>Room:</strong> ${result.data.booking.roomNumber} (${result.data.booking.roomType})<br>
                                    <strong>Check-in:</strong> ${result.data.booking.fromDate} ${result.data.booking.fromTime}<br>
                                    <strong>Check-out:</strong> ${result.data.booking.toDate} ${result.data.booking.toTime}<br>
                                    <strong>Nights:</strong> ${result.data.booking.nights}<br>
                                    <strong>Guests:</strong> ${result.data.booking.guests}</p>
                                </div>
                                
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${result.data.charges.map(charge => `
                                            <tr>
                                                <td>${charge.description}</td>
                                                <td>₹${charge.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td><strong>Subtotal</strong></td>
                                            <td><strong>₹${result.data.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total</strong></td>
                                            <td><strong>₹${result.data.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                                        </tr>
                                        <tr style="background-color: #e8f4fd;">
                                            <td><strong>Advance Paid</strong></td>
                                            <td><strong>₹${result.data.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                                        </tr>
                                        ${result.data.remainingDue > 0 ? `
                                            <tr style="background-color: #fff3cd;">
                                                <td><strong>Remaining Due</strong></td>
                                                <td><strong>₹${result.data.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                                            </tr>
                                        ` : ''}
                                    </tfoot>
                                </table>
                                
                                <div style="margin: 20px 0;">
                                    <p><strong>Payment Method:</strong> ${result.data.payment.method}<br>
                                    <strong>Payment Status:</strong> ${result.data.payment.status}<br>
                                    ${result.data.payment.transactionId ? `<strong>Transaction ID:</strong> ${result.data.payment.transactionId}<br>` : ''}
                                    <strong>Booking Status:</strong> ${result.data.status}</p>
                                </div>
                                
                                ${result.data.notes ? `
                                    <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
                                        <p><strong>Notes:</strong> ${result.data.notes}</p>
                                    </div>
                                ` : ''}
                                
                                <div class="footer">
                                    <p>${result.data.footer.note}</p>
                                    <p><strong>${result.data.footer.terms}</strong></p>
                                    <p>${result.data.footer.companyName}</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `);
                    invoiceWindow.document.close();
                }
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to generate invoice",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Invoice generation error:', error);
            toast({
                title: "Error",
                description: "Failed to generate invoice",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // handleDownloadInvoice function (unchanged)
    const handleDownloadInvoice = async (booking: AdvanceBooking) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings/${booking.id}/invoice`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (result.success) {
                const invoiceData = result.data;

                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${invoiceData.invoiceNumber}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 30px; 
            color: #333;
            line-height: 1.4;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .hotel-logo {
            max-width: 150px;
            max-height: 80px;
            object-fit: contain;
        }
        .hotel-details {
            text-align: right;
        }
        .hotel-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .invoice-title {
            font-size: 20px;
            font-weight: bold;
            color: #3498db;
            margin: 20px 0;
            text-align: center;
        }
        .details-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .details-box {
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .details-label {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 16px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .total-row {
            font-weight: bold;
            background-color: #e8f4fd;
        }
        .total-row td {
            border-top: 2px solid #3498db;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px dashed #ddd;
            padding-top: 20px;
        }
        .payment-status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
        }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-partial { background-color: #cce5ff; color: #004085; }
        .status-completed { background-color: #d4edda; color: #155724; }
        .status-confirmed { background-color: #d1ecf1; color: #0c5460; }
        @media print {
            body { margin: 0; }
            .invoice-container { border: none; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header with Logo -->
        <div class="header">
            <div>
                ${invoiceData.hotel.logo ?
                        `<img src="${invoiceData.hotel.logo}" class="hotel-logo" alt="Hotel Logo">` :
                        `<h1 class="hotel-name">${invoiceData.hotel.name}</h1>`
                    }
            </div>
            <div class="hotel-details">
                <div class="hotel-name">${invoiceData.hotel.name}</div>
                <p>${invoiceData.hotel.address || ''}<br>
                Phone: ${invoiceData.hotel.phone || 'N/A'}<br>
                Email: ${invoiceData.hotel.email || 'N/A'}<br>
                ${invoiceData.hotel.gstin ? `GSTIN: ${invoiceData.hotel.gstin}` : ''}</p>
            </div>
        </div>

        <!-- Invoice Title -->
        <div class="invoice-title">
            ADVANCE BOOKING INVOICE
        </div>
        
        <!-- Invoice Number and Date -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</div>
            <div><strong>Date:</strong> ${invoiceData.invoiceDate}</div>
            <div><strong>Valid Until:</strong> ${invoiceData.expiryDate || 'N/A'}</div>
        </div>

        <!-- Customer and Booking Details -->
        <div class="details-section">
            <div class="details-box">
                <div class="details-label">Bill To:</div>
                <p><strong>${invoiceData.customer.name}</strong><br>
                Phone: ${invoiceData.customer.phone}<br>
                ${invoiceData.customer.email ? `Email: ${invoiceData.customer.email}<br>` : ''}
                ${invoiceData.customer.address ? `Address: ${invoiceData.customer.address}` : ''}</p>
            </div>
            
            <div class="details-box">
                <div class="details-label">Booking Details:</div>
                <p><strong>Room:</strong> ${invoiceData.booking.roomNumber} (${invoiceData.booking.roomType})<br>
                <strong>Check-in:</strong> ${invoiceData.booking.fromDate} ${invoiceData.booking.fromTime}<br>
                <strong>Check-out:</strong> ${invoiceData.booking.toDate} ${invoiceData.booking.toTime}<br>
                <strong>Nights:</strong> ${invoiceData.booking.nights}<br>
                <strong>Guests:</strong> ${invoiceData.booking.guests}</p>
            </div>
        </div>

        <!-- Charges Table -->
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.charges.map(charge => `
                    <tr>
                        <td>${charge.description}</td>
                        <td style="text-align: right;">₹${charge.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td style="text-align: right;"><strong>Subtotal:</strong></td>
                    <td style="text-align: right;">₹${invoiceData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align: right;"><strong>TOTAL:</strong></td>
                    <td style="text-align: right;">₹${invoiceData.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background-color: #e8f4fd;">
                    <td style="text-align: right;"><strong>Advance Paid:</strong></td>
                    <td style="text-align: right;">₹${invoiceData.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                ${invoiceData.remainingDue > 0 ? `
                    <tr style="background-color: #fff3cd;">
                        <td style="text-align: right;"><strong>Remaining Due:</strong></td>
                        <td style="text-align: right;">₹${invoiceData.remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                ` : ''}
            </tfoot>
        </table>

        <!-- Payment Details -->
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Payment Method:</strong> ${invoiceData.payment.method}<br>
                    <strong>Payment Status:</strong> 
                    <span class="payment-status status-${invoiceData.payment.status}">
                        ${invoiceData.payment.status}
                    </span><br>
                    ${invoiceData.payment.transactionId ? `<strong>Transaction ID:</strong> ${invoiceData.payment.transactionId}<br>` : ''}
                    <strong>Booking Status:</strong> 
                    <span class="payment-status status-${invoiceData.status}">
                        ${invoiceData.status}
                    </span>
                </div>
            </div>
        </div>

        <!-- Notes -->
        ${invoiceData.notes ? `
            <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
                <strong>Notes:</strong> ${invoiceData.notes}
            </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>${invoiceData.footer.note}</p>
            <p><strong>${invoiceData.footer.terms}</strong></p>
            <p>${invoiceData.footer.companyName}</p>
        </div>
    </div>
</body>
</html>
            `;

                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `invoice-${booking.invoice_number}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast({
                    title: "Success",
                    description: "Invoice downloaded successfully"
                });
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to download invoice",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Download error:', error);
            toast({
                title: "Error",
                description: "Failed to download invoice",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Advance Bookings</h1>
                        <p className="text-muted-foreground mt-1">
                            {loading ? 'Loading...' : `${filteredBookings.length} advance bookings found`}
                            {groupedAdvanceBookings.size > 0 && ` • ${groupedAdvanceBookings.size} groups`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => {
                            setRefreshTrigger(prev => prev + 1);
                        }} variant="outline" disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {/* 👇 NEW: Multi-Room Booking Button */}
                        <Button
                            onClick={() => setShowMultiForm(true)}
                            variant="default"
                            className="bg-purple-600 hover:bg-purple-700"
                            size="sm"
                        >
                            <Layers className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Multi-Room Advance</span>
                            <span className="sm:hidden">Multi</span>
                        </Button>
                        <Button
                            onClick={() => setShowForm(true)}
                            variant="default"
                            size="sm"
                        >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Single-Room Advance</span>
                            <span className="sm:hidden">Single</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Today's Total</p>
                                        <p className="text-2xl font-bold">{stats.total || 0}</p>
                                    </div>
                                    <CalendarDays className="h-8 w-8 text-blue-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Today's Advance Collected</p>
                                        <p className="text-2xl font-bold">₹{(stats.total_advance_collected || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <IndianRupee className="h-8 w-8 text-green-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 👇 NEW: Group Bookings Summary */}
                {groupedAdvanceBookings.size > 0 && (
                    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-purple-600 text-white px-3 py-1">
                                    <Layers className="h-3 w-3 mr-1" />
                                    Group Advance Bookings
                                </Badge>
                                <span className="text-sm text-purple-700">
                                    {Array.from(groupedAdvanceBookings.values()).reduce((sum, rooms) => sum + rooms.length, 0)} rooms in {groupedAdvanceBookings.size} groups
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Array.from(groupedAdvanceBookings.entries()).map(([groupId, rooms]) => {
                                    const totalAmount = rooms.reduce((sum, r) => sum + (r.total || 0), 0);
                                    const totalAdvance = rooms.reduce((sum, r) => sum + (r.advance_amount || 0), 0);
                                    const customerName = rooms[0]?.customer_name || 'Unknown';
                                    const roomNumbers = rooms.map(r => r.room_number).join(', ');

                                    return (
                                        <div
                                            key={groupId}
                                            className="bg-white rounded-lg border border-purple-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => viewGroupDetails(groupId, rooms)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                                    Group #{groupId.slice(-8)}
                                                </Badge>
                                                <span className="text-xs text-gray-500">{rooms.length} rooms</span>
                                            </div>

                                            <p className="text-sm font-medium truncate">{customerName}</p>
                                            <p className="text-xs text-gray-500 mb-2">Rooms: {roomNumbers}</p>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-xs text-green-600 block">Adv: ₹{totalAdvance.toLocaleString('en-IN')}</span>
                                                    <span className="text-xs text-orange-600">Due: ₹{(totalAmount - totalAdvance).toLocaleString('en-IN')}</span>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Search and Filter Section */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by customer name, phone, room, or invoice..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Calendar Filter */}
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            {/* Date Filter Type Selector */}
                            <div className="flex gap-2">
                                <Button
                                    variant={dateFilterType === 'created' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDateFilterType('created')}
                                >
                                    Created Date
                                </Button>
                                <Button
                                    variant={dateFilterType === 'booking' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDateFilterType('booking')}
                                >
                                    Booking Date
                                </Button>
                                <Button
                                    variant={dateFilterType === 'expiry' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDateFilterType('expiry')}
                                >
                                    Expiry Date
                                </Button>
                            </div>

                            {/* Date Range Picker */}
                            <div className="flex items-center gap-2 flex-1">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full md:w-[300px] justify-start text-left font-normal",
                                                !dateRange?.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                                        {format(dateRange.to, "dd/MM/yyyy")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "dd/MM/yyyy")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>

                                {/* Clear Filter Button */}
                                {(dateRange?.from || dateRange?.to) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearDateFilter}
                                        className="h-8 px-2"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Active Filter Indicator */}
                        {(dateRange?.from || dateRange?.to || searchTerm) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Active filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Search: "{searchTerm}"
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => setSearchTerm('')}
                                        />
                                    </Badge>
                                )}
                                {dateRange?.from && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        {dateFilterType === 'created' ? 'Created' :
                                            dateFilterType === 'booking' ? 'Booking' : 'Expiry'}:
                                        {format(dateRange.from, "dd/MM/yyyy")}
                                        {dateRange.to && ` - ${format(dateRange.to, "dd/MM/yyyy")}`}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={clearDateFilter}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bookings List */}
                <Tabs defaultValue="all" key={refreshTrigger}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 mt-4">
                        {loading ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-muted-foreground">Loading bookings...</span>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {filteredBookings.map((booking) => (
                                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                            {booking.invoice_number}
                                                        </span>
                                                        {getStatusBadge(booking.status)}
                                                        {getPaymentBadge(booking.payment_status)}
                                                        {/* 👇 NEW: Group badge */}
                                                        {booking.group_booking_id && (
                                                            <Badge
                                                                className="bg-purple-100 text-purple-800 border-purple-200 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const groupRooms = groupedAdvanceBookings.get(booking.group_booking_id!);
                                                                    if (groupRooms) {
                                                                        viewGroupDetails(booking.group_booking_id!, groupRooms);
                                                                    }
                                                                }}
                                                            >
                                                                <Layers className="h-3 w-3 mr-1" />
                                                                Group
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Customer:</span>
                                                            <div className="font-medium flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {booking.customer_name}
                                                            </div>
                                                            <div className="text-xs flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {booking.customer_phone}
                                                            </div>
                                                            {booking.customer_email && (
                                                                <div className="text-xs flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {booking.customer_email}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span className="text-muted-foreground">Room:</span>
                                                            <div className="font-medium">
                                                                {booking.room_number || 'Not assigned'}
                                                                {booking.room_type && <span className="text-xs ml-1">({booking.room_type})</span>}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {booking.from_date && format(new Date(booking.from_date), 'dd MMM')} - {booking.to_date && format(new Date(booking.to_date), 'dd MMM')}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span className="text-muted-foreground">Payment:</span>
                                                            <div className="font-medium">
                                                                <span className="text-green-600">Adv: ₹{booking.advance_amount}</span>
                                                                {booking.remaining_amount > 0 && (
                                                                    <span className="text-orange-600 ml-2">Due: ₹{booking.remaining_amount}</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Total: ₹{booking.total}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span className="text-muted-foreground">Expires:</span>
                                                            <div className="font-medium">
                                                                {booking.advance_expiry_date ? format(new Date(booking.advance_expiry_date), 'dd MMM yyyy') : 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Created: {format(new Date(booking.created_at), 'dd MMM yyyy')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleViewInvoice(booking)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(booking)}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Invoice
                                                    </Button>
                                                    {booking.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleConvertAndBook(booking)}
                                                        >
                                                            <ArrowRight className="h-4 w-4 mr-2" />
                                                            Convert & Book
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredBookings.length === 0 && (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold">No advance bookings found</h3>
                                            <p className="text-muted-foreground mb-4">
                                                {searchTerm || dateRange?.from ? 'Try adjusting your filters' : 'Create your first advance booking'}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button onClick={() => setShowMultiForm(true)} variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white">
                                                    <Layers className="h-4 w-4 mr-2" />
                                                    Multi-Room Advance
                                                </Button>
                                                <Button onClick={() => setShowForm(true)}>
                                                    New Advance Booking
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* 👇 NEW: Group Advance Details Modal */}
            {showGroupAdvanceModal && selectedGroupAdvance && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Group Advance Booking</h2>
                                <p className="text-sm text-muted-foreground">
                                    Group ID: {selectedGroupAdvance.groupId} • {selectedGroupAdvance.rooms.length} Rooms
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowGroupAdvanceModal(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Summary */}
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h3 className="font-semibold text-purple-800 mb-2">Customer Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-purple-600">Name</p>
                                        <p className="font-medium">{selectedGroupAdvance.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-600">Phone</p>
                                        <p className="font-medium">{selectedGroupAdvance.customerPhone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rooms Table */}
                            <div>
                                <h3 className="font-semibold mb-3">Room Details</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 text-left">Room</th>
                                                <th className="p-2 text-left">Dates</th>
                                                <th className="p-2 text-right">Amount</th>
                                                <th className="p-2 text-right">Advance</th>
                                                <th className="p-2 text-right">Due</th>
                                                <th className="p-2 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedGroupAdvance.rooms.map((room: any) => (
                                                <tr key={room.id} className="border-t">
                                                    <td className="p-2">
                                                        Room {room.room_number}
                                                        <div className="text-xs text-gray-500">{room.room_type}</div>
                                                    </td>
                                                    <td className="p-2">
                                                        {room.from_date && format(new Date(room.from_date), 'dd MMM')} - {room.to_date && format(new Date(room.to_date), 'dd MMM')}
                                                    </td>
                                                    <td className="p-2 text-right">₹{room.total.toLocaleString('en-IN')}</td>
                                                    <td className="p-2 text-right text-green-600">₹{room.advance_amount.toLocaleString('en-IN')}</td>
                                                    <td className="p-2 text-right text-orange-600">₹{room.remaining_amount.toLocaleString('en-IN')}</td>
                                                    <td className="p-2 text-center">
                                                        {getStatusBadge(room.status)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr className="border-t">
                                                <td colSpan={2} className="p-2 font-bold">Total</td>
                                                <td className="p-2 text-right font-bold">₹{selectedGroupAdvance.totalAmount.toLocaleString('en-IN')}</td>
                                                <td className="p-2 text-right font-bold text-green-600">₹{selectedGroupAdvance.totalAdvance.toLocaleString('en-IN')}</td>
                                                <td className="p-2 text-right font-bold text-orange-600">₹{selectedGroupAdvance.totalRemaining.toLocaleString('en-IN')}</td>
                                                <td className="p-2"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-4 flex justify-end">
                            <Button variant="outline" onClick={() => setShowGroupAdvanceModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Form for Conversion */}
            {showBookingForm && selectedAdvanceForBooking && (
                <BookingForm
                    roomId={selectedAdvanceForBooking.room_id?.toString() || ''}
                    room={rooms.find(r => r.id?.toString() === selectedAdvanceForBooking.room_id?.toString())}
                    spreadsheetId=""
                    userSource="database"
                    onClose={() => {
                        setShowBookingForm(false);
                        setSelectedAdvanceForBooking(null);
                    }}
                    onSuccess={() => {
                        setRefreshTrigger(prev => prev + 1);
                        setShowBookingForm(false);
                        setSelectedAdvanceForBooking(null);
                    }}
                    advanceBookingData={selectedAdvanceForBooking}
                    isAdvanceConversion={true}
                />
            )}

            {/* Single Advance Booking Form */}
            <AdvanceBookingForm
                open={showForm}
                onClose={() => setShowForm(false)}
                onSuccess={handleAdvanceBookingSuccess}
                rooms={rooms}
                userSource="database"
            />

            {/* 👇 NEW: Multi-Room Advance Booking Form */}
            <MultiAdvanceBookingForm
                open={showMultiForm}
                onClose={() => setShowMultiForm(false)}
                onSuccess={handleAdvanceBookingSuccess}
                rooms={rooms}
                userSource="database"
            />
        </Layout>
    );
};

export default AdvanceBookings;