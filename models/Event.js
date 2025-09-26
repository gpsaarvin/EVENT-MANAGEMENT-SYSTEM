import mongoose from 'mongoose';

// Define event schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [100, 'Event title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please provide an event location'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date'],
  },
  startTime: {
    type: String,
    required: [true, 'Please provide a start time'],
  },
  endTime: {
    type: String,
    required: [true, 'Please provide an end time'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide event capacity'],
    min: [1, 'Capacity must be at least 1'],
  },
  registeredCount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Please specify event category'],
    enum: ['general', 'academic', 'social', 'cultural', 'sports', 'workshop', 'seminar', 'other'],
    default: 'general',
  },
  organizer: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Event model if it doesn't exist
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;