

const BlockMaintenancePdfService = require('../services/blockMaintenancePdfService');

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Collection = require('../models/Collection');
const { pool } = require('../config/database');

const WhatsAppService = require('../services/whatsappService');


// Import Email Service
const EmailService = require('../services/emailService');
const SchedulerService = require('../services/schedulerService');

const fs = require('fs');
const path = require('path');

// Function to get base64 logo
const getBase64Logo = () => {
  try {
    // Try multiple possible paths for the logo
    const possiblePaths = [
      path.join(__dirname, '../public/logo.jpeg'),
      path.join(__dirname, '../../public/logo.jpeg'),
      path.join(__dirname, '../../../public/logo.jpeg'),
      path.join(__dirname, 'public/logo.jpeg'),
    ];

    let logoPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        logoPath = possiblePath;
        console.log(`✅ Found logo at: ${logoPath}`);
        break;
      }
    }

    if (!logoPath) {
      console.log('⚠️ Logo file not found, using placeholder');
      return 'https://via.placeholder.com/80x40/2c3e50/ffffff?text=HSPL';
    }

    const imageBuffer = fs.readFileSync(logoPath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = logoPath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error('❌ Error loading logo:', error);
    return 'https://via.placeholder.com/80x40/2c3e50/ffffff?text=HSPL';
  }
};

// Pre-load the logo as base64
const companyLogoBase64 = getBase64Logo();
console.log('Company logo loaded:', companyLogoBase64 ? 'Yes' : 'No');


