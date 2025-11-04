import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const token = session.access_token;
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
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
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          try {
            const token = session.access_token;
            const response = await fetch('/api/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
      }
    );

    return () => subscription.unsubscribe();
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
            👑 ผู้ดูแลระบบ
          </span>
        );
      case 'MODERATOR':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ⭐ ผู้ดูแล
          </span>
        );
      case 'USER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            👤 ผู้ใช้
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
