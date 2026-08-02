import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function GuildsPage() {
  const [view, setView] = useState('list'); // 'list' or 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [guildData, setGuildData] = useState(null);
  const [filters, setFilters] = useState({ minMembers: 1, minLevel: 1 });
  const [leaderboardType, setLeaderboardType] = useState('members');
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  const { guildId } = useParams();

  const raceIcons = {
    1: '👤', // Human
    2: '🧝', // Orc
    3: '🧝', // Dwarf
    4: '🧝', // Night Elf
    5: '🧝', // Undead
    6: '🧝', // Tauren
    7: '🧝', // Gnome
    8: '🧝', // Troll
    10: '🧝', // Blood Elf
    11: '🧝' // Draenei
  };

  const classIcons = {
    1: '⚔️', // Warrior
    2: '🛡️', // Paladin
    3: '🏹', // Hunter
    4: '🗡️', // Rogue
    5: '🔮', // Priest
    6: '❄️', // Death Knight
    7: '🌿', // Shaman
    8: '🔥', // Mage
    9: '🗯️', // Warlock
    11: '🐻' // Druid
  };

  useEffect(() => {
    // Load summary stats
    fetchSummary();
    fetchLeaderboard();
    
    // If guildId is in URL, load that guild
    if (guildId) {
      loadGuildProfile(guildId);
    } else {
      searchGuilds();
    }
  }, [guildId]);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/guilds/summary');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/guilds/leaderboard?type=${leaderboardType}`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const searchGuilds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        query: searchQuery,
        minMembers: filters.minMembers,
        minLevel: filters.minLevel
      });
      
      const response = await fetch(`/api/guilds/list?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setGuilds(data.guilds);
      } else {
        setGuilds([]);
      }
    } catch (error) {
      console.error('Failed to search guilds:', error);
      setGuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGuildProfile = async (guildId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guilds/guild/${guildId}`);
      const data = await response.json();
      
      if (data.success) {
        setGuildData(data.guild);
        setView('profile');
        navigate(`/guilds/${guildId}`);
      } else {
        alert('Failed to load guild profile');
      }
    } catch (error) {
      console.error('Failed to load guild profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchGuilds();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white', background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => { setView('list'); navigate('/guilds'); }}
            style={{
              padding: '8px 16px',
              background: 'rgba(212, 175, 55, 0.1)',
              color: '#d4af37',
              border: '1px solid #d4af37',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← Back to Guild List
          </button>
          
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
            👥 Guild System
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
            Explore guilds and find your community on Rune Haven
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '32px' 
          }}>
            <div style={{ 
              padding: '24px', 
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)', 
              border: '1px solid rgba(212, 175, 55, 0.2)', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37' }}>
                {summary.totalGuilds}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Total Guilds
              </div>
            </div>
            
            <div style={{ 
              padding: '24px', 
              background: 'linear-gradient(135deg, rgba(168, 142, 222, 0.1) 0%, rgba(168, 142, 222, 0.05) 100%)', 
              border: '1px solid rgba(168, 142, 222, 0.2)', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#a896de' }}>
                {summary.totalMembers}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Total Members
              </div>
            </div>
            
            <div style={{ 
              padding: '24px', 
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%)', 
              border: '1px solid rgba(74, 222, 128, 0.2)', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4ade80' }}>
                {summary.averageSize.toFixed(1)}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Average Size
              </div>
            </div>
          </div>
        )}

        {view === 'list' && (
          <>
            {/* Search Form */}
            <div style={{ 
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <form onSubmit={handleSearch}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Guild Name
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Minimum Members
                    </label>
                    <input
                      type="number"
                      value={filters.minMembers}
                      onChange={(e) => setFilters({...filters, minMembers: e.target.value})}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Minimum Average Level
                    </label>
                    <input
                      type="number"
                      value={filters.minLevel}
                      onChange={(e) => setFilters({...filters, minLevel: e.target.value})}
                      min="1"
                      max="80"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '16px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                    color: '#0f0f10',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Searching...' : '🔍 Search Guilds'}
                </button>
              </form>
            </div>

            {/* Guild Leaderboard */}
            <div style={{ 
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                🏆 Top Guilds
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setLeaderboardType('members'); fetchLeaderboard(); }}
                  style={{
                    padding: '8px 16px',
                    background: leaderboardType === 'members' 
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                      : 'rgba(30, 30, 33, 0.8)',
                    color: leaderboardType === 'members' ? '#0f0f10' : '#d4af37',
                    border: '1px solid #d4af37',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Most Members
                </button>
                <button
                  onClick={() => { setLeaderboardType('average_level'); fetchLeaderboard(); }}
                  style={{
                    padding: '8px 16px',
                    background: leaderboardType === 'average_level' 
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                      : 'rgba(30, 30, 33, 0.8)',
                    color: leaderboardType === 'average_level' ? '#0f0f10' : '#d4af37',
                    border: '1px solid #d4af37',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Highest Average Level
                </button>
                <button
                  onClick={() => { setLeaderboardType('playtime'); fetchLeaderboard(); }}
                  style={{
                    padding: '8px 16px',
                    background: leaderboardType === 'playtime' 
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                      : 'rgba(30, 30, 33, 0.8)',
                    color: leaderboardType === 'playtime' ? '#0f0f10' : '#d4af37',
                    border: '1px solid #d4af37',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Most Playtime
                </button>
              </div>
              
              {leaderboard.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {leaderboard.map((guild, index) => (
                    <div 
                      key={guild.guildId}
                      onClick={() => loadGuildProfile(guild.guildId)}
                      style={{ 
                        padding: '16px', 
                        background: 'rgba(212, 175, 55, 0.05)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(212, 175, 55, 0.1)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                        {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'} {guild.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                        {guild.memberCount} members • Avg Level: {guild.averageLevel}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Results */}
            {guilds.length > 0 && (
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)', 
                border: '1px solid rgba(212, 175, 55, 0.2)', 
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    background: 'rgba(212, 175, 55, 0.1)', 
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)' 
                  }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Members</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Average Level</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {guilds.map((guild) => (
                    <tr 
                      key={guild.guildId}
                      onClick={() => loadGuildProfile(guild.guildId)}
                      style={{ 
                        borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                        cursor: 'pointer',
                        background: 'rgba(212, 175, 55, 0.05)'
                      }}
                    >
                      <td style={{ padding: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                        👥 {guild.name}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {guild.memberCount}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {guild.averageLevel}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {formatDate(guild.createdDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {guilds.length === 0 && !loading && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#a0a0a0',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              No guilds found. Try different search criteria.
            </div>
          )}
        </>
        )}

        {view === 'profile' && guildData && (
          <>
            {/* Guild Header */}
            <div style={{ 
              marginBottom: '32px',
              padding: '32px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  👥
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                    {guildData.basic.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', color: '#a0a0a0', fontSize: '16px' }}>
                    <span>Leader: {guildData.basic.leader?.name || 'Unknown'}</span>
                    <span>Founded: {formatDate(guildData.basic.createdDate)}</span>
                  </div>
                  {guildData.basic.motd && (
                    <div style={{ marginTop: '8px', color: '#a896de', fontStyle: 'italic' }}>
                      "{guildData.basic.motd}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Guild Statistics */}
            <div style={{ 
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                📊 Guild Statistics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(212, 175, 55, 0.05)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
                    {guildData.statistics.totalMembers}
                  </div>
                  <div style={{ color: '#a0a0a0', fontSize: '12px', marginTop: '4px' }}>
                    Total Members
                  </div>
                </div>
                
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(212, 175, 55, 0.05)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
                    {guildData.statistics.averageLevel}
                  </div>
                  <div style={{ color: '#a0a0a0', fontSize: '12px', marginTop: '4px' }}>
                    Average Level
                  </div>
                </div>
                
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(212, 175, 55, 0.05)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
                    {guildData.statistics.maxLevel}
                  </div>
                  <div style={{ color: '#a0a0a0', fontSize: '12px', marginTop: '4px' }}>
                    Max Level
                  </div>
                </div>
                
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(212, 175, 55, 0.05)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
                    {guildData.statistics.totalPlaytime}h
                  </div>
                  <div style={{ color: '#a0a0a0', fontSize: '12px', marginTop: '4px' }}>
                    Total Playtime
                  </div>
                </div>
              </div>
            </div>

            {/* Guild Info */}
            {guildData.basic.info && (
              <div style={{ 
                marginBottom: '32px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px'
              }}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                  📜 About
                </h3>
                <div style={{ 
                  color: '#a0a0a0', 
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}>
                  {guildData.basic.info}
                </div>
              </div>
            )}

            {/* Guild Members */}
            <div style={{ 
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                👥 Members ({guildData.members.length})
              </h3>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)', 
                border: '1px solid rgba(212, 175, 55, 0.2)', 
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    background: 'rgba(212, 175, 55, 0.1)', 
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)' 
                  }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Race/Class</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Level</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Rank</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Playtime</th>
                  </tr>
                </thead>
                <tbody>
                  {guildData.members.map((member) => (
                    <tr 
                      key={member.guid}
                      style={{ 
                        borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
                      }}
                    >
                      <td style={{ padding: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                        {member.name}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {raceIcons[member.race] || '👤'} {classIcons[member.class] || '⚔️'}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {member.level}
                      </td>
                      <td style={{ padding: '16px', color: '#a896de' }}>
                        {guildData.ranks[member.rank]?.name || `Rank ${member.rank}`}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {member.totalHours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
}