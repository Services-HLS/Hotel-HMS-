
// // import { useState } from 'react';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Textarea } from '@/components/ui/textarea';
// // import { useToast } from '@/hooks/use-toast';
// // import {
// //   Calendar,
// //   User,
// //   Phone,
// //   Bed,
// //   CalendarIcon,
// //   Clock,
// //   Users,
// //   Loader2,
// //   X,
// //   Save,
// //   Mail,
// //   MapPin,
// //   Building,
// //   FileText,
// //   Percent,
// //   CreditCard,
// //   CheckCircle
// // } from 'lucide-react';

// // interface PreviousBookingFormProps {
// //   open: boolean;
// //   onClose: () => void;
// //   onSuccess: () => void;
// //   hotelId?: string;
// // }

// // const PreviousBookingForm = ({
// //   open,
// //   onClose,
// //   onSuccess,
// //   hotelId
// // }: PreviousBookingFormProps) => {
// //   const { toast } = useToast();
// //   const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
// //   const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [taxType, setTaxType] = useState<'cgst_sgst' | 'igst'>('cgst_sgst');
// //   const [gstPercentage, setGstPercentage] = useState(12); // Default 12% GST
// //   const [servicePercentage, setServicePercentage] = useState(10); // Default 10% service charge

// //   const [formData, setFormData] = useState({
// //     // Customer Information
// //     customerName: '',
// //     customerPhone: '',
// //     customerEmail: '',
// //     idNumber: '',
// //     idType: 'aadhaar' as 'pan' | 'aadhaar' | 'passport' | 'driving',

// //     // Address Fields
// //     address: '',
// //     city: '',
// //     state: '',
// //     pincode: '',
// //     customerGstNo: '',

// //     // Room Information
// //     roomNumber: '',
// //     guests: 1,

// //     // Date Information
// //     checkInDate: '',
// //     checkInTime: '14:00',
// //     checkOutDate: '',
// //     checkOutTime: '12:00',

// //     // Payment Information
// //     amount: 0,
// //     service: 0,
// //     gst: 0,
// //     cgst: 0,
// //     sgst: 0,
// //     igst: 0,
// //     total: 0,
// //     paymentMethod: 'cash',
// //     paymentStatus: 'completed',

// //     // Additional Fields
// //     purposeOfVisit: '',
// //     otherExpenses: 0,
// //     expenseDescription: '',
// //     referralBy: '',
// //     referralAmount: 0
// //   });

// //   const handleChange = (field: string, value: any) => {
// //     setFormData(prev => ({
// //       ...prev,
// //       [field]: value
// //     }));
// //   };

// //   const handleAmountChange = (field: string, value: string | number) => {
// //     // Convert to number
// //     const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

// //     setFormData(prev => {
// //       const updated = { ...prev, [field]: numValue };

// //       // Calculate all values
// //       const amount = field === 'amount' ? numValue : updated.amount;
// //       const service = field === 'service' ? numValue : updated.service;
// //       const gst = field === 'gst' ? numValue : updated.gst;
// //       const otherExpenses = field === 'otherExpenses' ? numValue : updated.otherExpenses;

// //       // Calculate split taxes based on tax type
// //       let cgst = 0, sgst = 0, igst = 0;

// //       if (taxType === 'cgst_sgst') {
// //         // Split GST equally between CGST and SGST
// //         cgst = Math.round((gst * 0.5) * 100) / 100;
// //         sgst = Math.round((gst * 0.5) * 100) / 100;
// //         igst = 0;
// //       } else {
// //         // All GST goes to IGST
// //         cgst = 0;
// //         sgst = 0;
// //         igst = Math.round(gst * 100) / 100;
// //       }

// //       // Calculate total
// //       const total = Math.round((amount + service + cgst + sgst + igst + otherExpenses) * 100) / 100;

// //       return {
// //         ...updated,
// //         cgst,
// //         sgst,
// //         igst,
// //         total
// //       };
// //     });
// //   };

// //   const validateForm = () => {
// //     // Basic validations
// //     if (!formData.customerName.trim()) {
// //       toast({ title: 'Name required', variant: 'destructive' });
// //       return false;
// //     }
// //     if (!formData.customerPhone.trim() || formData.customerPhone.length < 10) {
// //       toast({ title: 'Valid phone number required (10 digits)', variant: 'destructive' });
// //       return false;
// //     }
// //     if (!formData.roomNumber.trim()) {
// //       toast({ title: 'Room number required', variant: 'destructive' });
// //       return false;
// //     }
// //     if (!formData.checkInDate || !formData.checkOutDate) {
// //       toast({ title: 'Check-in and check-out dates required', variant: 'destructive' });
// //       return false;
// //     }

// //     const checkIn = new Date(formData.checkInDate);
// //     const checkOut = new Date(formData.checkOutDate);

// //     if (checkOut <= checkIn) {
// //       toast({
// //         title: 'Invalid Dates',
// //         description: 'Check-out date must be after check-in date',
// //         variant: 'destructive'
// //       });
// //       return false;
// //     }

// //     if (formData.total <= 0) {
// //       toast({
// //         title: 'Invalid Amount',
// //         description: 'Total amount must be greater than 0',
// //         variant: 'destructive'
// //       });
// //       return false;
// //     }

// //     // GST Number validation (if provided)
// //     if (formData.customerGstNo && formData.customerGstNo.trim() !== '') {
// //       const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
// //       if (!gstRegex.test(formData.customerGstNo.trim())) {
// //         toast({
// //           title: 'Invalid GST Number',
// //           description: 'Please enter a valid 15-character GSTIN',
// //           variant: 'destructive'
// //         });
// //         return false;
// //       }
// //     }

// //     return true;
// //   };

// //   const handleSubmit = async () => {
// //     if (!validateForm()) return;

// //     setIsSubmitting(true);

// //     try {
// //       const token = localStorage.getItem('authToken');

// //       // First, get room_id from room number
// //       const roomsResponse = await fetch(`${NODE_BACKEND_URL}/rooms`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`
// //         }
// //       });

// //       const roomsData = await roomsResponse.json();
// //       const room = roomsData.data?.find((r: any) =>
// //         r.room_number?.toString() === formData.roomNumber.toString()
// //       );

// //       if (!room) {
// //         toast({
// //           title: 'Room Not Found',
// //           description: `Room ${formData.roomNumber} does not exist`,
// //           variant: 'destructive'
// //         });
// //         setIsSubmitting(false);
// //         return;
// //       }

// //       // Calculate nights for reference
// //       const nights = (() => {
// //         const checkIn = new Date(formData.checkInDate);
// //         const checkOut = new Date(formData.checkOutDate);
// //         const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
// //         return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// //       })();

// //       // Create booking with all fields including split taxes
// //       const bookingData = {
// //         room_id: room.id,
// //         customer_name: formData.customerName,
// //         customer_phone: formData.customerPhone,
// //         customer_email: formData.customerEmail || null,
// //         from_date: formData.checkInDate,
// //         to_date: formData.checkOutDate,
// //         from_time: formData.checkInTime,
// //         to_time: formData.checkOutTime,

// //         // Amount fields
// //         amount: formData.amount,
// //         service: formData.service,

// //         // Split tax fields - CRITICAL FOR DISPLAY
// //         gst: formData.gst, // Keep for backward compatibility
// //         cgst: formData.cgst,
// //         sgst: formData.sgst,
// //         igst: formData.igst,

// //         // Total
// //         total: formData.total,

// //         // Status and booking details
// //         status: 'booked',
// //         guests: formData.guests,
// //         payment_method: formData.paymentMethod,
// //         payment_status: formData.paymentStatus,

// //         // Customer ID details
// //         id_type: formData.idType,
// //         id_number: formData.idNumber,

// //         // Address fields
// //         address: formData.address || null,
// //         city: formData.city || null,
// //         state: formData.state || null,
// //         pincode: formData.pincode || null,
// //         customer_gst_no: formData.customerGstNo || null,

// //         // Additional fields
// //         purpose_of_visit: formData.purposeOfVisit || null,
// //         other_expenses: formData.otherExpenses || 0,
// //         expense_description: formData.expenseDescription || null,
// //         referral_by: formData.referralBy || null,
// //         referral_amount: formData.referralAmount || 0,

// //         // Tax metadata (optional but helpful)
// //         tax_type: taxType,
// //         gst_percentage: gstPercentage,
// //         service_charge_percentage: servicePercentage,
// //         nights: nights
// //       };

// //       console.log('📤 Submitting previous booking with split taxes:', bookingData);

// //       const response = await fetch(`${NODE_BACKEND_URL}/bookings/past-booking`, {
// //         method: 'POST',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify(bookingData)
// //       });

// //       const result = await response.json();

// //       if (result.success) {
// //         toast({
// //           title: '✅ Previous Booking Added',
// //           description: `Booking for ${formData.customerName} has been recorded with tax details`,
// //           variant: 'default'
// //         });

// //         // Reset form to initial state
// //         setFormData({
// //           customerName: '',
// //           customerPhone: '',
// //           customerEmail: '',
// //           idNumber: '',
// //           idType: 'aadhaar',
// //           address: '',
// //           city: '',
// //           state: '',
// //           pincode: '',
// //           customerGstNo: '',
// //           roomNumber: '',
// //           guests: 1,
// //           checkInDate: '',
// //           checkInTime: '14:00',
// //           checkOutDate: '',
// //           checkOutTime: '12:00',
// //           amount: 0,
// //           service: 0,
// //           gst: 0,
// //           cgst: 0,
// //           sgst: 0,
// //           igst: 0,
// //           total: 0,
// //           paymentMethod: 'cash',
// //           paymentStatus: 'completed',
// //           purposeOfVisit: '',
// //           otherExpenses: 0,
// //           expenseDescription: '',
// //           referralBy: '',
// //           referralAmount: 0
// //         });

// //         onSuccess();
// //         onClose();
// //       } else {
// //         throw new Error(result.message || 'Failed to create booking');
// //       }
// //     } catch (error: any) {
// //       console.error('Error creating previous booking:', error);
// //       toast({
// //         title: 'Error',
// //         description: error.message || 'Failed to create booking',
// //         variant: 'destructive'
// //       });
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onClose}>
// //       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
// //         <DialogHeader>
// //           <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
// //             <div className="flex items-center gap-2">
// //               <CalendarIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
// //               <span>Add Previous Booking</span>
// //             </div>
// //             <span className="text-sm font-normal text-amber-600 sm:ml-2 sm:border-l sm:border-amber-200 sm:pl-2">
// //               (For past dates - Includes tax details)
// //             </span>
// //           </DialogTitle>
// //         </DialogHeader>

// //         <div className="space-y-6">
// //           {/* Customer Information */}
// //           <div className="border rounded-lg p-6">
// //             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
// //               <User className="h-5 w-5" />
// //               Customer Information
// //             </h3>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="customerName" className="flex items-center gap-1">
// //                   <User className="h-4 w-4" />
// //                   Full Name *
// //                 </Label>
// //                 <Input
// //                   id="customerName"
// //                   value={formData.customerName}
// //                   onChange={e => handleChange('customerName', e.target.value)}
// //                   placeholder="Enter full name"
// //                   required
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="customerPhone" className="flex items-center gap-1">
// //                   <Phone className="h-4 w-4" />
// //                   Phone Number *
// //                 </Label>
// //                 <Input
// //                   id="customerPhone"
// //                   value={formData.customerPhone}
// //                   onChange={e => handleChange('customerPhone', e.target.value)}
// //                   placeholder="10-digit mobile number"
// //                   type="tel"
// //                   maxLength={10}
// //                   required
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="customerEmail" className="flex items-center gap-1">
// //                   <Mail className="h-4 w-4" />
// //                   Email Address
// //                 </Label>
// //                 <Input
// //                   id="customerEmail"
// //                   value={formData.customerEmail}
// //                   onChange={e => handleChange('customerEmail', e.target.value)}
// //                   placeholder="email@example.com"
// //                   type="email"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="idType">ID Type</Label>
// //                 <select
// //                   id="idType"
// //                   value={formData.idType}
// //                   onChange={e => handleChange('idType', e.target.value as any)}
// //                   className="w-full h-10 px-3 text-sm border rounded-md bg-background"
// //                 >
// //                   <option value="aadhaar">Aadhaar Card</option>
// //                   <option value="pan">PAN Card</option>
// //                   <option value="passport">Passport</option>
// //                   <option value="driving">Driving License</option>
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="idNumber">ID Number</Label>
// //                 <Input
// //                   id="idNumber"
// //                   value={formData.idNumber}
// //                   onChange={e => handleChange('idNumber', e.target.value)}
// //                   placeholder="ID number"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="customerGstNo" className="flex items-center gap-1">
// //                   <FileText className="h-4 w-4" />
// //                   Customer GST No
// //                 </Label>
// //                 <Input
// //                   id="customerGstNo"
// //                   value={formData.customerGstNo}
// //                   onChange={e => handleChange('customerGstNo', e.target.value)}
// //                   placeholder="GSTIN (e.g., 27AAACH1234M1Z5)"
// //                   maxLength={15}
// //                 />
// //               </div>
// //             </div>
// //           </div>

