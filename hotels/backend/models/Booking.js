


// const { pool } = require('../config/database');
// const bookingQueries = require('../queries/bookingQueries');

// // Helper function to convert UTC to IST (India Standard Time)
// // function formatBookingDates(booking) {
// //   if (!booking) return booking;

// //   const formatted = { ...booking };

// //   // Convert UTC to IST (add 5.5 hours)
// //   const convertUTCToIST = (dateString) => {
// //     if (!dateString) return null;

// //     try {
// //       const date = new Date(dateString);
// //       // Check if date is valid
// //       if (isNaN(date.getTime())) {
// //         return dateString; // Return original if invalid
// //       }

// //       // Add 5.5 hours for IST (5.5 * 60 * 60 * 1000 = 19800000 milliseconds)
// //       const istDate = new Date(date.getTime() + 19800000);

// //       // Return as YYYY-MM-DD string
// //       return istDate.toISOString().split('T')[0];
// //     } catch (error) {
// //       console.error('Error converting date:', error);
// //       return dateString;
// //     }
// //   };

// //   // Format dates
// //   if (booking.from_date) {
// //     formatted.from_date = convertUTCToIST(booking.from_date);
// //   }

// //   if (booking.to_date) {
// //     formatted.to_date = convertUTCToIST(booking.to_date);
// //   }

// //   // Also format created_at if you want consistent display
// //   if (booking.created_at) {
// //     const createdDate = new Date(booking.created_at);
// //     if (!isNaN(createdDate.getTime())) {
// //       const istCreatedAt = new Date(createdDate.getTime() + 19800000);
// //       formatted.created_at = istCreatedAt.toISOString();
// //     }
// //   }

// //   return formatted;
// // }

// class Booking {
//   // Create new booking with all details
//   // static async create(bookingData) {
//   //   try {
//   //     const total = bookingData.total ||
//   //       (parseFloat(bookingData.amount || 0) +
//   //         parseFloat(bookingData.service || 0) +
//   //         parseFloat(bookingData.gst || 0) +
//   //         parseFloat(bookingData.cgst || 0) +
//   //         parseFloat(bookingData.sgst || 0) +
//   //         parseFloat(bookingData.igst || 0));

//   //     const [result] = await pool.execute(
//   //       bookingQueries.CREATE_BOOKING,
//   //       [
//   //         bookingData.hotel_id,
//   //         bookingData.room_id,
//   //         bookingData.customer_id || null,
//   //         bookingData.from_date,
//   //         bookingData.to_date,
//   //         bookingData.from_time || '14:00:00',
//   //         bookingData.to_time || '12:00:00',
//   //         bookingData.status || 'booked',
//   //         parseFloat(bookingData.amount || 0),
//   //         parseFloat(bookingData.service || 0),
//   //         parseFloat(bookingData.gst || 0),
//   //         parseFloat(bookingData.cgst || 0),
//   //         parseFloat(bookingData.sgst || 0),
//   //         parseFloat(bookingData.igst || 0),
//   //         parseFloat(total),
//   //         parseInt(bookingData.guests || 1),
//   //         bookingData.special_requests || '',
//   //         bookingData.id_type || 'aadhaar',
//   //         bookingData.payment_method || 'cash',
//   //         bookingData.payment_status || 'pending',
//   //         bookingData.transaction_id || null,
//   //         bookingData.referral_by || '',
//   //         parseFloat(bookingData.referral_amount || 0),
//   //         bookingData.invoice_number || null
//   //       ]
//   //     );
//   //     return result.insertId;
//   //   } catch (error) {
//   //     console.error('Error in Booking.create:', error);
//   //     throw error;
//   //   }
//   // }

//   // In models/Booking.js - update the create method
// static async create(bookingData) {
//   try {
//     const total = bookingData.total ||
//       (parseFloat(bookingData.amount || 0) +
//         parseFloat(bookingData.service || 0) +
//         parseFloat(bookingData.gst || 0) +
//         parseFloat(bookingData.cgst || 0) +
//         parseFloat(bookingData.sgst || 0) +
//         parseFloat(bookingData.igst || 0));

//     // Make sure status is valid
//     const status = bookingData.status || 'booked';
//     const validStatuses = ['booked', 'maintenance', 'blocked', 'available', 'completed', 'cancelled'];
//     const finalStatus = validStatuses.includes(status) ? status : 'booked';

//     const [result] = await pool.execute(
//       bookingQueries.CREATE_BOOKING,
//       [
//         bookingData.hotel_id,
//         bookingData.room_id,
//         bookingData.customer_id || null,
//         bookingData.from_date,
//         bookingData.to_date,
//         bookingData.from_time || '14:00:00',
//         bookingData.to_time || '12:00:00',
//         finalStatus, // Use validated status
//         parseFloat(bookingData.amount || 0),
//         parseFloat(bookingData.service || 0),
//         parseFloat(bookingData.gst || 0),
//         parseFloat(bookingData.cgst || 0),
//         parseFloat(bookingData.sgst || 0),
//         parseFloat(bookingData.igst || 0),
//         parseFloat(total),
//         parseInt(bookingData.guests || 1),
//         bookingData.special_requests || '',
//         bookingData.id_type || 'aadhaar',
//         bookingData.payment_method || 'cash',
//         bookingData.payment_status || 'pending',
//         bookingData.transaction_id || null,
//         bookingData.referral_by || '',
//         parseFloat(bookingData.referral_amount || 0),
//         bookingData.invoice_number || null
//       ]
//     );
//     return result.insertId;
//   } catch (error) {
//     console.error('Error in Booking.create:', error);
//     throw error;
//   }
// }

//   // Create booking without customer (for blocks/maintenance)
//   static async createWithoutCustomer(bookingData) {
//     const total = parseFloat(bookingData.amount || 0) +
//       parseFloat(bookingData.service || 0) +
//       parseFloat(bookingData.gst || 0);

//     const [result] = await pool.execute(
//       bookingQueries.CREATE_BOOKING_WITHOUT_CUSTOMER,
//       [
//         bookingData.hotel_id,
//         bookingData.room_id,
//         bookingData.from_date,
//         bookingData.to_date,
//         bookingData.from_time || '14:00:00',
//         bookingData.to_time || '12:00:00',
//         bookingData.status || 'blocked',
//         parseFloat(bookingData.amount || 0),
//         parseFloat(bookingData.service || 0),
//         parseFloat(bookingData.gst || 0),
//         parseFloat(total),
//         parseInt(bookingData.guests || 1),
//         bookingData.special_requests || '',
//         bookingData.referral_by || '',  // Add this
//         parseFloat(bookingData.referral_amount || 0)  // Add this
//       ]
//     );
//     return result.insertId;
//   }

//   // Original create method (for backward compatibility)
//   static async createOriginal(bookingData) {
//     const total = parseFloat(bookingData.amount || 0) +
//       parseFloat(bookingData.service || 0) +
//       parseFloat(bookingData.gst || 0);

