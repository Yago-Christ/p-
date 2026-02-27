// src/services/api.js - API Service com Fallbacks Inteligentes
class ApiService {
  constructor(base_url = '/data') {
    this.base_url = base_url;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.fallbackData = new Map();
    
    this.setupFallbackData();
  }

  // Setup de dados fallback
  setupFallbackData() {
    // Fallback para criaturas
    this.fallbackData.set('creatures', [
      {
        id: 'alpha_rex',
        name: 'Alpha Rex',
        slug: 'alpha-rex',
        tier: 'alpha',
        category: 'creatures',
        tameable: true,
        rideable: true,
        image_url: '/assets/images/fallback/creature.png',
        stats: { health: 1500, stamina: 300, weight: 500, melee: 100 },
        metadata: { source: 'fallback', confidence: 'low' }
      },
      {
        id: 'toxic_raptor',
        name: 'Toxic Raptor',
        slug: 'toxic-raptor',
        tier: 'toxic',
        category: 'creatures',
        tameable: true,
        rideable: true,
        image_url: '/assets/images/fallback/creature.png',
        stats: { health: 800, stamina: 200, weight: 200, melee: 80 },
        metadata: { source: 'fallback', confidence: 'low' }
      }
    ]);

    // Fallback para itens
    this.fallbackData.set('items', [
      {
        id: 'primal_spear',
        name: 'Primal Spear',
        slug: 'primal-spear',
        tier: 'primal',
        category: 'items',
        craftable: true,
        image_url: '/assets/images/fallback/item.png',
        stats: { damage: 50, durability: 100 },
        metadata: { source: 'fallback', confidence: 'low' }
      },
      {
        id: 'toxic_kibble',
        name: 'Toxic Kibble',
        slug: 'toxic-kibble',
        tier: 'toxic',
        category: 'items',
        craftable: true,
        image_url: '/assets/images/fallback/item.png',
        stats: { taming_bonus: 1.5 },
        metadata: { source: 'fallback', confidence: 'low' }
      }
    ]);

    // Fallback para estruturas
    this.fallbackData.set('structures', [
      {
        id: 'primal_smithy',
        name: 'Primal Smithy',
        slug: 'primal-smithy',
        tier: 'primal',
        category: 'structures',
        craftable: true,
        image_url: '/assets/images/fallback/structure.png',
        stats: { health: 2000, crafting_speed: 2.0 },
        metadata: { source: 'fallback', confidence: 'low' }
      }
    ]);

    // Fallback para recursos
    this.fallbackData.set('resources', [
      {
        id: 'alpha_blood',
        name: 'Alpha Blood',
        slug: 'alpha-blood',
        tier: 'alpha',
        category: 'resources',
        image_url: '/assets/images/fallback/resource.png',
        stats: { weight: 0.1, stack_size: 100 },
        metadata: { source: 'fallback', confidence: 'low' }
      }
    ]);

    // Fallback para chefes
    this.fallbackData.set('bosses', [
      {
        id: 'fire_colossus',
        name: 'Fire Colossus',
        slug: 'fire-colossus',
        tier: 'boss',
        category: 'bosses',
        tameable: false,
        rideable: false,
        image_url: '/assets/images/fallback/boss.png',
        stats: { health: 50000, damage: 500 },
        metadata: { source: 'fallback', confidence: 'low' }
      }
    ]);

    // Fallback para progressão
    this.fallbackData.set('progression', [
      {
        id: 'tier_alpha',
        name: 'Alpha Tier',
        slug: 'alpha-tier',
        tier: 'alpha',
        category: 'progression',
        requirements: { level: 60, previous_tier: 'gamma' },
        metadata: { source: 'fallback', confidence: 'low' }
      }
    ]);
  }

