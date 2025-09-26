import { getServerSession } from 'next-auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: FirestoreAdapter(app),
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        const db = getFirestore(app);
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // Create user in Firestore if they don't exist
          await setDoc(userRef, {
            name: user.name,
            email: user.email,
            image: user.image,
            role: 'student', // Default role
            createdAt: new Date().toISOString(),
          });
        }
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Check if the user exists in Firestore to get their role
        const db = getFirestore(app);
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          token.role = userData.role || 'student';
        } else {
          token.role = 'student'; // Default role
        }
        
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export async function getSession() {
  return await getServerSession(authConfig);
}