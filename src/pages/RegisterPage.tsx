import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [gameUsername, setGameUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameAccountCreated, setGameAccountCreated] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setGameAccountCreated(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!gameUsername || gameUsername.length < 3) {
      setError('Game username must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Supabase account
      const { data: userData, error: supabaseError } = await signUp(email, password);
      
      if (supabaseError) {
        setError(supabaseError);
        setLoading(false);
        return;
      }

      // Step 2: Create game account via backend
      try {
        // Use the current domain for API calls
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/accounts/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.user?.id,
            accountName: gameUsername,
            password: password,
            expansion: 'WotLK 3.3.5a'
          })
        });

        const gameAccountResult = await response.json();

        if (!response.ok || !gameAccountResult.success) {
          console.error('Game account creation failed:', gameAccountResult);
          setError(`Web account created, but game account failed: ${gameAccountResult.error || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        setGameAccountCreated(true);
        setSuccess(true);
        
        // Redirect after 3 seconds to show success message
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (gameError) {
        console.error('Game account creation error:', gameError);
        setError('Web account created, but game account creation failed. Please contact admin.');
        setLoading(false);
        return;
      }

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
            Create Account
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
            Join thousands of players in Rune Haven
          </p>
        </div>

        {success && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'rgba(74, 222, 128, 0.2)', 
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#4ade80'
          }}>
            {gameAccountCreated ? (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🎉 Account created successfully!</div>
                <div>✅ Web account: {email}</div>
                <div>✅ Game account: {gameUsername}</div>
                <div style={{ marginTop: '8px', color: '#a0a0a0' }}>Redirecting to login...</div>
              </>
            ) : (
              'Account created successfully! Redirecting to login...'
            )}
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'rgba(239, 68, 68, 0.2)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(30, 30, 33, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                opacity: loading ? 0.5 : 1
              }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
              Game Username
            </label>
            <input
              type="text"
              value={gameUsername}
              onChange={(e) => setGameUsername(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(30, 30, 33, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                opacity: loading ? 0.5 : 1
              }}
              placeholder="YourGameName"
            />
            <div style={{ fontSize: '12px', color: '#606060', marginTop: '4px' }}>
              This will be your in-game character name
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(30, 30, 33, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                opacity: loading ? 0.5 : 1
              }}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(30, 30, 33, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                opacity: loading ? 0.5 : 1
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#d4af37',
              color: '#0f0f10',
              border: 'none',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#a0a0a0' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#d4af37', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

        <div style={{ 
          marginTop: '32px', 
          padding: '16px', 
          backgroundColor: 'rgba(212, 175, 55, 0.1)', 
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#a0a0a0'
        }}>
          <strong style={{ color: '#d4af37' }}>Note:</strong> Registration creates both your web account and game account. You can use the same password for both. If registration fails, make sure email authentication is enabled in your Supabase project settings under Authentication → Providers.
        </div>
      </div>
    </div>
  );
}