const prisma = require('../config/db');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
const createEvent = async (req, res) => {
  const {
    title, description, rules, categoryName,
    date, time, venue, maxSeats, poster,
    contactName, contactPhone
  } = req.body;

  try {
    // Find or create category
    let category = await prisma.category.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName }
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        rules,
        categoryId: category.id,
        date: new Date(date),
        time,
        venue,
        maxSeats: parseInt(maxSeats),
        poster,
        organizerId: req.user.id,
        contactName,
        contactPhone
      },
      include: { category: true }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        organizer: {
          select: { name: true, email: true }
        },
        _count: {
          select: { registrations: true }
        },
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
const updateEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : event.date,
        maxSeats: req.body.maxSeats ? parseInt(req.body.maxSeats) : event.maxSeats
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Not authorized to delete this event' });
    }

    await prisma.event.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check seat availability
    if (event._count.registrations >= event.maxSeats) {
      return res.status(400).json({ message: 'Event is housefull!' });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: { eventId, userId }
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        status: 'CONFIRMED' // Default for now
      }
    });

    res.status(201).json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while registering' });
  }
};

// @desc    Get registration details by its ID
// @route   GET /api/events/registrations/:id
// @access  Private
const getRegistrationById = async (req, res) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
      include: {
        event: {
          include: { category: true }
        },
        user: {
          select: { name: true, srn: true, department: true }
        }
      }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Security: Check if user owns registration or is admin
    if (registration.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Not authorized to view this ticket' });
    }

    res.json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching registration' });
  }
};

// @desc    Get all events created by the logged-in organizer
// @route   GET /api/events/organizer
// @access  Private (Organizer/Admin)
const getOrganizerEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.id },
      include: {
        category: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching organizer events' });
  }
};

// @desc    Update registration status (Attendance)
// @route   PATCH /api/events/registrations/:id/status
// @access  Private (Organizer/Admin)
const updateRegistrationStatus = async (req, res) => {
  const { status } = req.body; // e.g., 'ATTENDED', 'CANCELLED'

  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
      include: { event: true }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user is the organizer of the event
    if (registration.event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Not authorized to manage this event' });
    }

    const updated = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating status' });
  }
};

// @desc    Create an event update (Announcement)
// @route   POST /api/events/:id/updates
// @access  Private (Organizer)
const createEventUpdate = async (req, res) => {
  const { message } = req.body;

  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const update = await prisma.update.create({
      data: {
        eventId: req.params.id,
        message
      }
    });

    res.status(201).json(update);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating update' });
  }
};

// @desc    Get participants for an event
// @route   GET /api/events/:id/participants
// @access  Private (Organizer/Admin)
const getEventParticipants = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const participants = await prisma.registration.findMany({
      where: { eventId: req.params.id },
      include: {
        user: {
          select: { name: true, email: true, srn: true, department: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(participants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching participants' });
  }
};

// @desc    Get trending events
// @route   GET /api/events/trending
// @access  Public
const getTrendingEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: {
        registrations: {
          _count: 'desc'
        }
      },
      take: 6
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching trending events' });
  }
};

// @desc    Get personalized recommendations
// @route   GET /api/events/recommendations
// @access  Private
const getPersonalizedRecommendations = async (req, res) => {
  try {
    // If user is not logged in or doesn't have an ID, return latest events
    if (!req.user || !req.user.id) {
      const latest = await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          date: { gte: new Date() }
        },
        include: {
          category: true,
          _count: { select: { registrations: true } }
        },
        take: 6,
        orderBy: { createdAt: 'desc' }
      });
      return res.json(latest);
    }

    // 1. Get user's past registration categories
    const userRegs = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          select: { categoryId: true }
        }
      }
    });

    const categoryIds = [...new Set(userRegs.map(r => r.event.categoryId))];

    // 2. Find events in those categories (that user hasn't registered for)
    const registeredEventIds = userRegs.map(r => r.eventId);

    const recommendations = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: registeredEventIds },
        categoryId: categoryIds.length > 0 ? { in: categoryIds } : undefined,
        date: { gte: new Date() }
      },
      include: {
        category: true,
        _count: { select: { registrations: true } }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    // If no recommendations, return latest events
    if (recommendations.length === 0) {
      const latest = await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          id: { notIn: registeredEventIds },
          date: { gte: new Date() }
        },
        include: {
          category: true,
          _count: { select: { registrations: true } }
        },
        take: 6,
        orderBy: { createdAt: 'desc' }
      });
      return res.json(latest);
    }

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching recommendations' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getRegistrationById,
  getOrganizerEvents,
  updateRegistrationStatus,
  createEventUpdate,
  getEventParticipants,
  getTrendingEvents,
  getPersonalizedRecommendations
};