  // Método principal de获取 dados
  async getData(type, options = {}) {
    const cacheKey = `${type}_${JSON.stringify(options)}`;
    
    // 1. Cache check
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📦 Using cached data for ${type}`);
        return cached.data;
      }
    }

    // 2. Fetch com retry
    let lastError;
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const data = await this.fetchData(type, options);
        
        // 3. Schema validation
        const validated = this.validateSchema(type, data);
        
        // 4. Cache
        this.cache.set(cacheKey, {
          data: validated,
          timestamp: Date.now()
        });
        
        console.log(`✅ Successfully fetched ${type} (attempt ${attempt})`);
        return validated;
        
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed for ${type}:`, error.message);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    // 5. Fallback se todas as tentativas falharem
    console.warn(`All attempts failed for ${type}, using fallback`);
    return this.getFallbackData(type);
  }

  // Fetch de dados com tratamento robusto
  async fetchData(type, options = {}) {
    const url = `${this.base_url}/${type}.json`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  // Schema validation
  validateSchema(type, data) {
    if (!Array.isArray(data)) {
      throw new Error(`Invalid ${type} data: expected array`);
    }

    const validated = data.filter(item => {
      // Validações básicas
      if (!item || typeof item !== 'object') return false;
      if (!item.id || !item.name) return false;
      if (typeof item.id !== 'string' || typeof item.name !== 'string') return false;
      
      // Validações específicas por tipo
      switch (type) {
        case 'creatures':
          return this.validateCreature(item);
        case 'items':
          return this.validateItem(item);
        case 'structures':
          return this.validateStructure(item);
        case 'resources':
          return this.validateResource(item);
        case 'bosses':
          return this.validateBoss(item);
        case 'progression':
          return this.validateProgression(item);
        default:
          return true;
      }
    });

    if (validated.length === 0) {
      throw new Error(`No valid ${type} items found`);
    }

    return validated;
  }

  // Validações específicas
  validateCreature(item) {
    return (
      item.tier && typeof item.tier === 'string' &&
      item.category && typeof item.category === 'string' &&
      typeof item.tameable === 'boolean' &&
      typeof item.rideable === 'boolean'
    );
  }

  validateItem(item) {
    return (
      item.tier && typeof item.tier === 'string' &&
      item.category && typeof item.category === 'string' &&
      typeof item.craftable === 'boolean'
    );
  }

  validateStructure(item) {
    return (
      item.tier && typeof item.tier === 'string' &&
      item.category && typeof item.category === 'string' &&
      typeof item.craftable === 'boolean'
    );
  }

  validateResource(item) {
    return (
      item.tier && typeof item.tier === 'string' &&
      item.category && typeof item.category === 'string' &&
      item.stats && typeof item.stats === 'object'
    );
  }

  validateBoss(item) {
    return (
      item.tier && typeof item.tier === 'string' &&
      item.category && typeof item.category === 'string' &&
      typeof item.tameable === 'boolean' &&
      typeof item.rideable === 'boolean'
    );
  }

  validateProgression(item) {
    return (
      item.tier && typeof item.tier === 'string' &&
      item.category && typeof item.category === 'string' &&
      item.requirements && typeof item.requirements === 'object'
    );
  }

  // Fallback data
  getFallbackData(type) {
    const fallback = this.fallbackData.get(type);
    if (!fallback) {
      console.warn(`No fallback data available for ${type}`);
      return [];
    }
    
    // Adiciona metadata de fallback
    return fallback.map(item => ({
      ...item,
      metadata: {
        ...item.metadata,
        is_fallback: true,
        fallback_reason: 'api_unavailable'
      }
    }));
  }

  // Cache management
  clearCache(type = null) {
    if (type) {
      // Limpa cache específico
      for (const [key] of this.cache) {
        if (key.startsWith(type)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Limpa todo cache
      this.cache.clear();
    }
  }

  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memory_usage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      totalSize += JSON.stringify(value).length;
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }

  // Health check
  async healthCheck() {
    const results = {
      api_available: false,
      cache_size: this.cache.size,
      fallback_available: this.fallbackData.size > 0,
      timestamp: Date.now()
    };

    try {
      // Testa API com uma requisição simples
      const response = await fetch(`${this.base_url}/creatures.json`, {
        method: 'HEAD',
        timeout: 5000
      });
      
      results.api_available = response.ok;
    } catch (error) {
      results.api_error = error.message;
    }

    return results;
  }

  // Utilitários
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch requests
  async getBatchData(types) {
    const promises = types.map(type => 
      this.getData(type).catch(error => {
        console.error(`Failed to get ${type}:`, error);
        return this.getFallbackData(type);
      })
    );

    const results = await Promise.allSettled(promises);
    
    return types.reduce((acc, type, index) => {
      acc[type] = results[index].status === 'fulfilled' 
        ? results[index].value 
        : this.getFallbackData(type);
      return acc;
    }, {});
  }

  // Search functionality
  async search(query, type = null) {
    if (!query || query.length < 2) {
      return [];
    }

    const data = type 
      ? await this.getData(type)
      : await this.getBatchData(['creatures', 'items', 'structures']);

    const items = type ? data : Object.values(data).flat();

    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.tier && item.tier.toLowerCase().includes(query.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(query.toLowerCase()))
    );
  }
}

// Export global
window.ApiService = ApiService;
