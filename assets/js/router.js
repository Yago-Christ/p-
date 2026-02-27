// Router - Simple SPA Router
window.Router = {
    routes: new Map(),
    currentRoute: null,
    defaultRoute: '/',
    notFoundRoute: '404',
    
    // Initialize router
    init() {
        // Define routes
        this.defineRoutes();
        
        // Handle browser navigation
        window.addEventListener('popstate', (e) => {
            this.handleRoute();
        });
        
        // Handle initial route
        this.handleRoute();
    },

    // Define all application routes
    defineRoutes() {
        // Home page
        this.addRoute('/', 'home');
        this.addRoute('', 'home'); // Handle empty path
        
        // Creatures
        this.addRoute('/creatures', 'creatures');
        this.addRoute('/creatures/:slug', 'creature-detail');
        this.addRoute('/taming/:slug', 'taming-calculator');
        
        // Items
        this.addRoute('/items', 'items');
        this.addRoute('/items/:slug', 'item-detail');
        this.addRoute('/weapons', 'weapons');
        this.addRoute('/armor', 'armor');
        this.addRoute('/tools', 'tools');
        this.addRoute('/consumables', 'consumables');
        this.addRoute('/kibble', 'kibble');
        
        // Structures
        this.addRoute('/structures', 'structures');
        this.addRoute('/structures/:slug', 'structure-detail');
        
        // Resources
        this.addRoute('/resources', 'resources');
        this.addRoute('/resources/:slug', 'resource-detail');
        
        // Bosses
        this.addRoute('/bosses', 'bosses');
        this.addRoute('/bosses/:slug', 'boss-detail');
        
        // Progression
        this.addRoute('/progression', 'progression');
        this.addRoute('/tiers', 'tiers');
        this.addRoute('/tiers/:tier', 'tier-detail');
        
        // Calculators
        this.addRoute('/calculators/taming', 'taming-calculator-page');
        this.addRoute('/calculators/breeding', 'breeding-calculator');
        this.addRoute('/calculators/stats', 'stats-calculator');
        this.addRoute('/calculators/crafting', 'crafting-calculator');
        
        // Community
        this.addRoute('/tips', 'tips');
        this.addRoute('/tips/:category', 'tips-category');
        
        // 404 page
        this.addRoute('/404', '404');
    },

    // Add a route to the router
    addRoute(path, handler) {
        this.routes.set(path, handler);
    },

    // Navigate to a new route
    navigate(path, data = {}) {
        // Update browser history
        history.pushState(data, '', path);
        
        // Handle the new route
        this.handleRoute();
    },

    // Handle current route
    async handleRoute() {
        const path = window.location.pathname;
        const route = this.matchRoute(path);
        
        if (route) {
            await this.loadRoute(route.handler, route.params);
        } else {
            await this.loadRoute(this.notFoundRoute);
        }
    },

    // Match path to route
    matchRoute(path) {
        // Exact match first
        if (this.routes.has(path)) {
            return {
                handler: this.routes.get(path),
                params: {}
            };
        }

        // Pattern matching for dynamic routes
        for (const [routePath, handler] of this.routes) {
            const match = this.matchPattern(routePath, path);
            if (match) {
                return {
                    handler,
                    params: match.params
                };
            }
        }

        return null;
    },

    // Match route pattern with path
    matchPattern(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(':')) {
                // Dynamic parameter
                const paramName = patternPart.substring(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                // No match
                return null;
            }
        }

        return { params };
    },

    // Load route content
    async loadRoute(handler, params = {}) {
        try {
            Utils.performance.mark(`route-${handler}-start`);
            
            // Show loading state
            this.showLoadingState();
            
            // Update current route
            this.currentRoute = { handler, params };
            
            // Load page content
            const content = await this.getPageContent(handler, params);
            
            // Render content
            this.renderContent(content);
            
            // Update page metadata
            this.updatePageMetadata(handler, params);
            
            // Update navigation
            this.updateNavigation(handler);
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Mark route loading complete
            Utils.performance.mark(`route-${handler}-end`);
            Utils.performance.measure(`route-${handler}`, `route-${handler}-start`, `route-${handler}-end`);
            
        } catch (error) {
            console.error('Route loading failed:', error);
            this.showErrorState(error);
        }
    },

    // Get page content based on handler
    async getPageContent(handler, params) {
        const appContent = document.getElementById('app-content');
        
        switch (handler) {
            case 'home':
                return await this.getHomePage();
            case 'creatures':
                return await this.getCreaturesPage();
            case 'creature-detail':
                return await this.getCreatureDetailPage(params.slug);
            case 'taming-calculator':
                return await this.getTamingCalculatorPage(params.slug);
            case 'items':
                return await this.getItemsPage();
            case 'item-detail':
                return await this.getItemDetailPage(params.slug);
            case 'structures':
                return await this.getStructuresPage();
            case 'resources':
                return await this.getResourcesPage();
            case 'bosses':
                return await this.getBossesPage();
            case 'boss-detail':
                return await this.getBossDetailPage(params.slug);
            case 'progression':
                return await this.getProgressionPage();
            case 'calculators':
                return await this.getCalculatorsPage();
            case 'tips':
                return await this.getTipsPage();
            case '404':
                return this.get404Page();
            default:
                throw new Error(`Unknown route handler: ${handler}`);
        }
    },

    // Render content to DOM
    renderContent(content) {
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = content;
            
            // Initialize page-specific components
            this.initializePageComponents();
        }
    },

    // Show loading state
    showLoadingState() {
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = `
                <div class="container">
                    <div class="text-center p-xl">
                        <div class="skeleton" style="height: 400px; margin-bottom: var(--spacing-lg);"></div>
                        <div class="skeleton" style="height: 200px; margin-bottom: var(--spacing-lg);"></div>
                        <div class="grid grid-cols-3 gap-lg">
                            <div class="skeleton" style="height: 250px;"></div>
                            <div class="skeleton" style="height: 250px;"></div>
                            <div class="skeleton" style="height: 250px;"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Show error state
    showErrorState(error) {
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = `
                <div class="container">
                    <div class="text-center p-xl">
                        <h1 class="text-primary mb-lg">Something went wrong</h1>
                        <p class="text-secondary mb-xl">${error.message}</p>
                        <button class="btn btn-primary" onclick="window.Router.navigate('/')">
                            Go Home
                        </button>
                    </div>
                </div>
            `;
        }
    },

    // Update page metadata
    updatePageMetadata(handler, params) {
        const titles = {
            'home': 'Primal Fear Dex - ARK Survival Evolved Companion',
            'creatures': 'Creatures - Primal Fear Dex',
            'creature-detail': 'Creature Details - Primal Fear Dex',
            'items': 'Items - Primal Fear Dex',
            'structures': 'Structures - Primal Fear Dex',
            'resources': 'Resources - Primal Fear Dex',
            'bosses': 'Bosses - Primal Fear Dex',
            'progression': 'Progression - Primal Fear Dex',
            'calculators': 'Calculators - Primal Fear Dex',
            'tips': 'Tips & Strategies - Primal Fear Dex'
        };

        document.title = titles[handler] || 'Primal Fear Dex';
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = this.getPageDescription(handler, params);
        }
    },

    // Get page description
    getPageDescription(handler, params) {
        const descriptions = {
            'home': 'The ultimate companion app for Primal Fear mod in ARK: Survival Evolved. Taming calculators, creature stats, item database, and more.',
            'creatures': 'Complete list of all creatures in Primal Fear mod. Filter by tier, category, diet, and more.',
            'items': 'Comprehensive database of all items in Primal Fear mod including weapons, armor, tools, and consumables.',
            'structures': 'All building structures in Primal Fear mod with crafting requirements and tier information.',
            'resources': 'Complete resource guide for Primal Fear mod including gathering efficiency and drop rates.',
            'bosses': 'Information about all bosses in Primal Fear mod including requirements, strategies, and drops.',
            'progression': 'Complete progression guide for Primal Fear mod showing tier system and evolution path.',
            'calculators': 'Advanced calculators for taming, breeding, stats, and crafting in Primal Fear mod.',
            'tips': 'Community tips and strategies for Primal Fear mod submitted by experienced players.'
        };

        return descriptions[handler] || 'Primal Fear Dex - ARK Survival Evolved Companion';
    },

    // Update navigation active state
    updateNavigation(handler) {
        // Remove all active classes
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page
        const activeLinks = document.querySelectorAll(`[data-route="${handler}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
        });
    },

    // Initialize page-specific components
    initializePageComponents() {
        // Initialize search component
        if (window.SearchComponent) {
            SearchComponent.init();
        }

        // Initialize filters component
        if (window.FiltersComponent) {
            FiltersComponent.init();
        }

        // Initialize calculators
        if (window.CalculatorComponent) {
            CalculatorComponent.init();
        }

        // Initialize tabs
        this.initializeTabs();
    },

    // Initialize tab functionality
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active classes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active classes
                button.classList.add('active');
                const targetContent = document.querySelector(`[data-content="${targetTab}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    },

    // Page content generators (simplified versions)
    async getHomePage() {
        return `
            <div class="home-page">
                <div class="container">
                    <section class="hero-section">
                        <h1 class="hero-title">Primal Fear Dex</h1>
                        <p class="hero-subtitle">The Ultimate Companion for Primal Fear Mod</p>
                        <div class="hero-stats">
                            <div class="stat-item">
                                <div class="stat-number">500+</div>
                                <div class="stat-label">Creatures</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">1000+</div>
                                <div class="stat-label">Items</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">50+</div>
                                <div class="stat-label">Bosses</div>
                            </div>
                        </div>
                    </section>
                    
                    <section class="quick-access-grid">
                        <div class="quick-access-card">
                            <div class="quick-access-icon">🦕</div>
                            <h3 class="quick-access-title">Creatures</h3>
                            <p class="quick-access-description">Complete database of all Primal Fear creatures with stats, taming info, and more.</p>
                            <a href="/creatures" class="btn btn-primary">Explore Creatures</a>
                        </div>
                        
                        <div class="quick-access-card">
                            <div class="quick-access-icon">⚔️</div>
                            <h3 class="quick-access-title">Items</h3>
                            <p class="quick-access-description">Weapons, armor, tools, and consumables with crafting requirements.</p>
                            <a href="/items" class="btn btn-primary">Browse Items</a>
                        </div>
                        
                        <div class="quick-access-card">
                            <div class="quick-access-icon">🧮</div>
                            <h3 class="quick-access-title">Calculators</h3>
                            <p class="quick-access-description">Advanced calculators for taming, breeding, stats, and more.</p>
                            <a href="/calculators/taming" class="btn btn-primary">Use Calculators</a>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    async getCreaturesPage() {
        return `
            <div class="creatures-page">
                <div class="container">
                    <div class="page-header">
                        <h1 class="page-title">Creatures</h1>
                        <p class="page-description">Complete list of all Primal Fear creatures</p>
                    </div>
                    
                    <div class="content-layout">
                        <aside class="filters-sidebar">
                            <div class="filters-header">
                                <span>Filters</span>
                                <button class="btn btn-outline btn-sm">Clear</button>
                            </div>
                            
                            <div class="filter-section">
                                <h4 class="filter-title">Tier</h4>
                                <div class="filter-options">
                                    <label class="filter-option">
                                        <input type="checkbox" class="filter-checkbox" value="Alpha">
                                        <span class="filter-label">Alpha</span>
                                    </label>
                                    <label class="filter-option">
                                        <input type="checkbox" class="filter-checkbox" value="Beta">
                                        <span class="filter-label">Beta</span>
                                    </label>
                                    <label class="filter-option">
                                        <input type="checkbox" class="filter-checkbox" value="Gamma">
                                        <span class="filter-label">Gamma</span>
                                    </label>
                                </div>
                            </div>
                        </aside>
                        
                        <main>
                            <div class="creatures-grid" id="creatures-grid">
                                <!-- Creature cards will be loaded here -->
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;
    },

    async getCreatureDetailPage(slug) {
        return `
            <div class="creature-detail">
                <div class="container">
                    <div class="creature-header">
                        <div class="creature-main-image">
                            <img src="/assets/images/creatures/${slug}.jpg" alt="${slug}" onerror="this.src='/assets/images/placeholder.png'">
                        </div>
                        <div class="creature-info">
                            <h1 class="creature-name">${slug}</h1>
                            <div class="creature-meta">
                                <span class="tag tier-alpha">Alpha</span>
                                <span class="tag">Dinosaur</span>
                                <span class="tag">Carnivore</span>
                            </div>
                            <p class="creature-description">Detailed information about ${slug} creature...</p>
                            <div class="creature-actions">
                                <a href="/taming/${slug}" class="btn btn-primary">Taming Calculator</a>
                                <a href="/calculators/stats/${slug}" class="btn btn-secondary">Stats Calculator</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tabs-container">
                        <div class="tabs-navigation">
                            <button class="tab-button active" data-tab="overview">Overview</button>
                            <button class="tab-button" data-tab="stats">Stats</button>
                            <button class="tab-button" data-tab="taming">Taming</button>
                            <button class="tab-button" data-tab="breeding">Breeding</button>
                            <button class="tab-button" data-tab="drops">Drops</button>
                        </div>
                        
                        <div class="tab-content active" data-content="overview">
                            <h3>Overview</h3>
                            <p>Creature overview information...</p>
                        </div>
                        
                        <div class="tab-content" data-content="stats">
                            <h3>Base Stats</h3>
                            <table class="stats-table">
                                <thead>
                                    <tr>
                                        <th>Stat</th>
                                        <th>Base</th>
                                        <th>Per Level</th>
                                        <th>Tamed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Health</td>
                                        <td>1500</td>
                                        <td>300</td>
                                        <td>10.8%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async getItemsPage() {
        return `
            <div class="items-page">
                <div class="container">
                    <div class="page-header">
                        <h1 class="page-title">Items</h1>
                        <p class="page-description">Complete database of Primal Fear items</p>
                    </div>
                    
                    <div class="items-grid" id="items-grid">
                        <!-- Item cards will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    },

    async get404Page() {
        return `
            <div class="container">
                <div class="text-center p-xl">
                    <h1 class="text-primary mb-lg">404 - Page Not Found</h1>
                    <p class="text-secondary mb-xl">The page you're looking for doesn't exist.</p>
                    <button class="btn btn-primary" onclick="window.Router.navigate('/')">
                        Go Home
                    </button>
                </div>
            </div>
        `;
    }
};
