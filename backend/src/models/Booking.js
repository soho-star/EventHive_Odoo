const { executeQuery, executeTransaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Booking {
  constructor(data) {
    this.id = data.id;
    this.bookingId = data.booking_id;
    this.userId = data.user_id;
    this.eventId = data.event_id;
    this.ticketId = data.ticket_id;
    this.quantity = data.quantity;
    this.amount = data.amount;
    this.paymentStatus = data.payment_status;
    this.paymentMethod = data.payment_method;
    this.paymentGatewayId = data.payment_gateway_id;
    this.paymentMetadata = data.payment_metadata ? JSON.parse(data.payment_metadata) : {};
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;

    // Additional fields that might be joined
    this.event = data.event_name ? {
      id: data.event_id,
      name: data.event_name,
      eventStart: data.event_start,
      eventEnd: data.event_end,
      location: data.event_location
    } : null;

    this.ticket = data.ticket_type_name ? {
      id: data.ticket_id,
      typeName: data.ticket_type_name,
      price: data.ticket_price
    } : null;

    this.attendees = [];
  }

  // Create a new booking
  static async create(bookingData, userId) {
    const {
      eventId,
      ticketId,
      quantity = 1,
      attendees
    } = bookingData;

    return await executeTransaction(async (connection) => {
      // Verify ticket availability
      const ticketQuery = `
        SELECT t.*, e.name as event_name, e.event_start, e.registration_end
        FROM tickets t
        JOIN events e ON t.event_id = e.id
        WHERE t.id = ? AND t.event_id = ? AND t.is_active = 1
      `;

      const [tickets] = await connection.execute(ticketQuery, [ticketId, eventId]);
      
      if (tickets.length === 0) {
        throw new Error('Ticket not found or not available');
      }

      const ticket = tickets[0];

      // Check if registration is still open
      if (new Date() > new Date(ticket.registration_end)) {
        throw new Error('Registration period has ended');
      }

      // Check availability
      const availableTickets = ticket.max_total - ticket.sold_count;
      if (quantity > availableTickets) {
        throw new Error(`Only ${availableTickets} tickets available`);
      }

      // Check max per user limit
      if (quantity > ticket.max_per_user) {
        throw new Error(`Maximum ${ticket.max_per_user} tickets allowed per user`);
      }

      // Check if user already has tickets for this event
      const existingBookingsQuery = `
        SELECT SUM(quantity) as total_quantity
        FROM transactions
        WHERE user_id = ? AND event_id = ? AND payment_status = 'completed'
      `;

      const [existingBookings] = await connection.execute(existingBookingsQuery, [userId, eventId]);
      const existingQuantity = existingBookings[0].total_quantity || 0;

      if (existingQuantity + quantity > ticket.max_per_user) {
        throw new Error(`You can only book ${ticket.max_per_user} tickets for this event`);
      }

      // Generate booking ID
      const bookingId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Calculate total amount
      const amount = ticket.price * quantity;

      // Create transaction record
      const transactionQuery = `
        INSERT INTO transactions (
          booking_id, user_id, event_id, ticket_id, quantity, amount, 
          payment_status, payment_method
        ) VALUES (?, ?, ?, ?, ?, ?, 'completed', 'free')
      `;

      const [transactionResult] = await connection.execute(transactionQuery, [
        bookingId, userId, eventId, ticketId, quantity, amount
      ]);

      const transactionId = transactionResult.insertId;

      // Create attendee records and generate QR codes
      const attendeeIds = [];
      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        const qrCode = uuidv4();

        const attendeeQuery = `
          INSERT INTO attendees (
            transaction_id, name, email, phone, gender, qr_code
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [attendeeResult] = await connection.execute(attendeeQuery, [
          transactionId,
          attendee.name,
          attendee.email,
          attendee.phone || null,
          attendee.gender || null,
          qrCode
        ]);

        attendeeIds.push({
          id: attendeeResult.insertId,
          name: attendee.name,
          qrCode: qrCode
        });
      }

      // Update ticket sold count
      const updateTicketQuery = `
        UPDATE tickets 
        SET sold_count = sold_count + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await connection.execute(updateTicketQuery, [quantity, ticketId]);

      // Return booking with attendee info
      const booking = await Booking.findByBookingId(bookingId);
      return {
        ...booking,
        attendees: attendeeIds
      };
    });
  }

  // Find booking by booking ID
  static async findByBookingId(bookingId) {
    const query = `
      SELECT 
        t.*,
        e.name as event_name,
        e.event_start,
        e.event_end,
        e.location as event_location,
        tk.type_name as ticket_type_name,
        tk.price as ticket_price
      FROM transactions t
      LEFT JOIN events e ON t.event_id = e.id
      LEFT JOIN tickets tk ON t.ticket_id = tk.id
      WHERE t.booking_id = ?
    `;

    const bookings = await executeQuery(query, [bookingId]);
    
    if (bookings.length === 0) return null;

    const booking = new Booking(bookings[0]);
    booking.attendees = await Booking.getAttendees(booking.id);

    return booking;
  }

  // Find booking by transaction ID
  static async findById(transactionId) {
    const query = `
      SELECT 
        t.*,
        e.name as event_name,
        e.event_start,
        e.event_end,
        e.location as event_location,
        tk.type_name as ticket_type_name,
        tk.price as ticket_price
      FROM transactions t
      LEFT JOIN events e ON t.event_id = e.id
      LEFT JOIN tickets tk ON t.ticket_id = tk.id
      WHERE t.id = ?
    `;

    const bookings = await executeQuery(query, [transactionId]);
    
    if (bookings.length === 0) return null;

    const booking = new Booking(bookings[0]);
    booking.attendees = await Booking.getAttendees(booking.id);

    return booking;
  }

  // Get user's bookings
  static async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status = null } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        e.name as event_name,
        e.event_start,
        e.event_end,
        e.location as event_location,
        tk.type_name as ticket_type_name,
        tk.price as ticket_price
      FROM transactions t
      LEFT JOIN events e ON t.event_id = e.id
      LEFT JOIN tickets tk ON t.ticket_id = tk.id
      WHERE t.user_id = ?
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND t.payment_status = ?';
      countQuery += ' AND payment_status = ?';
      params.push(status);
    }

    // Use string interpolation for LIMIT/OFFSET to avoid mysql2 parameter binding issues
    query += ` ORDER BY t.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [bookings, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params)
    ]);

    // Get attendees for each booking
    const bookingObjects = await Promise.all(
      bookings.map(async (bookingData) => {
        const booking = new Booking(bookingData);
        booking.attendees = await Booking.getAttendees(booking.id);
        return booking;
      })
    );

    return {
      bookings: bookingObjects,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  // Get attendees for a booking
  static async getAttendees(transactionId) {
    const query = `
      SELECT * FROM attendees 
      WHERE transaction_id = ? 
      ORDER BY created_at ASC
    `;

    return await executeQuery(query, [transactionId]);
  }

  // Get event attendees (for organizers)
  static async getEventAttendees(eventId, options = {}) {
    const { page = 1, limit = 50, search = null, attended = null } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        a.*,
        t.booking_id,
        t.created_at as booking_date,
        tk.type_name as ticket_type,
        u.username,
        u.email as user_email
      FROM attendees a
      JOIN transactions t ON a.transaction_id = t.id
      JOIN tickets tk ON t.ticket_id = tk.id
      JOIN users u ON t.user_id = u.id
      WHERE t.event_id = ? AND t.payment_status = 'completed'
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM attendees a
      JOIN transactions t ON a.transaction_id = t.id
      WHERE t.event_id = ? AND t.payment_status = 'completed'
    `;

    const params = [eventId];

    if (search) {
      query += ' AND (a.name LIKE ? OR a.email LIKE ?)';
      countQuery += ' AND (a.name LIKE ? OR a.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (attended !== null) {
      query += ' AND a.has_attended = ?';
      countQuery += ' AND a.has_attended = ?';
      params.push(attended ? 1 : 0);
    }

    // Use string interpolation for LIMIT/OFFSET to avoid mysql2 parameter binding issues
    query += ` ORDER BY a.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [attendees, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params)
    ]);

    return {
      attendees,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  // Check-in attendee
  static async checkIn(qrCode) {
    // Find attendee by QR code
    const findQuery = `
      SELECT 
        a.*,
        t.event_id,
        e.name as event_name,
        e.event_start,
        e.event_end
      FROM attendees a
      JOIN transactions t ON a.transaction_id = t.id
      JOIN events e ON t.event_id = e.id
      WHERE a.qr_code = ? AND t.payment_status = 'completed'
    `;

    const attendees = await executeQuery(findQuery, [qrCode]);

    if (attendees.length === 0) {
      throw new Error('Invalid QR code or booking not found');
    }

    const attendee = attendees[0];

    // Check if already checked in
    if (attendee.has_attended) {
      return {
        success: false,
        message: 'Already checked in',
        attendee: {
          name: attendee.name,
          checkInTime: attendee.check_in_time,
          eventName: attendee.event_name
        }
      };
    }

    // Check if event is happening today (optional validation)
    const eventDate = new Date(attendee.event_start);
    const today = new Date();
    const daysDiff = Math.abs((eventDate - today) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      throw new Error('Check-in not available - event is not today');
    }

    // Update check-in status
    const updateQuery = `
      UPDATE attendees 
      SET has_attended = 1, check_in_time = CURRENT_TIMESTAMP 
      WHERE qr_code = ?
    `;

    await executeQuery(updateQuery, [qrCode]);

    return {
      success: true,
      message: 'Check-in successful',
      attendee: {
        name: attendee.name,
        checkInTime: new Date().toISOString(),
        eventName: attendee.event_name
      }
    };
  }

  // Cancel booking
  static async cancel(bookingId, userId = null) {
    return await executeTransaction(async (connection) => {
      // Find booking
      let findQuery = 'SELECT * FROM transactions WHERE booking_id = ?';
      const findParams = [bookingId];

      if (userId) {
        findQuery += ' AND user_id = ?';
        findParams.push(userId);
      }

      const [bookings] = await connection.execute(findQuery, findParams);

      if (bookings.length === 0) {
        throw new Error('Booking not found or unauthorized');
      }

      const booking = bookings[0];

      if (booking.payment_status === 'refunded') {
        throw new Error('Booking already cancelled');
      }

      // Check if cancellation is allowed (e.g., not too close to event date)
      const eventQuery = 'SELECT event_start FROM events WHERE id = ?';
      const [events] = await connection.execute(eventQuery, [booking.event_id]);
      
      if (events.length > 0) {
        const eventStart = new Date(events[0].event_start);
        const now = new Date();
        const hoursUntilEvent = (eventStart - now) / (1000 * 60 * 60);

        if (hoursUntilEvent < 24) {
          throw new Error('Cannot cancel booking less than 24 hours before event');
        }
      }

      // Update booking status
      const updateQuery = `
        UPDATE transactions 
        SET payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      await connection.execute(updateQuery, [booking.id]);

      // Update ticket sold count
      const updateTicketQuery = `
        UPDATE tickets 
        SET sold_count = sold_count - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await connection.execute(updateTicketQuery, [booking.quantity, booking.ticket_id]);

      return true;
    });
  }

  // Get booking statistics
  static async getStats(eventId = null, userId = null) {
    let queries = [];
    let params = [];

    if (eventId) {
      // Event-specific stats
      queries = [
        'SELECT COUNT(*) as totalBookings FROM transactions WHERE event_id = ? AND payment_status = "completed"',
        'SELECT SUM(amount) as totalRevenue FROM transactions WHERE event_id = ? AND payment_status = "completed"',
        'SELECT COUNT(*) as totalAttendees FROM attendees a JOIN transactions t ON a.transaction_id = t.id WHERE t.event_id = ? AND t.payment_status = "completed"',
        'SELECT COUNT(*) as checkedIn FROM attendees a JOIN transactions t ON a.transaction_id = t.id WHERE t.event_id = ? AND t.payment_status = "completed" AND a.has_attended = 1'
      ];
      params = [eventId, eventId, eventId, eventId];
    } else if (userId) {
      // User-specific stats
      queries = [
        'SELECT COUNT(*) as totalBookings FROM transactions WHERE user_id = ? AND payment_status = "completed"',
        'SELECT SUM(amount) as totalSpent FROM transactions WHERE user_id = ? AND payment_status = "completed"',
        'SELECT COUNT(DISTINCT event_id) as eventsAttended FROM transactions WHERE user_id = ? AND payment_status = "completed"'
      ];
      params = [userId, userId, userId];
    } else {
      // Global stats
      queries = [
        'SELECT COUNT(*) as totalBookings FROM transactions WHERE payment_status = "completed"',
        'SELECT SUM(amount) as totalRevenue FROM transactions WHERE payment_status = "completed"',
        'SELECT COUNT(*) as totalAttendees FROM attendees a JOIN transactions t ON a.transaction_id = t.id WHERE t.payment_status = "completed"',
        'SELECT COUNT(*) as checkedIn FROM attendees a JOIN transactions t ON a.transaction_id = t.id WHERE t.payment_status = "completed" AND a.has_attended = 1'
      ];
    }

    const results = await Promise.all(
      queries.map((query, index) => executeQuery(query, [params[index]]))
    );

    if (eventId) {
      return {
        totalBookings: results[0][0].totalBookings,
        totalRevenue: results[1][0].totalRevenue || 0,
        totalAttendees: results[2][0].totalAttendees,
        checkedIn: results[3][0].checkedIn
      };
    } else if (userId) {
      return {
        totalBookings: results[0][0].totalBookings,
        totalSpent: results[1][0].totalSpent || 0,
        eventsAttended: results[2][0].eventsAttended
      };
    } else {
      return {
        totalBookings: results[0][0].totalBookings,
        totalRevenue: results[1][0].totalRevenue || 0,
        totalAttendees: results[2][0].totalAttendees,
        checkedIn: results[3][0].checkedIn
      };
    }
  }
}

module.exports = Booking;
