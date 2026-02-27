// src/core/app.js - Orquestrador Principal da Aplicação
class PrimalFearApp {
  constructor() {
    this.store = null;
    this.router = null;
    this.api = null;
    this.ui = null;
    this.errorBoundary = null;
    this.performanceMonitor = null;
    this.initializationTimeout = 15000; // 15 segundos
    this.components = new Map();
    
    this.setupErrorHandling();
  }

  // Inicialização principal
  async init() {
    const startTime = performance.now();
    let initTimeout;

    try {
      // 1. Timeout para inicialização
      initTimeout = setTimeout(() => {
        console.warn('⚠️ Initialization timeout, forcing fallback mode');
        this.forceFallbackMode();
      }, this.initializationTimeout);

      // 2. Estado inicial
      this.updateInitProgress('initializing', 'Setting up core systems...');
      
      // 3. Inicialização dos sistemas core
      await this.initializeCore();
      
      // 4. Setup de componentes
      await this.initializeComponents();
      
      // 5. Setup de eventos
      this.setupEventListeners();
      
      // 6. Pré-carregamento de dados essenciais
      await this.preloadEssentialData();
      
      // 7. Setup de rotas
      await this.setupRoutes();
      
      // 8. Renderização inicial
      await this.performInitialRender();
      
      // 9. Performance monitoring
      this.startPerformanceMonitoring();
      
      // 10. Estado pronto
      clearTimeout(initTimeout);
      
      const duration = performance.now() - startTime;
      console.log(`✅ Primal Fear App initialized in ${duration.toFixed(2)}ms`);
      
      this.store.dispatch('app/setReady', true);
      this.updateInitProgress('ready', 'Application ready!');
      
      // Hide loading screen
      this.hideLoadingScreen();
      
      return true;
      
    } catch (error) {
      clearTimeout(initTimeout);
      console.error('❌ Critical initialization error:', error);
      await this.handleCriticalError(error);
      return false;
    }
  }

  // Inicialização dos sistemas core
  async initializeCore() {
    this.updateInitProgress('core', 'Initializing core systems...');
    
    // Store global
    this.store = new Store();
    this.setupStoreMiddleware();
    
    // API service
    this.api = new ApiService();
    
    // Router
    this.router = new Router(this.store);
    this.router.apiService = this.api; // Inject API service
    
    // Error boundary
    this.errorBoundary = new ErrorBoundary();
    
    // Performance monitor
    this.performanceMonitor = new PerformanceMonitor();
    
    // UI Manager
    this.ui = new UIManager(this.store);
    
    console.log('✅ Core systems initialized');
  }

  // Middleware do store
  setupStoreMiddleware() {
    // Performance logging middleware
    this.store.use((action, payload, state) => {
      const start = performance.now();
      return { action, payload };
    });
    
    // Error tracking middleware
    this.store.use((action, payload, state) => {
      try {
        return { action, payload };
      } catch (error) {
        this.errorBoundary.handle(error, 'store_middleware');
        return null;
      }
    });
  }

  // Inicialização de componentes
  async initializeComponents() {
    this.updateInitProgress('components', 'Loading components...');
    
    try {
      // Header
      const headerContainer = document.getElementById('header-component');
      if (headerContainer) {
        const HeaderComponent = window.HeaderComponent;
        if (HeaderComponent) {
          this.components.set('header', new HeaderComponent(headerContainer, this.store));
        }
      }

      // Footer
      const footerContainer = document.getElementById('footer-component');
      if (footerContainer) {
        const FooterComponent = window.FooterComponent;
        if (FooterComponent) {
          this.components.set('footer', new FooterComponent(footerContainer, this.store));
        }
      }

      // Sidebar (se existir)
      const sidebarContainer = document.getElementById('sidebar-component');
      if (sidebarContainer) {
        const SidebarComponent = window.SidebarComponent;
        if (SidebarComponent) {
          this.components.set('sidebar', new SidebarComponent(sidebarContainer, this.store));
        }
      }

      console.log('✅ Components initialized');
      
    } catch (error) {
      console.warn('⚠️ Component initialization failed:', error);
      this.store.dispatch('app/setFallbackMode', true);
    }
  }

  // Setup de eventos
  setupEventListeners() {
    this.updateInitProgress('events', 'Setting up event listeners...');
    
    // Window events
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Error events
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    // Store events
    this.store.subscribe(this.handleStateChange.bind(this));
    
    console.log('✅ Event listeners setup');
  }

