// Creature Card Component
window.CreatureCardComponent = {
    // Render a single creature card
    render(creature) {
        const tierColor = Utils.getTierColor(creature.tier);
        const creatureIcon = Utils.getCreatureIcon(creature.category);
        
        return `
            <div class="card creature-card" data-creature-id="${creature.id}">
                <div class="card-image">
                    <img src="${creature.metadata?.image_url || '/assets/images/placeholder.png'}" 
                         alt="${creature.name}" 
                         onerror="this.src='/assets/images/placeholder.png'"
                         loading="lazy">
                    <div class="creature-tier" style="background-color: ${tierColor};">
                        ${creature.tier}
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${creatureIcon} ${Utils.escapeHtml(creature.name)}</h3>
                    <div class="card-tags">
                        <span class="tag tier-${creature.tier.toLowerCase()}">${creature.tier}</span>
                        <span class="tag">${creature.category}</span>
                        <span class="tag">${creature.diet}</span>
                        ${creature.tameable ? '<span class="tag">Tameable</span>' : ''}
                        ${creature.rideable ? '<span class="tag">Rideable</span>' : ''}
                    </div>
                    <p class="card-description">
                        ${creature.description ? Utils.escapeHtml(creature.description.substring(0, 150)) + '...' : 'No description available.'}
                    </p>
                    <div class="creature-stats">
                        <div class="creature-stat">
                            <span>❤️</span>
                            <span>${Utils.formatNumber(creature.stats.health.base)}</span>
                        </div>
                        <div class="creature-stat">
                            <span>⚔️</span>
                            <span>${creature.stats.melee.base}%</span>
                        </div>
                        <div class="creature-stat">
                            <span>⚖️</span>
                            <span>${Utils.formatNumber(creature.stats.weight.base)}</span>
                        </div>
                        <div class="creature-stat">
                            <span>🏃</span>
                            <span>${creature.stats.movement_speed.base}%</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <a href="/creatures/${creature.slug}" class="card-action">
                            View Details
                        </a>
                        <a href="/taming/${creature.slug}" class="card-action">
                            Taming Calc
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    // Render multiple creature cards
    renderGrid(creatures, containerId = 'creatures-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (creatures.length === 0) {
            container.innerHTML = `
                <div class="text-center p-xl">
                    <h3 class="text-secondary">No creatures found</h3>
                    <p class="text-muted">Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = creatures.map(creature => this.render(creature)).join('');
        
        // Add click handlers
        this.attachCardEventListeners(container);
    },

    // Attach event listeners to cards
    attachCardEventListeners(container) {
        container.querySelectorAll('.creature-card').forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                this.showCreaturePreview(card);
            });

            card.addEventListener('mouseleave', () => {
                this.hideCreaturePreview();
            });

            // Add keyboard navigation
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const link = card.querySelector('.card-action');
                    if (link) link.click();
                }
            });
        });
    },

    // Show creature preview tooltip
    showCreaturePreview(card) {
        const creatureId = card.getAttribute('data-creature-id');
        // Could implement hover preview here
        console.log('Preview creature:', creatureId);
    },

    hideCreaturePreview() {
        // Hide preview tooltip
    },

    // Sort creatures
    sortCreatures(creatures, sortBy, direction = 'asc') {
        const sorted = [...creatures];
        
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'tier':
                const tierOrder = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Omega'];
                sorted.sort((a, b) => {
                    const aIndex = tierOrder.indexOf(a.tier);
                    const bIndex = tierOrder.indexOf(b.tier);
                    return aIndex - bIndex;
                });
                break;
            case 'health':
                sorted.sort((a, b) => a.stats.health.base - b.stats.health.base);
                break;
            case 'melee':
                sorted.sort((a, b) => a.stats.melee.base - b.stats.melee.base);
                break;
            case 'weight':
                sorted.sort((a, b) => a.stats.weight.base - b.stats.weight.base);
                break;
            default:
                return creatures;
        }

        return direction === 'desc' ? sorted.reverse() : sorted;
    },

    // Filter creatures
    filterCreatures(creatures, filters) {
        return creatures.filter(creature => {
            // Tier filter
            if (filters.tier && filters.tier.length > 0) {
                if (!filters.tier.includes(creature.tier)) return false;
            }

            // Category filter
            if (filters.category && filters.category.length > 0) {
                if (!filters.category.includes(creature.category)) return false;
            }

            // Diet filter
            if (filters.diet && filters.diet.length > 0) {
                if (!filters.diet.includes(creature.diet)) return false;
            }

            // Tameable filter
            if (filters.tameable !== undefined) {
                if (creature.tameable !== filters.tameable) return false;
            }

            // Rideable filter
            if (filters.rideable !== undefined) {
                if (creature.rideable !== filters.rideable) return false;
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const searchableText = `${creature.name} ${creature.category} ${creature.tier} ${creature.description}`.toLowerCase();
                if (!searchableText.includes(searchLower)) return false;
            }

            return true;
        });
    },

    // Create skeleton cards for loading state
    createSkeletons(count = 6) {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            skeletons.push(`
                <div class="card creature-card skeleton-card">
                    <div class="card-image">
                        <div class="skeleton" style="height: 200px;"></div>
                    </div>
                    <div class="card-content">
                        <div class="skeleton" style="height: 24px; margin-bottom: 12px;"></div>
                        <div class="skeleton" style="height: 20px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="height: 60px; margin-bottom: 12px;"></div>
                        <div class="skeleton" style="height: 32px;"></div>
                    </div>
                </div>
            `);
        }
        return skeletons.join('');
    },

    // Show loading state
    showLoading(containerId = 'creatures-grid', count = 6) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.createSkeletons(count);
        }
    },

    // Show error state
    showError(containerId = 'creatures-grid', error) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center p-xl">
                    <h3 class="text-danger">Error Loading Creatures</h3>
                    <p class="text-muted">${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
};