// //           {/* Address Information */}
// //           <div className="border rounded-lg p-6 border-blue-100 bg-blue-50/30">
// //             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
// //               <MapPin className="h-5 w-5 text-blue-600" />
// //               Address Information
// //             </h3>

// //             <div className="space-y-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="address">Full Address</Label>
// //                 <Textarea
// //                   id="address"
// //                   value={formData.address}
// //                   onChange={e => handleChange('address', e.target.value)}
// //                   placeholder="Enter full address"
// //                   className="min-h-[80px]"
// //                 />
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="city">City</Label>
// //                   <Input
// //                     id="city"
// //                     value={formData.city}
// //                     onChange={e => handleChange('city', e.target.value)}
// //                     placeholder="City"
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="state">State</Label>
// //                   <Input
// //                     id="state"
// //                     value={formData.state}
// //                     onChange={e => handleChange('state', e.target.value)}
// //                     placeholder="State"
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="pincode">Pincode</Label>
// //                   <Input
// //                     id="pincode"
// //                     value={formData.pincode}
// //                     onChange={e => handleChange('pincode', e.target.value)}
// //                     placeholder="6-digit pincode"
// //                     maxLength={6}
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Room Information */}
// //           <div className="border rounded-lg p-6">
// //             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
// //               <Bed className="h-5 w-5" />
// //               Room Information
// //             </h3>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="roomNumber" className="flex items-center gap-1">
// //                   <Building className="h-4 w-4" />
// //                   Room Number *
// //                 </Label>
// //                 <Input
// //                   id="roomNumber"
// //                   value={formData.roomNumber}
// //                   onChange={e => handleChange('roomNumber', e.target.value)}
// //                   placeholder="e.g., 101, 202"
// //                   required
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="guests" className="flex items-center gap-1">
// //                   <Users className="h-4 w-4" />
// //                   Number of Guests
// //                 </Label>
// //                 <Input
// //                   id="guests"
// //                   type="number"
// //                   min="1"
// //                   max="10"
// //                   value={formData.guests}
// //                   onChange={e => handleChange('guests', parseInt(e.target.value) || 1)}
// //                 />
// //               </div>
// //             </div>
// //           </div>

// //           {/* Date Information - PAST DATES ALLOWED */}
// //           <div className="border rounded-lg p-6 border-amber-200 bg-amber-50/30">
// //             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
// //               <Calendar className="h-5 w-5 text-amber-600" />
// //               Booking Dates (Past Dates Allowed)
// //             </h3>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="checkInDate" className="flex items-center gap-1">
// //                   <Calendar className="h-4 w-4" />
// //                   Check-in Date *
// //                 </Label>
// //                 <Input
// //                   type="date"
// //                   id="checkInDate"
// //                   value={formData.checkInDate}
// //                   onChange={e => handleChange('checkInDate', e.target.value)}
// //                   required
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="checkInTime" className="flex items-center gap-1">
// //                   <Clock className="h-4 w-4" />
// //                   Check-in Time
// //                 </Label>
// //                 <Input
// //                   type="time"
// //                   id="checkInTime"
// //                   value={formData.checkInTime}
// //                   onChange={e => handleChange('checkInTime', e.target.value)}
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="checkOutDate" className="flex items-center gap-1">
// //                   <Calendar className="h-4 w-4" />
// //                   Check-out Date *
// //                 </Label>
// //                 <Input
// //                   type="date"
// //                   id="checkOutDate"
// //                   value={formData.checkOutDate}
// //                   min={formData.checkInDate}
// //                   onChange={e => handleChange('checkOutDate', e.target.value)}
// //                   required
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="checkOutTime" className="flex items-center gap-1">
// //                   <Clock className="h-4 w-4" />
// //                   Check-out Time
// //                 </Label>
// //                 <Input
// //                   type="time"
// //                   id="checkOutTime"
// //                   value={formData.checkOutTime}
// //                   onChange={e => handleChange('checkOutTime', e.target.value)}
// //                 />
// //               </div>
// //             </div>
// //           </div>

// //           {/* TAX CONFIGURATION SECTION - NEW */}
// //           {/* <div className="border rounded-lg p-6 border-purple-200 bg-purple-50/30">
// //             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
// //               <Percent className="h-5 w-5 text-purple-600" />
// //               Tax Configuration
// //             </h3>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
// //               <div className="space-y-2">
// //                 <Label>Tax Type</Label>
// //                 <div className="flex gap-2">
// //                   <Button
// //                     type="button"
// //                     variant={taxType === 'cgst_sgst' ? "default" : "outline"}
// //                     onClick={() => setTaxType('cgst_sgst')}
// //                     className="flex-1"
// //                   >
// //                     CGST + SGST (Local)
// //                   </Button>
// //                   <Button
// //                     type="button"
// //                     variant={taxType === 'igst' ? "default" : "outline"}
// //                     onClick={() => setTaxType('igst')}
// //                     className="flex-1"
// //                   >
// //                     IGST (Interstate)
// //                   </Button>
// //                 </div>
// //               </div>

// //               <div className="space-y-2">
// //                 <Label>Default GST %</Label>
// //                 <Input
// //                   type="number"
// //                   value={gstPercentage}
// //                   onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
// //                   min="0"
// //                   max="100"
// //                   step="0.01"
// //                 />
// //               </div>
// //             </div>

// //             <p className="text-xs text-purple-600">
// //               {taxType === 'cgst_sgst' 
// //                 ? 'GST will be split equally between CGST and SGST' 
// //                 : 'Full GST will be applied as IGST'}
// //             </p>
// //           </div> */}

// //           {/* Additional Details */}
// //           <div className="border rounded-lg p-6 border-green-100 bg-green-50/30">
// //             <h3 className="font-semibold text-lg mb-4 text-green-800">
// //               Additional Details
// //             </h3>

// //             <div className="space-y-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
// //                 <Textarea
// //                   id="purposeOfVisit"
// //                   value={formData.purposeOfVisit}
// //                   onChange={e => handleChange('purposeOfVisit', e.target.value)}
// //                   placeholder="Enter purpose of visit"
// //                   className="min-h-[80px]"
// //                   rows={2}
// //                 />
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="otherExpenses">Other Expenses (₹)</Label>
// //                   <Input
// //                     id="otherExpenses"
// //                     type="number"
// //                     value={formData.otherExpenses}
// //                     onChange={e => handleAmountChange('otherExpenses', e.target.value)}
// //                     placeholder="0.00"
// //                     min="0"
// //                     step="1"
// //                   />
// //                 </div>

// //                 <div className="space-y-2">
// //                   <Label htmlFor="expenseDescription">Expense Description</Label>
// //                   <Input
// //                     id="expenseDescription"
// //                     value={formData.expenseDescription}
// //                     onChange={e => handleChange('expenseDescription', e.target.value)}
// //                     placeholder="e.g., Coffee, Snacks, Laundry"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="referralBy">Referral By</Label>
// //                   <Input
// //                     id="referralBy"
// //                     value={formData.referralBy}
// //                     onChange={e => handleChange('referralBy', e.target.value)}
// //                     placeholder="Referral source"
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="referralAmount">Referral Amount (₹)</Label>
// //                   <Input
// //                     id="referralAmount"
// //                     type="number"
// //                     value={formData.referralAmount}
// //                     onChange={e => handleChange('referralAmount', parseFloat(e.target.value) || 0)}
// //                     placeholder="0.00"
// //                     min="0"
// //                     step="0.01"
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Payment and Tax Information */}
// //           <div className="border rounded-lg p-6">
// //             <h3 className="font-semibold text-lg mb-4">Payment & Tax Details</h3>

// //             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="amount">Room Amount (₹)</Label>
// //                 <Input
// //                   id="amount"
// //                   type="number"
// //                   min="0"
// //                   step="1"
// //                   value={formData.amount}
// //                   onChange={e => handleAmountChange('amount', e.target.value)}
// //                   placeholder="0.00"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="service">Service Charge (₹)</Label>
// //                 <Input
// //                   id="service"
// //                   type="number"
// //                   min="0"
// //                   step="1"
// //                   value={formData.service}
// //                   onChange={e => handleAmountChange('service', e.target.value)}
// //                   placeholder="0.00"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="gst">Total GST (₹)</Label>
// //                 <Input
// //                   id="gst"
// //                   type="number"
// //                   min="0"
// //                   step="1"
// //                   value={formData.gst}
// //                   onChange={e => handleAmountChange('gst', e.target.value)}
// //                   placeholder="0.00"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="total">Total Amount (₹)</Label>
// //                 <Input
// //                   id="total"
// //                   type="number"
// //                   value={formData.total.toFixed(2)}
// //                   readOnly
// //                   className="bg-gray-50 font-bold text-lg text-green-600"
// //                 />
// //               </div>
// //             </div>

