import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');
    
    let filter = {};
    
    if (eventId) {
      filter.eventId = eventId;
    }
    
    if (userId) {
      filter.userId = userId;
    } else if (session.user.role !== 'admin') {
      // If not admin and no userId specified, return only user's registrations
      filter.userId = session.user.id;
    }
    
    const registrations = await Registration.find(filter)
      .populate('eventId')
      .sort({ registrationDate: -1 });
    
    return NextResponse.json({ registrations }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    
    // Check if event exists
    const event = await Event.findById(data.eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if event is at capacity
    if (event.registeredCount >= event.capacity) {
      // Set status to waitlisted if event is at capacity
      data.status = 'waitlisted';
    } else {
      // Set status to registered
      data.status = 'registered';
      
      // Increment registered count for the event
      await Event.findByIdAndUpdate(
        data.eventId,
        { $inc: { registeredCount: 1 } }
      );
    }
    
    // Set user ID from session
    data.userId = session.user.id;
    
    // Create registration
    const registration = await Registration.create(data);
    
    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}