//     const [result] = await pool.execute(
//       bookingQueries.CREATE_BOOKING_ORIGINAL,
//       [
//         bookingData.hotel_id,
//         bookingData.room_id,
//         bookingData.customer_id || null,
//         bookingData.from_date,
//         bookingData.to_date,
//         bookingData.from_time || '14:00:00',
//         bookingData.to_time || '12:00:00',
//         bookingData.status || 'booked',
//         parseFloat(bookingData.amount || 0),
//         parseFloat(bookingData.service || 0),
//         parseFloat(bookingData.gst || 0),
//         parseFloat(total)
//       ]
//     );
//     return result.insertId;
//   }

//   // Find booking by ID - WITH TIMEZONE FIX
//   static async findById(id, hotelId) {
//     const [rows] = await pool.execute(bookingQueries.FIND_BOOKING_BY_ID, [id, hotelId]);
//     if (rows[0]) {
//       return formatBookingDates(rows[0]);
//     }
//     return null;
//   }

//   // Get bookings by hotel - WITH TIMEZONE FIX
//   static async findByHotel(hotelId) {
//     const [rows] = await pool.execute(bookingQueries.GET_BOOKINGS_BY_HOTEL, [hotelId]);
//     return rows.map(formatBookingDates);
//   }

//   // Get bookings with details - WITH TIMEZONE FIX
//   static async findByHotelWithDetails(hotelId) {
//     const [rows] = await pool.execute(bookingQueries.GET_BOOKINGS_WITH_DETAILS, [hotelId]);
//     return rows.map(formatBookingDates);
//   }

//   // Update booking
//   // Update booking - FIXED VERSION
//   // static async update(id, hotelId, bookingData) {
//   //   console.log('📝 Booking.update called with:', { id, hotelId, bookingData });

//   //   // Build dynamic query based on provided fields
//   //   const updates = [];
//   //   const params = [];

//   //   // Helper to add field if provided
//   //   const addField = (fieldName, value, isNumber = false) => {
//   //     if (value !== undefined) {
//   //       updates.push(`${fieldName} = ?`);
//   //       params.push(isNumber ? parseFloat(value) || 0 : value);
//   //     }
//   //   };

//   //   // Add all possible fields
//   //   addField('room_id', bookingData.room_id);
//   //   addField('customer_id', bookingData.customer_id);
//   //   addField('from_date', bookingData.from_date);
//   //   addField('to_date', bookingData.to_date);
//   //   addField('from_time', bookingData.from_time);
//   //   addField('to_time', bookingData.to_time);
//   //   addField('amount', bookingData.amount, true);
//   //   addField('service', bookingData.service, true);
//   //   addField('gst', bookingData.gst, true);
//   //   addField('cgst', bookingData.cgst, true);
//   //   addField('sgst', bookingData.sgst, true);
//   //   addField('igst', bookingData.igst, true);

//   //   // Calculate total if amount-related fields are updated
//   //   if (bookingData.amount !== undefined ||
//   //     bookingData.service !== undefined ||
//   //     bookingData.gst !== undefined ||
//   //     bookingData.cgst !== undefined ||
//   //     bookingData.sgst !== undefined ||
//   //     bookingData.igst !== undefined) {
//   //     const amount = parseFloat(bookingData.amount) || 0;
//   //     const service = parseFloat(bookingData.service) || 0;
//   //     const gst = parseFloat(bookingData.gst) || 0;
//   //     const cgst = parseFloat(bookingData.cgst) || 0;
//   //     const sgst = parseFloat(bookingData.sgst) || 0;
//   //     const igst = parseFloat(bookingData.igst) || 0;
//   //     const total = amount + service + gst + cgst + sgst + igst;
//   //     addField('total', total, true);
//   //   } else {
//   //     addField('total', bookingData.total, true);
//   //   }

//   //   addField('status', bookingData.status);
//   //   addField('guests', bookingData.guests, true);
//   //   addField('special_requests', bookingData.special_requests);
//   //   addField('payment_method', bookingData.payment_method);
//   //   addField('payment_status', bookingData.payment_status);
//   //   addField('transaction_id', bookingData.transaction_id);
//   //   addField('referral_by', bookingData.referral_by);
//   //   addField('referral_amount', bookingData.referral_amount, true);

//   //   if (updates.length === 0) {
//   //     console.log('No fields to update');
//   //     return false;
//   //   }

//   //   // Add WHERE clause parameters
//   //   params.push(id);
//   //   params.push(hotelId);

//   //   const query = `UPDATE bookings SET ${updates.join(', ')} WHERE id = ? AND hotel_id = ?`;

//   //   console.log('📝 Update query:', query);
//   //   console.log('📝 Update params:', params);

//   //   try {
//   //     const [result] = await pool.execute(query, params);
//   //     console.log('✅ Update result:', result.affectedRows > 0);
//   //     return result.affectedRows > 0;
//   //   } catch (error) {
//   //     console.error('❌ Error in Booking.update:', error);
//   //     throw error;
//   //   }
//   // }
// // In models/Booking.js - Update method
// static async update(id, hotelId, bookingData) {
//   console.log('📝 Booking.update called with:', { id, hotelId, bookingData });

//   // Build dynamic query based on provided fields
//   const updates = [];
//   const params = [];

//   // Helper to add field if provided
//   const addField = (fieldName, value, isNumber = false) => {
//     if (value !== undefined) {
//       updates.push(`${fieldName} = ?`);
//       params.push(isNumber ? parseFloat(value) || 0 : value);
//     }
//   };

//   // Add all possible fields
//   addField('room_id', bookingData.room_id);
//   addField('customer_id', bookingData.customer_id);
//   addField('from_date', bookingData.from_date);
//   addField('to_date', bookingData.to_date);
//   addField('from_time', bookingData.from_time);
//   addField('to_time', bookingData.to_time);
//   addField('amount', bookingData.amount, true);
//   addField('service', bookingData.service, true);
//   addField('gst', bookingData.gst, true);
//   addField('cgst', bookingData.cgst, true);
//   addField('sgst', bookingData.sgst, true);
//   addField('igst', bookingData.igst, true);

//   // Calculate total if amount-related fields are updated
//   if (bookingData.amount !== undefined ||
//     bookingData.service !== undefined ||
//     bookingData.gst !== undefined ||
//     bookingData.cgst !== undefined ||
//     bookingData.sgst !== undefined ||
//     bookingData.igst !== undefined) {
//     const amount = parseFloat(bookingData.amount) || 0;
//     const service = parseFloat(bookingData.service) || 0;
//     const gst = parseFloat(bookingData.gst) || 0;
//     const cgst = parseFloat(bookingData.cgst) || 0;
//     const sgst = parseFloat(bookingData.sgst) || 0;
//     const igst = parseFloat(bookingData.igst) || 0;
//     const total = amount + service + gst + cgst + sgst + igst;
//     addField('total', total, true);
//   } else {
//     addField('total', bookingData.total, true);
//   }

//   // IMPORTANT: Handle status - make sure it's a valid value
//   if (bookingData.status !== undefined) {
//     const validStatuses = ['booked', 'maintenance', 'blocked', 'available', 'completed', 'cancelled'];
//     if (validStatuses.includes(bookingData.status)) {
//       addField('status', bookingData.status);
//     } else {
//       console.log('⚠️ Invalid status value:', bookingData.status);
//     }
//   }

