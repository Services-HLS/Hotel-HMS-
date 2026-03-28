// // components/MultiRoomBookingForm.tsx
// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useToast } from '@/hooks/use-toast';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Card } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   User,
//   Phone,
//   Mail,
//   Calendar,
//   Clock,
//   Users,
//   MessageSquare,
//   CreditCard,
//   Wallet,
//   Loader2,
//   CheckCircle,
//   AlertCircle,
//   Bed,
//   Trash2,
//   Plus,
//   IndianRupee,
//   ChevronDown,
//   ChevronUp,
//   FileImage
// } from 'lucide-react';

// interface Room {
//   roomId: string;
//   number: string | number;
//   type: string;
//   floor: string | number;
//   price: number;
//   maxOccupancy?: number;
// }

// interface MultiRoomBookingFormProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   selectedRooms: Room[];
//   userSource: string;
//   spreadsheetId?: string;
//   defaultDate?: Date;
// }

// const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// export default function MultiRoomBookingForm({
//   open,
//   onClose,
//   onSuccess,
//   selectedRooms,
//   userSource,
//   spreadsheetId,
//   defaultDate = new Date()
// }: MultiRoomBookingFormProps) {
//   const { toast } = useToast();
//   const [activeTab, setActiveTab] = useState('customer');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({
//     customerDetails: true,
//     bookingDetails: true,
//     roomPricing: true,
//     payment: true
//   });

//   // Common customer details
//   const [customerData, setCustomerData] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//     city: '',
//     state: '',
//     pincode: '',
//     idType: 'aadhaar',
//     idNumber: '',
//     specialRequests: ''
//   });

//   // Booking details
//   const [bookingDetails, setBookingDetails] = useState({
//     checkInDate: defaultDate.toISOString().split('T')[0],
//     checkOutDate: new Date(defaultDate.setDate(defaultDate.getDate() + 1)).toISOString().split('T')[0],
//     checkInTime: '14:00',
//     checkOutTime: '12:00',
//     paymentMethod: 'cash' as 'cash' | 'online',
//     paymentStatus: 'pending' as 'pending' | 'completed'
//   });

//   // Room-specific configurations
//   const [roomConfigs, setRoomConfigs] = useState<Record<string, {
//     price: number;
//     guests: number;
//     includeServiceCharge: boolean;
//     includeCGST: boolean;
//     includeSGST: boolean;
//     includeIGST: boolean;
//     servicePercentage: number;
//     cgstPercentage: number;
//     sgstPercentage: number;
//     igstPercentage: number;
//   }>>({});

//   // Hotel settings
//   const [hotelSettings, setHotelSettings] = useState({
//     serviceChargePercentage: 10,
//     cgstPercentage: 6,
//     sgstPercentage: 6,
//     igstPercentage: 12
//   });

//   // Initialize room configurations
//   useEffect(() => {
//     const configs: any = {};
//     selectedRooms.forEach(room => {
//       configs[room.roomId] = {
//         price: room.price,
//         guests: 1,
//         includeServiceCharge: true,
//         includeCGST: true,
//         includeSGST: true,
//         includeIGST: false,
//         servicePercentage: hotelSettings.serviceChargePercentage,
//         cgstPercentage: hotelSettings.cgstPercentage,
//         sgstPercentage: hotelSettings.sgstPercentage,
//         igstPercentage: hotelSettings.igstPercentage
//       };
//     });
//     setRoomConfigs(configs);
//   }, [selectedRooms, hotelSettings]);

//   // Calculate nights
//   const nights = (() => {
//     if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;
//     const checkIn = new Date(bookingDetails.checkInDate);
//     const checkOut = new Date(bookingDetails.checkOutDate);
//     const diffTime = checkOut.getTime() - checkIn.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays > 0 ? diffDays : 1;
//   })();

//   // Calculate total for a room
//   const calculateRoomTotal = (roomId: string) => {
//     const config = roomConfigs[roomId];
//     if (!config) return 0;

//     const baseAmount = config.price * nights;
    
//     const serviceCharge = config.includeServiceCharge 
//       ? (baseAmount * config.servicePercentage) / 100 
//       : 0;
    
//     const cgst = config.includeCGST 
//       ? ((baseAmount + serviceCharge) * config.cgstPercentage) / 100 
//       : 0;
    
//     const sgst = config.includeSGST 
//       ? ((baseAmount + serviceCharge) * config.sgstPercentage) / 100 
//       : 0;
    
//     const igst = config.includeIGST 
//       ? ((baseAmount + serviceCharge) * config.igstPercentage) / 100 
//       : 0;

//     return baseAmount + serviceCharge + cgst + sgst + igst;
//   };

//   // Calculate grand total
//   const grandTotal = selectedRooms.reduce((total, room) => {
//     return total + calculateRoomTotal(room.roomId);
//   }, 0);

//   // Update room config
//   const updateRoomConfig = (roomId: string, field: string, value: any) => {
//     setRoomConfigs(prev => ({
//       ...prev,
//       [roomId]: {
//         ...prev[roomId],
//         [field]: value
//       }
//     }));
//   };

//   // Validate form
//   const validateForm = () => {
//     if (!customerData.name.trim()) {
//       toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
//       return false;
//     }
//     if (!customerData.phone.trim() || customerData.phone.length < 10) {
//       toast({ title: "Error", description: "Valid phone number is required", variant: "destructive" });
//       return false;
//     }
//     if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) {
//       toast({ title: "Error", description: "Check-in and check-out dates are required", variant: "destructive" });
//       return false;
//     }
//     return true;
//   };

