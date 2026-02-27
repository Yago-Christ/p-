// src/core/store.js - Estado Global Centralizado
class Store {
  constructor() {
    this.state = {
      // Dados da aplicação
      data: {
        creatures: { items: [], loading: false, error: null, lastUpdate: null },
        items: { items: [], loading: false, error: null, lastUpdate: null },
        structures: { items: [], loading: false, error: null, lastUpdate: null },
        resources: { items: [], loading: false, error: null, lastUpdate: null },
        bosses: { items: [], loading: false, error: null, lastUpdate: null },
        progression: { items: [], loading: false, error: null, lastUpdate: null }
      },
      
      // Estado da UI
      ui: {
        loading: false,
        currentView: 'home',
        filters: { tier: [], category: [], search: '' },
        search: { query: '', results: [], loading: false },
        sidebar: { open: false, activeFilters: {} },
        pagination: { page: 1, limit: 20, total: 0 }
      },
      
      // Estado da aplicação
      app: {
        initialized: false,
        ready: false,
        fallbackMode: false,
        error: null,
        version: '2.0.0',
        lastUpdate: null
      },
      
      // Cache e metadados
      cache: {
        version: '2.0.0',
        lastUpdate: null,
        invalidated: false,
        size: 0
      }
    };
    
    this.subscribers = [];
    this.middleware = [];
    this.history = [];
    this.maxHistory = 50;
  }

