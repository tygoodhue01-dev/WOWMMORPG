import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Realm } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export default function AdminRealms() {
  const [realms, setRealms] = useState<Realm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRealm, setEditingRealm] = useState<Realm | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PvP',
    expansion: 'WotLK 3.3.5a',
    host: '',
    port: 8085,
    online: true,
    players_online: 0,
    max_players: 3000,
    uptime: '0d 0h 0m',
    description: '',
    display_order: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const adminCheck = await isAdmin();
      setIsAuthorized(adminCheck);
      
      if (adminCheck) {
        const { data, error } = await supabase.from('realms').select('*').order('display_order');
        if (error) console.error('Error fetching realms:', error);
        else setRealms(data ?? []);
      }
      
      setLoading(false);
    })();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('realms').insert({
        id: crypto.randomUUID(),
        ...formData,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setFormData({
        name: '',
        type: 'PvP',
        expansion: 'WotLK 3.3.5a',
        host: '',
        port: 8085,
        online: true,
        players_online: 0,
        max_players: 3000,
        uptime: '0d 0h 0m',
        description: '',
        display_order: 0
      });
      setShowForm(false);
      
      const { data } = await supabase.from('realms').select('*').order('display_order');
      setRealms(data ?? []);
    } catch (error) {
      console.error('Error creating realm:', error);
    }
  };

  const handleEdit = (realm: Realm) => {
    setEditingRealm(realm);
    setFormData({
      name: realm.name,
      type: realm.type,
      expansion: realm.expansion,
      host: realm.host,
      port: realm.port,
      online: realm.online,
      players_online: realm.players_online,
      max_players: realm.max_players,
      uptime: realm.uptime,
      description: realm.description,
      display_order: realm.display_order
    });
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRealm) return;

    try {
      console.log('Updating realm with data:', formData);
      console.log('Host being set:', formData.host);
      
      const { error } = await supabase
        .from('realms')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRealm.id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Realm updated successfully');
      setEditingRealm(null);
      setShowForm(false);
      
      const { data } = await supabase.from('realms').select('*').order('display_order');
      console.log('Updated realms from database:', data);
      setRealms(data ?? []);
    } catch (error) {
      console.error('Error updating realm:', error);
      alert('Failed to update realm: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this realm?')) return;

    try {
      const { error } = await supabase.from('realms').delete().eq('id', id);
      if (error) throw error;
      
      const { data } = await supabase.from('realms').select('*').order('display_order');
      setRealms(data ?? []);
    } catch (error) {
      console.error('Error deleting realm:', error);
    }
  };

  const handleCancel = () => {
    setEditingRealm(null);
    setShowForm(false);
    setFormData({
      name: '',
      type: 'PvP',
      expansion: 'WotLK 3.3.5a',
      host: '',
      port: 8085,
      online: true,
      players_online: 0,
      max_players: 3000,
      uptime: '0d 0h 0m',
      description: '',
      display_order: 0
    });
  };

  if (loading) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading...</div>;
  if (!isAuthorized) return <div style={{ padding: '40px', color: 'white' }}>Access Denied</div>;

  return (
    <div style={{ padding: '40px 20px', color: 'white', background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>🏰</span> Manage Realms
            </h1>
            <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
              Configure and manage your game realms
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                color: '#0f0f10',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                transition: 'all 0.3s'
              }}
            >
              {showForm ? 'Cancel' : '+ Add Realm'}
            </button>
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '14px 28px',
                background: 'transparent',
                color: '#d4af37',
                border: '1px solid #d4af37',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Back to Admin
            </button>
            <button
              onClick={() => {
                console.log('Current form data:', formData);
                console.log('Current realms:', realms);
                alert('Debug info logged to console. Press F12 to view.');
              }}
              style={{
                padding: '14px 28px',
                background: 'rgba(168, 142, 222, 0.2)',
                color: '#a896de',
                border: '1px solid #a896de',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Debug Info
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={editingRealm ? handleUpdate : handleCreate} style={{
            padding: '40px',
            background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '12px',
            marginBottom: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {editingRealm ? '✏️ Edit Realm' : '🏰 Create New Realm'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0', fontWeight: '500' }}>
                  Realm Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(10, 10, 12, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    transition: 'all 0.3s'
                  }}
                  placeholder="e.g., Azeroth Eternal"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0', fontWeight: '500' }}>
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(10, 10, 12, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px'
                  }}
                >
                  <option value="Normal">Normal</option>
                  <option value="PvP">PvP</option>
                  <option value="RP">RP</option>
                  <option value="RP PvP">RP PvP</option>
                  <option value="PvE">PvE</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0', fontWeight: '500' }}>
                  Expansion
                </label>
                <select
                  value={formData.expansion}
                  onChange={(e) => setFormData({...formData, expansion: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(10, 10, 12, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px'
                  }}
                >
                  <option value="WotLK 3.3.5a">WotLK 3.3.5a</option>
                  <option value="Cataclysm 4.3.4">Cataclysm 4.3.4</option>
                  <option value="Mists of Pandaria 5.4.8">Mists of Pandaria 5.4.8</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0', fontWeight: '500' }}>
                  Host
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({...formData, host: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(10, 10, 12, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    fontFamily: 'monospace'
                  }}
                  placeholder="e.g., realm.wow.com"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0', fontWeight: '500' }}>
                  Port
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(10, 10, 12, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0', fontWeight: '500' }}>
                  Max Players
                </label>
                <input
                  type="number"
                  value={formData.max_players}
                  onChange={(e) => setFormData({...formData, max_players: parseInt(e.target.value)})}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(10, 10, 12, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(10, 10, 12, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    resize: 'vertical'
                  }}
                  placeholder="Brief description of this realm"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
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
                {editingRealm ? 'Update Realm' : 'Create Realm'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  color: '#a0a0a0',
                  border: '1px solid #606060',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Realms Grid */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {realms.map((realm) => (
            <div key={realm.id} style={{
              padding: '32px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Status Bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: realm.online ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                zIndex: 1
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <div>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>🏰</span> {realm.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: realm.online ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: realm.online ? '#4ade80' : '#ef444',
                      border: `1px solid ${realm.online ? '#4ade80' : '#ef444'}40`
                    }}>
                      {realm.online ? '🟢 Online' : '🔴 Offline'}
                    </span>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: 'rgba(212, 175, 55, 0.2)',
                      color: '#d4af37',
                      border: '1px solid #d4af3730'
                    }}>
                      {realm.type}
                    </span>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: 'rgba(168, 142, 222, 0.2)',
                      color: '#a896de',
                      border: '1px solid #a896de30'
                    }}>
                      {realm.expansion}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                padding: '24px', 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div>
                    <span style={{ color: '#606060', fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>PLAYERS</span>
                    <span style={{ color: '#d4af37', fontSize: '24px', fontWeight: 'bold' }}>
                      {realm.players_online.toLocaleString()} / {realm.max_players.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#606060', fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>HOST</span>
                    <span style={{ color: '#a0a0a0', fontSize: '14px', fontFamily: 'monospace' }}>{realm.host}</span>
                  </div>
                  <div>
                    <span style={{ color: '#606060', fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>PORT</span>
                    <span style={{ color: '#a0a0a0', fontSize: '14px', fontFamily: 'monospace' }}>{realm.port}</span>
                  </div>
                  <div>
                    <span style={{ color: '#606060', fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>UPTIME</span>
                    <span style={{ color: '#d4af37', fontSize: '20px', fontWeight: 'bold' }}>{realm.uptime}</span>
                  </div>
                </div>
              </div>

              {realm.description && (
                <p style={{ color: '#a0a0a0', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                  {realm.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#606060' }}>
                <span>Last updated: {new Date(realm.updated_at).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <button
                  onClick={() => handleEdit(realm)}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                    color: '#0f0f10',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2)'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(realm.id)}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}