const bookingController = {


  // createBooking: async (req, res) => {
  //   try {
  //     const {
  //       room_id,
  //       customer_id,
  //       from_date,
  //       to_date,
  //       from_time,
  //       to_time,
  //       amount,
  //       service,
  //       gst,
  //       cgst,        // ← ADD THIS
  //       sgst,        // ← ADD THIS
  //       igst,        // ← ADD THIS
  //       total,
  //       status,
  //       guests,
  //       special_requests,
  //       id_type,
  //       payment_method,
  //       payment_status,
  //       transaction_id,
  //       // Customer details (for creating new customer)
  //       customer_name,
  //       customer_phone,
  //       customer_email,
  //       customer_id_number,
  //       id_image,
  //       id_image2,
  //       address,
  //       city,
  //       state,
  //       pincode,
  //       customer_gst_no,
  //       purpose_of_visit,      // NEW FIELD
  //       other_expenses,        // NEW FIELD
  //       expense_description,   // NEW FIELD
  //       referral_by,
  //       referral_amount
  //     } = req.body;

  //     const hotelId = req.user.hotel_id;
  //     let finalCustomerId = customer_id;
  //     let generatedTransactionId = transaction_id;
  //     let isNewCustomer = false;
  //     let existingCustomer = null;

  //     console.log('📝 Create booking request:', {
  //       hotelId,
  //       room_id,
  //       customer_id,
  //       from_date,
  //       to_date,
  //       status,
  //       customer_name,
  //       customer_phone,
  //       payment_method,
  //       customer_email,
  //       referral_by,      // Add this
  //       referral_amount
  //     });

  //     // ===========================================
  //     // 1. VALIDATE ROOM
  //     // ===========================================
  //     const room = await Room.findById(room_id, hotelId);
  //     if (!room) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'ROOM_NOT_FOUND',
  //         message: 'Room not found'
  //       });
  //     }

  //     // ===========================================
  //     // 2. CUSTOMER HANDLING
  //     // ===========================================
  //     if (customer_name && customer_phone) {
  //       try {
  //         // Check if customer already exists with same phone
  //         existingCustomer = await Customer.findByPhone(customer_phone, hotelId);

  //         if (existingCustomer) {
  //           // ✅ CUSTOMER EXISTS - Use existing customer
  //           finalCustomerId = existingCustomer.id;
  //           console.log('✅ Found existing customer:', {
  //             customerId: finalCustomerId,
  //             name: existingCustomer.name,
  //             phone: existingCustomer.phone,
  //             email: existingCustomer.email,
  //             id_number: existingCustomer.id_number,
  //             customer_gst_no: existingCustomer.customer_gst_no
  //           });

  //           // ===========================================
  //           // 3. DUPLICATE BOOKING CHECK FOR EXISTING CUSTOMER
  //           // ===========================================
  //           if (status === 'booked' && finalCustomerId) {
  //             const duplicateBooking = await Booking.checkDuplicateBooking(
  //               hotelId,
  //               room_id,
  //               finalCustomerId,
  //               from_date,
  //               to_date
  //             );

  //             if (duplicateBooking) {
  //               return res.status(400).json({
  //                 success: false,
  //                 error: 'DUPLICATE_BOOKING',
  //                 message: 'A booking already exists for this customer in the same room and dates',
  //                 data: {
  //                   booking_id: duplicateBooking.id,
  //                   customer_id: duplicateBooking.customer_id,
  //                   customer_name: duplicateBooking.customer_name,
  //                   customer_phone: duplicateBooking.customer_phone,
  //                   room_id: duplicateBooking.room_id,
  //                   room_number: duplicateBooking.room_number,
  //                   from_date: duplicateBooking.from_date,
  //                   to_date: duplicateBooking.to_date,
  //                   status: duplicateBooking.status,
  //                   amount: duplicateBooking.amount,
  //                   total: duplicateBooking.total,
  //                   created_at: duplicateBooking.created_at
  //                 }
  //               });
  //             }
  //           }

  //           // Update existing customer with new ID images and details
  //           await Customer.update(existingCustomer.id, hotelId, {
  //             name: customer_name,
  //             phone: customer_phone,
  //             email: customer_email || existingCustomer.email,
  //             id_number: customer_id_number || existingCustomer.id_number,
  //             id_type: id_type || 'aadhaar',
  //             id_image: id_image || existingCustomer.id_image,
  //             id_image2: id_image2 || existingCustomer.id_image2,
  //             payment_method: payment_method || 'cash',
  //             payment_status: payment_status || 'pending',
  //             transaction_id: transaction_id || null,
  //             address: address || existingCustomer.address,
  //             city: city || existingCustomer.city,
  //             state: state || existingCustomer.state,
  //             pincode: pincode || existingCustomer.pincode,
  //             customer_gst_no: customer_gst_no || existingCustomer.customer_gst_no,
  //             purpose_of_visit: purpose_of_visit || existingCustomer.purpose_of_visit, // NEW
  //             other_expenses: other_expenses || existingCustomer.other_expenses || 0,  // NEW
  //             expense_description: expense_description || existingCustomer.expense_description // NE
  //           });

  //         } else {
  //           // 🆕 CUSTOMER DOESN'T EXIST - Create new
  //           finalCustomerId = await Customer.create({
  //             hotel_id: hotelId,
  //             name: customer_name,
  //             phone: customer_phone,
  //             email: customer_email || '',
  //             id_number: customer_id_number || '',
  //             id_type: id_type || 'aadhaar',
  //             id_image: id_image || null,
  //             id_image2: id_image2 || null,
  //             payment_method: payment_method || 'cash',
  //             payment_status: payment_status || 'pending',
  //             transaction_id: transaction_id || null,
  //             address: address || '',
  //             city: city || '',
  //             state: state || '',
  //             pincode: pincode || '',
  //             customer_gst_no: customer_gst_no,
  //             purpose_of_visit: purpose_of_visit || null, // NEW
  //             other_expenses: other_expenses || 0,        // NEW
  //             expense_description: expense_description || null // NEW
  //           });
  //           isNewCustomer = true;
  //           console.log('✅ Created new customer:', { customerId: finalCustomerId });
  //         }

  //       } catch (customerError) {
  //         console.error('❌ Customer creation error:', customerError);
  //         return res.status(500).json({
  //           success: false,
  //           error: 'CUSTOMER_CREATION_FAILED',
  //           message: 'Failed to create/update customer'
  //         });
  //       }
  //     }

  //     // ===========================================
  //     // 4. DUPLICATE CHECK FOR DIRECT CUSTOMER ID
  //     // ===========================================
  //     // If customer_id was provided directly (not through name/phone)
  //     if (!isNewCustomer && finalCustomerId && status === 'booked') {
  //       // Get customer details
  //       const customer = await Customer.findById(finalCustomerId, hotelId);
  //       if (!customer) {
  //         return res.status(404).json({
  //           success: false,
  //           error: 'CUSTOMER_NOT_FOUND',
  //           message: 'Customer not found'
  //         });
  //       }

  //       const duplicateBooking = await Booking.checkDuplicateBooking(
  //         hotelId,
  //         room_id,
  //         finalCustomerId,
  //         from_date,
  //         to_date
  //       );

  //       if (duplicateBooking) {
  //         return res.status(400).json({
  //           success: false,
  //           error: 'DUPLICATE_BOOKING',
  //           message: 'A booking already exists for this customer in the same room and dates',
  //           data: {
  //             booking_id: duplicateBooking.id,
  //             customer_id: duplicateBooking.customer_id,
  //             customer_name: duplicateBooking.customer_name || customer.name,
  //             customer_phone: duplicateBooking.customer_phone || customer.phone,
  //             room_id: duplicateBooking.room_id,
  //             room_number: duplicateBooking.room_number || room.room_number,
  //             from_date: duplicateBooking.from_date,
  //             to_date: duplicateBooking.to_date,
  //             status: duplicateBooking.status,
  //             amount: duplicateBooking.amount,
  //             total: duplicateBooking.total,
  //             created_at: duplicateBooking.created_at
  //           }
  //         });
  //       }
  //     }

  //     // ===========================================
  //     // 5. VERIFY CUSTOMER EXISTS FOR BOOKED STATUS
  //     // ===========================================
  //     if (status === 'booked' && finalCustomerId) {
  //       const customer = await Customer.findById(finalCustomerId, hotelId);
  //       if (!customer) {
  //         return res.status(404).json({
  //           success: false,
  //           error: 'CUSTOMER_NOT_FOUND',
  //           message: 'Customer not found'
  //         });
  //       }
  //     }

  //     // ===========================================
  //     // 6. CHECK ROOM AVAILABILITY (General)
  //     // ===========================================
  //     const isAvailable = await Booking.checkRoomAvailability(room_id, hotelId, from_date, to_date, null, status);
  //     if (!isAvailable) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'ROOM_NOT_AVAILABLE',
  //         message: 'Room is not available for the selected dates'
  //       });
  //     }

  //     let invoiceNumber = req.body.invoice_number;
  //     if (!invoiceNumber) {
  //       invoiceNumber = await Booking.getNextInvoiceNumber(hotelId);
  //     }

  //     const otherExpenses = parseFloat(other_expenses) || 0;

  //     // Calculate total INCLUDING other expenses
  //     const calculatedTotal = parseFloat(amount || 0) +
  //       parseFloat(service || 0) +
  //       parseFloat(gst || 0) +
  //       otherExpenses;

  //     const finalTotal = parseFloat(total || calculatedTotal);

  //     // ===========================================
  //     // 7. CREATE BOOKING
  //     // ===========================================
  //     const bookingData = {
  //       hotel_id: hotelId,
  //       room_id,
  //       customer_id: status === 'booked' ? finalCustomerId : null,
  //       from_date,
  //       to_date,
  //       from_time: from_time || '14:00',
  //       to_time: to_time || '12:00',
  //       amount: parseFloat(amount || 0),
  //       service: parseFloat(service || 0),
  //       gst: parseFloat(gst || 0),
  //       cgst: parseFloat(cgst || 0),  // ← ADD THIS
  //       sgst: parseFloat(sgst || 0),  // ← ADD THIS
  //       igst: parseFloat(igst || 0),  // ← ADD THIS
  //       total: finalTotal,
  //       invoice_number: invoiceNumber,
  //       status: status || 'booked',
  //       guests: parseInt(guests || 1),
  //       special_requests: special_requests || '',
  //       id_type: id_type || 'aadhaar',
  //       payment_method: payment_method || 'cash',
  //       payment_status: payment_status || 'pending',
  //       transaction_id: transaction_id || null,
  //       referral_by: referral_by || '',            // Add this
  //       referral_amount: parseFloat(referral_amount || 0)  // Add this
  //     };

  //     console.log('📅 Creating booking:', bookingData);

  //     let bookingId;
  //     if (status === 'booked' && finalCustomerId) {
  //       bookingId = await Booking.create(bookingData);
  //     } else {
  //       // For block/maintenance without customer
  //       bookingId = await Booking.createWithoutCustomer(bookingData);
  //     }

  //     console.log('✅ Booking created successfully:', { bookingId });

  //     // ===========================================
  //     // 8. UPDATE ROOM STATUS
  //     // ===========================================
  //     if (status === 'booked') {
  //       try {
  //         // Send email and WhatsApp asynchronously (don't block response)
  //         setTimeout(async () => {
  //           try {
  //             // Get full booking details
  //             const [fullBooking] = await pool.execute(`
  //         SELECT b.*, r.room_number, r.type as room_type,
  //                c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
  //                c.customer_gst_no, c.address, c.city, c.state, c.pincode,
  //                h.name as hotel_name, b.hotel_id
  //         FROM bookings b
  //         LEFT JOIN rooms r ON b.room_id = r.id
  //         LEFT JOIN customers c ON b.customer_id = c.id
  //         LEFT JOIN hotels h ON b.hotel_id = h.id
  //         WHERE b.id = ? AND b.hotel_id = ?
  //       `, [bookingId, hotelId]);

  //             if (fullBooking.length > 0) {
  //               const booking = fullBooking[0];

  //               // GET HOTEL OWNER/ADMIN DETAILS FROM users TABLE
  //               const [adminRows] = await pool.execute(`
  //           SELECT name, email, phone 
  //           FROM users 
  //           WHERE hotel_id = ? AND role = 'admin' AND status = 'active'
  //           LIMIT 1
  //         `, [hotelId]);

  //               const hotelAdmin = adminRows.length > 0 ? adminRows[0] : null;

  //               const hotelAdminEmail = hotelAdmin ? hotelAdmin.email : process.env.EMAIL_USER;
  //               const hotelAdminName = hotelAdmin ? hotelAdmin.name : 'Hotel Admin';
  //               const hotelAdminPhone = hotelAdmin ? hotelAdmin.phone : null;

  //               const hotelDetails = {
  //                 name: booking.hotel_name || 'Hotel',
  //                 email: hotelAdminEmail,
  //                 address: ''
  //               };

  //               const hotelOwnerDetails = {
  //                 name: hotelAdminName,
  //                 email: hotelAdminEmail,
  //                 phone: hotelAdminPhone
  //               };

  //               const customerEmail = booking.customer_email || customer_email;
  //               const customerName = booking.customer_name || customer_name;
  //               const customerPhone = booking.customer_phone || customer_phone;

  //               const customerDetails = {
  //                 name: customerName,
  //                 email: customerEmail,
  //                 phone: customerPhone
  //               };

  //               // 1. SEND EMAIL (if customer email exists)
  //               if (customerDetails.email) {
  //                 await EmailService.sendBookingConfirmation(booking, hotelDetails, customerDetails, {
  //                   companyLogoUrl: companyLogoBase64,
  //                   companyName: 'Hithlaksh Solutions Private Limited',
  //                   companyWebsite: 'https://hithlakshsolutions.com/',
  //                   privacyLink: 'https://hithlakshsolutions.com/privacy',
  //                   termsLink: 'https://hithlakshsolutions.com/terms'
  //                 });
  //                 console.log(`✅ Booking confirmation email sent to customer`);
  //               } else {
  //                 console.log(`⚠️ No email for customer - booking ${bookingId}`);
  //               }

  //               // 2. SEND WHATSAPP TO BOTH CUSTOMER AND HOTEL OWNER (ONCE)
  //               if (customerDetails.phone || hotelOwnerDetails.phone) {
  //                 try {
  //                   const whatsappResults = await WhatsAppService.sendBookingConfirmationToAll(
  //                     booking,
  //                     booking.hotel_name || 'Hotel',
  //                     customerDetails,
  //                     hotelOwnerDetails
  //                   );

  //                   // Log results
  //                   if (whatsappResults.customer?.success) {
  //                     console.log(`📱 WhatsApp sent to customer: ${customerDetails.name}`);
  //                   } else {
  //                     console.log(`⚠️ WhatsApp to customer failed: ${whatsappResults.customer?.error || 'Unknown error'}`);
  //                   }

  //                   if (whatsappResults.hotelOwner?.success) {
  //                     console.log(`📱 WhatsApp sent to hotel owner: ${hotelOwnerDetails.name}`);
  //                   } else {
  //                     console.log(`⚠️ WhatsApp to hotel owner failed: ${whatsappResults.hotelOwner?.error || 'Unknown error'}`);
  //                   }
  //                 } catch (whatsappError) {
  //                   console.error(`❌ WhatsApp error:`, whatsappError.message);
  //                 }
  //               } else {
  //                 console.log(`📱 No phone numbers for WhatsApp - booking ${bookingId}`);
  //               }
  //             }
  //           } catch (error) {
  //             console.error('❌ Error sending booking confirmations:', error);
  //           }
  //         }, 1000);
  //       } catch (error) {
  //         console.error('❌ Confirmation setup error:', error);
  //       }
  //     }


  //     // ===========================================
  //     // 9. CREATE TRANSACTION RECORD IF PAYMENT IS ONLINE
  //     // ===========================================
  //     let transactionRecord = null;
  //     if (payment_method === 'online' && status === 'booked') {
  //       try {
  //         // Generate transaction ID if not provided
  //         generatedTransactionId = transaction_id || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

  //         // Create transaction record
  //         transactionRecord = await Transaction.create({
  //           hotel_id: hotelId,
  //           booking_id: bookingId,
  //           customer_id: finalCustomerId,
  //           transaction_id: generatedTransactionId,
  //           amount: parseFloat(total || 0),
  //           currency: 'INR',
  //           payment_method: 'online',
  //           payment_gateway: 'upi',
  //           status: payment_status || 'pending',
  //           status_message: payment_status === 'completed' ? 'Payment completed' : 'Payment initiated',
  //           metadata: {
  //             room_id: room_id,
  //             room_number: room.room_number,
  //             from_date: from_date,
  //             to_date: to_date,
  //             customer_name: customer_name,
  //             customer_phone: customer_phone
  //           }
  //         });

  //         console.log('💰 Transaction created:', {
  //           transactionId: generatedTransactionId,
  //           transactionRecordId: transactionRecord
  //         });

  //         // Update booking with transaction ID if not already set
  //         if (!transaction_id) {
  //           await Booking.update(bookingId, hotelId, {
  //             transaction_id: generatedTransactionId
  //           });
  //         }

  //         // If payment is already completed
  //         if (payment_status === 'completed') {
  //           await Transaction.updateStatus(transactionRecord, hotelId, {
  //             status: 'success',
  //             status_message: 'Payment completed successfully',
  //             gateway_transaction_id: generatedTransactionId
  //           });
  //         }

  //       } catch (transactionError) {
  //         console.error('❌ Transaction creation error:', transactionError);
  //         // Don't fail the booking if transaction creation fails
  //       }
  //     }

  //     // ===========================================
  //     // 10. CREATE COLLECTION FOR CASH PAYMENT
  //     // ===========================================
  //     if (payment_method === 'cash' && status === 'booked') {
  //       try {
  //         await Collection.createFromCashBooking(bookingId, hotelId, req.user.userId);
  //         console.log('✅ Auto-created collection for cash booking');
  //       } catch (collectionError) {
  //         console.error('❌ Failed to auto-create collection:', collectionError);
  //       }
  //     }


  //     if (status === 'booked') {
  //       try {
  //         // Send email and WhatsApp asynchronously (don't block response)
  //         setTimeout(async () => {
  //           try {
  //             // Get full booking details
  //             const [fullBooking] = await pool.execute(`
  //         SELECT b.*, r.room_number, r.type as room_type,
  //                c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
  //                 c.customer_gst_no, c.address, c.city, c.state, c.pincode,
  //                h.name as hotel_name, b.hotel_id
  //         FROM bookings b
  //         LEFT JOIN rooms r ON b.room_id = r.id
  //         LEFT JOIN customers c ON b.customer_id = c.id
  //         LEFT JOIN hotels h ON b.hotel_id = h.id
  //         WHERE b.id = ? AND b.hotel_id = ?
  //       `, [bookingId, hotelId]);

  //             if (fullBooking.length > 0) {
  //               const booking = fullBooking[0];

  //               // Get hotel admin email for email CC
  //               const [adminRows] = await pool.execute(
  //                 `SELECT email FROM users 
  //            WHERE hotel_id = ? AND role = 'admin' AND status = 'active'
  //            LIMIT 1`,
  //                 [hotelId]
  //               );

  //               const hotelAdminEmail = adminRows.length > 0 ? adminRows[0].email : null;

  //               const hotelDetails = {
  //                 name: booking.hotel_name || 'Hotel',
  //                 email: hotelAdminEmail || process.env.EMAIL_USER,
  //                 address: ''
  //               };

  //               // Use email from booking or provided customer_email
  //               const customerEmail = booking.customer_email || customer_email;
  //               const customerName = booking.customer_name || customer_name;
  //               const customerPhone = booking.customer_phone || customer_phone;

  //               const customerDetails = {
  //                 name: customerName,
  //                 email: customerEmail,
  //                 phone: customerPhone
  //               };

  //               // 1. SEND EMAIL (if email exists)
  //               if (customerDetails.email) {
  //                 await EmailService.sendBookingConfirmation(booking, hotelDetails, customerDetails, {
  //                   companyLogoUrl: companyLogoBase64,
  //                   companyName: 'Hithlaksh Solutions Private Limited',
  //                   companyWebsite: 'https://hithlakshsolutions.com/',
  //                   privacyLink: 'https://hithlakshsolutions.com/privacy',
  //                   termsLink: 'https://hithlakshsolutions.com/terms'
  //                 });
  //                 console.log(`✅ Booking confirmation email sent for ${payment_method} payment`);
  //               } else {
  //                 console.log(`⚠️ No email to send for booking ${bookingId} (${payment_method} payment)`);
  //               }

  //               // 2. SEND WHATSAPP TO CUSTOMER ONLY (if phone exists)
  //               if (customerDetails.phone) {
  //                 try {
  //                   const whatsappResult = await WhatsAppService.sendBookingConfirmation(
  //                     booking,
  //                     booking.hotel_name || 'Hotel', // Just hotel name, not details
  //                     customerDetails
  //                   );

  //                   if (whatsappResult.success) {
  //                     console.log(`📱 WhatsApp sent to customer: ${customerDetails.name}`);
  //                   } else {
  //                     console.log(`⚠️ WhatsApp failed: ${whatsappResult.error}`);
  //                   }
  //                 } catch (whatsappError) {
  //                   console.error(`❌ WhatsApp error:`, whatsappError.message);
  //                   // Don't fail the booking if WhatsApp fails
  //                 }
  //               } else {
  //                 console.log(`📱 No phone number for WhatsApp - booking ${bookingId}`);
  //               }
  //             }
  //           } catch (error) {
  //             console.error('❌ Error sending booking confirmations:', error);
  //           }
  //         }, 1000); // Delay 1 second to ensure booking is saved
  //       } catch (error) {
  //         console.error('❌ Confirmation setup error:', error);
  //         // Don't fail the booking if confirmation fails
  //       }
  //     }

  //     // ===========================================
  //     // 12. RESPONSE
  //     // ===========================================
  //     const responseData = {
  //       bookingId: bookingId,
  //       customerId: finalCustomerId,
  //       isNewCustomer: isNewCustomer,
  //       bookingDetails: {
  //         room_id: room_id,
  //         room_number: room.room_number,
  //         from_date: from_date,
  //         to_date: to_date,
  //         status: status || 'booked',
  //         total: parseFloat(total || 0),
  //         payment_method: payment_method,
  //         referral_by: referral_by || '',          // Add this
  //         referral_amount: parseFloat(referral_amount || 0),// Add this

  //       }
  //     };

  //     // Add transaction details to response if created
  //     if (transactionRecord) {
  //       responseData.transaction = {
  //         transactionId: generatedTransactionId,
  //         transactionRecordId: transactionRecord,
  //         amount: parseFloat(total || 0),
  //         payment_method: payment_method,
  //         payment_status: payment_status || 'pending'
  //       };
  //     }

  //     res.status(201).json({
  //       success: true,
  //       message: isNewCustomer ? 'New customer and booking created successfully' : 'Booking created successfully',
  //       data: responseData
  //     });

  //   } catch (error) {
  //     console.error('❌ Create booking error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'SERVER_ERROR',
  //       message: 'Internal server error: ' + error.message
  //     });
  //   }
  // },

  // Get all bookings for hotel with details


  createBooking: async (req, res) => {
    try {
      const {
        room_id,
        customer_id,
        from_date,
        to_date,
        from_time,
        to_time,
        amount,
        service,
        gst,
        cgst,
        sgst,
        igst,
        total,
        status,
        guests,
        special_requests,
        id_type,
        payment_method,
        payment_status,
        transaction_id,
        // Customer details
        customer_name,
        customer_phone,
        customer_email,
        customer_id_number,
        id_image,
        id_image2,
        address,
        city,
        state,
        pincode,
        customer_gst_no,
        purpose_of_visit,
        other_expenses,
        expense_description,
        referral_by,
        referral_amount
      } = req.body;

      const hotelId = req.user.hotel_id;
      let finalCustomerId = customer_id;
      let generatedTransactionId = transaction_id;
      let isNewCustomer = false;
      let existingCustomer = null;

      console.log('📝 Create booking request:', {
        hotelId,
        room_id,
        customer_id,
        from_date,
        to_date,
        status,
        customer_name,
        customer_phone,
        payment_method,
        customer_email
      });

      // ===========================================
      // 1. VALIDATE ROOM
      // ===========================================
      const room = await Room.findById(room_id, hotelId);
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        });
      }

      // ===========================================
      // 2. CUSTOMER HANDLING
      // ===========================================
      if (customer_name && customer_phone) {
        try {
          existingCustomer = await Customer.findByPhone(customer_phone, hotelId);

          if (existingCustomer) {
            finalCustomerId = existingCustomer.id;
            console.log('✅ Found existing customer:', {
              customerId: finalCustomerId,
              name: existingCustomer.name
            });

            // Check for duplicate booking
            if (status === 'booked' && finalCustomerId) {
              const duplicateBooking = await Booking.checkDuplicateBooking(
                hotelId,
                room_id,
                finalCustomerId,
                from_date,
                to_date
              );

              if (duplicateBooking) {
                return res.status(400).json({
                  success: false,
                  error: 'DUPLICATE_BOOKING',
                  message: 'A booking already exists for this customer in the same room and dates',
                  data: {
                    booking_id: duplicateBooking.id,
                    customer_name: duplicateBooking.customer_name,
                    room_number: duplicateBooking.room_number,
                    from_date: duplicateBooking.from_date,
                    to_date: duplicateBooking.to_date,
                    status: duplicateBooking.status
                  }
                });
              }
            }

            // Update existing customer
            await Customer.update(existingCustomer.id, hotelId, {
              name: customer_name,
              phone: customer_phone,
              email: customer_email || existingCustomer.email,
              id_number: customer_id_number || existingCustomer.id_number,
              id_type: id_type || 'aadhaar',
              id_image: id_image || existingCustomer.id_image,
              id_image2: id_image2 || existingCustomer.id_image2,
              address: address || existingCustomer.address,
              city: city || existingCustomer.city,
              state: state || existingCustomer.state,
              pincode: pincode || existingCustomer.pincode,
              customer_gst_no: customer_gst_no || existingCustomer.customer_gst_no,
              purpose_of_visit: purpose_of_visit || existingCustomer.purpose_of_visit,
              other_expenses: other_expenses || existingCustomer.other_expenses || 0,
              expense_description: expense_description || existingCustomer.expense_description
            });

          } else {
            // Create new customer
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
              customer_gst_no: customer_gst_no,
              purpose_of_visit: purpose_of_visit || null,
              other_expenses: other_expenses || 0,
              expense_description: expense_description || null
            });
            isNewCustomer = true;
            console.log('✅ Created new customer:', { customerId: finalCustomerId });
          }

        } catch (customerError) {
          console.error('❌ Customer creation error:', customerError);
          return res.status(500).json({
            success: false,
            error: 'CUSTOMER_CREATION_FAILED',
            message: 'Failed to create/update customer'
          });
        }
      }

      // ===========================================
      // 3. CHECK ROOM AVAILABILITY
      // ===========================================
      const isAvailable = await Booking.checkRoomAvailability(room_id, hotelId, from_date, to_date, null, status);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'ROOM_NOT_AVAILABLE',
          message: 'Room is not available for the selected dates'
        });
      }

      let invoiceNumber = req.body.invoice_number;
      if (!invoiceNumber) {
        invoiceNumber = await Booking.getNextInvoiceNumber(hotelId);
      }

      const otherExpensesValue = parseFloat(other_expenses) || 0;

      // Calculate total
      const calculatedTotal = parseFloat(amount || 0) +
        parseFloat(service || 0) +
        parseFloat(gst || 0) +
        otherExpensesValue;

      const finalTotal = parseFloat(total || calculatedTotal);

      // ===========================================
      // 4. CREATE BOOKING
      // ===========================================
      const bookingData = {
        hotel_id: hotelId,
        room_id,
        customer_id: status === 'booked' ? finalCustomerId : null,
        from_date,
        to_date,
        from_time: from_time || '14:00',
        to_time: to_time || '12:00',
        amount: parseFloat(amount || 0),
        service: parseFloat(service || 0),
        gst: parseFloat(gst || 0),
        cgst: parseFloat(cgst || 0),
        sgst: parseFloat(sgst || 0),
        igst: parseFloat(igst || 0),
        total: finalTotal,
        invoice_number: invoiceNumber,
        status: status || 'booked',
        guests: parseInt(guests || 1),
        special_requests: special_requests || '',
        id_type: id_type || 'aadhaar',
        payment_method: payment_method || 'cash',
        payment_status: payment_status || 'pending',
        transaction_id: transaction_id || null,
        referral_by: referral_by || '',
        referral_amount: parseFloat(referral_amount || 0)
      };

      console.log('📅 Creating booking:', bookingData);

      let bookingId;
      if (status === 'booked' && finalCustomerId) {
        bookingId = await Booking.create(bookingData);
      } else {
        bookingId = await Booking.createWithoutCustomer(bookingData);
      }

      console.log('✅ Booking created successfully:', { bookingId });

      // ===========================================
      // 5. UPDATE ROOM STATUS
      // ===========================================
      if (status === 'booked') {
        await Room.updateStatus(room_id, hotelId, 'booked');
      }

      // ===========================================
      // 6. CREATE TRANSACTION RECORD IF PAYMENT IS ONLINE
      // ===========================================
      let transactionRecord = null;
      if (payment_method === 'online' && status === 'booked') {
        try {
          generatedTransactionId = transaction_id || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

          transactionRecord = await Transaction.create({
            hotel_id: hotelId,
            booking_id: bookingId,
            customer_id: finalCustomerId,
            transaction_id: generatedTransactionId,
            amount: parseFloat(total || 0),
            currency: 'INR',
            payment_method: 'online',
            payment_gateway: 'upi',
            status: payment_status || 'pending',
            status_message: payment_status === 'completed' ? 'Payment completed' : 'Payment initiated',
            metadata: {
              room_id: room_id,
              room_number: room.room_number,
              from_date: from_date,
              to_date: to_date,
              customer_name: customer_name,
              customer_phone: customer_phone
            }
          });

          console.log('💰 Transaction created:', {
            transactionId: generatedTransactionId,
            transactionRecordId: transactionRecord
          });

          if (!transaction_id) {
            await Booking.update(bookingId, hotelId, {
              transaction_id: generatedTransactionId
            });
          }

          if (payment_status === 'completed') {
            await Transaction.updateStatus(transactionRecord, hotelId, {
              status: 'success',
              status_message: 'Payment completed successfully',
              gateway_transaction_id: generatedTransactionId
            });
          }

        } catch (transactionError) {
          console.error('❌ Transaction creation error:', transactionError);
        }
      }

      // ===========================================
      // 7. CREATE COLLECTION FOR CASH PAYMENT
      // ===========================================
      if (payment_method === 'cash' && status === 'booked') {
        try {
          await Collection.createFromCashBooking(bookingId, hotelId, req.user.userId);
          console.log('✅ Auto-created collection for cash booking');
        } catch (collectionError) {
          console.error('❌ Failed to auto-create collection:', collectionError);
        }
      }

      // ===========================================
      // 8. SEND EMAIL AND WHATSAPP (KEEP THIS ONE)
      // ===========================================
      if (status === 'booked') {
        try {
          // Send email and WhatsApp asynchronously
          setTimeout(async () => {
            try {
              // Get full booking details
              const [fullBooking] = await pool.execute(`
              SELECT b.*, r.room_number, r.type as room_type,
                     c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
                     c.customer_gst_no, c.address, c.city, c.state, c.pincode,
                     h.name as hotel_name, b.hotel_id
              FROM bookings b
              LEFT JOIN rooms r ON b.room_id = r.id
              LEFT JOIN customers c ON b.customer_id = c.id
              LEFT JOIN hotels h ON b.hotel_id = h.id
              WHERE b.id = ? AND b.hotel_id = ?
            `, [bookingId, hotelId]);

              if (fullBooking.length > 0) {
                const booking = fullBooking[0];

                // Get hotel admin email
                const [adminRows] = await pool.execute(
                  `SELECT email, name, phone FROM users 
                 WHERE hotel_id = ? AND role = 'admin' AND status = 'active'
                 LIMIT 1`,
                  [hotelId]
                );

                const hotelAdmin = adminRows.length > 0 ? adminRows[0] : null;
                const hotelAdminEmail = hotelAdmin ? hotelAdmin.email : process.env.EMAIL_USER;
                const hotelAdminName = hotelAdmin ? hotelAdmin.name : 'Hotel Admin';
                const hotelAdminPhone = hotelAdmin ? hotelAdmin.phone : null;

                const hotelDetails = {
                  name: booking.hotel_name || 'Hotel',
                  email: hotelAdminEmail,
                  address: ''
                };

                const hotelOwnerDetails = {
                  name: hotelAdminName,
                  email: hotelAdminEmail,
                  phone: hotelAdminPhone
                };

                const customerEmail = booking.customer_email || customer_email;
                const customerName = booking.customer_name || customer_name;
                const customerPhone = booking.customer_phone || customer_phone;

                const customerDetails = {
                  name: customerName,
                  email: customerEmail,
                  phone: customerPhone
                };

                // 1. SEND EMAIL
                if (customerDetails.email) {
                  await EmailService.sendBookingConfirmation(booking, hotelDetails, customerDetails, {
                    companyLogoUrl: companyLogoBase64,
                    companyName: 'Hithlaksh Solutions Private Limited',
                    companyWebsite: 'https://hithlakshsolutions.com/',
                    privacyLink: 'https://hithlakshsolutions.com/privacy',
                    termsLink: 'https://hithlakshsolutions.com/terms'
                  });
                  console.log(`✅ Booking confirmation email sent to customer`);
                } else {
                  console.log(`⚠️ No email for customer - booking ${bookingId}`);
                }

                // 2. SEND WHATSAPP
                if (customerDetails.phone || hotelOwnerDetails.phone) {
                  try {
                    const whatsappResults = await WhatsAppService.sendBookingConfirmationToAll(
                      booking,
                      booking.hotel_name || 'Hotel',
                      customerDetails,
                      hotelOwnerDetails
                    );

                    if (whatsappResults.customer?.success) {
                      console.log(`📱 WhatsApp sent to customer: ${customerDetails.name}`);
                    }
                    if (whatsappResults.hotelOwner?.success) {
                      console.log(`📱 WhatsApp sent to hotel owner: ${hotelOwnerDetails.name}`);
                    }
                  } catch (whatsappError) {
                    console.error(`❌ WhatsApp error:`, whatsappError.message);
                  }
                } else {
                  console.log(`📱 No phone numbers for WhatsApp - booking ${bookingId}`);
                }
              }
            } catch (error) {
              console.error('❌ Error sending booking confirmations:', error);
            }
          }, 1000);
        } catch (error) {
          console.error('❌ Confirmation setup error:', error);
        }
      }

      // ===========================================
      // 9. RESPONSE
      // ===========================================
      const responseData = {
        bookingId: bookingId,
        customerId: finalCustomerId,
        isNewCustomer: isNewCustomer,
        bookingDetails: {
          room_id: room_id,
          room_number: room.room_number,
          from_date: from_date,
          to_date: to_date,
          status: status || 'booked',
          total: parseFloat(total || 0),
          payment_method: payment_method,
          referral_by: referral_by || '',
          referral_amount: parseFloat(referral_amount || 0)
        }
      };

      if (transactionRecord) {
        responseData.transaction = {
          transactionId: generatedTransactionId,
          transactionRecordId: transactionRecord,
          amount: parseFloat(total || 0),
          payment_method: payment_method,
          payment_status: payment_status || 'pending'
        };
      }

      res.status(201).json({
        success: true,
        message: isNewCustomer ? 'New customer and booking created successfully' : 'Booking created successfully',
        data: responseData
      });

    } catch (error) {
      console.error('❌ Create booking error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // getBookings: async (req, res) => {
  //   try {
  //     const hotelId = req.user.hotel_id;
  //     const bookings = await Booking.findByHotelWithDetails(hotelId);

  //     res.json({
  //       success: true,
  //       data: bookings
  //     });

  //   } catch (error) {
  //     console.error('Get bookings error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'SERVER_ERROR',
  //       message: 'Internal server error'
  //     });
  //   }
  // },




  // Get booking by ID

  // In bookingController.js - Update or add this method
  getBookings: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;

      // Modified query to include advance booking details
      const [rows] = await pool.execute(`
      SELECT b.*, 
             c.name as customer_name,
             c.phone as customer_phone,
             c.email as customer_email,
             r.room_number,
             r.type as room_type,
             ab.invoice_number as advance_invoice_number,
             ab.advance_amount as original_advance_amount,
             ab.status as advance_status
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN advance_bookings ab ON b.advance_booking_id = ab.id
      WHERE b.hotel_id = ?
      ORDER BY b.created_at DESC
    `, [hotelId]);

      res.json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },


  getBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      const booking = await Booking.findById(id, hotelId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      // Get customer details if booking has customer
      let customerDetails = null;
      if (booking.customer_id) {
        customerDetails = await Customer.findByIdWithImages(booking.customer_id, hotelId);
      }

      res.json({
        success: true,
        data: {
          ...booking,
          customer: customerDetails
        }
      });

    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  // Update booking
  // updateBooking: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const hotelId = req.user.hotel_id;
  //     const bookingData = req.body;

  //     console.log('📝 Update booking request:', { id, hotelId, bookingData });

  //     // Get current booking details
  //     const currentBooking = await Booking.findById(id, hotelId);
  //     if (!currentBooking) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'BOOKING_NOT_FOUND',
  //         message: 'Booking not found'
  //       });
  //     }

  //     // ===========================================
  //     // CHECK FOR DUPLICATE WHEN UPDATING
  //     // ===========================================
  //     if ((bookingData.room_id || currentBooking.room_id) &&
  //       (bookingData.customer_id || currentBooking.customer_id) &&
  //       (bookingData.from_date || currentBooking.from_date) &&
  //       (bookingData.to_date || currentBooking.to_date)) {

  //       const checkRoomId = bookingData.room_id || currentBooking.room_id;
  //       const checkCustomerId = bookingData.customer_id || currentBooking.customer_id;
  //       const checkFromDate = bookingData.from_date || currentBooking.from_date;
  //       const checkToDate = bookingData.to_date || currentBooking.to_date;

  //       // Skip duplicate check if customer is being removed (null)
  //       if (checkCustomerId) {
  //         const duplicateBooking = await Booking.checkDuplicateBooking(
  //           hotelId,
  //           checkRoomId,
  //           checkCustomerId,
  //           checkFromDate,
  //           checkToDate,
  //           id // Exclude current booking
  //         );

  //         if (duplicateBooking) {
  //           return res.status(400).json({
  //             success: false,
  //             error: 'DUPLICATE_BOOKING',
  //             message: 'Another booking already exists for this customer in the same room and dates',
  //             data: {
  //               existing_booking_id: duplicateBooking.id,
  //               customer_name: duplicateBooking.customer_name,
  //               room_number: duplicateBooking.room_number,
  //               from_date: duplicateBooking.from_date,
  //               to_date: duplicateBooking.to_date,
  //               status: duplicateBooking.status
  //             }
  //           });
  //         }
  //       }
  //     }

  //     // Check room availability if dates or room is changing
  //     if ((bookingData.from_date || bookingData.to_date || bookingData.room_id) &&
  //       bookingData.status !== 'available') {

  //       const checkRoomId = bookingData.room_id || currentBooking.room_id;
  //       const checkFromDate = bookingData.from_date || currentBooking.from_date;
  //       const checkToDate = bookingData.to_date || currentBooking.to_date;
  //       const checkStatus = bookingData.status || currentBooking.status;

  //       const isAvailable = await Booking.checkRoomAvailability(
  //         checkRoomId,
  //         hotelId,
  //         checkFromDate,
  //         checkToDate,
  //         id, // Exclude current booking
  //         checkStatus
  //       );

  //       if (!isAvailable) {
  //         return res.status(400).json({
  //           success: false,
  //           error: 'ROOM_NOT_AVAILABLE',
  //           message: 'Room is not available for the selected dates'
  //         });
  //       }
  //     }

  //     // Update booking
  //     //     const updated = await Booking.update(id, hotelId, bookingData);
  //     //     if (!updated) {
  //     //       return res.status(404).json({
  //     //         success: false,
  //     //         error: 'BOOKING_NOT_FOUND',
  //     //         message: 'Booking not found or not updated'
  //     //       });
  //     //     }

  //     //     // Update room status if needed
  //     //     if (bookingData.status === 'available' || bookingData.status === 'completed') {
  //     //       const updatedBooking = await Booking.findById(id, hotelId);
  //     //       if (updatedBooking && updatedBooking.room_id) {
  //     //         await Room.updateStatus(updatedBooking.room_id, hotelId, 'available');
  //     //       }
  //     //     } else if (bookingData.status === 'booked' && bookingData.room_id) {
  //     //       await Room.updateStatus(bookingData.room_id, hotelId, 'booked');
  //     //     }

  //     //     res.json({
  //     //       success: true,
  //     //       message: 'Booking updated successfully'
  //     //     });

  //     //   } catch (error) {
  //     //     console.error('Update booking error:', error);
  //     //     res.status(500).json({
  //     //       success: false,
  //     //       error: 'SERVER_ERROR',
  //     //       message: 'Internal server error'
  //     //     });
  //     //   }
  //     // },

  //     const updated = await Booking.update(id, hotelId, bookingData);
  //     if (!updated) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'BOOKING_NOT_FOUND',
  //         message: 'Booking not found or not updated'
  //       });
  //     }

  //     // ✅ Explicitly update room status if booking is completed or cancelled
  //     if (bookingData.status === 'completed' || bookingData.status === 'cancelled') {
  //       // Make sure we have the room_id
  //       const roomId = bookingData.room_id || currentBooking.room_id;
  //       if (roomId) {
  //         const Room = require('../models/Room');
  //         await Room.updateStatus(roomId, hotelId, 'available');
  //         console.log(`✅ Room ${roomId} set to available (booking ${bookingData.status})`);
  //       }
  //     }
  //     // If booking is reactivated from completed to booked
  //     else if (bookingData.status === 'booked' && currentBooking.status !== 'booked') {
  //       const roomId = bookingData.room_id || currentBooking.room_id;
  //       if (roomId) {
  //         const Room = require('../models/Room');
  //         await Room.updateStatus(roomId, hotelId, 'booked');
  //         console.log(`✅ Room ${roomId} set to booked`);
  //       }
  //     }

  //     res.json({
  //       success: true,
  //       message: 'Booking updated successfully'
  //     });

  //   } catch (error) {
  //     console.error('Update booking error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'SERVER_ERROR',
  //       message: 'Internal server error'
  //     });
  //   }
  // },

  // Update booking
  // updateBooking: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const hotelId = req.user.hotel_id;
  //     const bookingData = req.body;

  //     console.log('📝 Update booking request:', { id, hotelId, bookingData });

  //     // Get current booking details
  //     const currentBooking = await Booking.findById(id, hotelId);
  //     if (!currentBooking) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'BOOKING_NOT_FOUND',
  //         message: 'Booking not found'
  //       });
  //     }

  //     // ===========================================
  //     // CHECK FOR DUPLICATE WHEN UPDATING
  //     // ===========================================
  //     if ((bookingData.room_id || currentBooking.room_id) &&
  //         (bookingData.customer_id || currentBooking.customer_id) &&
  //         (bookingData.from_date || currentBooking.from_date) &&
  //         (bookingData.to_date || currentBooking.to_date)) {

  //       const checkRoomId = bookingData.room_id || currentBooking.room_id;
  //       const checkCustomerId = bookingData.customer_id || currentBooking.customer_id;
  //       const checkFromDate = bookingData.from_date || currentBooking.from_date;
  //       const checkToDate = bookingData.to_date || currentBooking.to_date;

  //       // Skip duplicate check if customer is being removed (null)
  //       if (checkCustomerId) {
  //         const duplicateBooking = await Booking.checkDuplicateBooking(
  //           hotelId,
  //           checkRoomId,
  //           checkCustomerId,
  //           checkFromDate,
  //           checkToDate,
  //           id // Exclude current booking
  //         );

  //         if (duplicateBooking) {
  //           return res.status(400).json({
  //             success: false,
  //             error: 'DUPLICATE_BOOKING',
  //             message: 'Another booking already exists for this customer in the same room and dates',
  //             data: {
  //               existing_booking_id: duplicateBooking.id,
  //               customer_name: duplicateBooking.customer_name,
  //               room_number: duplicateBooking.room_number,
  //               from_date: duplicateBooking.from_date,
  //               to_date: duplicateBooking.to_date,
  //               status: duplicateBooking.status
  //             }
  //           });
  //         }
  //       }
  //     }

  //     // Check room availability if dates or room is changing
  //     if ((bookingData.from_date || bookingData.to_date || bookingData.room_id) &&
  //         bookingData.status !== 'available') {

  //       const checkRoomId = bookingData.room_id || currentBooking.room_id;
  //       const checkFromDate = bookingData.from_date || currentBooking.from_date;
  //       const checkToDate = bookingData.to_date || currentBooking.to_date;
  //       const checkStatus = bookingData.status || currentBooking.status;

  //       const isAvailable = await Booking.checkRoomAvailability(
  //         checkRoomId,
  //         hotelId,
  //         checkFromDate,
  //         checkToDate,
  //         id, // Exclude current booking
  //         checkStatus
  //       );

  //       if (!isAvailable) {
  //         return res.status(400).json({
  //           success: false,
  //           error: 'ROOM_NOT_AVAILABLE',
  //           message: 'Room is not available for the selected dates'
  //         });
  //       }
  //     }

  //     // Update booking
  //     const updated = await Booking.update(id, hotelId, bookingData);
  //     if (!updated) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'BOOKING_NOT_FOUND',
  //         message: 'Booking not found or not updated'
  //       });
  //     }

  //     // ✅ Additional safety: Update room status if booking is completed or cancelled
  //     // This ensures the room status is updated even if the model method fails
  //     if (bookingData.status === 'completed' || bookingData.status === 'cancelled') {
  //       const roomId = bookingData.room_id || currentBooking.room_id;
  //       if (roomId) {
  //         const Room = require('../models/Room');
  //         await Room.updateStatus(roomId, hotelId, 'available');
  //         console.log(`✅ Room ${roomId} set to available (booking ${bookingData.status})`);
  //       }
  //     }
  //     // If booking is reactivated from completed to booked
  //     else if (bookingData.status === 'booked' && currentBooking.status !== 'booked') {
  //       const roomId = bookingData.room_id || currentBooking.room_id;
  //       if (roomId) {
  //         const Room = require('../models/Room');
  //         await Room.updateStatus(roomId, hotelId, 'booked');
  //         console.log(`✅ Room ${roomId} set to booked`);
  //       }
  //     }

  //     res.json({
  //       success: true,
  //       message: 'Booking updated successfully'
  //     });

  //   } catch (error) {
  //     console.error('Update booking error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'SERVER_ERROR',
  //       message: 'Internal server error'
  //     });
  //   }
  // },

  // Update booking
  updateBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;
      const bookingData = req.body;

      console.log('='.repeat(50));
      console.log('📝 UPDATE BOOKING REQUEST RECEIVED');
      console.log('='.repeat(50));
      console.log('Booking ID:', id);
      console.log('Hotel ID:', hotelId);
      console.log('Request Body:', JSON.stringify(bookingData, null, 2));

      // Get current booking details
      const currentBooking = await Booking.findById(id, hotelId);
      if (!currentBooking) {
        console.log('❌ Booking not found');
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      console.log('📋 Current Booking Details:', {
        id: currentBooking.id,
        room_id: currentBooking.room_id,
        from_date: currentBooking.from_date,
        to_date: currentBooking.to_date,
        status: currentBooking.status
      });

      // ===========================================
      // CHECK FOR DUPLICATE WHEN UPDATING
      // ===========================================
      if ((bookingData.room_id || currentBooking.room_id) &&
        (bookingData.customer_id || currentBooking.customer_id) &&
        (bookingData.from_date || currentBooking.from_date) &&
        (bookingData.to_date || currentBooking.to_date)) {

        const checkRoomId = bookingData.room_id || currentBooking.room_id;
        const checkCustomerId = bookingData.customer_id || currentBooking.customer_id;
        const checkFromDate = bookingData.from_date || currentBooking.from_date;
        const checkToDate = bookingData.to_date || currentBooking.to_date;

        console.log('🔍 Checking for duplicate booking:', {
          checkRoomId,
          checkCustomerId,
          checkFromDate,
          checkToDate,
          excludeBookingId: id
        });

        // Skip duplicate check if customer is being removed (null)
        if (checkCustomerId) {
          const duplicateBooking = await Booking.checkDuplicateBooking(
            hotelId,
            checkRoomId,
            checkCustomerId,
            checkFromDate,
            checkToDate,
            id // Exclude current booking
          );

          console.log('📊 Duplicate check result:', duplicateBooking ? 'DUPLICATE FOUND' : 'No duplicate');

          if (duplicateBooking) {
            console.log('❌ Duplicate booking found:', duplicateBooking);
            return res.status(400).json({
              success: false,
              error: 'DUPLICATE_BOOKING',
              message: 'Another booking already exists for this customer in the same room and dates',
              data: {
                existing_booking_id: duplicateBooking.id,
                customer_name: duplicateBooking.customer_name,
                room_number: duplicateBooking.room_number,
                from_date: duplicateBooking.from_date,
                to_date: duplicateBooking.to_date,
                status: duplicateBooking.status
              }
            });
          }
        }
      }

      // ===========================================
      // CRITICAL: CHECK ROOM AVAILABILITY
      // ===========================================
      // If dates or room is changing, check if the room is available
      if ((bookingData.from_date || bookingData.to_date || bookingData.room_id)) {

        const checkRoomId = bookingData.room_id || currentBooking.room_id;
        const checkFromDate = bookingData.from_date || currentBooking.from_date;
        const checkToDate = bookingData.to_date || currentBooking.to_date;

        // Get the new status (if being updated, otherwise keep current)
        const checkStatus = bookingData.status || currentBooking.status;

        console.log('🔍 CHECKING ROOM AVAILABILITY:', {
          roomId: checkRoomId,
          fromDate: checkFromDate,
          toDate: checkToDate,
          currentStatus: checkStatus,
          excludeBookingId: id
        });

        // Check if room is available for these dates
        const isAvailable = await Booking.checkRoomAvailability(
          checkRoomId,
          hotelId,
          checkFromDate,
          checkToDate,
          id, // Exclude current booking
          checkStatus
        );

        console.log('✅ AVAILABILITY CHECK RESULT:', isAvailable ? 'AVAILABLE ✅' : 'NOT AVAILABLE ❌');

        if (!isAvailable) {
          console.log('❌ ROOM NOT AVAILABLE - Blocking update');
          return res.status(400).json({
            success: false,
            error: 'ROOM_NOT_AVAILABLE',
            message: 'Room is already booked or blocked for the selected dates'
          });
        } else {
          console.log('✅ ROOM IS AVAILABLE - Proceeding with update');
        }
      }

      // Update booking
      console.log('📝 Attempting to update booking with data:', bookingData);
      const updated = await Booking.update(id, hotelId, bookingData);

      console.log('📊 Update result:', updated ? 'SUCCESS ✅' : 'FAILED ❌');

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found or not updated'
        });
      }

      // Update room status if needed
      if (bookingData.status === 'completed' || bookingData.status === 'cancelled') {
        const roomId = bookingData.room_id || currentBooking.room_id;
        if (roomId) {
          const Room = require('../models/Room');
          await Room.updateStatus(roomId, hotelId, 'available');
          console.log(`✅ Room ${roomId} set to available`);
        }
      } else if (bookingData.status === 'booked' && currentBooking.status !== 'booked') {
        const roomId = bookingData.room_id || currentBooking.room_id;
        if (roomId) {
          const Room = require('../models/Room');
          await Room.updateStatus(roomId, hotelId, 'booked');
          console.log(`✅ Room ${roomId} set to booked`);
        }
      }

      console.log('✅ Booking updated successfully');
      console.log('='.repeat(50));

      res.json({
        success: true,
        message: 'Booking updated successfully'
      });

    } catch (error) {
      console.error('❌ UPDATE BOOKING ERROR:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },
  // Update booking payment status
  updateBookingPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;
      const { payment_status, transaction_id } = req.body;

      if (!['pending', 'completed', 'failed'].includes(payment_status)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PAYMENT_STATUS',
          message: 'Invalid payment status'
        });
      }

      const updated = await Booking.updatePaymentStatus(id, hotelId, payment_status, transaction_id);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      // Also update customer payment status if booking has customer
      const booking = await Booking.findById(id, hotelId);
      if (booking && booking.customer_id) {
        await Customer.updatePaymentStatus(booking.customer_id, hotelId, payment_status, transaction_id);
      }

      res.json({
        success: true,
        message: 'Payment status updated successfully'
      });

    } catch (error) {
      console.error('Update booking payment error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  // Get bookings by payment status
  getBookingsByPaymentStatus: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;
      const { status } = req.params;

      if (!['pending', 'completed', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PAYMENT_STATUS',
          message: 'Invalid payment status'
        });
      }

      const bookings = await Booking.getByPaymentStatus(hotelId, status);

      res.json({
        success: true,
        data: bookings
      });

    } catch (error) {
      console.error('Get bookings by payment status error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  // Get today's activities
  getTodaysActivities: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;

      const [checkins, checkouts] = await Promise.all([
        Booking.getTodaysCheckins(hotelId),
        Booking.getTodaysCheckouts(hotelId)
      ]);

      res.json({
        success: true,
        data: {
          checkins,
          checkouts
        }
      });

    } catch (error) {
      console.error('Get today\'s activities error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  // Generate payment QR code
  generatePaymentQR: async (req, res) => {
    try {
      const { amount, booking_id, customer_name } = req.body;
      const hotelId = req.user.hotel_id;

      if (!amount || !booking_id) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Amount and booking ID are required'
        });
      }

      // Generate transaction ID
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Update booking with transaction ID
      await Booking.updatePaymentStatus(booking_id, hotelId, 'pending', transactionId);

      // Generate UPI QR code data
      const upiId = process.env.UPI_ID || 'hotel.management@upi';
      const merchantName = process.env.MERCHANT_NAME || 'Hotel Management';

      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionId)}`;

      res.json({
        success: true,
        data: {
          qr_data: upiString,
          transaction_id: transactionId,
          amount: amount,
          upi_id: upiId,
          merchant_name: merchantName,
          instructions: 'Scan this QR code with any UPI app to pay'
        }
      });

    } catch (error) {
      console.error('Generate payment QR error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to generate payment QR code'
      });
    }
  },

  // Verify payment
  verifyPayment: async (req, res) => {
    try {
      const { transaction_id, booking_id } = req.body;
      const hotelId = req.user.hotel_id;

      if (!transaction_id || !booking_id) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Transaction ID and booking ID are required'
        });
      }

      // In real implementation, verify with payment gateway
      // For demo, simulate successful verification
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        // Update booking payment status
        await Booking.updatePaymentStatus(booking_id, hotelId, 'completed', transaction_id);

        // Get booking to update customer payment status
        const booking = await Booking.findById(booking_id, hotelId);
        if (booking && booking.customer_id) {
          await Customer.updatePaymentStatus(booking.customer_id, hotelId, 'completed', transaction_id);
        }

        res.json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            payment_status: 'completed',
            transaction_id: transaction_id
          }
        });
      } else {
        // Update as failed
        await Booking.updatePaymentStatus(booking_id, hotelId, 'failed', transaction_id);

        res.status(400).json({
          success: false,
          error: 'PAYMENT_FAILED',
          message: 'Payment verification failed'
        });
      }

    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to verify payment'
      });
    }
  },

  // Check room availability
  checkRoomAvailability: async (req, res) => {
    try {
      const { room_id, from_date, to_date, exclude_booking_id } = req.body;
      const hotelId = req.user.hotel_id;

      if (!room_id || !from_date || !to_date) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Room ID, from date, and to date are required'
        });
      }

      const isAvailable = await Booking.checkRoomAvailability(
        room_id,
        hotelId,
        from_date,
        to_date,
        exclude_booking_id
      );

      res.json({
        success: true,
        data: {
          available: isAvailable,
          room_id: room_id,
          from_date: from_date,
          to_date: to_date
        }
      });

    } catch (error) {
      console.error('Check room availability error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  // Update booking status
  updateBookingStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;
      const { status } = req.body;

      if (!['booked', 'maintenance', 'blocked', 'available'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STATUS',
          message: 'Invalid booking status'
        });
      }

      const updated = await Booking.updateStatus(id, hotelId, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      // Update room status if booking is canceled/completed
      const booking = await Booking.findById(id, hotelId);
      if (booking && (status === 'available' || status === 'completed')) {
        await Room.updateStatus(booking.room_id, hotelId, 'available');
      }

      res.json({
        success: true,
        message: 'Booking status updated successfully'
      });

    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  // Delete booking
  deleteBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      // Get booking details before deletion to update room status
      const booking = await Booking.findById(id, hotelId);
      if (booking) {
        // Update room status back to available
        await Room.updateStatus(booking.room_id, hotelId, 'available');
      }

      const deleted = await Booking.delete(id, hotelId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      res.json({
        success: true,
        message: 'Booking deleted successfully'
      });

    } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  getBookingsByDateRange: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: 'DATE_RANGE_REQUIRED',
          message: 'Start date and end date are required'
        });
      }

      const bookings = await Booking.getByDateRange(hotelId, start_date, end_date);

      res.json({
        success: true,
        data: bookings
      });

    } catch (error) {
      console.error('Get bookings by date range error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },



  // Generate invoice for booking
  // generateInvoice: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const hotelId = req.user.hotel_id;

  //     console.log('📄 Generating invoice for booking:', { id, hotelId });

  //     // Get booking with all details
  //     const booking = await Booking.findById(id, hotelId);
  //     if (!booking) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'BOOKING_NOT_FOUND',
  //         message: 'Booking not found'
  //       });
  //     }

  //     // Get customer details if available
  //     let customerDetails = null;
  //     if (booking.customer_id) {
  //       customerDetails = await Customer.findById(booking.customer_id, hotelId);
  //     }

  //     // Get room details
  //     const roomDetails = await Room.findById(booking.room_id, hotelId);

  //     // Get hotel details with phone from users table
  //     const [hotelRows] = await pool.execute(`
  //     SELECT 
  //       h.*,
  //       u.phone as hotel_phone,
  //       u.email as hotel_email
  //     FROM hotels h
  //     LEFT JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
  //     WHERE h.id = ?
  //     LIMIT 1
  //   `, [hotelId]);

  //     const hotelDetails = hotelRows[0] || {};

  //     // ✅ ADD THIS: Get hotel logo
  //     const [logoRows] = await pool.execute(
  //       `SELECT logo_image FROM hotels WHERE id = ?`,
  //       [hotelId]
  //     );
  //     const hotelLogo = logoRows[0]?.logo_image || companyLogoBase64;
  //     console.log('🖼️ Hotel logo loaded:', hotelLogo ? 'Yes' : 'No');

  //     // Format dates
  //     const formatDateDisplay = (dateStr) => {
  //       if (!dateStr) return '';
  //       try {
  //         const date = new Date(dateStr);
  //         return date.toLocaleDateString('en-IN', {
  //           day: '2-digit',
  //           month: 'short',
  //           year: 'numeric'
  //         });
  //       } catch (e) {
  //         return dateStr;
  //       }
  //     };

  //     // Calculate number of days
  //     const calculateNights = (fromDate, toDate) => {
  //       try {
  //         const from = new Date(fromDate);
  //         const to = new Date(toDate);
  //         const diffTime = Math.abs(to - from);
  //         return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //       } catch (e) {
  //         return 1;
  //       }
  //     };

  //     const nights = calculateNights(booking.from_date, booking.to_date);

  //     // Safely calculate per day charge
  //     const amount = parseFloat(booking.amount) || 0;
  //     const perDayCharge = nights > 0 ? amount / nights : amount;

  //     // Helper to safely get values
  //     const safeValue = (value, defaultValue = 0) => {
  //       return value !== null && value !== undefined ? value : defaultValue;
  //     };
  //     const otherExpenses = parseFloat(customerDetails?.other_expenses) || 0;
  //     const expenseDescription = customerDetails?.expense_description || '';

  //     // Invoice data structure
  //     const invoiceData = {
  //       invoiceNumber: booking.invoice_number || `INV-${Date.now().toString().slice(-6)}-${booking.id}`,
  //       invoiceDate: formatDateDisplay(new Date().toISOString()),
  //       hotel: {
  //         name: hotelDetails.name || 'Hotel',
  //         address: hotelDetails.address || '',
  //         phone: hotelDetails.hotel_phone || hotelDetails.phone || '',
  //         gstin: hotelDetails.gst_number || hotelDetails.gstin || '',
  //         email: hotelDetails.hotel_email || hotelDetails.email || '',
  //         logo: hotelLogo  // ✅ ADD HOTEL LOGO HERE
  //       },
  //       customer: customerDetails ? {
  //         name: customerDetails.name || '',
  //         phone: customerDetails.phone || '',
  //         email: customerDetails.email || '',
  //         address: customerDetails.address || '',
  //         city: customerDetails.city || '',
  //         state: customerDetails.state || '',
  //         pincode: customerDetails.pincode || '',
  //         idNumber: customerDetails.id_number || '',
  //         idType: customerDetails.id_type || 'aadhaar',
  //         customerGstNo: customerDetails.customer_gst_no || '',
  //         purposeOfVisit: customerDetails.purpose_of_visit || '',
  //         otherExpenses: otherExpenses,
  //         expenseDescription: expenseDescription
  //       } : {
  //         name: 'Walk-in Customer',
  //         phone: 'N/A'
  //       },
  //       booking: {
  //         id: booking.id || '',
  //         roomNumber: roomDetails?.room_number || booking.room_id || '',
  //         roomType: roomDetails?.type || 'Standard',
  //         fromDate: formatDateDisplay(booking.from_date),
  //         toDate: formatDateDisplay(booking.to_date),
  //         fromTime: booking.from_time || '14:00',
  //         toTime: booking.to_time || '12:00',
  //         status: booking.status || '',
  //         nights: nights,
  //         guests: booking.guests || 1
  //       },
  //       charges: [
  //         {
  //           description: `Room Charges (${nights} night${nights > 1 ? 's' : ''} @ ₹${perDayCharge.toFixed(2)}/night)`,
  //           amount: safeValue(booking.amount)
  //         },
  //         { description: 'Service Charges', amount: safeValue(booking.service) },
  //         { description: 'GST', amount: safeValue(booking.gst) },
  //         ...(otherExpenses > 0 ? [{
  //           description: `Other Expenses${expenseDescription ? ` (${expenseDescription})` : ''}`,
  //           amount: otherExpenses
  //         }] : [])
  //       ],
  //       subtotal: safeValue(booking.amount),
  //       total: safeValue(booking.total),
  //       payment: {
  //         method: booking.payment_method || 'cash',
  //         status: booking.payment_status || 'pending',
  //         transactionId: booking.transaction_id || ''
  //       },
  //       footer: {
  //         note: 'Thank you for your stay with us!',
  //         terms: 'Check-out time is 12:00 PM',
  //         signature: 'Authorized Signature',
  //         companyName: hotelDetails.name || 'Hotel Management System',
  //         companyUrl: 'https://hithlakshsolutions.com/'
  //       }
  //     };

  //     console.log('✅ Invoice data generated:', invoiceData.invoiceNumber);

  //     res.json({
  //       success: true,
  //       message: 'Invoice generated successfully',
  //       data: invoiceData
  //     });

  //   } catch (error) {
  //     console.error('❌ Generate invoice error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'SERVER_ERROR',
  //       message: 'Internal server error: ' + error.message
  //     });
  //   }
  // },
  generateInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      console.log('📄 Generating invoice for booking:', { id, hotelId });

      // Get booking with all details
      const booking = await Booking.findById(id, hotelId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      // Get customer details if available
      let customerDetails = null;
      if (booking.customer_id) {
        customerDetails = await Customer.findById(booking.customer_id, hotelId);
      }

      // Get room details
      const roomDetails = await Room.findById(booking.room_id, hotelId);

      // Get hotel details with phone from users table
      const [hotelRows] = await pool.execute(`
      SELECT 
        h.*,
        u.phone as hotel_phone,
        u.email as hotel_email
      FROM hotels h
      LEFT JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
      WHERE h.id = ?
      LIMIT 1
    `, [hotelId]);

      const hotelDetails = hotelRows[0] || {};

      // Get hotel logo
      const [logoRows] = await pool.execute(
        `SELECT logo_image FROM hotels WHERE id = ?`,
        [hotelId]
      );
      const hotelLogo = logoRows[0]?.logo_image || companyLogoBase64;

      // Format dates
      const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        } catch (e) {
          return dateStr;
        }
      };

      // Calculate number of days
      const calculateNights = (fromDate, toDate) => {
        try {
          const from = new Date(fromDate);
          const to = new Date(toDate);
          const diffTime = Math.abs(to - from);
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (e) {
          return 1;
        }
      };

      const nights = calculateNights(booking.from_date, booking.to_date);

      // Safely calculate per day charge
      const amount = parseFloat(booking.amount) || 0;
      const perDayCharge = nights > 0 ? amount / nights : amount;

      // Helper to safely get values
      const safeValue = (value, defaultValue = 0) => {
        return value !== null && value !== undefined ? value : defaultValue;
      };
      const otherExpenses = parseFloat(customerDetails?.other_expenses) || 0;
      const expenseDescription = customerDetails?.expense_description || '';

      // Get tax values from booking
      const cgst = parseFloat(booking.cgst) || 0;
      const sgst = parseFloat(booking.sgst) || 0;
      const igst = parseFloat(booking.igst) || 0;

      // Determine which tax type was used
      let taxType = 'cgst_sgst';
      let cgstPercentage = 0, sgstPercentage = 0, igstPercentage = 0;

      if (cgst > 0 || sgst > 0) {
        taxType = 'cgst_sgst';
        // Calculate percentages (assuming base amount + service charge)
        const taxableAmount = safeValue(booking.amount) + safeValue(booking.service);
        if (taxableAmount > 0) {
          cgstPercentage = (cgst / taxableAmount) * 100;
          sgstPercentage = (sgst / taxableAmount) * 100;
        }
      } else if (igst > 0) {
        taxType = 'igst';
        const taxableAmount = safeValue(booking.amount) + safeValue(booking.service);
        if (taxableAmount > 0) {
          igstPercentage = (igst / taxableAmount) * 100;
        }
      }

      // Create charges array with proper tax breakdown
      const charges = [
        {
          description: `Room Charges (${nights} night${nights > 1 ? 's' : ''} @ ₹${perDayCharge.toFixed(2)}/night)`,
          amount: safeValue(booking.amount)
        },
        {
          description: 'Service Charges',
          amount: safeValue(booking.service)
        }
      ];

      // Add tax charges based on what's present
      if (cgst > 0) {
        charges.push({
          description: `CGST @ ${cgstPercentage.toFixed(2)}%`,
          amount: cgst
        });
      }

      if (sgst > 0) {
        charges.push({
          description: `SGST @ ${sgstPercentage.toFixed(2)}%`,
          amount: sgst
        });
      }

      if (igst > 0) {
        charges.push({
          description: `IGST @ ${igstPercentage.toFixed(2)}%`,
          amount: igst
        });
      }

      // Add other expenses if any
      if (otherExpenses > 0) {
        charges.push({
          description: `Other Expenses${expenseDescription ? ` (${expenseDescription})` : ''}`,
          amount: otherExpenses
        });
      }

      // Invoice data structure
      const invoiceData = {
        invoiceNumber: booking.invoice_number || `INV-${Date.now().toString().slice(-6)}-${booking.id}`,
        invoiceDate: formatDateDisplay(new Date().toISOString()),
        taxType: taxType, // Add tax type to identify which was used
        hotel: {
          name: hotelDetails.name || 'Hotel',
          address: hotelDetails.address || '',
          phone: hotelDetails.hotel_phone || hotelDetails.phone || '',
          gstin: hotelDetails.gst_number || hotelDetails.gstin || '',
          email: hotelDetails.hotel_email || hotelDetails.email || '',
          logo: hotelLogo
        },
        customer: customerDetails ? {
          name: customerDetails.name || '',
          phone: customerDetails.phone || '',
          email: customerDetails.email || '',
          address: customerDetails.address || '',
          city: customerDetails.city || '',
          state: customerDetails.state || '',
          pincode: customerDetails.pincode || '',
          idNumber: customerDetails.id_number || '',
          idType: customerDetails.id_type || 'aadhaar',
          customerGstNo: customerDetails.customer_gst_no || '',
          purposeOfVisit: customerDetails.purpose_of_visit || '',
          otherExpenses: otherExpenses,
          expenseDescription: expenseDescription
        } : {
          name: 'Walk-in Customer',
          phone: 'N/A'
        },
        booking: {
          id: booking.id || '',
          roomNumber: roomDetails?.room_number || booking.room_id || '',
          roomType: roomDetails?.type || 'Standard',
          fromDate: formatDateDisplay(booking.from_date),
          toDate: formatDateDisplay(booking.to_date),
          fromTime: booking.from_time || '14:00',
          toTime: booking.to_time || '12:00',
          status: booking.status || '',
          nights: nights,
          guests: booking.guests || 1
        },
        charges: charges,
        subtotal: safeValue(booking.amount) + safeValue(booking.service),
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        total: safeValue(booking.total),
        payment: {
          method: booking.payment_method || 'cash',
          status: booking.payment_status || 'pending',
          transactionId: booking.transaction_id || ''
        },
        footer: {
          note: 'Thank you for your stay with us!',
          terms: 'Check-out time is 12:00 PM',
          signature: 'Authorized Signature',
          companyName: hotelDetails.name || 'Hotel Management System',
          companyUrl: 'https://hithlakshsolutions.com/'
        }
      };

      console.log('✅ Invoice data generated:', invoiceData.invoiceNumber);

      res.json({
        success: true,
        message: 'Invoice generated successfully',
        data: invoiceData
      });

    } catch (error) {
      console.error('❌ Generate invoice error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },


  downloadInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      console.log('📥 Downloading invoice for booking:', { id, hotelId });

      // Get booking with all details
      const booking = await Booking.findById(id, hotelId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      // Get all related data
      let customerDetails = null;
      if (booking.customer_id) {
        customerDetails = await Customer.findById(booking.customer_id, hotelId);
      }

      const roomDetails = await Room.findById(booking.room_id, hotelId);

      // Get hotel details
      const [hotelRows] = await pool.execute(`
      SELECT 
        h.*,
        u.phone as hotel_phone,
        u.email as hotel_email
      FROM hotels h
      LEFT JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
      WHERE h.id = ?
      LIMIT 1
    `, [hotelId]);

      const hotelDetails = hotelRows[0] || {};

      // Get hotel logo
      const [logoRows] = await pool.execute(
        `SELECT logo_image FROM hotels WHERE id = ?`,
        [hotelId]
      );
      const hotelLogo = logoRows[0]?.logo_image || companyLogoBase64;

      // Format dates
      const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        } catch (e) {
          return dateStr;
        }
      };

      const calculateNights = (fromDate, toDate) => {
        if (!fromDate || !toDate) return 1;
        try {
          const from = new Date(fromDate);
          const to = new Date(toDate);
          const diffTime = Math.abs(to - from);
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (e) {
          return 1;
        }
      };

      // Helper functions
      const formatCurrency = (value) => {
        if (value === null || value === undefined) return '0.00';
        const num = parseFloat(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
      };

      const getString = (value, defaultValue = '') => {
        return value !== null && value !== undefined ? String(value) : defaultValue;
      };

      // Company details
      const companyLogoUrl = companyLogoBase64;
      const companyName = 'Hithlaksh Solutions Private Limited';
      const companyUrl = 'https://hithlakshsolutions.com/';

      // Calculate amounts
      const nights = calculateNights(booking.from_date, booking.to_date);
      const roomAmount = parseFloat(booking.amount) || 0;
      const serviceAmount = parseFloat(booking.service) || 0;
      const cgstAmount = parseFloat(booking.cgst) || 0;
      const sgstAmount = parseFloat(booking.sgst) || 0;
      const igstAmount = parseFloat(booking.igst) || 0;
      const totalAmount = parseFloat(booking.total) || 0;
      const perNightRate = nights > 0 ? roomAmount / nights : roomAmount;

      const otherExpenses = parseFloat(customerDetails?.other_expenses) || 0;
      const expenseDescription = customerDetails?.expense_description || '';

      // Calculate percentages
      const taxableAmount = roomAmount + serviceAmount;
      let cgstPercentage = 0, sgstPercentage = 0, igstPercentage = 0;

      if (taxableAmount > 0) {
        if (cgstAmount > 0) cgstPercentage = (cgstAmount / taxableAmount) * 100;
        if (sgstAmount > 0) sgstPercentage = (sgstAmount / taxableAmount) * 100;
        if (igstAmount > 0) igstPercentage = (igstAmount / taxableAmount) * 100;
      }

      // Determine which tax type was used
      const taxType = igstAmount > 0 ? 'igst' : 'cgst_sgst';

      // Create HTML invoice with compact styling for single page
      const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice - Booking ${getString(booking.id)}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 15px; 
          line-height: 1.3; 
          color: #333;
          font-size: 11px; 
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 8px; 
          padding-bottom: 4px; 
          border-bottom: 1px solid #2c3e50; 
        }
        .logo-section { 
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .hotel-logo {
          max-width: 80px; /* SMALLER logo */
          max-height: 40px; /* SMALLER logo */
          height: auto;
          margin-bottom: 3px; 
          object-fit: contain;
          border-radius: 3px;
        }
        .hotel-details { 
          text-align: right; 
          flex: 1;
        }
        .hotel-name { 
          font-size: 16px; 
          font-weight: bold; 
          color: #2c3e50; 
          margin-bottom: 3px; 
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .hotel-info { 
          font-size: 10px; 
          color: #666; 
          line-height: 1.2; 
        }
        .invoice-title { 
          text-align: center; 
          font-size: 16px; 
          margin: 5px 0; 
          color: #2c3e50; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          padding: 4px; 
          background-color: #f8f9fa;
          border-radius: 4px;
          font-weight: bold;
        }
        .details-section { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 6px; 
          gap: 8px; 
        }
        .details-box { 
          flex: 1; 
          padding: 6px; 
          background-color: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }
        .details-label { 
          font-weight: bold; 
          color: #2c3e50; 
          margin-bottom: 3px; 
          display: block; 
          font-size: 11px; 
          padding-bottom: 2px; 
          border-bottom: 1px solid #3498db; 
        }
        .table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 0; 
          box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
          font-size: 10px; 
        }
        .table th { 
          background-color: #2c3e50; 
          color: white;
          padding: 4px 6px; 
          text-align: left; 
          border-bottom: 1px solid #1a252f; 
          font-weight: bold; 
          font-size: 10px; 
        }
        .table td { 
          padding: 4px 6px; 
          border-bottom: 1px solid #e0e0e0; 
          font-size: 10px; 
        }
        .total-row { 
          font-weight: bold; 
          font-size: 12px; 
          background-color: #e8f4fd;
        }
        .total-row td {
          border-top: 1px solid #3498db; 
          color: #2c3e50;
        }
        .footer { 
          margin-top: 10px; 
          text-align: center; 
          font-size: 9px; 
          color: #666; 
          padding-top: 5px; 
          border-top: 1px dashed #ddd; 
        }
        .company-footer { 
          margin-top: 10px; 
          padding: 6px; 
          background-color: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }
        .company-info { 
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 5px; 
          margin-bottom: 2px; 
          flex-wrap: wrap;
        }
        .company-logo-small { 
          width: 18px; /* EVEN SMALLER logo */
          height: auto;
          border-radius: 3px;
        }
        .company-name { 
          font-size: 10px; 
          font-weight: bold; 
          color: #2c3e50; 
          white-space: nowrap; /* Keep in one line */
        }
        .company-url { 
          font-size: 9px; 
          color: #0066cc; 
          text-decoration: none;
          white-space: nowrap; /* Keep in one line */
        }
        .company-url a {
          color: #0066cc;
          text-decoration: none;
        }
        .company-url a:hover {
          text-decoration: underline;
        }
        .signature { 
          margin: 10px auto 0; 
          padding-top: 5px; 
          width: 150px; 
          text-align: center;
        }
        .barcode { 
          text-align: center; 
          font-family: 'Courier New', monospace; 
          letter-spacing: 1px; 
          margin-top: 6px; 
          background-color: #f5f5f5; 
          padding: 5px; 
          border-radius: 3px;
          font-size: 12px; 
          font-weight: bold;
          color: #2c3e50;
          border: 1px dashed #ccc;
        }
        .payment-status {
          display: inline-block;
          padding: 2px 6px; 
          border-radius: 10px; 
          font-size: 9px; 
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }
        .status-completed {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .invoice-number {
          font-size: 12px; 
          color: #2c3e50;
          font-weight: bold;
          text-align: center;
          margin-bottom: 6px; 
          padding: 4px; 
          background-color: #f8f9fa;
          border-radius: 3px;
        }
        .tax-badge {
          display: inline-block;
          padding: 2px 5px; 
          border-radius: 8px; 
          font-size: 9px; 
          font-weight: bold;
          margin-left: 4px; 
        }
        .tax-cgst-sgst {
          background-color: #e3f2fd;
          color: #1565c0;
          border: 1px solid #90caf9;
        }
        .tax-igst {
          background-color: #f3e5f5;
          color: #7b1fa2;
          border: 1px solid #ce93d8;
        }
        
        /* INLINE COMPANY INFO STYLES */
        .company-info-inline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex-wrap: nowrap; /* Force single line */
        }
        .company-info-inline .separator {
          color: #999;
          margin: 0 2px;
        }
        
        /* PRINT SPECIFIC STYLES */
        @media print {
          body { 
            margin: 0; 
            padding: 8px; 
            font-size: 9px; 
          }
          .no-print { 
            display: none; 
          }
          .hotel-logo { 
            max-width: 60px !important; 
            max-height: 30px !important; 
          }
          .company-logo-small {
            width: 16px !important;
          }
          .header, .invoice-title, .details-section, .table, .footer {
            page-break-inside: avoid;
          }
          
          /* ENSURE SINGLE PAGE */
          html, body {
            height: auto;
            overflow: visible;
          }
          
          /* COMPRESS FURTHER FOR PRINT */
          .details-box {
            padding: 4px;
          }
          .table td, .table th {
            padding: 3px 4px;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          ${hotelLogo ? `
            <img src="${hotelLogo}" alt="Hotel Logo" class="hotel-logo">
            <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">
              ${getString(hotelDetails.name, 'Hotel Management')}
            </div>
          ` : `
            <div class="hotel-name">${getString(hotelDetails.name, 'Hotel Management')}</div>
          `}
        </div>
        <div class="hotel-details">
          <div class="hotel-info">
            ${getString(hotelDetails.address, 'Address not specified')}<br>
            📞 ${getString(hotelDetails.hotel_phone || hotelDetails.phone, 'N/A')} | 
            🏷️ GST: ${getString(hotelDetails.gst_number, 'N/A')}<br>
            📧 ${getString(hotelDetails.hotel_email || hotelDetails.email, 'N/A')}
          </div>
        </div>
      </div>
      
      
      <div class="invoice-number">
       INVOICE: ${getString(booking.invoice_number)} | 
        Date: ${formatDateDisplay(new Date().toISOString())}
      </div>
      
      <!-- Bill To and Booking & Payment Details Side by Side -->
      <div class="details-section">
        <!-- Bill To Section -->
        <div class="details-box">
          <span class="details-label">Bill To:</span>
          <div style="font-size: 12px; margin-bottom: 3px;">
            <strong>${getString(customerDetails?.name, 'Walk-in Customer')}</strong>
          </div>
          <div>📱 ${getString(customerDetails?.phone, 'N/A')}</div>
          <div>📧 ${getString(customerDetails?.email, 'No email')}</div>
          <div>📍 ${getString(customerDetails?.address || 'No address')}</div>
          <div>${getString(customerDetails?.city)} ${getString(customerDetails?.state)} - ${getString(customerDetails?.pincode)}</div>
          ${customerDetails?.customer_gst_no ? `
            <div style="margin-top: 4px; padding: 2px; background-color: #f0f8ff; border-radius: 3px;">
              <strong>GST:</strong> ${getString(customerDetails.customer_gst_no)}
            </div>
          ` : ''}
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #ddd;">
            <strong>ID:</strong> ${getString(customerDetails?.id_number, 'N/A')} (${getString(customerDetails?.id_type, 'N/A')})
          </div>
        </div>
        
        <!-- Booking & Payment Details Section -->
        <div class="details-box">
          <span class="details-label">Booking & Payment Details:</span>
          <div><strong>Room:</strong> ${getString(roomDetails?.room_number || booking.room_id)} (${getString(roomDetails?.type, 'Standard')})</div>
          <div><strong>Check-in:</strong> ${formatDateDisplay(booking.from_date)} ${getString(booking.from_time, '14:00')}</div>
          <div><strong>Check-out:</strong> ${formatDateDisplay(booking.to_date)} ${getString(booking.to_time, '12:00')}</div>
          <div><strong>Duration:</strong> ${nights} Night(s)</div>
          <div><strong>Guests:</strong> ${getString(booking.guests, '1')}</div>
          <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #ddd;">
            <div><strong>Payment Method:</strong> ${getString(booking.payment_method, 'cash')}</div>
            <div><strong>Payment Status:</strong> 
              <span class="payment-status status-${getString(booking.payment_status, 'pending')}">
                ${getString(booking.payment_status, 'pending')}
              </span>
            </div>
            ${booking.transaction_id ? `<div><strong>TXN ID:</strong> ${getString(booking.transaction_id)}</div>` : ''}
          </div>
        </div>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Room Charges<br>
              <small>₹${formatCurrency(perNightRate)}/night × ${nights} night(s)</small>
            </td>
            <td style="text-align: right;">${formatCurrency(roomAmount)}</td>
          </tr>
          <tr>
            <td>Service Charges</td>
            <td style="text-align: right;">${formatCurrency(serviceAmount)}</td>
          </tr>
          
          <!-- CGST and SGST (if applicable) -->
          ${cgstAmount > 0 ? `
            <tr>
              <td>CGST ${cgstPercentage > 0 ? `@ ${cgstPercentage.toFixed(2)}%` : ''}</td>
              <td style="text-align: right;">${formatCurrency(cgstAmount)}</td>
            </tr>
          ` : ''}
          
          ${sgstAmount > 0 ? `
            <tr>
              <td>SGST ${sgstPercentage > 0 ? `@ ${sgstPercentage.toFixed(2)}%` : ''}</td>
              <td style="text-align: right;">${formatCurrency(sgstAmount)}</td>
            </tr>
          ` : ''}
          
          <!-- IGST (if applicable) -->
          ${igstAmount > 0 ? `
            <tr>
              <td>IGST ${igstPercentage > 0 ? `@ ${igstPercentage.toFixed(2)}%` : ''}</td>
              <td style="text-align: right;">${formatCurrency(igstAmount)}</td>
            </tr>
          ` : ''}
          
          ${otherExpenses > 0 ? `
            <tr>
              <td>
                Other Expenses${expenseDescription ? `<br><small>${expenseDescription}</small>` : ''}
              </td>
              <td style="text-align: right;">${formatCurrency(otherExpenses)}</td>
            </tr>
          ` : ''}
          
          <!-- Tax Summary Row -->
          ${(cgstAmount > 0 || sgstAmount > 0 || igstAmount > 0) ? `
            <tr style="background-color: #f8f9fa;">
              <td>
                <strong>Tax Summary</strong><br>
                <small>
                  ${cgstAmount > 0 ? `CGST: ${formatCurrency(cgstAmount)} ` : ''}
                  ${sgstAmount > 0 ? `SGST: ${formatCurrency(sgstAmount)} ` : ''}
                  ${igstAmount > 0 ? `IGST: ${formatCurrency(igstAmount)}` : ''}
                </small>
              </td>
              <td style="text-align: right;">
                <strong>₹${formatCurrency(cgstAmount + sgstAmount + igstAmount)}</strong>
              </td>
            </tr>
          ` : ''}
          
          <tr class="total-row">
            <td><strong>TOTAL AMOUNT (INR)</strong></td>
            <td style="text-align: right; font-size: 14px;">
              <strong>₹${formatCurrency(totalAmount)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
     
      <!-- Footer -->
      <div class="footer">
        <div style="margin-bottom: 5px;">
          <div style="font-size: 10px; margin-bottom: 3px;">
            <strong>Terms:</strong>
          </div>
          <div style="font-size: 8px; color: #666; line-height: 1.2;">
            1. Check-out: 12:00 PM | 2. Computer-generated invoice | 3. Subject to ${getString(hotelDetails.state, 'local')} jurisdiction
          </div>
        </div>
        
        <div class="signature">
          <div style="border-top: 1px solid #000; width: 140px; margin: 0 auto; padding-top: 3px;">
            <strong>Authorized Signature</strong>
          </div>
          <div style="margin-top: 2px; font-size: 8px; color: #666;">
            For ${getString(hotelDetails.name, 'Hotel Management')}
          </div>
        </div>
        
        <div class="company-footer">
          <div class="company-info">
            <!-- Company logo and name in one line -->
            <div class="company-info-inline">
              <img src="${companyLogoUrl}" alt="Company Logo" class="company-logo-small">
              <span class="company-name">${companyName}</span>
              <span class="separator">|</span>
              <span class="company-url">
                <a href="${companyUrl}" target="_blank">${companyUrl}</a>
              </span>
            </div>
          </div>
        </div>
        
        <div class="barcode">
          INV${getString(booking.id).padStart(6, '0')}
        </div>
        
        <div style="margin-top: 5px; font-size: 8px; color: #999;">
          <div>Generated: ${new Date().toLocaleString('en-IN')} | <strong>E. & O.E.</strong></div>
        </div>
      </div>
    </body>
    </html>
  `;

      // Set response headers for HTML download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${getString(booking.id)}.html"`);

      res.send(invoiceHTML);

    } catch (error) {
      console.error('❌ Download invoice error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // ===========================================
  // NEW: SEND MANUAL CHECKOUT REMINDER
  // ===========================================
  sendCheckoutReminder: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      // Get booking details
      const [bookingRows] = await pool.execute(`
        SELECT b.*, r.room_number,
               c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
               h.name as hotel_name, h.email as hotel_email, h.phone as hotel_phone, 
               h.address as hotel_address
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN hotels h ON b.hotel_id = h.id
        WHERE b.id = ? AND b.hotel_id = ? AND b.status = 'booked'
      `, [id, hotelId]);

      if (bookingRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found or not active'
        });
      }

      const booking = bookingRows[0];

      // Check if checkout time is approaching (within 2 hours)
      const now = new Date();
      const checkoutTime = new Date(`${booking.to_date} ${booking.to_time || '12:00'}`);
      const timeDiff = checkoutTime - now;
      const hoursUntilCheckout = timeDiff / (1000 * 60 * 60);

      if (hoursUntilCheckout > 2) {
        return res.status(400).json({
          success: false,
          error: 'TOO_EARLY',
          message: 'Checkout reminder can only be sent within 2 hours of checkout time'
        });
      }

      const hotelDetails = {
        name: booking.hotel_name,
        email: booking.hotel_email,
        phone: booking.hotel_phone,
        address: booking.hotel_address
      };

      const customerDetails = {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone
      };

      if (!customerDetails.email) {
        return res.status(400).json({
          success: false,
          error: 'NO_EMAIL',
          message: 'Customer does not have an email address'
        });
      }

      // Send checkout reminder email
      await EmailService.sendCheckoutReminder(booking, hotelDetails, customerDetails);

      res.json({
        success: true,
        message: 'Checkout reminder sent successfully'
      });

    } catch (error) {
      console.error('❌ Send checkout reminder error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // ===========================================
  // NEW: RESEND BOOKING CONFIRMATION
  // ===========================================
  resendConfirmation: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      // Get booking details
      const [bookingRows] = await pool.execute(`
        SELECT b.*, r.room_number, r.type as room_type,
               c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
               h.name as hotel_name, h.email as hotel_email, h.phone as hotel_phone, 
               h.address as hotel_address
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN hotels h ON b.hotel_id = h.id
        WHERE b.id = ? AND b.hotel_id = ?
      `, [id, hotelId]);

      if (bookingRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      const booking = bookingRows[0];

      const hotelDetails = {
        name: booking.hotel_name,
        email: booking.hotel_email,
        phone: booking.hotel_phone,
        address: booking.hotel_address
      };

      const customerDetails = {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone
      };

      if (!customerDetails.email) {
        return res.status(400).json({
          success: false,
          error: 'NO_EMAIL',
          message: 'Customer does not have an email address'
        });
      }

      // Resend confirmation email
      await EmailService.sendBookingConfirmation(booking, hotelDetails, customerDetails);

      res.json({
        success: true,
        message: 'Booking confirmation resent successfully'
      });

    } catch (error) {
      console.error('❌ Resend confirmation error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // ===========================================
  // NEW: GET UPCOMING CHECKOUTS
  // ===========================================
  getUpcomingCheckouts: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;
      const { hours = 2 } = req.query; // Default: next 2 hours

      const now = new Date();
      const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));

      const [bookings] = await pool.execute(`
        SELECT b.*, r.room_number,
               c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
               TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(b.to_date, ' ', b.to_time)) as minutes_until_checkout
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE b.hotel_id = ? 
        AND b.status = 'booked'
        AND CONCAT(b.to_date, ' ', b.to_time) BETWEEN NOW() AND ?
        ORDER BY b.to_date, b.to_time
      `, [hotelId, futureTime]);

      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });

    } catch (error) {
      console.error('❌ Get upcoming checkouts error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },


  updateInvoiceNumber: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;
      const { invoice_number } = req.body;

      if (!invoice_number || invoice_number.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'INVOICE_NUMBER_REQUIRED',
          message: 'Invoice number is required'
        });
      }

      // Check if invoice number already exists (excluding current booking)
      const exists = await Booking.checkInvoiceNumberExists(invoice_number, hotelId, id);
      if (exists) {
        return res.status(400).json({
          success: false,
          error: 'INVOICE_NUMBER_EXISTS',
          message: 'This invoice number is already in use'
        });
      }

      // Update invoice number
      const updated = await Booking.updateInvoiceNumber(id, hotelId, invoice_number);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      res.json({
        success: true,
        message: 'Invoice number updated successfully',
        data: { invoice_number }
      });

    } catch (error) {
      console.error('❌ Update invoice number error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // Add this method to bookingController.js
  // createPastBooking: async (req, res) => {
  //   try {
  //     const {
  //       room_id,
  //       customer_id,
  //       from_date,
  //       to_date,
  //       from_time = '14:00',
  //       to_time = '12:00',
  //       amount,
  //       service,
  //       gst,
  //       total,
  //       status = 'booked',
  //       guests = 1,
  //       special_requests = '',
  //       id_type = 'aadhaar',
  //       payment_method = 'cash',
  //       payment_status = 'completed',
  //       transaction_id,
  //       customer_name,
  //       customer_phone,
  //       customer_email,
  //       customer_id_number,
  //       id_image,
  //       id_image2,
  //       address,
  //       city,
  //       state,
  //       pincode,
  //       customer_gst_no,
  //       purpose_of_visit,
  //       other_expenses = 0,
  //       expense_description = '',
  //       referral_by,
  //       referral_amount = 0,
  //       invoice_number,
  //       booking_date, // Optional: actual booking date (when booking was made)
  //       check_in_date, // Actual check-in date (could be in past)
  //       check_out_date // Actual check-out date (could be in past)
  //     } = req.body;

  //     const hotelId = req.user.hotel_id;
  //     let finalCustomerId = customer_id;
  //     let isNewCustomer = false;

  //     console.log('📝 Create past booking request:', {
  //       hotelId,
  //       room_id,
  //       from_date: from_date || check_in_date,
  //       to_date: to_date || check_out_date,
  //       customer_name,
  //       customer_phone,
  //       booking_date,
  //       actual_booking_date: booking_date
  //     });

  //     // ===========================================
  //     // 1. VALIDATE ROOM
  //     // ===========================================
  //     const room = await Room.findById(room_id, hotelId);
  //     if (!room) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'ROOM_NOT_FOUND',
  //         message: 'Room not found'
  //       });
  //     }

  //     // ===========================================
  //     // 2. CUSTOMER HANDLING
  //     // ===========================================
  //     if (customer_name && customer_phone) {
  //       try {
  //         // Check if customer already exists with same phone
  //         const existingCustomer = await Customer.findByPhone(customer_phone, hotelId);

  //         if (existingCustomer) {
  //           finalCustomerId = existingCustomer.id;
  //           console.log('✅ Found existing customer:', {
  //             customerId: finalCustomerId,
  //             name: existingCustomer.name
  //           });

  //           // Update existing customer if needed
  //           if (customer_email || address) {
  //             await Customer.update(existingCustomer.id, hotelId, {
  //               name: customer_name,
  //               phone: customer_phone,
  //               email: customer_email || existingCustomer.email,
  //               id_number: customer_id_number || existingCustomer.id_number,
  //               id_type: id_type || 'aadhaar',
  //               id_image: id_image || existingCustomer.id_image,
  //               id_image2: id_image2 || existingCustomer.id_image2,
  //               address: address || existingCustomer.address,
  //               city: city || existingCustomer.city,
  //               state: state || existingCustomer.state,
  //               pincode: pincode || existingCustomer.pincode,
  //               customer_gst_no: customer_gst_no || existingCustomer.customer_gst_no,
  //               purpose_of_visit: purpose_of_visit || existingCustomer.purpose_of_visit,
  //               other_expenses: other_expenses || existingCustomer.other_expenses || 0,
  //               expense_description: expense_description || existingCustomer.expense_description
  //             });
  //           }
  //         } else {
  //           // Create new customer
  //           finalCustomerId = await Customer.create({
  //             hotel_id: hotelId,
  //             name: customer_name,
  //             phone: customer_phone,
  //             email: customer_email || '',
  //             id_number: customer_id_number || '',
  //             id_type: id_type || 'aadhaar',
  //             id_image: id_image || null,
  //             id_image2: id_image2 || null,
  //             payment_method: payment_method || 'cash',
  //             payment_status: payment_status || 'completed',
  //             transaction_id: transaction_id || null,
  //             address: address || '',
  //             city: city || '',
  //             state: state || '',
  //             pincode: pincode || '',
  //             customer_gst_no: customer_gst_no,
  //             purpose_of_visit: purpose_of_visit || null,
  //             other_expenses: other_expenses || 0,
  //             expense_description: expense_description || null
  //           });
  //           isNewCustomer = true;
  //           console.log('✅ Created new customer:', { customerId: finalCustomerId });
  //         }
  //       } catch (customerError) {
  //         console.error('❌ Customer creation error:', customerError);
  //         return res.status(500).json({
  //           success: false,
  //           error: 'CUSTOMER_CREATION_FAILED',
  //           message: 'Failed to create/update customer'
  //         });
  //       }
  //     }

  //     // ===========================================
  //     // 3. CHECK IF DATES ARE VALID (ALLOW PAST DATES)
  //     // ===========================================
  //     const actualFromDate = from_date || check_in_date;
  //     const actualToDate = to_date || check_out_date;
  //     const actualBookingDate = booking_date || new Date().toISOString().split('T')[0];

  //     if (!actualFromDate || !actualToDate) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'DATES_REQUIRED',
  //         message: 'Check-in and check-out dates are required'
  //       });
  //     }

  //     // Parse dates
  //     const fromDate = new Date(actualFromDate);
  //     const toDate = new Date(actualToDate);
  //     const bookingDate = new Date(actualBookingDate);

  //     // Validate date order (to should be after from)
  //     if (toDate <= fromDate) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'INVALID_DATE_RANGE',
  //         message: 'Check-out date must be after check-in date'
  //       });
  //     }

  //     // Allow past dates - don't validate against current date
  //     console.log('📅 Date validation passed (past dates allowed):', {
  //       fromDate: fromDate.toISOString(),
  //       toDate: toDate.toISOString(),
  //       bookingDate: bookingDate.toISOString(),
  //       isPastDate: fromDate < new Date()
  //     });

  //     // ===========================================
  //     // 4. CHECK ROOM AVAILABILITY (Skip for past bookings)
  //     // ===========================================
  //     // For past bookings, we skip availability check since it's historical data
  //     // But we can still check for logical conflicts if needed
  //     const today = new Date();
  //     if (fromDate >= today) {
  //       // Only check availability for future dates
  //       const isAvailable = await Booking.checkRoomAvailability(room_id, hotelId, actualFromDate, actualToDate, null, status);
  //       if (!isAvailable) {
  //         return res.status(400).json({
  //           success: false,
  //           error: 'ROOM_NOT_AVAILABLE',
  //           message: 'Room is not available for the selected dates'
  //         });
  //       }
  //     } else {
  //       console.log('⚠️ Past date booking - skipping availability check');
  //     }

  //     // ===========================================
  //     // 5. CREATE BOOKING WITH PAST DATES
  //     // ===========================================
  //     let finalInvoiceNumber = invoice_number;
  //     if (!finalInvoiceNumber) {
  //       finalInvoiceNumber = await Booking.getNextInvoiceNumber(hotelId);
  //     }

  //     const otherExpenses = parseFloat(other_expenses) || 0;
  //     const calculatedTotal = parseFloat(amount || 0) +
  //       parseFloat(service || 0) +
  //       parseFloat(gst || 0) +
  //       otherExpenses;

  //     const finalTotal = parseFloat(total || calculatedTotal);

  //     const bookingData = {
  //       hotel_id: hotelId,
  //       room_id,
  //       customer_id: status === 'booked' ? finalCustomerId : null,
  //       from_date: actualFromDate,
  //       to_date: actualToDate,
  //       from_time: from_time,
  //       to_time: to_time,
  //       amount: parseFloat(amount || 0),
  //       service: parseFloat(service || 0),
  //       gst: parseFloat(gst || 0),
  //       total: finalTotal,
  //       invoice_number: finalInvoiceNumber,
  //       status: status,
  //       guests: parseInt(guests || 1),
  //       special_requests: special_requests || '',
  //       id_type: id_type || 'aadhaar',
  //       payment_method: payment_method || 'cash',
  //       payment_status: payment_status || 'completed',
  //       transaction_id: transaction_id || null,
  //       referral_by: referral_by || '',
  //       referral_amount: parseFloat(referral_amount || 0),
  //       // Add booking metadata for past bookings
  //       booking_date: actualBookingDate, // When booking was actually made
  //       is_past_booking: fromDate < new Date() ? 1 : 0,
  //       created_at: bookingDate.toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
  //     };

  //     console.log('📅 Creating past booking:', bookingData);

  //     let bookingId;
  //     if (status === 'booked' && finalCustomerId) {
  //       bookingId = await Booking.create(bookingData);
  //     } else {
  //       bookingId = await Booking.createWithoutCustomer(bookingData);
  //     }

  //     console.log('✅ Past booking created successfully:', { bookingId });

  //     // ===========================================
  //     // 6. UPDATE ROOM STATUS (Only if dates are current/future)
  //     // ===========================================
  //     if (status === 'booked' && fromDate >= today) {
  //       await Room.updateStatus(room_id, hotelId, 'booked');
  //       console.log('✅ Room status updated to booked');
  //     }

  //     // ===========================================
  //     // 7. CREATE COLLECTION FOR PAST BOOKING
  //     // ===========================================
  //     if (payment_method === 'cash' && status === 'booked') {
  //       try {
  //         await Collection.createFromCashBooking(bookingId, hotelId, req.user.userId);
  //         console.log('✅ Auto-created collection for past cash booking');
  //       } catch (collectionError) {
  //         console.error('❌ Failed to auto-create collection:', collectionError);
  //       }
  //     }

  //     // ===========================================
  //     // 8. RESPONSE
  //     // ===========================================
  //     const responseData = {
  //       bookingId: bookingId,
  //       customerId: finalCustomerId,
  //       isNewCustomer: isNewCustomer,
  //       isPastBooking: fromDate < new Date(),
  //       bookingDetails: {
  //         room_id: room_id,
  //         room_number: room.room_number,
  //         from_date: actualFromDate,
  //         to_date: actualToDate,
  //         booking_date: actualBookingDate,
  //         status: status,
  //         total: finalTotal,
  //         payment_method: payment_method,
  //         payment_status: payment_status,
  //         invoice_number: finalInvoiceNumber
  //       }
  //     };

  //     res.status(201).json({
  //       success: true,
  //       message: isNewCustomer ? 'New customer and past booking created successfully' : 'Past booking created successfully',
  //       data: responseData
  //     });

  //   } catch (error) {
  //     console.error('❌ Create past booking error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'SERVER_ERROR',
  //       message: 'Internal server error: ' + error.message
  //     });
  //   }
  // },

  createPastBooking: async (req, res) => {
    try {
      const {
        room_id,
        customer_id,
        from_date,
        to_date,
        from_time = '14:00',
        to_time = '12:00',
        amount,
        service,
        gst,
        cgst,        // ← ADD THIS
        sgst,        // ← ADD THIS
        igst,        // ← ADD THIS
        total,
        status = 'booked',
        guests = 1,
        special_requests = '',
        id_type = 'aadhaar',
        payment_method = 'cash',
        payment_status = 'completed',
        transaction_id,
        customer_name,
        customer_phone,
        customer_email,
        customer_id_number,
        id_image,
        id_image2,
        address,
        city,
        state,
        pincode,
        customer_gst_no,
        purpose_of_visit,
        other_expenses = 0,
        expense_description = '',
        referral_by,
        referral_amount = 0,
        invoice_number,
        booking_date,
        check_in_date,
        check_out_date
      } = req.body;

      const hotelId = req.user.hotel_id;
      let finalCustomerId = customer_id;
      let isNewCustomer = false;

      console.log('📝 Create past booking request:', {
        hotelId,
        room_id,
        from_date: from_date || check_in_date,
        to_date: to_date || check_out_date,
        customer_name,
        customer_phone,
        // Log the tax fields being received
        taxFields: { cgst, sgst, igst, gst }
      });

      // ===========================================
      // 1. VALIDATE ROOM
      // ===========================================
      const room = await Room.findById(room_id, hotelId);
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        });
      }

      // ===========================================
      // 2. CUSTOMER HANDLING
      // ===========================================
      if (customer_name && customer_phone) {
        try {
          const existingCustomer = await Customer.findByPhone(customer_phone, hotelId);

          if (existingCustomer) {
            finalCustomerId = existingCustomer.id;
            console.log('✅ Found existing customer:', {
              customerId: finalCustomerId,
              name: existingCustomer.name
            });

            if (customer_email || address) {
              await Customer.update(existingCustomer.id, hotelId, {
                name: customer_name,
                phone: customer_phone,
                email: customer_email || existingCustomer.email,
                id_number: customer_id_number || existingCustomer.id_number,
                id_type: id_type || 'aadhaar',
                id_image: id_image || existingCustomer.id_image,
                id_image2: id_image2 || existingCustomer.id_image2,
                address: address || existingCustomer.address,
                city: city || existingCustomer.city,
                state: state || existingCustomer.state,
                pincode: pincode || existingCustomer.pincode,
                customer_gst_no: customer_gst_no || existingCustomer.customer_gst_no,
                purpose_of_visit: purpose_of_visit || existingCustomer.purpose_of_visit,
                other_expenses: other_expenses || existingCustomer.other_expenses || 0,
                expense_description: expense_description || existingCustomer.expense_description
              });
            }
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
              payment_method: payment_method || 'cash',
              payment_status: payment_status || 'completed',
              transaction_id: transaction_id || null,
              address: address || '',
              city: city || '',
              state: state || '',
              pincode: pincode || '',
              customer_gst_no: customer_gst_no,
              purpose_of_visit: purpose_of_visit || null,
              other_expenses: other_expenses || 0,
              expense_description: expense_description || null
            });
            isNewCustomer = true;
            console.log('✅ Created new customer:', { customerId: finalCustomerId });
          }
        } catch (customerError) {
          console.error('❌ Customer creation error:', customerError);
          return res.status(500).json({
            success: false,
            error: 'CUSTOMER_CREATION_FAILED',
            message: 'Failed to create/update customer'
          });
        }
      }

      // ===========================================
      // 3. CHECK IF DATES ARE VALID (ALLOW PAST DATES)
      // ===========================================
      const actualFromDate = from_date || check_in_date;
      const actualToDate = to_date || check_out_date;
      const actualBookingDate = booking_date || new Date().toISOString().split('T')[0];

      if (!actualFromDate || !actualToDate) {
        return res.status(400).json({
          success: false,
          error: 'DATES_REQUIRED',
          message: 'Check-in and check-out dates are required'
        });
      }

      const fromDate = new Date(actualFromDate);
      const toDate = new Date(actualToDate);
      const bookingDate = new Date(actualBookingDate);

      if (toDate <= fromDate) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_DATE_RANGE',
          message: 'Check-out date must be after check-in date'
        });
      }

      console.log('📅 Date validation passed (past dates allowed):', {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        bookingDate: bookingDate.toISOString(),
        isPastDate: fromDate < new Date()
      });

      // ===========================================
      // 4. CHECK ROOM AVAILABILITY (Skip for past bookings)
      // ===========================================
      const today = new Date();
      if (fromDate >= today) {
        const isAvailable = await Booking.checkRoomAvailability(room_id, hotelId, actualFromDate, actualToDate, null, status);
        if (!isAvailable) {
          return res.status(400).json({
            success: false,
            error: 'ROOM_NOT_AVAILABLE',
            message: 'Room is not available for the selected dates'
          });
        }
      } else {
        console.log('⚠️ Past date booking - skipping availability check');
      }

      // ===========================================
      // 5. CREATE BOOKING WITH PAST DATES
      // ===========================================
      let finalInvoiceNumber = invoice_number;
      if (!finalInvoiceNumber) {
        finalInvoiceNumber = await Booking.getNextInvoiceNumber(hotelId);
      }

      const otherExpensesValue = parseFloat(other_expenses) || 0;

      // Calculate total including split taxes
      const calculatedTotal = parseFloat(amount || 0) +
        parseFloat(service || 0) +
        parseFloat(gst || 0) +
        parseFloat(cgst || 0) +    // ← ADD THIS
        parseFloat(sgst || 0) +    // ← ADD THIS
        parseFloat(igst || 0) +    // ← ADD THIS
        otherExpensesValue;

      const finalTotal = parseFloat(total || calculatedTotal);

      const bookingData = {
        hotel_id: hotelId,
        room_id,
        customer_id: status === 'booked' ? finalCustomerId : null,
        from_date: actualFromDate,
        to_date: actualToDate,
        from_time: from_time,
        to_time: to_time,
        amount: parseFloat(amount || 0),
        service: parseFloat(service || 0),
        gst: parseFloat(gst || 0),
        cgst: parseFloat(cgst || 0),    // ← ADD THIS
        sgst: parseFloat(sgst || 0),    // ← ADD THIS
        igst: parseFloat(igst || 0),    // ← ADD THIS
        total: finalTotal,
        invoice_number: finalInvoiceNumber,
        status: status,
        guests: parseInt(guests || 1),
        special_requests: special_requests || '',
        id_type: id_type || 'aadhaar',
        payment_method: payment_method || 'cash',
        payment_status: payment_status || 'completed',
        transaction_id: transaction_id || null,
        referral_by: referral_by || '',
        referral_amount: parseFloat(referral_amount || 0),
        booking_date: actualBookingDate,
        is_past_booking: fromDate < new Date() ? 1 : 0,
        created_at: bookingDate.toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
      };

      console.log('📅 Creating past booking with tax details:', {
        amount: bookingData.amount,
        service: bookingData.service,
        cgst: bookingData.cgst,
        sgst: bookingData.sgst,
        igst: bookingData.igst,
        gst: bookingData.gst,
        total: bookingData.total
      });

      let bookingId;
      if (status === 'booked' && finalCustomerId) {
        bookingId = await Booking.create(bookingData);
      } else {
        bookingId = await Booking.createWithoutCustomer(bookingData);
      }

      console.log('✅ Past booking created successfully:', { bookingId });

      // ===========================================
      // 6. UPDATE ROOM STATUS (Only if dates are current/future)
      // ===========================================
      if (status === 'booked' && fromDate >= today) {
        await Room.updateStatus(room_id, hotelId, 'booked');
        console.log('✅ Room status updated to booked');
      }

      // ===========================================
      // 7. CREATE COLLECTION FOR PAST BOOKING
      // ===========================================
      if (payment_method === 'cash' && status === 'booked') {
        try {
          await Collection.createFromCashBooking(bookingId, hotelId, req.user.userId);
          console.log('✅ Auto-created collection for past cash booking');
        } catch (collectionError) {
          console.error('❌ Failed to auto-create collection:', collectionError);
        }
      }

      // ===========================================
      // 8. RESPONSE
      // ===========================================
      const responseData = {
        bookingId: bookingId,
        customerId: finalCustomerId,
        isNewCustomer: isNewCustomer,
        isPastBooking: fromDate < new Date(),
        bookingDetails: {
          room_id: room_id,
          room_number: room.room_number,
          from_date: actualFromDate,
          to_date: actualToDate,
          booking_date: actualBookingDate,
          status: status,
          total: finalTotal,
          payment_method: payment_method,
          payment_status: payment_status,
          invoice_number: finalInvoiceNumber,
          // Include tax breakdown in response
          tax_breakdown: {
            cgst: parseFloat(cgst || 0),
            sgst: parseFloat(sgst || 0),
            igst: parseFloat(igst || 0),
            gst: parseFloat(gst || 0)
          }
        }
      };

      res.status(201).json({
        success: true,
        message: isNewCustomer ? 'New customer and past booking created successfully' : 'Past booking created successfully',
        data: responseData
      });

    } catch (error) {
      console.error('❌ Create past booking error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },
  // Add these methods to bookingController.js

  // Block room
  // blockRoom: async (req, res) => {
  //   try {
  //     const {
  //       roomId,
  //       roomNumber,
  //       fromDate,
  //       toDate,
  //       reason,
  //       blockedBy
  //     } = req.body;

  //     const hotelId = req.user.hotel_id;

  //     console.log('🚫 Block room request:', {
  //       hotelId,
  //       roomId,
  //       roomNumber,
  //       fromDate,
  //       toDate,
  //       reason,
  //       blockedBy
  //     });

  //     // Find room by ID or number
  //     let room;
  //     if (roomId) {
  //       room = await Room.findById(roomId, hotelId);
  //     } else if (roomNumber) {
  //       room = await Room.findByNumber(roomNumber, hotelId);
  //     }

  //     if (!room) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'ROOM_NOT_FOUND',
  //         message: 'Room not found'
  //       });
  //     }

  //     // Check if room is already booked for these dates
  //     const isAvailable = await Booking.checkRoomAvailability(
  //       room.id,
  //       hotelId,
  //       fromDate,
  //       toDate,
  //       null,
  //       'blocked'
  //     );

  //     if (!isAvailable) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'ROOM_NOT_AVAILABLE',
  //         message: 'Room is already booked or blocked for selected dates'
  //       });
  //     }

  //     // Create a booking record with status 'blocked' (no customer)
  //     const bookingData = {
  //       hotel_id: hotelId,
  //       room_id: room.id,
  //       from_date: fromDate,
  //       to_date: toDate,
  //       from_time: '00:00',
  //       to_time: '23:59',
  //       amount: 0,
  //       service: 0,
  //       gst: 0,
  //       total: 0,
  //       status: 'blocked',
  //       guests: 0,
  //       special_requests: reason || 'Room blocked',
  //       payment_method: 'none',
  //       payment_status: 'none',
  //       referral_by: blockedBy || 'Admin'
  //     };

  //     const bookingId = await Booking.createSpecialBooking(bookingData, 'block');
  //     console.log('✅ Room blocked successfully:', { bookingId });

  //     // Update room status to blocked
  //     await Room.updateStatus(room.id, hotelId, 'blocked');

  //     res.status(201).json({
  //       success: true,
  //       message: `Room ${room.room_number} blocked successfully`,
  //       data: {
  //         bookingId,
  //         roomId: room.id,
  //         roomNumber: room.room_number,
  //         fromDate,
  //         toDate,
  //         reason,
  //         blockedBy
  //       }
  //     });

  //   } catch (error) {
  //     console.error('❌ Block room error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'SERVER_ERROR',
  //       message: 'Internal server error: ' + error.message
  //     });
  //   }
  // },
  // In bookingController.js - Replace the blockRoom method

  blockRoom: async (req, res) => {
    try {
      const {
        roomId,
        roomNumber,
        fromDate,
        toDate,
        reason,
        blockedBy,
        customerName  // ← ADD THIS - Allow customer name for block
      } = req.body;

      const hotelId = req.user.hotel_id;

      console.log('🚫 Block room request:', {
        hotelId,
        roomId,
        roomNumber,
        fromDate,
        toDate,
        reason,
        blockedBy,
        customerName
      });

      // Find room by ID or number
      let room;
      if (roomId) {
        room = await Room.findById(roomId, hotelId);
      } else if (roomNumber) {
        room = await Room.findByNumber(roomNumber, hotelId);
      }

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        });
      }

      // Check if room is already booked for these dates
      const isAvailable = await Booking.checkRoomAvailability(
        room.id,
        hotelId,
        fromDate,
        toDate,
        null,
        'blocked'
      );

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'ROOM_NOT_AVAILABLE',
          message: 'Room is already booked or blocked for selected dates'
        });
      }

      // ===========================================
      // HANDLE CUSTOMER IF PROVIDED
      // ===========================================
      let customerId = null;

      if (customerName) {
        // Check if customer exists with this name (simplified - you might want phone too)
        const [customerRows] = await pool.execute(
          `SELECT id FROM customers WHERE hotel_id = ? AND name = ? LIMIT 1`,
          [hotelId, customerName]
        );

        if (customerRows.length > 0) {
          customerId = customerRows[0].id;
          console.log(`✅ Found customer: ${customerId} for block`);
        } else {
          // Create a generic customer for this block
          customerId = await Customer.create({
            hotel_id: hotelId,
            name: customerName,
            phone: '0000000000', // Placeholder
            email: '',
            id_number: '',
            id_type: 'aadhaar',
            address: '',
            city: '',
            state: '',
            pincode: ''
          });
          console.log(`✅ Created customer: ${customerId} for block`);
        }
      }

      // Create special requests with block details
      const specialRequests = `BLOCKED: ${reason || 'No reason provided'}\n` +
        `Blocked by: ${blockedBy || 'Admin'}\n` +
        `Customer: ${customerName || 'Not specified'}`;

      // Create a booking record with status 'blocked'
      const bookingData = {
        hotel_id: hotelId,
        room_id: room.id,
        customer_id: customerId,  // ← Include customer ID if available
        from_date: fromDate,
        to_date: toDate,
        from_time: '00:00',
        to_time: '23:59',
        amount: 0,
        service: 0,
        gst: 0,
        total: 0,
        status: 'blocked',
        guests: 0,
        special_requests: specialRequests,
        payment_method: 'none',
        payment_status: 'none',
        referral_by: blockedBy || 'Admin'
      };

      const bookingId = await Booking.createSpecialBooking(bookingData, 'blocked');
      console.log('✅ Room blocked successfully:', { bookingId });

      // Update room status to blocked
      await Room.updateStatus(room.id, hotelId, 'blocked');

      res.status(201).json({
        success: true,
        message: `Room ${room.room_number} blocked successfully`,
        data: {
          bookingId,
          roomId: room.id,
          roomNumber: room.room_number,
          fromDate,
          toDate,
          reason,
          blockedBy,
          customerName,  // ← Return customer name
          customerId     // ← Return customer ID
        }
      });

    } catch (error) {
      console.error('❌ Block room error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // Maintenance request
  maintenanceRequest: async (req, res) => {
    try {
      const {
        roomId,
        roomNumber,
        fromDate,
        toDate,
        maintenanceType,
        description,
        assignedTo,
        estimatedCost,
        priority
      } = req.body;

      const hotelId = req.user.hotel_id;

      console.log('🔧 Maintenance request:', {
        hotelId,
        roomId,
        roomNumber,
        fromDate,
        toDate,
        maintenanceType,
        description,
        assignedTo,
        estimatedCost,
        priority
      });

      // Find room by ID or number
      let room;
      if (roomId) {
        room = await Room.findById(roomId, hotelId);
      } else if (roomNumber) {
        room = await Room.findByNumber(roomNumber, hotelId);
      }

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        });
      }

      // Check if room is already booked for these dates
      const isAvailable = await Booking.checkRoomAvailability(
        room.id,
        hotelId,
        fromDate,
        toDate,
        null,
        'maintenance'
      );

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'ROOM_NOT_AVAILABLE',
          message: 'Room is already booked or under maintenance for selected dates'
        });
      }

      // Create special requests with maintenance details
      const specialRequests = `MAINTENANCE: ${maintenanceType || 'General'}\n` +
        `Description: ${description || 'Not specified'}\n` +
        `Assigned to: ${assignedTo || 'Not assigned'}\n` +
        `Priority: ${priority || 'medium'}\n` +
        `Estimated cost: ₹${estimatedCost || '0'}`;

      // Create a booking record with status 'maintenance' (no customer)
      const bookingData = {
        hotel_id: hotelId,
        room_id: room.id,
        from_date: fromDate,
        to_date: toDate,
        from_time: '00:00',
        to_time: '23:59',
        amount: 0,
        service: 0,
        gst: 0,
        total: estimatedCost || 0,
        status: 'maintenance',
        guests: 0,
        special_requests: specialRequests,
        payment_method: 'none',
        payment_status: 'none',
        referral_by: assignedTo || 'Maintenance Team'
      };

      const bookingId = await Booking.createSpecialBooking(bookingData, 'maintenance');
      console.log('✅ Maintenance request created successfully:', { bookingId });

      // Update room status to maintenance
      await Room.updateStatus(room.id, hotelId, 'maintenance');

      res.status(201).json({
        success: true,
        message: `Maintenance request for Room ${room.room_number} created successfully`,
        data: {
          bookingId,
          roomId: room.id,
          roomNumber: room.room_number,
          fromDate,
          toDate,
          maintenanceType,
          description,
          assignedTo,
          estimatedCost,
          priority
        }
      });

    } catch (error) {
      console.error('❌ Maintenance request error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // Get blocked rooms
  getBlockedRooms: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;
      const { date } = req.query;

      let query = `
      SELECT b.*, r.room_number, r.type as room_type
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.hotel_id = ? 
      AND b.status = 'blocked'
    `;

      let params = [hotelId];

      if (date) {
        query += ` AND b.from_date <= ? AND b.to_date >= ?`;
        params.push(date, date);
      }

      query += ` ORDER BY b.from_date`;

      const [blockedRooms] = await pool.execute(query, params);

      res.json({
        success: true,
        data: blockedRooms,
        count: blockedRooms.length
      });

    } catch (error) {
      console.error('❌ Get blocked rooms error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  // Get maintenance rooms
  getMaintenanceRooms: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;
      const { date } = req.query;

      let query = `
      SELECT b.*, r.room_number, r.type as room_type
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.hotel_id = ? 
      AND b.status = 'maintenance'
    `;

      let params = [hotelId];

      if (date) {
        query += ` AND b.from_date <= ? AND b.to_date >= ?`;
        params.push(date, date);
      }

      query += ` ORDER BY b.from_date`;

      const [maintenanceRooms] = await pool.execute(query, params);

      res.json({
        success: true,
        data: maintenanceRooms,
        count: maintenanceRooms.length
      });

    } catch (error) {
      console.error('❌ Get maintenance rooms error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },
  // ===========================================
  // GENERATE BLOCK ROOM PDF
  // ===========================================
  generateBlockRoomPDF: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      // Get blocked room details - FIXED QUERY
      const [blockRows] = await pool.execute(`
      SELECT b.*, r.room_number, r.type as room_type,
             h.name as hotel_name, h.address as hotel_address,
             u.phone as hotel_phone, u.email as hotel_email,
             h.gst_number
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN users u ON b.hotel_id = u.hotel_id AND u.role = 'admin'
      WHERE b.id = ? AND b.hotel_id = ? AND b.status = 'blocked'
      LIMIT 1
    `, [id, hotelId]);

      if (blockRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'BLOCK_NOT_FOUND',
          message: 'Blocked room record not found'
        });
      }

      const blockData = blockRows[0];
      const hotelDetails = {
        name: blockData.hotel_name,
        address: blockData.hotel_address,
        phone: blockData.hotel_phone || 'N/A',
        email: blockData.hotel_email || 'N/A',
        gst_number: blockData.gst_number || 'N/A'
      };

      // Generate PDF
      const pdfBuffer = await BlockMaintenancePdfService.generateBlockReport(blockData, hotelDetails);

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="block-report-${blockData.room_number || 'room'}-${Date.now()}.pdf"`);

      res.send(pdfBuffer);

    } catch (error) {
      console.error('❌ Generate block room PDF error:', error);
      res.status(500).json({
        success: false,
        error: 'PDF_GENERATION_FAILED',
        message: 'Failed to generate block room report: ' + error.message
      });
    }
  },

  // In your bookingController.js, update the generateMaintenanceRoomPDF method:
  generateMaintenanceRoomPDF: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      console.log(`📄 Generating maintenance PDF for ID: ${id}`);

      // Get maintenance room details
      const [maintenanceRows] = await pool.execute(`
      SELECT 
        b.id,
        b.from_date,
        b.to_date,
        b.total,
        b.status,
        b.special_requests,
        r.room_number,
        r.type as room_type,
        h.name as hotel_name,
        h.address as hotel_address
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      WHERE b.id = ? AND b.hotel_id = ? AND b.status = 'maintenance'
      LIMIT 1
    `, [id, hotelId]);

      if (maintenanceRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'MAINTENANCE_NOT_FOUND',
          message: 'Maintenance record not found'
        });
      }

      const maintenanceData = maintenanceRows[0];

      const hotelDetails = {
        name: maintenanceData.hotel_name || 'Hotel',
        address: maintenanceData.hotel_address || '',
        phone: 'N/A', // You can fetch this from database if needed
        email: 'N/A'
      };

      console.log('📊 Maintenance data:', maintenanceData);

      // Generate PDF
      const pdfBuffer = await BlockMaintenancePdfService.generateMaintenanceReport(maintenanceData, hotelDetails);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF buffer is empty');
      }

      console.log(`✅ PDF buffer size: ${pdfBuffer.length} bytes`);

      // Set proper headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `attachment; filename="maintenance-report-${maintenanceData.room_number}-${id}.pdf"`);

      // IMPORTANT: Don't send JSON, send the buffer directly
      res.send(pdfBuffer);

    } catch (error) {
      console.error('❌ Generate maintenance room PDF error:', error);

      // Send proper error response
      res.status(500).json({
        success: false,
        error: 'PDF_GENERATION_FAILED',
        message: error.message
      });
    }
  },

  // ===========================================
  // GENERATE COMBINED BLOCK/MAINTENANCE REPORT
  // ===========================================
  generateCombinedReport: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;
      const { startDate, endDate } = req.query;

      // Get hotel details from users table
      const [hotelRows] = await pool.execute(`
      SELECT h.name, h.address, h.gst_number,
             u.phone as hotel_phone, u.email as hotel_email
      FROM hotels h
      LEFT JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
      WHERE h.id = ?
      LIMIT 1
    `, [hotelId]);

      if (hotelRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'HOTEL_NOT_FOUND',
          message: 'Hotel not found'
        });
      }

      const hotelDetails = hotelRows[0];

      // Build query for blocked rooms
      let blockedQuery = `
      SELECT b.*, r.room_number, r.type as room_type
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.hotel_id = ? AND b.status = 'blocked'
    `;

      // Build query for maintenance rooms
      let maintenanceQuery = `
      SELECT b.*, r.room_number, r.type as room_type
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.hotel_id = ? AND b.status = 'maintenance'
    `;

      const blockedParams = [hotelId];
      const maintenanceParams = [hotelId];

      if (startDate && endDate) {
        blockedQuery += ` AND b.from_date >= ? AND b.to_date <= ?`;
        blockedParams.push(startDate, endDate);

        maintenanceQuery += ` AND b.from_date >= ? AND b.to_date <= ?`;
        maintenanceParams.push(startDate, endDate);
      }

      blockedQuery += ` ORDER BY b.from_date`;
      maintenanceQuery += ` ORDER BY b.from_date`;

      // Execute both queries
      const [blockedRooms] = await pool.execute(blockedQuery, blockedParams);
      const [maintenanceRooms] = await pool.execute(maintenanceQuery, maintenanceParams);

      // Generate combined PDF report
      const pdfBuffer = await BlockMaintenancePdfService.generateCombinedReport(
        blockedRooms,
        maintenanceRooms,
        hotelDetails
      );

      // Set response headers
      const filename = startDate && endDate
        ? `room-status-report-${startDate}-to-${endDate}.pdf`
        : `room-status-report-${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(pdfBuffer);

    } catch (error) {
      console.error('❌ Generate combined report error:', error);
      res.status(500).json({
        success: false,
        error: 'PDF_GENERATION_FAILED',
        message: 'Failed to generate combined report: ' + error.message
      });
    }
  },

  // ===========================================
  // GET BLOCK/MAINTENANCE STATISTICS
  // ===========================================
  getBlockMaintenanceStats: async (req, res) => {
    try {
      const hotelId = req.user.hotel_id;
      const { period = 'current' } = req.query; // current, week, month, year

      let dateCondition = '';
      let params = [hotelId];

      if (period === 'week') {
        dateCondition = `AND b.from_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
      } else if (period === 'month') {
        dateCondition = `AND b.from_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
      } else if (period === 'year') {
        dateCondition = `AND b.from_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`;
      } else {
        // current - today
        dateCondition = `AND DATE(b.from_date) = CURDATE()`;
      }

      // Get blocked rooms statistics
      const [blockStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_blocks,
        SUM(CASE WHEN DATE(b.from_date) = CURDATE() THEN 1 ELSE 0 END) as today_blocks,
        SUM(CASE WHEN b.to_date < CURDATE() THEN 1 ELSE 0 END) as expired_blocks,
        SUM(CASE WHEN b.from_date <= CURDATE() AND b.to_date >= CURDATE() THEN 1 ELSE 0 END) as active_blocks,
        MIN(b.from_date) as earliest_block,
        MAX(b.to_date) as latest_block_end
      FROM bookings b
      WHERE b.hotel_id = ? 
      AND b.status = 'blocked'
      ${dateCondition}
    `, params);

      // Get maintenance rooms statistics
      const [maintenanceStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_maintenance,
        SUM(CASE WHEN DATE(b.from_date) = CURDATE() THEN 1 ELSE 0 END) as today_maintenance,
        SUM(CASE WHEN b.to_date < CURDATE() THEN 1 ELSE 0 END) as expired_maintenance,
        SUM(CASE WHEN b.from_date <= CURDATE() AND b.to_date >= CURDATE() THEN 1 ELSE 0 END) as active_maintenance,
        SUM(b.total) as total_maintenance_cost,
        AVG(b.total) as avg_maintenance_cost
      FROM bookings b
      WHERE b.hotel_id = ? 
      AND b.status = 'maintenance'
      ${dateCondition}
    `, params);

      // Get room distribution
      const [roomDistribution] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT CASE WHEN b.status = 'blocked' THEN r.id END) as blocked_room_count,
        COUNT(DISTINCT CASE WHEN b.status = 'maintenance' THEN r.id END) as maintenance_room_count,
        (SELECT COUNT(*) FROM rooms WHERE hotel_id = ? AND status = 'available') as available_room_count,
        (SELECT COUNT(*) FROM rooms WHERE hotel_id = ?) as total_room_count
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.hotel_id = ? 
      AND (b.status = 'blocked' OR b.status = 'maintenance')
      AND (b.from_date <= CURDATE() AND b.to_date >= CURDATE())
    `, [hotelId, hotelId, hotelId]);

      res.json({
        success: true,
        data: {
          period,
          blockStats: blockStats[0] || {},
          maintenanceStats: maintenanceStats[0] || {},
          roomDistribution: roomDistribution[0] || {},
          summary: {
            totalUnavailable: (blockStats[0]?.active_blocks || 0) + (maintenanceStats[0]?.active_maintenance || 0),
            revenueImpact: `₹${((blockStats[0]?.active_blocks || 0) * 5000).toLocaleString('en-IN')}`, // Estimated daily revenue loss
            operationalImpact: 'Moderate' // Based on number of unavailable rooms
          }
        }
      });

    } catch (error) {
      console.error('❌ Get block/maintenance stats error:', error);
      res.status(500).json({
        success: false,
        error: 'STATS_FETCH_FAILED',
        message: 'Failed to fetch statistics: ' + error.message
      });
    }
  },

  // Unblock room
  unblockRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const hotelId = req.user.hotel_id;

      console.log('🔓 Unblock room request:', { id, hotelId });

      // Get current booking details
      const currentBooking = await Booking.findById(id, hotelId);
      if (!currentBooking) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        });
      }

      // Check if it's actually a blocked room
      if (currentBooking.status !== 'blocked') {
        return res.status(400).json({
          success: false,
          error: 'NOT_BLOCKED',
          message: 'This booking is not a blocked room'
        });
      }

      // Update booking status to 'available'
      const updated = await Booking.update(id, hotelId, {
        status: 'available'
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'UPDATE_FAILED',
          message: 'Failed to unblock room'
        });
      }

      // Get the room ID from the booking
      const roomId = currentBooking.room_id;

      if (roomId) {
        // Update room status to available
        const Room = require('../models/Room');
        const roomUpdated = await Room.updateStatus(roomId, hotelId, 'available');

        if (!roomUpdated) {
          console.warn('⚠️ Room status update may have failed:', { roomId, hotelId });
        } else {
          console.log('✅ Room status updated to available:', roomId);
        }
      }

      console.log('✅ Room unblocked successfully:', { bookingId: id });

      res.json({
        success: true,
        message: 'Room unblocked successfully'
      });

    } catch (error) {
      console.error('❌ Unblock room error:', error);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      });
    }
  },

  //  createMultipleBookings method


  // createMultipleBookings: async (req, res) => {
  //   try {
  //     const { bookings, groupBookingId } = req.body;
  //     const hotelId = req.user.hotel_id;

  //     const results = [];
  //     const errors = [];

  //     console.log('📦 Processing multiple bookings:', {
  //       count: bookings.length,
  //       groupBookingId,
  //       firstBooking: bookings[0]
  //     });

  //     // Process each booking
  //     for (const bookingData of bookings) {
  //       try {
  //         // Extract customer details from each booking
  //         const {
  //           customer_name,
  //           customer_phone,
  //           customer_email,
  //           customer_id_number,
  //           id_type,
  //           address,
  //           city,
  //           state,
  //           pincode,
  //           customer_gst_no,
  //           // Room details
  //           room_id,
  //           from_date,
  //           to_date,
  //           from_time,
  //           to_time,
  //           amount,
  //           service,
  //           cgst,
  //           sgst,
  //           igst,
  //           total,
  //           guests,
  //           special_requests,
  //           payment_method,
  //           payment_status,
  //           id_number
  //         } = bookingData;

  //         // ===========================================
  //         // 1. CHECK ROOM AVAILABILITY
  //         // ===========================================
  //         const isAvailable = await Booking.checkRoomAvailability(
  //           room_id,
  //           hotelId,
  //           from_date,
  //           to_date,
  //           null,
  //           'booked'
  //         );

  //         if (!isAvailable) {
  //           errors.push({
  //             room_id,
  //             error: 'ROOM_NOT_AVAILABLE',
  //             message: `Room ${room_id} is not available for selected dates`
  //           });
  //           continue;
  //         }

  //         // ===========================================
  //         // 2. HANDLE CUSTOMER
  //         // ===========================================
  //         let finalCustomerId = null;

  //         if (customer_name && customer_phone) {
  //           // Check if customer exists
  //           let existingCustomer = await Customer.findByPhone(customer_phone, hotelId);

  //           if (existingCustomer) {
  //             finalCustomerId = existingCustomer.id;
  //             console.log(`✅ Using existing customer: ${finalCustomerId} for booking`);

  //             // Optionally update customer details
  //             await Customer.update(existingCustomer.id, hotelId, {
  //               name: customer_name,
  //               phone: customer_phone,
  //               email: customer_email || existingCustomer.email,
  //               id_number: customer_id_number || existingCustomer.id_number,
  //               id_type: id_type || existingCustomer.id_type || 'aadhaar',
  //               address: address || existingCustomer.address,
  //               city: city || existingCustomer.city,
  //               state: state || existingCustomer.state,
  //               pincode: pincode || existingCustomer.pincode,
  //               customer_gst_no: customer_gst_no || existingCustomer.customer_gst_no
  //             });

  //           } else {
  //             // Create new customer
  //             finalCustomerId = await Customer.create({
  //               hotel_id: hotelId,
  //               name: customer_name,
  //               phone: customer_phone,
  //               email: customer_email || '',
  //               id_number: customer_id_number || '',
  //               id_type: id_type || 'aadhaar',
  //               address: address || '',
  //               city: city || '',
  //               state: state || '',
  //               pincode: pincode || '',
  //               customer_gst_no: customer_gst_no || ''
  //             });
  //             console.log(`✅ Created new customer: ${finalCustomerId}`);
  //           }
  //         }

  //         // ===========================================
  //         // 3. CREATE BOOKING WITH GROUP ID
  //         // ===========================================
  //         const bookingPayload = {
  //           hotel_id: hotelId,
  //           room_id,
  //           customer_id: finalCustomerId,
  //           group_booking_id: groupBookingId,  // ← CRITICAL: Pass group ID
  //           from_date,
  //           to_date,
  //           from_time: from_time || '14:00',
  //           to_time: to_time || '12:00',
  //           amount: parseFloat(amount || 0),
  //           service: parseFloat(service || 0),
  //           cgst: parseFloat(cgst || 0),
  //           sgst: parseFloat(sgst || 0),
  //           igst: parseFloat(igst || 0),
  //           total: parseFloat(total || amount || 0),
  //           status: 'booked',
  //           guests: parseInt(guests || 1),
  //           special_requests: special_requests || '',
  //           payment_method: payment_method || 'cash',
  //           payment_status: payment_status || 'pending',
  //           id_type: id_type || 'aadhaar'
  //         };

  //         // Use the create method that handles customer correctly
  //         const bookingId = await Booking.create(bookingPayload);

  //         // Update room status
  //         await Room.updateStatus(room_id, hotelId, 'booked');

  //         results.push({
  //           bookingId,
  //           room_id,
  //           customer_id: finalCustomerId,
  //           success: true
  //         });

  //       } catch (error) {
  //         console.error('❌ Error processing booking:', error);
  //         errors.push({
  //           room_id: bookingData.room_id,
  //           error: error.message
  //         });
  //       }
  //     }

  //     res.json({
  //       success: true,
  //       data: {
  //         successful: results,
  //         failed: errors,
  //         groupBookingId,
  //         totalSuccess: results.length,
  //         totalFailed: errors.length
  //       }
  //     });

  //   } catch (error) {
  //     console.error('Multiple booking error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: error.message
  //     });
  //   }
  // },

  // In bookingController.js - Update createMultipleBookings method
  createMultipleBookings: async (req, res) => {
    try {
      const { bookings, groupBookingId } = req.body;
      const hotelId = req.user.hotel_id;
      const userId = req.user.userId;  // Get the current user ID for collections

      const results = [];
      const errors = [];

      console.log('📦 Processing multiple bookings:', {
        count: bookings.length,
        groupBookingId,
        firstBooking: bookings[0]
      });

      // Process each booking
      for (const bookingData of bookings) {
        try {
          // Extract customer details from each booking
          const {
            customer_name,
            customer_phone,
            customer_email,
            customer_id_number,
            id_type,
            address,
            city,
            state,
            pincode,
            customer_gst_no,
            // Room details
            room_id,
            from_date,
            to_date,
            from_time,
            to_time,
            amount,
            service,
            cgst,
            sgst,
            igst,
            total,
            guests,
            special_requests,
            payment_method,
            payment_status,
            id_number
          } = bookingData;

          // ===========================================
          // 1. CHECK ROOM AVAILABILITY
          // ===========================================
          const isAvailable = await Booking.checkRoomAvailability(
            room_id,
            hotelId,
            from_date,
            to_date,
            null,
            'booked'
          );

          if (!isAvailable) {
            errors.push({
              room_id,
              error: 'ROOM_NOT_AVAILABLE',
              message: `Room ${room_id} is not available for selected dates`
            });
            continue;
          }

          // ===========================================
          // 2. HANDLE CUSTOMER
          // ===========================================
          let finalCustomerId = null;

          if (customer_name && customer_phone) {
            // Check if customer exists
            let existingCustomer = await Customer.findByPhone(customer_phone, hotelId);

            if (existingCustomer) {
              finalCustomerId = existingCustomer.id;
              console.log(`✅ Using existing customer: ${finalCustomerId} for booking`);

              // Optionally update customer details
              await Customer.update(existingCustomer.id, hotelId, {
                name: customer_name,
                phone: customer_phone,
                email: customer_email || existingCustomer.email,
                id_number: customer_id_number || existingCustomer.id_number,
                id_type: id_type || existingCustomer.id_type || 'aadhaar',
                address: address || existingCustomer.address,
                city: city || existingCustomer.city,
                state: state || existingCustomer.state,
                pincode: pincode || existingCustomer.pincode,
                customer_gst_no: customer_gst_no || existingCustomer.customer_gst_no
              });

            } else {
              // Create new customer
              finalCustomerId = await Customer.create({
                hotel_id: hotelId,
                name: customer_name,
                phone: customer_phone,
                email: customer_email || '',
                id_number: customer_id_number || '',
                id_type: id_type || 'aadhaar',
                address: address || '',
                city: city || '',
                state: state || '',
                pincode: pincode || '',
                customer_gst_no: customer_gst_no || ''
              });
              console.log(`✅ Created new customer: ${finalCustomerId}`);
            }
          }

          // ===========================================
          // 3. CREATE BOOKING WITH GROUP ID
          // ===========================================
          const bookingPayload = {
            hotel_id: hotelId,
            room_id,
            customer_id: finalCustomerId,
            group_booking_id: groupBookingId,
            from_date,
            to_date,
            from_time: from_time || '14:00',
            to_time: to_time || '12:00',
            amount: parseFloat(amount || 0),
            service: parseFloat(service || 0),
            cgst: parseFloat(cgst || 0),
            sgst: parseFloat(sgst || 0),
            igst: parseFloat(igst || 0),
            total: parseFloat(total || amount || 0),
            status: 'booked',
            guests: parseInt(guests || 1),
            special_requests: special_requests || '',
            payment_method: payment_method || 'cash',
            payment_status: payment_status || 'pending',
            id_type: id_type || 'aadhaar'
          };

          // Use the create method that handles customer correctly
          const bookingId = await Booking.create(bookingPayload);

          // Update room status
          await Room.updateStatus(room_id, hotelId, 'booked');

          // ===========================================
          // 4. CREATE TRANSACTION FOR ONLINE PAYMENT
          // ===========================================
          if (payment_method === 'online' && bookingId) {
            try {
              const Transaction = require('../models/Transaction');
              const generatedTransactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}-${room_id}`;

              await Transaction.create({
                hotel_id: hotelId,
                booking_id: bookingId,
                customer_id: finalCustomerId,
                transaction_id: generatedTransactionId,
                amount: parseFloat(total || amount || 0),
                currency: 'INR',
                payment_method: 'online',
                payment_gateway: 'upi',
                status: payment_status || 'pending',
                status_message: payment_status === 'completed' ? 'Payment completed' : 'Payment initiated',
                metadata: {
                  room_id: room_id,
                  from_date: from_date,
                  to_date: to_date,
                  customer_name: customer_name,
                  group_booking_id: groupBookingId
                }
              });

              console.log(`💰 Transaction created for booking ${bookingId}`);

              // Update booking with transaction ID
              await Booking.update(bookingId, hotelId, {
                transaction_id: generatedTransactionId
              });

            } catch (transactionError) {
              console.error('❌ Transaction creation error:', transactionError);
              // Don't fail the booking if transaction creation fails
            }
          }

          // ===========================================
          // 5. CREATE COLLECTION FOR CASH PAYMENT
          // ===========================================
          if (payment_method === 'cash' && bookingId) {
            try {
              const Collection = require('../models/Collection');
              await Collection.createFromCashBooking(bookingId, hotelId, userId);
              console.log(`✅ Collection created for cash booking ${bookingId}`);
            } catch (collectionError) {
              console.error('❌ Failed to create collection:', collectionError);
            }
          }

          results.push({
            bookingId,
            room_id,
            customer_id: finalCustomerId,
            success: true
          });

        } catch (error) {
          console.error('❌ Error processing booking:', error);
          errors.push({
            room_id: bookingData.room_id,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        data: {
          successful: results,
          failed: errors,
          groupBookingId,
          totalSuccess: results.length,
          totalFailed: errors.length
        }
      });

    } catch (error) {
      console.error('Multiple booking error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get group booking details
  getGroupBooking: async (req, res) => {
    try {
      const { groupId } = req.params;
      const hotelId = req.user.hotel_id;

      const bookings = await Booking.findByGroupId(groupId, hotelId);

      res.json({
        success: true,
        data: bookings
      });

    } catch (error) {
      console.error('Error fetching group booking:', error);
      res.status(500).json({ error: error.message });
    }
  },

};

module.exports = bookingController;


