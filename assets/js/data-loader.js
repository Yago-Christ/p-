// Data Loader - Handles loading, caching, and validation of all data
window.DataLoader = {
    cache: new Map(),
    loadingPromises: new Map(),
    
    // Base data files - now using wiki extraction
    dataSources: {
        creatures: 'wiki',
        items: 'wiki',
        structures: 'wiki',
        resources: 'wiki',
        bosses: 'wiki',
        progression: 'wiki'
    },

    // Initialize data loader
    async init() {
        try {
            Utils.performance.mark('dataLoader-start');
            
            // Initialize wiki extraction engine
            if (window.WikiExtractor) {
                await window.WikiExtractor.init();
            }
            
            // First try to extract from main page
            try {
                if (window.WikiExtractor) {
                    const mainPageData = await window.WikiExtractor.extractData('all');
                    if (mainPageData && mainPageData.length > 0) {
                        // Organize data by category
                        this.organizeMainPageData(mainPageData);
                    }
                }
            } catch (error) {
                console.warn('Failed to extract from main page:', error);
            }
            
            // Load essential data first
            await this.loadEssentialData();
            
            // Load remaining data in background
            this.loadBackgroundData();
            
            // Mark data loading complete
            Utils.performance.mark('dataLoader-init-end');
            Utils.performance.measure('dataLoader-init', 'dataLoader-start', 'dataLoader-init-end');
            
            return true;
        } catch (error) {
            console.error('DataLoader initialization failed:', error);
            Utils.showNotification('Failed to load data. Please refresh the page.', 'error');
            return false;
        }
    },
    
    // Organize data from main page into categories
    organizeMainPageData(mainPageData) {
        mainPageData.forEach(item => {
            const category = item.category;
            if (!window.PrimalFearData[category]) {
                window.PrimalFearData[category] = [];
            }
            window.PrimalFearData[category].push(item);
        });
        
        console.log('📊 Main page data organized:', {
            creatures: window.PrimalFearData.creatures?.length || 0,
            items: window.PrimalFearData.items?.length || 0,
            structures: window.PrimalFearData.structures?.length || 0,
            resources: window.PrimalFearData.resources?.length || 0,
            bosses: window.PrimalFearData.bosses?.length || 0,
            progression: window.PrimalFearData.progression?.length || 0
        });
    },

    // Load essential data first
    async loadEssentialData() {
        const essential = ['creatures', 'items'];
        
        for (const type of essential) {
            try {
                await this.loadData(type);
            } catch (error) {
                console.error(`Failed to load essential ${type}:`, error);
            }
        }
    },

    // Load background data
    async loadBackgroundData() {
        const background = ['structures', 'resources', 'bosses', 'progression'];
        
        for (const type of background) {
            try {
                // Load with delay to not block UI
                setTimeout(() => this.loadData(type), Math.random() * 2000);
            } catch (error) {
                console.error(`Failed to load background ${type}:`, error);
            }
        }
    },

    // Load data from wiki or fallback
    async loadData(type) {
        if (this.loadingPromises.has(type)) {
            return this.loadingPromises.get(type);
        }

        const loadingPromise = this.performDataLoad(type);
        this.loadingPromises.set(type, loadingPromise);

        try {
            const data = await loadingPromise;
            this.cache.set(type, data);
            return data;
        } finally {
            this.loadingPromises.delete(type);
        }
    },

    // Perform actual data loading
    async performDataLoad(type) {
        try {
            // First try to get from wiki extraction engine
            if (window.PrimaFearDataEngine && window.PrimalFearData[type]) {
                console.log(`Loading ${type} from wiki extraction engine...`);
                return window.PrimalFearData[type];
            }
            
            // Fallback to sample data
            if (window.PrimalFearData && window.PrimalFearData[type]) {
                console.log(`Loading ${type} from sample data fallback...`);
                return window.PrimalFearData[type];
            }
            
            // Final fallback to empty array
            console.warn(`No data available for ${type}, using empty array`);
            return [];
            
        } catch (error) {
            console.error(`Failed to load ${type}:`, error);
            throw error;
        }
    },

    // Fetch data from wiki (new method)
    async fetchData(type) {
        // Use WikiExtractor if available
        if (window.WikiExtractor) {
            return await WikiExtractor.extractData(type);
        }
        
        // Fallback to sample data
        if (window.PrimalFearData && window.PrimalFearData[type]) {
            return window.PrimalFearData[type];
        }
        
        // Final fallback
        console.warn(`No data available for type: ${type}`);
        return [];
    },

    // Validate data structure
    validateData(type, data) {
        if (!Array.isArray(data)) {
            throw new Error(`Invalid ${type} data: expected array`);
        }

        // Basic validation for each item
        return data.filter(item => {
            if (!item || typeof item !== 'object') {
                console.warn(`Invalid item in ${type} data:`, item);
                return false;
            }

            // Required fields based on type
            const requiredFields = this.getRequiredFields(type);
            const hasRequiredFields = requiredFields.every(field => 
                item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
            );

            if (!hasRequiredFields) {
                console.warn(`Missing required fields in ${type} item:`, item);
                return false;
            }

            return true;
        });
    },

    // Get required fields for each data type
    getRequiredFields(type) {
        const fields = {
            creatures: ['id', 'name', 'slug', 'tier', 'category', 'diet'],
            items: ['id', 'name', 'slug', 'category'],
            structures: ['id', 'name', 'slug', 'category', 'tier'],
            resources: ['id', 'name', 'slug', 'category'],
            bosses: ['id', 'name', 'slug', 'tier', 'category'],
            progression: ['id', 'tier', 'name', 'slug']
        };
        return fields[type] || ['id', 'name'];
    },

    // Get data by type
    async getData(type) {
        return await this.loadData(type);
    },

    // Get single item by ID
    async getItem(type, id) {
        const data = await this.getData(type);
        return data.find(item => item.id === id);
    },

    // Get single item by slug
    async getItemBySlug(type, slug) {
        const data = await this.getData(type);
        return data.find(item => item.slug === slug);
    },

    // Search data
    async searchData(type, query, fields = ['name']) {
        const data = await this.getData(type);
        return Utils.searchInArray(data, query, fields);
    },

    // Filter data
    async filterData(type, criteria) {
        const data = await this.getData(type);
        return Utils.filterByCriteria(data, criteria);
    },

    // Get unique values for a field
    async getUniqueValues(type, field) {
        const data = await this.getData(type);
        const values = [...new Set(data.map(item => item[field]).filter(Boolean))];
        return values.sort();
    },

    // Get statistics for data type
    async getStatistics(type) {
        const data = await this.getData(type);
        
        const stats = {
            total: data.length,
            lastUpdated: this.getLastUpdated(data),
            categories: this.getCategoryStats(data, type)
        };

        // Add type-specific statistics
        if (type === 'creatures') {
            stats.tameable = data.filter(c => c.tameable).length;
            stats.rideable = data.filter(c => c.rideable).length;
            stats.tiers = this.getTierStats(data);
        }

        return stats;
    },

    // Get last updated timestamp
    getLastUpdated(data) {
        const timestamps = data
            .map(item => item.metadata?.last_updated)
            .filter(Boolean)
            .map(date => new Date(date).getTime());
        
        return timestamps.length > 0 ? Math.max(...timestamps) : null;
    },

    // Get category statistics
    getCategoryStats(data, type) {
        const categoryField = type === 'creatures' ? 'category' : 'category';
        const categories = {};
        
        data.forEach(item => {
            const category = item[categoryField];
            categories[category] = (categories[category] || 0) + 1;
        });
        
        return categories;
    },

    // Get tier statistics
    getTierStats(data) {
        const tiers = {};
        
        data.forEach(item => {
            const tier = item.tier;
            tiers[tier] = (tiers[tier] || 0) + 1;
        });
        
        return tiers;
    },

    // Clear cache
    clearCache(type = null) {
        if (type) {
            this.cache.delete(type);
            Utils.storage.remove(`data_${type}`);
        } else {
            this.cache.clear();
            Utils.storage.clear();
        }
    },

    // Refresh data
    async refreshData(type) {
        this.clearCache(type);
        return await this.loadData(type);
    },

    // Check if data is fresh (less than 1 week old)
    isDataFresh(type) {
        const cachedData = Utils.storage.get(`data_${type}`);
        if (!cachedData) return false;

        const lastUpdated = cachedData.metadata?.last_updated;
        if (!lastUpdated) return false;

        const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const now = new Date().getTime();
        const updated = new Date(lastUpdated).getTime();

        return (now - updated) < oneWeek;
    },

    // Get cache status
    getCacheStatus() {
        const status = {};
        
        // Use dataSources instead of dataFiles
        const dataTypes = Object.keys(this.dataSources);
        
        dataTypes.forEach(type => {
            const cached = this.cache.has(type);
            const fresh = this.isDataFresh(type);
            
            status[type] = {
                cached: cached,
                fresh: fresh,
                lastUpdated: this.getLastUpdateDate(type)
            };
        });
        
        return status;
    },

    // Preload data for better performance
    async preloadData(types = Object.keys(this.dataSources)) {
        const promises = types.map(type => this.loadData(type));
        return Promise.allSettled(promises);
    },

    // Export data (for debugging)
    exportData(type) {
        const data = this.cache.get(type);
        if (!data) return null;
        
        return {
            type,
            timestamp: new Date().toISOString(),
            count: data.length,
            data: data
        };
    }
};
