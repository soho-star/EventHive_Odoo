const { executeQuery } = require('../config/database');

class Event {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.eventStart = data.event_start;
    this.eventEnd = data.event_end;
    this.registrationStart = data.registration_start;
    this.registrationEnd = data.registration_end;
    this.location = data.location;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.posterUrl = data.poster_url;
    this.additionalImages = data.additional_images ? JSON.parse(data.additional_images) : [];
    this.organizerId = data.organizer_id;
    this.isPublished = data.is_published;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    // Additional fields that might be joined
    this.organizer = data.organizer_username ? {
      id: data.organizer_id,
      username: data.organizer_username,
      email: data.organizer_email
    } : null;
    
    this.ticketTypes = [];
    this.stats = data.stats || {};
  }

  // Create a new event
  static async create(eventData, organizerId) {
    const {
      name,
      description,
      category,
      eventStart,
      eventEnd,
      registrationStart,
      registrationEnd,
      location,
      latitude,
      longitude,
      ticketTypes
    } = eventData;

    try {
      // Start transaction
      await executeQuery('START TRANSACTION');

      // Insert event
      const eventQuery = `
        INSERT INTO events (
          name, description, category, event_start, event_end,
          registration_start, registration_end, location, latitude, longitude, organizer_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const eventResult = await executeQuery(eventQuery, [
        name, description, category, eventStart, eventEnd,
        registrationStart, registrationEnd, location, latitude, longitude, organizerId
      ]);

      const eventId = eventResult.insertId;

      // Insert ticket types
      for (const ticket of ticketTypes) {
        const ticketQuery = `
          INSERT INTO tickets (
            event_id, type_name, price, max_per_user, max_total, sale_start, sale_end
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await executeQuery(ticketQuery, [
          eventId,
          ticket.typeName,
          ticket.price || 0,
          ticket.maxPerUser || 1,
          ticket.maxTotal,
          ticket.saleStart || eventData.registrationStart,
          ticket.saleEnd || eventData.registrationEnd
        ]);
      }

      // Commit transaction
      await executeQuery('COMMIT');

      return await Event.findById(eventId);
    } catch (error) {
      await executeQuery('ROLLBACK');
      throw error;
    }
  }

  // Find event by ID with related data
  static async findById(id, includeTickets = true) {
    const query = `
      SELECT 
        e.*,
        u.username as organizer_username,
        u.email as organizer_email
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `;

    const events = await executeQuery(query, [id]);
    
    if (events.length === 0) return null;

    const event = new Event(events[0]);

    if (includeTickets) {
      event.ticketTypes = await Event.getTicketTypes(id);
    }

    return event;
  }

  // Get all events with filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 12,
      category = null,
      location = null,
      search = null,
      dateFrom = null,
      dateTo = null,
      latitude = null,
      longitude = null,
      radius = 50,
      organizerId = null,
      isPublished = true
    } = options;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Base query
    let query = `
      SELECT 
        e.*,
        u.username as organizer_username,
        u.email as organizer_email
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM events e';

    // Add conditions
    if (isPublished !== null) {
      conditions.push('e.is_published = ?');
      params.push(isPublished ? 1 : 0);
    }

    if (category) {
      conditions.push('e.category = ?');
      params.push(category);
    }

    if (location) {
      conditions.push('e.location LIKE ?');
      params.push(`%${location}%`);
    }

    if (search) {
      conditions.push('(e.name LIKE ? OR e.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (dateFrom) {
      conditions.push('e.event_start >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('e.event_start <= ?');
      params.push(dateTo);
    }

    if (organizerId) {
      conditions.push('e.organizer_id = ?');
      params.push(organizerId);
    }

    // Location-based search
    if (latitude && longitude) {
      conditions.push(`
        (6371 * acos(cos(radians(?)) * cos(radians(e.latitude)) * 
        cos(radians(e.longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(e.latitude)))) <= ?
      `);
      params.push(latitude, longitude, latitude, radius);
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Use string interpolation for LIMIT/OFFSET to avoid mysql2 parameter binding issues
    query += ` ORDER BY e.event_start ASC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    // Execute queries
    const [events, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params)
    ]);

    // Convert to Event objects and get ticket types
    const eventObjects = await Promise.all(
      events.map(async (eventData) => {
        const event = new Event(eventData);
        event.ticketTypes = await Event.getTicketTypes(event.id);
        return event;
      })
    );

    return {
      events: eventObjects,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  // Get ticket types for an event
  static async getTicketTypes(eventId) {
    const query = `
      SELECT 
        t.*,
        (t.max_total - t.sold_count) as available
      FROM tickets t
      WHERE t.event_id = ? AND t.is_active = 1
      ORDER BY t.price ASC
    `;

    return await executeQuery(query, [eventId]);
  }

  // Update event
  static async updateById(id, updateData, organizerId = null) {
    const allowedFields = [
      'name', 'description', 'category', 'event_start', 'event_end',
      'registration_start', 'registration_end', 'location', 'latitude',
      'longitude', 'poster_url', 'additional_images', 'is_published'
    ];

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      const dbKey = key === 'eventStart' ? 'event_start' :
                   key === 'eventEnd' ? 'event_end' :
                   key === 'registrationStart' ? 'registration_start' :
                   key === 'registrationEnd' ? 'registration_end' :
                   key === 'posterUrl' ? 'poster_url' :
                   key === 'additionalImages' ? 'additional_images' :
                   key === 'isPublished' ? 'is_published' : key;

      if (allowedFields.includes(dbKey)) {
        updates.push(`${dbKey} = ?`);
        values.push(dbKey === 'additional_images' ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    let query = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;
    
    // If organizerId is provided, ensure only the organizer can update
    if (organizerId) {
      query += ' AND organizer_id = ?';
      values.push(organizerId);
    }

    const result = await executeQuery(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('Event not found or unauthorized');
    }

    return await Event.findById(id);
  }

  // Delete event
  static async deleteById(id, organizerId = null) {
    let query = 'DELETE FROM events WHERE id = ?';
    const params = [id];

    if (organizerId) {
      query += ' AND organizer_id = ?';
      params.push(organizerId);
    }

    const result = await executeQuery(query, params);
    return result.affectedRows > 0;
  }

  // Get event analytics
  static async getAnalytics(eventId, organizerId = null) {
    // Verify organizer access
    if (organizerId) {
      const event = await Event.findById(eventId, false);
      if (!event || event.organizerId !== organizerId) {
        throw new Error('Event not found or unauthorized');
      }
    }

    const queries = [
      // Overview stats
      `SELECT 
        COUNT(DISTINCT t.id) as totalTicketsSold,
        SUM(tr.amount) as totalRevenue,
        COUNT(DISTINCT a.id) as totalAttendees,
        COUNT(CASE WHEN a.has_attended = 1 THEN 1 END) as checkedInCount
      FROM transactions tr
      LEFT JOIN attendees a ON tr.id = a.transaction_id
      LEFT JOIN tickets t ON tr.ticket_id = t.id
      WHERE tr.event_id = ? AND tr.payment_status = 'completed'`,

      // Ticket breakdown
      `SELECT 
        t.type_name as typeName,
        COUNT(tr.id) as sold,
        SUM(tr.amount) as revenue,
        (t.max_total - t.sold_count) as available
      FROM tickets t
      LEFT JOIN transactions tr ON t.id = tr.ticket_id AND tr.payment_status = 'completed'
      WHERE t.event_id = ?
      GROUP BY t.id`,

      // Demographics
      `SELECT 
        a.gender,
        COUNT(*) as count
      FROM attendees a
      JOIN transactions tr ON a.transaction_id = tr.id
      WHERE tr.event_id = ? AND tr.payment_status = 'completed' AND a.gender IS NOT NULL
      GROUP BY a.gender`,

      // Sales over time
      `SELECT 
        DATE(tr.created_at) as date,
        COUNT(*) as tickets,
        SUM(tr.amount) as revenue
      FROM transactions tr
      WHERE tr.event_id = ? AND tr.payment_status = 'completed'
      GROUP BY DATE(tr.created_at)
      ORDER BY date ASC`
    ];

    const [overview, ticketBreakdown, demographics, salesOverTime] = await Promise.all(
      queries.map(query => executeQuery(query, [eventId]))
    );

    return {
      overview: overview[0] || {
        totalTicketsSold: 0,
        totalRevenue: 0,
        totalAttendees: 0,
        checkedInCount: 0
      },
      ticketBreakdown: ticketBreakdown || [],
      demographics: {
        gender: demographics.reduce((acc, item) => {
          acc[item.gender] = item.count;
          return acc;
        }, {})
      },
      salesOverTime: salesOverTime || []
    };
  }

  // Get nearby events
  static async findNearby(latitude, longitude, radius = 50, limit = 10) {
    const query = `
      SELECT 
        e.*,
        u.username as organizer_username,
        u.email as organizer_email,
        (6371 * acos(cos(radians(?)) * cos(radians(e.latitude)) * 
        cos(radians(e.longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(e.latitude)))) AS distance
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.is_published = ? 
        AND e.event_start > NOW()
        AND e.latitude IS NOT NULL 
        AND e.longitude IS NOT NULL
      HAVING distance <= ?
      ORDER BY distance ASC, e.event_start ASC
      LIMIT ?
    `;

    const events = await executeQuery(query.replace('LIMIT ?', `LIMIT ${parseInt(limit)}`), [latitude, longitude, latitude, 1, radius]);
    
    return await Promise.all(
      events.map(async (eventData) => {
        const event = new Event(eventData);
        event.ticketTypes = await Event.getTicketTypes(event.id);
        return event;
      })
    );
  }

  // Get featured events
  static async getFeatured(limit = 6) {
    const query = `
      SELECT 
        e.*,
        u.username as organizer_username,
        u.email as organizer_email,
        COUNT(tr.id) as booking_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN transactions tr ON e.id = tr.event_id AND tr.payment_status = 'completed'
      WHERE e.is_published = ? AND e.event_start > NOW()
      GROUP BY e.id
      ORDER BY booking_count DESC, e.created_at DESC
      LIMIT ?
    `;

    const events = await executeQuery(query.replace('LIMIT ?', `LIMIT ${parseInt(limit)}`), [1]);
    
    return await Promise.all(
      events.map(async (eventData) => {
        const event = new Event(eventData);
        event.ticketTypes = await Event.getTicketTypes(event.id);
        return event;
      })
    );
  }

  // Get events by category
  static async findByCategory(category, options = {}) {
    return await Event.findAll({ ...options, category });
  }

  // Search events
  static async search(searchTerm, options = {}) {
    return await Event.findAll({ ...options, search: searchTerm });
  }

  // Get event statistics
  static async getStats() {
    const queries = [
      'SELECT COUNT(*) as totalEvents FROM events',
      'SELECT COUNT(*) as publishedEvents FROM events WHERE is_published = 1',
      'SELECT COUNT(*) as upcomingEvents FROM events WHERE event_start > NOW() AND is_published = 1',
      'SELECT category, COUNT(*) as count FROM events WHERE is_published = 1 GROUP BY category'
    ];

    const results = await Promise.all(queries.map(query => executeQuery(query)));

    return {
      totalEvents: results[0][0].totalEvents,
      publishedEvents: results[1][0].publishedEvents,
      upcomingEvents: results[2][0].upcomingEvents,
      categoryCounts: results[3]
    };
  }
}

module.exports = Event;