// //             {/* Split Tax Display */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
// //               <div>
// //                 <Label>CGST (₹)</Label>
// //                 <div className="text-lg font-semibold text-blue-600">
// //                   {formData.cgst.toFixed(2)}
// //                 </div>
// //               </div>
// //               <div>
// //                 <Label>SGST (₹)</Label>
// //                 <div className="text-lg font-semibold text-blue-600">
// //                   {formData.sgst.toFixed(2)}
// //                 </div>
// //               </div>
// //               <div>
// //                 <Label>IGST (₹)</Label>
// //                 <div className="text-lg font-semibold text-purple-600">
// //                   {formData.igst.toFixed(2)}
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="paymentMethod">Payment Method</Label>
// //                 <select
// //                   id="paymentMethod"
// //                   value={formData.paymentMethod}
// //                   onChange={e => handleChange('paymentMethod', e.target.value)}
// //                   className="w-full h-10 px-3 text-sm border rounded-md bg-background"
// //                 >
// //                   <option value="cash">Cash</option>
// //                   <option value="online">Online</option>
// //                   <option value="card">Card</option>
// //                   <option value="upi">UPI</option>
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="paymentStatus">Payment Status</Label>
// //                 <select
// //                   id="paymentStatus"
// //                   value={formData.paymentStatus}
// //                   onChange={e => handleChange('paymentStatus', e.target.value)}
// //                   className="w-full h-10 px-3 text-sm border rounded-md bg-background"
// //                 >
// //                   <option value="completed">Completed</option>
// //                   <option value="pending">Pending</option>
// //                   <option value="partial">Partial</option>
// //                   <option value="refunded">Refunded</option>
// //                 </select>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Summary */}
// //           <div className="border rounded-lg p-6 bg-gray-50">
// //             <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div>
// //                 <p className="text-sm text-gray-600">Customer:</p>
// //                 <p className="font-medium">{formData.customerName || 'Not specified'}</p>
// //               </div>
// //               <div>
// //                 <p className="text-sm text-gray-600">Phone:</p>
// //                 <p className="font-medium">{formData.customerPhone || 'Not specified'}</p>
// //               </div>
// //               <div>
// //                 <p className="text-sm text-gray-600">Room:</p>
// //                 <p className="font-medium">{formData.roomNumber || 'Not specified'}</p>
// //               </div>
// //               <div>
// //                 <p className="text-sm text-gray-600">Check-in:</p>
// //                 <p className="font-medium">
// //                   {formData.checkInDate} at {formData.checkInTime}
// //                 </p>
// //               </div>
// //               <div>
// //                 <p className="text-sm text-gray-600">Check-out:</p>
// //                 <p className="font-medium">
// //                   {formData.checkOutDate} at {formData.checkOutTime}
// //                 </p>
// //               </div>
// //               <div className="md:col-span-2">
// //                 <p className="text-sm text-gray-600">Tax Breakdown:</p>
// //                 <div className="grid grid-cols-3 gap-2 mt-1">
// //                   <div className="text-sm">
// //                     <span className="text-gray-500">CGST:</span>
// //                     <span className="font-medium ml-1 text-blue-600">₹{formData.cgst.toFixed(2)}</span>
// //                   </div>
// //                   <div className="text-sm">
// //                     <span className="text-gray-500">SGST:</span>
// //                     <span className="font-medium ml-1 text-blue-600">₹{formData.sgst.toFixed(2)}</span>
// //                   </div>
// //                   <div className="text-sm">
// //                     <span className="text-gray-500">IGST:</span>
// //                     <span className="font-medium ml-1 text-purple-600">₹{formData.igst.toFixed(2)}</span>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="md:col-span-2">
// //                 <p className="text-sm text-gray-600">Total Amount:</p>
// //                 <p className="font-bold text-2xl text-green-600">₹{formData.total.toFixed(2)}</p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Action Buttons */}
// //           <div className="flex justify-between gap-2 pt-4">
// //             <Button
// //               variant="outline"
// //               onClick={onClose}
// //               disabled={isSubmitting}
// //               className="min-w-[120px]"
// //             >
// //               <X className="h-4 w-4 mr-2" />
// //               Cancel
// //             </Button>

// //             <Button
// //               onClick={handleSubmit}
// //               disabled={isSubmitting}
// //               className="bg-amber-600 hover:bg-amber-700 min-w-[200px]"
// //             >
// //               {isSubmitting ? (
// //                 <>
// //                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //                   Creating Booking...
// //                 </>
// //               ) : (
// //                 <>
// //                   <Save className="h-4 w-4 mr-2" />
// //                   Create Previous Booking
// //                 </>
// //               )}
// //             </Button>
// //           </div>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // };

// // export default PreviousBookingForm;


// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/hooks/use-toast';
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// import { Badge } from '@/components/ui/badge';
// import {
//   Calendar,
//   User,
//   Phone,
//   Bed,
//   CalendarIcon,
//   Clock,
//   Users,
//   Loader2,
//   X,
//   Save,
//   Mail,
//   MapPin,
//   Building,
//   FileText,
//   Percent,
//   CreditCard,
//   CheckCircle,
//   ChevronDown,
//   ChevronUp,
//   Info
// } from 'lucide-react';

// interface PreviousBookingFormProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   hotelId?: string;
// }

// const PreviousBookingForm = ({
//   open,
//   onClose,
//   onSuccess,
//   hotelId
// }: PreviousBookingFormProps) => {
//   const { toast } = useToast();
//   const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
//   const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // ========== COLLAPSIBLE SECTIONS STATE ==========
//   const [expandedSections, setExpandedSections] = useState({
//     additionalDetails: false,
//     priceConfiguration: true, // Default expanded
//     priceSummary: true // Default expanded
//   });

//   // ========== PRICE EDITING STATE VARIABLES ==========
//   const [roomPriceEditable, setRoomPriceEditable] = useState(0);
//   const [includeServiceCharge, setIncludeServiceCharge] = useState(true);
//   const [includeCGST, setIncludeCGST] = useState(true);
//   const [includeSGST, setIncludeSGST] = useState(true);
//   const [includeIGST, setIncludeIGST] = useState(false);
//   const [taxType, setTaxType] = useState<'cgst_sgst' | 'igst'>('cgst_sgst');

//   // Custom percentage states
//   const [customServicePercentage, setCustomServicePercentage] = useState(10.00);
//   const [customCgstPercentage, setCustomCgstPercentage] = useState(6.00);
//   const [customSgstPercentage, setCustomSgstPercentage] = useState(6.00);
//   const [customIgstPercentage, setCustomIgstPercentage] = useState(12.00);
//   const [useCustomPercentages, setUseCustomPercentages] = useState(false);

//   // ========== HOTEL SETTINGS STATE ==========
//   const [hotelSettings, setHotelSettings] = useState<{
//     gstPercentage: number;
//     cgstPercentage: number;
//     sgstPercentage: number;
//     igstPercentage: number;
//     serviceChargePercentage: number;
//   }>({
//     gstPercentage: 12.00,
//     cgstPercentage: 6.00,
//     sgstPercentage: 6.00,
//     igstPercentage: 12.00,
//     serviceChargePercentage: 10.00
//   });

//   const [formData, setFormData] = useState({
//     // Customer Information
//     customerName: '',
//     customerPhone: '',
//     customerEmail: '',
//     idNumber: '',
//     idType: 'aadhaar' as 'pan' | 'aadhaar' | 'passport' | 'driving',

//     // Address Fields
//     address: '',
//     city: '',
//     state: '',
//     pincode: '',
//     customerGstNo: '',

//     // Room Information
//     roomNumber: '',
//     guests: 1,

//     // Date Information
//     checkInDate: '',
//     checkInTime: '14:00',
//     checkOutDate: '',
//     checkOutTime: '12:00',

//     // Additional Fields
//     purposeOfVisit: '',
//     otherExpenses: 0,
//     expenseDescription: '',
//     referralBy: '',
//     referralAmount: 0
//   });

//   // Toggle section function
//   const toggleSection = (section: keyof typeof expandedSections) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   // Fetch hotel settings
//   useEffect(() => {
//     const fetchHotelSettings = async () => {
//       try {
//         const token = localStorage.getItem('authToken');
//         const response = await fetch(`${NODE_BACKEND_URL}/hotels/settings`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (data.success && data.data) {
//             setHotelSettings({
//               gstPercentage: data.data.gstPercentage || 12.00,
//               cgstPercentage: data.data.cgstPercentage || (data.data.gstPercentage / 2) || 6.00,
//               sgstPercentage: data.data.sgstPercentage || (data.data.gstPercentage / 2) || 6.00,
//               igstPercentage: data.data.igstPercentage || data.data.gstPercentage || 12.00,
//               serviceChargePercentage: data.data.serviceChargePercentage || 10.00
//             });
//             console.log('✅ Hotel tax settings loaded:', data.data);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching hotel settings:', error);
//       }
//     };

//     fetchHotelSettings();
//   }, [NODE_BACKEND_URL]);

//   // Update custom percentages when hotel settings change
//   useEffect(() => {
//     if (!useCustomPercentages) {
//       setCustomServicePercentage(hotelSettings.serviceChargePercentage);
//       setCustomCgstPercentage(hotelSettings.cgstPercentage);
//       setCustomSgstPercentage(hotelSettings.sgstPercentage);
//       setCustomIgstPercentage(hotelSettings.igstPercentage);
//     }
//   }, [hotelSettings, useCustomPercentages]);

//   // Reset checkboxes when tax type changes
//   useEffect(() => {
//     if (taxType === 'cgst_sgst') {
//       setIncludeCGST(true);
//       setIncludeSGST(true);
//       setIncludeIGST(false);
//     } else {
//       setIncludeCGST(false);
//       setIncludeSGST(false);
//       setIncludeIGST(true);
//     }
//   }, [taxType]);

//   // Calculate nights
//   const nights = (() => {
//     if (!formData.checkInDate || !formData.checkOutDate) return 0;

//     const checkIn = new Date(formData.checkInDate);
//     const checkOut = new Date(formData.checkOutDate);

//     checkIn.setHours(0, 0, 0, 0);
//     checkOut.setHours(0, 0, 0, 0);

//     const diffTime = checkOut.getTime() - checkIn.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     return diffDays > 0 ? diffDays : 1;
//   })();

//   // ========== CALCULATE CHARGES ==========
//   const calculateCharges = () => {
//     const baseAmount = roomPriceEditable * nights;

//     // Use custom percentages if enabled, otherwise use hotel settings
//     const servicePercentage = useCustomPercentages ? customServicePercentage : hotelSettings.serviceChargePercentage;

//     const serviceCharge = includeServiceCharge ?
//       (baseAmount * servicePercentage) / 100 : 0;

//     // Calculate taxes based on selected tax type
//     let cgst = 0, sgst = 0, igst = 0;
//     let cgstPercentage = 0, sgstPercentage = 0, igstPercentage = 0;

//     if (taxType === 'cgst_sgst') {
//       cgstPercentage = useCustomPercentages ? customCgstPercentage : hotelSettings.cgstPercentage;
//       sgstPercentage = useCustomPercentages ? customSgstPercentage : hotelSettings.sgstPercentage;

//       cgst = includeCGST ? ((baseAmount + serviceCharge) * cgstPercentage) / 100 : 0;
//       sgst = includeSGST ? ((baseAmount + serviceCharge) * sgstPercentage) / 100 : 0;
//     } else {
//       igstPercentage = useCustomPercentages ? customIgstPercentage : hotelSettings.igstPercentage;
//       igst = includeIGST ? ((baseAmount + serviceCharge) * igstPercentage) / 100 : 0;
//     }

//     const otherExpenses = parseFloat(String(formData.otherExpenses)) || 0;
//     const total = baseAmount + serviceCharge + cgst + sgst + igst + otherExpenses;

//     return {
//       baseAmount,
//       serviceCharge,
//       cgst,
//       sgst,
//       igst,
//       otherExpenses,
//       total,
//       roomPrice: roomPriceEditable,
//       includeServiceCharge,
//       includeCGST,
//       includeSGST,
//       includeIGST,
//       taxType,
//       cgstPercentage,
//       sgstPercentage,
//       igstPercentage,
//       serviceChargePercentage: servicePercentage,
//       useCustomPercentages
//     };
//   };

//   const charges = calculateCharges();

//   const handleChange = (field: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const validateForm = () => {
//     // Basic validations
//     if (!formData.customerName.trim()) {
//       toast({ title: 'Name required', variant: 'destructive' });
//       return false;
//     }
//     if (!formData.customerPhone.trim() || formData.customerPhone.length < 10) {
//       toast({ title: 'Valid phone number required (10 digits)', variant: 'destructive' });
//       return false;
//     }
//     if (!formData.roomNumber.trim()) {
//       toast({ title: 'Room number required', variant: 'destructive' });
//       return false;
//     }
//     if (!formData.checkInDate || !formData.checkOutDate) {
//       toast({ title: 'Check-in and check-out dates required', variant: 'destructive' });
//       return false;
//     }

//     const checkIn = new Date(formData.checkInDate);
//     const checkOut = new Date(formData.checkOutDate);

//     if (checkOut <= checkIn) {
//       toast({
//         title: 'Invalid Dates',
//         description: 'Check-out date must be after check-in date',
//         variant: 'destructive'
//       });
//       return false;
//     }

//     if (charges.total <= 0) {
//       toast({
//         title: 'Invalid Amount',
//         description: 'Total amount must be greater than 0',
//         variant: 'destructive'
//       });
//       return false;
//     }

//     // GST Number validation (if provided)
//     if (formData.customerGstNo && formData.customerGstNo.trim() !== '') {
//       const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//       if (!gstRegex.test(formData.customerGstNo.trim())) {
//         toast({
//           title: 'Invalid GST Number',
//           description: 'Please enter a valid 15-character GSTIN',
//           variant: 'destructive'
//         });
//         return false;
//       }
//     }

