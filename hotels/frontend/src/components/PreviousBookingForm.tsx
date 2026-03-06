

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Add this import
import { useToast } from '@/hooks/use-toast';
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
  Hash,
  FileText
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
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerPhone: '',
    customerEmail: '', // Add email field
    idNumber: '',
    idType: 'aadhaar' as 'pan' | 'aadhaar' | 'passport' | 'driving',

    // Address Fields - NEW
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

    // Payment Information
    amount: 0,
    service: 0,
    gst: 0,
    total: 0,
    paymentMethod: 'cash',
    paymentStatus: 'completed',

    // Additional Fields - NEW
    purposeOfVisit: '',
    otherExpenses: 0,
    expenseDescription: '',
    referralBy: '',
    referralAmount: 0
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmountChange = (field: string, value: string | number) => {
    // Convert to number
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

    setFormData(prev => {
      const updated = { ...prev, [field]: numValue };

      // Calculate total immediately
      const amount = field === 'amount' ? numValue : updated.amount;
      const service = field === 'service' ? numValue : updated.service;
      const gst = field === 'gst' ? numValue : updated.gst;
      const otherExpenses = field === 'otherExpenses' ? numValue : updated.otherExpenses;
      const total = amount + service + gst + otherExpenses;

      return {
        ...updated,
        total
      };
    });
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

    if (formData.total <= 0) {
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');

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

      // Create booking with all fields
      const bookingData = {
        room_id: room.id,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail || null,
        from_date: formData.checkInDate,
        to_date: formData.checkOutDate,
        from_time: formData.checkInTime,
        to_time: formData.checkOutTime,
        amount: formData.amount,
        service: formData.service,
        gst: formData.gst,
        total: formData.total,
        status: 'booked',
        guests: formData.guests,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentStatus,
        id_type: formData.idType,
        id_number: formData.idNumber,

        // Add new address fields
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        customer_gst_no: formData.customerGstNo || null,

        // Add additional fields
        purpose_of_visit: formData.purposeOfVisit || null,
        other_expenses: formData.otherExpenses || 0,
        expense_description: formData.expenseDescription || null,
        referral_by: formData.referralBy || null,
        referral_amount: formData.referralAmount || 0
      };

      const response = await fetch(`${NODE_BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '✅ Previous Booking Added',
          description: `Booking for ${formData.customerName} has been recorded`,
          variant: 'default'
        });

        // Reset form to initial state
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          idNumber: '',
          idType: 'aadhaar',
          address: '',
          city: '',
          state: '',
          pincode: '',
          customerGstNo: '',
          roomNumber: '',
          guests: 1,
          checkInDate: '',
          checkInTime: '14:00',
          checkOutDate: '',
          checkOutTime: '12:00',
          amount: 0,
          service: 0,
          gst: 0,
          total: 0,
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          purposeOfVisit: '',
          otherExpenses: 0,
          expenseDescription: '',
          referralBy: '',
          referralAmount: 0
        });

        onSuccess();
        onClose();
      } else {
        throw new Error(result.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error creating previous booking:', error);
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
              (For past dates - Includes all customer details)
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
                  onChange={e => handleChange('idType', e.target.value)}
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
                <p className="text-xs text-muted-foreground">
                  Format: 27AAACH1234M1Z5 (15 characters)
                </p>
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
                <p className="text-xs text-amber-600">
                  ✓ You can select any past date
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Default: 14:00 (2:00 PM)
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Default: 12:00 (12:00 PM)
                </p>
              </div>
            </div>
          </div>

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
                  placeholder="Enter purpose of visit (e.g., Business meeting, Vacation, Medical treatment, etc.)"
                  className="min-h-[80px]"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="otherExpenses">Other Expenses (₹)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="otherExpenses"
                      type="number"
                      value={formData.otherExpenses}
                      onChange={e => handleAmountChange('otherExpenses', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="1"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAmountChange('otherExpenses', 0)}
                      className="whitespace-nowrap"
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Additional charges like coffee, tiffin, laundry, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenseDescription">Expense Description</Label>
                  <Input
                    id="expenseDescription"
                    value={formData.expenseDescription}
                    onChange={e => handleChange('expenseDescription', e.target.value)}
                    placeholder="e.g., Coffee, Snacks, Laundry, Extra Bed"
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
                    placeholder="Enter referral source (e.g., Friend, Agent, Website)"
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

          {/* Payment Information */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Payment Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Room Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.amount}
                  onChange={e => handleAmountChange('amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service Charge (₹)</Label>
                <Input
                  id="service"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.service}
                  onChange={e => handleAmountChange('service', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gst">GST (₹)</Label>
                <Input
                  id="gst"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.gst}
                  onChange={e => handleAmountChange('gst', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">Total Amount (₹)</Label>
                <Input
                  id="total"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.total.toFixed(2)}
                  readOnly
                  className="bg-gray-50 font-bold text-lg text-green-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={e => handleChange('paymentMethod', e.target.value)}
                  className="w-full h-10 px-3 text-sm border rounded-md bg-background"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <select
                  id="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={e => handleChange('paymentStatus', e.target.value)}
                  className="w-full h-10 px-3 text-sm border rounded-md bg-background"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="refunded">Refunded</option>
                </select>
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
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-medium">{formData.customerEmail || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">GST No:</p>
                <p className="font-medium">{formData.customerGstNo || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Room:</p>
                <p className="font-medium">{formData.roomNumber || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Address:</p>
                <p className="font-medium text-sm">
                  {formData.address ? `${formData.address.substring(0, 30)}...` : 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Check-in:</p>
                <p className="font-medium">
                  {formData.checkInDate ? new Date(formData.checkInDate).toLocaleDateString() : 'Not specified'}
                  {formData.checkInTime && ` at ${formData.checkInTime}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Check-out:</p>
                <p className="font-medium">
                  {formData.checkOutDate ? new Date(formData.checkOutDate).toLocaleDateString() : 'Not specified'}
                  {formData.checkOutTime && ` at ${formData.checkOutTime}`}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Total Amount:</p>
                <p className="font-bold text-2xl text-green-600">₹{formData.total.toFixed(2)}</p>
                {formData.otherExpenses > 0 && (
                  <p className="text-sm text-blue-600 mt-1">
                    Includes ₹{formData.otherExpenses.toFixed(2)} in additional expenses
                  </p>
                )}
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