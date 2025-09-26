import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

// GET specific registration by ID
export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const { id } = params;
    const registration = await Registration.findById(id).populate('eventId');
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // Check if user is admin or the owner of the registration
    if (
      session.user.role !== 'admin' && 
      session.user.id !== registration.userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json({ registration }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update registration (e.g., change status)
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const { id } = params;
    const data = await request.json();
    
    // Find the registration
    const registration = await Registration.findById(id);
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // Only allow admins to update any registration
    // For non-admins, they can only cancel their own registration
    if (session.user.role !== 'admin') {
      if (session.user.id !== registration.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      // Non-admins can only change status to cancelled
      if (data.status && data.status !== 'cancelled') {
        return NextResponse.json({ error: 'You can only cancel your registration' }, { status: 403 });
      }
      
      // Only allow the status field to be updated
      data = { status: 'cancelled' };
    }
    
    // Handle registration status changes that affect event capacity
    if (data.status) {
      // If registration was previously 'registered' and is being cancelled
      if (registration.status === 'registered' && data.status === 'cancelled') {
        // Decrement the event's registeredCount
        await Event.findByIdAndUpdate(
          registration.eventId,
          { $inc: { registeredCount: -1 } }
        );
        
        // Check if there's someone on waitlist to move to registered
        const nextInWaitlist = await Registration.findOne({
          eventId: registration.eventId,
          status: 'waitlisted'
        }).sort({ registrationDate: 1 });
        
        if (nextInWaitlist) {
          await Registration.findByIdAndUpdate(
            nextInWaitlist._id,
            { status: 'registered' }
          );
          
          // Increment event's registeredCount for the waitlisted person
          await Event.findByIdAndUpdate(
            registration.eventId,
            { $inc: { registeredCount: 1 } }
          );
        }
      }
      
      // If admin is changing waitlisted to registered
      if (registration.status === 'waitlisted' && data.status === 'registered') {
        // Check if event has capacity first
        const event = await Event.findById(registration.eventId);
        
        if (event.registeredCount >= event.capacity) {
          return NextResponse.json({ 
            error: 'Cannot change to registered status. Event is at capacity.'
          }, { status: 400 });
        }
        
        // Increment event's registeredCount
        await Event.findByIdAndUpdate(
          registration.eventId,
          { $inc: { registeredCount: 1 } }
        );
      }
    }
    
    // Update the registration
    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ registration: updatedRegistration }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete registration
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const { id } = params;
    
    // Find the registration
    const registration = await Registration.findById(id);
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    // Check if user is admin or the owner of the registration
    if (
      session.user.role !== 'admin' && 
      session.user.id !== registration.userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // If registration was in 'registered' status, update event count
    if (registration.status === 'registered') {
      await Event.findByIdAndUpdate(
        registration.eventId,
        { $inc: { registeredCount: -1 } }
      );
      
      // Move someone from waitlist to registered if available
      const nextInWaitlist = await Registration.findOne({
        eventId: registration.eventId,
        status: 'waitlisted'
      }).sort({ registrationDate: 1 });
      
      if (nextInWaitlist) {
        await Registration.findByIdAndUpdate(
          nextInWaitlist._id,
          { status: 'registered' }
        );
        
        // Increment event's registeredCount for the waitlisted person
        await Event.findByIdAndUpdate(
          registration.eventId,
          { $inc: { registeredCount: 1 } }
        );
      }
    }
    
    // Delete the registration
    await Registration.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Registration deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}