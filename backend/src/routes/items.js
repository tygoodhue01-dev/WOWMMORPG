import express from 'express';
import { gameDbPool } from '../config/database.js';

const router = express.Router();

// Search for items
router.get('/search', async (req, res) => {
  try {
    const { query, quality, itemClass, minLevel = 1, maxLevel = 80, limit = 50 } = req.query;
    
    let sql = `
      SELECT 
        it.entry,
        it.name,
        it.quality,
        it.ItemLevel,
        it.RequiredLevel,
        it.class,
        it.SubClass,
        it.InventoryType,
        it.AllowableClass,
        it.Icon,
        it.StatType1,
        it.StatValue1,
        it.StatType2,
        it.StatValue2,
        it.StatType3,
        it.StatValue3,
        it.StatType4,
        it.StatValue4,
        it.StatType5,
        it.StatValue5,
        it.StatType6,
        it.StatValue6,
        it.StatType7,
        it.StatValue7,
        it.StatType8,
        it.StatValue8,
        it.StatType9,
        it.StatValue9,
        it.StatType10,
        it.StatValue10,
        it.Armor,
        it.HolyRes,
        it.FireRes,
        it.NatureRes,
        it.FrostRes,
        it.ShadowRes,
        it.ArcaneRes,
        it.delay,
        it.description,
        it.PageText
      FROM item_template it
      WHERE 1=1
    `;
    
    const params = [];
    
    if (query) {
      sql += ` AND it.name LIKE ?`;
      params.push(`%${query}%`);
    }
    
    if (quality) {
      sql += ` AND it.quality = ?`;
      params.push(parseInt(quality));
    }
    
    if (itemClass) {
      sql += ` AND it.class = ?`;
      params.push(parseInt(itemClass));
    }
    
    if (minLevel) {
      sql += ` AND it.RequiredLevel >= ?`;
      params.push(parseInt(minLevel));
    }
    
    if (maxLevel) {
      sql += ` AND it.RequiredLevel <= ?`;
      params.push(parseInt(maxLevel));
    }
    
    sql += ` ORDER BY it.ItemLevel DESC, it.quality DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [items] = await gameDbPool.query(sql, params);
    
    const formattedItems = items.map(item => ({
      entry: item.entry,
      name: item.name,
      quality: item.quality,
      itemLevel: item.ItemLevel,
      requiredLevel: item.RequiredLevel,
      class: item.class,
      subClass: item.SubClass,
      inventoryType: item.InventoryType,
      allowableClass: item.AllowableClass,
      icon: item.Icon,
      delay: item.delay,
      description: item.description,
      pageText: item.PageText,
      stats: {
        stat1: { type: item.StatType1, value: item.StatValue1 },
        stat2: { type: item.StatType2, value: item.StatValue2 },
        stat3: { type: item.StatType3, value: item.StatValue3 },
        stat4: { type: item.StatType4, value: item.StatValue4 },
        stat5: { type: item.StatType5, value: item.StatValue5 },
        stat6: { type: item.StatType6, value: item.StatValue6 },
        stat7: { type: item.StatType7, value: item.StatValue7 },
        stat8: { type: item.StatType8, value: item.StatValue8 },
        stat9: { type: item.StatType9, value: item.StatValue9 },
        stat10: { type: item.StatType10, value: item.StatValue10 }
      },
      resistances: {
        armor: item.Armor,
        holyRes: item.HolyRes,
        fireRes: item.FireRes,
        natureRes: item.NatureRes,
        frostRes: item.FrostRes,
        shadowRes: item.ShadowRes,
        arcaneRes: item.ArcaneRes
      }
    }));
    
    res.json({
      success: true,
      items: formattedItems,
      count: formattedItems.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to search items:', error);
    res.status(500).json({ success: false, error: 'Failed to search items' });
  }
});

// Get detailed item information
router.get('/item/:entry', async (req, res) => {
  try {
    const { entry } = req.params;
    
    const [items] = await gameDbPool.query(
      `SELECT 
        it.entry,
        it.name,
        it.quality,
        it.ItemLevel,
        it.RequiredLevel,
        it.class,
        it.SubClass,
        it.InventoryType,
        it.AllowableClass,
        it.AllowableRace,
        it.Icon,
        it.delay,
        it.description,
        it.PageText,
        it.startquest,
        it.RequiredSkill,
        it.RequiredSkillRank,
        it.SocketColor_1,
        it.SocketColor_2,
        it.SocketColor_3,
        it.socketid_1,
        it.socketid_2,
        it.socketid_3,
        it.GemProperties,
        it.RandomProperty,
        it.RandomSuffix,
        it.RequiredDisenchantSkill,
        it.FoodType,
        it.minReputation,
        it.RequiredReputationRank
      FROM item_template it
      WHERE it.entry = ?`,
      [entry]
    );
    
    if (items.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    const item = items[0];
    
    // Get item drops
    const [drops] = await gameDbPool.query(
      `SELECT 
        c.name as creature_name,
        c.entry as creature_entry,
        c.minlevel,
        c.maxlevel,
        c.type
      FROM creature c
      WHERE c.entry IN (
        SELECT DISTINCT l.CreatureOrGO 
        FROM loot_template l 
        WHERE l.Item = ?
      )`,
      [entry]
    );
    
    // Get required quests
    const [quests] = await gameDbPool.query(
      `SELECT 
        q.Title,
        q.QuestLevel,
        q.MinLevel,
        q.MaxLevel,
        q.entry as quest_entry
      FROM quest_template q
      WHERE q.entry = ? OR q.StartItem = ?`,
      [item.startquest, entry]
    );
    
    const formattedItem = {
      basic: {
        entry: item.entry,
        name: item.name,
        quality: item.quality,
        itemLevel: item.ItemLevel,
        requiredLevel: item.RequiredLevel,
        class: item.class,
        subClass: item.SubClass,
        inventoryType: item.InventoryType,
        allowableClass: item.AllowableClass,
        allowableRace: item.AllowableRace,
        icon: item.Icon,
        delay: item.delay,
        description: item.description,
        pageText: item.PageText
      },
      requirements: {
        requiredSkill: item.RequiredSkill,
        requiredSkillRank: item.RequiredSkillRank,
        requiredDisenchantSkill: item.RequiredDisenchantSkill,
        foodType: item.FoodType,
        minReputation: item.minReputation,
        requiredReputationRank: item.RequiredReputationRank
      },
      sockets: [
        { slot: 1, color: item.SocketColor_1, gemId: item.socketid_1 },
        { slot: 2, color: item.SocketColor_2, gemId: item.socketid_2 },
        { slot: 3, color: item.SocketColor_3, gemId: item.socketid_3 }
      ].filter(socket => socket.color),
      randomProperties: {
        gemProperties: item.GemProperties,
        randomProperty: item.RandomProperty,
        randomSuffix: item.RandomSuffix
      },
      drops: drops.map(drop => ({
        creatureName: drop.creature_name,
        creatureEntry: drop.creature_entry,
        minLevel: drop.minlevel,
        maxLevel: drop.maxlevel,
        type: drop.type
      })),
      quests: quests.map(quest => ({
        title: quest.Title,
        questLevel: quest.QuestLevel,
        minLevel: quest.MinLevel,
        maxLevel: quest.MaxLevel,
        entry: quest.quest_entry
      }))
    };
    
    res.json({
      success: true,
      item: formattedItem,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch item details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch item details' });
  }
});

// Get item categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await gameDbPool.query(
      `SELECT DISTINCT class FROM item_template WHERE class IS NOT NULL ORDER BY class`
    );
    
    res.json({
      success: true,
      categories: categories.map(cat => cat.class),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch item categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch item categories' });
  }
});

// Get item quality information
router.get('/qualities', async (req, res) => {
  try {
    const qualities = [
      { id: 0, name: 'Poor', color: '#9d9d9d' },
      { id: 1, name: 'Common', color: '#ffffff' },
      { id: 2, name: 'Uncommon', color: '#1eff00' },
      { id: 3, name: 'Rare', color: '#0070dd' },
      { id: 4, name: 'Epic', color: '#a335ee' },
      { id: 5, name: 'Legendary', color: '#ff8000' },
      { id: 6, name: 'Artifact', color: '#e6cc80' },
      { id: 7, name: 'Heirloom', color: '#ff0000' }
    ];
    
    res.json({
      success: true,
      qualities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch item qualities:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch item qualities' });
  }
});

// Get popular items (by item level)
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20, quality } = req.query;
    
    let sql = `
      SELECT 
        it.entry,
        it.name,
        it.quality,
        it.ItemLevel,
        it.RequiredLevel,
        it.class,
        it.Icon,
        it.description
      FROM item_template it
      WHERE it.ItemLevel > 0
    `;
    
    const params = [];
    
    if (quality) {
      sql += ` AND it.quality = ?`;
      params.push(parseInt(quality));
    }
    
    sql += ` ORDER BY it.ItemLevel DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [items] = await gameDbPool.query(sql, params);
    
    const formattedItems = items.map(item => ({
      entry: item.entry,
      name: item.name,
      quality: item.quality,
      itemLevel: item.ItemLevel,
      requiredLevel: item.RequiredLevel,
      class: item.class,
      icon: item.Icon,
      description: item.description
    }));
    
    res.json({
      success: true,
      items: formattedItems,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch popular items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch popular items' });
  }
});

// Get item summary statistics
router.get('/summary', async (req, res) => {
  try {
    const [totalItems] = await gameDbPool.query(
      'SELECT COUNT(*) as count FROM item_template'
    );
    
    const [qualityDistribution] = await gameDbPool.query(
      `SELECT quality, COUNT(*) as count FROM item_template GROUP BY quality ORDER BY quality`
    );
    
    const [categoryDistribution] = await gameDbPool.query(
      `SELECT class, COUNT(*) as count FROM item_template WHERE class IS NOT NULL GROUP BY class ORDER BY count DESC LIMIT 10`
    );
    
    res.json({
      success: true,
      summary: {
        totalItems: totalItems[0].count,
        qualityDistribution: qualityDistribution,
        topCategories: categoryDistribution
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch item summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch item summary' });
  }
});

export default router;