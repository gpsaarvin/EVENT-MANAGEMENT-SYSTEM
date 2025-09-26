import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins can list all users
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const users = await User.find({}).select('-password');
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Set default role if not provided
    if (!data.role) {
      data.role = 'student';
    }
    
    const user = await User.create(data);
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    
    return NextResponse.json({ user: userObject }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}