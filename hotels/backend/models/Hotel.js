

const { pool } = require('../config/database');
const hotelQueries = require('../queries/hotelQueries');

class Hotel {
  // Create new hotel
  // static async create(hotelData) {
  //   const [result] = await pool.execute(
  //     hotelQueries.CREATE_HOTEL,
  //     [hotelData.name, hotelData.address, hotelData.plan || 'free',hotelData.gst_number || null]
  //   );
  //   return result.insertId;
  // }

   static async create(hotelData) {
    const [result] = await pool.execute(
      `INSERT INTO hotels (name, address, plan, gst_number, trial_expiry_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        hotelData.name, 
        hotelData.address, 
        hotelData.plan || 'base', 
        hotelData.gst_number || null,
        hotelData.trial_expiry_date || null
      ]
    );
    return result.insertId;
  }

  // Get hotels with expiring trials (29th day)
  static async getExpiringTrials() {
    const [rows] = await pool.execute(
      `SELECT h.*, u.email as admin_email, u.name as admin_name
       FROM hotels h
       JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
       WHERE h.plan = 'pro'
       AND h.trial_expiry_date = DATE_ADD(NOW(), INTERVAL 1 DAY)
       AND u.status = 'pending'`
    );
    return rows;
  }

  // Update hotel trial expiry
  static async updateTrialExpiry(hotelId, expiryDate) {
    const [result] = await pool.execute(
      `UPDATE hotels SET trial_expiry_date = ? WHERE id = ?`,
      [expiryDate, hotelId]
    );
    return result.affectedRows > 0;
  }

  // Find hotel by ID
  static async findById(id) {
    const [rows] = await pool.execute(hotelQueries.FIND_HOTEL_BY_ID, [id]);
    return rows[0];
  }

  // Find hotel by name
  static async findByName(name) {
    const [rows] = await pool.execute(hotelQueries.FIND_HOTEL_BY_NAME, [name]);
    return rows[0];
  }

  // Get all hotels
  static async getAll() {
    const [rows] = await pool.execute(hotelQueries.GET_ALL_HOTELS);
    return rows;
  }

  // Update hotel
  static async update(id, hotelData) {
    const [result] = await pool.execute(
      hotelQueries.UPDATE_HOTEL,
      [hotelData.name, hotelData.address, hotelData.plan, hotelData.gst_number || null, id]
    );
    return result.affectedRows > 0;
  }

  // Delete hotel
  static async delete(id) {
    const [result] = await pool.execute(hotelQueries.DELETE_HOTEL, [id]);
    return result.affectedRows > 0;
  }

  // Get hotel statistics
  static async getStats(id) {
    const [rows] = await pool.execute(hotelQueries.GET_HOTEL_STATS, [id]);
    return rows[0];
  }

  // ===========================================
  // NEW METHODS FOR TAX SETTINGS USING ROOMS TABLE
  // ===========================================

  // Get hotel settings with tax percentages from rooms table
  // static async getSettings(id) {
  //   // First get hotel basic info
  //   const hotel = await this.findById(id);
  //   if (!hotel) return null;

  //   // Get tax percentages from rooms (get first room's settings as hotel default)
  //   const [roomRows] = await pool.execute(
  //     `SELECT gst_percentage, service_charge_percentage FROM rooms 
  //      WHERE hotel_id = ? LIMIT 1`,
  //     [id]
  //   );

  //   // If no rooms yet, use defaults
  //   const taxSettings = roomRows[0] || {
  //     gst_percentage: 12.00,
  //     service_charge_percentage: 10.00
  //   };

  //   return {
  //     ...hotel,
  //     gst_percentage: taxSettings.gst_percentage,
  //     service_charge_percentage: taxSettings.service_charge_percentage
  //   };
  // }
static async getSettings(id) {
  // First get hotel basic info
  const hotel = await this.findById(id);
  if (!hotel) return null;

  // Get tax percentages from rooms including CGST, SGST, IGST
  const [roomRows] = await pool.execute(
    `SELECT gst_percentage, cgst_percentage, sgst_percentage, igst_percentage, service_charge_percentage 
     FROM rooms 
     WHERE hotel_id = ? LIMIT 1`,
    [id]
  );

  const taxSettings = roomRows[0] || {
    gst_percentage: 12.00,
    cgst_percentage: 6.00,
    sgst_percentage: 6.00,
    igst_percentage: 12.00,
    service_charge_percentage: 10.00
  };

  return {
    ...hotel,
    gst_percentage: taxSettings.gst_percentage,
    cgst_percentage: taxSettings.cgst_percentage,
    sgst_percentage: taxSettings.sgst_percentage,
    igst_percentage: taxSettings.igst_percentage,
    service_charge_percentage: taxSettings.service_charge_percentage,
    qrcode_image: hotel.qrcode_image,
    logo_image: hotel.logo_image
  };
}

  // Update hotel settings including tax percentages
 static async updateSettings(id, hotelData) {
  // Update basic hotel info
  const hotelUpdated = await this.update(id, {
    name: hotelData.name,
    address: hotelData.address,
    plan: hotelData.plan || 'pro',
    gst_number: hotelData.gst_number || null
  });

  if (!hotelUpdated) return false;

  // If tax percentages are provided, update ALL rooms
  if (hotelData.gst_percentage !== undefined || 
      hotelData.cgst_percentage !== undefined ||
      hotelData.sgst_percentage !== undefined ||
      hotelData.igst_percentage !== undefined ||
      hotelData.service_charge_percentage !== undefined) {
    
    // Build dynamic update query
    let updateQuery = 'UPDATE rooms SET ';
    const updates = [];
    const params = [];

    // Handle each tax field
    if (hotelData.gst_percentage !== undefined) {
      updates.push('gst_percentage = ?');
      params.push(hotelData.gst_percentage);
    }
    if (hotelData.cgst_percentage !== undefined) {
      updates.push('cgst_percentage = ?');
      params.push(hotelData.cgst_percentage);
    }
    if (hotelData.sgst_percentage !== undefined) {
      updates.push('sgst_percentage = ?');
      params.push(hotelData.sgst_percentage);
    }
    if (hotelData.igst_percentage !== undefined) {
      updates.push('igst_percentage = ?');
      params.push(hotelData.igst_percentage);
    }
    if (hotelData.service_charge_percentage !== undefined) {
      updates.push('service_charge_percentage = ?');
      params.push(hotelData.service_charge_percentage);
    }

    if (updates.length > 0) {
      updateQuery += updates.join(', ') + ' WHERE hotel_id = ?';
      params.push(id);
      await pool.execute(updateQuery, params);
    }
  }

  return true;
}

  // Update only tax settings for all rooms
 static async updateTaxSettings(id, gstPercentage, cgstPercentage, sgstPercentage, igstPercentage, serviceChargePercentage) {
  // Build dynamic query based on provided values
  const updates = [];
  const params = [];

  if (gstPercentage !== undefined) {
    updates.push('gst_percentage = ?');
    params.push(gstPercentage);
  }
  if (cgstPercentage !== undefined) {
    updates.push('cgst_percentage = ?');
    params.push(cgstPercentage);
  }
  if (sgstPercentage !== undefined) {
    updates.push('sgst_percentage = ?');
    params.push(sgstPercentage);
  }
  if (igstPercentage !== undefined) {
    updates.push('igst_percentage = ?');
    params.push(igstPercentage);
  }
  if (serviceChargePercentage !== undefined) {
    updates.push('service_charge_percentage = ?');
    params.push(serviceChargePercentage);
  }

  if (updates.length === 0) {
    return false;
  }

  params.push(id);

  const query = `UPDATE rooms SET ${updates.join(', ')} WHERE hotel_id = ?`;
  const [result] = await pool.execute(query, params);
  return result.affectedRows > 0;
}

  // Get hotel tax settings (from first room)
 
static async getTaxSettings(id) {
  const [rows] = await pool.execute(
    `SELECT gst_percentage, cgst_percentage, sgst_percentage, igst_percentage, service_charge_percentage 
     FROM rooms 
     WHERE hotel_id = ? LIMIT 1`,
    [id]
  );

  if (rows[0]) {
    return rows[0];
  }

  // Return defaults if no rooms
  return {
    gst_percentage: 18.00,
    cgst_percentage: 9.00,
    sgst_percentage: 9.00,
    igst_percentage: 18.00,
    service_charge_percentage: 10.00
  };
}

// In models/Hotel.js - Update the updateQRCode method

static async updateQRCode(id, qrCodeImage) {
  try {
    console.log('🔄 Updating QR code for hotel ID:', id);
    
    // If qrCodeImage is null/undefined, set it to NULL in database
    if (!qrCodeImage || qrCodeImage === '' || qrCodeImage === null) {
      console.log('⚠️ Setting QR code to NULL');
      const [result] = await pool.execute(
        `UPDATE hotels SET qrcode_image = NULL WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    }

    // Validate that it's a proper Base64 image string
    if (!qrCodeImage.startsWith('data:image/')) {
      console.warn('⚠️ QR code missing data URL prefix, adding it');
      qrCodeImage = `data:image/png;base64,${qrCodeImage}`;
    }

    // Validate the Base64 format
    const base64Regex = /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,([A-Za-z0-9+/]+={0,2})$/;
    if (!base64Regex.test(qrCodeImage)) {
      throw new Error('Invalid Base64 image format');
    }

    // Extract just the Base64 data (without the data URL prefix)
    const base64Data = qrCodeImage.split(',')[1];
    
    // Decode Base64 to verify it's valid image data
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      console.log('✅ Base64 data is valid, length:', buffer.length, 'bytes');
      
      if (buffer.length === 0) {
        throw new Error('Base64 data is empty after decoding');
      }
      
      // Check image dimensions if it's a PNG
      if (qrCodeImage.includes('image/png')) {
        // For PNG, check file signature
        if (buffer.length < 8) {
          throw new Error('PNG file too small');
        }
        // PNG signature: 137 80 78 71 13 10 26 10
        const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
        const signatureOk = pngSignature.every((byte, i) => buffer[i] === byte);
        if (!signatureOk) {
          console.warn('⚠️ PNG signature verification failed, but continuing anyway');
        }
      }
    } catch (decodeError) {
      console.error('❌ Base64 decoding error:', decodeError.message);
      throw new Error('Invalid Base64 data: ' + decodeError.message);
    }

    // Store the FULL Base64 string (with data URL prefix)
    // LONGTEXT can handle up to 4GB, so no truncation needed
    const [result] = await pool.execute(
      `UPDATE hotels SET qrcode_image = ? WHERE id = ?`,
      [qrCodeImage, id]
    );
    
    console.log('✅ QR code updated successfully');
    console.log('📊 QR code length:', qrCodeImage.length, 'characters');
    console.log('📊 Database update affected rows:', result.affectedRows);
    
    // Verify the update
    const [verifyRows] = await pool.execute(
      `SELECT LENGTH(qrcode_image) as length FROM hotels WHERE id = ?`,
      [id]
    );
    
    if (verifyRows[0]) {
      console.log('✅ Stored QR code length in DB:', verifyRows[0].length, 'characters');
      
      // Quick validation - stored length should be close to original
      if (Math.abs(verifyRows[0].length - qrCodeImage.length) > 100) {
        console.warn('⚠️ Length mismatch! Original:', qrCodeImage.length, 'Stored:', verifyRows[0].length);
      }
    }
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('❌ Error updating QR code:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

static async getQRCode(id) {
  try {
    console.log('🔍 Getting QR code for hotel ID:', id);
    
    const [rows] = await pool.execute(
      `SELECT qrcode_image FROM hotels WHERE id = ?`,
      [id]
    );
    
    const qrCode = rows[0]?.qrcode_image;
    
    if (!qrCode) {
      console.log('ℹ️ No QR code found for hotel ID:', id);
      return null;
    }
    
    console.log('✅ QR code retrieved, length:', qrCode.length, 'characters');
    
    // Validate the retrieved QR code
    if (!qrCode.startsWith('data:image/')) {
      console.warn('⚠️ Retrieved QR code missing data URL prefix');
      
      // Try to fix it
      if (qrCode.startsWith('iVBOR')) {
        const fixedQrCode = `data:image/png;base64,${qrCode}`;
        console.log('🔄 Fixed QR code format, new length:', fixedQrCode.length);
        return fixedQrCode;
      }
      
      console.error('❌ Invalid QR code format in database');
      return null;
    }
    
    // Verify it's a valid Base64 string
    const base64Regex = /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,([A-Za-z0-9+/]+={0,2})$/;
    if (!base64Regex.test(qrCode)) {
      console.error('❌ Invalid Base64 format in retrieved QR code');
      
      // Try to extract and validate Base64 data
      const parts = qrCode.split('base64,');
      if (parts.length === 2) {
        try {
          const base64Data = parts[1];
          const buffer = Buffer.from(base64Data, 'base64');
          if (buffer.length > 0) {
            console.log('✅ Base64 data is valid after extraction');
            return `data:image/png;base64,${base64Data}`;
          }
        } catch (error) {
          console.error('❌ Failed to decode Base64 data');
        }
      }
      return null;
    }
    
    return qrCode;
  } catch (error) {
    console.error('❌ Error getting QR code:', error.message);
    return null;
  }
}



// Find hotels with expired trials
static async findExpiredTrials() {
  const [rows] = await pool.execute(
    `SELECT h.*, u.id as admin_id, u.email as admin_email, u.name as admin_name, u.status as user_status
     FROM hotels h
     JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
     WHERE h.plan = 'pro'
     AND h.trial_expiry_date IS NOT NULL
     AND h.trial_expiry_date < NOW()
     AND (u.status = 'pending' OR u.status = 'suspended')`
  );
  return rows;
}

// Find hotels with expiring trials (2 days warning)
static async findExpiringTrials() {
  const [rows] = await pool.execute(
    `SELECT h.*, u.id as admin_id, u.email as admin_email, u.name as admin_name
     FROM hotels h
     JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
     WHERE h.plan = 'pro'
     AND h.trial_expiry_date IS NOT NULL
     AND h.trial_expiry_date > NOW()
     AND h.trial_expiry_date <= DATE_ADD(NOW(), INTERVAL 2 DAY)
     AND u.status = 'pending'`
  );
  return rows;
}

// In models/Hotel.js - Add these methods

// Find hotels with trials expiring in next X days
static async findTrialsExpiringInDays(days) {
  const [rows] = await pool.execute(
    `SELECT h.*, u.id as admin_id, u.email as admin_email, u.name as admin_name
     FROM hotels h
     JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
     WHERE h.plan = 'pro'
     AND h.trial_expiry_date IS NOT NULL
     AND h.trial_expiry_date > NOW()
     AND h.trial_expiry_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
     AND u.status = 'pending'`,
    [days]
  );
  return rows;
}

// Find hotels where trial expires today (for last day reminder)
static async findTrialsExpiringToday() {
  const [rows] = await pool.execute(
    `SELECT h.*, u.id as admin_id, u.email as admin_email, u.name as admin_name
     FROM hotels h
     JOIN users u ON h.id = u.hotel_id AND u.role = 'admin'
     WHERE h.plan = 'pro'
     AND h.trial_expiry_date IS NOT NULL
     AND DATE(h.trial_expiry_date) = CURDATE()
     AND u.status = 'pending'`
  );
  return rows;
}

// Upload hotel logo
static async updateLogo(id, logoImage) {
  try {
    console.log('🖼️ Updating logo for hotel ID:', id);
    
    // If logoImage is null/undefined, set it to NULL in database
    if (!logoImage || logoImage === '' || logoImage === null) {
      console.log('⚠️ Setting logo to NULL');
      const [result] = await pool.execute(
        `UPDATE hotels SET logo_image = NULL WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    }

    // Validate that it's a proper Base64 image string
    if (!logoImage.startsWith('data:image/')) {
      console.warn('⚠️ Logo missing data URL prefix, adding it');
      logoImage = `data:image/png;base64,${logoImage}`;
    }

    // Validate the Base64 format
    const base64Regex = /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,([A-Za-z0-9+/]+={0,2})$/;
    if (!base64Regex.test(logoImage)) {
      throw new Error('Invalid Base64 image format');
    }

    // Store the FULL Base64 string
    const [result] = await pool.execute(
      `UPDATE hotels SET logo_image = ? WHERE id = ?`,
      [logoImage, id]
    );
    
    console.log('✅ Logo updated successfully');
    console.log('📊 Logo length:', logoImage.length, 'characters');
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('❌ Error updating logo:', error.message);
    throw error;
  }
}

// Get hotel logo
static async getLogo(id) {
  try {
    console.log('🔍 Getting logo for hotel ID:', id);
    
    const [rows] = await pool.execute(
      `SELECT logo_image FROM hotels WHERE id = ?`,
      [id]
    );
    
    const logo = rows[0]?.logo_image;
    
    if (!logo) {
      console.log('ℹ️ No logo found for hotel ID:', id);
      return null;
    }
    
    console.log('✅ Logo retrieved, length:', logo.length, 'characters');
    
    return logo;
  } catch (error) {
    console.error('❌ Error getting logo:', error.message);
    return null;
  }
}
}

module.exports = Hotel;
