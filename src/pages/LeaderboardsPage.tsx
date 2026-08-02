import { useEffect, useState } from 'react';

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState('pvp');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const tabs = [
    { id: 'pvp', name: 'PvP Arena', icon: '⚔️' },
    { id: 'pve', name: 'PvE Progression', icon: '🏰' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' },
    { id: 'guilds', name: 'Guilds', icon: '👥' },
    { id: 'wealth', name: 'Wealth', icon: '💰' }
  ];

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

  const fetchLeaderboard = async (type) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboards/${type}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/leaderboards/summary');
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
    fetchSummary();
  }, [activeTab]);

  const formatRank = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  const formatMoney = (gold, silver, copper) => {
    return `${gold}g ${silver}s ${copper}c`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white', background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
            🏆 Leaderboards
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
            Compete with the best on Rune Haven
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
                {summary.totalCharacters}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Active Characters
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
                {summary.totalGuilds}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Guilds
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
                {summary.totalAchievements}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Achievements Earned
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px', 
          flexWrap: 'wrap' 
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                  : 'rgba(30, 30, 33, 0.8)',
                color: activeTab === tab.id ? '#0f0f10' : '#d4af37',
                border: '1px solid #d4af37',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: activeTab === tab.id ? 1 : 0.7
              }}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)', 
          border: '1px solid rgba(212, 175, 55, 0.2)', 
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#a0a0a0' }}>
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#a0a0a0' }}>
              No data available for this category
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: 'rgba(212, 175, 55, 0.1)', 
                  borderBottom: '1px solid rgba(212, 175, 55, 0.2)' 
                }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Rank</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Race/Class</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Level</th>
                  {activeTab === 'pvp' && (
                    <>
                      <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Rating</th>
                      <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Win Rate</th>
                    </>
                  )}
                  {activeTab === 'pve' && (
                    <>
                      <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Play Time</th>
                      <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Guild</th>
                    </>
                  )}
                  {activeTab === 'achievements' && (
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Achievements</th>
                  )}
                  {activeTab === 'guilds' && (
                    <>
                      <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Members</th>
                      <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Avg Level</th>
                    </>
                  )}
                  {activeTab === 'wealth' && (
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Wealth</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.guid || entry.guildId}
                    style={{ 
                      borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                      background: index < 3 ? 'rgba(212, 175, 55, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '16px', color: '#d4af37', fontSize: '18px' }}>
                      {formatRank(index)}
                    </td>
                    <td style={{ padding: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                      {entry.name}
                    </td>
                    <td style={{ padding: '16px', color: '#a0a0a0' }}>
                      {raceIcons[entry.race] || '👤'} {classIcons[entry.class] || '⚔️'}
                    </td>
                    <td style={{ padding: '16px', color: '#a0a0a0' }}>
                      {entry.level}
                    </td>
                    {activeTab === 'pvp' && (
                      <>
                        <td style={{ padding: '16px', color: '#d4af37', fontWeight: 'bold' }}>
                          {entry.rating}
                        </td>
                        <td style={{ padding: '16px', color: entry.winRate >= 50 ? '#4ade80' : '#ef4444' }}>
                          {entry.winRate}%
                        </td>
                      </>
                    )}
                    {activeTab === 'pve' && (
                      <>
                        <td style={{ padding: '16px', color: '#a0a0a0' }}>
                          {entry.totalHours}h
                        </td>
                        <td style={{ padding: '16px', color: '#a896de' }}>
                          {entry.guildName || 'No Guild'}
                        </td>
                      </>
                    )}
                    {activeTab === 'achievements' && (
                      <td style={{ padding: '16px', color: '#d4af37', fontWeight: 'bold' }}>
                        {entry.achievementCount}
                      </td>
                    )}
                    {activeTab === 'guilds' && (
                      <>
                        <td style={{ padding: '16px', color: '#a0a0a0' }}>
                          {entry.memberCount}
                        </td>
                        <td style={{ padding: '16px', color: '#a0a0a0' }}>
                          {entry.averageLevel}
                        </td>
                      </>
                    )}
                    {activeTab === 'wealth' && (
                      <td style={{ padding: '16px', color: '#d4af37', fontWeight: 'bold' }}>
                        {formatMoney(entry.gold, entry.silver, entry.copper)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tab Description */}
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '8px', color: '#a0a0a0' }}>
          <strong style={{ color: '#d4af37' }}>{tabs.find(t => t.id === activeTab)?.name}:</strong> {tabs.find(t => t.id === activeTab)?.description}
        </div>
      </div>
    </div>
  );
}