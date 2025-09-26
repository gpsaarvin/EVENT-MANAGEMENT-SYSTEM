import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

// GET specific event by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update event
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
    
    // Find the event first
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if user is admin or the creator of the event
    if (
      session.user.role !== 'admin' && 
      session.user.id !== event.createdBy
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Update the event
    data.updatedAt = new Date();
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete event
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const { id } = params;
    
    // Find the event first
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if user is admin or the creator of the event
    if (
      session.user.role !== 'admin' && 
      session.user.id !== event.createdBy
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await Event.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}