const AdvanceBooking = require('../models/AdvanceBooking');
const Customer = require('../models/Customer');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const { pool } = require('../config/database');

const advanceBookingController = {
    // Create advance booking
    createAdvanceBooking: async (req, res) => {
        try {
            const {
                customer_id,
                room_id,
                from_date,
                to_date,
                from_time = '14:00',
                to_time = '12:00',
                guests = 1,
                amount = 0,
                advance_amount = 0,
                service = 0,
                cgst = 0,
                sgst = 0,
                igst = 0,
                total = 0,
                payment_method = 'cash',
                payment_status = 'pending',
                transaction_id = null,
                status = 'pending',
                expiry_days = 30,
                special_requests = '',
                id_type = 'aadhaar',
                id_number = '',
                id_image = null,
                id_image2 = null,
                referral_by = '',
                referral_amount = 0,
                // Customer details for new customer
                customer_name,
                customer_phone,
                customer_email,
                customer_id_number,
                address,
                city,
                state,
                pincode,
                customer_gst_no,
                purpose_of_visit,
                other_expenses = 0,
                expense_description = '',
                notes = ''
            } = req.body;

            const hotelId = req.user.hotel_id;
            let finalCustomerId = customer_id;
            let isNewCustomer = false;

            console.log('📝 Create advance booking request:', {
                hotelId,
                room_id,
                from_date,
                to_date,
                customer_name,
                customer_phone,
                advance_amount,
                total
            });

            // ===========================================
            // 1. VALIDATE ROOM (if specified)
            // ===========================================
            if (room_id) {
                const room = await Room.findById(room_id, hotelId);
                if (!room) {
                    return res.status(404).json({
                        success: false,
                        error: 'ROOM_NOT_FOUND',
                        message: 'Room not found'
                    });
                }

                // Check availability for future dates
                const isAvailable = await Booking.checkRoomAvailability(
                    room_id,
                    hotelId,
                    from_date,
                    to_date,
                    null,
                    'booked'
                );

                if (!isAvailable) {
                    return res.status(400).json({
                        success: false,
                        error: 'ROOM_NOT_AVAILABLE',
                        message: 'Room is not available for the selected dates'
                    });
                }
            }

            // ===========================================
            // 2. CUSTOMER HANDLING
            // ===========================================
            if (customer_name && customer_phone) {
                const existingCustomer = await Customer.findByPhone(customer_phone, hotelId);

                if (existingCustomer) {
                    finalCustomerId = existingCustomer.id;
                    console.log('✅ Found existing customer:', finalCustomerId);
                } else {
                    finalCustomerId = await Customer.create({
                        hotel_id: hotelId,
                        name: customer_name,
                        phone: customer_phone,
                        email: customer_email || '',
                        id_number: customer_id_number || '',
                        id_type: id_type || 'aadhaar',
                        id_image: id_image || null,
                        id_image2: id_image2 || null,
                        address: address || '',
                        city: city || '',
                        state: state || '',
                        pincode: pincode || '',
                        customer_gst_no: customer_gst_no || '',
                        purpose_of_visit: purpose_of_visit || null,
                        other_expenses: other_expenses || 0,
                        expense_description: expense_description || null
                    });
                    isNewCustomer = true;
                    console.log('✅ Created new customer:', finalCustomerId);
                }
            }

            // Calculate remaining amount
            const remaining_amount = (parseFloat(total) || 0) - (parseFloat(advance_amount) || 0);

            // Create advance booking
            const advanceBookingId = await AdvanceBooking.create({
                hotel_id: hotelId,
                customer_id: finalCustomerId,
                room_id,
                from_date,
                to_date,
                from_time,
                to_time,
                guests,
                amount: parseFloat(amount),
                advance_amount: parseFloat(advance_amount),
                remaining_amount,
                service: parseFloat(service),
                cgst: parseFloat(cgst),
                sgst: parseFloat(sgst),
                igst: parseFloat(igst),
                total: parseFloat(total),
                payment_method,
                payment_status: remaining_amount <= 0 ? 'completed' : 'partial',
                transaction_id,
                status,
                expiry_days,
                special_requests,
                id_type,
                id_number,
                id_image,
                id_image2,
                referral_by,
                referral_amount: parseFloat(referral_amount),
                address,
                city,
                state,
                pincode,
                customer_gst_no,
                purpose_of_visit,
                other_expenses: parseFloat(other_expenses),
                expense_description,
                created_by: req.user.userId,
                notes
            });

            // Create transaction record if advance payment made
            if (advance_amount > 0 && payment_method !== 'cash') {
                const txnId = transaction_id || `ADV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                await Transaction.create({
                    hotel_id: hotelId,
                    booking_id: null,
                    advance_booking_id: advanceBookingId,
                    customer_id: finalCustomerId,
                    transaction_id: txnId,
                    amount: advance_amount,
                    currency: 'INR',
                    payment_method,
                    payment_gateway: 'upi',
                    status: 'success',
                    status_message: 'Advance payment received',
                    metadata: {
                        type: 'advance_booking',
                        booking_id: advanceBookingId,
                        from_date,
                        to_date,
                        room_id
                    }
                });

                if (!transaction_id) {
                    await AdvanceBooking.update(advanceBookingId, hotelId, {
                        transaction_id: txnId
                    });
                }
            }

            // If payment is completed and advance amount >= total, auto-confirm
            if (remaining_amount <= 0) {
                await AdvanceBooking.update(advanceBookingId, hotelId, {
                    status: 'confirmed'
                });
            }

            res.status(201).json({
                success: true,
                message: isNewCustomer ? 'New customer and advance booking created' : 'Advance booking created',
                data: {
                    advanceBookingId,
                    customerId: finalCustomerId,
                    isNewCustomer,
                    invoiceNumber: (await AdvanceBooking.findById(advanceBookingId, hotelId))?.invoice_number,
                    details: {
                        from_date,
                        to_date,
                        total: parseFloat(total),
                        advance_amount: parseFloat(advance_amount),
                        remaining_amount,
                        payment_status: remaining_amount <= 0 ? 'completed' : 'partial',
                        expiry_days
                    }
                }
            });

        } catch (error) {
            console.error('❌ Create advance booking error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error: ' + error.message
            });
        }
    },

    // Get all advance bookings
    getAdvanceBookings: async (req, res) => {
        try {
            const hotelId = req.user.hotel_id;
            const { status, payment_status, from_date, to_date } = req.query;

            // Check for expired bookings first
            await AdvanceBooking.checkExpired(hotelId);

            const bookings = await AdvanceBooking.findByHotel(hotelId, {
                status,
                payment_status,
                from_date,
                to_date
            });

            res.json({
                success: true,
                data: bookings,
                count: bookings.length
            });

        } catch (error) {
            console.error('❌ Get advance bookings error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error'
            });
        }
    },

    // Get single advance booking
    getAdvanceBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const hotelId = req.user.hotel_id;

            const booking = await AdvanceBooking.findById(id, hotelId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Advance booking not found'
                });
            }

            res.json({
                success: true,
                data: booking
            });

        } catch (error) {
            console.error('❌ Get advance booking error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error'
            });
        }
    },

    // Update advance booking
    updateAdvanceBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const hotelId = req.user.hotel_id;
            const updateData = req.body;

            const updated = await AdvanceBooking.update(id, hotelId, updateData);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Advance booking not found'
                });
            }

            res.json({
                success: true,
                message: 'Advance booking updated successfully'
            });

        } catch (error) {
            console.error('❌ Update advance booking error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error'
            });
        }
    },

    // Add advance payment to existing booking
    addAdvancePayment: async (req, res) => {
        try {
            const { id } = req.params;
            const hotelId = req.user.hotel_id;
            const { advance_amount, payment_method, transaction_id } = req.body;

            if (!advance_amount || advance_amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_AMOUNT',
                    message: 'Valid advance amount is required'
                });
            }

            const booking = await AdvanceBooking.findById(id, hotelId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Advance booking not found'
                });
            }

            const newAdvanceAmount = (parseFloat(booking.advance_amount) || 0) + parseFloat(advance_amount);
            const total = parseFloat(booking.total) || parseFloat(booking.amount) || 0;

            if (newAdvanceAmount > total) {
                return res.status(400).json({
                    success: false,
                    error: 'AMOUNT_EXCEEDS_TOTAL',
                    message: 'Advance amount cannot exceed total booking amount'
                });
            }

            // Generate transaction ID if not provided
            const txnId = transaction_id || `ADV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Update advance amount
            await AdvanceBooking.updateAdvanceAmount(id, hotelId, newAdvanceAmount, txnId);

            // Create transaction record
            await Transaction.create({
                hotel_id: hotelId,
                advance_booking_id: id,
                customer_id: booking.customer_id,
                transaction_id: txnId,
                amount: advance_amount,
                currency: 'INR',
                payment_method,
                payment_gateway: payment_method === 'online' ? 'upi' : 'cash',
                status: 'success',
                status_message: 'Additional advance payment received',
                metadata: {
                    type: 'advance_payment',
                    previous_amount: booking.advance_amount,
                    new_amount: newAdvanceAmount
                }
            });

            // If fully paid, update status to confirmed
            if (newAdvanceAmount >= total) {
                await AdvanceBooking.update(id, hotelId, {
                    status: 'confirmed',
                    payment_status: 'completed'
                });
            }

            res.json({
                success: true,
                message: 'Advance payment added successfully',
                data: {
                    advance_booking_id: id,
                    previous_amount: booking.advance_amount,
                    added_amount: advance_amount,
                    new_amount: newAdvanceAmount,
                    remaining_amount: total - newAdvanceAmount,
                    fully_paid: newAdvanceAmount >= total
                }
            });

        } catch (error) {
            console.error('❌ Add advance payment error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error: ' + error.message
            });
        }
    },

    // Convert advance booking to regular booking
    // convertToBooking: async (req, res) => {
    //     try {
    //         const { id } = req.params;
    //         const hotelId = req.user.hotel_id;

    //         const advanceBooking = await AdvanceBooking.findById(id, hotelId);
    //         if (!advanceBooking) {
    //             return res.status(404).json({
    //                 success: false,
    //                 error: 'BOOKING_NOT_FOUND',
    //                 message: 'Advance booking not found'
    //             });
    //         }

    //         if (advanceBooking.status !== 'confirmed' && advanceBooking.status !== 'pending') {
    //             return res.status(400).json({
    //                 success: false,
    //                 error: 'INVALID_STATUS',
    //                 message: 'Only confirmed or pending bookings can be converted'
    //             });
    //         }

    //         if (!advanceBooking.room_id) {
    //             return res.status(400).json({
    //                 success: false,
    //                 error: 'ROOM_REQUIRED',
    //                 message: 'Room must be selected to convert to booking'
    //             });
    //         }

    //         // Check room availability
    //         const isAvailable = await Booking.checkRoomAvailability(
    //             advanceBooking.room_id,
    //             hotelId,
    //             advanceBooking.from_date,
    //             advanceBooking.to_date,
    //             null,
    //             'booked'
    //         );

    //         if (!isAvailable) {
    //             return res.status(400).json({
    //                 success: false,
    //                 error: 'ROOM_NOT_AVAILABLE',
    //                 message: 'Room is no longer available for the selected dates'
    //             });
    //         }

    //         // Create regular booking
    //         const bookingData = {
    //             hotel_id: hotelId,
    //             room_id: advanceBooking.room_id,
    //             customer_id: advanceBooking.customer_id,
    //             from_date: advanceBooking.from_date,
    //             to_date: advanceBooking.to_date,
    //             from_time: advanceBooking.from_time,
    //             to_time: advanceBooking.to_time,
    //             amount: advanceBooking.amount,
    //             service: advanceBooking.service,
    //             gst: advanceBooking.cgst + advanceBooking.sgst + advanceBooking.igst,
    //             cgst: advanceBooking.cgst,
    //             sgst: advanceBooking.sgst,
    //             igst: advanceBooking.igst,
    //             total: advanceBooking.total,
    //             status: 'booked',
    //             guests: advanceBooking.guests,
    //             special_requests: advanceBooking.special_requests,
    //             id_type: advanceBooking.id_type,
    //             payment_method: advanceBooking.payment_method,
    //             payment_status: advanceBooking.remaining_amount <= 0 ? 'completed' : 'pending',
    //             transaction_id: advanceBooking.transaction_id,
    //             referral_by: advanceBooking.referral_by,
    //             referral_amount: advanceBooking.referral_amount
    //         };

    //         const bookingId = await Booking.create(bookingData);

    //         // Mark advance booking as converted
    //         await AdvanceBooking.convertToBooking(id, hotelId, bookingId, req.user.userId);

    //         // Update room status
    //         await Room.updateStatus(advanceBooking.room_id, hotelId, 'booked');

    //         res.json({
    //             success: true,
    //             message: 'Advance booking converted to regular booking',
    //             data: {
    //                 advance_booking_id: id,
    //                 booking_id: bookingId,
    //                 room_number: advanceBooking.room_number,
    //                 total: advanceBooking.total,
    //                 advance_paid: advanceBooking.advance_amount,
    //                 remaining: advanceBooking.remaining_amount
    //             }
    //         });

    //     } catch (error) {
    //         console.error('❌ Convert to booking error:', error);
    //         res.status(500).json({
    //             success: false,
    //             error: 'SERVER_ERROR',
    //             message: 'Internal server error: ' + error.message
    //         });
    //     }
    // },

    // Convert advance booking to regular booking
    convertToBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const hotelId = req.user.hotel_id;

            // Get advance booking data
            const advanceBooking = await AdvanceBooking.findById(id, hotelId);
            if (!advanceBooking) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Advance booking not found'
                });
            }

            // Check if already converted
            if (advanceBooking.status === 'converted') {
                return res.status(400).json({
                    success: false,
                    error: 'ALREADY_CONVERTED',
                    message: 'This advance booking has already been converted'
                });
            }

            if (advanceBooking.status !== 'confirmed' && advanceBooking.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_STATUS',
                    message: 'Only confirmed or pending bookings can be converted'
                });
            }

            if (!advanceBooking.room_id) {
                return res.status(400).json({
                    success: false,
                    error: 'ROOM_REQUIRED',
                    message: 'Room must be selected to convert to booking'
                });
            }

            // Check room availability
            const isAvailable = await Booking.checkRoomAvailability(
                advanceBooking.room_id,
                hotelId,
                advanceBooking.from_date,
                advanceBooking.to_date,
                null,
                'booked'
            );

            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    error: 'ROOM_NOT_AVAILABLE',
                    message: 'Room is no longer available for the selected dates'
                });
            }

            // Create regular booking
            const bookingData = {
                hotel_id: hotelId,
                room_id: advanceBooking.room_id,
                customer_id: advanceBooking.customer_id,
                from_date: advanceBooking.from_date,
                to_date: advanceBooking.to_date,
                from_time: advanceBooking.from_time,
                to_time: advanceBooking.to_time,
                amount: advanceBooking.amount,
                service: advanceBooking.service,
                gst: advanceBooking.cgst + advanceBooking.sgst + advanceBooking.igst,
                cgst: advanceBooking.cgst,
                sgst: advanceBooking.sgst,
                igst: advanceBooking.igst,
                total: advanceBooking.total,
                status: 'booked',
                guests: advanceBooking.guests,
                special_requests: advanceBooking.special_requests,
                id_type: advanceBooking.id_type,
                payment_method: advanceBooking.payment_method,
                payment_status: advanceBooking.remaining_amount <= 0 ? 'completed' : 'pending',
                transaction_id: advanceBooking.transaction_id,
                referral_by: advanceBooking.referral_by,
                referral_amount: advanceBooking.referral_amount
            };

            const bookingId = await Booking.create(bookingData);

            // Mark advance booking as converted - THIS IS THE KEY PART
            await AdvanceBooking.convertToBooking(id, hotelId, bookingId, req.user.userId);

            // Update room status
            await Room.updateStatus(advanceBooking.room_id, hotelId, 'booked');

            res.json({
                success: true,
                message: 'Advance booking converted to regular booking',
                data: {
                    advance_booking_id: id,
                    booking_id: bookingId,
                    room_number: advanceBooking.room_number,
                    total: advanceBooking.total,
                    advance_paid: advanceBooking.advance_amount,
                    remaining: advanceBooking.remaining_amount
                }
            });

        } catch (error) {
            console.error('❌ Convert to booking error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error: ' + error.message
            });
        }
    },

    // Cancel advance booking
    cancelAdvanceBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const hotelId = req.user.hotel_id;
            const { reason } = req.body;

            const booking = await AdvanceBooking.findById(id, hotelId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Advance booking not found'
                });
            }

            if (booking.status === 'converted') {
                return res.status(400).json({
                    success: false,
                    error: 'CANNOT_CANCEL',
                    message: 'Converted bookings cannot be cancelled'
                });
            }

            await AdvanceBooking.cancel(id, hotelId, reason || 'Cancelled by user');

            // TODO: Process refund if advance payment was made
            if (booking.advance_amount > 0) {
                // Create refund record or process payment reversal
                console.log('💰 Refund needed for advance payment:', booking.advance_amount);
            }

            res.json({
                success: true,
                message: 'Advance booking cancelled successfully',
                data: {
                    advance_booking_id: id,
                    advance_amount: booking.advance_amount,
                    refund_status: booking.advance_amount > 0 ? 'pending' : 'no_refund'
                }
            });

        } catch (error) {
            console.error('❌ Cancel advance booking error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error: ' + error.message
            });
        }
    },

    // Get advance booking stats
    getAdvanceBookingStats: async (req, res) => {
        try {
            const hotelId = req.user.hotel_id;

            // Check for expired bookings first
            await AdvanceBooking.checkExpired(hotelId);

            const stats = await AdvanceBooking.getStats(hotelId);

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('❌ Get advance booking stats error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error'
            });
        }
    },

    // Generate invoice for advance booking
    generateInvoice: async (req, res) => {
        try {
            const { id } = req.params;
            const hotelId = req.user.hotel_id;

            const booking = await AdvanceBooking.findById(id, hotelId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    error: 'BOOKING_NOT_FOUND',
                    message: 'Advance booking not found'
                });
            }

            // Get hotel details
            const [hotelRows] = await pool.execute(`
                SELECT h.*, u.phone as hotel_phone, u.email as hotel_email
                FROM hotels h
                LEFT JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
                WHERE h.id = ?
            `, [hotelId]);

            const hotelDetails = hotelRows[0] || {};

            // Get company logo
            const [logoRows] = await pool.execute(
                'SELECT logo_image FROM hotels WHERE id = ?',
                [hotelId]
            );

            const companyLogoBase64 = logoRows[0]?.logo_image || '';

            // Format dates
            const formatDate = (date) => {
                if (!date) return '';
                try {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });
                } catch (e) {
                    return date;
                }
            };

            const invoiceData = {
                invoiceNumber: booking.invoice_number,
                invoiceDate: formatDate(new Date()),
                bookingId: booking.id,
                type: 'ADVANCE BOOKING',
                expiryDate: formatDate(booking.advance_expiry_date),
                hotel: {
                    name: hotelDetails.name || 'Hotel',
                    address: hotelDetails.address || '',
                    phone: hotelDetails.hotel_phone || '',
                    email: hotelDetails.hotel_email || '',
                    gstin: hotelDetails.gst_number || '',
                    logo: companyLogoBase64
                },
                customer: {
                    name: booking.customer_name || 'Walk-in',
                    phone: booking.customer_phone || '',
                    email: booking.customer_email || '',
                    address: booking.address || '',
                    city: booking.city || '',
                    state: booking.state || '',
                    pincode: booking.pincode || '',
                    gst: booking.customer_gst_no || ''
                },
                booking: {
                    roomNumber: booking.room_number || 'Not Assigned',
                    roomType: booking.room_type || 'Standard',
                    fromDate: formatDate(booking.from_date),
                    toDate: formatDate(booking.to_date),
                    fromTime: booking.from_time,
                    toTime: booking.to_time,
                    nights: Math.ceil((new Date(booking.to_date) - new Date(booking.from_date)) / (1000 * 60 * 60 * 24)),
                    guests: booking.guests
                },
                charges: [
                    {
                        description: `Room Charges (${booking.amount > 0 ? '₹' + booking.amount : 'To be decided'})`,
                        amount: booking.amount
                    },
                    { description: 'Service Charges', amount: booking.service },
                    ...(booking.cgst > 0 ? [{ description: `CGST`, amount: booking.cgst }] : []),
                    ...(booking.sgst > 0 ? [{ description: `SGST`, amount: booking.sgst }] : []),
                    ...(booking.igst > 0 ? [{ description: `IGST`, amount: booking.igst }] : [])
                ],
                subtotal: (booking.amount || 0) + (booking.service || 0),
                total: booking.total || 0,
                advancePaid: booking.advance_amount || 0,
                remainingDue: (booking.total || 0) - (booking.advance_amount || 0),
                payment: {
                    method: booking.payment_method,
                    status: booking.payment_status,
                    transactionId: booking.transaction_id
                },
                status: booking.status,
                notes: booking.notes || 'Advance booking - Balance to be paid at check-in',
                footer: {
                    note: 'This is an advance booking invoice. Final amount may vary.',
                    terms: 'Advance booking valid until ' + formatDate(booking.advance_expiry_date),
                    companyName: hotelDetails.name || 'Hotel Management System'
                }
            };

            res.json({
                success: true,
                data: invoiceData
            });

        } catch (error) {
            console.error('❌ Generate advance invoice error:', error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Internal server error: ' + error.message
            });
        }
    }
};

module.exports = advanceBookingController;