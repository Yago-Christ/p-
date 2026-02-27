// Search Component
window.SearchComponent = {
    initialized: false,
    searchIndex: null,
    currentResults: [],
    
    init() {
        if (this.initialized) return;
        
        this.setupSearchElements();
        this.buildSearchIndex();
        this.attachEventListeners();
        this.initialized = true;
    },

    setupSearchElements() {
        // Search elements should already be created by HeaderComponent
        this.searchInput = document.getElementById('global-search');
        this.searchResults = document.getElementById('search-results');
        
        if (!this.searchInput || !this.searchResults) {
            console.warn('Search elements not found');
        }
    },

    async buildSearchIndex() {
        try {
            const [creatures, items, structures, resources, bosses] = await Promise.all([
                DataLoader.getData('creatures'),
                DataLoader.getData('items'),
                DataLoader.getData('structures'),
                DataLoader.getData('resources'),
                DataLoader.getData('bosses')
            ]);

            this.searchIndex = {
                creatures: creatures.map(item => ({
                    ...item,
                    type: 'creature',
                    searchableText: this.createSearchableText(item)
                })),
                items: items.map(item => ({
                    ...item,
                    type: 'item',
                    searchableText: this.createSearchableText(item)
                })),
                structures: structures.map(item => ({
                    ...item,
                    type: 'structure',
                    searchableText: this.createSearchableText(item)
                })),
                resources: resources.map(item => ({
                    ...item,
                    type: 'resource',
                    searchableText: this.createSearchableText(item)
                })),
                bosses: bosses.map(item => ({
                    ...item,
                    type: 'boss',
                    searchableText: this.createSearchableText(item)
                }))
            };

            console.log('Search index built successfully');
        } catch (error) {
            console.error('Failed to build search index:', error);
        }
    },

    createSearchableText(item) {
        const fields = [
            item.name,
            item.slug,
            item.category,
            item.subcategory,
            item.tier,
            item.diet,
            item.temperament,
            item.description
        ].filter(Boolean);

        return fields.join(' ').toLowerCase();
    },

    attachEventListeners() {
        if (!this.searchInput || !this.searchResults) return;

        let searchTimeout;
        
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length < 2) {
                this.hideResults();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Handle keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });

        // Handle focus/blur
        this.searchInput.addEventListener('focus', () => {
            if (this.currentResults.length > 0) {
                this.showResults();
            }
        });

        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideResults(), 200);
        });
    },

    async performSearch(query) {
        if (!this.searchIndex) {
            await this.buildSearchIndex();
        }

        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search across all types
        Object.keys(this.searchIndex).forEach(type => {
            const typeResults = this.searchIndex[type].filter(item => 
                item.searchableText.includes(lowerQuery)
            ).slice(0, 3); // Limit results per type
            
            results.push(...typeResults);
        });

        // Sort by relevance (exact matches first, then alphabetical)
        results.sort((a, b) => {
            const aExact = a.name.toLowerCase() === lowerQuery;
            const bExact = b.name.toLowerCase() === lowerQuery;
            
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            return a.name.localeCompare(b.name);
        });

        this.currentResults = results.slice(0, 8); // Limit total results
        this.renderResults(query);
    },

    renderResults(query) {
        if (!this.searchResults) return;

        if (this.currentResults.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-info">
                        <div class="search-result-title">No results found</div>
                        <div class="search-result-subtitle">Try searching for "${query}" with different terms</div>
                    </div>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = this.currentResults.map((result, index) => `
                <a href="${this.getItemUrl(result)}" class="search-result-item" data-index="${index}">
                    <div class="search-result-icon">
                        ${this.getTypeIcon(result.type)}
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${Utils.escapeHtml(result.name)}</div>
                        <div class="search-result-subtitle">
                            ${this.getSubtitle(result)}
                        </div>
                    </div>
                </a>
            `).join('');
        }

        this.showResults();
    },

    getTypeIcon(type) {
        const icons = {
            creature: '🦕',
            item: '📦',
            structure: '🏗️',
            resource: '💎',
            boss: '👹'
        };
        return icons[type] || '📄';
    },

    getSubtitle(item) {
        switch (item.type) {
            case 'creature':
                return `${item.category} • ${item.tier} • ${item.diet}`;
            case 'item':
                return `${item.category}${item.subcategory ? ' • ' + item.subcategory : ''} • ${item.tier}`;
            case 'structure':
                return `${item.category} • ${item.tier}`;
            case 'resource':
                return `${item.category} • Resource`;
            case 'boss':
                return `${item.category} • ${item.tier} • ${item.difficulty}`;
            default:
                return item.category || 'Unknown';
        }
    },

    getItemUrl(item) {
        switch (item.type) {
            case 'creature':
                return `/creatures/${item.slug}`;
            case 'item':
                return `/items/${item.slug}`;
            case 'structure':
                return `/structures/${item.slug}`;
            case 'resource':
                return `/resources/${item.slug}`;
            case 'boss':
                return `/bosses/${item.slug}`;
            default:
                return '#';
        }
    },

    handleKeyboardNavigation(e) {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        let currentIndex = -1;
        items.forEach((item, index) => {
            if (item.classList.contains('highlighted')) {
                currentIndex = index;
            }
        });

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, items.length - 1);
                this.highlightItem(currentIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, -1);
                this.highlightItem(currentIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    items[currentIndex].click();
                }
                break;
            case 'Escape':
                this.hideResults();
                this.searchInput.blur();
                break;
        }
    },

    highlightItem(index) {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        items.forEach((item, i) => {
            item.classList.toggle('highlighted', i === index);
        });
    },

    showResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
    },

    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
        this.currentResults = [];
    },

    // Advanced search with filters
    async advancedSearch(query, filters = {}) {
        if (!this.searchIndex) {
            await this.buildSearchIndex();
        }

        const lowerQuery = query.toLowerCase();
        let results = [];

        // Search across specified types or all types
        const types = filters.types || Object.keys(this.searchIndex);
        
        types.forEach(type => {
            if (this.searchIndex[type]) {
                const typeResults = this.searchIndex[type].filter(item => {
                    // Text search
                    const textMatch = item.searchableText.includes(lowerQuery);
                    
                    // Apply filters
                    let filterMatch = true;
                    
                    if (filters.tier && filters.tier.length > 0) {
                        filterMatch = filterMatch && filters.tier.includes(item.tier);
                    }
                    
                    if (filters.category && filters.category.length > 0) {
                        filterMatch = filterMatch && filters.category.includes(item.category);
                    }
                    
                    if (filters.tameable !== undefined) {
                        filterMatch = filterMatch && (item.tameable === filters.tameable);
                    }
                    
                    return textMatch && filterMatch;
                });
                
                results.push(...typeResults);
            }
        });

        return results;
    },

    // Get search suggestions
    async getSuggestions(query, limit = 5) {
        if (!this.searchIndex) {
            await this.buildSearchIndex();
        }

        const lowerQuery = query.toLowerCase();
        const suggestions = new Set();

        Object.values(this.searchIndex).flat().forEach(item => {
            if (item.name.toLowerCase().startsWith(lowerQuery)) {
                suggestions.add(item.name);
            }
        });

        return Array.from(suggestions).slice(0, limit);
    },

    // Clear search
    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.hideResults();
    },

    // Focus search input
    focus() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }
};