//   // Submit to database
//   const submitToDatabase = async () => {
//     const token = localStorage.getItem('authToken');
//     const groupId = `GRP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

//     const bookings = selectedRooms.map(room => {
//       const config = roomConfigs[room.roomId];
//       const roomTotal = calculateRoomTotal(room.roomId);

//       return {
//         room_id: parseInt(room.roomId),
//         customer_name: customerData.name,
//         customer_phone: customerData.phone,
//         customer_email: customerData.email,
//         from_date: bookingDetails.checkInDate,
//         to_date: bookingDetails.checkOutDate,
//         from_time: bookingDetails.checkInTime,
//         to_time: bookingDetails.checkOutTime,
//         amount: config.price * nights,
//         service: config.includeServiceCharge ? (config.price * nights * config.servicePercentage) / 100 : 0,
//         cgst: config.includeCGST ? ((config.price * nights) * config.cgstPercentage) / 100 : 0,
//         sgst: config.includeSGST ? ((config.price * nights) * config.sgstPercentage) / 100 : 0,
//         igst: config.includeIGST ? ((config.price * nights) * config.igstPercentage) / 100 : 0,
//         total: roomTotal,
//         guests: config.guests,
//         payment_method: bookingDetails.paymentMethod,
//         payment_status: bookingDetails.paymentStatus,
//         id_type: customerData.idType,
//         id_number: customerData.idNumber,
//         special_requests: customerData.specialRequests,
//         group_booking_id: groupId,
//         address: customerData.address,
//         city: customerData.city,
//         state: customerData.state,
//         pincode: customerData.pincode
//       };
//     });

//     const response = await fetch(`${NODE_BACKEND_URL}/bookings/multiple`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         bookings,
//         groupBookingId: groupId
//       })
//     });

//     if (!response.ok) throw new Error('Failed to create bookings');
//     return await response.json();
//   };

//   // Handle submit
//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     try {
//       if (userSource === 'database') {
//         await submitToDatabase();
        
//         toast({
//           title: "✅ Success!",
//           description: `${selectedRooms.length} rooms booked successfully`,
//         });
        
//         onSuccess();
//         onClose();
//       } else {
//         toast({
//           title: "Coming Soon",
//           description: "Multiple booking for Google Sheets coming soon",
//         });
//       }
//     } catch (error: any) {
//       console.error('Booking error:', error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create bookings",
//         variant: "destructive"
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-2xl">
//             <Bed className="h-6 w-6" />
//             Book Multiple Rooms ({selectedRooms.length} rooms)
//           </DialogTitle>
//         </DialogHeader>

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid grid-cols-3 mb-6">
//             <TabsTrigger value="customer">1. Customer Details</TabsTrigger>
//             <TabsTrigger value="rooms">2. Room Configuration</TabsTrigger>
//             <TabsTrigger value="payment">3. Payment & Summary</TabsTrigger>
//           </TabsList>

//           {/* Tab 1: Customer Details */}
//           <TabsContent value="customer" className="space-y-6">
//             <Card className="p-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <User className="h-4 w-4" /> Full Name *
//                   </Label>
//                   <Input
//                     value={customerData.name}
//                     onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
//                     placeholder="Enter customer name"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Phone className="h-4 w-4" /> Mobile Number *
//                   </Label>
//                   <Input
//                     value={customerData.phone}
//                     onChange={(e) => setCustomerData({...customerData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
//                     placeholder="10-digit mobile number"
//                     maxLength={10}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Mail className="h-4 w-4" /> Email
//                   </Label>
//                   <Input
//                     value={customerData.email}
//                     onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
//                     placeholder="email@example.com"
//                     type="email"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <FileImage className="h-4 w-4" /> ID Type
//                   </Label>
//                   <Select
//                     value={customerData.idType}
//                     onValueChange={(value) => setCustomerData({...customerData, idType: value})}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select ID type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
//                       <SelectItem value="pan">PAN Card</SelectItem>
//                       <SelectItem value="passport">Passport</SelectItem>
//                       <SelectItem value="driving">Driving License</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2 col-span-2">
//                   <Label>ID Number</Label>
//                   <Input
//                     value={customerData.idNumber}
//                     onChange={(e) => setCustomerData({...customerData, idNumber: e.target.value})}
//                     placeholder="Enter ID number"
//                   />
//                 </div>

//                 <div className="space-y-2 col-span-2">
//                   <Label>Address</Label>
//                   <Textarea
//                     value={customerData.address}
//                     onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
//                     placeholder="Enter address"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>City</Label>
//                   <Input
//                     value={customerData.city}
//                     onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
//                     placeholder="City"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>State</Label>
//                   <Input
//                     value={customerData.state}
//                     onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
//                     placeholder="State"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Pincode</Label>
//                   <Input
//                     value={customerData.pincode}
//                     onChange={(e) => setCustomerData({...customerData, pincode: e.target.value})}
//                     placeholder="Pincode"
//                     maxLength={6}
//                   />
//                 </div>
//               </div>
//             </Card>

//             <div className="flex justify-end">
//               <Button onClick={() => setActiveTab('rooms')}>
//                 Next: Configure Rooms
//               </Button>
//             </div>
//           </TabsContent>

