// Utility Functions
window.Utils = {
    // Debounce function for search and other input events
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format numbers with commas
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Format time from seconds to readable format
    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    // Format percentage
    formatPercentage: function(value, decimals = 1) {
        return `${value.toFixed(decimals)}%`;
    },

    // Get tier color
    getTierColor: function(tier) {
        const colors = {
            'Alpha': 'var(--tier-alpha)',
            'Beta': 'var(--tier-beta)',
            'Gamma': 'var(--tier-gamma)',
            'Delta': 'var(--tier-delta)',
            'Epsilon': 'var(--tier-epsilon)',
            'Omega': 'var(--tier-omega)'
        };
        return colors[tier] || 'var(--text-secondary)';
    },

    // Create slug from string
    createSlug: function(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Parse query parameters
    getQueryParams: function() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Update query parameters
    updateQueryParams: function(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.replaceState({}, '', url);
    },

    // Get creature icon based on category
    getCreatureIcon: function(category) {
        const icons = {
            'Dinosaur': '🦕',
            'Dragon': '🐉',
            'Demon': '👹',
            'Celestial': '✨',
            'Elemental': '🔥',
            'Undead': '💀',
            'Mechanical': '🤖',
            'Mythical': '🦄'
        };
        return icons[category] || '🦴';
    },

    // Get item icon based on category
    getItemIcon: function(category) {
        const icons = {
            'Weapon': '⚔️',
            'Armor': '🛡️',
            'Tool': '🔨',
            'Consumable': '🧪',
            'Kibble': '🍖',
            'Resource': '💎',
            'Structure': '🏗️',
            'Saddle': '🦴'
        };
        return icons[category] || '📦';
    },

    // Calculate stat multiplier
    calculateStatValue: function(base, wildLevel, tamedLevel, tamedMultiplier = 1.0) {
        const wildIncrease = base * (wildLevel * 0.2);
        const tamedIncrease = base * (tamedLevel * 0.1) * tamedMultiplier;
        return Math.floor(base + wildIncrease + tamedIncrease);
    },

    // Calculate taming effectiveness
    calculateTamingEffectiveness: function(currentFood, maxFood) {
        return (currentFood / maxFood) * 100;
    },

    // Calculate knockout time
    calculateKnockoutTime: function(torpor, currentTorpor, depletionRate) {
        const remainingTorpor = torpor - currentTorpor;
        return remainingTorpor / depletionRate;
    },

    // Sort array of objects by key
    sortByKey: function(array, key, direction = 'asc') {
        return array.sort((a, b) => {
            if (direction === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    },

    // Filter array by multiple criteria
    filterByCriteria: function(array, criteria) {
        return array.filter(item => {
            return Object.keys(criteria).every(key => {
                const value = criteria[key];
                if (Array.isArray(value)) {
                    return value.includes(item[key]);
                } else if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                    return item[key] >= value.min && item[key] <= value.max;
                } else {
                    return item[key] === value;
                }
            });
        });
    },

    // Search in array of objects
    searchInArray: function(array, searchTerm, fields) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return array.filter(item => {
            return fields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowerSearchTerm);
                }
                return false;
            });
        });
    },

    // Create loading skeleton
    createSkeleton: function(count = 1, type = 'card') {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            skeletons.push(`<div class="skeleton skeleton-${type}"></div>`);
        }
        return skeletons.join('');
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Copy to clipboard
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy', 'error');
        });
    },

    // Local storage helpers
    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage error:', e);
                return false;
            }
        },
        
        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage error:', e);
                return defaultValue;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage error:', e);
                return false;
            }
        },
        
        clear: function() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Storage error:', e);
                return false;
            }
        }
    },

    // Validation helpers
    validate: {
        isRequired: function(value) {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },
        
        isNumber: function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },
        
        isInRange: function(value, min, max) {
            return this.isNumber(value) && value >= min && value <= max;
        },
        
        isEmail: function(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }
    },

    // Performance monitoring
    performance: {
        mark: function(name) {
            if (performance && performance.mark) {
                try {
                    performance.mark(name);
                } catch (error) {
                    console.warn(`Performance mark failed: ${name}`, error);
                }
            }
        },
        
        measure: function(name, startMark, endMark) {
            if (performance && performance.measure) {
                try {
                    // Check if marks exist before measuring
                    const startExists = startMark ? performance.getEntriesByName(startMark, 'mark').length > 0 : true;
                    const endExists = endMark ? performance.getEntriesByName(endMark, 'mark').length > 0 : true;
                    
                    if (!startExists || !endExists) {
                        console.warn(`Performance marks not found: start=${startMark}, end=${endMark}`);
                        return 0;
                    }
                    
                    performance.measure(name, startMark, endMark);
                    const measure = performance.getEntriesByName(name)[0];
                    console.log(`${name}: ${measure.duration}ms`);
                    return measure.duration;
                } catch (error) {
                    console.warn(`Performance measurement failed: ${name}`, error);
                    return 0;
                }
            }
            return 0;
        }
    },

    // Device detection
    isMobile: function() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isTablet: function() {
        return window.innerWidth > 768 && window.innerWidth <= 1024 || /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    },
    
    isDesktop: function() {
        return window.innerWidth > 1024 && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Generate random ID
    generateId: function(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
};