  // Pré-carregamento de dados essenciais
  async preloadEssentialData() {
    this.updateInitProgress('data', 'Loading essential data...');
    
    const essential = ['creatures', 'items'];
    
    try {
      // Health check da API
      const health = await this.api.healthCheck();
      console.log('🏥 API Health:', health);
      
      // Parallel loading com error handling
      const results = await Promise.allSettled(
        essential.map(type => this.api.getData(type))
      );

      // Process results com fallbacks
      results.forEach((result, index) => {
        const type = essential[index];
        
        if (result.status === 'fulfilled') {
          this.store.dispatch(`data/set${type.charAt(0).toUpperCase() + type.slice(1)}`, { 
            items: result.value 
          });
          console.log(`✅ Loaded ${type}: ${result.value.length} items`);
        } else {
          console.warn(`⚠️ Failed to load ${type}, using fallback`);
          const fallback = this.api.getFallbackData(type);
          this.store.dispatch(`data/set${type.charAt(0).toUpperCase() + type.slice(1)}`, { 
            items: fallback 
          });
        }
      });
      
      console.log('✅ Essential data loaded');
      
    } catch (error) {
      console.error('❌ Essential data loading failed:', error);
      throw error;
    }
  }

  // Setup de rotas
  async setupRoutes() {
    this.updateInitProgress('routes', 'Setting up routes...');
    
    try {
      await this.router.init();
      console.log('✅ Routes setup complete');
    } catch (error) {
      console.error('❌ Routes setup failed:', error);
      throw error;
    }
  }

  // Renderização inicial
  async performInitialRender() {
    this.updateInitProgress('render', 'Performing initial render...');
    
    try {
      // Renderiza componentes
      for (const [name, component] of this.components) {
        if (component.render && typeof component.render === 'function') {
          await component.render();
        }
      }
      
      console.log('✅ Initial render complete');
    } catch (error) {
      console.error('❌ Initial render failed:', error);
      throw error;
    }
  }

  // Performance monitoring
  startPerformanceMonitoring() {
    this.updateInitProgress('monitoring', 'Starting performance monitoring...');
    
    try {
      this.performanceMonitor.start();
      console.log('✅ Performance monitoring started');
    } catch (error) {
      console.warn('⚠️ Performance monitoring failed:', error);
    }
  }

  // Handlers de eventos
  handleStateChange(state) {
    // Re-render components quando estado muda
    for (const [name, component] of this.components) {
      if (component.onStateChange && typeof component.onStateChange === 'function') {
        try {
          component.onStateChange(state);
        } catch (error) {
          console.warn(`Component ${name} state change failed:`, error);
        }
      }
    }
  }

  handleResize() {
    const isMobile = window.innerWidth <= 768;
    this.store.dispatch('ui/setMobileMode', isMobile);
  }

  handleOnline() {
    console.log('🌐 Back online');
    this.store.dispatch('app/setOnline', true);
    // Tentar recarregar dados
    this.preloadEssentialData();
  }

  handleOffline() {
    console.log('📱 Offline mode');
    this.store.dispatch('app/setOnline', false);
  }

  handleBeforeUnload(e) {
    // Cleanup se necessário
    this.performanceMonitor?.stop();
  }

  handleGlobalError(e) {
    this.errorBoundary.handle(e.error, 'global');
    console.error('Global error:', e.error);
  }

  handleUnhandledRejection(e) {
    this.errorBoundary.handle(e.reason, 'unhandled_rejection');
    console.error('Unhandled rejection:', e.reason);
  }

  // Error handling
  async handleCriticalError(error) {
    console.error('🚨 Critical error, entering fallback mode:', error);
    
    this.store.dispatch('app/setError', error.message);
    this.store.dispatch('app/setFallbackMode', true);
    
    // Força modo fallback
    await this.forceFallbackMode();
  }

  async forceFallbackMode() {
    console.log('🔄 Entering fallback mode...');
    
    try {
      // Carrega dados fallback
      const fallbackData = {
        creatures: this.api.getFallbackData('creatures'),
        items: this.api.getFallbackData('items'),
        structures: this.api.getFallbackData('structures'),
        resources: this.api.getFallbackData('resources'),
        bosses: this.api.getFallbackData('bosses'),
        progression: this.api.getFallbackData('progression')
      };

      // Atualiza store com fallbacks
      for (const [type, data] of Object.entries(fallbackData)) {
        this.store.dispatch(`data/set${type.charAt(0).toUpperCase() + type.slice(1)}`, { 
          items: data 
        });
      }

      // Renderiza UI mínima
      this.renderMinimalUI();
      
      // Marca como pronto em modo fallback
      this.store.dispatch('app/setReady', true);
      this.store.dispatch('app/setFallbackMode', true);
      
      this.hideLoadingScreen();
      
      console.log('✅ Fallback mode activated');
      
    } catch (error) {
      console.error('❌ Even fallback mode failed:', error);
      this.showCriticalErrorScreen(error);
    }
  }

