import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ArmoryPage() {
  const [view, setView] = useState('search'); // 'search' or 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterData, setCharacterData] = useState(null);
  const [filters, setFilters] = useState({ race: '', class: '', minLevel: 1 });
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const { guid } = useParams();

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

  const qualityColors = {
    0: '#9d9d9d', // Poor
    1: '#ffffff', // Common
    2: '#1eff00', // Uncommon
    3: '#0070dd', // Rare
    4: '#a335ee', // Epic
    5: '#ff8000', // Legendary
    6: '#e6cc80', // Artifact
    7: '#ff0000' // Heirloom
  };

  const qualityNames = {
    0: 'Poor',
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary',
    6: 'Artifact',
    7: 'Heirloom'
  };

  const slotNames = {
    0: 'Head',
    1: 'Neck',
    2: 'Shoulders',
    3: 'Shirt',
    4: 'Chest',
    5: 'Waist',
    6: 'Legs',
    7: 'Feet',
    8: 'Wrists',
    9: 'Hands',
    10: 'Finger 1',
    11: 'Finger 2',
    12: 'Trinket 1',
    13: 'Trinket 2',
    14: 'Back',
    15: 'Main Hand',
    16: 'Off Hand',
    17: 'Ranged',
    18: 'Tabard'
  };

  const standingNames = {
    0: 'Hated',
    1: 'Hostile',
    2: 'Unfriendly',
    3: 'Neutral',
    4: 'Friendly',
    5: 'Honored',
    6: 'Revered',
    7: 'Exalted'
  };

  const standingColors = {
    0: '#ff0000',
    1: '#ff0000',
    2: '#ff0000',
    3: '#ffff00',
    4: '#00ff00',
    5: '#00ff00',
    6: '#00ff00',
    7: '#00ff00'
  };

  useEffect(() => {
    // Load races and classes for filters
    fetchRaces();
    fetchClasses();
    
    // If guid is in URL, load that character
    if (guid) {
      loadCharacterProfile(guid);
    }
  }, [guid]);

  const fetchRaces = async () => {
    try {
      const response = await fetch('/api/armory/races');
      const data = await response.json();
      if (data.success) {
        setRaces(data.races);
      }
    } catch (error) {
      console.error('Failed to fetch races:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/armory/classes');
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const searchCharacters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        query: searchQuery,
        race: filters.race,
        class: filters.class,
        minLevel: filters.minLevel
      });
      
      const response = await fetch(`/api/armory/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.characters);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to search characters:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCharacterProfile = async (characterGuid) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/armory/character/${characterGuid}`);
      const data = await response.json();
      
      if (data.success) {
        setCharacterData(data.character);
        setView('profile');
        navigate(`/armory/${characterGuid}`);
      } else {
        alert('Failed to load character profile');
      }
    } catch (error) {
      console.error('Failed to load character profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchCharacters();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatStatValue = (value) => {
    if (!value) return 0;
    // Some stats are already divided by appropriate amounts in the database
    return value;
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white', background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => { setView('search'); navigate('/armory'); }}
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
            ← Back to Search
          </button>
          
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
            🛡️ Character Armory
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
            Explore characters on Rune Haven
          </p>
        </div>

        {view === 'search' && (
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
                      Character Name
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
                      Race
                    </label>
                    <select
                      value={filters.race}
                      onChange={(e) => setFilters({...filters, race: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">All Races</option>
                      {races.map(race => (
                        <option key={race.id} value={race.id}>{race.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Class
                    </label>
                    <select
                      value={filters.class}
                      onChange={(e) => setFilters({...filters, class: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">All Classes</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Minimum Level
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
                  {loading ? 'Searching...' : '🔍 Search Characters'}
                </button>
              </form>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
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
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Guild</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Play Time</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((char) => (
                    <tr 
                      key={char.guid}
                      onClick={() => loadCharacterProfile(char.guid)}
                      style={{ 
                        borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                        cursor: 'pointer',
                        background: 'rgba(212, 175, 55, 0.05)'
                      }}
                    >
                      <td style={{ padding: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                        {char.name}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {raceIcons[char.race] || '👤'} {classIcons[char.class] || '⚔️'}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {char.level}
                      </td>
                      <td style={{ padding: '16px', color: '#a896de' }}>
                        {char.guildName || 'No Guild'}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {char.totalHours}h
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {formatDate(char.lastSeen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {searchResults.length === 0 && !loading && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#a0a0a0',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              No characters found. Try different search criteria.
            </div>
          )}
        </>
        )}

        {view === 'profile' && characterData && (
          <>
            {/* Character Header */}
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
                  {classIcons[characterData.basic.class] || '⚔️'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                    {characterData.basic.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', color: '#a0a0a0', fontSize: '16px' }}>
                    <span>{raceIcons[characterData.basic.race] || '👤'} {races.find(r => r.id === characterData.basic.race)?.name || 'Unknown'}</span>
                    <span>{classIcons[characterData.basic.class] || '⚔️'} {classes.find(c => c.id === characterData.basic.class)?.name || 'Unknown'}</span>
                    <span>Level {characterData.basic.level}</span>
                    <span>{characterData.basic.totalHours}h played</span>
                  </div>
                  {characterData.guild && (
                    <div style={{ marginTop: '8px', color: '#a896de' }}>
                      👥 {characterData.guild.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Character Stats */}
            <div style={{ 
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                📊 Character Statistics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                {Object.entries(characterData.stats).map(([key, value]) => (
                  <div key={key} style={{ 
                    padding: '16px', 
                    background: 'rgba(212, 175, 55, 0.05)', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
                      {formatStatValue(value)}
                    </div>
                    <div style={{ color: '#a0a0a0', fontSize: '12px', marginTop: '4px' }}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div style={{ 
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                ⚔️ Equipment
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                {characterData.equipment.map((item, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '16px', 
                      background: 'rgba(0, 0, 0, 0.3)', 
                      borderRadius: '8px',
                      border: `2px solid ${qualityColors[item.quality] || '#9d9d9d'}`,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>
                      {slotNames[item.slot] || `Slot ${item.slot}`}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: qualityColors[item.quality] || '#9d9d9d', marginBottom: '4px' }}>
                      {item.name || 'Empty Slot'}
                    </div>
                    {item.itemLevel && (
                      <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                        Item Level: {item.itemLevel}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div style={{ 
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                🏆 Recent Achievements
              </h3>
              {characterData.achievements.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {characterData.achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      style={{ 
                        padding: '16px', 
                        background: 'rgba(212, 175, 55, 0.05)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(212, 175, 55, 0.1)'
                      }}
                    >
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                        {achievement.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>
                        {achievement.description}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#a0a0a0' }}>
                        <span>{achievement.points} points</span>
                        <span>{formatDate(achievement.completedDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#a0a0a0' }}>No achievements yet</div>
              )}
            </div>

            {/* Skills */}
            <div style={{ 
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                📚 Skills
              </h3>
              {characterData.skills.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {characterData.skills.map((skill) => (
                    <div 
                      key={skill.id}
                      style={{ 
                        padding: '16px', 
                        background: 'rgba(0, 0, 0, 0.3)', 
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                        {skill.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>
                        {skill.description}
                      </div>
                      <div style={{ 
                        marginTop: '8px', 
                        height: '4px', 
                        background: 'rgba(212, 175, 55, 0.2)', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            background: '#d4af37', 
                            width: `${skill.progress}%` 
                          }} 
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '4px' }}>
                        {skill.value}/{skill.max} ({skill.progress}%)
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#a0a0a0' }}>No skills yet</div>
              )}
            </div>

            {/* Reputation */}
            <div style={{ 
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                🏛️ Reputation
              </h3>
              {characterData.reputation.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {characterData.reputation.map((rep) => (
                    <div 
                      key={rep.id}
                      style={{ 
                        padding: '16px', 
                        background: 'rgba(0, 0, 0, 0.3)', 
                        borderRadius: '8px',
                        border: `1px solid ${standingColors[rep.standing] || '#ffff00'}`
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                        {rep.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>
                        {rep.description}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        color: standingColors[rep.standing] || '#ffff00' 
                      }}>
                        {standingNames[rep.standing] || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#a0a0a0' }}>No reputation data yet</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}