//   addField('guests', bookingData.guests, true);
//   addField('special_requests', bookingData.special_requests);
//   addField('payment_method', bookingData.payment_method);
//   addField('payment_status', bookingData.payment_status);
//   addField('transaction_id', bookingData.transaction_id);
//   addField('referral_by', bookingData.referral_by);
//   addField('referral_amount', bookingData.referral_amount, true);

//   if (updates.length === 0) {
//     console.log('No fields to update');
//     return false;
//   }

//   // Add WHERE clause parameters
//   params.push(id);
//   params.push(hotelId);

//   const query = `UPDATE bookings SET ${updates.join(', ')} WHERE id = ? AND hotel_id = ?`;

//   console.log('📝 Update query:', query);
//   console.log('📝 Update params:', params);

//   try {
//     const [result] = await pool.execute(query, params);
//     console.log('✅ Update result:', result.affectedRows > 0);

//     // ✅ Update room status when booking is completed or cancelled
//     if (result.affectedRows > 0 && (bookingData.status === 'completed' || bookingData.status === 'cancelled')) {
//       // Get the room_id - either from bookingData or fetch it
//       let roomId = bookingData.room_id;

//       if (!roomId) {
//         // Fetch the booking to get room_id
//         const [bookingRows] = await pool.execute(
//           'SELECT room_id FROM bookings WHERE id = ? AND hotel_id = ?',
//           [id, hotelId]
//         );
//         if (bookingRows.length > 0) {
//           roomId = bookingRows[0].room_id;
//         }
//       }

//       if (roomId) {
//         // Update room status to available
//         const Room = require('./Room');
//         await Room.updateStatus(roomId, hotelId, 'available');
//         console.log(`✅ Room ${roomId} status updated to available`);
//       }
//     }

//     return result.affectedRows > 0;
//   } catch (error) {
//     console.error('❌ Error in Booking.update:', error);
//     throw error;
//   }
// }

//   // Update booking status
//   static async updateStatus(id, hotelId, status) {
//     const [result] = await pool.execute(bookingQueries.UPDATE_BOOKING_STATUS, [status, id, hotelId]);
//     return result.affectedRows > 0;
//   }

//   // Update booking payment status
//   static async updatePaymentStatus(id, hotelId, paymentStatus, transactionId) {
//     const [result] = await pool.execute(
//       bookingQueries.UPDATE_BOOKING_PAYMENT,
//       [paymentStatus, transactionId, id, hotelId]
//     );
//     return result.affectedRows > 0;
//   }

//   // Delete booking
//   static async delete(id, hotelId) {
//     const [result] = await pool.execute(bookingQueries.DELETE_BOOKING, [id, hotelId]);
//     return result.affectedRows > 0;
//   }

//   // Get bookings by date range - WITH TIMEZONE FIX
//   static async getByDateRange(hotelId, startDate, endDate) {
//     const [rows] = await pool.execute(
//       bookingQueries.GET_BOOKINGS_BY_DATE_RANGE,
//       [hotelId, endDate, startDate]
//     );
//     return rows.map(formatBookingDates);
//   }

//   // Check room availability - WITH TIMEZONE FIX
//   // static async checkRoomAvailability(roomId, hotelId, fromDate, toDate, excludeBookingId = null, status = 'booked') {
//   //   // Convert dates to UTC for database comparison
//   //   const convertToUTC = (dateString) => {
//   //     if (!dateString) return dateString;
//   //     const date = new Date(dateString);
//   //     // Subtract 5.5 hours to convert from IST to UTC
//   //     return new Date(date.getTime() - 19800000).toISOString().split('T')[0];
//   //   };

//   //   const utcFromDate = convertToUTC(fromDate);
//   //   const utcToDate = convertToUTC(toDate);

//   //   let query = bookingQueries.CHECK_ROOM_AVAILABILITY;
//   //   let params = [roomId, hotelId, utcToDate, utcFromDate];

//   //   // If we're booking, check all statuses except available
//   //   if (status === 'booked') {
//   //     params.push(excludeBookingId || 0);
//   //   } else {
//   //     // If we're blocking or maintenance, only check against 'booked' status
//   //     query = `
//   //       SELECT b.* 
//   //       FROM bookings b 
//   //       WHERE b.room_id = ? 
//   //       AND b.hotel_id = ?
//   //       AND b.from_date < ? 
//   //       AND b.to_date > ?
//   //       AND b.status = 'booked'
//   //       AND (? IS NULL OR b.id != ?)
//   //     `;
//   //     params = [roomId, hotelId, utcToDate, utcFromDate, excludeBookingId || 0, excludeBookingId || 0];
//   //   }

//   //   const [rows] = await pool.execute(query, params);

//   //   console.log(`Availability check for room ${roomId}: ${fromDate} to ${toDate} - ${rows.length} conflicts`);
//   //   return rows.length === 0;
//   // }

//   // models/Booking.js - Fix the checkRoomAvailability method
//   // static async checkRoomAvailability(roomId, hotelId, fromDate, toDate, excludeBookingId = null, status = 'booked') {
//   //   // Convert dates to UTC for database comparison
//   //   const convertToUTC = (dateString) => {
//   //     if (!dateString) return dateString;
//   //     const date = new Date(dateString);
//   //     // Subtract 5.5 hours to convert from IST to UTC
//   //     return new Date(date.getTime() - 19800000).toISOString().split('T')[0];
//   //   };

//   //   const utcFromDate = convertToUTC(fromDate);
//   //   const utcToDate = convertToUTC(toDate);

//   //   let query;
//   //   let params;

//   //   if (status === 'booked') {
//   //     // For booking, check against all occupied statuses
//   //     query = bookingQueries.CHECK_ROOM_AVAILABILITY;
//   //     params = [roomId, hotelId, utcToDate, utcFromDate, excludeBookingId || 0, excludeBookingId || 0];
//   //   } else {
//   //     // For block/maintenance, only check against 'booked' status
//   //     query = `
//   //     SELECT b.* 
//   //     FROM bookings b 
//   //     WHERE b.room_id = ? 
//   //     AND b.hotel_id = ?
//   //     AND b.from_date < ? 
//   //     AND b.to_date > ?
//   //     AND b.status = 'booked'
//   //     AND (? IS NULL OR b.id != ?)
//   //   `;
//   //     params = [roomId, hotelId, utcToDate, utcFromDate, excludeBookingId || 0, excludeBookingId || 0];
//   //   }

//   //   console.log('🔍 Availability check query:', { query, params, roomId, hotelId, fromDate, toDate, utcFromDate, utcToDate });

//   //   const [rows] = await pool.execute(query, params);

//   //   console.log(`✅ Availability check for room ${roomId}: ${fromDate} to ${toDate} - ${rows.length} conflicts`);
//   //   return rows.length === 0;
//   // }

//   // models/Booking.js - Fix the checkRoomAvailability method
// // models/Booking.js - Fix the checkRoomAvailability method with detailed logging
// static async checkRoomAvailability(roomId, hotelId, fromDate, toDate, excludeBookingId = null, status = 'booked') {
//   try {
//     console.log('='.repeat(40));
//     console.log('🔍 CHECKING ROOM AVAILABILITY - MODEL METHOD');
//     console.log('='.repeat(40));
//     console.log('Input parameters:', {
//       roomId,
//       hotelId,
//       fromDate,
//       toDate,
//       excludeBookingId,
//       status
//     });

