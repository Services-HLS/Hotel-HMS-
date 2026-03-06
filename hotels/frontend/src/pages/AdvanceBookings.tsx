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
//     Loader2
// } from 'lucide-react';
// import { format } from 'date-fns';
// import BookingForm from '@/components/BookingForm';

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
// }

// const AdvanceBookings = () => {
//     const { toast } = useToast();
//     const [bookings, setBookings] = useState<AdvanceBooking[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [showForm, setShowForm] = useState(false);
//     const [rooms, setRooms] = useState<any[]>([]);
//     const [stats, setStats] = useState<any>({});
//     const [convertingId, setConvertingId] = useState<number | null>(null);
//     const [showBookingForm, setShowBookingForm] = useState(false);
//     const [selectedAdvanceForBooking, setSelectedAdvanceForBooking] = useState<any>(null);

//     const fetchBookings = async () => {
//         setLoading(true);
//         try {
//             const token = localStorage.getItem('authToken');
//             const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const data = await response.json();
//             setBookings(data.data || []);

//             // Fetch stats
//             const statsRes = await fetch(`${NODE_BACKEND_URL}/advance-bookings/stats`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             const statsData = await statsRes.json();
//             setStats(statsData.data || {});

//         } catch (error) {
//             toast({ title: "Error", description: "Failed to load advance bookings", variant: "destructive" });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // In AdvanceBookings.tsx - Update the fetchRooms function

//     const fetchRooms = async () => {
//         try {
//             const token = localStorage.getItem('authToken');
//             console.log('Fetching rooms from:', `${NODE_BACKEND_URL}/rooms`);

//             const response = await fetch(`${NODE_BACKEND_URL}/rooms`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();
//             console.log('Rooms API response:', data);

//             // Check the actual structure of your API response
//             // Your API might return data in different formats
//             let roomsData = [];

//             if (data.success && Array.isArray(data.data)) {
//                 // Format: { success: true, data: [...] }
//                 roomsData = data.data;
//             } else if (Array.isArray(data)) {
//                 // Format: direct array
//                 roomsData = data;
//             } else if (data.data && Array.isArray(data.data)) {
//                 // Format: { data: [...] }
//                 roomsData = data.data;
//             } else {
//                 console.warn('Unexpected API response format:', data);
//                 roomsData = [];
//             }

//             // Transform room data to ensure consistent format
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


//     // Add this function before the return statement
//     const handleConvertAndBook = (booking: AdvanceBooking) => {
//         setSelectedAdvanceForBooking(booking);
//         setShowBookingForm(true);
//     };


//     // Also add this useEffect to fetch rooms when component mounts
//     useEffect(() => {
//         fetchRooms();
//     }, []);

//     useEffect(() => {
//         fetchBookings();
//         fetchRooms();
//     }, []);

//     const filteredBookings = bookings.filter(booking =>
//         booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         booking.customer_phone?.includes(searchTerm) ||
//         booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         booking.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

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

//     const getPaymentBadge = (status: string) => {
//         const config: Record<string, { label: string; class: string }> = {
//             pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
//             partial: { label: 'Partial', class: 'bg-blue-100 text-blue-800' },
//             completed: { label: 'Paid', class: 'bg-green-100 text-green-800' }
//         };
//         const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
//         return <Badge className={c.class}>{c.label}</Badge>;
//     };

//     const handleViewInvoice = async (booking: AdvanceBooking) => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('authToken');
//             const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings/${booking.id}/invoice`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             const result = await response.json();

//             if (result.success) {
//                 // Open invoice in a new window or modal
//                 // Option 1: Open in new window with formatted JSON
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

//                 // Create HTML invoice with proper styling
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

//                 // Create download link for HTML file
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

