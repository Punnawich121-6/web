import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../pages/firebase';

type UserRole = 'USER' | 'ADMIN' | 'MODERATOR' | null;

interface UserData {
  role: UserRole;
  displayName?: string;
  email?: string;
}

export default function UserRoleBadge() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const result = await response.json();
            setUserData(result.data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
    );
  }

  if (!userData || !userData.role) {
    return null;
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            👑 Admin
          </span>
        );
      case 'MODERATOR':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ⭐ Moderator
          </span>
        );
      case 'USER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            👤 User
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">
        {userData.displayName || userData.email}
      </span>
      {getRoleBadge(userData.role)}
    </div>
  );
}