//     // Validate dates
//     if (!fromDate || !toDate) {
//       console.log('⚠️ Missing dates in availability check');
//       return false;
//     }

//     // Convert dates to YYYY-MM-DD format for database comparison
//     const formatDateForDB = (dateStr) => {
//       const date = new Date(dateStr);
//       return date.toISOString().split('T')[0];
//     };

//     const dbFromDate = formatDateForDB(fromDate);
//     const dbToDate = formatDateForDB(toDate);

//     console.log('📅 Formatted dates for DB:', {
//       originalFromDate: fromDate,
//       originalToDate: toDate,
//       dbFromDate,
//       dbToDate
//     });

//     let query;
//     let params;

//     if (status === 'booked') {
//       // For booking, check against all occupied statuses
//       query = `
//         SELECT b.*, r.room_number 
//         FROM bookings b
//         LEFT JOIN rooms r ON b.room_id = r.id
//         WHERE b.room_id = ? 
//         AND b.hotel_id = ?
//         AND b.status IN ('booked', 'blocked', 'maintenance')
//         AND (
//           (b.from_date <= ? AND b.to_date >= ?) OR
//           (b.from_date <= ? AND b.to_date >= ?) OR
//           (b.from_date >= ? AND b.to_date <= ?)
//         )
//         ${excludeBookingId ? 'AND b.id != ?' : ''}
//       `;

//       params = [
//         roomId, hotelId,
//         dbToDate, dbFromDate,  // Overlap: existing booking ends after new start AND starts before new end
//         dbToDate, dbFromDate,  // Alternative condition
//         dbFromDate, dbToDate   // Existing booking is completely within new dates
//       ];

//       if (excludeBookingId) {
//         params.push(excludeBookingId);
//       }
//     } else {
//       // For block/maintenance, only check against 'booked' status
//       query = `
//         SELECT b.*, r.room_number 
//         FROM bookings b
//         LEFT JOIN rooms r ON b.room_id = r.id
//         WHERE b.room_id = ? 
//         AND b.hotel_id = ?
//         AND b.status = 'booked'
//         AND (
//           (b.from_date <= ? AND b.to_date >= ?) OR
//           (b.from_date <= ? AND b.to_date >= ?) OR
//           (b.from_date >= ? AND b.to_date <= ?)
//         )
//         ${excludeBookingId ? 'AND b.id != ?' : ''}
//       `;

//       params = [
//         roomId, hotelId,
//         dbToDate, dbFromDate,
//         dbToDate, dbFromDate,
//         dbFromDate, dbToDate
//       ];

//       if (excludeBookingId) {
//         params.push(excludeBookingId);
//       }
//     }

//     console.log('📝 SQL Query:', query);
//     console.log('📝 SQL Params:', params);

//     const [rows] = await pool.execute(query, params);

//     console.log(`📊 Query returned ${rows.length} conflicting bookings`);

//     // If there are conflicts, log the details
//     if (rows.length > 0) {
//       console.log('❌ CONFLICTING BOOKINGS FOUND:');
//       rows.forEach((row, index) => {
//         console.log(`  Conflict #${index + 1}:`, {
//           id: row.id,
//           room_id: row.room_id,
//           room_number: row.room_number,
//           from_date: row.from_date,
//           to_date: row.to_date,
//           status: row.status,
//           customer_id: row.customer_id
//         });
//       });
//     } else {
//       console.log('✅ No conflicting bookings found - Room is available');
//     }

//     console.log('='.repeat(40));

//     return rows.length === 0; // Available if no conflicts
//   } catch (error) {
//     console.error('❌ ERROR in checkRoomAvailability:', error);
//     throw error;
//   }
// }

//   // Get booking statistics - WITH TIMEZONE FIX
//   static async getStats(hotelId) {
//     const [rows] = await pool.execute(bookingQueries.GET_BOOKING_STATS, [hotelId]);
//     if (rows[0]) {
//       return formatBookingDates(rows[0]);
//     }
//     return null;
//   }

//   // Get today's check-ins
//   static async getTodaysCheckins(hotelId) {
//     const [rows] = await pool.execute(bookingQueries.GET_TODAYS_CHECKINS, [hotelId]);
//     return rows.map(formatBookingDates);
//   }

//   // Get today's check-outs
//   static async getTodaysCheckouts(hotelId) {
//     const [rows] = await pool.execute(bookingQueries.GET_TODAYS_CHECKOUTS, [hotelId]);
//     return rows.map(formatBookingDates);
//   }

//   // Get bookings by payment status
//   static async getByPaymentStatus(hotelId, paymentStatus) {
//     const [rows] = await pool.execute(bookingQueries.GET_BOOKINGS_BY_PAYMENT_STATUS, [hotelId, paymentStatus]);
//     return rows.map(formatBookingDates);
//   }
//   // Check for duplicate booking
//   // static async checkDuplicateBooking(hotelId, roomId, customerId, fromDate, toDate, excludeBookingId = null) {
//   //   // Convert dates to UTC for comparison
//   //   const convertToUTC = (dateString) => {
//   //     if (!dateString) return dateString;
//   //     const date = new Date(dateString);
//   //     return new Date(date.getTime() - 19800000).toISOString().split('T')[0];
//   //   };

//   //   const utcFromDate = convertToUTC(fromDate);
//   //   const utcToDate = convertToUTC(toDate);

//   //   let query = `
//   //   SELECT b.* 
//   //   FROM bookings b 
//   //   WHERE b.hotel_id = ? 
//   //   AND b.room_id = ?
//   //   AND b.customer_id = ?
//   //   AND b.from_date = ?
//   //   AND b.to_date = ?
//   //   AND b.status IN ('booked', 'blocked', 'maintenance')
//   // `;

//   //   let params = [hotelId, roomId, customerId, utcFromDate, utcToDate];

//   //   if (excludeBookingId) {
//   //     query += ` AND b.id != ?`;
//   //     params.push(excludeBookingId);
//   //   }

//   //   const [rows] = await pool.execute(query, params);
//   //   return rows.length > 0; // true if duplicate exists
//   // }

//   // Check for duplicate booking
// static async checkDuplicateBooking(hotelId, roomId, customerId, fromDate, toDate, excludeBookingId = null) {
//   try {
//     console.log('='.repeat(40));
//     console.log('🔍 CHECKING DUPLICATE BOOKING');
//     console.log('='.repeat(40));
//     console.log('Input:', { hotelId, roomId, customerId, fromDate, toDate, excludeBookingId });

//     // Convert dates to YYYY-MM-DD format
//     const formatDateForDB = (dateStr) => {
//       const date = new Date(dateStr);
//       return date.toISOString().split('T')[0];
//     };

//     const dbFromDate = formatDateForDB(fromDate);
//     const dbToDate = formatDateForDB(toDate);

//     let query = `
//       SELECT b.*, c.name as customer_name, r.room_number
//       FROM bookings b
//       LEFT JOIN customers c ON b.customer_id = c.id
//       LEFT JOIN rooms r ON b.room_id = r.id
//       WHERE b.hotel_id = ? 
//       AND b.room_id = ?
//       AND b.customer_id = ?
//       AND b.from_date = ?
//       AND b.to_date = ?
//       AND b.status IN ('booked', 'blocked', 'maintenance')
//     `;