//     // Add this useEffect to listen for advance booking conversion events
//     useEffect(() => {
//         const handleAdvanceBookingConverted = (event: CustomEvent) => {
//             console.log('Advance booking converted, refreshing list...', event.detail);
//             fetchBookings(); // Refresh the advance bookings list
//             // Also show a success toast
//             toast({
//                 title: "✅ Advance Booking Converted",
//                 description: `Booking has been converted to regular booking`,
//                 variant: "default"
//             });
//         };

//         // Add event listener
//         window.addEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);

//         // Cleanup
//         return () => {
//             window.removeEventListener('advance-booking-converted', handleAdvanceBookingConverted as EventListener);
//         };
//     }, []); // Empty dependency array means this runs once on mount

//     return (
//         <Layout>
//             <div className="space-y-6">
//                 {/* Header */}
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                     <div>
//                         <h1 className="text-2xl md:text-3xl font-bold">Advance Bookings</h1>
//                         <p className="text-muted-foreground mt-1">
//                             {loading ? 'Loading...' : `${bookings.length} advance bookings`}
//                         </p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button onClick={fetchBookings} variant="outline" disabled={loading}>
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
//                                         <p className="text-sm text-muted-foreground">Total</p>
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
//                                         <p className="text-sm text-muted-foreground">Advance Collected</p>
//                                         <p className="text-2xl font-bold">₹{(stats.total_advance_collected || 0).toLocaleString('en-IN')}</p>
//                                     </div>
//                                     <IndianRupee className="h-8 w-8 text-green-500 opacity-50" />
//                                 </div>
//                             </CardContent>
//                         </Card>

//                     </div>
//                 )}

//                 {/* Search */}
//                 <Card>
//                     <CardContent className="p-4">
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//                             <Input
//                                 placeholder="Search by customer name, phone, room, or invoice..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="pl-10"
//                             />
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Bookings List */}
//                 <Tabs defaultValue="all">
//                     <TabsList>
//                         <TabsTrigger value="all">All</TabsTrigger>
//                         {/* <TabsTrigger value="pending">Pending</TabsTrigger>
//                         <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
//                         <TabsTrigger value="partial">Partial Payment</TabsTrigger> */}
//                     </TabsList>

//                     <TabsContent value="all" className="space-y-4 mt-4">
//                         {filteredBookings.map((booking) => (
//                             <Card key={booking.id} className="hover:shadow-md transition-shadow">
//                                 <CardContent className="p-4">
//                                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                                         <div className="space-y-2 flex-1">
//                                             <div className="flex items-center gap-3">
//                                                 <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
//                                                     {booking.invoice_number}
//                                                 </span>
//                                                 {getStatusBadge(booking.status)}
//                                                 {getPaymentBadge(booking.payment_status)}
//                                             </div>

//                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                                                 <div>
//                                                     <span className="text-muted-foreground">Customer:</span>
//                                                     <div className="font-medium flex items-center gap-1">
//                                                         <User className="h-3 w-3" />
//                                                         {booking.customer_name}
//                                                     </div>
//                                                     <div className="text-xs flex items-center gap-1">
//                                                         <Phone className="h-3 w-3" />
//                                                         {booking.customer_phone}
//                                                     </div>
//                                                     {booking.customer_email && (
//                                                         <div className="text-xs flex items-center gap-1">
//                                                             <Mail className="h-3 w-3" />
//                                                             {booking.customer_email}
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 <div>
//                                                     <span className="text-muted-foreground">Room:</span>
//                                                     <div className="font-medium">
//                                                         {booking.room_number || 'Not assigned'}
//                                                         {booking.room_type && <span className="text-xs ml-1">({booking.room_type})</span>}
//                                                     </div>
//                                                     <div className="text-xs text-muted-foreground">
//                                                         {booking.from_date && format(new Date(booking.from_date), 'dd MMM')} - {booking.to_date && format(new Date(booking.to_date), 'dd MMM')}
//                                                     </div>
//                                                 </div>