//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setIsSubmitting(true);

//     try {
//       const token = localStorage.getItem('authToken');

//       // First, get room_id from room number
//       const roomsResponse = await fetch(`${NODE_BACKEND_URL}/rooms`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const roomsData = await roomsResponse.json();
//       const room = roomsData.data?.find((r: any) =>
//         r.room_number?.toString() === formData.roomNumber.toString()
//       );

//       if (!room) {
//         toast({
//           title: 'Room Not Found',
//           description: `Room ${formData.roomNumber} does not exist`,
//           variant: 'destructive'
//         });
//         setIsSubmitting(false);
//         return;
//       }

//       // Create booking with all fields matching BookingForm structure
//       const bookingData = {
//         room_id: room.id,
//         customer_name: formData.customerName,
//         customer_phone: formData.customerPhone,
//         customer_email: formData.customerEmail || null,
//         from_date: formData.checkInDate,
//         to_date: formData.checkOutDate,
//         from_time: formData.checkInTime,
//         to_time: formData.checkOutTime,

//         // Amount fields - MATCHING BOOKINGFORM STRUCTURE
//         amount: charges.baseAmount,
//         service: charges.serviceCharge,

//         // Split tax fields - CRITICAL FOR DISPLAY
//         cgst: charges.cgst,
//         sgst: charges.sgst,
//         igst: charges.igst,
//         gst: charges.cgst + charges.sgst + charges.igst, // Keep for backward compatibility

//         // Total
//         total: charges.total,

//         // Status and booking details
//         status: 'booked',
//         guests: formData.guests,
//         payment_method: 'cash', // Default for previous bookings
//         payment_status: 'completed',

//         // Customer ID details
//         id_type: formData.idType,
//         id_number: formData.idNumber,

//         // Address fields
//         address: formData.address || null,
//         city: formData.city || null,
//         state: formData.state || null,
//         pincode: formData.pincode || null,
//         customer_gst_no: formData.customerGstNo || null,

//         // Additional fields
//         purpose_of_visit: formData.purposeOfVisit || null,
//         other_expenses: charges.otherExpenses || 0,
//         expense_description: formData.expenseDescription || null,
//         referral_by: formData.referralBy || null,
//         referral_amount: formData.referralAmount || 0,

//         // Tax metadata - MATCHING BOOKINGFORM
//         tax_type: taxType,
//         include_service_charge: includeServiceCharge,
//         include_cgst: includeCGST,
//         include_sgst: includeSGST,
//         include_igst: includeIGST,
//         gst_percentage: taxType === 'cgst_sgst' ?
//           (charges.cgstPercentage + charges.sgstPercentage) :
//           charges.igstPercentage,
//         cgst_percentage: charges.cgstPercentage,
//         sgst_percentage: charges.sgstPercentage,
//         igst_percentage: charges.igstPercentage,
//         service_charge_percentage: charges.serviceChargePercentage,
//         use_custom_percentages: useCustomPercentages,
//         nights: nights,
//         room_price_per_night: roomPriceEditable
//       };

//       console.log('📤 Submitting previous booking with split taxes:', bookingData);

//       const response = await fetch(`${NODE_BACKEND_URL}/bookings/past-booking`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(bookingData)
//       });

//       const result = await response.json();

//       if (result.success) {
//         toast({
//           title: '✅ Previous Booking Added',
//           description: `Booking for ${formData.customerName} has been recorded with tax details`,
//           variant: 'default'
//         });

//         // Reset form to initial state
//         setFormData({
//           customerName: '',
//           customerPhone: '',
//           customerEmail: '',
//           idNumber: '',
//           idType: 'aadhaar',
//           address: '',
//           city: '',
//           state: '',
//           pincode: '',
//           customerGstNo: '',
//           roomNumber: '',
//           guests: 1,
//           checkInDate: '',
//           checkInTime: '14:00',
//           checkOutDate: '',
//           checkOutTime: '12:00',
//           purposeOfVisit: '',
//           otherExpenses: 0,
//           expenseDescription: '',
//           referralBy: '',
//           referralAmount: 0
//         });
//         setRoomPriceEditable(0);
//         setUseCustomPercentages(false);
//         setTaxType('cgst_sgst');

//         onSuccess();
//         onClose();
//       } else {
//         throw new Error(result.message || 'Failed to create booking');
//       }
//     } catch (error: any) {
//       console.error('Error creating previous booking:', error);
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to create booking',
//         variant: 'destructive'
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
//             <div className="flex items-center gap-2">
//               <CalendarIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
//               <span>Add Previous Booking</span>
//             </div>
//             <span className="text-sm font-normal text-amber-600 sm:ml-2 sm:border-l sm:border-amber-200 sm:pl-2">
//               (For past dates - Includes tax details)
//             </span>
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Customer Information */}
//           <div className="border rounded-lg p-6">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//               <User className="h-5 w-5" />
//               Customer Information
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="customerName" className="flex items-center gap-1">
//                   <User className="h-4 w-4" />
//                   Full Name *
//                 </Label>
//                 <Input
//                   id="customerName"
//                   value={formData.customerName}
//                   onChange={e => handleChange('customerName', e.target.value)}
//                   placeholder="Enter full name"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="customerPhone" className="flex items-center gap-1">
//                   <Phone className="h-4 w-4" />
//                   Phone Number *
//                 </Label>
//                 <Input
//                   id="customerPhone"
//                   value={formData.customerPhone}
//                   onChange={e => handleChange('customerPhone', e.target.value)}
//                   placeholder="10-digit mobile number"
//                   type="tel"
//                   maxLength={10}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="customerEmail" className="flex items-center gap-1">
//                   <Mail className="h-4 w-4" />
//                   Email Address
//                 </Label>
//                 <Input
//                   id="customerEmail"
//                   value={formData.customerEmail}
//                   onChange={e => handleChange('customerEmail', e.target.value)}
//                   placeholder="email@example.com"
//                   type="email"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="idType">ID Type</Label>
//                 <select
//                   id="idType"
//                   value={formData.idType}
//                   onChange={e => handleChange('idType', e.target.value as any)}
//                   className="w-full h-10 px-3 text-sm border rounded-md bg-background"
//                 >
//                   <option value="aadhaar">Aadhaar Card</option>
//                   <option value="pan">PAN Card</option>
//                   <option value="passport">Passport</option>
//                   <option value="driving">Driving License</option>
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="idNumber">ID Number</Label>
//                 <Input
//                   id="idNumber"
//                   value={formData.idNumber}
//                   onChange={e => handleChange('idNumber', e.target.value)}
//                   placeholder="ID number"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="customerGstNo" className="flex items-center gap-1">
//                   <FileText className="h-4 w-4" />
//                   Customer GST No
//                 </Label>
//                 <Input
//                   id="customerGstNo"
//                   value={formData.customerGstNo}
//                   onChange={e => handleChange('customerGstNo', e.target.value)}
//                   placeholder="GSTIN (e.g., 27AAACH1234M1Z5)"
//                   maxLength={15}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Address Information */}
//           <div className="border rounded-lg p-6 border-blue-100 bg-blue-50/30">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//               <MapPin className="h-5 w-5 text-blue-600" />
//               Address Information
//             </h3>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="address">Full Address</Label>
//                 <Textarea
//                   id="address"
//                   value={formData.address}
//                   onChange={e => handleChange('address', e.target.value)}
//                   placeholder="Enter full address"
//                   className="min-h-[80px]"
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="city">City</Label>
//                   <Input
//                     id="city"
//                     value={formData.city}
//                     onChange={e => handleChange('city', e.target.value)}
//                     placeholder="City"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="state">State</Label>
//                   <Input
//                     id="state"
//                     value={formData.state}
//                     onChange={e => handleChange('state', e.target.value)}
//                     placeholder="State"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="pincode">Pincode</Label>
//                   <Input
//                     id="pincode"
//                     value={formData.pincode}
//                     onChange={e => handleChange('pincode', e.target.value)}
//                     placeholder="6-digit pincode"
//                     maxLength={6}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Room Information */}
//           <div className="border rounded-lg p-6">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//               <Bed className="h-5 w-5" />
//               Room Information
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="roomNumber" className="flex items-center gap-1">
//                   <Building className="h-4 w-4" />
//                   Room Number *
//                 </Label>
//                 <Input
//                   id="roomNumber"
//                   value={formData.roomNumber}
//                   onChange={e => handleChange('roomNumber', e.target.value)}
//                   placeholder="e.g., 101, 202"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="guests" className="flex items-center gap-1">
//                   <Users className="h-4 w-4" />
//                   Number of Guests
//                 </Label>
//                 <Input
//                   id="guests"
//                   type="number"
//                   min="1"
//                   max="10"
//                   value={formData.guests}
//                   onChange={e => handleChange('guests', parseInt(e.target.value) || 1)}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Date Information - PAST DATES ALLOWED */}
//           <div className="border rounded-lg p-6 border-amber-200 bg-amber-50/30">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//               <Calendar className="h-5 w-5 text-amber-600" />
//               Booking Dates (Past Dates Allowed)
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="checkInDate" className="flex items-center gap-1">
//                   <Calendar className="h-4 w-4" />
//                   Check-in Date *
//                 </Label>
//                 <Input
//                   type="date"
//                   id="checkInDate"
//                   value={formData.checkInDate}
//                   onChange={e => handleChange('checkInDate', e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="checkInTime" className="flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   Check-in Time
//                 </Label>
//                 <Input
//                   type="time"
//                   id="checkInTime"
//                   value={formData.checkInTime}
//                   onChange={e => handleChange('checkInTime', e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="checkOutDate" className="flex items-center gap-1">
//                   <Calendar className="h-4 w-4" />
//                   Check-out Date *
//                 </Label>
//                 <Input
//                   type="date"
//                   id="checkOutDate"
//                   value={formData.checkOutDate}
//                   min={formData.checkInDate}
//                   onChange={e => handleChange('checkOutDate', e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="checkOutTime" className="flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   Check-out Time
//                 </Label>
//                 <Input
//                   type="time"
//                   id="checkOutTime"
//                   value={formData.checkOutTime}
//                   onChange={e => handleChange('checkOutTime', e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ========== PRICE CONFIGURATION SECTION - SAME AS BOOKING FORM ========== */}
//           <Collapsible
//             open={expandedSections.priceConfiguration}
//             onOpenChange={() => toggleSection('priceConfiguration')}
//             className="border rounded-lg p-4 md:p-6 space-y-4 bg-blue-50/50"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <h4 className="font-semibold text-lg">💰 Price Configuration</h4>
//                 <Badge variant="outline" className="text-xs bg-blue-100">
//                   Customizable
//                 </Badge>
//               </div>
//               <CollapsibleTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   {expandedSections.priceConfiguration ? (
//                     <ChevronUp className="h-4 w-4" />
//                   ) : (
//                     <ChevronDown className="h-4 w-4" />
//                   )}
//                 </Button>
//               </CollapsibleTrigger>
//             </div>

//             <CollapsibleContent className="space-y-4">
//               {/* Room Price Editing */}
//               <div className="space-y-3">
//                 <div className="space-y-2">
//                   <Label htmlFor="roomPrice" className="flex items-center gap-2 text-sm">
//                     Room Price per Night (₹)
//                   </Label>
//                   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//                     <div className="flex-1">
//                       <Input
//                         id="roomPrice"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={roomPriceEditable}
//                         onChange={(e) => setRoomPriceEditable(parseFloat(e.target.value) || 0)}
//                         placeholder="Enter room price per night"
//                         className="text-base md:text-lg font-medium w-full"
//                       />
//                     </div>
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     Base price: ₹{roomPriceEditable} × {nights} night(s) = ₹{charges.baseAmount.toFixed(2)}
//                   </p>
//                 </div>

