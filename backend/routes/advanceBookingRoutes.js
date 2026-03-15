const express = require('express');
const router = express.Router();
const advanceBookingController = require('../controllers/advanceBookingController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Advance booking routes
router.post('/', advanceBookingController.createAdvanceBooking);
router.get('/', advanceBookingController.getAdvanceBookings);
router.get('/stats', advanceBookingController.getAdvanceBookingStats);
router.get('/:id', advanceBookingController.getAdvanceBooking);
router.put('/:id', advanceBookingController.updateAdvanceBooking);
router.post('/:id/payment', advanceBookingController.addAdvancePayment);
router.post('/:id/convert', advanceBookingController.convertToBooking);
router.post('/:id/cancel', advanceBookingController.cancelAdvanceBooking);
router.get('/:id/invoice', advanceBookingController.generateInvoice);

// routes/advanceBookings.js - Add these routes

// Multi-room advance booking routes
router.post('/multiple', advanceBookingController.createMultipleAdvanceBookings);
router.get('/group/:groupId', advanceBookingController.getGroupAdvanceBookings);

module.exports = router;