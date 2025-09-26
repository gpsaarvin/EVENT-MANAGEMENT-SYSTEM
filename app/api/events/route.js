import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    
    let filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }
    
    const events = await Event.find(filter).sort({ date: 1 });
    
    return NextResponse.json({ events }, { status: 200 });
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
    
    // Check if user is admin or organizer
    if (session.user.role !== 'admin' && session.user.role !== 'organizer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    data.createdBy = session.user.id;
    
    const event = await Event.create(data);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}