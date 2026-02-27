// src/core/router.js - SPA Routing Robusto
class Router {
  constructor(store) {
    this.store = store;
    this.routes = new Map();
    this.currentRoute = null;
    this.errorBoundary = new ErrorBoundary();
    this.loadingStates = new Map();
    this.defaultRoute = 'home';
    this.notFoundRoute = '404';
    
    // Configuração inicial
    this.setupEventListeners();
    this.setupDefaultRoutes();
  }

  // Registro de rotas
  register(path, config) {
    this.routes.set(path, {
      component: config.component,
      title: config.title,
      description: config.description,
      requiresAuth: config.requiresAuth || false,
      preloadData: config.preloadData || [],
      meta: config.meta || {},
      ...config
    });
  }

  // Navegação principal
  async navigate(path, params = {}, options = {}) {
    const startTime = performance.now();
    
    try {
      // 1. Validação de rota
      const route = this.validateRoute(path);
      if (!route) {
        throw new Error(`Route not found: ${path}`);
      }

      // 2. Loading state
      this.store.dispatch('ui/setLoading', true);
      this.store.dispatch('ui/setCurrentView', path);

      // 3. Pre-fetch de dados
      if (route.preloadData && route.preloadData.length > 0) {
        await this.preFetchData(route.preloadData);
      }

      // 4. Middleware de navegação
      if (route.beforeNavigate) {
        const canNavigate = await route.beforeNavigate(params);
        if (!canNavigate) {
          throw new Error('Navigation blocked by beforeNavigate hook');
        }
      }

      // 5. Renderização do componente
      await this.renderComponent(route, params);

      // 6. Atualização de metadados
      this.updatePageMetadata(route, params);

      // 7. Atualização de estado
      this.currentRoute = { path, params, route, timestamp: Date.now() };
      this.store.dispatch('router/setCurrentRoute', this.currentRoute);

      // 8. Scroll behavior
      if (options.scroll !== false) {
        this.handleScroll(options.scroll);
      }

      // 9. Performance tracking
      const duration = performance.now() - startTime;
      console.log(`Route ${path} loaded in ${duration.toFixed(2)}ms`);

      // 10. After navigate hook
      if (route.afterNavigate) {
        await route.afterNavigate(params);
      }

    } catch (error) {
      console.error('Navigation error:', error);
      await this.handleNavigationError(error, path, params);
    } finally {
      this.store.dispatch('ui/setLoading', false);
    }
  }

  // Validação de rota
  validateRoute(path) {
    // Match exato
    if (this.routes.has(path)) {
      return this.routes.get(path);
    }

    // Match com parâmetros
    for (const [routePath, config] of this.routes) {
      if (this.pathMatches(routePath, path)) {
        return config;
      }
    }

    return null;
  }

  // Path matching com parâmetros
  pathMatches(routePath, actualPath) {
    const routeParts = routePath.split('/').filter(Boolean);
    const actualParts = actualPath.split('/').filter(Boolean);

    if (routeParts.length !== actualParts.length) {
      return false;
    }

    return routeParts.every((part, index) => {
      return part.startsWith(':') || part === actualParts[index];
    });
  }

