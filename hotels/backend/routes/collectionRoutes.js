

const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET collections
router.get('/', 
  authorize(['admin', 'staff'], ['view_collections']), 
  collectionController.getCollections
);

// GET cash bookings
router.get('/cash-bookings',
  authorize(['admin', 'staff'], ['view_collections']),
  collectionController.getCashBookings
);

// POST create new collection
router.post('/',
  authorize(['admin', 'staff'], ['manage_collections']),
  collectionController.createCollection
);

// POST handover cash
router.post('/:id/handover',
  authorize(['admin', 'staff'], ['manage_collections']),
  collectionController.handoverCash
);

// GET test endpoint
router.get('/test',
  authorize(['admin', 'staff'], ['view_collections']),
  collectionController.testCollections
);

module.exports = router;