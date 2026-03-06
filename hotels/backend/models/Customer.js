

const { pool } = require('../config/database');
const customerQueries = require('../queries/customerQueries');

class Customer {
  // Create new customer with full details
  static async create(customerData) {
    const [result] = await pool.execute(
      customerQueries.CREATE_CUSTOMER,
      [
        customerData.hotel_id,
        customerData.name,
        customerData.phone,
        customerData.email || '',
        customerData.id_number || '',
        customerData.id_type || 'aadhaar',
        customerData.id_image || null,
        customerData.id_image2 || null,
        customerData.payment_method || 'cash',
        customerData.payment_status || 'pending',
        customerData.payment_reference || null,
        customerData.transaction_id || null,
        customerData.address || '',
        customerData.city || '',
        customerData.state || '',
        customerData.pincode || '',
         customerData.customer_gst_no || null, // NEW FIELD
         customerData.purpose_of_visit || null, // NEW FIELD
        customerData.other_expenses || 0,      // NEW FIELD
        customerData.expense_description || null // NEW FIELD
      ]
    );
    return result.insertId;
  }

  // Create customer basic (for backward compatibility)
  static async createBasic(customerData) {
    const [result] = await pool.execute(
      customerQueries.CREATE_CUSTOMER_BASIC,
      [
        customerData.hotel_id,
        customerData.name,
        customerData.phone,
        customerData.email || '',
        customerData.id_number || ''
      ]
    );
    return result.insertId;
  }

  // Find customer by ID
  static async findById(id, hotelId) {
    const [rows] = await pool.execute(customerQueries.FIND_CUSTOMER_BY_ID, [id, hotelId]);
    return rows[0];
  }

  // Find customer by ID with images
  static async findByIdWithImages(id, hotelId) {
    const [rows] = await pool.execute(customerQueries.GET_CUSTOMER_WITH_IMAGES, [id, hotelId]);
    return rows[0];
  }

  // Get customers by hotel
  static async findByHotel(hotelId) {
    const [rows] = await pool.execute(customerQueries.GET_CUSTOMERS_BY_HOTEL, [hotelId]);
    return rows;
  }

  // Update customer with full details
  // static async update(id, hotelId, customerData) {
  //   const [result] = await pool.execute(
  //     customerQueries.UPDATE_CUSTOMER,
  //     [
  //       customerData.name,
  //       customerData.phone,
  //       customerData.email,
  //       customerData.id_number,
  //       customerData.id_type,
  //       customerData.id_image,
  //       customerData.id_image2,
  //       customerData.payment_method,
  //       customerData.payment_status,
  //       customerData.payment_reference,
  //       customerData.transaction_id,
  //       customerData.address,
  //       customerData.city,
  //       customerData.state,
  //       customerData.pincode,
  //       id,
  //       hotelId
  //     ]
  //   );
  //   return result.affectedRows > 0;
  // }

  static async update(id, hotelId, customerData) {
    console.log('🔧 Updating customer with data:', { id, hotelId, customerData });
    
    // Ensure all values are properly set (convert undefined to null for MySQL)
    const updateData = {
      name: customerData.name || '',
      phone: customerData.phone || '',
      email: customerData.email || null,
      id_number: customerData.id_number || null,
      id_type: customerData.id_type || 'aadhaar',
      id_image: customerData.id_image || null,
      id_image2: customerData.id_image2 || null,
      payment_method: customerData.payment_method || 'cash',
      payment_status: customerData.payment_status || 'pending',
      payment_reference: customerData.payment_reference || null,
      transaction_id: customerData.transaction_id || null,
      address: customerData.address || null,
      city: customerData.city || null,
      state: customerData.state || null,
      pincode: customerData.pincode || null,
      customer_gst_no: customerData.customer_gst_no || null,    
      purpose_of_visit: customerData.purpose_of_visit || null, // NEW
      other_expenses: customerData.other_expenses || 0,        // NEW
      expense_description: customerData.expense_description || null // NEW
    };

    console.log('🔧 Prepared update data:', updateData);

    const [result] = await pool.execute(
      customerQueries.UPDATE_CUSTOMER,
      [
        updateData.name,
        updateData.phone,
        updateData.email,
        updateData.id_number,
        updateData.id_type,
        updateData.id_image,
        updateData.id_image2,
        updateData.payment_method,
        updateData.payment_status,
        updateData.payment_reference,
        updateData.transaction_id,
        updateData.address,
        updateData.city,
        updateData.state,
        updateData.pincode,
         updateData.customer_gst_no,
          updateData.purpose_of_visit,  
        updateData.other_expenses,   
        updateData.expense_description, 
        id,
        hotelId
      ]
    );
    return result.affectedRows > 0;
  }

  // Update customer basic (for backward compatibility)
  static async updateBasic(id, hotelId, customerData) {
    const [result] = await pool.execute(
      customerQueries.UPDATE_CUSTOMER_BASIC,
      [
        customerData.name,
        customerData.phone,
        customerData.email,
        customerData.id_number,
        id,
        hotelId
      ]
    );
    return result.affectedRows > 0;
  }

  // Update payment status
  static async updatePaymentStatus(id, hotelId, paymentStatus, transactionId) {
    const [result] = await pool.execute(
      customerQueries.UPDATE_PAYMENT_STATUS,
      [paymentStatus, transactionId, id, hotelId]
    );
    return result.affectedRows > 0;
  }

  // Delete customer
  static async delete(id, hotelId) {
    const [result] = await pool.execute(customerQueries.DELETE_CUSTOMER, [id, hotelId]);
    return result.affectedRows > 0;
  }

  // Search customers
  static async search(hotelId, searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await pool.execute(
      customerQueries.SEARCH_CUSTOMERS,
      [hotelId, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,  searchPattern ]
    );
    return rows;
  }

  // Get customer statistics
  static async getStats(hotelId) {
    const [rows] = await pool.execute(customerQueries.GET_CUSTOMER_STATS, [hotelId]);
    return rows[0];
  }

  // Find customer by phone
  static async findByPhone(phone, hotelId) {
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE phone = ? AND hotel_id = ?',
      [phone, hotelId]
    );
    return rows[0];
  }

  // Get customers with pending payments
  static async getCustomersWithPendingPayments(hotelId) {
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE hotel_id = ? AND payment_status = ?',
      [hotelId, 'pending']
    );
    return rows;
  }
}

module.exports = Customer;