  // Pattern de subscribe para reatividade
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Retorna função de unsubscribe
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Dispatch de ações com middleware
  dispatch(action, payload) {
    // Salva estado anterior para rollback
    const previousState = JSON.parse(JSON.stringify(this.state));
    
    try {
      // Aplica middleware
      let finalAction = action;
      let finalPayload = payload;
      
      for (const middleware of this.middleware) {
        const result = middleware(finalAction, finalPayload, this.state);
        if (result) {
          finalAction = result.action || finalAction;
          finalPayload = result.payload || finalPayload;
        }
      }
      
      // Aplica reducer
      const newState = this.reducer(this.state, { 
        type: finalAction, 
        payload: finalPayload 
      });
      
      // Validação de estado
      if (!this.validateState(newState)) {
        throw new Error(`Invalid state produced by action: ${finalAction}`);
      }
      
      // Salva no histórico
      this.history.push({
        timestamp: Date.now(),
        action: finalAction,
        payload: finalPayload,
        previousState: previousState,
        newState: newState
      });
      
      // Limita histórico
      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(-this.maxHistory);
      }
      
      // Atualiza estado
      this.state = newState;
      
      // Notifica subscribers
      this.notify();
      
    } catch (error) {
      console.error('State update failed:', error);
      
      // Rollback para estado anterior
      this.state = previousState;
      this.notify();
      
      throw error;
    }
  }

  // Reducer principal
  reducer(state, action) {
    const { type, payload } = action;
    
    // Clone profundo para imutabilidade
    const newState = JSON.parse(JSON.stringify(state));
    
    switch (type) {
      // Data actions
      case 'data/setCreatures':
        newState.data.creatures = {
          ...newState.data.creatures,
          items: payload.items || [],
          loading: false,
          error: null,
          lastUpdate: Date.now()
        };
        break;
        
      case 'data/setItems':
        newState.data.items = {
          ...newState.data.items,
          items: payload.items || [],
          loading: false,
          error: null,
          lastUpdate: Date.now()
        };
        break;
        
      case 'data/setLoading':
        const dataType = payload.type;
        if (newState.data[dataType]) {
          newState.data[dataType].loading = payload.loading;
        }
        break;
        
      case 'data/setError':
        const errorType = payload.type;
        if (newState.data[errorType]) {
          newState.data[errorType].error = payload.error;
          newState.data[errorType].loading = false;
        }
        break;
        
      // UI actions
      case 'ui/setLoading':
        newState.ui.loading = payload;
        break;
        
      case 'ui/setCurrentView':
        newState.ui.currentView = payload;
        break;
        
      case 'ui/setFilters':
        newState.ui.filters = { ...newState.ui.filters, ...payload };
        break;
        
      case 'ui/setSearchQuery':
        newState.ui.search.query = payload;
        break;
        
      case 'ui/setSearchResults':
        newState.ui.search.results = payload || [];
        newState.ui.search.loading = false;
        break;
        
      case 'ui/toggleSidebar':
        newState.ui.sidebar.open = !newState.ui.sidebar.open;
        break;
        
      // App actions
      case 'app/setInitializing':
        newState.app.initialized = payload;
        break;
        
      case 'app/setReady':
        newState.app.ready = payload;
        break;
        
      case 'app/setFallbackMode':
        newState.app.fallbackMode = payload;
        break;
        
      case 'app/setError':
        newState.app.error = payload;
        break;
        
      // Cache actions
      case 'cache/updateVersion':
        newState.cache.version = payload;
        newState.cache.lastUpdate = Date.now();
        break;
        
      case 'cache/invalidate':
        newState.cache.invalidated = payload;
        break;
        
      default:
        console.warn(`Unknown action type: ${type}`);
        return state;
    }
    
    return newState;
  }

  // Validação de estado
  validateState(state) {
    try {
      // Verificações básicas
      if (!state || typeof state !== 'object') return false;
      if (!state.data || !state.ui || !state.app) return false;
      
      // Verifica estrutura de dados
      const requiredDataTypes = ['creatures', 'items', 'structures', 'resources', 'bosses', 'progression'];
      for (const type of requiredDataTypes) {
        if (!state.data[type] || !Array.isArray(state.data[type].items)) return false;
      }
      
      // Verifica UI
      if (typeof state.ui.loading !== 'boolean') return false;
      if (!state.ui.currentView || typeof state.ui.currentView !== 'string') return false;
      
      // Verifica app
      if (typeof state.app.ready !== 'boolean') return false;
      if (!state.app.version || typeof state.app.version !== 'string') return false;
      
      return true;
    } catch (error) {
      console.error('State validation error:', error);
      return false;
    }
  }

  // Notifica todos os subscribers
  notify() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  // Getters específicos
  getState() {
    return this.state;
  }
  
  getData(type) {
    return this.state.data[type] || { items: [], loading: false, error: null };
  }
  
  getUI() {
    return this.state.ui;
  }
  
  getApp() {
    return this.state.app;
  }

  // Middleware system
  use(middleware) {
    this.middleware.push(middleware);
  }

  // Debug e monitoring
  getHistory() {
    return this.history;
  }
  
  getSubscribers() {
    return this.subscribers.length;
  }
  
  // Reset para estado inicial
  reset() {
    this.state = {
      data: {
        creatures: { items: [], loading: false, error: null, lastUpdate: null },
        items: { items: [], loading: false, error: null, lastUpdate: null },
        structures: { items: [], loading: false, error: null, lastUpdate: null },
        resources: { items: [], loading: false, error: null, lastUpdate: null },
        bosses: { items: [], loading: false, error: null, lastUpdate: null },
        progression: { items: [], loading: false, error: null, lastUpdate: null }
      },
      ui: {
        loading: false,
        currentView: 'home',
        filters: { tier: [], category: [], search: '' },
        search: { query: '', results: [], loading: false },
        sidebar: { open: false, activeFilters: {} },
        pagination: { page: 1, limit: 20, total: 0 }
      },
      app: {
        initialized: false,
        ready: false,
        fallbackMode: false,
        error: null,
        version: '2.0.0',
        lastUpdate: null
      },
      cache: {
        version: '2.0.0',
        lastUpdate: null,
        invalidated: false,
        size: 0
      }
    };
    
    this.history = [];
    this.notify();
  }
}

// Export global
window.Store = Store;
