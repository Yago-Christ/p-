// Wiki Data Extraction Engine - Real-time data extraction from Primal Fear Wiki
window.WikiExtractor = {
  baseUrl: 'https://primalfear.wiki.gg',
  cache: new Map(),
  rateLimitDelay: 2000, // 2 seconds between requests to avoid rate limiting
  
  async init() {
    console.log('🔄 Initializing Wiki Data Extraction Engine...');
    
    // Check if we can access the wiki
    try {
      const response = await fetch(`${this.baseUrl}/wiki/Creatures`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      if (response.ok) {
        console.log('✅ Wiki accessible, starting extraction...');
        return true;
      } else {
        console.warn('⚠️ Wiki not accessible, using fallback data');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Cannot access wiki directly, using fallback data:', error);
      return false;
    }
  },
  
  async extractData(type) {
    const cacheKey = `${type}_${this.getDateKey()}`;
    
    // Check cache first (24 hour cache)
    if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
            console.log(`📦 Using cached ${type} data`);
            return cached.data;
        }
    }
    
    try {
        console.log(`🌐 Extracting ${type} data from wiki...`);
        
        let rawData;
        
        // First try to extract from main page to get category links
        if (type === 'all') {
            rawData = await this.fetchFromMainPage();
        } else {
            // Extract specific items from category pages
            rawData = await this.fetchCategoryItems(type);
        }
        
        const processedData = this.processRawData(rawData, type);
        
        // Cache the results
        this.cache.set(cacheKey, {
            data: processedData,
            timestamp: Date.now(),
            source: this.baseUrl,
            confidence: 'wiki-extracted'
        });
        
        console.log(`✅ Successfully extracted ${processedData.length} ${type}`);
        return processedData;
        
    } catch (error) {
        console.error(`❌ Failed to extract ${type}:`, error);
        return this.getFallbackData(type);
    }
  },
  
  async fetchCategoryItems(type) {
    // Map types to actual wiki endpoints
    const endpoints = {
        creatures: '/wiki/Creatures',
        items: '/wiki/Items', 
        structures: '/wiki/Structures',
        resources: '/wiki/Resources',
        bosses: '/wiki/Bosses',
        progression: '/wiki/Progression'
    };
    
    const url = `${this.baseUrl}${endpoints[type]}`;
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'PrimalFearDex-Bot/1.0 (Educational Purpose)'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    return this.parseCategoryItems(html, type);
  },
  
  parseCategoryItems(html, type) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const items = [];
    
    // Try different selectors for item tables
    const selectors = [
        '.wikitable tbody tr',
        '.creature-table tbody tr',
        'table[class*="item"] tbody tr',
        'table[class*="creature"] tbody tr',
        '.gallerybox',
        'li a[href*="/wiki/"]'
    ];
    
    let foundItems = [];
    
    for (const selector of selectors) {
        const elements = doc.querySelectorAll(selector);
        if (elements.length > 0) {
            foundItems = Array.from(elements);
            break;
        }
    }
    
    foundItems.forEach((element, index) => {
        // Skip header rows
        if (element.tagName === 'TR' && index === 0) return;
        
        const item = this.parseItemElement(element, type);
        if (item && this.isValidItem(item)) {
            items.push(item);
        }
    });
    
    return items;
  },
  
  parseItemElement(element, type) {
    try {
      let name, link, img;
      
      if (element.classList.contains('gallerybox')) {
        // Parse gallery box
        link = element.querySelector('a');
        img = element.querySelector('img');
        const text = element.querySelector('.gallerytext');
        name = link ? link.getAttribute('title') || text.textContent.trim() : text.textContent.trim();
        
      } else if (element.tagName === 'TR') {
        // Parse table row
        const cells = element.querySelectorAll('td');
        if (cells.length > 0) {
          const nameCell = cells[0];
          link = nameCell.querySelector('a');
          name = link ? link.textContent.trim() : nameCell.textContent.trim();
        }
      } else if (element.tagName === 'A') {
        // Parse direct link
        link = element;
        name = link.textContent.trim();
      }
      
      if (!name || name.length < 2) return null;
      
      return {
        id: this.generateId(name),
        name: name.trim(),
        slug: this.generateSlug(name),
        wiki_url: link ? (link.href.startsWith('/') ? `${this.baseUrl}${link.href}` : link.href) : '',
        image_url: img ? (img.src.startsWith('/') ? `${this.baseUrl}${img.src}` : img.src) : '',
        image_alt: img ? img.alt : '',
        category: type,
        tier: this.inferTierFromName(name),
        metadata: {
          source: 'primalfear.wiki.gg',
          extracted_at: new Date().toISOString(),
          extraction_confidence: 'medium',
          extraction_method: 'category_page'
        }
      };
    } catch (error) {
      console.warn('Failed to parse item element:', error);
      return null;
    }
  },
  
  isValidItem(item) {
    return item && 
           item.name && 
           item.name.length > 1 && 
           !item.name.includes('Edit') &&
           !item.name.includes('View') &&
           !item.name.includes('Source');
  },
  
  async fetchFromWiki(type) {
    // Map types to actual wiki endpoints
    const endpoints = {
        creatures: '/wiki/Creatures',
        items: '/wiki/Items', 
        structures: '/wiki/Structures',
        resources: '/wiki/Resources',
        bosses: '/wiki/Bosses',
        progression: '/wiki/Progression'
    };
    
    // For main page, extract all categories
    if (type === 'all') {
        return this.fetchFromMainPage();
    }
    
    const url = `${this.baseUrl}${endpoints[type]}`;
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'PrimalFearDex-Bot/1.0 (Educational Purpose)'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    return this.parseWikiHTML(html, type);
  },
  
  async fetchFromMainPage() {
    const url = `${this.baseUrl}`;
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'PrimalFearDex-Bot/1.0 (Educational Purpose)'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract from main gallery
    const mainGallery = doc.querySelector('.gallery.mw-gallery-nolines');
    if (mainGallery) {
        return this.extractFromMainGallery(mainGallery, 'all');
    }
    
    return [];
  },
  
  parseWikiHTML(html, type) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // First try to extract from main gallery structure
    const mainGallery = doc.querySelector('.gallery.mw-gallery-nolines');
    if (mainGallery) {
        return this.extractFromMainGallery(mainGallery, type);
    }
    
    // Fallback to original methods
    switch (type) {
        case 'creatures':
            return this.extractCreaturesFromDOM(doc);
        case 'items':
            return this.extractItemsFromDOM(doc);
        case 'structures':
            return this.extractStructuresFromDOM(doc);
        case 'resources':
            return this.extractResourcesFromDOM(doc);
        case 'bosses':
            return this.extractBossesFromDOM(doc);
        case 'progression':
            return this.extractProgressionFromDOM(doc);
        default:
            return [];
    }
  },
  
  extractFromMainGallery(gallery, type) {
    const items = [];
    const galleryBoxes = gallery.querySelectorAll('.gallerybox');
    
    galleryBoxes.forEach(box => {
        const link = box.querySelector('a');
        const img = box.querySelector('img');
        const text = box.querySelector('.gallerytext');
        
        if (link && text) {
            const title = link.getAttribute('title') || text.textContent.trim();
            const href = link.getAttribute('href') || '';
            const imgSrc = img ? img.getAttribute('src') : '';
            const imgAlt = img ? img.getAttribute('alt') : '';
            
            items.push({
                id: this.generateId(title),
                name: title,
                slug: this.generateSlug(title),
                wiki_url: href.startsWith('/') ? `https://primalfear.wiki.gg${href}` : href,
                image_url: imgSrc.startsWith('/') ? `https://primalfear.wiki.gg${imgSrc}` : imgSrc,
                image_alt: imgAlt,
                category: this.determineCategoryFromTitle(title),
                metadata: {
                    source: 'primalfear.wiki.gg',
                    extracted_at: new Date().toISOString(),
                    extraction_confidence: 'high',
                    extraction_method: 'main_gallery'
                }
            });
        }
    });
    
    return items;
  },
  
  determineCategoryFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    // Map gallery titles to categories
    const categoryMap = {
        'creatures': 'creatures',
        'armor': 'items',
        'weapons': 'items',
        'consumables': 'items',
        'structures': 'structures',
        'resources': 'resources',
        'saddles': 'items',
        'ammo': 'items',
        'bosses': 'bosses',
        'egg layers': 'creatures',
        'summoners': 'structures',
        'costumes': 'items',
        'patch notes': 'progression',
        'guides': 'progression',
        'gus.ini settings': 'progression'
    };
    
    return categoryMap[title] || 'unknown';
  },
  
  extractCreaturesFromDOM(doc) {
    const creatures = [];
    
    // Try different selectors that might contain creature data
    const possibleSelectors = [
      '.creature-table tbody tr',
      '.wikitable tbody tr',
      'table[class*="creature"] tbody tr',
      '.mw-parser-output tr'
    ];
    
    let creatureRows = [];
    for (const selector of possibleSelectors) {
      creatureRows = doc.querySelectorAll(selector);
      if (creatureRows.length > 0) break;
    }
    
    if (creatureRows.length === 0) {
      console.warn('No creature tables found, trying alternative extraction...');
      return this.extractCreaturesFromAlternative(doc);
    }
    
    creatureRows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      
      const cells = row.querySelectorAll('td, th');
      if (cells.length >= 3) {
        const creature = this.parseCreatureRow(cells);
        if (creature && this.isValidCreature(creature)) {
          creatures.push(creature);
        }
      }
    });
    
    return creatures;
  },
  
  parseCreatureRow(cells) {
    try {
      // Extract name and link
      const nameCell = cells[0];
      const nameLink = nameCell?.querySelector('a');
      const name = nameLink ? nameLink.textContent.trim() : nameCell?.textContent.trim();
      const wikiUrl = nameLink ? nameLink.href : null;
      
      if (!name) return null;
      
      // Extract tier from second cell or from name
      const tierCell = cells[1] || nameCell;
      const tierText = tierCell.textContent.trim();
      const tier = this.normalizeTier(tierText || name);
      
      // Extract basic stats if available
      const stats = this.extractBasicStats(cells);
      
      // Extract diet if available
      const diet = this.extractDiet(cells);
      
      return {
        id: this.generateId(name),
        name: name.trim(),
        slug: this.generateSlug(name),
        wiki_url: wikiUrl,
        tier: tier,
        diet: diet || 'unknown',
        category: this.determineCategory(name, tier),
        tameable: this.isTamable(name, tier),
        rideable: this.isRideable(name, tier),
        stats: stats,
        metadata: {
          source: 'primalfear.wiki.gg',
          extracted_at: new Date().toISOString(),
          extraction_confidence: 'medium',
          wiki_accessible: true
        }
      };
    } catch (error) {
      console.warn('Failed to parse creature row:', error);
      return null;
    }
  },
  
  extractBasicStats(cells) {
    const stats = {
      health: { base: 150, wild_multiplier: 1.0, tamed_multiplier: 1.0 },
      stamina: { base: 100, wild_multiplier: 1.0, tamed_multiplier: 1.0 },
      weight: { base: 80, wild_multiplier: 1.0, tamed_multiplier: 1.0 },
      melee: { base: 100, wild_multiplier: 1.0, tamed_multiplier: 1.0 }
    };
    
    // Try to extract actual stats from cells
    cells.forEach(cell => {
      const text = cell.textContent.trim();
      
      // Look for health values
      const healthMatch = text.match(/(\d+)\s*health/i);
      if (healthMatch) {
        stats.health.base = parseInt(healthMatch[1]);
      }
      
      // Look for damage values
      const damageMatch = text.match(/(\d+)\s*damage/i);
      if (damageMatch) {
        stats.melee.base = parseInt(damageMatch[1]);
      }
    });
    
    return stats;
  },
  
  extractDiet(cells) {
    for (const cell of cells) {
      const text = cell.textContent.trim().toLowerCase();
      if (text.includes('carnivore')) return 'carnivore';
      if (text.includes('herbivore')) return 'herbivore';
      if (text.includes('omnivore')) return 'omnivore';
    }
    return 'unknown';
  },
  
  normalizeTier(text) {
    const tierMap = {
      'alpha': 'alpha',
      'beta': 'beta',
      'gamma': 'gamma',
      'delta': 'delta',
      'epsilon': 'epsilon',
      'omega': 'omega',
      'toxic': 'toxic',
      'celestial': 'celestial',
      'demonic': 'demonic',
      'chaos': 'chaos',
      'spirit': 'spirit',
      'fabled': 'fabled',
      'apex': 'apex',
      'origin': 'origin'
    };
    
    const lowerText = text.toLowerCase();
    
    // Check for tier keywords in the text
    for (const [key, value] of Object.entries(tierMap)) {
      if (lowerText.includes(key)) {
        return value;
      }
    }
    
    return 'unknown';
  },
  
  determineCategory(name, tier) {
    const nameLower = name.toLowerCase();
    
    // Determine category based on name patterns
    if (nameLower.includes('dragon')) return 'dragon';
    if (nameLower.includes('reaper')) return 'reaper';
    if (nameLower.includes('spirit')) return 'spirit';
    if (nameLower.includes('elemental')) return 'elemental';
    if (nameLower.includes('celestial')) return 'celestial';
    if (nameLower.includes('demonic')) return 'demonic';
    
    // Default categorization
    if (['toxic', 'alpha'].includes(tier)) return 'alpha';
    if (['beta', 'gamma'].includes(tier)) return 'beta';
    
    return 'unknown';
  },
  
  isTamable(name, tier) {
    const nameLower = name.toLowerCase();
    
    // Non-tamable creatures
    const nonTamable = [
      'creator', 'destroyer', 'guardian', 'titan',
      'spirit', 'demon', 'celestial'
    ];
    
    return !nonTamable.some(keyword => nameLower.includes(keyword));
  },
  
  isRideable(name, tier) {
    const nameLower = name.toLowerCase();
    
    // Generally non-rideable creatures
    const nonRideable = [
      'dodo', 'compy', 'dilophosaur', 'micro',
      'spirit', 'demon', 'celestial'
    ];
    
    return !nonRideable.some(keyword => nameLower.includes(keyword));
  },
  
  generateId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  },
  
  generateSlug(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$|/g, '');
  },
  
  isValidCreature(creature) {
    return creature && 
           creature.name && 
           creature.name.length > 0 && 
           creature.tier && 
           creature.tier !== 'unknown';
  },
  
  getFallbackData(type) {
    // Use sample data as fallback
    if (window.PrimalFearData && window.PrimalFearData[type]) {
      console.log(`📦 Using fallback sample data for ${type}`);
      return window.PrimalFearData[type];
    }
    
    console.warn(`No fallback data available for ${type}`);
    return [];
  },
  
  getDateKey() {
    return new Date().toISOString().split('T')[0];
  },
  
  // Alternative extraction methods
  extractCreaturesFromAlternative(doc) {
    const creatures = [];
    
    // Look for creature names in headings and lists
    const headings = doc.querySelectorAll('h2, h3, li');
    
    headings.forEach(heading => {
      const text = heading.textContent.trim();
      
      // Check if it looks like a creature name
      if (text.length > 2 && text.length < 50 && !text.includes(' ')) {
        const tier = this.inferTierFromName(text);
        
        if (tier !== 'unknown') {
          creatures.push({
            id: this.generateId(text),
            name: text,
            slug: this.generateSlug(text),
            tier: tier,
            category: this.determineCategory(text, tier),
            tameable: this.isTamable(text, tier),
            rideable: this.isRideable(text, tier),
            stats: { health: { base: 150 }, melee: { base: 100 } },
            metadata: {
              source: 'primalfear.wiki.gg',
              extracted_at: new Date().toISOString(),
              extraction_confidence: 'low',
              extraction_method: 'alternative'
            }
          });
        }
      }
    });
    
    return creatures;
  },
  
  inferTierFromName(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('alpha')) return 'alpha';
    if (nameLower.includes('beta')) return 'beta';
    if (nameLower.includes('gamma')) return 'gamma';
    if (nameLower.includes('toxic')) return 'toxic';
    if (nameLower.includes('celestial')) return 'celestial';
    if (nameLower.includes('demonic')) return 'demonic';
    if (nameLower.includes('chaos')) return 'chaos';
    
    return 'unknown';
  }
};
