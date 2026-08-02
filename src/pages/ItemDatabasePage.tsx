import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ItemDatabasePage() {
  const [view, setView] = useState('search'); // 'search' or 'detail'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [filters, setFilters] = useState({ quality: '', class: '', minLevel: 1, maxLevel: 80 });
  const [categories, setCategories] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  const { entry } = useParams();

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

  const statNames = {
    1: 'Strength',
    2: 'Agility',
    3: 'Stamina',
    4: 'Intellect',
    5: 'Spirit',
    6: 'Spell Power',
    7: 'Defense',
    8: 'Dodge Rating',
    9: 'Parry Rating',
    10: 'Shield Block',
    11: 'Hit Rating',
    12: 'Crit Strike Rating',
    13: 'Resilience Rating',
    14: 'Haste Rating',
    15: 'Expertise Rating',
    16: 'Attack Power',
    17: 'Ranged Attack Power',
    18: 'Spell Penetration',
    19: 'Spell Hit Rating',
    20: 'Spell Crit Strike Rating',
    21: 'Spell Haste Rating',
    22: 'Spell Resilience Rating',
    23: 'Mana Per 5 Sec',
    24: 'Armor Penetration Rating',
    25: 'Health Regeneration',
    26: 'Spell Power',
    27: 'Health',
    28: 'Mana'
  };

  useEffect(() => {
    // Load categories and qualities for filters
    fetchCategories();
    fetchQualities();
    fetchSummary();
    
    // If entry is in URL, load that item
    if (entry) {
      loadItemDetails(entry);
    }
  }, [entry]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/items/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchQualities = async () => {
    try {
      const response = await fetch('/api/items/qualities');
      const data = await response.json();
      if (data.success) {
        setQualities(data.qualities);
      }
    } catch (error) {
      console.error('Failed to fetch qualities:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/items/summary');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const searchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        query: searchQuery,
        quality: filters.quality,
        class: filters.class,
        minLevel: filters.minLevel,
        maxLevel: filters.maxLevel
      });
      
      const response = await fetch(`/api/items/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.items);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to search items:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadItemDetails = async (itemEntry) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/items/item/${itemEntry}`);
      const data = await response.json();
      
      if (data.success) {
        setItemData(data.item);
        setView('detail');
        navigate(`/items/${itemEntry}`);
      } else {
        alert('Failed to load item details');
      }
    } catch (error) {
      console.error('Failed to load item details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchItems();
  };

  const formatStatValue = (value) => {
    if (!value) return 0;
    return value;
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white', background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a20 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => { setView('search'); navigate('/items'); }}
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
            🗡️ Item Database
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
            Search and explore items on Rune Haven
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
                {summary.totalItems}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Total Items
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
                {summary.topCategories?.length || 0}
              </div>
              <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
                Categories
              </div>
            </div>
          </div>
        )}

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
                      Item Name
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
                      Quality
                    </label>
                    <select
                      value={filters.quality}
                      onChange={(e) => setFilters({...filters, quality: e.target.value})}
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
                      <option value="">All Qualities</option>
                      {qualities.map(quality => (
                        <option key={quality.id} value={quality.id}>{quality.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Category
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
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Min Level
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
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>
                      Max Level
                    </label>
                    <input
                      type="number"
                      value={filters.maxLevel}
                      onChange={(e) => setFilters({...filters, maxLevel: e.target.value})}
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
                  {loading ? 'Searching...' : '🔍 Search Items'}
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
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Quality</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Item Level</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Required Level</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#d4af37' }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((item) => (
                    <tr 
                      key={item.entry}
                      onClick={() => loadItemDetails(item.entry)}
                      style={{ 
                        borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                        cursor: 'pointer',
                        background: 'rgba(212, 175, 55, 0.05)'
                      }}
                    >
                      <td style={{ padding: '16px', color: '#ffffff', fontWeight: 'bold' }}>
                        🗡️ {item.name}
                      </td>
                      <td style={{ padding: '16px', color: qualityColors[item.quality] || '#9d9d9d', fontWeight: 'bold' }}>
                        {qualityNames[item.quality] || 'Unknown'}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {item.itemLevel}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {item.requiredLevel}
                      </td>
                      <td style={{ padding: '16px', color: '#a0a0a0' }}>
                        {item.subClass || item.class}
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
              No items found. Try different search criteria.
            </div>
          )}
        </>
        )}

        {view === 'detail' && itemData && (
          <>
            {/* Item Header */}
            <div style={{ 
              marginBottom: '32px',
              padding: '32px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: `2px solid ${qualityColors[itemData.basic.quality] || '#9d9d9d'}`,
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
                  🗡️
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: qualityColors[itemData.basic.quality] || '#9d9d9d', marginBottom: '8px' }}>
                    {itemData.basic.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', color: '#a0a0a0', fontSize: '16px' }}>
                    <span>{qualityNames[itemData.basic.quality] || 'Unknown'}</span>
                    <span>Item Level: {itemData.basic.itemLevel}</span>
                    <span>Required Level: {itemData.basic.requiredLevel}</span>
                  </div>
                  <div style={{ marginTop: '8px', color: '#a0a0a0', fontSize: '14px' }}>
                    {itemData.basic.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Item Stats */}
            {Object.entries(itemData.stats).length > 0 && (
              <div style={{ 
                marginBottom: '32px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px'
              }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                📊 Item Statistics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                {Object.entries(itemData.stats).map(([key, stat]) => (
                  stat.value && (
                    <div key={key} style={{ 
                      padding: '16px', 
                      background: 'rgba(212, 175, 55, 0.05)', 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
                        {formatStatValue(stat.value)}
                      </div>
                      <div style={{ color: '#a0a0a0', fontSize: '12px', marginTop: '4px' }}>
                        {statNames[stat.type] || stat.type}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            )}

            {/* Drop Locations */}
            {itemData.drops && itemData.drops.length > 0 && (
              <div style={{ 
                marginBottom: '32px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px'
              }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                🐉 Drop Locations
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {itemData.drops.map((drop, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '16px', 
                      background: 'rgba(212, 175, 55, 0.05)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(212, 175, 55, 0.1)'
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4af37', marginBottom: '8px' }}>
                      {drop.creatureName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>
                      Level {drop.minLevel}-{drop.maxLevel}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                      {drop.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quest Sources */}
          {itemData.quests && itemData.quests.length > 0 && (
            <div style={{ 
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 30, 33, 0.9) 0%, rgba(20, 20, 23, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', marginBottom: '16px' }}>
                📜 Quest Sources
              </h3>
              {itemData.quests.map((quest, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(212, 175, 55, 0.05)', 
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4af37', marginBottom: '4px' }}>
                    {quest.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                    Quest Level: {quest.questLevel} (Min: {quest.minLevel} - Max: {quest.maxLevel})
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
}