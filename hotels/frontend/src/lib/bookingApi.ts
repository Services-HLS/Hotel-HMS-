



import { Booking } from '@/types/hotel';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {}
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
};

// ===========================================
// ROOM AVAILABILITY
// ===========================================

export const getAvailableRooms = async (params?: { from_date?: string; to_date?: string }): Promise<any[]> => {
  try {
    let url = `${API_BASE_URL}/rooms/available`;
    
    if (params && (params.from_date || params.to_date)) {
      const queryParams = new URLSearchParams();
      if (params.from_date) queryParams.append('from_date', params.from_date);
      if (params.to_date) queryParams.append('to_date', params.to_date);
      url += `?${queryParams.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return [];
  }
};

export const getAvailableRoomsCorrectly = async (params?: { from_date?: string; to_date?: string }): Promise<any[]> => {
  try {
    // Get auth token for headers
    const token = localStorage.getItem('authToken');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    // 1. First, get all rooms for the hotel
    const roomsResponse = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'GET',
      headers: headers,
    });
    
    if (!roomsResponse.ok) {
      console.error('❌ Failed to fetch rooms:', roomsResponse.status);
      return [];
    }
    
    const roomsResult = await roomsResponse.json();
    const allRooms = roomsResult.data || [];
    
    // If no dates provided, return all rooms (or filter by non-permanent status)
    if (!params?.from_date || !params?.to_date) {
      // Return rooms that are not permanently blocked/maintenance
      const availableByStatus = allRooms.filter(room => 
        room.status !== 'maintenance' && room.status !== 'blocked'
      );
      return availableByStatus;
    }
    
    // 2. Get all bookings for the hotel to check availability
    const bookingsResponse = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: headers,
    });
    
    if (!bookingsResponse.ok) {
      console.error('❌ Failed to fetch bookings:', bookingsResponse.status);
      return [];
    }
    
    const bookingsResult = await bookingsResponse.json();
    const allBookings = bookingsResult.data || [];
    
    // Parse the check dates
    const checkFrom = new Date(params.from_date).getTime();
    const checkTo = new Date(params.to_date).getTime();
    
    // 3. Find all bookings that conflict with the requested dates
    const conflictingRoomIds = new Set<number>();
    
    for (const booking of allBookings) {
      // Consider ALL statuses that make a room unavailable
      const skipStatuses = ['available', 'completed', 'cancelled', 'checked_out', 'checked-out'];
      if (skipStatuses.includes(booking.status?.toLowerCase())) {
        continue;
      }
      
      // Also check special_requests for maintenance keywords
      const isMaintenance = booking.special_requests?.toLowerCase().includes('maintenance') || 
                           booking.special_requests?.toLowerCase().includes('repair') ||
                           booking.special_requests?.toLowerCase().includes('fix');
      
      // Skip if status is empty AND it's not maintenance
      if (!booking.status && !isMaintenance) {
        continue;
      }
      
      // Skip if missing dates
      if (!booking.from_date || !booking.to_date) {
        continue;
      }
      
      try {
        const bookingFrom = new Date(booking.from_date).getTime();
        const bookingTo = new Date(booking.to_date).getTime();
        
        // Check if dates overlap
        const hasOverlap = bookingTo > checkFrom && bookingFrom < checkTo;
        
        if (hasOverlap) {
          conflictingRoomIds.add(booking.room_id);
        }
      } catch (dateError) {
        console.error('Error parsing dates for booking:', booking.id);
      }
    }
    
    // 4. Filter rooms that are NOT in the conflicting list
    const availableRooms = allRooms.filter(room => {
      // Skip if room is permanently blocked/maintenance in its own status
      if (room.status === 'maintenance' || room.status === 'blocked') {
        return false;
      }
      
      // Skip if room has conflicting booking/maintenance
      return !conflictingRoomIds.has(room.id);
    });
    
    return availableRooms;
    
  } catch (error) {
    console.error('❌ Error in getAvailableRoomsCorrectly:', error);
    return [];
  }
};

// ===========================================
// BOOKING OPERATIONS
// ===========================================

export const createBooking = async (bookingData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    
    const result = await handleResponse(response);
    return result;
  } catch (error) {
    console.error('❌ Error creating room booking:', error);
    throw error;
  }
};

export const checkRoomAvailability = async (
  roomId: number | string,
  fromDate: string,
  toDate: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/check-availability`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        room_id: roomId,
        from_date: fromDate,
        to_date: toDate
      }),
    });
    
    const result = await handleResponse(response);
    return result.data?.available || false;
  } catch (error) {
    console.error('Error checking room availability:', error);
    return false;
  }
};

// ===========================================
// CUSTOMER OPERATIONS
// ===========================================

export const searchCustomersByPhone = async (phone: string): Promise<any[]> => {
  try {
    if (!phone) {
      return [];
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const url = `${API_BASE_URL}/customers/search-by-phone?phone=${encodeURIComponent(cleanPhone)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      return result.data;
    }

    return [];
    
  } catch (error) {
    console.error('❌ Error in searchCustomersByPhone:', error);
    return [];
  }
};

export const createCustomer = async (customerData: any): Promise<any> => {
  try {
    // Validate required fields
    if (!customerData.name || !customerData.phone) {
      throw new Error('Name and phone are required');
    }
    
    // Standardize phone number
    const cleanPhone = customerData.phone.replace(/\D/g, '');
    const standardPhone = cleanPhone.replace(/^0+/, '');
    
    const cleanedData = {
      name: customerData.name.trim(),
      phone: standardPhone,
      email: customerData.email || null
    };
    
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });

    // Handle 400 error (usually means customer already exists)
    if (response.status === 400) {
      const errorData = await response.json();
      
      // Try to search for existing customer
      const existingCustomers = await searchCustomersByPhone(standardPhone);
      
      if (existingCustomers.length > 0) {
        return {
          success: true,
          customerId: existingCustomers[0].id,
          message: 'Customer already exists',
          data: existingCustomers[0]
        };
      }
      
      throw new Error(errorData.message || 'Failed to create customer');
    }
    
    // Handle successful response
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('❌ Error in createCustomer:', error);
    throw error;
  }
};

export const searchCustomers = async (query: string): Promise<any[]> => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    const response = await fetch(
      `${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    
    const result = await handleResponse(response);
    return result.data || [];
  } catch (error) {
    console.error('❌ Error searching customers:', error);
    return [];
  }
};