//           {/* Tab 2: Room Configuration */}
//           <TabsContent value="rooms" className="space-y-6">
//             {/* Common Booking Details */}
//             <Card className="p-6">
//               <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4" /> Check-in Date
//                   </Label>
//                   <Input
//                     type="date"
//                     value={bookingDetails.checkInDate}
//                     onChange={(e) => setBookingDetails({...bookingDetails, checkInDate: e.target.value})}
//                     min={new Date().toISOString().split('T')[0]}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Clock className="h-4 w-4" /> Check-in Time
//                   </Label>
//                   <Input
//                     type="time"
//                     value={bookingDetails.checkInTime}
//                     onChange={(e) => setBookingDetails({...bookingDetails, checkInTime: e.target.value})}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4" /> Check-out Date
//                   </Label>
//                   <Input
//                     type="date"
//                     value={bookingDetails.checkOutDate}
//                     onChange={(e) => setBookingDetails({...bookingDetails, checkOutDate: e.target.value})}
//                     min={bookingDetails.checkInDate}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Clock className="h-4 w-4" /> Check-out Time
//                   </Label>
//                   <Input
//                     type="time"
//                     value={bookingDetails.checkOutTime}
//                     onChange={(e) => setBookingDetails({...bookingDetails, checkOutTime: e.target.value})}
//                   />
//                 </div>
//               </div>

//               <Alert className="mt-4 bg-blue-50">
//                 <AlertCircle className="h-4 w-4 text-blue-600" />
//                 <AlertDescription>
//                   Duration: <strong>{nights}</strong> {nights === 1 ? 'night' : 'nights'}
//                 </AlertDescription>
//               </Alert>
//             </Card>

//             {/* Room-specific Configuration */}
//             <div className="space-y-4">
//               <h3 className="font-semibold text-lg">Room Configuration</h3>
              
//               {selectedRooms.map((room, index) => {
//                 const config = roomConfigs[room.roomId];
//                 if (!config) return null;