//     let params = [hotelId, roomId, customerId, dbFromDate, dbToDate];

//     if (excludeBookingId) {
//       query += ` AND b.id != ?`;
//       params.push(excludeBookingId);
//     }

//     console.log('📝 Duplicate check query:', query);
//     console.log('📝 Duplicate check params:', params);

//     const [rows] = await pool.execute(query, params);

//     console.log(`📊 Found ${rows.length} duplicate bookings`);
//     if (rows.length > 0) {
//       console.log('❌ Duplicate details:', rows[0]);
//     }

//     console.log('='.repeat(40));

//     return rows.length > 0 ? rows[0] : null; // Return the duplicate if exists
//   } catch (error) {
//     console.error('❌ Error checking duplicate booking:', error);
//     throw error;
//   }
// }

//   static async getNextInvoiceNumber(hotelId) {
//     try {
//       const currentYear = new Date().getFullYear();
//       const prefix = `INV-${currentYear}-`;

//       const [rows] = await pool.execute(
//         `SELECT invoice_number 
//          FROM bookings 
//          WHERE hotel_id = ? 
//          AND invoice_number LIKE ?
//          ORDER BY CAST(SUBSTRING(invoice_number, ?) AS UNSIGNED) DESC 
//          LIMIT 1`,
//         [hotelId, `${prefix}%`, prefix.length + 1]
//       );

//       if (rows.length > 0 && rows[0].invoice_number) {
//         const lastInvoice = rows[0].invoice_number;
//         const lastNumber = parseInt(lastInvoice.split('-')[2]) || 0;
//         return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
//       }

//       return `${prefix}0001`;
//     } catch (error) {
//       console.error('Error getting next invoice number:', error);
//       return `INV-${new Date().getFullYear()}-0001`;
//     }
//   }

//   // Update invoice number
//   static async updateInvoiceNumber(id, hotelId, invoiceNumber) {
//     try {
//       const [result] = await pool.execute(
//         'UPDATE bookings SET invoice_number = ? WHERE id = ? AND hotel_id = ?',
//         [invoiceNumber, id, hotelId]
//       );
//       return result.affectedRows > 0;
//     } catch (error) {
//       console.error('Error updating invoice number:', error);
//       throw error;
//     }
//   }

//   // Check if invoice number exists
//   static async checkInvoiceNumberExists(invoiceNumber, hotelId, excludeId = null) {
//     try {
//       let query = 'SELECT COUNT(*) as count FROM bookings WHERE invoice_number = ? AND hotel_id = ?';
//       let params = [invoiceNumber, hotelId];

//       if (excludeId) {
//         query += ' AND id != ?';
//         params.push(excludeId);
//       }

//       const [rows] = await pool.execute(query, params);
//       return rows[0].count > 0;
//     } catch (error) {
//       console.error('Error checking invoice number:', error);
//       throw error;
//     }
//   }

//   // models/Booking.js - Add this method for creating block/maintenance bookings
//   static async createSpecialBooking(bookingData, type = 'blocked') {
//     try {
//       console.log('📝 Creating special booking:', { bookingData, type });

//       // Basic validation
//       if (!bookingData.hotel_id || !bookingData.room_id || !bookingData.from_date || !bookingData.to_date) {
//         throw new Error('Missing required fields');
//       }

//       // Default values
//       const defaults = {
//         from_time: '00:00:00',
//         to_time: '23:59:59',
//         amount: 0,
//         service: 0,
//         gst: 0,
//         total: 0,
//         status: type, // 'blocked' or 'maintenance'
//         guests: 0,
//         special_requests: type === 'blocked' ? 'Room blocked' : 'Room under maintenance',
//         payment_method: 'none',
//         payment_status: 'none',
//         referral_by: 'Admin',
//         referral_amount: 0
//       };

//       // Merge defaults with provided data
//       const mergedData = { ...defaults, ...bookingData };

//       // Let's first see what columns exist in your bookings table
//       const [columns] = await pool.execute(`
//       SELECT COLUMN_NAME 
//       FROM INFORMATION_SCHEMA.COLUMNS 
//       WHERE TABLE_NAME = 'bookings' 
//       AND TABLE_SCHEMA = DATABASE()
//       ORDER BY ORDINAL_POSITION
//     `);

//       console.log('📋 Available columns in bookings table:', columns.map(c => c.COLUMN_NAME));

//       // Build dynamic query based on actual table structure
//       const fields = [];
//       const values = [];
//       const placeholders = [];

//       // Map of possible fields to include
//       const fieldMap = {
//         hotel_id: mergedData.hotel_id,
//         room_id: mergedData.room_id,
//         customer_id: mergedData.customer_id || null,
//         from_date: mergedData.from_date,
//         to_date: mergedData.to_date,
//         from_time: mergedData.from_time,
//         to_time: mergedData.to_time,
//         status: mergedData.status,
//         amount: mergedData.amount,
//         service: mergedData.service,
//         gst: mergedData.gst,
//         total: mergedData.total,
//         guests: mergedData.guests,
//         special_requests: mergedData.special_requests,
//         id_type: mergedData.id_type || 'aadhaar',
//         payment_method: mergedData.payment_method,
//         payment_status: mergedData.payment_status,
//         transaction_id: mergedData.transaction_id || null,
//         referral_by: mergedData.referral_by,
//         referral_amount: mergedData.referral_amount,
//         invoice_number: mergedData.invoice_number || null,
//         created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
//         updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
//       };

//       // Only include fields that exist in the table
//       const columnNames = columns.map(c => c.COLUMN_NAME);

//       for (const [key, value] of Object.entries(fieldMap)) {
//         if (columnNames.includes(key)) {
//           fields.push(key);
//           values.push(value);
//           placeholders.push('?');
//         }
//       }

//       const query = `INSERT INTO bookings (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

//       console.log('📝 Special booking query:', query);
//       console.log('📝 Special booking values:', values);

//       const [result] = await pool.execute(query, values);
//       console.log('✅ Special booking created with ID:', result.insertId);

//       return result.insertId;

//     } catch (error) {
//       console.error('❌ Error creating special booking:', error);
//       throw error;
//     }
//   }

// }

// module.exports = Booking;



const { pool } = require('../config/database');
const bookingQueries = require('../queries/bookingQueries');

class Booking {
  // Create new booking with all details
  // static async create(bookingData) {
  //   try {
  //     const total = bookingData.total ||
  //       (parseFloat(bookingData.amount || 0) +
  //         parseFloat(bookingData.service || 0) +
  //         parseFloat(bookingData.gst || 0) +
  //         parseFloat(bookingData.cgst || 0) +
  //         parseFloat(bookingData.sgst || 0) +
  //         parseFloat(bookingData.igst || 0));

  //     // Make sure status is valid
  //     const status = bookingData.status || 'booked';
  //     const validStatuses = ['booked', 'maintenance', 'blocked', 'available', 'completed', 'cancelled'];
  //     const finalStatus = validStatuses.includes(status) ? status : 'booked';

