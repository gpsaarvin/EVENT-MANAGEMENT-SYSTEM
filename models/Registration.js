import mongoose from 'mongoose';

// Define registration schema
const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled', 'waitlisted'],
    default: 'registered',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  additionalInfo: {
    type: Object,
    default: {},
  },
});

// Create the Registration model if it doesn't exist
export const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

export default Registration;