//                                                 <div>
//                                                     <span className="text-muted-foreground">Payment:</span>
//                                                     <div className="font-medium">
//                                                         <span className="text-green-600">Adv: ₹{booking.advance_amount}</span>
//                                                         {booking.remaining_amount > 0 && (
//                                                             <span className="text-orange-600 ml-2">Due: ₹{booking.remaining_amount}</span>
//                                                         )}
//                                                     </div>
//                                                     <div className="text-xs text-muted-foreground">
//                                                         Total: ₹{booking.total}
//                                                     </div>
//                                                 </div>

//                                                 <div>
//                                                     <span className="text-muted-foreground">Expires:</span>
//                                                     <div className="font-medium">
//                                                         {booking.advance_expiry_date ? format(new Date(booking.advance_expiry_date), 'dd MMM yyyy') : 'N/A'}
//                                                     </div>
//                                                     <div className="text-xs text-muted-foreground">
//                                                         Created: {format(new Date(booking.created_at), 'dd MMM yyyy')}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="flex gap-2">
//                                             <Button size="sm" variant="outline" onClick={() => handleViewInvoice(booking)}>
//                                                 <Eye className="h-4 w-4 mr-2" />
//                                                 View
//                                             </Button>
//                                             <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(booking)}>
//                                                 <Download className="h-4 w-4 mr-2" />
//                                                 Invoice
//                                             </Button>
//                                             {booking.status === 'pending' && (
//                                                 <Button
//                                                     size="sm"
//                                                     className="bg-green-600 hover:bg-green-700"
//                                                     onClick={() => handleConvertAndBook(booking)}
//                                                 >
//                                                     <ArrowRight className="h-4 w-4 mr-2" />
//                                                     Convert & Book
//                                                 </Button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         ))}

//                         {filteredBookings.length === 0 && !loading && (
//                             <Card>
//                                 <CardContent className="flex flex-col items-center justify-center py-12">
//                                     <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
//                                     <h3 className="text-lg font-semibold">No advance bookings found</h3>
//                                     <p className="text-muted-foreground mb-4">
//                                         {searchTerm ? 'Try a different search term' : 'Create your first advance booking'}
//                                     </p>
//                                     <Button onClick={() => setShowForm(true)}>
//                                         New Advance Booking
//                                     </Button>
//                                 </CardContent>
//                             </Card>
//                         )}
//                     </TabsContent>
//                 </Tabs>

//             </div>


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
//                         fetchBookings(); // THIS LINE IS IMPORTANT - It refreshes the advance bookings
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
//                 onSuccess={() => {
//                     fetchBookings();
//                     setShowForm(false);
//                 }}
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
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import BookingForm from '@/components/BookingForm';

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
    room_id?: number; // Add this if it exists in your data
}