  //     const [result] = await pool.execute(
  //       bookingQueries.CREATE_BOOKING,
  //       [
  //         bookingData.hotel_id,
  //         bookingData.room_id,
  //         bookingData.customer_id || null,
  //         bookingData.from_date,
  //         bookingData.to_date,
  //         bookingData.from_time || '14:00:00',
  //         bookingData.to_time || '12:00:00',
  //         finalStatus,
  //         parseFloat(bookingData.amount || 0),
  //         parseFloat(bookingData.service || 0),
  //         parseFloat(bookingData.gst || 0),
  //         parseFloat(bookingData.cgst || 0),
  //         parseFloat(bookingData.sgst || 0),
  //         parseFloat(bookingData.igst || 0),
  //         parseFloat(total),
  //         parseInt(bookingData.guests || 1),
  //         bookingData.special_requests || '',
  //         bookingData.id_type || 'aadhaar',
  //         bookingData.payment_method || 'cash',
  //         bookingData.payment_status || 'pending',
  //         bookingData.transaction_id || null,
  //         bookingData.referral_by || '',
  //         parseFloat(bookingData.referral_amount || 0),
  //         bookingData.invoice_number || null
  //       ]
  //     );
  //     return result.insertId;
  //   } catch (error) {
  //     console.error('Error in Booking.create:', error);
  //     throw error;
  //   }
  // }

  // In models/Booking.js - Find the create method and replace it
  // static async create(bookingData) {
  //   try {
  //     // Calculate total if not provided
  //     const total = bookingData.total ||
  //       (parseFloat(bookingData.amount || 0) +
  //         parseFloat(bookingData.service || 0) +
  //         parseFloat(bookingData.gst || 0) +
  //         parseFloat(bookingData.cgst || 0) +
  //         parseFloat(bookingData.sgst || 0) +
  //         parseFloat(bookingData.igst || 0));

  //     // Calculate advance payment fields
  //     const advancePaid = parseFloat(bookingData.advance_amount_paid || 0);
  //     const remainingAmount = total - advancePaid;

  //     // Make sure status is valid
  //     const status = bookingData.status || 'booked';
  //     const validStatuses = ['booked', 'maintenance', 'blocked', 'available', 'completed', 'cancelled'];
  //     const finalStatus = validStatuses.includes(status) ? status : 'booked';

  //     console.log('📝 Creating booking with advance payment:', {
  //       total,
  //       advancePaid,
  //       remainingAmount,
  //       advance_booking_id: bookingData.advance_booking_id
  //     });

  //     const [result] = await pool.execute(
  //       bookingQueries.CREATE_BOOKING,
  //       [
  //         bookingData.hotel_id,
  //         bookingData.room_id,
  //         bookingData.customer_id || null,
  //         bookingData.advance_booking_id || null,  // ← NEW: Link to advance booking
  //         bookingData.from_date,
  //         bookingData.to_date,
  //         bookingData.from_time || '14:00:00',
  //         bookingData.to_time || '12:00:00',
  //         finalStatus,
  //         parseFloat(bookingData.amount || 0),
  //         parseFloat(bookingData.service || 0),
  //         parseFloat(bookingData.gst || 0),
  //         parseFloat(bookingData.cgst || 0),
  //         parseFloat(bookingData.sgst || 0),
  //         parseFloat(bookingData.igst || 0),
  //         parseFloat(total),                         // Full total
  //         advancePaid,                                // ← NEW: Advance amount paid
  //         remainingAmount,                            // ← NEW: Remaining amount
  //         parseInt(bookingData.guests || 1),
  //         bookingData.special_requests || '',
  //         bookingData.id_type || 'aadhaar',
  //         bookingData.payment_method || 'cash',
  //         bookingData.payment_status || 'pending',
  //         bookingData.transaction_id || null,
  //         bookingData.referral_by || '',
  //         parseFloat(bookingData.referral_amount || 0),
  //         bookingData.invoice_number || null
  //       ]
  //     );
  //     return result.insertId;
  //   } catch (error) {
  //     console.error('Error in Booking.create:', error);
  //     throw error;
  //   }
  // }

