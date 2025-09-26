# Event Management App

A full-fledged event management application built with Next.js, MongoDB, and Firebase authentication. The application allows students to browse and register for club events, and provides administrators with tools to manage events and registrations.

![Event Management App](https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)

## Features

### User Features
- **Authentication**: Google OAuth sign-in with NextAuth.js and Firebase
- **Event Browsing**: View all upcoming events with filtering by category
- **Event Registration**: Register for events, join waitlists, and cancel registrations
- **User Dashboard**: View and manage personal registrations
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Event Management**: Create, edit, and delete events
- **Registration Management**: View and manage registrations for events
- **User Management**: Basic user role assignment (admin, organizer, student)

## Technical Implementation

### Backend
- **Database**: MongoDB with Mongoose schemas
- **Authentication**: Firebase with NextAuth.js
- **API Routes**: RESTful API endpoints for events, registrations, and users
- **Middleware**: Route protection and role-based access control

### Frontend
- **Framework**: Next.js 13+ with App Router
- **UI**: Tailwind CSS for styling
- **State Management**: React hooks and context
- **Form Handling**: React forms with client-side validation

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- MongoDB database (local or Atlas)
- Firebase project with Authentication enabled

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# NextAuth.js
AUTH_SECRET=a_random_string_for_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add Authorized JavaScript origins: `http://localhost:3000` (and your production URL)
8. Add Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (and your production equivalent)
9. Click "Create" and note your Client ID and Client Secret
10. Add these values to your `.env.local` file

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure
```
.
├── app/                     # Next.js App Router directory
│   ├── admin/               # Admin pages
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   ├── events/              # Event pages
│   └── page.js              # Home page
├── components/              # Reusable React components
│   ├── AuthProvider.js      # Authentication context provider
│   ├── Footer.js            # Site footer
│   └── Navbar.js            # Navigation bar
├── lib/                     # Utility functions and configuration
│   ├── auth.js              # NextAuth configuration
│   ├── dbConnect.js         # MongoDB connection utility
│   ├── firebase.js          # Firebase initialization
│   └── mongodb.js           # MongoDB client
├── models/                  # Mongoose schemas
│   ├── Event.js             # Event model
│   ├── Registration.js      # Registration model
│   └── User.js              # User model
├── middleware.js            # Next.js middleware for route protection
├── next.config.mjs          # Next.js configuration
└── package.json             # Project dependencies
```

## Database Models

### Event Model
- `title`: String (required)
- `description`: String (required)
- `location`: String (required)
- `date`: Date (required)
- `startTime`: String (required)
- `endTime`: String (required)
- `capacity`: Number (required)
- `registeredCount`: Number (default: 0)
- `category`: String (enum: categories)
- `organizer`: String
- `imageUrl`: String (optional)
- `isActive`: Boolean (default: true)
- `createdBy`: String (required)
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

### Registration Model
- `eventId`: ObjectId (ref: 'Event', required)
- `userId`: String (required)
- `name`: String
- `email`: String
- `phone`: String (optional)
- `status`: String (enum: 'registered', 'attended', 'cancelled', 'waitlisted')
- `registrationDate`: Date (default: now)
- `additionalInfo`: Object (default: {})

## API Routes

### Events API
- `GET /api/events`: Get all events
- `POST /api/events`: Create a new event (admin only)
- `GET /api/events/:id`: Get a specific event
- `PUT /api/events/:id`: Update a specific event (admin only)
- `DELETE /api/events/:id`: Delete a specific event (admin only)

### Registrations API
- `GET /api/registrations`: Get user's registrations or all registrations (admin)
- `POST /api/registrations`: Create a new registration
- `GET /api/registrations/:id`: Get a specific registration
- `PUT /api/registrations/:id`: Update registration status
- `DELETE /api/registrations/:id`: Cancel/delete registration

## Future Enhancements
1. Email notifications for event registrations and updates
2. QR code generation for event check-ins
3. Social media sharing for events
4. Event analytics and reporting
5. Image upload for event banners
6. Calendar integration (Google, iCal)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