const AdvanceBookings = () => {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<AdvanceBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [convertingId, setConvertingId] = useState<number | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedAdvanceForBooking, setSelectedAdvanceForBooking] = useState<any>(null);
    
    // ===== ADD THIS: Refresh trigger state =====
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===== UPDATE THIS: fetchBookings function with better error handling =====
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            console.log('Fetching advance bookings...', new Date().toLocaleTimeString());
            
            const response = await fetch(`${NODE_BACKEND_URL}/advance-bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched bookings count:', data.data?.length || 0);
            setBookings(data.data || []);

            // Fetch stats
            const statsRes = await fetch(`${NODE_BACKEND_URL}/advance-bookings/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            setStats(statsData.data || {});

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

    // ===== ADD THIS: New handler for advance booking success =====
    const handleAdvanceBookingSuccess = async () => {
        console.log('Advance booking created, refreshing with delay...');
        
        // Show a loading toast
        toast({
            title: "Processing",
            description: "Creating advance booking...",
        });
        
        // Add a small delay to ensure backend has processed the booking
        setTimeout(async () => {
            try {
                await fetchBookings();
                // Increment refresh trigger to force re-render
                setRefreshTrigger(prev => prev + 1);
                setShowForm(false);
                
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
        }, 500); // Half second delay
    };

    // ===== UPDATE THIS: fetchRooms function (keep as is) =====
    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('Fetching rooms from:', `${NODE_BACKEND_URL}/rooms`);

            const response = await fetch(`${NODE_BACKEND_URL}/rooms`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Rooms API response:', data);

            let roomsData = [];

            if (data.success && Array.isArray(data.data)) {
                roomsData = data.data;
            } else if (Array.isArray(data)) {
                roomsData = data;
            } else if (data.data && Array.isArray(data.data)) {
                roomsData = data.data;
            } else {
                console.warn('Unexpected API response format:', data);
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

    // ===== UPDATE THIS: Use refreshTrigger in useEffect =====
    useEffect(() => {
        fetchBookings();
    }, [refreshTrigger]); // This will run whenever refreshTrigger changes

    // ===== KEEP THIS: Initial fetch for rooms =====
    useEffect(() => {
        fetchRooms();
    }, []);

    // ===== UPDATE THIS: Event listener for conversions =====
    useEffect(() => {
        const handleAdvanceBookingConverted = (event: CustomEvent) => {
            console.log('Advance booking converted, refreshing list...', event.detail);
            // Increment refresh trigger to force re-fetch
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
    }, []); // Empty dependency array

    // ===== KEEP THIS: handleConvertAndBook function =====
    const handleConvertAndBook = (booking: AdvanceBooking) => {
        setSelectedAdvanceForBooking(booking);
        setShowBookingForm(true);
    };

    // ===== KEEP THIS: filteredBookings =====
    const filteredBookings = bookings.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone?.includes(searchTerm) ||
        booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ===== KEEP THIS: getStatusBadge function =====
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

    // ===== KEEP THIS: getPaymentBadge function =====
    const getPaymentBadge = (status: string) => {
        const config: Record<string, { label: string; class: string }> = {
            pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
            partial: { label: 'Partial', class: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Paid', class: 'bg-green-100 text-green-800' }
        };
        const c = config[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
        return <Badge className={c.class}>{c.label}</Badge>;
    };

    // ===== KEEP THIS: handleViewInvoice function =====
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

    // ===== KEEP THIS: handleDownloadInvoice function =====
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
                            {loading ? 'Loading...' : `${bookings.length} advance bookings`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => {
                            setRefreshTrigger(prev => prev + 1); // Manual refresh
                        }} variant="outline" disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button onClick={() => setShowForm(true)}>
                            <CalendarDays className="h-4 w-4 mr-2" />
                            New Advance Booking
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
                                        <p className="text-sm text-muted-foreground">Total</p>
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
                                        <p className="text-sm text-muted-foreground">Advance Collected</p>
                                        <p className="text-2xl font-bold">₹{(stats.total_advance_collected || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <IndianRupee className="h-8 w-8 text-green-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by customer name, phone, room, or invoice..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings List - Add key prop to force re-render when refreshTrigger changes */}
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
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                            {booking.invoice_number}
                                                        </span>
                                                        {getStatusBadge(booking.status)}
                                                        {getPaymentBadge(booking.payment_status)}
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
                                                {searchTerm ? 'Try a different search term' : 'Create your first advance booking'}
                                            </p>
                                            <Button onClick={() => setShowForm(true)}>
                                                New Advance Booking
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

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
                        setRefreshTrigger(prev => prev + 1); // Use refresh trigger instead of direct fetch
                        setShowBookingForm(false);
                        setSelectedAdvanceForBooking(null);
                    }}
                    advanceBookingData={selectedAdvanceForBooking}
                    isAdvanceConversion={true}
                />
            )}

            {/* Advance Booking Form - UPDATED with new onSuccess handler */}
            <AdvanceBookingForm
                open={showForm}
                onClose={() => setShowForm(false)}
                onSuccess={handleAdvanceBookingSuccess} // ← THIS IS THE IMPORTANT CHANGE
                rooms={rooms}
                userSource="database"
            />
        </Layout>
    );
};

export default AdvanceBookings;