  // In models/Booking.js - Update the create method
  static async create(bookingData) {
    try {
      // Calculate total if not provided
      const total = bookingData.total ||
        (parseFloat(bookingData.amount || 0) +
          parseFloat(bookingData.service || 0) +
          parseFloat(bookingData.gst || 0) +
          parseFloat(bookingData.cgst || 0) +
          parseFloat(bookingData.sgst || 0) +
          parseFloat(bookingData.igst || 0));

      // Calculate advance payment fields
      const advancePaid = parseFloat(bookingData.advance_amount_paid || 0);
      const remainingAmount = total - advancePaid;

      // Make sure status is valid
      const status = bookingData.status || 'booked';
      const validStatuses = ['booked', 'maintenance', 'blocked', 'available', 'completed', 'cancelled'];
      const finalStatus = validStatuses.includes(status) ? status : 'booked';

      console.log('📝 Creating booking with advance payment:', {
        total,
        advancePaid,
        remainingAmount,
        advance_booking_id: bookingData.advance_booking_id,
        group_booking_id: bookingData.group_booking_id // Add this log
      });

      const [result] = await pool.execute(
        bookingQueries.CREATE_BOOKING,
        [
          bookingData.hotel_id,
          bookingData.room_id,
          bookingData.customer_id || null,
          bookingData.advance_booking_id || null,
          bookingData.group_booking_id || null,  // ← ADD THIS - group_booking_id
          bookingData.from_date,
          bookingData.to_date,
          bookingData.from_time || '14:00:00',
          bookingData.to_time || '12:00:00',
          finalStatus,
          parseFloat(bookingData.amount || 0),
          parseFloat(bookingData.service || 0),
          parseFloat(bookingData.gst || 0),
          parseFloat(bookingData.cgst || 0),
          parseFloat(bookingData.sgst || 0),
          parseFloat(bookingData.igst || 0),
          parseFloat(total),
          advancePaid,
          remainingAmount,
          parseInt(bookingData.guests || 1),
          bookingData.special_requests || '',
          bookingData.id_type || 'aadhaar',
          bookingData.payment_method || 'cash',
          bookingData.payment_status || 'pending',
          bookingData.transaction_id || null,
          bookingData.referral_by || '',
          parseFloat(bookingData.referral_amount || 0),
          bookingData.invoice_number || null
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in Booking.create:', error);
      throw error;
    }
  }

  // Add this new method to get booking with advance details
  static async findByIdWithAdvance(id, hotelId) {
    try {
      const [rows] = await pool.execute(
        bookingQueries.GET_BOOKING_WITH_ADVANCE,
        [id, hotelId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findByIdWithAdvance:', error);
      throw error;
    }
  }

  // Create booking without customer (for blocks/maintenance)
  static async createWithoutCustomer(bookingData) {
    const total = parseFloat(bookingData.amount || 0) +
      parseFloat(bookingData.service || 0) +
      parseFloat(bookingData.gst || 0);

    const [result] = await pool.execute(
      bookingQueries.CREATE_BOOKING_WITHOUT_CUSTOMER,
      [
        bookingData.hotel_id,
        bookingData.room_id,
        bookingData.from_date,
        bookingData.to_date,
        bookingData.from_time || '14:00:00',
        bookingData.to_time || '12:00:00',
        bookingData.status || 'blocked',
        parseFloat(bookingData.amount || 0),
        parseFloat(bookingData.service || 0),
        parseFloat(bookingData.gst || 0),
        parseFloat(total),
        parseInt(bookingData.guests || 1),
        bookingData.special_requests || '',
        bookingData.referral_by || '',
        parseFloat(bookingData.referral_amount || 0)
      ]
    );
    return result.insertId;
  }

  // Find booking by ID
  static async findById(id, hotelId) {
    const [rows] = await pool.execute(bookingQueries.FIND_BOOKING_BY_ID, [id, hotelId]);
    return rows[0] || null;
  }

  // Get bookings with details
  static async findByHotelWithDetails(hotelId) {
    const [rows] = await pool.execute(bookingQueries.GET_BOOKINGS_WITH_DETAILS, [hotelId]);
    return rows;
  }

  // Update booking
  static async update(id, hotelId, bookingData) {
    console.log('📝 Booking.update called with:', { id, hotelId, bookingData });

    const updates = [];
    const params = [];

    const addField = (fieldName, value, isNumber = false) => {
      if (value !== undefined) {
        updates.push(`${fieldName} = ?`);
        params.push(isNumber ? parseFloat(value) || 0 : value);
      }
    };

    addField('room_id', bookingData.room_id);
    addField('customer_id', bookingData.customer_id);
    addField('from_date', bookingData.from_date);
    addField('to_date', bookingData.to_date);
    addField('from_time', bookingData.from_time);
    addField('to_time', bookingData.to_time);
    addField('amount', bookingData.amount, true);
    addField('service', bookingData.service, true);
    addField('gst', bookingData.gst, true);
    addField('cgst', bookingData.cgst, true);
    addField('sgst', bookingData.sgst, true);
    addField('igst', bookingData.igst, true);

    if (bookingData.amount !== undefined ||
      bookingData.service !== undefined ||
      bookingData.gst !== undefined ||
      bookingData.cgst !== undefined ||
      bookingData.sgst !== undefined ||
      bookingData.igst !== undefined) {
      const amount = parseFloat(bookingData.amount) || 0;
      const service = parseFloat(bookingData.service) || 0;
      const gst = parseFloat(bookingData.gst) || 0;
      const cgst = parseFloat(bookingData.cgst) || 0;
      const sgst = parseFloat(bookingData.sgst) || 0;
      const igst = parseFloat(bookingData.igst) || 0;
      const total = amount + service + gst + cgst + sgst + igst;
      addField('total', total, true);
    } else {
      addField('total', bookingData.total, true);
    }

    if (bookingData.status !== undefined) {
      const validStatuses = ['booked', 'maintenance', 'blocked', 'available', 'completed', 'cancelled'];
      if (validStatuses.includes(bookingData.status)) {
        addField('status', bookingData.status);
      }
    }

    addField('guests', bookingData.guests, true);
    addField('special_requests', bookingData.special_requests);
    addField('payment_method', bookingData.payment_method);
    addField('payment_status', bookingData.payment_status);
    addField('transaction_id', bookingData.transaction_id);
    addField('referral_by', bookingData.referral_by);
    addField('referral_amount', bookingData.referral_amount, true);

    if (updates.length === 0) {
      console.log('No fields to update');
      return false;
    }

    params.push(id);
    params.push(hotelId);

    const query = `UPDATE bookings SET ${updates.join(', ')} WHERE id = ? AND hotel_id = ?`;

    console.log('📝 Update query:', query);
    console.log('📝 Update params:', params);

    try {
      const [result] = await pool.execute(query, params);
      console.log('✅ Update result:', result.affectedRows > 0);

      if (result.affectedRows > 0 && (bookingData.status === 'completed' || bookingData.status === 'cancelled')) {
        let roomId = bookingData.room_id;

        if (!roomId) {
          const [bookingRows] = await pool.execute(
            'SELECT room_id FROM bookings WHERE id = ? AND hotel_id = ?',
            [id, hotelId]
          );
          if (bookingRows.length > 0) {
            roomId = bookingRows[0].room_id;
          }
        }

        if (roomId) {
          const Room = require('./Room');
          await Room.updateStatus(roomId, hotelId, 'available');
          console.log(`✅ Room ${roomId} status updated to available`);
        }
      }

      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Error in Booking.update:', error);
      throw error;
    }
  }

  // Check room availability
  static async checkRoomAvailability(roomId, hotelId, fromDate, toDate, excludeBookingId = null, status = 'booked') {
    try {
      console.log('🔍 CHECKING ROOM AVAILABILITY');
      console.log('Input:', { roomId, hotelId, fromDate, toDate, excludeBookingId, status });

      if (!fromDate || !toDate) {
        console.log('⚠️ Missing dates');
        return false;
      }

      const query = `
        SELECT b.*, r.room_number 
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.room_id = ? 
        AND b.hotel_id = ?
        AND b.status IN ('booked', 'blocked', 'maintenance')
        AND (
          (b.from_date <= ? AND b.to_date >= ?) OR
          (b.from_date <= ? AND b.to_date >= ?) OR
          (b.from_date >= ? AND b.to_date <= ?)
        )
        ${excludeBookingId ? 'AND b.id != ?' : ''}
      `;

      const params = [
        roomId, hotelId,
        toDate, fromDate,
        toDate, fromDate,
        fromDate, toDate
      ];

      if (excludeBookingId) {
        params.push(excludeBookingId);
      }

      console.log('📝 SQL Query:', query);
      console.log('📝 SQL Params:', params);

      const [rows] = await pool.execute(query, params);

      console.log(`📊 Found ${rows.length} conflicting bookings`);

      if (rows.length > 0) {
        console.log('❌ Conflicts:', rows.map(r => ({
          id: r.id,
          from_date: r.from_date,
          to_date: r.to_date,
          status: r.status
        })));
      }

      return rows.length === 0;

    } catch (error) {
      console.error('❌ Error in checkRoomAvailability:', error);
      throw error;
    }
  }

  // Check for duplicate booking
  static async checkDuplicateBooking(hotelId, roomId, customerId, fromDate, toDate, excludeBookingId = null) {
    try {
      console.log('🔍 CHECKING DUPLICATE BOOKING');
      console.log('Input:', { hotelId, roomId, customerId, fromDate, toDate, excludeBookingId });

      let query = `
        SELECT b.*, c.name as customer_name, r.room_number
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.hotel_id = ? 
        AND b.room_id = ?
        AND b.customer_id = ?
        AND b.from_date = ?
        AND b.to_date = ?
        AND b.status IN ('booked', 'blocked', 'maintenance')
      `;

      let params = [hotelId, roomId, customerId, fromDate, toDate];

      if (excludeBookingId) {
        query += ` AND b.id != ?`;
        params.push(excludeBookingId);
      }

      console.log('📝 Duplicate check query:', query);
      console.log('📝 Duplicate check params:', params);

      const [rows] = await pool.execute(query, params);

      console.log(`📊 Found ${rows.length} duplicate bookings`);
      if (rows.length > 0) {
        console.log('❌ Duplicate details:', rows[0]);
      }

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('❌ Error checking duplicate booking:', error);
      throw error;
    }
  }

  static async getNextInvoiceNumber(hotelId) {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `INV-${currentYear}-`;

      const [rows] = await pool.execute(
        `SELECT invoice_number 
         FROM bookings 
         WHERE hotel_id = ? 
         AND invoice_number LIKE ?
         ORDER BY CAST(SUBSTRING(invoice_number, ?) AS UNSIGNED) DESC 
         LIMIT 1`,
        [hotelId, `${prefix}%`, prefix.length + 1]
      );

      if (rows.length > 0 && rows[0].invoice_number) {
        const lastInvoice = rows[0].invoice_number;
        const lastNumber = parseInt(lastInvoice.split('-')[2]) || 0;
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
      }

      return `${prefix}0001`;
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      return `INV-${new Date().getFullYear()}-0001`;
    }
  }

  // Update invoice number
  static async updateInvoiceNumber(id, hotelId, invoiceNumber) {
    try {
      const [result] = await pool.execute(
        'UPDATE bookings SET invoice_number = ? WHERE id = ? AND hotel_id = ?',
        [invoiceNumber, id, hotelId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating invoice number:', error);
      throw error;
    }
  }

  // Check if invoice number exists
  static async checkInvoiceNumberExists(invoiceNumber, hotelId, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM bookings WHERE invoice_number = ? AND hotel_id = ?';
      let params = [invoiceNumber, hotelId];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [rows] = await pool.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking invoice number:', error);
      throw error;
    }
  }

  // Create special booking (block/maintenance)
  // static async createSpecialBooking(bookingData, type = 'blocked') {
  //   try {
  //     console.log('📝 Creating special booking:', { bookingData, type });

  //     if (!bookingData.hotel_id || !bookingData.room_id || !bookingData.from_date || !bookingData.to_date) {
  //       throw new Error('Missing required fields');
  //     }

  //     const defaults = {
  //       from_time: '00:00:00',
  //       to_time: '23:59:59',
  //       amount: 0,
  //       service: 0,
  //       gst: 0,
  //       total: 0,
  //       status: type,
  //       guests: 0,
  //       special_requests: type === 'blocked' ? 'Room blocked' : 'Room under maintenance',
  //       payment_method: 'none',
  //       payment_status: 'none',
  //       referral_by: 'Admin',
  //       referral_amount: 0
  //     };

  //     const mergedData = { ...defaults, ...bookingData };

  //     const query = `
  //       INSERT INTO bookings (
  //         hotel_id, room_id, from_date, to_date, from_time, to_time,
  //         status, amount, service, gst, total, guests, special_requests,
  //         payment_method, payment_status, referral_by, referral_amount
  //       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  //     `;

  //     const values = [
  //       mergedData.hotel_id,
  //       mergedData.room_id,
  //       mergedData.from_date,
  //       mergedData.to_date,
  //       mergedData.from_time,
  //       mergedData.to_time,
  //       mergedData.status,
  //       mergedData.amount,
  //       mergedData.service,
  //       mergedData.gst,
  //       mergedData.total,
  //       mergedData.guests,
  //       mergedData.special_requests,
  //       mergedData.payment_method,
  //       mergedData.payment_status,
  //       mergedData.referral_by,
  //       mergedData.referral_amount
  //     ];

  //     const [result] = await pool.execute(query, values);
  //     console.log('✅ Special booking created with ID:', result.insertId);

  //     return result.insertId;

  //   } catch (error) {
  //     console.error('❌ Error creating special booking:', error);
  //     throw error;
  //   }
  // }

  // In models/Booking.js - Update createSpecialBooking
  static async createSpecialBooking(bookingData, type = 'blocked') {
    try {
      console.log('📝 Creating special booking:', { bookingData, type });

      if (!bookingData.hotel_id || !bookingData.room_id || !bookingData.from_date || !bookingData.to_date) {
        throw new Error('Missing required fields');
      }

      const defaults = {
        from_time: '00:00:00',
        to_time: '23:59:59',
        amount: 0,
        service: 0,
        gst: 0,
        total: 0,
        status: type,
        guests: 0,
        special_requests: type === 'blocked' ? 'Room blocked' : 'Room under maintenance',
        payment_method: 'none',
        payment_status: 'none',
        referral_by: 'Admin',
        referral_amount: 0
      };

      const mergedData = { ...defaults, ...bookingData };

      const query = `
      INSERT INTO bookings (
        hotel_id, room_id, customer_id, from_date, to_date, from_time, to_time,
        status, amount, service, gst, total, guests, special_requests,
        payment_method, payment_status, referral_by, referral_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const values = [
        mergedData.hotel_id,
        mergedData.room_id,
        mergedData.customer_id || null,  // ← Include customer_id
        mergedData.from_date,
        mergedData.to_date,
        mergedData.from_time,
        mergedData.to_time,
        mergedData.status,
        mergedData.amount,
        mergedData.service,
        mergedData.gst,
        mergedData.total,
        mergedData.guests,
        mergedData.special_requests,
        mergedData.payment_method,
        mergedData.payment_status,
        mergedData.referral_by,
        mergedData.referral_amount
      ];

      const [result] = await pool.execute(query, values);
      console.log('✅ Special booking created with ID:', result.insertId);

      return result.insertId;

    } catch (error) {
      console.error('❌ Error creating special booking:', error);
      throw error;
    }
  }

  // Delete booking
  static async delete(id, hotelId) {
    const [result] = await pool.execute(bookingQueries.DELETE_BOOKING, [id, hotelId]);
    return result.affectedRows > 0;
  }

  
  //  createWithGroup 
  static async createWithGroup(bookingData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO bookings (
        hotel_id, room_id, customer_id, group_booking_id,
        from_date, to_date, from_time, to_time,
        status, amount, service, cgst, sgst, igst, total,
        guests, special_requests, payment_method, payment_status,
        id_type, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingData.hotel_id,
          bookingData.room_id,
          bookingData.customer_id,
          bookingData.group_booking_id,
          bookingData.from_date,
          bookingData.to_date,
          bookingData.from_time,
          bookingData.to_time,
          bookingData.status || 'booked',
          parseFloat(bookingData.amount || 0),
          parseFloat(bookingData.service || 0),
          parseFloat(bookingData.cgst || 0),
          parseFloat(bookingData.sgst || 0),
          parseFloat(bookingData.igst || 0),
          parseFloat(bookingData.total || 0),
          parseInt(bookingData.guests || 1),
          bookingData.special_requests || '',
          bookingData.payment_method || 'cash',
          bookingData.payment_status || 'pending',
          bookingData.id_type || 'aadhaar',
          bookingData.transaction_id || null
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in Booking.createWithGroup:', error);
      throw error;
    }
  }

  // Find all bookings in a group
  static async findByGroupId(groupId, hotelId) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, r.room_number, r.type as room_type,
              c.name as customer_name, c.phone as customer_phone
       FROM bookings b
       LEFT JOIN rooms r ON b.room_id = r.id
       LEFT JOIN customers c ON b.customer_id = c.id
       WHERE b.group_booking_id = ? AND b.hotel_id = ?
       ORDER BY b.room_id`,
        [groupId, hotelId]
      );
      return rows;
    } catch (error) {
      console.error('Error in Booking.findByGroupId:', error);
      throw error;
    }
  }

  // Generate unique group ID
  static generateGroupId() {
    return `GRP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = Booking;