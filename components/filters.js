// Filters Component
window.FiltersComponent = {
    initialized: false,
    currentFilters: {},
    availableFilters: {},
    
    init() {
        if (this.initialized) return;
        
        this.setupFilterElements();
        this.loadAvailableFilters();
        this.attachEventListeners();
        this.loadSavedFilters();
        this.initialized = true;
    },

    setupFilterElements() {
        this.filterSidebar = document.querySelector('.filters-sidebar');
        this.filterClear = document.querySelector('.filters-header button');
        
        if (!this.filterSidebar) {
            console.warn('Filter sidebar not found');
            return;
        }
    },

    async loadAvailableFilters() {
        try {
            // Load data to build filter options
            const [creatures, items] = await Promise.all([
                DataLoader.getData('creatures'),
                DataLoader.getData('items')
            ]);

            this.availableFilters = {
                creatures: {
                    tier: this.getUniqueValues(creatures, 'tier'),
                    category: this.getUniqueValues(creatures, 'category'),
                    diet: this.getUniqueValues(creatures, 'diet'),
                    tameable: [true, false],
                    rideable: [true, false]
                },
                items: {
                    tier: this.getUniqueValues(items, 'tier'),
                    category: this.getUniqueValues(items, 'category'),
                    craftable: [true, false]
                }
            };

            console.log('Available filters loaded:', this.availableFilters);
        } catch (error) {
            console.error('Failed to load available filters:', error);
        }
    },

    getUniqueValues(data, field) {
        const values = [...new Set(data.map(item => item[field]).filter(Boolean))];
        return values.sort();
    },

    attachEventListeners() {
        if (!this.filterSidebar) return;

        // Handle filter changes
        this.filterSidebar.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-checkbox')) {
                this.handleFilterChange(e.target);
            } else if (e.target.classList.contains('filter-range')) {
                this.handleRangeChange(e.target);
            }
        });

        // Handle clear filters
        if (this.filterClear) {
            this.filterClear.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Handle filter sections toggle
        this.filterSidebar.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-title')) {
                this.toggleFilterSection(e.target);
            }
        });
    },

    handleFilterChange(checkbox) {
        const filterType = checkbox.getAttribute('data-filter-type');
        const value = checkbox.value;
        
        if (!this.currentFilters[filterType]) {
            this.currentFilters[filterType] = [];
        }

        if (checkbox.checked) {
            this.currentFilters[filterType].push(value);
        } else {
            this.currentFilters[filterType] = this.currentFilters[filterType].filter(v => v !== value);
        }

        // Remove empty filter arrays
        if (this.currentFilters[filterType].length === 0) {
            delete this.currentFilters[filterType];
        }

        this.saveFilters();
        this.applyFilters();
    },

    handleRangeChange(rangeInput) {
        const filterType = rangeInput.getAttribute('data-filter-type');
        const value = parseFloat(rangeInput.value);
        
        this.currentFilters[filterType] = {
            min: value,
            max: parseFloat(rangeInput.getAttribute('max'))
        };

        this.saveFilters();
        this.applyFilters();
    },

    toggleFilterSection(titleElement) {
        const section = titleElement.nextElementSibling;
        const isExpanded = section.style.display !== 'none';
        
        section.style.display = isExpanded ? 'none' : 'block';
        titleElement.querySelector('.toggle-icon')?.textContent?.replace('▼', '▲').replace('▲', '▼');
    },

    applyFilters() {
        // Update URL with filter parameters
        const queryParams = new URLSearchParams();
        
        Object.keys(this.currentFilters).forEach(filterType => {
            const value = this.currentFilters[filterType];
            if (Array.isArray(value)) {
                queryParams.set(filterType, value.join(','));
            } else if (typeof value === 'object') {
                queryParams.set(`${filterType}_min`, value.min);
                queryParams.set(`${filterType}_max`, value.max);
            }
        });

        // Update URL without page reload
        const newUrl = window.location.pathname + (queryParams.toString() ? '?' + queryParams.toString() : '');
        window.history.replaceState({}, '', newUrl);

        // Trigger filter application event
        this.filterApplied();
    },

    filterApplied() {
        // This will be handled by page-specific components
        const event = new CustomEvent('filtersChanged', {
            detail: { filters: this.currentFilters }
        });
        document.dispatchEvent(event);
    },

    clearAllFilters() {
        this.currentFilters = {};
        
        // Clear all checkboxes
        this.filterSidebar.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset range inputs
        this.filterSidebar.querySelectorAll('.filter-range').forEach(range => {
            range.value = range.getAttribute('min');
        });

        this.saveFilters();
        this.applyFilters();
    },

    saveFilters() {
        Utils.storage.set('currentFilters', this.currentFilters);
    },

    loadSavedFilters() {
        const saved = Utils.storage.get('currentFilters', {});
        this.currentFilters = saved;
        
        // Apply saved filters to UI
        Object.keys(this.currentFilters).forEach(filterType => {
            const value = this.currentFilters[filterType];
            
            if (Array.isArray(value)) {
                value.forEach(filterValue => {
                    const checkbox = this.filterSidebar.querySelector(
                        `.filter-checkbox[data-filter-type="${filterType}"][value="${filterValue}"]`
                    );
                    if (checkbox) checkbox.checked = true;
                });
            } else if (typeof value === 'object') {
                const rangeInput = this.filterSidebar.querySelector(
                    `.filter-range[data-filter-type="${filterType}"]`
                );
                if (rangeInput) rangeInput.value = value.min;
            }
        });
    },

    // Render filters for specific page type
    renderFilters(pageType) {
        if (!this.filterSidebar || !this.availableFilters[pageType]) return;

        const filters = this.availableFilters[pageType];
        let html = '';

        // Generate filter sections
        Object.keys(filters).forEach(filterType => {
            const values = filters[filterType];
            if (!values || values.length === 0) return;

            html += `
                <div class="filter-section">
                    <h4 class="filter-title" style="cursor: pointer;">
                        ${this.formatFilterTitle(filterType)} ▼
                    </h4>
                    <div class="filter-options">
            `;

            if (typeof values[0] === 'boolean') {
                // Boolean filters (tameable, rideable, craftable)
                html += `
                    <label class="filter-option">
                        <input type="checkbox" class="filter-checkbox" data-filter-type="${filterType}" value="true">
                        <span class="filter-label">Yes</span>
                    </label>
                    <label class="filter-option">
                        <input type="checkbox" class="filter-checkbox" data-filter-type="${filterType}" value="false">
                        <span class="filter-label">No</span>
                    </label>
                `;
            } else {
                // String filters (tier, category, diet)
                values.forEach(value => {
                    html += `
                        <label class="filter-option">
                            <input type="checkbox" class="filter-checkbox" data-filter-type="${filterType}" value="${value}">
                            <span class="filter-label">${this.formatFilterValue(value)}</span>
                        </label>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        });

        this.filterSidebar.innerHTML = `
            <div class="filters-header">
                <span>Filters</span>
                <button class="btn btn-outline btn-sm">Clear</button>
            </div>
            ${html}
        `;

        // Re-attach event listeners
        this.attachEventListeners();
        this.loadSavedFilters();
    },

    formatFilterTitle(filterType) {
        const titles = {
            tier: 'Tier',
            category: 'Category',
            diet: 'Diet',
            tameable: 'Tameable',
            rideable: 'Rideable',
            craftable: 'Craftable'
        };
        return titles[filterType] || filterType;
    },

    formatFilterValue(value) {
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        return value;
    },

    // Get current filters as query parameters
    getQueryParams() {
        const params = {};
        
        Object.keys(this.currentFilters).forEach(filterType => {
            const value = this.currentFilters[filterType];
            if (Array.isArray(value)) {
                params[filterType] = value.join(',');
            } else if (typeof value === 'object') {
                params[`${filterType}_min`] = value.min;
                params[`${filterType}_max`] = value.max;
            }
        });

        return params;
    },

    // Load filters from query parameters
    loadFromQueryParams() {
        const params = Utils.getQueryParams();
        const filters = {};

        Object.keys(params).forEach(key => {
            if (key.includes('_min')) {
                const filterType = key.replace('_min', '');
                if (!filters[filterType]) filters[filterType] = {};
                filters[filterType].min = parseFloat(params[key]);
            } else if (key.includes('_max')) {
                const filterType = key.replace('_max', '');
                if (!filters[filterType]) filters[filterType] = {};
                filters[filterType].max = parseFloat(params[key]);
            } else {
                const values = params[key].split(',').map(v => v.trim());
                filters[key] = values;
            }
        });

        this.currentFilters = filters;
        this.loadSavedFilters();
    },

    // Get filter count
    getFilterCount() {
        let count = 0;
        Object.keys(this.currentFilters).forEach(filterType => {
            const value = this.currentFilters[filterType];
            if (Array.isArray(value)) {
                count += value.length;
            } else if (typeof value === 'object') {
                count += 1;
            }
        });
        return count;
    },

    // Check if any filters are active
    hasActiveFilters() {
        return Object.keys(this.currentFilters).length > 0;
    }
};