//                 {/* Tax Type Selection */}
//                 <div className="space-y-3 border-t pt-4">
//                   <Label className="text-sm font-medium">GST Type</Label>
//                   <div className="grid grid-cols-2 gap-2">
//                     <Button
//                       type="button"
//                       variant={taxType === 'cgst_sgst' ? "default" : "outline"}
//                       onClick={() => setTaxType('cgst_sgst')}
//                       className="h-auto py-2 px-2 text-xs sm:text-sm"
//                     >
//                       <div className="text-center">
//                         <div className="font-medium">CGST+SGST</div>
//                         <div className="text-[10px] sm:text-xs opacity-90">Local</div>
//                       </div>
//                     </Button>
//                     <Button
//                       type="button"
//                       variant={taxType === 'igst' ? "default" : "outline"}
//                       onClick={() => setTaxType('igst')}
//                       className="h-auto py-2 px-2 text-xs sm:text-sm"
//                     >
//                       <div className="text-center">
//                         <div className="font-medium">IGST</div>
//                         <div className="text-[10px] sm:text-xs opacity-90">Outside</div>
//                       </div>
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Optional Charges */}
//                 <div className="space-y-3 pt-2">
//                   {/* Service Charge */}
//                   <div className="flex flex-col p-3 border rounded-lg bg-white">
//                     <div className="flex items-start gap-3">
//                       <div className="flex items-center h-5 pt-0.5">
//                         <input
//                           type="checkbox"
//                           id="includeServiceCharge"
//                           checked={includeServiceCharge}
//                           onChange={(e) => setIncludeServiceCharge(e.target.checked)}
//                           className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <Label htmlFor="includeServiceCharge" className="font-medium text-sm cursor-pointer">
//                           Service Charge
//                         </Label>
//                         <p className="text-xs text-muted-foreground">
//                           Hotel service charge
//                         </p>
//                       </div>
//                     </div>

