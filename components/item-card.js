// Item Card Component
window.ItemCardComponent = {
    // Render a single item card
    render(item) {
        const tierColor = Utils.getTierColor(item.tier);
        const itemIcon = Utils.getItemIcon(item.category);
        
        return `
            <div class="card item-card" data-item-id="${item.id}">
                <div class="card-image">
                    <img src="${item.metadata?.image_url || '/assets/images/placeholder.png'}" 
                         alt="${item.name}" 
                         onerror="this.src='/assets/images/placeholder.png'"
                         loading="lazy">
                    <div class="item-tier" style="background-color: ${tierColor};">
                        ${item.tier}
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${itemIcon} ${Utils.escapeHtml(item.name)}</h3>
                    <div class="card-tags">
                        <span class="tag tier-${item.tier.toLowerCase()}">${item.tier}</span>
                        <span class="tag">${item.category}</span>
                        ${item.subcategory ? `<span class="tag">${item.subcategory}</span>` : ''}
                        ${item.craftable ? '<span class="tag">Craftable</span>' : ''}
                    </div>
                    <p class="card-description">
                        ${item.description ? Utils.escapeHtml(item.description.substring(0, 120)) + '...' : 'No description available.'}
                    </p>
                    <div class="item-stats">
                        ${this.renderItemStats(item)}
                    </div>
                    <div class="card-actions">
                        <a href="/items/${item.slug}" class="card-action">
                            View Details
                        </a>
                        ${item.craftable ? `
                            <button class="card-action" onclick="ItemCardComponent.showCraftingDialog('${item.id}')">
                                Crafting
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Render item-specific stats
    renderItemStats(item) {
        const stats = [];
        
        if (item.stats.damage) {
            stats.push(`
                <div class="item-stat">
                    <span>⚔️</span>
                    <span>DMG: ${item.stats.damage}</span>
                </div>
            `);
        }
        
        if (item.stats.armor) {
            stats.push(`
                <div class="item-stat">
                    <span>🛡️</span>
                    <span>ARM: ${item.stats.armor}</span>
                </div>
            `);
        }
        
        if (item.stats.durability) {
            stats.push(`
                <div class="item-stat">
                    <span>💪</span>
                    <span>DUR: ${item.stats.durability}</span>
                </div>
            `);
        }
        
        if (item.weight) {
            stats.push(`
                <div class="item-stat">
                    <span>⚖️</span>
                    <span>WT: ${item.weight}</span>
                </div>
            `);
        }
        
        if (item.stack_size > 1) {
            stats.push(`
                <div class="item-stat">
                    <span>📦</span>
                    <span>Stack: ${item.stack_size}</span>
                </div>
            `);
        }
        
        return stats.join('');
    },

    // Render multiple item cards
    renderGrid(items, containerId = 'items-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center p-xl">
                    <h3 class="text-secondary">No items found</h3>
                    <p class="text-muted">Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => this.render(item)).join('');
        
        // Add click handlers
        this.attachCardEventListeners(container);
    },

    // Attach event listeners to cards
    attachCardEventListeners(container) {
        container.querySelectorAll('.item-card').forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                this.showItemPreview(card);
            });

            card.addEventListener('mouseleave', () => {
                this.hideItemPreview();
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

    // Show item preview tooltip
    showItemPreview(card) {
        const itemId = card.getAttribute('data-item-id');
        // Could implement hover preview here
        console.log('Preview item:', itemId);
    },

    hideItemPreview() {
        // Hide preview tooltip
    },

    // Sort items
    sortItems(items, sortBy, direction = 'asc') {
        const sorted = [...items];
        
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'tier':
                const tierOrder = ['Primitive', 'Apprentice', 'Journeyman', 'Master', 'Ascendant', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Omega'];
                sorted.sort((a, b) => {
                    const aIndex = tierOrder.indexOf(a.tier);
                    const bIndex = tierOrder.indexOf(b.tier);
                    return aIndex - bIndex;
                });
                break;
            case 'damage':
                sorted.sort((a, b) => (b.stats.damage || 0) - (a.stats.damage || 0));
                break;
            case 'armor':
                sorted.sort((a, b) => (b.stats.armor || 0) - (a.stats.armor || 0));
                break;
            case 'weight':
                sorted.sort((a, b) => a.weight - b.weight);
                break;
            case 'category':
                sorted.sort((a, b) => a.category.localeCompare(b.category));
                break;
            default:
                return items;
        }

        return direction === 'desc' ? sorted.reverse() : sorted;
    },

    // Filter items
    filterItems(items, filters) {
        return items.filter(item => {
            // Tier filter
            if (filters.tier && filters.tier.length > 0) {
                if (!filters.tier.includes(item.tier)) return false;
            }

            // Category filter
            if (filters.category && filters.category.length > 0) {
                if (!filters.category.includes(item.category)) return false;
            }

            // Subcategory filter
            if (filters.subcategory && filters.subcategory.length > 0) {
                if (!item.subcategory || !filters.subcategory.includes(item.subcategory)) return false;
            }

            // Craftable filter
            if (filters.craftable !== undefined) {
                if (item.craftable !== filters.craftable) return false;
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const searchableText = `${item.name} ${item.category} ${item.subcategory || ''} ${item.description}`.toLowerCase();
                if (!searchableText.includes(searchLower)) return false;
            }

            return true;
        });
    },

    // Show crafting dialog
    async showCraftingDialog(itemId) {
        try {
            const item = await DataLoader.getItem('items', itemId);
            if (!item || !item.craftable) return;

            this.renderCraftingDialog(item);
        } catch (error) {
            console.error('Failed to load item for crafting:', error);
            Utils.showNotification('Failed to load crafting information', 'error');
        }
    },

    // Render crafting dialog
    renderCraftingDialog(item) {
        const dialog = document.createElement('div');
        dialog.className = 'crafting-dialog-overlay';
        dialog.innerHTML = `
            <div class="crafting-dialog">
                <div class="crafting-dialog-header">
                    <h3>Crafting: ${Utils.escapeHtml(item.name)}</h3>
                    <button class="btn btn-outline" onclick="this.closest('.crafting-dialog-overlay').remove()">✕</button>
                </div>
                <div class="crafting-dialog-content">
                    <div class="crafting-info">
                        <div class="crafting-method">
                            <strong>Method:</strong> ${item.crafting.method}
                        </div>
                        <div class="crafting-time">
                            <strong>Time:</strong> ${Utils.formatTime(item.crafting.crafting_time)}
                        </div>
                        <div class="crafting-xp">
                            <strong>XP:</strong> ${item.crafting.craft_xp}
                        </div>
                    </div>
                    <div class="crafting-materials">
                        <h4>Materials Required:</h4>
                        <div class="materials-list">
                            ${item.crafting.materials.map(material => `
                                <div class="material-item">
                                    <span class="material-name">${Utils.escapeHtml(material.item)}</span>
                                    <span class="material-quantity">×${material.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${item.engram ? `
                        <div class="engram-info">
                            <h4>Engram Requirements:</h4>
                            <div class="engram-stats">
                                <div class="engram-stat">
                                    <strong>Level:</strong> ${item.engram.required_level}
                                </div>
                                <div class="engram-stat">
                                    <strong>Engram Points:</strong> ${item.engram.points_cost}
                                </div>
                                ${item.engram.prerequisites.length > 0 ? `
                                    <div class="engram-stat">
                                        <strong>Prerequisites:</strong>
                                        <ul class="prerequisites-list">
                                            ${item.engram.prerequisites.map(prereq => `
                                                <li>${Utils.escapeHtml(prereq)}</li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add styles for dialog
        if (!document.querySelector('#crafting-dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'crafting-dialog-styles';
            style.textContent = `
                .crafting-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }

                .crafting-dialog {
                    background-color: var(--light-bg);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    margin: var(--spacing-lg);
                }

                .crafting-dialog-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--border-color);
                }

                .crafting-dialog-content {
                    padding: var(--spacing-lg);
                }

                .crafting-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-lg);
                    padding: var(--spacing-md);
                    background-color: var(--dark-bg);
                    border-radius: var(--border-radius-md);
                }

                .crafting-materials h4,
                .engram-info h4 {
                    margin-bottom: var(--spacing-md);
                    color: var(--text-primary);
                }

                .materials-list {
                    display: grid;
                    gap: var(--spacing-sm);
                }

                .material-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-sm);
                    background-color: var(--dark-bg);
                    border-radius: var(--border-radius-sm);
                }

                .material-name {
                    color: var(--text-secondary);
                }

                .material-quantity {
                    color: var(--accent-color);
                    font-weight: 600;
                }

                .engram-info {
                    margin-top: var(--spacing-lg);
                    padding: var(--spacing-md);
                    background-color: var(--dark-bg);
                    border-radius: var(--border-radius-md);
                }

                .engram-stats {
                    display: grid;
                    gap: var(--spacing-sm);
                }

                .engram-stat {
                    color: var(--text-secondary);
                }

                .prerequisites-list {
                    margin: var(--spacing-sm) 0 0 var(--spacing-lg);
                    color: var(--text-muted);
                }

                @media (max-width: 768px) {
                    .crafting-dialog {
                        margin: var(--spacing-md);
                        max-height: 90vh;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(dialog);

        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                dialog.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    },

    // Create skeleton cards for loading state
    createSkeletons(count = 6) {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            skeletons.push(`
                <div class="card item-card skeleton-card">
                    <div class="card-image">
                        <div class="skeleton" style="height: 150px;"></div>
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
    showLoading(containerId = 'items-grid', count = 6) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.createSkeletons(count);
        }
    },

    // Show error state
    showError(containerId = 'items-grid', error) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center p-xl">
                    <h3 class="text-danger">Error Loading Items</h3>
                    <p class="text-muted">${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
};