  renderMinimalUI() {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    appContent.innerHTML = `
      <div class="fallback-ui">
        <div class="container">
          <div class="text-center p-xl">
            <h1 class="text-warning mb-lg">🦕 Primal Fear Dex</h1>
            <p class="text-secondary mb-xl">
              Modo de emergência ativado. Funcionalidade limitada disponível.
            </p>
            <div class="alert alert-warning mb-xl">
              <h3>⚠️ Modo Fallback</h3>
              <p>O sistema está operando com dados limitados devido a falhas na conexão.</p>
            </div>
            <div class="fallback-actions">
              <button class="btn btn-primary" onclick="location.reload()">
                🔄 Tentar Novamente
              </button>
              <button class="btn btn-secondary" onclick="window.PrimalFearApp?.showDebugInfo()">
                🐛 Debug Info
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showCriticalErrorScreen(error) {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    appContent.innerHTML = `
      <div class="critical-error">
        <div class="container">
          <div class="text-center p-xl">
            <h1 class="text-danger mb-lg">🚨 Erro Crítico</h1>
            <p class="text-secondary mb-xl">
              O aplicativo não pôde ser inicializado.
            </p>
            <div class="error-details mb-xl">
              <h3>Detalhes do Erro:</h3>
              <pre class="text-left bg-dark p-md rounded">${error.message}</pre>
            </div>
            <div class="error-actions">
              <button class="btn btn-primary" onclick="location.reload()">
                🔄 Recarregar Página
              </button>
              <button class="btn btn-secondary" onclick="window.PrimalFearApp?.reportError()">
                📝 Reportar Erro
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // UI helpers
  updateInitProgress(stage, message) {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      const progressElement = loadingState.querySelector('.progress-fill');
      const messageElement = loadingState.querySelector('p');
      
      if (progressElement) {
        const progress = this.getProgressPercentage(stage);
        progressElement.style.width = `${progress}%`;
      }
      
      if (messageElement) {
        messageElement.textContent = message;
      }
    }
    
    console.log(`🔄 ${stage}: ${message}`);
  }

  getProgressPercentage(stage) {
    const stages = {
      'initializing': 10,
      'core': 25,
      'components': 40,
      'events': 50,
      'data': 70,
      'routes': 85,
      'render': 95,
      'monitoring': 100,
      'ready': 100
    };
    
    return stages[stage] || 0;
  }

  hideLoadingScreen() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      loadingState.style.opacity = '0';
      setTimeout(() => {
        loadingState.style.display = 'none';
      }, 500);
    }
  }

  // Debug utilities
  showDebugInfo() {
    const info = {
      app: this.store?.getApp(),
      ui: this.store?.getUI(),
      cache: this.api?.getCacheInfo(),
      errors: this.errorBoundary?.getErrors(),
      components: Array.from(this.components.keys()),
      timestamp: new Date().toISOString()
    };
    
    console.group('🐛 Debug Info');
    console.log('State:', info);
    console.groupEnd();
    
    alert('Debug info logged to console. Press F12 to view.');
  }

  reportError() {
    const errors = this.errorBoundary?.getErrors() || [];
    const report = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      errors: errors.slice(-5) // Últimos 5 erros
    };
    
    console.log('Error Report:', report);
    alert('Error report logged to console. Copy and send to support.');
  }

  // Getters públicos
  getStore() {
    return this.store;
  }
  
  getRouter() {
    return this.router;
  }
  
  getApi() {
    return this.api;
  }
  
  getErrorBoundary() {
    return this.errorBoundary;
  }
  
  getPerformanceMonitor() {
    return this.performanceMonitor;
  }
}

// Performance Monitor simples
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.startTime = null;
    this.observers = [];
  }

  start() {
    this.startTime = performance.now();
    
    // Observer de performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.push({
            type: entry.entryType,
            name: entry.name,
            duration: entry.duration,
            timestamp: entry.startTime
          });
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      this.observers.push(observer);
    }
  }

  stop() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  getMetrics() {
    return {
      total_time: performance.now() - this.startTime,
      metrics: this.metrics,
      memory_usage: this.getMemoryUsage()
    };
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// UI Manager simples
class UIManager {
  constructor(store) {
    this.store = store;
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    };
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width <= this.breakpoints.mobile) return 'mobile';
    if (width <= this.breakpoints.tablet) return 'tablet';
    return 'desktop';
  }

  isMobile() {
    return this.getDeviceType() === 'mobile';
  }

  isTablet() {
    return this.getDeviceType() === 'tablet';
  }

  isDesktop() {
    return this.getDeviceType() === 'desktop';
  }
}

// Export global
window.PrimalFearApp = PrimalFearApp;
window.PerformanceMonitor = PerformanceMonitor;
window.UIManager = UIManager;
