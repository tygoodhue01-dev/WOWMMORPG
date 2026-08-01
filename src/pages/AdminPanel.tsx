import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, getCurrentUser } from '@/lib/admin';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        console.log('AdminPanel: Checking admin status...');
        const currentUser = await getCurrentUser();
        console.log('AdminPanel: Current user:', currentUser);
        
        if (!currentUser) {
          console.log('AdminPanel: No user found, denying access');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        console.log('AdminPanel: Checking if user is admin...');
        const adminCheck = await isAdmin();
        console.log('AdminPanel: Admin check result:', adminCheck);
        
        setUser(currentUser);
        setIsAuthorized(adminCheck);
      } catch (error) {
        console.error('AdminPanel: Error checking admin status:', error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        color: 'white', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #d4af37', 
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '18px', color: '#a0a0a0' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        color: 'white', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          padding: '48px',
          background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444', marginBottom: '16px' }}>
            Access Denied
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px', marginBottom: '24px' }}>
            You don't have permission to access the admin panel.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
              color: '#0f0f10',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px 20px', 
      color: 'white', 
      background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '48px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                🛡️
              </div>
              <div>
                <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                  Admin Panel
                </h1>
                <p style={{ color: '#a0a0a0', fontSize: '18px' }}>
                  Manage your Rune Haven server
                </p>
              </div>
            </div>
            
            <div style={{ 
              padding: '16px 24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                👤
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#606060' }}>Logged in as</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4af37' }}>
                  {user?.email} <span style={{ 
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: 'rgba(212, 175, 55, 0.2)',
                    color: '#d4af37',
                    marginLeft: '8px'
                  }}>{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <AdminCard
            title="Realms"
            description="Manage server realms and their configurations"
            icon="🏰"
            link="/admin/realms"
            color="#d4af37"
            stats="1 Realm"
            navigate={navigate}
          />
          <AdminCard
            title="News"
            description="Create and manage news articles and announcements"
            icon="📰"
            link="/admin/news"
            color="#4ade80"
            stats="News Management"
            navigate={navigate}
          />
          <AdminCard
            title="Users"
            description="Manage user accounts and permissions"
            icon="👥"
            link="/admin/users"
            color="#a896de"
            stats="User Management"
            navigate={navigate}
          />
          <AdminCard
            title="Server Info"
            description="Update server statistics and information"
            icon="📊"
            link="/admin/server-info"
            color="#f97316"
            stats="Server Stats"
            navigate={navigate}
          />
          <AdminCard
            title="Server Manager"
            description="Control game server, view logs, and manage processes"
            icon="🖥️"
            link="/admin/server-manager"
            color="#06b6d4"
            stats="Process Control"
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}

function AdminCard({ title, description, icon, link, color, stats, navigate }: { 
  title: string; 
  description: string; 
  icon: string; 
  link: string; 
  color: string;
  stats: string;
  navigate: any;
}) {
  return (
    <div
      onClick={() => navigate(link)}
      style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
        border: `1px solid ${color}30`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}40`;
        e.currentTarget.style.borderColor = `${color}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${color}30`;
      }}
    >
      <div style={{ 
        position: 'absolute',
        top: '-20%',
        right: '-20%',
        width: '150px',
        height: '150px',
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        borderRadius: '50%'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          fontSize: '56px', 
          marginBottom: '20px',
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: color, marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          {description}
        </p>
        <div style={{ 
          padding: '8px 16px',
          background: `${color}20`,
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          color: color,
          display: 'inline-block'
        }}>
          {stats}
        </div>
      </div>
    </div>
  );
}