//                     {includeServiceCharge && (
//                       <div className="mt-2 ml-7 space-y-2">
//                         <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
//                           <div className="flex items-center gap-2 w-full xs:w-auto">
//                             <Input
//                               type="number"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                               value={useCustomPercentages ? customServicePercentage : hotelSettings.serviceChargePercentage}
//                               onChange={(e) => {
//                                 setUseCustomPercentages(true);
//                                 setCustomServicePercentage(parseFloat(e.target.value) || 0);
//                               }}
//                               className="w-20 text-sm"
//                               placeholder="%"
//                             />
//                             <span className="text-sm">%</span>
//                           </div>
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => {
//                               setUseCustomPercentages(false);
//                               setCustomServicePercentage(hotelSettings.serviceChargePercentage);
//                             }}
//                             className="text-xs h-8 px-2"
//                           >
//                             Reset
//                           </Button>
//                         </div>
//                         <div className="text-xs text-green-600 font-medium">
//                           + ₹{charges.serviceCharge.toFixed(2)}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* CGST + SGST Section */}
//                   {taxType === 'cgst_sgst' && (
//                     <>
//                       {/* CGST */}
//                       <div className="flex flex-col p-3 border rounded-lg bg-white">
//                         <div className="flex items-start gap-3">
//                           <div className="flex items-center h-5 pt-0.5">
//                             <input
//                               type="checkbox"
//                               id="includeCGST"
//                               checked={includeCGST}
//                               onChange={(e) => setIncludeCGST(e.target.checked)}
//                               className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
//                             />
//                           </div>
//                           <div className="flex-1">
//                             <Label htmlFor="includeCGST" className="font-medium text-sm cursor-pointer">
//                               CGST (Central)
//                             </Label>
//                             <p className="text-xs text-muted-foreground">
//                               Central GST
//                             </p>
//                           </div>
//                         </div>

//                         {includeCGST && (
//                           <div className="mt-2 ml-7 space-y-2">
//                             <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
//                               <div className="flex items-center gap-2 w-full xs:w-auto">
//                                 <Input
//                                   type="number"
//                                   min="0"
//                                   max="100"
//                                   step="0.01"
//                                   value={useCustomPercentages ? customCgstPercentage : hotelSettings.cgstPercentage}
//                                   onChange={(e) => {
//                                     setUseCustomPercentages(true);
//                                     setCustomCgstPercentage(parseFloat(e.target.value) || 0);
//                                   }}
//                                   className="w-20 text-sm"
//                                   placeholder="%"
//                                 />
//                                 <span className="text-sm">%</span>
//                               </div>
//                               <Button
//                                 type="button"
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => {
//                                   setUseCustomPercentages(false);
//                                   setCustomCgstPercentage(hotelSettings.cgstPercentage);
//                                 }}
//                                 className="text-xs h-8 px-2"
//                               >
//                                 Reset
//                               </Button>
//                             </div>
//                             <div className="text-xs text-green-600 font-medium">
//                               + ₹{charges.cgst.toFixed(2)}
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {/* SGST */}
//                       <div className="flex flex-col p-3 border rounded-lg bg-white">
//                         <div className="flex items-start gap-3">
//                           <div className="flex items-center h-5 pt-0.5">
//                             <input
//                               type="checkbox"
//                               id="includeSGST"
//                               checked={includeSGST}
//                               onChange={(e) => setIncludeSGST(e.target.checked)}
//                               className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
//                             />
//                           </div>
//                           <div className="flex-1">
//                             <Label htmlFor="includeSGST" className="font-medium text-sm cursor-pointer">
//                               SGST (State)
//                             </Label>
//                             <p className="text-xs text-muted-foreground">
//                               State GST
//                             </p>
//                           </div>
//                         </div>

//                         {includeSGST && (
//                           <div className="mt-2 ml-7 space-y-2">
//                             <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
//                               <div className="flex items-center gap-2 w-full xs:w-auto">
//                                 <Input
//                                   type="number"
//                                   min="0"
//                                   max="100"
//                                   step="0.01"
//                                   value={useCustomPercentages ? customSgstPercentage : hotelSettings.sgstPercentage}
//                                   onChange={(e) => {
//                                     setUseCustomPercentages(true);
//                                     setCustomSgstPercentage(parseFloat(e.target.value) || 0);
//                                   }}
//                                   className="w-20 text-sm"
//                                   placeholder="%"
//                                 />
//                                 <span className="text-sm">%</span>
//                               </div>
//                               <Button
//                                 type="button"
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => {
//                                   setUseCustomPercentages(false);
//                                   setCustomSgstPercentage(hotelSettings.sgstPercentage);
//                                 }}
//                                 className="text-xs h-8 px-2"
//                               >
//                                 Reset
//                               </Button>
//                             </div>
//                             <div className="text-xs text-green-600 font-medium">
//                               + ₹{charges.sgst.toFixed(2)}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </>
//                   )}

//                   {/* IGST Section */}
//                   {taxType === 'igst' && (
//                     <div className="flex flex-col p-3 border rounded-lg bg-white">
//                       <div className="flex items-start gap-3">
//                         <div className="flex items-center h-5 pt-0.5">
//                           <input
//                             type="checkbox"
//                             id="includeIGST"
//                             checked={includeIGST}
//                             onChange={(e) => setIncludeIGST(e.target.checked)}
//                             className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
//                           />
//                         </div>
//                         <div className="flex-1">
//                           <Label htmlFor="includeIGST" className="font-medium text-sm cursor-pointer">
//                             IGST (Integrated)
//                           </Label>
//                           <p className="text-xs text-muted-foreground">
//                             For inter-state transactions
//                           </p>
//                         </div>
//                       </div>

//                       {includeIGST && (
//                         <div className="mt-2 ml-7 space-y-2">
//                           <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
//                             <div className="flex items-center gap-2 w-full xs:w-auto">
//                               <Input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 step="0.01"
//                                 value={useCustomPercentages ? customIgstPercentage : hotelSettings.igstPercentage}
//                                 onChange={(e) => {
//                                   setUseCustomPercentages(true);
//                                   setCustomIgstPercentage(parseFloat(e.target.value) || 0);
//                                 }}
//                                 className="w-20 text-sm"
//                                 placeholder="%"
//                               />
//                               <span className="text-sm">%</span>
//                             </div>
//                             <Button
//                               type="button"
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => {
//                                 setUseCustomPercentages(false);
//                                 setCustomIgstPercentage(hotelSettings.igstPercentage);
//                               }}
//                               className="text-xs h-8 px-2"
//                             >
//                               Reset
//                             </Button>
//                           </div>
//                           <div className="text-xs text-green-600 font-medium">
//                             + ₹{charges.igst.toFixed(2)}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Quick Actions */}
//                 <div className="flex flex-col xs:flex-row gap-2 pt-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => {
//                       setIncludeServiceCharge(true);
//                       if (taxType === 'cgst_sgst') {
//                         setIncludeCGST(true);
//                         setIncludeSGST(true);
//                         setIncludeIGST(false);
//                       } else {
//                         setIncludeCGST(false);
//                         setIncludeSGST(false);
//                         setIncludeIGST(true);
//                       }
//                       setUseCustomPercentages(false);
//                     }}
//                     className="flex-1 text-xs sm:text-sm"
//                   >
//                     Include All (Default)
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => {
//                       setIncludeServiceCharge(false);
//                       setIncludeCGST(false);
//                       setIncludeSGST(false);
//                       setIncludeIGST(false);
//                     }}
//                     className="flex-1 text-xs sm:text-sm"
//                   >
//                     Remove All
//                   </Button>
//                 </div>
//               </div>
//             </CollapsibleContent>
//           </Collapsible>

//           {/* ========== PRICE SUMMARY ========== */}
//           <Collapsible
//             open={expandedSections.priceSummary}
//             onOpenChange={() => toggleSection('priceSummary')}
//             className="border rounded-lg p-6 space-y-3 bg-muted/50"
//           >
//             <div className="flex items-center justify-between">
//               <h4 className="font-semibold text-lg">Price Summary</h4>
//               <CollapsibleTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   {expandedSections.priceSummary ? (
//                     <ChevronUp className="h-4 w-4" />
//                   ) : (
//                     <ChevronDown className="h-4 w-4" />
//                   )}
//                 </Button>
//               </CollapsibleTrigger>
//             </div>

//             <CollapsibleContent className="space-y-2">
//               <div className="flex justify-between">
//                 <span>Room Price (₹{roomPriceEditable.toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'})</span>
//                 <span>₹{charges.baseAmount.toFixed(2)}</span>
//               </div>

//               {includeServiceCharge && (
//                 <div className="flex justify-between">
//                   <span className="flex items-center gap-2">
//                     Service Charge ({charges.serviceChargePercentage}%)
//                   </span>
//                   <span>₹{charges.serviceCharge.toFixed(2)}</span>
//                 </div>
//               )}

//               {/* Show CGST and SGST when taxType is cgst_sgst */}
//               {taxType === 'cgst_sgst' && (
//                 <>
//                   {includeCGST && (
//                     <div className="flex justify-between">
//                       <span className="flex items-center gap-2">
//                         CGST ({charges.cgstPercentage}%)
//                       </span>
//                       <span>₹{charges.cgst.toFixed(2)}</span>
//                     </div>
//                   )}

//                   {includeSGST && (
//                     <div className="flex justify-between">
//                       <span className="flex items-center gap-2">
//                         SGST ({charges.sgstPercentage}%)
//                       </span>
//                       <span>₹{charges.sgst.toFixed(2)}</span>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Show IGST when taxType is igst */}
//               {taxType === 'igst' && includeIGST && (
//                 <div className="flex justify-between">
//                   <span className="flex items-center gap-2">
//                     IGST ({charges.igstPercentage}%)
//                   </span>
//                   <span>₹{charges.igst.toFixed(2)}</span>
//                 </div>
//               )}

//               {formData.otherExpenses > 0 && (
//                 <div className="flex justify-between text-sm border-t pt-2 mt-2">
//                   <span className="flex items-center gap-1">
//                     Other Expenses
//                     {formData.expenseDescription && (
//                       <span className="text-xs text-muted-foreground">
//                         ({formData.expenseDescription})
//                       </span>
//                     )}
//                   </span>
//                   <span className="text-blue-600 font-medium">+ ₹{formData.otherExpenses.toFixed(2)}</span>
//                 </div>
//               )}

//               <div className="border-t pt-2 mt-2">
//                 <div className="flex justify-between font-bold text-lg">
//                   <span>Total Amount</span>
//                   <span className="text-green-600">₹{charges.total.toFixed(2)}</span>
//                 </div>
//                 <div className="text-sm text-muted-foreground mt-1">
//                   {!includeServiceCharge && !includeCGST && !includeSGST && !includeIGST && formData.otherExpenses === 0 ? "No additional charges" :
//                     `Includes: ${includeServiceCharge ? 'Service Charge ' : ''}${includeCGST ? 'CGST ' : ''}${includeSGST ? 'SGST ' : ''}${includeIGST ? 'IGST' : ''}`}
//                 </div>
//               </div>
//             </CollapsibleContent>
//           </Collapsible>

//           {/* Additional Details */}
//           <div className="border rounded-lg p-6 border-green-100 bg-green-50/30">
//             <h3 className="font-semibold text-lg mb-4 text-green-800">
//               Additional Details
//             </h3>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
//                 <Textarea
//                   id="purposeOfVisit"
//                   value={formData.purposeOfVisit}
//                   onChange={e => handleChange('purposeOfVisit', e.target.value)}
//                   placeholder="Enter purpose of visit"
//                   className="min-h-[80px]"
//                   rows={2}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="otherExpenses">Other Expenses (₹)</Label>
//                   <Input
//                     id="otherExpenses"
//                     type="number"
//                     value={formData.otherExpenses}
//                     onChange={e => handleChange('otherExpenses', parseFloat(e.target.value) || 0)}
//                     placeholder="0.00"
//                     min="0"
//                     step="1"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="expenseDescription">Expense Description</Label>
//                   <Input
//                     id="expenseDescription"
//                     value={formData.expenseDescription}
//                     onChange={e => handleChange('expenseDescription', e.target.value)}
//                     placeholder="e.g., Coffee, Snacks, Laundry"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="referralBy">Referral By</Label>
//                   <Input
//                     id="referralBy"
//                     value={formData.referralBy}
//                     onChange={e => handleChange('referralBy', e.target.value)}
//                     placeholder="Referral source"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="referralAmount">Referral Amount (₹)</Label>
//                   <Input
//                     id="referralAmount"
//                     type="number"
//                     value={formData.referralAmount}
//                     onChange={e => handleChange('referralAmount', parseFloat(e.target.value) || 0)}
//                     placeholder="0.00"
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Summary */}
//           <div className="border rounded-lg p-6 bg-gray-50">
//             <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm text-gray-600">Customer:</p>
//                 <p className="font-medium">{formData.customerName || 'Not specified'}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Phone:</p>
//                 <p className="font-medium">{formData.customerPhone || 'Not specified'}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Room:</p>
//                 <p className="font-medium">{formData.roomNumber || 'Not specified'}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Check-in:</p>
//                 <p className="font-medium">
//                   {formData.checkInDate} at {formData.checkInTime}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Check-out:</p>
//                 <p className="font-medium">
//                   {formData.checkOutDate} at {formData.checkOutTime}
//                 </p>
//               </div>
//               <div className="md:col-span-2">
//                 <p className="text-sm text-gray-600">Tax Breakdown:</p>
//                 <div className="grid grid-cols-3 gap-2 mt-1">
//                   {taxType === 'cgst_sgst' ? (
//                     <>
//                       <div className="text-sm">
//                         <span className="text-gray-500">CGST:</span>
//                         <span className="font-medium ml-1 text-blue-600">₹{charges.cgst.toFixed(2)}</span>
//                       </div>
//                       <div className="text-sm">
//                         <span className="text-gray-500">SGST:</span>
//                         <span className="font-medium ml-1 text-blue-600">₹{charges.sgst.toFixed(2)}</span>
//                       </div>
//                     </>
//                   ) : (
//                     <div className="text-sm col-span-2">
//                       <span className="text-gray-500">IGST:</span>
//                       <span className="font-medium ml-1 text-purple-600">₹{charges.igst.toFixed(2)}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="md:col-span-2">
//                 <p className="text-sm text-gray-600">Total Amount:</p>
//                 <p className="font-bold text-2xl text-green-600">₹{charges.total.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-between gap-2 pt-4">
//             <Button
//               variant="outline"
//               onClick={onClose}
//               disabled={isSubmitting}
//               className="min-w-[120px]"
//             >
//               <X className="h-4 w-4 mr-2" />
//               Cancel
//             </Button>

//             <Button
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="bg-amber-600 hover:bg-amber-700 min-w-[200px]"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Creating Booking...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4 mr-2" />
//                   Create Previous Booking
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PreviousBookingForm;


import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  Phone,
  Bed,
  CalendarIcon,
  Clock,
  Users,
  Loader2,
  X,
  Save,
  Mail,
  MapPin,
  Building,
  FileText,
  Percent,
  CreditCard,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface PreviousBookingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hotelId?: string;
}

const PreviousBookingForm = ({
  open,
  onClose,
  onSuccess,
  hotelId
}: PreviousBookingFormProps) => {
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========== COLLAPSIBLE SECTIONS STATE ==========
  const [expandedSections, setExpandedSections] = useState({
    additionalDetails: false,
    priceConfiguration: true,
    priceSummary: true
  });

  // ========== PRICE EDITING STATE VARIABLES ==========
  const [roomPriceEditable, setRoomPriceEditable] = useState(0);
  const [includeServiceCharge, setIncludeServiceCharge] = useState(true);
  const [includeCGST, setIncludeCGST] = useState(true);
  const [includeSGST, setIncludeSGST] = useState(true);
  const [includeIGST, setIncludeIGST] = useState(false);
  const [taxType, setTaxType] = useState<'cgst_sgst' | 'igst'>('cgst_sgst');

  // Custom percentage states
  const [customServicePercentage, setCustomServicePercentage] = useState(10.00);
  const [customCgstPercentage, setCustomCgstPercentage] = useState(6.00);
  const [customSgstPercentage, setCustomSgstPercentage] = useState(6.00);
  const [customIgstPercentage, setCustomIgstPercentage] = useState(12.00);
  const [useCustomPercentages, setUseCustomPercentages] = useState(false);

  // ========== HOTEL SETTINGS STATE ==========
  const [hotelSettings, setHotelSettings] = useState<{
    gstPercentage: number;
    cgstPercentage: number;
    sgstPercentage: number;
    igstPercentage: number;
    serviceChargePercentage: number;
  }>({
    gstPercentage: 12.00,
    cgstPercentage: 6.00,
    sgstPercentage: 6.00,
    igstPercentage: 12.00,
    serviceChargePercentage: 10.00
  });

  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    idNumber: '',
    idType: 'aadhaar' as 'pan' | 'aadhaar' | 'passport' | 'driving',

    // Address Fields
    address: '',
    city: '',
    state: '',
    pincode: '',
    customerGstNo: '',

    // Room Information
    roomNumber: '',
    guests: 1,

    // Date Information
    checkInDate: '',
    checkInTime: '14:00',
    checkOutDate: '',
    checkOutTime: '12:00',

    // Additional Fields
    purposeOfVisit: '',
    otherExpenses: 0,
    expenseDescription: '',
    referralBy: '',
    referralAmount: 0
  });

  // Toggle section function
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch hotel settings
  useEffect(() => {
    const fetchHotelSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${NODE_BACKEND_URL}/hotels/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setHotelSettings({
              gstPercentage: data.data.gstPercentage || 12.00,
              cgstPercentage: data.data.cgstPercentage || (data.data.gstPercentage / 2) || 6.00,
              sgstPercentage: data.data.sgstPercentage || (data.data.gstPercentage / 2) || 6.00,
              igstPercentage: data.data.igstPercentage || data.data.gstPercentage || 12.00,
              serviceChargePercentage: data.data.serviceChargePercentage || 10.00
            });
            console.log('✅ Hotel tax settings loaded:', data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching hotel settings:', error);
      }
    };

    fetchHotelSettings();
  }, [NODE_BACKEND_URL]);

  // Update custom percentages when hotel settings change
  useEffect(() => {
    if (!useCustomPercentages) {
      setCustomServicePercentage(hotelSettings.serviceChargePercentage);
      setCustomCgstPercentage(hotelSettings.cgstPercentage);
      setCustomSgstPercentage(hotelSettings.sgstPercentage);
      setCustomIgstPercentage(hotelSettings.igstPercentage);
    }
  }, [hotelSettings, useCustomPercentages]);

  // Reset checkboxes when tax type changes
  useEffect(() => {
    if (taxType === 'cgst_sgst') {
      setIncludeCGST(true);
      setIncludeSGST(true);
      setIncludeIGST(false);
    } else {
      setIncludeCGST(false);
      setIncludeSGST(false);
      setIncludeIGST(true);
    }
  }, [taxType]);

  // Calculate nights
  const nights = (() => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
  })();

  // ========== CALCULATE CHARGES ==========
  const calculateCharges = () => {
    const baseAmount = roomPriceEditable * nights;
    console.log('💰 DEBUG - Calculating charges:', {
      roomPriceEditable,
      nights,
      baseAmount,
      taxType,
      includeServiceCharge,
      includeCGST,
      includeSGST,
      includeIGST,
      useCustomPercentages,
      customServicePercentage,
      customCgstPercentage,
      customSgstPercentage,
      customIgstPercentage
    });

    // Use custom percentages if enabled, otherwise use hotel settings
    const servicePercentage = useCustomPercentages ? customServicePercentage : hotelSettings.serviceChargePercentage;

    const serviceCharge = includeServiceCharge ?
      (baseAmount * servicePercentage) / 100 : 0;

    // Calculate taxes based on selected tax type
    let cgst = 0, sgst = 0, igst = 0;
    let cgstPercentage = 0, sgstPercentage = 0, igstPercentage = 0;

    if (taxType === 'cgst_sgst') {
      cgstPercentage = useCustomPercentages ? customCgstPercentage : hotelSettings.cgstPercentage;
      sgstPercentage = useCustomPercentages ? customSgstPercentage : hotelSettings.sgstPercentage;

      cgst = includeCGST ? ((baseAmount + serviceCharge) * cgstPercentage) / 100 : 0;
      sgst = includeSGST ? ((baseAmount + serviceCharge) * sgstPercentage) / 100 : 0;
      console.log('🧮 CGST+SGST Calculation:', {
        baseAmount,
        serviceCharge,
        taxableAmount: baseAmount + serviceCharge,
        cgstPercentage,
        sgstPercentage,
        cgst,
        sgst
      });

    } else {
      igstPercentage = useCustomPercentages ? customIgstPercentage : hotelSettings.igstPercentage;
      igst = includeIGST ? ((baseAmount + serviceCharge) * igstPercentage) / 100 : 0;
      console.log('🧮 IGST Calculation:', {
        baseAmount,
        serviceCharge,
        taxableAmount: baseAmount + serviceCharge,
        igstPercentage,
        igst
      });

    }

    const otherExpenses = parseFloat(String(formData.otherExpenses)) || 0;
    const total = baseAmount + serviceCharge + cgst + sgst + igst + otherExpenses;
    console.log('💰 FINAL CHARGES:', {
      baseAmount,
      serviceCharge,
      cgst,
      sgst,
      igst,
      totalGst: cgst + sgst + igst,
      otherExpenses,
      total,
      roomPrice: roomPriceEditable
    });
    return {
      baseAmount,
      serviceCharge,
      cgst,
      sgst,
      igst,
      totalGst: cgst + sgst + igst,
      otherExpenses,
      total,
      roomPrice: roomPriceEditable,
      includeServiceCharge,
      includeCGST,
      includeSGST,
      includeIGST,
      taxType,
      cgstPercentage,
      sgstPercentage,
      igstPercentage,
      serviceChargePercentage: servicePercentage,
      useCustomPercentages
    };
  };

  const charges = calculateCharges();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    // Basic validations
    if (!formData.customerName.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return false;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 10) {
      toast({ title: 'Valid phone number required (10 digits)', variant: 'destructive' });
      return false;
    }
    if (!formData.roomNumber.trim()) {
      toast({ title: 'Room number required', variant: 'destructive' });
      return false;
    }
    if (!formData.checkInDate || !formData.checkOutDate) {
      toast({ title: 'Check-in and check-out dates required', variant: 'destructive' });
      return false;
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    if (checkOut <= checkIn) {
      toast({
        title: 'Invalid Dates',
        description: 'Check-out date must be after check-in date',
        variant: 'destructive'
      });
      return false;
    }

    if (charges.total <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Total amount must be greater than 0',
        variant: 'destructive'
      });
      return false;
    }

    // GST Number validation (if provided)
    if (formData.customerGstNo && formData.customerGstNo.trim() !== '') {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.customerGstNo.trim())) {
        toast({
          title: 'Invalid GST Number',
          description: 'Please enter a valid 15-character GSTIN',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem('authToken');

  //     // First, get room_id from room number
  //     const roomsResponse = await fetch(`${NODE_BACKEND_URL}/rooms`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     const roomsData = await roomsResponse.json();
  //     const room = roomsData.data?.find((r: any) =>
  //       r.room_number?.toString() === formData.roomNumber.toString()
  //     );

  //     if (!room) {
  //       toast({
  //         title: 'Room Not Found',
  //         description: `Room ${formData.roomNumber} does not exist`,
  //         variant: 'destructive'
  //       });
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // Create booking with all fields matching BookingForm structure
  //     const bookingData = {
  //       room_id: room.id,
  //       customer_name: formData.customerName,
  //       customer_phone: formData.customerPhone,
  //       customer_email: formData.customerEmail || null,
  //       from_date: formData.checkInDate,
  //       to_date: formData.checkOutDate,
  //       from_time: formData.checkInTime,
  //       to_time: formData.checkOutTime,

  //       // Amount fields - MATCHING BOOKINGFORM STRUCTURE
  //       amount: charges.baseAmount,
  //       service: charges.serviceCharge,

  //       // Split tax fields - CRITICAL FOR DISPLAY
  //       cgst: charges.cgst,  // ← This will be non-zero when CGST is included
  //       sgst: charges.sgst,  // ← This will be non-zero when SGST is included
  //       igst: charges.igst,  // ← This will be non-zero when IGST is included
  //       gst: charges.totalGst, // Keep for backward compatibility

  //       // Total
  //       total: charges.total,

  //       // Status and booking details
  //       status: 'booked',
  //       guests: formData.guests,
  //       payment_method: 'cash',
  //       payment_status: 'completed',

  //       // Customer ID details
  //       id_type: formData.idType,
  //       id_number: formData.idNumber,

  //       // Address fields
  //       address: formData.address || null,
  //       city: formData.city || null,
  //       state: formData.state || null,
  //       pincode: formData.pincode || null,
  //       customer_gst_no: formData.customerGstNo || null,

  //       // Additional fields
  //       purpose_of_visit: formData.purposeOfVisit || null,
  //       other_expenses: charges.otherExpenses || 0,
  //       expense_description: formData.expenseDescription || null,
  //       referral_by: formData.referralBy || null,
  //       referral_amount: formData.referralAmount || 0,

  //       // Tax metadata
  //       tax_type: taxType,
  //       include_service_charge: includeServiceCharge,
  //       include_cgst: includeCGST,
  //       include_sgst: includeSGST,
  //       include_igst: includeIGST,
  //       gst_percentage: taxType === 'cgst_sgst' ?
  //         (charges.cgstPercentage + charges.sgstPercentage) :
  //         charges.igstPercentage,
  //       cgst_percentage: charges.cgstPercentage,
  //       sgst_percentage: charges.sgstPercentage,
  //       igst_percentage: charges.igstPercentage,
  //       service_charge_percentage: charges.serviceChargePercentage,
  //       use_custom_percentages: useCustomPercentages,
  //       nights: nights,
  //       room_price_per_night: roomPriceEditable
  //     };

  //     console.log('📤 Submitting previous booking with split taxes:', {
  //       ...bookingData,
  //       cgst: bookingData.cgst,
  //       sgst: bookingData.sgst,
  //       igst: bookingData.igst,
  //       total: bookingData.total
  //     });

  //     // Use the /past-booking endpoint which is designed for past bookings
  //     const response = await fetch(`${NODE_BACKEND_URL}/bookings/past-booking`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(bookingData)
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       toast({
  //         title: '✅ Previous Booking Added',
  //         description: `Booking for ${formData.customerName} has been recorded with tax details`,
  //         variant: 'default'
  //       });

  //       // Reset form to initial state
  //       setFormData({
  //         customerName: '',
  //         customerPhone: '',
  //         customerEmail: '',
  //         idNumber: '',
  //         idType: 'aadhaar',
  //         address: '',
  //         city: '',
  //         state: '',
  //         pincode: '',
  //         customerGstNo: '',
  //         roomNumber: '',
  //         guests: 1,
  //         checkInDate: '',
  //         checkInTime: '14:00',
  //         checkOutDate: '',
  //         checkOutTime: '12:00',
  //         purposeOfVisit: '',
  //         otherExpenses: 0,
  //         expenseDescription: '',
  //         referralBy: '',
  //         referralAmount: 0
  //       });
  //       setRoomPriceEditable(0);
  //       setUseCustomPercentages(false);
  //       setTaxType('cgst_sgst');
  //       setIncludeServiceCharge(true);
  //       setIncludeCGST(true);
  //       setIncludeSGST(true);
  //       setIncludeIGST(false);

  //       onSuccess();
  //       onClose();
  //     } else {
  //       throw new Error(result.message || 'Failed to create booking');
  //     }
  //   } catch (error: any) {
  //     console.error('Error creating previous booking:', error);
  //     toast({
  //       title: 'Error',
  //       description: error.message || 'Failed to create booking',
  //       variant: 'destructive'
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');

      console.log('📋 FORM DATA:', {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        roomNumber: formData.roomNumber,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        nights: nights
      });

      console.log('💰 CHARGES FROM CALCULATION:', {
        baseAmount: charges.baseAmount,
        serviceCharge: charges.serviceCharge,
        cgst: charges.cgst,
        sgst: charges.sgst,
        igst: charges.igst,
        totalGst: charges.totalGst,
        total: charges.total
      });

      // First, get room_id from room number
      const roomsResponse = await fetch(`${NODE_BACKEND_URL}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const roomsData = await roomsResponse.json();
      const room = roomsData.data?.find((r: any) =>
        r.room_number?.toString() === formData.roomNumber.toString()
      );

      if (!room) {
        toast({
          title: 'Room Not Found',
          description: `Room ${formData.roomNumber} does not exist`,
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Found room:', { id: room.id, number: room.room_number });

      // Create booking with all fields matching BookingForm structure
      const bookingData = {
        room_id: room.id,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail || null,
        from_date: formData.checkInDate,
        to_date: formData.checkOutDate,
        from_time: formData.checkInTime,
        to_time: formData.checkOutTime,

        // Amount fields
        amount: charges.baseAmount,
        service: charges.serviceCharge,

        // Split tax fields - THESE SHOULD BE NON-ZERO
        cgst: charges.cgst,
        sgst: charges.sgst,
        igst: charges.igst,
        gst: charges.totalGst, // Keep for backward compatibility

        // Total
        total: charges.total,

        // Status and booking details
        status: 'booked',
        guests: formData.guests,
        payment_method: 'cash',
        payment_status: 'completed',

        // Customer ID details
        id_type: formData.idType,
        id_number: formData.idNumber,

        // Address fields
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        customer_gst_no: formData.customerGstNo || null,

        // Additional fields
        purpose_of_visit: formData.purposeOfVisit || null,
        other_expenses: charges.otherExpenses || 0,
        expense_description: formData.expenseDescription || null,
        referral_by: formData.referralBy || null,
        referral_amount: formData.referralAmount || 0,

        // Tax metadata
        tax_type: taxType,
        include_service_charge: includeServiceCharge,
        include_cgst: includeCGST,
        include_sgst: includeSGST,
        include_igst: includeIGST,
        gst_percentage: taxType === 'cgst_sgst' ?
          (charges.cgstPercentage + charges.sgstPercentage) :
          charges.igstPercentage,
        cgst_percentage: charges.cgstPercentage,
        sgst_percentage: charges.sgstPercentage,
        igst_percentage: charges.igstPercentage,
        service_charge_percentage: charges.serviceChargePercentage,
        use_custom_percentages: useCustomPercentages,
        nights: nights,
        room_price_per_night: roomPriceEditable
      };

      console.log('📤 FINAL PAYLOAD TO SEND:', JSON.stringify(bookingData, null, 2));

      // Specifically log tax fields
      console.log('📊 TAX FIELDS BEING SENT:', {
        cgst: bookingData.cgst,
        sgst: bookingData.sgst,
        igst: bookingData.igst,
        gst: bookingData.gst,
        total: bookingData.total
      });

      const response = await fetch(`${NODE_BACKEND_URL}/bookings/past-booking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      console.log('📥 SERVER RESPONSE:', result);

      if (result.success) {
        toast({
          title: '✅ Previous Booking Added',
          description: `Booking for ${formData.customerName} has been recorded with tax details`,
          variant: 'default'
        });

        // Reset form...

        onSuccess();
        onClose();
      } else {
        throw new Error(result.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('❌ ERROR:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <span>Add Previous Booking</span>
            </div>
            <span className="text-sm font-normal text-amber-600 sm:ml-2 sm:border-l sm:border-amber-200 sm:pl-2">
              (For past dates - Includes tax details)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={e => handleChange('customerName', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={e => handleChange('customerPhone', e.target.value)}
                  placeholder="10-digit mobile number"
                  type="tel"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="customerEmail"
                  value={formData.customerEmail}
                  onChange={e => handleChange('customerEmail', e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idType">ID Type</Label>
                <select
                  id="idType"
                  value={formData.idType}
                  onChange={e => handleChange('idType', e.target.value as any)}
                  className="w-full h-10 px-3 text-sm border rounded-md bg-background"
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving">Driving License</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={e => handleChange('idNumber', e.target.value)}
                  placeholder="ID number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerGstNo" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Customer GST No
                </Label>
                <Input
                  id="customerGstNo"
                  value={formData.customerGstNo}
                  onChange={e => handleChange('customerGstNo', e.target.value)}
                  placeholder="GSTIN (e.g., 27AAACH1234M1Z5)"
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border rounded-lg p-6 border-blue-100 bg-blue-50/30">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Address Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Enter full address"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={e => handleChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={e => handleChange('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Room Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Room Number *
                </Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={e => handleChange('roomNumber', e.target.value)}
                  placeholder="e.g., 101, 202"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Number of Guests
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.guests}
                  onChange={e => handleChange('guests', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Date Information - PAST DATES ALLOWED */}
          <div className="border rounded-lg p-6 border-amber-200 bg-amber-50/30">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              Booking Dates (Past Dates Allowed)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Check-in Date *
                </Label>
                <Input
                  type="date"
                  id="checkInDate"
                  value={formData.checkInDate}
                  onChange={e => handleChange('checkInDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkInTime" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Check-in Time
                </Label>
                <Input
                  type="time"
                  id="checkInTime"
                  value={formData.checkInTime}
                  onChange={e => handleChange('checkInTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutDate" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Check-out Date *
                </Label>
                <Input
                  type="date"
                  id="checkOutDate"
                  value={formData.checkOutDate}
                  min={formData.checkInDate}
                  onChange={e => handleChange('checkOutDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutTime" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Check-out Time
                </Label>
                <Input
                  type="time"
                  id="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={e => handleChange('checkOutTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ========== PRICE CONFIGURATION SECTION ========== */}
          <Collapsible
            open={expandedSections.priceConfiguration}
            onOpenChange={() => toggleSection('priceConfiguration')}
            className="border rounded-lg p-4 md:p-6 space-y-4 bg-blue-50/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-lg">💰 Price Configuration</h4>
                <Badge variant="outline" className="text-xs bg-blue-100">
                  Customizable
                </Badge>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {expandedSections.priceConfiguration ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-4">
              {/* Room Price Editing */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="roomPrice" className="flex items-center gap-2 text-sm">
                    Room Price per Night (₹)
                  </Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1">
                      <Input
                        id="roomPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={roomPriceEditable}
                        onChange={(e) => setRoomPriceEditable(parseFloat(e.target.value) || 0)}
                        placeholder="Enter room price per night"
                        className="text-base md:text-lg font-medium w-full"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Base price: ₹{roomPriceEditable} × {nights} night(s) = ₹{charges.baseAmount.toFixed(2)}
                  </p>
                </div>

                {/* Tax Type Selection */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-medium">GST Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={taxType === 'cgst_sgst' ? "default" : "outline"}
                      onClick={() => setTaxType('cgst_sgst')}
                      className="h-auto py-2 px-2 text-xs sm:text-sm"
                    >
                      <div className="text-center">
                        <div className="font-medium">CGST+SGST</div>
                        <div className="text-[10px] sm:text-xs opacity-90">Local</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={taxType === 'igst' ? "default" : "outline"}
                      onClick={() => setTaxType('igst')}
                      className="h-auto py-2 px-2 text-xs sm:text-sm"
                    >
                      <div className="text-center">
                        <div className="font-medium">IGST</div>
                        <div className="text-[10px] sm:text-xs opacity-90">Outside</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Optional Charges */}
                <div className="space-y-3 pt-2">
                  {/* Service Charge */}
                  <div className="flex flex-col p-3 border rounded-lg bg-white">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5 pt-0.5">
                        <input
                          type="checkbox"
                          id="includeServiceCharge"
                          checked={includeServiceCharge}
                          onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="includeServiceCharge" className="font-medium text-sm cursor-pointer">
                          Service Charge
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Hotel service charge
                        </p>
                      </div>
                    </div>

                    {includeServiceCharge && (
                      <div className="mt-2 ml-7 space-y-2">
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                          <div className="flex items-center gap-2 w-full xs:w-auto">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={useCustomPercentages ? customServicePercentage : hotelSettings.serviceChargePercentage}
                              onChange={(e) => {
                                setUseCustomPercentages(true);
                                setCustomServicePercentage(parseFloat(e.target.value) || 0);
                              }}
                              className="w-20 text-sm"
                              placeholder="%"
                            />
                            <span className="text-sm">%</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUseCustomPercentages(false);
                              setCustomServicePercentage(hotelSettings.serviceChargePercentage);
                            }}
                            className="text-xs h-8 px-2"
                          >
                            Reset
                          </Button>
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          + ₹{charges.serviceCharge.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CGST + SGST Section */}
                  {taxType === 'cgst_sgst' && (
                    <>
                      {/* CGST */}
                      <div className="flex flex-col p-3 border rounded-lg bg-white">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center h-5 pt-0.5">
                            <input
                              type="checkbox"
                              id="includeCGST"
                              checked={includeCGST}
                              onChange={(e) => setIncludeCGST(e.target.checked)}
                              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="includeCGST" className="font-medium text-sm cursor-pointer">
                              CGST (Central)
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Central GST
                            </p>
                          </div>
                        </div>

                        {includeCGST && (
                          <div className="mt-2 ml-7 space-y-2">
                            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                              <div className="flex items-center gap-2 w-full xs:w-auto">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={useCustomPercentages ? customCgstPercentage : hotelSettings.cgstPercentage}
                                  onChange={(e) => {
                                    setUseCustomPercentages(true);
                                    setCustomCgstPercentage(parseFloat(e.target.value) || 0);
                                  }}
                                  className="w-20 text-sm"
                                  placeholder="%"
                                />
                                <span className="text-sm">%</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUseCustomPercentages(false);
                                  setCustomCgstPercentage(hotelSettings.cgstPercentage);
                                }}
                                className="text-xs h-8 px-2"
                              >
                                Reset
                              </Button>
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              + ₹{charges.cgst.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SGST */}
                      <div className="flex flex-col p-3 border rounded-lg bg-white">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center h-5 pt-0.5">
                            <input
                              type="checkbox"
                              id="includeSGST"
                              checked={includeSGST}
                              onChange={(e) => setIncludeSGST(e.target.checked)}
                              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="includeSGST" className="font-medium text-sm cursor-pointer">
                              SGST (State)
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              State GST
                            </p>
                          </div>
                        </div>

                        {includeSGST && (
                          <div className="mt-2 ml-7 space-y-2">
                            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                              <div className="flex items-center gap-2 w-full xs:w-auto">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={useCustomPercentages ? customSgstPercentage : hotelSettings.sgstPercentage}
                                  onChange={(e) => {
                                    setUseCustomPercentages(true);
                                    setCustomSgstPercentage(parseFloat(e.target.value) || 0);
                                  }}
                                  className="w-20 text-sm"
                                  placeholder="%"
                                />
                                <span className="text-sm">%</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUseCustomPercentages(false);
                                  setCustomSgstPercentage(hotelSettings.sgstPercentage);
                                }}
                                className="text-xs h-8 px-2"
                              >
                                Reset
                              </Button>
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              + ₹{charges.sgst.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* IGST Section */}
                  {taxType === 'igst' && (
                    <div className="flex flex-col p-3 border rounded-lg bg-white">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-5 pt-0.5">
                          <input
                            type="checkbox"
                            id="includeIGST"
                            checked={includeIGST}
                            onChange={(e) => setIncludeIGST(e.target.checked)}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="includeIGST" className="font-medium text-sm cursor-pointer">
                            IGST (Integrated)
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            For inter-state transactions
                          </p>
                        </div>
                      </div>

                      {includeIGST && (
                        <div className="mt-2 ml-7 space-y-2">
                          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                            <div className="flex items-center gap-2 w-full xs:w-auto">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={useCustomPercentages ? customIgstPercentage : hotelSettings.igstPercentage}
                                onChange={(e) => {
                                  setUseCustomPercentages(true);
                                  setCustomIgstPercentage(parseFloat(e.target.value) || 0);
                                }}
                                className="w-20 text-sm"
                                placeholder="%"
                              />
                              <span className="text-sm">%</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUseCustomPercentages(false);
                                setCustomIgstPercentage(hotelSettings.igstPercentage);
                              }}
                              className="text-xs h-8 px-2"
                            >
                              Reset
                            </Button>
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            + ₹{charges.igst.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col xs:flex-row gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIncludeServiceCharge(true);
                      if (taxType === 'cgst_sgst') {
                        setIncludeCGST(true);
                        setIncludeSGST(true);
                        setIncludeIGST(false);
                      } else {
                        setIncludeCGST(false);
                        setIncludeSGST(false);
                        setIncludeIGST(true);
                      }
                      setUseCustomPercentages(false);
                    }}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Include All (Default)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIncludeServiceCharge(false);
                      setIncludeCGST(false);
                      setIncludeSGST(false);
                      setIncludeIGST(false);
                    }}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Remove All
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ========== PRICE SUMMARY ========== */}
          <Collapsible
            open={expandedSections.priceSummary}
            onOpenChange={() => toggleSection('priceSummary')}
            className="border rounded-lg p-6 space-y-3 bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Price Summary</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {expandedSections.priceSummary ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-2">
              <div className="flex justify-between">
                <span>Room Price (₹{roomPriceEditable.toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'})</span>
                <span>₹{charges.baseAmount.toFixed(2)}</span>
              </div>

              {includeServiceCharge && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    Service Charge ({charges.serviceChargePercentage}%)
                  </span>
                  <span>₹{charges.serviceCharge.toFixed(2)}</span>
                </div>
              )}

              {/* Show CGST and SGST when taxType is cgst_sgst */}
              {taxType === 'cgst_sgst' && (
                <>
                  {includeCGST && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        CGST ({charges.cgstPercentage}%)
                      </span>
                      <span>₹{charges.cgst.toFixed(2)}</span>
                    </div>
                  )}

                  {includeSGST && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        SGST ({charges.sgstPercentage}%)
                      </span>
                      <span>₹{charges.sgst.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              {/* Show IGST when taxType is igst */}
              {taxType === 'igst' && includeIGST && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    IGST ({charges.igstPercentage}%)
                  </span>
                  <span>₹{charges.igst.toFixed(2)}</span>
                </div>
              )}

              {formData.otherExpenses > 0 && (
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="flex items-center gap-1">
                    Other Expenses
                    {formData.expenseDescription && (
                      <span className="text-xs text-muted-foreground">
                        ({formData.expenseDescription})
                      </span>
                    )}
                  </span>
                  <span className="text-blue-600 font-medium">+ ₹{formData.otherExpenses.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{charges.total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {!includeServiceCharge && !includeCGST && !includeSGST && !includeIGST && formData.otherExpenses === 0 ? "No additional charges" :
                    `Includes: ${includeServiceCharge ? 'Service Charge ' : ''}${includeCGST ? 'CGST ' : ''}${includeSGST ? 'SGST ' : ''}${includeIGST ? 'IGST' : ''}`}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Additional Details */}
          <div className="border rounded-lg p-6 border-green-100 bg-green-50/30">
            <h3 className="font-semibold text-lg mb-4 text-green-800">
              Additional Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
                <Textarea
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={e => handleChange('purposeOfVisit', e.target.value)}
                  placeholder="Enter purpose of visit"
                  className="min-h-[80px]"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="otherExpenses">Other Expenses (₹)</Label>
                  <Input
                    id="otherExpenses"
                    type="number"
                    value={formData.otherExpenses}
                    onChange={e => handleChange('otherExpenses', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenseDescription">Expense Description</Label>
                  <Input
                    id="expenseDescription"
                    value={formData.expenseDescription}
                    onChange={e => handleChange('expenseDescription', e.target.value)}
                    placeholder="e.g., Coffee, Snacks, Laundry"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referralBy">Referral By</Label>
                  <Input
                    id="referralBy"
                    value={formData.referralBy}
                    onChange={e => handleChange('referralBy', e.target.value)}
                    placeholder="Referral source"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralAmount">Referral Amount (₹)</Label>
                  <Input
                    id="referralAmount"
                    type="number"
                    value={formData.referralAmount}
                    onChange={e => handleChange('referralAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer:</p>
                <p className="font-medium">{formData.customerName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone:</p>
                <p className="font-medium">{formData.customerPhone || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room:</p>
                <p className="font-medium">{formData.roomNumber || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-in:</p>
                <p className="font-medium">
                  {formData.checkInDate} at {formData.checkInTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out:</p>
                <p className="font-medium">
                  {formData.checkOutDate} at {formData.checkOutTime}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Tax Breakdown:</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {taxType === 'cgst_sgst' ? (
                    <>
                      <div className="text-sm">
                        <span className="text-gray-500">CGST:</span>
                        <span className="font-medium ml-1 text-blue-600">₹{charges.cgst.toFixed(2)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">SGST:</span>
                        <span className="font-medium ml-1 text-blue-600">₹{charges.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm col-span-2">
                      <span className="text-gray-500">IGST:</span>
                      <span className="font-medium ml-1 text-purple-600">₹{charges.igst.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Total Amount:</p>
                <p className="font-bold text-2xl text-green-600">₹{charges.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Previous Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviousBookingForm;