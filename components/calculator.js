// Calculator Component
window.CalculatorComponent = {
    initialized: false,
    currentCalculator: null,
    calculators: {},
    
    init() {
        if (this.initialized) return;
        
        this.setupCalculators();
        this.attachEventListeners();
        this.initialized = true;
    },

    setupCalculators() {
        this.calculators = {
            taming: {
                name: 'Taming Calculator',
                inputs: [
                    { id: 'creature-level', label: 'Creature Level', type: 'number', min: 1, max: 500, default: 150 },
                    { id: 'taming-multiplier', label: 'Taming Multiplier', type: 'number', min: 0.1, max: 5, step: 0.1, default: 1 },
                    { id: 'weapon-damage', label: 'Weapon Damage (%)', type: 'number', min: 100, max: 1000, step: 50, default: 100 },
                    { id: 'food-multiplier', label: 'Food Consumption Multiplier', type: 'number', min: 0.5, max: 2, step: 0.1, default: 1 }
                ],
                calculate: this.calculateTaming.bind(this)
            },
            breeding: {
                name: 'Breeding Calculator',
                inputs: [
                    { id: 'maternal-level', label: 'Maternal Level', type: 'number', min: 1, max: 500, default: 150 },
                    { id: 'paternal-level', label: 'Paternal Level', type: 'number', min: 1, max: 500, default: 150 },
                    { id: 'imprinting-quality', label: 'Imprinting Quality (%)', type: 'number', min: 0, max: 100, default: 100 },
                    { id: 'maturation-speed', label: 'Maturation Speed Multiplier', type: 'number', min: 0.1, max: 5, step: 0.1, default: 1 }
                ],
                calculate: this.calculateBreeding.bind(this)
            },
            stats: {
                name: 'Stats Calculator',
                inputs: [
                    { id: 'wild-level', label: 'Wild Level', type: 'number', min: 1, max: 500, default: 150 },
                    { id: 'tamed-levels', label: 'Tamed Levels Available', type: 'number', min: 0, max: 73, default: 73 },
                    { id: 'imprinting', label: 'Imprinting Bonus (%)', type: 'number', min: 0, max: 100, default: 100 },
                    { id: 'multiplier', label: 'Official Multiplier', type: 'select', options: [
                        { value: 1, label: 'Official (1x)' },
                        { value: 2, label: '2x' },
                        { value: 5, label: '5x' },
                        { value: 10, label: '10x' }
                    ], default: 1 }
                ],
                calculate: this.calculateStats.bind(this)
            },
            crafting: {
                name: 'Crafting Calculator',
                inputs: [
                    { id: 'quantity', label: 'Quantity to Craft', type: 'number', min: 1, max: 1000, default: 1 },
                    { id: 'crafting-skill', label: 'Crafting Skill Level', type: 'number', min: 0, max: 100, default: 0 },
                    { id: 'blueprint-quality', label: 'Blueprint Quality (%)', type: 'number', min: 0, max: 600, default: 100 },
                    { id: 'station-multiplier', label: 'Station Multiplier', type: 'select', options: [
                        { value: 1, label: 'Player Crafting (1x)' },
                        { value: 0.5, label: 'Refining Forge (0.5x)' },
                        { value: 0.75, label: 'Industrial Forge (0.75x)' },
                        { value: 0.8, label: 'Chemistry Bench (0.8x)' }
                    ], default: 1 }
                ],
                calculate: this.calculateCrafting.bind(this)
            }
        };
    },

    attachEventListeners() {
        // Handle calculator type changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('calculator-type')) {
                this.switchCalculator(e.target.value);
            }
        });

        // Handle input changes
        document.addEventListener('input', (e) => {
            if (e.target.closest('.calculator')) {
                this.updateCalculations();
            }
        });

        // Handle creature selection for taming calculator
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('creature-selector')) {
                this.loadCreatureData(e.target.value);
            }
        });
    },

    // Render calculator
    render(type, containerId = 'calculator-container', creature = null) {
        const container = document.getElementById(containerId);
        if (!container || !this.calculators[type]) return;

        const calculator = this.calculators[type];
        this.currentCalculator = type;

        container.innerHTML = `
            <div class="calculator" data-calculator-type="${type}">
                <div class="calculator-header">
                    <h3>${calculator.name}</h3>
                    ${creature ? `<div class="calculator-creature">${Utils.getCreatureIcon(creature.category)} ${creature.name}</div>` : ''}
                </div>
                
                <div class="calculator-inputs">
                    ${creature ? `
                        <div class="creature-selector-container">
                            <label class="input-label">Creature</label>
                            <select class="creature-selector">
                                <option value="${creature.id}" selected>${creature.name}</option>
                            </select>
                        </div>
                    ` : ''}
                    
                    ${calculator.inputs.map(input => this.renderInput(input)).join('')}
                </div>
                
                <div class="calculator-results" id="calculator-results">
                    <div class="result-placeholder">
                        <p>Adjust the inputs to see calculations</p>
                    </div>
                </div>
                
                <div class="calculator-actions">
                    <button class="btn btn-secondary" onclick="CalculatorComponent.resetCalculator()">
                        Reset
                    </button>
                    <button class="btn btn-primary" onclick="CalculatorComponent.shareResults()">
                        Share Results
                    </button>
                </div>
            </div>
        `;

        // Initialize input values
        this.initializeInputs();
        
        // Load creature data if provided
        if (creature) {
            this.loadCreatureData(creature.id);
        }
    },

    // Render input field
    renderInput(input) {
        const inputId = `calc-${input.id}`;
        
        switch (input.type) {
            case 'select':
                return `
                    <div class="input-group">
                        <label class="input-label" for="${inputId}">${input.label}</label>
                        <div class="input-with-controls">
                            <select id="${inputId}" class="calculator-input" data-input="${input.id}">
                                ${input.options.map(option => `
                                    <option value="${option.value}" ${option.value === input.default ? 'selected' : ''}>
                                        ${option.label}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                `;
            case 'number':
            default:
                return `
                    <div class="input-group">
                        <label class="input-label" for="${inputId}">${input.label}</label>
                        <div class="input-with-controls">
                            <button class="input-control" onclick="CalculatorComponent.adjustInput('${input.id}', -1)">−</button>
                            <input 
                                type="number" 
                                id="${inputId}" 
                                class="calculator-input" 
                                data-input="${input.id}"
                                min="${input.min}" 
                                max="${input.max}" 
                                step="${input.step || 1}" 
                                value="${input.default}"
                            >
                            <button class="input-control" onclick="CalculatorComponent.adjustInput('${input.id}', 1)">+</button>
                        </div>
                        <div class="input-range-info">
                            <span>Range: ${input.min} - ${input.max}</span>
                        </div>
                    </div>
                `;
        }
    },

    // Initialize input values
    initializeInputs() {
        const calculator = this.calculators[this.currentCalculator];
        if (!calculator) return;

        calculator.inputs.forEach(input => {
            const inputElement = document.getElementById(`calc-${input.id}`);
            if (inputElement) {
                inputElement.value = input.default;
            }
        });
    },

    // Adjust input value
    adjustInput(inputId, direction) {
        const input = document.getElementById(`calc-${inputId}`);
        if (!input) return;

        const calculator = this.calculators[this.currentCalculator];
        const inputConfig = calculator.inputs.find(i => i.id === inputId);
        if (!inputConfig) return;

        const step = inputConfig.step || 1;
        const newValue = parseFloat(input.value) + (step * direction);
        
        if (newValue >= inputConfig.min && newValue <= inputConfig.max) {
            input.value = newValue;
            this.updateCalculations();
        }
    },

    // Update calculations
    updateCalculations() {
        if (!this.currentCalculator) return;

        const calculator = this.calculators[this.currentCalculator];
        const inputs = this.getInputValues();
        
        try {
            const results = calculator.calculate(inputs);
            this.renderResults(results);
        } catch (error) {
            console.error('Calculation error:', error);
            this.renderError(error);
        }
    },

    // Get input values
    getInputValues() {
        const inputs = {};
        document.querySelectorAll('.calculator-input').forEach(input => {
            const key = input.getAttribute('data-input');
            const value = input.type === 'number' ? parseFloat(input.value) : input.value;
            inputs[key] = value;
        });
        return inputs;
    },

    // Render calculation results
    renderResults(results) {
        const resultsContainer = document.getElementById('calculator-results');
        if (!resultsContainer) return;

        let html = '<div class="results-grid">';
        
        Object.keys(results).forEach(key => {
            const result = results[key];
            html += `
                <div class="result-item">
                    <span class="result-label">${result.label}</span>
                    <span class="result-value">${result.value}</span>
                </div>
            `;
        });
        
        html += '</div>';
        
        resultsContainer.innerHTML = html;
    },

    // Render calculation error
    renderError(error) {
        const resultsContainer = document.getElementById('calculator-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="result-error">
                <p class="text-danger">Calculation Error</p>
                <p class="text-muted">${error.message}</p>
            </div>
        `;
    },

    // Taming calculations
    calculateTaming(inputs) {
        // This would use actual creature data
        const creatureLevel = inputs['creature-level'];
        const tamingMultiplier = inputs['taming-multiplier'];
        const weaponDamage = inputs['weapon-damage'] / 100;
        const foodMultiplier = inputs['food-multiplier'];

        // Sample calculations (would be based on actual creature stats)
        const baseTorpor = 800;
        const torporPerLevel = 80;
        const baseFood = 3000;
        const foodPerLevel = 300;

        const totalTorpor = baseTorpor + (torporPerLevel * creatureLevel);
        const totalFood = baseFood + (foodPerLevel * creatureLevel);

        const tamingTime = Math.round((totalFood / 10) * tamingMultiplier);
        const narcoticsNeeded = Math.ceil((totalTorpor / 100) * tamingMultiplier);
        const foodNeeded = Math.ceil(totalFood * tamingMultiplier);

        return {
            tamingTime: {
                label: 'Taming Time',
                value: Utils.formatTime(tamingTime * 60) // Convert to seconds
            },
            narcoticsNeeded: {
                label: 'Narcotics Needed',
                value: Utils.formatNumber(narcoticsNeeded)
            },
            foodNeeded: {
                label: 'Food Needed',
                value: Utils.formatNumber(foodNeeded)
            },
            knockoutShots: {
                label: 'Knockout Shots (Longneck)',
                value: Math.ceil(totalTorpor / (100 * weaponDamage))
            }
        };
    },

    // Breeding calculations
    calculateBreeding(inputs) {
        const maternalLevel = inputs['maternal-level'];
        const paternalLevel = inputs['paternal-level'];
        const imprintingQuality = inputs['imprinting-quality'] / 100;
        const maturationSpeed = inputs['maturation-speed'];

        const babyLevel = Math.floor((maternalLevel + paternalLevel) / 2);
        const maturationTime = Math.round((8 * 60 * 60) / maturationSpeed); // 8 hours base
        const gestationTime = maternalLevel > 150 ? 6 * 60 * 60 : 4 * 60 * 60; // 6 or 4 hours

        return {
            babyLevel: {
                label: 'Baby Level',
                value: Utils.formatNumber(babyLevel)
            },
            maturationTime: {
                label: 'Maturation Time',
                value: Utils.formatTime(maturationTime)
            },
            gestationTime: {
                label: 'Gestation Time',
                value: Utils.formatTime(gestationTime)
            },
            imprintingBonus: {
                label: 'Imprinting Bonus',
                value: Utils.formatPercentage(imprintingQuality * 20)
            }
        };
    },

    // Stats calculations
    calculateStats(inputs) {
        const wildLevel = inputs['wild-level'];
        const tamedLevels = inputs['tamed-levels'];
        const imprinting = inputs['imprinting'] / 100;
        const multiplier = inputs['multiplier'];

        // Sample stat calculations
        const baseHealth = 1500;
        const healthPerLevel = 300;
        const healthTamedPerLevel = 108;

        const wildHealth = baseHealth + (healthPerLevel * wildLevel);
        const tamedHealth = wildHealth + (healthTamedPerLevel * tamedLevels * multiplier);
        const finalHealth = tamedHealth * (1 + (imprinting * 0.2));

        return {
            wildHealth: {
                label: 'Wild Health',
                value: Utils.formatNumber(Math.round(wildHealth))
            },
            tamedHealth: {
                label: 'Tamed Health',
                value: Utils.formatNumber(Math.round(tamedHealth))
            },
            finalHealth: {
                label: 'Final Health (with imprinting)',
                value: Utils.formatNumber(Math.round(finalHealth))
            },
            totalLevels: {
                label: 'Total Levels',
                value: Utils.formatNumber(wildLevel + tamedLevels)
            }
        };
    },

    // Crafting calculations
    calculateCrafting(inputs) {
        const quantity = inputs['quantity'];
        const craftingSkill = inputs['crafting-skill'];
        const blueprintQuality = inputs['blueprint-quality'] / 100;
        const stationMultiplier = inputs['station-multiplier'];

        // Sample crafting calculations
        const baseMaterials = [
            { item: 'Metal Ingot', quantity: 20 },
            { item: 'Hide', quantity: 15 },
            { item: 'Crystal', quantity: 10 }
        ];

        const skillBonus = 1 + (craftingSkill * 0.005);
        const totalMultiplier = skillBonus * blueprintQuality * stationMultiplier;

        const materials = baseMaterials.map(material => ({
            ...material,
            totalQuantity: Math.ceil(material.quantity * quantity * totalMultiplier)
        }));

        const craftingTime = (30 * quantity) / stationMultiplier;

        return {
            craftingTime: {
                label: 'Total Crafting Time',
                value: Utils.formatTime(craftingTime)
            },
            totalMultiplier: {
                label: 'Total Efficiency',
                value: Utils.formatPercentage(totalMultiplier * 100)
            },
            materials: {
                label: 'Materials Needed',
                value: materials.map(m => `${m.item}: ${m.totalQuantity}`).join(', ')
            }
        };
    },

    // Switch calculator type
    switchCalculator(type) {
        if (this.calculators[type]) {
            this.currentCalculator = type;
            this.render(type);
        }
    },

    // Reset calculator
    resetCalculator() {
        if (this.currentCalculator) {
            this.render(this.currentCalculator);
        }
    },

    // Share results
    shareResults() {
        const inputs = this.getInputValues();
        const url = new URL(window.location);
        
        Object.keys(inputs).forEach(key => {
            url.searchParams.set(key, inputs[key]);
        });

        Utils.copyToClipboard(url.toString());
    },

    // Load creature data for calculator
    async loadCreatureData(creatureId) {
        try {
            const creature = await DataLoader.getItem('creatures', creatureId);
            if (creature && this.currentCalculator === 'taming') {
                // Update calculator with creature-specific data
                this.updateCreatureSpecificData(creature);
            }
        } catch (error) {
            console.error('Failed to load creature data:', error);
        }
    },

    // Update calculator with creature-specific data
    updateCreatureSpecificData(creature) {
        // Update preferred food, taming method, etc.
        const foodInfo = document.querySelector('.creature-food-info');
        if (foodInfo) {
            foodInfo.innerHTML = `
                <div class="creature-food">
                    <strong>Preferred Food:</strong> ${creature.taming_data.preferred_food.join(', ')}
                </div>
                <div class="creature-method">
                    <strong>Taming Method:</strong> ${creature.taming_data.taming_method}
                </div>
            `;
        }
    }
};
