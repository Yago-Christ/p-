// Main Application Controller
window.PrimalFearDex = {
    initialized: false,
    currentRoute: null,
    
    // Initialize application
    async init() {
        try {
            Utils.performance.mark('app-init-start');
            
            console.log('Initializing Primal Fear Dex...');
            
            // Initialize components
            await this.initializeComponents();
            
            // Initialize router
            window.Router.init();
            
            // Load initial data
            await DataLoader.init();
            
            // Setup global event listeners
            this.setupEventListeners();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Mark as initialized
            this.initialized = true;
            
            // Mark initialization complete
            Utils.performance.mark('app-init-end');
            Utils.performance.measure('app-init', 'app-init-start', 'app-init-end');
            
            console.log('Primal Fear Dex initialized successfully!');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize Primal Fear Dex:', error);
            this.handleInitializationError(error);
        }
    },

    // Initialize all components
    async initializeComponents() {
        // Initialize header
        HeaderComponent.init();
        
        // Initialize footer
        if (window.FooterComponent) {
            FooterComponent.init();
        }
        
        // Initialize other components as needed
        if (window.SearchComponent) {
            SearchComponent.init();
        }
        
        if (window.FiltersComponent) {
            FiltersComponent.init();
        }
        
        if (window.CalculatorComponent) {
            CalculatorComponent.init();
        }
    },

    // Setup global event listeners
    setupEventListeners() {
        // Handle route changes
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            Utils.showNotification('Connection restored', 'success');
            this.syncData();
        });

        window.addEventListener('offline', () => {
            Utils.showNotification('Connection lost - using cached data', 'warning');
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshDataIfNeeded();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle error events
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });
    },

    // Setup error handling
    setupErrorHandling() {
        // Override console methods for better error tracking
        const originalError = console.error;
        console.error = function(...args) {
            originalError.apply(console, args);
            // Could send to error tracking service here
        };
    },

    // Handle route changes
    handleRouteChange() {
        const currentPath = window.location.pathname;
        this.currentRoute = currentPath;
        
        // Update header active state
        if (window.HeaderComponent) {
            HeaderComponent.updateActiveState(this.getRouteHandler(currentPath));
        }
        
        // Track page view (could send to analytics)
        this.trackPageView(currentPath);
    },

    // Get route handler from path
    getRouteHandler(path) {
        const routeMap = {
            '/': 'home',
            '/creatures': 'creatures',
            '/items': 'items',
            '/structures': 'structures',
            '/resources': 'resources',
            '/bosses': 'bosses',
            '/progression': 'progression',
            '/calculators': 'calculators',
            '/tips': 'tips'
        };
        
        // Check for exact matches first
        if (routeMap[path]) {
            return routeMap[path];
        }
        
        // Check for pattern matches
        if (path.startsWith('/creatures/')) return 'creature-detail';
        if (path.startsWith('/items/')) return 'item-detail';
        if (path.startsWith('/structures/')) return 'structure-detail';
        if (path.startsWith('/resources/')) return 'resource-detail';
        if (path.startsWith('/bosses/')) return 'boss-detail';
        
        return 'unknown';
    },

    // Track page view
    trackPageView(path) {
        console.log(`Page view: ${path}`);
        // Could integrate with analytics service here
    },

    // Sync data when connection restored
    async syncData() {
        try {
            const cacheStatus = DataLoader.getCacheStatus();
            const staleData = Object.keys(cacheStatus).filter(type => !cacheStatus[type].fresh);
            
            if (staleData.length > 0) {
                console.log('Syncing stale data:', staleData);
                
                for (const type of staleData) {
                    await DataLoader.refreshData(type);
                }
                
                Utils.showNotification('Data synchronized successfully', 'success');
            }
        } catch (error) {
            console.error('Data sync failed:', error);
            Utils.showNotification('Failed to sync data', 'error');
        }
    },

    // Refresh data if needed
    async refreshDataIfNeeded() {
        const lastRefresh = Utils.storage.get('lastDataRefresh', 0);
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        const now = Date.now();
        
        if (now - lastRefresh > oneHour) {
            try {
                await this.syncData();
                Utils.storage.set('lastDataRefresh', now);
            } catch (error) {
                console.error('Failed to refresh data:', error);
            }
        }
    },

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.focusSearch();
        }

        // Escape to close modals/dropdowns
        if (e.key === 'Escape') {
            this.closeModals();
        }

        // Home key to go to homepage
        if (e.key === 'Home' && e.ctrlKey) {
            e.preventDefault();
            window.Router.navigate('/');
        }
    },

    // Focus search input
    focusSearch() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    },

    // Close modals and dropdowns
    closeModals() {
        // Close search results
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }

        // Close dropdowns
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
        });
    },

    // Handle global errors
    handleGlobalError(error) {
        console.error('Global error handled:', error);
        
        // Show user-friendly error message
        if (this.initialized) {
            Utils.showNotification('An error occurred. Please try again.', 'error');
        }
        
        // Could send error to tracking service
        this.reportError(error);
    },

    // Report errors (could integrate with error tracking service)
    reportError(error) {
        const errorReport = {
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        console.log('Error report:', errorReport);
        // Could send to error tracking service here
    },

    // Handle initialization errors
    handleInitializationError(error) {
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = `
                <div class="container">
                    <div class="text-center p-xl">
                        <h1 class="text-primary mb-lg">Initialization Failed</h1>
                        <p class="text-secondary mb-lg">
                            Failed to initialize Primal Fear Dex. Please check your internet connection and refresh the page.
                        </p>
                        <details class="text-left mb-xl">
                            <summary class="btn btn-outline">Error Details</summary>
                            <pre class="bg-darker p-md rounded mt-md text-sm">
${error.message}
${error.stack}
                            </pre>
                        </details>
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    },

    // Show welcome message
    showWelcomeMessage() {
        const hasVisited = Utils.storage.get('hasVisited', false);
        
        if (!hasVisited) {
            setTimeout(() => {
                Utils.showNotification('Welcome to Primal Fear Dex! Use Ctrl+K to search quickly.', 'info');
                Utils.storage.set('hasVisited', true);
            }, 2000);
        }
    },

    // Get application status
    getStatus() {
        return {
            initialized: this.initialized,
            currentRoute: this.currentRoute,
            cacheStatus: DataLoader.getCacheStatus(),
            isOnline: navigator.onLine,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    },

    // Export application data (for debugging)
    exportData() {
        const data = {
            status: this.getStatus(),
            cache: {},
            storage: {}
        };

        // Export cached data
        Object.keys(DataLoader.cache).forEach(type => {
            data.cache[type] = DataLoader.exportData(type);
        });

        // Export storage data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('data_') || key.startsWith('pref_')) {
                data.storage[key] = Utils.storage.get(key);
            }
        });

        return data;
    },

    // Reset application data
    resetData() {
        if (confirm('Are you sure you want to reset all cached data? This will require an internet connection to reload.')) {
            DataLoader.clearCache();
            Utils.storage.clear();
            window.location.reload();
        }
    },

    // Get user preferences
    getPreferences() {
        return Utils.storage.get('preferences', {
            theme: 'dark',
            language: 'en',
            autoSync: true,
            notifications: true
        });
    },

    // Update user preferences
    updatePreferences(preferences) {
        const currentPrefs = this.getPreferences();
        const updatedPrefs = { ...currentPrefs, ...preferences };
        Utils.storage.set('preferences', updatedPrefs);
        
        // Apply preferences
        this.applyPreferences(updatedPrefs);
    },

    // Apply user preferences
    applyPreferences(preferences) {
        // Apply theme
        if (preferences.theme) {
            document.body.className = `theme-${preferences.theme}`;
        }

        // Apply language
        if (preferences.language) {
            document.documentElement.lang = preferences.language;
        }
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PrimalFearDex.init();
});

// Make app available globally for debugging
window.App = PrimalFearDex;
