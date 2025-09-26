import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const { id } = params;
    
    // Check if user is admin or accessing own profile
    if (session.user.role !== 'admin' && session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const user = await User.findOne({ uid: id }).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    
    // Check if user is admin or updating own profile
    if (session.user.role !== 'admin' && session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // If not admin, prevent role changes
    if (session.user.role !== 'admin' && data.role) {
      delete data.role;
    }
    
    // Update the user
    const user = await User.findOneAndUpdate(
      { uid: id },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins can delete users
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { id } = params;
    
    const user = await User.findOneAndDelete({ uid: id });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}