  // Extração de parâmetros da URL
  extractParams(routePath, actualPath) {
    const routeParts = routePath.split('/').filter(Boolean);
    const actualParts = actualPath.split('/').filter(Boolean);
    const params = {};

    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = actualParts[index];
      }
    });

    return params;
  }

  // Pre-fetch de dados
  async preFetchData(dataTypes) {
    const promises = dataTypes.map(async (dataType) => {
      try {
        const data = await this.apiService.getData(dataType);
        this.store.dispatch(`data/set${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`, { items: data });
      } catch (error) {
        console.warn(`Failed to preload ${dataType}:`, error);
        this.store.dispatch(`data/setError`, { type: dataType, error: error.message });
      }
    });

    await Promise.allSettled(promises);
  }

  // Renderização de componente
  async renderComponent(route, params) {
    const container = document.getElementById('app-content');
    
    if (!container) {
      throw new Error('App content container not found');
    }

    try {
      // Loading state
      this.showLoadingState(container, route);

      // Renderização do componente
      if (typeof route.component === 'function') {
        const component = new route.component(container, this.store, params);
        await component.render();
      } else if (typeof route.component === 'string') {
        // Component string-based
        container.innerHTML = route.component;
      } else {
        throw new Error('Invalid component configuration');
      }

      // Hide loading
      this.hideLoadingState(container);

    } catch (error) {
      console.error('Component render error:', error);
      this.showComponentError(container, error, route);
    }
  }

  // Loading states
  showLoadingState(container, route) {
    const loadingHtml = `
      <div class="route-loading" data-route="${route.path}">
        <div class="loading-spinner"></div>
        <p>Carregando ${route.title || 'página'}...</p>
      </div>
    `;
    
    container.innerHTML = loadingHtml;
  }

  hideLoadingState(container) {
    const loadingElement = container.querySelector('.route-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  // Error handling
  async handleNavigationError(error, path, params) {
    this.errorBoundary.handle(error, 'navigation');
    
    // Tenta rota 404
    if (this.routes.has(this.notFoundRoute)) {
      await this.navigate(this.notFoundRoute, { originalPath: path, error: error.message });
    } else {
      // Fallback para página de erro genérica
      this.showGenericError(error);
    }
  }

  showComponentError(container, error, route) {
    container.innerHTML = `
      <div class="component-error">
        <h2>Erro ao carregar ${route.title || 'componente'}</h2>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">
          Recarregar Página
        </button>
      </div>
    `;
  }

  showGenericError(error) {
    const container = document.getElementById('app-content');
    if (container) {
      container.innerHTML = `
        <div class="generic-error">
          <h2>Algo deu errado</h2>
          <p>${error.message}</p>
          <button class="btn btn-primary" onclick="location.reload()">
            Recarregar Página
          </button>
        </div>
      `;
    }
  }

  // Metadados da página
  updatePageMetadata(route, params) {
    // Title
    if (route.title) {
      document.title = `${route.title} - Primal Fear Dex`;
    }

    // Meta description
    let description = route.description;
    if (route.meta && route.meta.description) {
      description = route.meta.description;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // Open Graph meta
    this.updateOpenGraph(route, params);
  }

  updateOpenGraph(route, params) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

    if (ogTitle && route.title) {
      ogTitle.content = `${route.title} - Primal Fear Dex`;
    }

    if (ogDesc && route.description) {
      ogDesc.content = route.description;
    }

    if (ogUrl) {
      ogUrl.content = window.location.href;
    }
  }

  // Scroll behavior
  handleScroll(behavior = 'auto') {
    if (behavior === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (behavior === 'preserve') {
      // Mantém posição atual
    } else {
      window.scrollTo({ top: 0, behavior: behavior });
    }
  }

  // Event listeners
  setupEventListeners() {
    // Browser navigation
    window.addEventListener('popstate', (e) => {
      const path = window.location.pathname;
      this.navigate(path, {}, { scroll: 'preserve' });
    });

    // Link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && link.getAttribute('data-spa') !== 'false') {
        const href = link.getAttribute('href');
        
        // Apenas links internos
        if (href.startsWith('/') && !href.includes('//')) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });
  }

  // Rotas padrão
  setupDefaultRoutes() {
    this.register('home', {
      component: HomeComponent,
      title: 'Início',
      description: 'Página inicial do Primal Fear Dex',
      preloadData: ['creatures', 'items']
    });

    this.register('creatures', {
      component: CreaturesComponent,
      title: 'Criaturas',
      description: 'Database completo de criaturas do Primal Fear',
      preloadData: ['creatures']
    });

    this.register('items', {
      component: ItemsComponent,
      title: 'Itens',
      description: 'Database completo de itens do Primal Fear',
      preloadData: ['items']
    });

    this.register('calculators', {
      component: CalculatorsComponent,
      title: 'Calculadoras',
      description: 'Ferramentas de cálculo para Primal Fear'
    });

    this.register('404', {
      component: NotFoundComponent,
      title: 'Página Não Encontrada',
      description: 'A página que você procurou não existe'
    });
  }

  // Utilitários públicos
  getCurrentRoute() {
    return this.currentRoute;
  }

  getRoute(path) {
    return this.routes.get(path);
  }

  getAllRoutes() {
    return Array.from(this.routes.entries());
  }

  // Inicialização
  async init() {
    const initialPath = window.location.pathname || this.defaultRoute;
    await this.navigate(initialPath);
  }
}

// Error Boundary simples
class ErrorBoundary {
  constructor() {
    this.errors = [];
    this.maxErrors = 10;
  }

  handle(error, context) {
    this.errors.push({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context: context,
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    console.error(`Error in ${context}:`, error);
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Export global
window.Router = Router;
window.ErrorBoundary = ErrorBoundary;
