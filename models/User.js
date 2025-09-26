import mongoose from 'mongoose';

// Define user schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'organizer'],
    default: 'student',
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  studentId: {
    type: String,
    trim: true,
  },
  profilePictureUrl: {
    type: String,
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

// Create the User model if it doesn't exist
export const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;