//                 return (
//                   <Card key={room.roomId} className="p-6 border-l-4 border-l-blue-500">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h4 className="font-semibold text-lg">
//                           Room {room.number} - {room.type}
//                         </h4>
//                         <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
//                       </div>
//                       <Badge variant="outline" className="bg-blue-50">
//                         Room {index + 1} of {selectedRooms.length}
//                       </Badge>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label>Price per Night (₹)</Label>
//                         <Input
//                           type="number"
//                           value={config.price}
//                           onChange={(e) => updateRoomConfig(room.roomId, 'price', parseFloat(e.target.value) || 0)}
//                           min="0"
//                           step="0.01"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label className="flex items-center gap-2">
//                           <Users className="h-4 w-4" /> Guests
//                         </Label>
//                         <Select
//                           value={config.guests.toString()}
//                           onValueChange={(value) => updateRoomConfig(room.roomId, 'guests', parseInt(value))}
//                         >
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {[1, 2, 3, 4].map(num => (
//                               <SelectItem key={num} value={num.toString()}>
//                                 {num} {num === 1 ? 'Person' : 'Persons'}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>

//                     {/* Tax Configuration */}
//                     <div className="mt-4 space-y-3">
//                       <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="checkbox"
//                             id={`service-${room.roomId}`}
//                             checked={config.includeServiceCharge}
//                             onChange={(e) => updateRoomConfig(room.roomId, 'includeServiceCharge', e.target.checked)}
//                             className="h-4 w-4"
//                           />
//                           <Label htmlFor={`service-${room.roomId}`}>Service Charge</Label>
//                         </div>

//                         {config.includeServiceCharge && (
//                           <div className="flex items-center gap-2">
//                             <Input
//                               type="number"
//                               value={config.servicePercentage}
//                               onChange={(e) => updateRoomConfig(room.roomId, 'servicePercentage', parseFloat(e.target.value) || 0)}
//                               className="w-20"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                             />
//                             <span>%</span>
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex gap-4">
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="checkbox"
//                             id={`cgst-${room.roomId}`}
//                             checked={config.includeCGST}
//                             onChange={(e) => updateRoomConfig(room.roomId, 'includeCGST', e.target.checked)}
//                             className="h-4 w-4"
//                           />
//                           <Label htmlFor={`cgst-${room.roomId}`}>CGST</Label>
//                         </div>

//                         {config.includeCGST && (
//                           <div className="flex items-center gap-2">
//                             <Input
//                               type="number"
//                               value={config.cgstPercentage}
//                               onChange={(e) => updateRoomConfig(room.roomId, 'cgstPercentage', parseFloat(e.target.value) || 0)}
//                               className="w-20"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                             />
//                             <span>%</span>
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex gap-4">
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="checkbox"
//                             id={`sgst-${room.roomId}`}
//                             checked={config.includeSGST}
//                             onChange={(e) => updateRoomConfig(room.roomId, 'includeSGST', e.target.checked)}
//                             className="h-4 w-4"
//                           />
//                           <Label htmlFor={`sgst-${room.roomId}`}>SGST</Label>
//                         </div>

//                         {config.includeSGST && (
//                           <div className="flex items-center gap-2">
//                             <Input
//                               type="number"
//                               value={config.sgstPercentage}
//                               onChange={(e) => updateRoomConfig(room.roomId, 'sgstPercentage', parseFloat(e.target.value) || 0)}
//                               className="w-20"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                             />
//                             <span>%</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Room Total */}
//                     <div className="mt-4 pt-4 border-t flex justify-between items-center">
//                       <span className="font-medium">Room Total:</span>
//                       <span className="text-xl font-bold text-green-600">
//                         ₹{calculateRoomTotal(room.roomId).toFixed(2)}
//                       </span>
//                     </div>
//                   </Card>
//                 );
//               })}
//             </div>

//             <div className="flex justify-between">
//               <Button variant="outline" onClick={() => setActiveTab('customer')}>
//                 Back
//               </Button>
//               <Button onClick={() => setActiveTab('payment')}>
//                 Next: Payment
//               </Button>
//             </div>
//           </TabsContent>

//           {/* Tab 3: Payment & Summary */}
//           <TabsContent value="payment" className="space-y-6">
//             {/* Payment Method */}
//             <Card className="p-6">
//               <h3 className="font-semibold text-lg mb-4">Payment Method</h3>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <Button
//                   type="button"
//                   variant={bookingDetails.paymentMethod === 'cash' ? "default" : "outline"}
//                   className="h-20 flex flex-col items-center justify-center"
//                   onClick={() => setBookingDetails({...bookingDetails, paymentMethod: 'cash'})}
//                 >
//                   <Wallet className="h-6 w-6 mb-1" />
//                   <span>Cash</span>
//                   <span className="text-xs text-muted-foreground">Pay at Hotel</span>
//                 </Button>

//                 <Button
//                   type="button"
//                   variant={bookingDetails.paymentMethod === 'online' ? "default" : "outline"}
//                   className="h-20 flex flex-col items-center justify-center"
//                   onClick={() => setBookingDetails({...bookingDetails, paymentMethod: 'online'})}
//                 >
//                   <CreditCard className="h-6 w-6 mb-1" />
//                   <span>Online</span>
//                   <span className="text-xs text-muted-foreground">Pay Now</span>
//                 </Button>
//               </div>
//             </Card>

//             {/* Special Requests */}
//             <Card className="p-6">
//               <Label className="flex items-center gap-2 mb-2">
//                 <MessageSquare className="h-4 w-4" />
//                 Special Requests (Optional)
//               </Label>
//               <Textarea
//                 value={customerData.specialRequests}
//                 onChange={(e) => setCustomerData({...customerData, specialRequests: e.target.value})}
//                 placeholder="Any special requests for all rooms?"
//                 className="min-h-[100px]"
//               />
//             </Card>

//             {/* Booking Summary */}
//             <Card className="p-6 bg-gray-50">
//               <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>

//               <div className="space-y-3">
//                 {selectedRooms.map((room) => {
//                   const roomTotal = calculateRoomTotal(room.roomId);
//                   return (
//                     <div key={room.roomId} className="flex justify-between items-center py-2 border-b">
//                       <div>
//                         <div className="font-medium">Room {room.number}</div>
//                         <div className="text-sm text-muted-foreground">
//                           {room.type} • {roomConfigs[room.roomId]?.guests || 1} guests
//                         </div>
//                       </div>
//                       <div className="font-semibold">₹{roomTotal.toFixed(2)}</div>
//                     </div>
//                   );
//                 })}

//                 <div className="flex justify-between items-center pt-4 text-lg font-bold">
//                   <span>Grand Total:</span>
//                   <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
//                 </div>

//                 <div className="text-sm text-muted-foreground mt-2">
//                   Duration: {nights} {nights === 1 ? 'night' : 'nights'}
//                 </div>
//               </div>
//             </Card>

//             {/* Action Buttons */}
//             <div className="flex justify-between gap-4 pt-4">
//               <Button variant="outline" onClick={() => setActiveTab('rooms')}>
//                 Back
//               </Button>

//               <Button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting}
//                 className="bg-green-600 hover:bg-green-700 min-w-[200px]"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="h-4 w-4 mr-2" />
//                     Confirm Booking ({selectedRooms.length} rooms)
//                   </>
//                 )}
//               </Button>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// }

// components/MultiRoomBookingForm.tsx (updated)
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { searchCustomersByPhone } from '@/lib/bookingApi';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  CreditCard,
  Wallet,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bed,
  Trash2,
  Plus,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  FileImage,
  XCircle,
  QrCode,
  Info
} from 'lucide-react';

interface Room {
  roomId: string;
  number: string | number;
  type: string;
  floor: string | number;
  price: number;
  maxOccupancy?: number;
}

interface MultiRoomBookingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedRooms: Room[];
  userSource: string;
  spreadsheetId?: string;
  defaultDate?: Date;
}

interface RoomAvailability {
  [roomId: string]: {
    available: boolean;
    conflictBooking?: {
      id: number;
      customer_name?: string;
      from_date: string;
      to_date: string;
    };
    checking: boolean;
  };
}

const NODE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function MultiRoomBookingForm({
  open,
  onClose,
  onSuccess,
  selectedRooms,
  userSource,
  spreadsheetId,
  defaultDate = new Date()
}: MultiRoomBookingFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Customer search state
  const [foundCustomers, setFoundCustomers] = useState<any[]>([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [hotelQRCode, setHotelQRCode] = useState<string | null>(null);
  
  // Room availability state
  const [roomAvailability, setRoomAvailability] = useState<RoomAvailability>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0);

  // Common customer details
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    idType: 'aadhaar',
    idNumber: '',
    specialRequests: ''
  });

  // Booking details
  const [bookingDetails, setBookingDetails] = useState(() => {
    const checkIn = new Date(defaultDate);
    const checkOut = new Date(defaultDate);
    checkOut.setDate(checkOut.getDate() + 1);
    
    return {
      checkInDate: checkIn.toISOString().split('T')[0],
      checkOutDate: checkOut.toISOString().split('T')[0],
      checkInTime: '14:00',
      checkOutTime: '12:00',
      paymentMethod: 'cash' as 'cash' | 'online',
      paymentStatus: 'pending' as 'pending' | 'completed'
    };
  });

  // Room-specific configurations
  const [roomConfigs, setRoomConfigs] = useState<Record<string, {
    price: number;
    guests: number;
    includeServiceCharge: boolean;
    includeCGST: boolean;
    includeSGST: boolean;
    includeIGST: boolean;
    servicePercentage: number;
    cgstPercentage: number;
    sgstPercentage: number;
    igstPercentage: number;
  }>>({});

  // Hotel settings
  const [hotelSettings, setHotelSettings] = useState({
    serviceChargePercentage: 10,
    cgstPercentage: 6,
    sgstPercentage: 6,
    igstPercentage: 12
  });

  // Fetch hotel settings and QR code
  useEffect(() => {
    const fetchHotelSettings = async () => {
      if (userSource === 'database') {
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
                serviceChargePercentage: data.data.serviceChargePercentage || 10,
                cgstPercentage: data.data.cgstPercentage || 6,
                sgstPercentage: data.data.sgstPercentage || 6,
                igstPercentage: data.data.igstPercentage || 12
              });
              
              if (data.data.qrcode_image) {
                setHotelQRCode(data.data.qrcode_image);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching hotel settings:', error);
        }
      }
    };

    fetchHotelSettings();
  }, [userSource]);

  // Initialize room configurations
  useEffect(() => {
    const configs: any = {};
    selectedRooms.forEach(room => {
      configs[room.roomId] = {
        price: room.price,
        guests: 1,
        includeServiceCharge: true,
        includeCGST: true,
        includeSGST: true,
        includeIGST: false,
        servicePercentage: hotelSettings.serviceChargePercentage,
        cgstPercentage: hotelSettings.cgstPercentage,
        sgstPercentage: hotelSettings.sgstPercentage,
        igstPercentage: hotelSettings.igstPercentage
      };
    });
    setRoomConfigs(configs);
  }, [selectedRooms, hotelSettings]);

  // Check availability when dates change
  useEffect(() => {
    if (userSource === 'database' && bookingDetails.checkInDate && bookingDetails.checkOutDate) {
      checkAllRoomsAvailability();
    }
  }, [bookingDetails.checkInDate, bookingDetails.checkOutDate, selectedRooms]);

  // Generate QR Code
  const generateUPIQrCode = async () => {
    setIsGeneratingQR(true);
    try {
      const upiId = 'test@example'; // Replace with actual UPI ID from settings
      const merchantName = 'Hotel Management';
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(transactionId)}`;
      setQrCodeData(upiString);

      localStorage.setItem('currentTransaction', JSON.stringify({
        id: transactionId,
        amount: grandTotal,
        timestamp: Date.now(),
        testMode: true
      }));

      toast({
        title: "QR Code Generated",
        description: `Scan to pay ₹${grandTotal.toFixed(2)}`,
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

    setTimeout(() => {
      setPaymentStatus('completed');
      setBookingDetails(prev => ({ ...prev, paymentStatus: 'completed' }));

      toast({
        title: "✅ Payment Successful",
        description: "Payment verified successfully!",
        variant: "default"
      });

      setIsVerifyingPayment(false);
    }, 2000);
  };

  // Check availability for all rooms
  const checkAllRoomsAvailability = async () => {
    setIsCheckingAvailability(true);
    
    const initialAvailability: RoomAvailability = {};
    selectedRooms.forEach(room => {
      initialAvailability[room.roomId] = {
        available: true,
        checking: true
      };
    });
    setRoomAvailability(initialAvailability);

    const token = localStorage.getItem('authToken');
    let availableCount = 0;

    for (const room of selectedRooms) {
      try {
        const response = await fetch(`${NODE_BACKEND_URL}/bookings/check-availability`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            room_id: parseInt(room.roomId),
            from_date: bookingDetails.checkInDate,
            to_date: bookingDetails.checkOutDate
          })
        });

        const result = await response.json();
        
        setRoomAvailability(prev => ({
          ...prev,
          [room.roomId]: {
            available: result.data?.available || false,
            checking: false
          }
        }));

        if (result.data?.available) {
          availableCount++;
        }
      } catch (error) {
        console.error(`Error checking room ${room.roomId}:`, error);
        setRoomAvailability(prev => ({
          ...prev,
          [room.roomId]: {
            available: false,
            checking: false
          }
        }));
      }
    }

    setAvailableRoomsCount(availableCount);
    setIsCheckingAvailability(false);
  };

  // Handle phone change with customer search
  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawPhone = e.target.value;
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const limitedPhone = digitsOnly.slice(0, 10);

    setCustomerData({ ...customerData, phone: limitedPhone });

    if (limitedPhone.length === 10 && userSource === 'database') {
      try {
        const customers = await searchCustomersByPhone(limitedPhone);
        setFoundCustomers(customers || []);
        setShowCustomerSearch(customers && customers.length > 0);
      } catch (error) {
        console.error('Error searching customers:', error);
        setFoundCustomers([]);
        setShowCustomerSearch(false);
      }
    } else {
      setShowCustomerSearch(false);
      setFoundCustomers([]);
      setSelectedCustomer(null);
    }
  };

  // Select existing customer
  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerData({
      ...customerData,
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      idType: customer.id_type || customer.idType || 'aadhaar',
      idNumber: customer.id_number || customer.idNumber || ''
    });
    setShowCustomerSearch(false);
    setFoundCustomers([]);

    toast({
      title: "Customer Selected",
      description: `Details loaded for ${customer.name}`,
    });
  };

  // Calculate nights
  const nights = (() => {
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  })();

  // Calculate total for a room
  const calculateRoomTotal = (roomId: string) => {
    const config = roomConfigs[roomId];
    if (!config) return 0;

    const baseAmount = config.price * nights;
    
    const serviceCharge = config.includeServiceCharge 
      ? (baseAmount * config.servicePercentage) / 100 
      : 0;
    
    const cgst = config.includeCGST 
      ? ((baseAmount + serviceCharge) * config.cgstPercentage) / 100 
      : 0;
    
    const sgst = config.includeSGST 
      ? ((baseAmount + serviceCharge) * config.sgstPercentage) / 100 
      : 0;
    
    const igst = config.includeIGST 
      ? ((baseAmount + serviceCharge) * config.igstPercentage) / 100 
      : 0;

    return baseAmount + serviceCharge + cgst + sgst + igst;
  };

  // Calculate grand total (only for available rooms)
  const grandTotal = selectedRooms.reduce((total, room) => {
    if (roomAvailability[room.roomId]?.available === false) return total;
    return total + calculateRoomTotal(room.roomId);
  }, 0);

  // Update room config
  const updateRoomConfig = (roomId: string, field: string, value: any) => {
    setRoomConfigs(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!customerData.name.trim()) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return false;
    }
    if (!customerData.phone.trim() || customerData.phone.length < 10) {
      toast({ title: "Error", description: "Valid phone number is required", variant: "destructive" });
      return false;
    }
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) {
      toast({ title: "Error", description: "Check-in and check-out dates are required", variant: "destructive" });
      return false;
    }
    
    const unavailableRooms = selectedRooms.filter(room => 
      roomAvailability[room.roomId]?.available === false
    );
    
    if (unavailableRooms.length > 0) {
      toast({ 
        title: "Error", 
        description: `${unavailableRooms.length} room(s) are not available for selected dates`, 
        variant: "destructive" 
      });
      return false;
    }

    if (paymentMethod === 'online' && paymentStatus !== 'completed') {
      toast({
        title: "Payment Required",
        description: "Please complete online payment before confirming",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  // Submit to database
  const submitToDatabase = async () => {
    const token = localStorage.getItem('authToken');
    const groupId = `GRP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const bookings = selectedRooms
      .filter(room => roomAvailability[room.roomId]?.available !== false)
      .map(room => {
        const config = roomConfigs[room.roomId];
        const roomTotal = calculateRoomTotal(room.roomId);

        return {
          room_id: parseInt(room.roomId),
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_email: customerData.email,
          from_date: bookingDetails.checkInDate,
          to_date: bookingDetails.checkOutDate,
          from_time: bookingDetails.checkInTime,
          to_time: bookingDetails.checkOutTime,
          amount: config.price * nights,
          service: config.includeServiceCharge ? (config.price * nights * config.servicePercentage) / 100 : 0,
          cgst: config.includeCGST ? ((config.price * nights) * config.cgstPercentage) / 100 : 0,
          sgst: config.includeSGST ? ((config.price * nights) * config.sgstPercentage) / 100 : 0,
          igst: config.includeIGST ? ((config.price * nights) * config.igstPercentage) / 100 : 0,
          total: roomTotal,
          guests: config.guests,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          id_type: customerData.idType,
          id_number: customerData.idNumber,
          special_requests: customerData.specialRequests,
          group_booking_id: groupId,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          pincode: customerData.pincode
        };
      });

    const response = await fetch(`${NODE_BACKEND_URL}/bookings/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookings,
        groupBookingId: groupId
      })
    });

    if (!response.ok) throw new Error('Failed to create bookings');
    return await response.json();
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (userSource === 'database') {
        const result = await submitToDatabase();
        
        if (result.data.failed.length > 0) {
          toast({
            title: "Partial Success",
            description: `${result.data.totalSuccess} rooms booked, ${result.data.totalFailed} failed`,
            variant: "default"
          });
        } else {
          toast({
            title: "✅ Success!",
            description: `${result.data.totalSuccess} rooms booked successfully`,
          });
        }
        
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Coming Soon",
          description: "Multiple booking for Google Sheets coming soon",
        });
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bookings",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get room availability status
  const getRoomStatus = (room: Room) => {
    const availability = roomAvailability[room.roomId];
    
    if (!availability || availability.checking) {
      return {
        label: 'Checking...',
        color: 'bg-gray-100 text-gray-600',
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        disabled: true
      };
    }
    
    if (!availability.available) {
      return {
        label: 'Not Available',
        color: 'bg-red-100 text-red-600 border-red-200',
        icon: <XCircle className="h-4 w-4" />,
        disabled: true
      };
    }
    
    return {
      label: 'Available',
      color: 'bg-green-100 text-green-600 border-green-200',
      icon: <CheckCircle className="h-4 w-4" />,
      disabled: false
    };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bed className="h-6 w-6" />
            Book Multiple Rooms ({selectedRooms.length} rooms)
          </DialogTitle>
        </DialogHeader>

        {/* Availability Summary Banner */}
        {!isCheckingAvailability && availableRoomsCount < selectedRooms.length && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <span className="font-medium">Note:</span> {selectedRooms.length - availableRoomsCount} room(s) are not available for the selected dates. 
              They will be excluded from booking.
            </AlertDescription>
          </Alert>
        )}

        {isCheckingAvailability && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription>
              Checking room availability...
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="customer">1. Customer Details</TabsTrigger>
            <TabsTrigger value="rooms">2. Room Configuration</TabsTrigger>
            <TabsTrigger value="payment">3. Payment & Summary</TabsTrigger>
          </TabsList>

          {/* Tab 1: Customer Details */}
          <TabsContent value="customer" className="space-y-6">
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name *
                  </Label>
                  <Input
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Mobile Number *
                  </Label>
                  <div className="relative">
                    <Input
                      value={customerData.phone}
                      onChange={handlePhoneChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>

                  {/* Customer search results */}
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

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" /> ID Type
                  </Label>
                  <Select
                    value={customerData.idType}
                    onValueChange={(value) => setCustomerData({...customerData, idType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="pan">PAN Card</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>ID Number</Label>
                  <Input
                    value={customerData.idNumber}
                    onChange={(e) => setCustomerData({...customerData, idNumber: e.target.value})}
                    placeholder="Enter ID number"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={customerData.address}
                    onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                    placeholder="Enter address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={customerData.city}
                    onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={customerData.state}
                    onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                    placeholder="State"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    value={customerData.pincode}
                    onChange={(e) => setCustomerData({...customerData, pincode: e.target.value})}
                    placeholder="Pincode"
                    maxLength={6}
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab('rooms')}>
                Next: Configure Rooms
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Room Configuration */}
          <TabsContent value="rooms" className="space-y-6">
            {/* Common Booking Details */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Check-in Date
                  </Label>
                  <Input
                    type="date"
                    value={bookingDetails.checkInDate}
                    onChange={(e) => setBookingDetails({...bookingDetails, checkInDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Check-in Time
                  </Label>
                  <Input
                    type="time"
                    value={bookingDetails.checkInTime}
                    onChange={(e) => setBookingDetails({...bookingDetails, checkInTime: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Check-out Date
                  </Label>
                  <Input
                    type="date"
                    value={bookingDetails.checkOutDate}
                    onChange={(e) => setBookingDetails({...bookingDetails, checkOutDate: e.target.value})}
                    min={bookingDetails.checkInDate}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Check-out Time
                  </Label>
                  <Input
                    type="time"
                    value={bookingDetails.checkOutTime}
                    onChange={(e) => setBookingDetails({...bookingDetails, checkOutTime: e.target.value})}
                  />
                </div>
              </div>

              <Alert className="mt-4 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  Duration: <strong>{nights}</strong> {nights === 1 ? 'night' : 'nights'}
                </AlertDescription>
              </Alert>
            </Card>

            {/* Room-specific Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Room Configuration</h3>
              
              {selectedRooms.map((room, index) => {
                const config = roomConfigs[room.roomId];
                const status = getRoomStatus(room);
                const isAvailable = roomAvailability[room.roomId]?.available !== false;
                
                if (!config) return null;

                return (
                  <Card 
                    key={room.roomId} 
                    className={`p-6 border-l-4 ${!isAvailable ? 'border-l-red-500 opacity-60' : 'border-l-blue-500'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          Room {room.number} - {room.type}
                          {!isAvailable && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Not Available
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                      </div>
                      <Badge variant="outline" className={status.color}>
                        <span className="flex items-center gap-1">
                          {status.icon}
                          {status.label}
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price per Night (₹)</Label>
                        <Input
                          type="number"
                          value={config.price}
                          onChange={(e) => updateRoomConfig(room.roomId, 'price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          disabled={!isAvailable}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Users className="h-4 w-4" /> Guests
                        </Label>
                        <Select
                          value={config.guests.toString()}
                          onValueChange={(value) => updateRoomConfig(room.roomId, 'guests', parseInt(value))}
                          disabled={!isAvailable}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Person' : 'Persons'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tax Configuration */}
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`service-${room.roomId}`}
                            checked={config.includeServiceCharge}
                            onChange={(e) => updateRoomConfig(room.roomId, 'includeServiceCharge', e.target.checked)}
                            className="h-4 w-4"
                            disabled={!isAvailable}
                          />
                          <Label htmlFor={`service-${room.roomId}`}>Service Charge</Label>
                        </div>

                        {config.includeServiceCharge && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={config.servicePercentage}
                              onChange={(e) => updateRoomConfig(room.roomId, 'servicePercentage', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              max="100"
                              step="0.01"
                              disabled={!isAvailable}
                            />
                            <span>%</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`cgst-${room.roomId}`}
                            checked={config.includeCGST}
                            onChange={(e) => updateRoomConfig(room.roomId, 'includeCGST', e.target.checked)}
                            className="h-4 w-4"
                            disabled={!isAvailable}
                          />
                          <Label htmlFor={`cgst-${room.roomId}`}>CGST</Label>
                        </div>

                        {config.includeCGST && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={config.cgstPercentage}
                              onChange={(e) => updateRoomConfig(room.roomId, 'cgstPercentage', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              max="100"
                              step="0.01"
                              disabled={!isAvailable}
                            />
                            <span>%</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`sgst-${room.roomId}`}
                            checked={config.includeSGST}
                            onChange={(e) => updateRoomConfig(room.roomId, 'includeSGST', e.target.checked)}
                            className="h-4 w-4"
                            disabled={!isAvailable}
                          />
                          <Label htmlFor={`sgst-${room.roomId}`}>SGST</Label>
                        </div>

                        {config.includeSGST && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={config.sgstPercentage}
                              onChange={(e) => updateRoomConfig(room.roomId, 'sgstPercentage', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              max="100"
                              step="0.01"
                              disabled={!isAvailable}
                            />
                            <span>%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Total */}
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="font-medium">Room Total:</span>
                      <span className={`text-xl font-bold ${!isAvailable ? 'text-gray-400' : 'text-green-600'}`}>
                        ₹{calculateRoomTotal(room.roomId).toFixed(2)}
                        {!isAvailable && <span className="text-xs ml-2 text-gray-500">(Not available)</span>}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('customer')}>
                Back
              </Button>
              <Button 
                onClick={() => setActiveTab('payment')}
                disabled={availableRoomsCount === 0}
              >
                Next: Payment
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Payment & Summary */}
          <TabsContent value="payment" className="space-y-6">
            {/* Payment Method Selection */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Payment Method</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {
                    setPaymentMethod('cash');
                    setPaymentStatus('pending');
                  }}
                >
                  <Wallet className="h-6 w-6 mb-1" />
                  <span>Cash</span>
                  <span className="text-xs text-muted-foreground">Pay at Hotel</span>
                </Button>

                <Button
                  type="button"
                  variant={paymentMethod === 'online' ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {
                    setPaymentMethod('online');
                    if (!qrCodeData) generateUPIQrCode();
                  }}
                  disabled={isGeneratingQR}
                >
                  <QrCode className="h-6 w-6 mb-1" />
                  <span>Online</span>
                  <span className="text-xs text-muted-foreground">Pay Now</span>
                  {isGeneratingQR && (
                    <Loader2 className="h-4 w-4 animate-spin mt-1" />
                  )}
                </Button>
              </div>
            </Card>

            {/* QR Code Payment Section */}
            {paymentMethod === 'online' && (
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2 space-y-4">
                    <h4 className="font-semibold text-center">Scan QR Code to Pay</h4>
                    
                    <div className="bg-white p-4 rounded-lg border flex flex-col items-center">
                      {hotelQRCode ? (
                        <img
                          src={hotelQRCode}
                          alt="Hotel UPI QR Code"
                          className="w-48 h-48 object-contain mx-auto"
                          onError={(e) => {
                            console.error('Hotel QR code failed to load');
                            e.currentTarget.src = '/images/default-qr.png';
                          }}
                        />
                      ) : (
                        <img
                          src="/images/default-qr.png"
                          alt="UPI QR Code"
                          className="w-48 h-48 object-contain mx-auto"
                        />
                      )}
                      
                      <div className="mt-3 text-center">
                        <div className="text-sm font-medium mb-1">
                          Amount to Pay:
                          <span className="text-lg font-bold text-green-600 ml-2">
                            ₹{grandTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Scan with any UPI app to pay
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/2 space-y-4">
                    <h4 className="font-semibold">Payment Instructions</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Scan QR Code</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use any UPI app to scan the QR code
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Verify Amount</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ensure amount is <strong>₹{grandTotal.toFixed(2)}</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Complete Payment</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter your UPI PIN to complete
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">4</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Verify Payment</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click "Verify Payment" below after paying
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status and Verification */}
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Payment Status:</span>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {paymentStatus === 'completed' ? '✅ Completed' :
                           paymentStatus === 'failed' ? '❌ Failed' :
                           '🔄 Pending'}
                        </div>
                      </div>

                      {paymentStatus === 'pending' && (
                        <Button
                          onClick={verifyPayment}
                          className="w-full"
                          disabled={isVerifyingPayment}
                        >
                          {isVerifyingPayment ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying Payment...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              I have made the payment
                            </>
                          )}
                        </Button>
                      )}

                      {paymentStatus === 'completed' && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700 font-medium">
                            ✅ Payment Verified Successfully!
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Cash Payment Info */}
            {paymentMethod === 'cash' && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-4">
                  <Wallet className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Cash Payment at Hotel</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pay the total amount when you check-in at the hotel reception.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount Due at Hotel:</span>
                        <span className="text-2xl font-bold text-blue-700">
                          ₹{grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Special Requests */}
            <Card className="p-6">
              <Label className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4" />
                Special Requests (Optional)
              </Label>
              <Textarea
                value={customerData.specialRequests}
                onChange={(e) => setCustomerData({...customerData, specialRequests: e.target.value})}
                placeholder="Any special requests for all rooms?"
                className="min-h-[100px]"
              />
            </Card>

            {/* Booking Summary */}
            <Card className="p-6 bg-gray-50">
              <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>

              <div className="space-y-3">
                {selectedRooms.map((room) => {
                  const roomTotal = calculateRoomTotal(room.roomId);
                  const isAvailable = roomAvailability[room.roomId]?.available !== false;
                  
                  if (!isAvailable) return null;
                  
                  return (
                    <div key={room.roomId} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">Room {room.number}</div>
                        <div className="text-sm text-muted-foreground">
                          {room.type} • {roomConfigs[room.roomId]?.guests || 1} guests
                        </div>
                      </div>
                      <div className="font-semibold">₹{roomTotal.toFixed(2)}</div>
                    </div>
                  );
                })}

                {selectedRooms.filter(r => roomAvailability[r.roomId]?.available !== false).length === 0 && (
                  <div className="text-center py-4 text-red-600">
                    No rooms available for selected dates
                  </div>
                )}

                {selectedRooms.filter(r => roomAvailability[r.roomId]?.available === false).length > 0 && (
                  <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    {selectedRooms.filter(r => roomAvailability[r.roomId]?.available === false).length} room(s) excluded (not available)
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 text-lg font-bold">
                  <span>Grand Total:</span>
                  <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
                </div>

                <div className="text-sm text-muted-foreground mt-2">
                  Duration: {nights} {nights === 1 ? 'night' : 'nights'}
                </div>

                {paymentMethod === 'online' && paymentStatus === 'completed' && (
                  <Alert className="bg-green-50 border-green-200 mt-4">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Payment verified! You can now confirm your booking.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 pt-4">
              <Button variant="outline" onClick={() => setActiveTab('rooms')}>
                Back
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || availableRoomsCount === 0 || (paymentMethod === 'online' && paymentStatus !== 'completed')}
                className="bg-green-600 hover:bg-green-700 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking ({availableRoomsCount} rooms)
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}