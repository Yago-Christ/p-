// Header Component
window.HeaderComponent = {
    initialized: false,
    
    // Initialize header component
    init() {
        if (this.initialized) return;
        
        this.render();
        this.attachEventListeners();
        this.initialized = true;
    },

    // Render header HTML
    render() {
        const headerElement = document.getElementById('header-component');
        if (!headerElement) return;

        headerElement.innerHTML = `
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <a href="/" class="logo">
                            <div class="logo-icon">🦕</div>
                            <span>Primal Fear Dex</span>
                        </a>
                        
                        <nav class="nav-menu">
                            <li class="nav-item">
                                <a href="/creatures" class="nav-link" data-route="creatures">
                                    Creatures ▾
                                </a>
                                <div class="dropdown">
                                    <a href="/creatures" class="dropdown-item" data-route="creatures">All Creatures</a>
                                    <a href="/creatures?tier=Alpha" class="dropdown-item">Alpha Tier</a>
                                    <a href="/creatures?tier=Beta" class="dropdown-item">Beta Tier</a>
                                    <a href="/creatures?tier=Gamma" class="dropdown-item">Gamma Tier</a>
                                    <div class="dropdown-divider"></div>
                                    <a href="/creatures?category=Dinosaur" class="dropdown-item">Dinosaurs</a>
                                    <a href="/creatures?category=Dragon" class="dropdown-item">Dragons</a>
                                    <a href="/creatures?category=Demon" class="dropdown-item">Demons</a>
                                    <div class="dropdown-divider"></div>
                                    <a href="/calculators/taming" class="dropdown-item" data-route="calculators">Taming Calculator</a>
                                    <a href="/calculators/stats" class="dropdown-item">Stats Calculator</a>
                                </div>
                            </li>
                            
                            <li class="nav-item">
                                <a href="/items" class="nav-link" data-route="items">
                                    Items ▾
                                </a>
                                <div class="dropdown">
                                    <a href="/items" class="dropdown-item" data-route="items">All Items</a>
                                    <a href="/items?category=Weapon" class="dropdown-item">Weapons</a>
                                    <a href="/items?category=Armor" class="dropdown-item">Armor</a>
                                    <a href="/items?category=Tool" class="dropdown-item">Tools</a>
                                    <a href="/items?category=Consumable" class="dropdown-item">Consumables</a>
                                    <a href="/kibble" class="dropdown-item">Kibbles</a>
                                    <div class="dropdown-divider"></div>
                                    <a href="/calculators/crafting" class="dropdown-item">Crafting Calculator</a>
                                </div>
                            </li>
                            
                            <li class="nav-item">
                                <a href="/structures" class="nav-link" data-route="structures">
                                    Structures ▾
                                </a>
                                <div class="dropdown">
                                    <a href="/structures" class="dropdown-item" data-route="structures">All Structures</a>
                                    <a href="/structures?tier=Thatch" class="dropdown-item">Thatch</a>
                                    <a href="/structures?tier=Wood" class="dropdown-item">Wood</a>
                                    <a href="/structures?tier=Stone" class="dropdown-item">Stone</a>
                                    <a href="/structures?tier=Metal" class="dropdown-item">Metal</a>
                                    <a href="/structures?tier=Tek" class="dropdown-item">Tek</a>
                                </div>
                            </li>
                            
                            <li class="nav-item">
                                <a href="/resources" class="nav-link" data-route="resources">
                                    Resources ▾
                                </a>
                                <div class="dropdown">
                                    <a href="/resources" class="dropdown-item" data-route="resources">All Resources</a>
                                    <a href="/resources?category=Basic" class="dropdown-item">Basic</a>
                                    <a href="/resources?category=Advanced" class="dropdown-item">Advanced</a>
                                    <a href="/resources?category=Rare" class="dropdown-item">Rare</a>
                                </div>
                            </li>
                            
                            <li class="nav-item">
                                <a href="/bosses" class="nav-link" data-route="bosses">
                                    Bosses ▾
                                </a>
                                <div class="dropdown">
                                    <a href="/bosses" class="dropdown-item" data-route="bosses">All Bosses</a>
                                    <a href="/bosses?tier=Alpha" class="dropdown-item">Alpha Bosses</a>
                                    <a href="/bosses?tier=Beta" class="dropdown-item">Beta Bosses</a>
                                    <a href="/bosses?tier=Gamma" class="dropdown-item">Gamma Bosses</a>
                                </div>
                            </li>
                            
                            <li class="nav-item">
                                <a href="/progression" class="nav-link" data-route="progression">
                                    Progression ▾
                                </a>
                                <div class="dropdown">
                                    <a href="/progression" class="dropdown-item" data-route="progression">Tier System</a>
                                    <a href="/progression" class="dropdown-item">Evolution Path</a>
                                    <a href="/progression" class="dropdown-item">Requirements</a>
                                </div>
                            </li>
                            
                            <li class="nav-item">
                                <a href="/calculators" class="nav-link" data-route="calculators">
                                    Tools ▾
                                </a>
                                <div class="dropdown">
                                    <a href="/calculators/taming" class="dropdown-item">Taming Calculator</a>
                                    <a href="/calculators/breeding" class="dropdown-item">Breeding Calculator</a>
                                    <a href="/calculators/stats" class="dropdown-item">Stats Calculator</a>
                                    <a href="/calculators/crafting" class="dropdown-item">Crafting Calculator</a>
                                    <div class="dropdown-divider"></div>
                                    <a href="/tips" class="dropdown-item" data-route="tips">Community Tips</a>
                                </div>
                            </li>
                        </nav>
                        
                        <div class="search-container">
                            <div class="search-icon">🔍</div>
                            <input 
                                type="text" 
                                class="search-input" 
                                placeholder="Search creatures, items..."
                                id="global-search"
                            >
                            <div class="search-results" id="search-results" style="display: none;"></div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    // Attach event listeners
    attachEventListeners() {
        // Handle navigation clicks
        document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    window.Router.navigate(href);
                }
            });
        });

        // Handle mobile menu toggle (if needed)
        this.setupMobileMenu();
        
        // Handle search
        this.setupSearch();
    },

    // Setup mobile menu
    setupMobileMenu() {
        if (Utils.isMobile()) {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                // Add mobile menu toggle button
                const headerContent = document.querySelector('.header-content');
                const menuToggle = document.createElement('button');
                menuToggle.className = 'btn btn-outline mobile-menu-toggle';
                menuToggle.innerHTML = '☰';
                menuToggle.setAttribute('aria-label', 'Toggle menu');
                
                headerContent.insertBefore(menuToggle, navMenu);
                
                // Toggle menu functionality
                menuToggle.addEventListener('click', () => {
                    navMenu.classList.toggle('mobile-open');
                    menuToggle.innerHTML = navMenu.classList.contains('mobile-open') ? '✕' : '☰';
                });
            }
        }
    },

    // Setup search functionality
    setupSearch() {
        const searchInput = document.getElementById('global-search');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchResults) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            clearTimeout(searchTimeout);
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            
            // Debounce search
            searchTimeout = setTimeout(async () => {
                await this.performSearch(query);
            }, 300);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.style.display = 'none';
            }
        });

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchResults.style.display = 'none';
                searchInput.blur();
            }
        });
    },

    // Perform search
    async performSearch(query) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        try {
            // Search across different data types
            const [creatures, items] = await Promise.all([
                DataLoader.searchData('creatures', query, ['name', 'category', 'diet']),
                DataLoader.searchData('items', query, ['name', 'category', 'subcategory'])
            ]);

            const results = [
                ...creatures.slice(0, 3).map(item => ({...item, type: 'creature'})),
                ...items.slice(0, 3).map(item => ({...item, type: 'item'}))
            ];

            this.renderSearchResults(results, query);
        } catch (error) {
            console.error('Search failed:', error);
            searchResults.style.display = 'none';
        }
    },

    // Render search results
    renderSearchResults(results, query) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result-item">
                    <span class="search-result-info">No results found for "${query}"</span>
                </div>
            `;
        } else {
            searchResults.innerHTML = results.map(result => `
                <a href="${this.getItemUrl(result)}" class="search-result-item">
                    <div class="search-result-icon">
                        ${result.type === 'creature' ? '🦕' : '📦'}
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${Utils.escapeHtml(result.name)}</div>
                        <div class="search-result-subtitle">
                            ${result.type === 'creature' ? 
                                `${result.category} • ${result.tier}` : 
                                `${result.category}${result.subcategory ? ' • ' + result.subcategory : ''}`
                            }
                        </div>
                    </div>
                </a>
            `).join('');
        }

        searchResults.style.display = 'block';
    },

    // Get item URL based on type
    getItemUrl(item) {
        if (item.type === 'creature') {
            return `/creatures/${item.slug}`;
        } else if (item.type === 'item') {
            return `/items/${item.slug}`;
        }
        return '#';
    },

    // Update header based on current route
    updateActiveState(currentRoute) {
        // Remove all active classes
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current route
        const activeLinks = document.querySelectorAll(`[data-route="${currentRoute}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
        });

        // Handle parent menu activation
        this.updateParentMenu(currentRoute);
    },

    // Update parent menu activation
    updateParentMenu(currentRoute) {
        const parentMenus = {
            'creatures': 'Creatures',
            'creature-detail': 'Creatures',
            'items': 'Items',
            'item-detail': 'Items',
            'structures': 'Structures',
            'structure-detail': 'Structures',
            'resources': 'Resources',
            'resource-detail': 'Resources',
            'bosses': 'Bosses',
            'boss-detail': 'Bosses',
            'progression': 'Progression',
            'calculators': 'Tools',
            'tips': 'Tools'
        };

        const parentMenu = parentMenus[currentRoute];
        if (parentMenu) {
            const parentLink = document.querySelector(`.nav-link:contains("${parentMenu}")`);
            if (parentLink) {
                parentLink.classList.add('active');
            }
        }
    },

    // Show/hide loading state
    setLoading(loading) {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.toggle('loading', loading);
        }
    },

    // Update user preferences in header
    updateUserPreferences(preferences) {
        // Could update theme, language, etc.
        console.log('User preferences updated:', preferences);
    }
};
