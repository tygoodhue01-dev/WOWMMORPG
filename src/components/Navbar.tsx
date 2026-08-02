import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const links = [
    { to: '/', label: 'Home' },
    { to: '/realms', label: 'Realms' },
    { to: '/news', label: 'News' },
    { to: '/leaderboards', label: 'Leaderboards' },
    { to: '/armory', label: 'Armory' },
    { to: '/items', label: 'Items' },
    { to: '/guilds', label: 'Guilds' },
    { to: '/connect', label: 'How to Connect' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/items') return location.pathname.startsWith('/items');
    if (path === '/armory') return location.pathname.startsWith('/armory');
    if (path === '/guilds') return location.pathname.startsWith('/guilds');
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    (async () => {
      if (user) {
        console.log('Checking admin status for user:', user.email);
        const adminCheck = await isAdmin();
        console.log('Admin check result:', adminCheck);
        setIsAuthorized(adminCheck);
      } else {
        console.log('No user logged in');
        setIsAuthorized(false);
      }
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header style={{ 
      padding: '0 20px', 
      borderBottom: '1px solid #d4af37', 
      backgroundColor: '#0c0c0d',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <nav style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            color: '#d4af37', 
            fontSize: '20px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🛡️</span>
          <span>Rune Haven</span>
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                color: isActive(link.to) ? '#d4af37' : '#a0a0a0',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: isActive(link.to) ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                transition: 'all 0.3s'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {user ? (
            <>
              {isAuthorized && (
                <Link
                  to="/admin"
                  style={{
                    textDecoration: 'none',
                    color: '#d4af37',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #d4af37',
                    borderRadius: '4px'
                  }}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/account"
                style={{
                  textDecoration: 'none',
                  color: '#d4af37',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #d4af37',
                  borderRadius: '4px'
                }}
              >
                My Account
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#d0d0d0',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: '#d0d0d0',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  color: '#0f0f10',
                  backgroundColor: '#d4af37',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}