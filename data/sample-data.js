// Sample Data for Primal Fear Creatures (simplified version for demonstration)
window.PrimalFearData = {
    creatures: [
        {
            id: "alpha-rex",
            name: "Alpha Rex",
            slug: "alpha-rex",
            tier: "Alpha",
            category: "Dinosaur",
            diet: "Carnivore",
            temperament: "Aggressive",
            group: "Solo",
            tameable: true,
            taming_method: "Knockout",
            rideable: true,
            stats: {
                health: { base: 1500, wild_per_level: 300, tamed_per_level: 108, tamed_multiplier: 1.0 },
                stamina: { base: 200, wild_per_level: 20, tamed_per_level: 10, tamed_multiplier: 1.0 },
                oxygen: { base: 150, wild_per_level: 15, tamed_per_level: 10, tamed_multiplier: 1.0 },
                food: { base: 3000, wild_per_level: 300, tamed_per_level: 10, tamed_multiplier: 1.0 },
                weight: { base: 500, wild_per_level: 10, tamed_per_level: 10, tamed_multiplier: 1.0 },
                melee: { base: 100, wild_per_level: 5, tamed_per_level: 1, tamed_multiplier: 1.0 },
                movement_speed: { base: 100, wild_per_level: 0, tamed_per_level: 1, tamed_multiplier: 1.0 },
                torpor: { base: 800, wild_per_level: 80, tamed_per_level: 10, tamed_multiplier: 1.0 }
            },
            taming_data: {
                preferred_food: ["Exceptional Kibble", "Raw Prime Meat"],
                preferred_kibble: "Exceptional Kibble",
                taming_time_base: 120,
                taming_time_effective: 60,
                food_consumption_rate: 10,
                torpor_depletion_rate: 5,
                knockout_weapon: "Longneck Rifle",
                knockout_shots: 15,
                knockout_shots_head: 10
            },
            abilities: [
                { name: "Bite", description: "Powerful bite attack", damage: 80, cooldown: 1.5 },
                { name: "Roar", description: "Intimidating roar that damages nearby creatures", damage: 50, cooldown: 30 }
            ],
            drops: [
                { item: "Raw Prime Meat", quantity_min: 10, quantity_max: 25, chance: 100 },
                { item: "Alpha Rex Trophy", quantity_min: 1, quantity_max: 1, chance: 100 }
            ],
            spawn_locations: ["Island", "Center", "Ragnarok"],
            description: "The Alpha Rex is an enhanced version of the regular Rex with increased stats and special abilities.",
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Alpha_Rex",
                image_url: "/assets/images/creatures/alpha-rex.jpg",
                tags: ["alpha", "dinosaur", "carnivore", "tameable", "rideable"]
            }
        },
        {
            id: "beta-giga",
            name: "Beta Giganotosaurus",
            slug: "beta-giga",
            tier: "Beta",
            category: "Dinosaur",
            diet: "Carnivore",
            temperament: "Highly Aggressive",
            group: "Solo",
            tameable: true,
            taming_method: "Knockout",
            rideable: true,
            stats: {
                health: { base: 2000, wild_per_level: 400, tamed_per_level: 108, tamed_multiplier: 1.0 },
                stamina: { base: 250, wild_per_level: 25, tamed_per_level: 10, tamed_multiplier: 1.0 },
                oxygen: { base: 150, wild_per_level: 15, tamed_per_level: 10, tamed_multiplier: 1.0 },
                food: { base: 4000, wild_per_level: 400, tamed_per_level: 10, tamed_multiplier: 1.0 },
                weight: { base: 600, wild_per_level: 12, tamed_per_level: 10, tamed_multiplier: 1.0 },
                melee: { base: 120, wild_per_level: 6, tamed_per_level: 1, tamed_multiplier: 1.0 },
                movement_speed: { base: 100, wild_per_level: 0, tamed_per_level: 1, tamed_multiplier: 1.0 },
                torpor: { base: 1000, wild_per_level: 100, tamed_per_level: 10, tamed_multiplier: 1.0 }
            },
            taming_data: {
                preferred_food: ["Extraordinary Kibble", "Raw Prime Meat"],
                preferred_kibble: "Extraordinary Kibble",
                taming_time_base: 180,
                taming_time_effective: 90,
                food_consumption_rate: 15,
                torpor_depletion_rate: 8,
                knockout_weapon: "Longneck Rifle",
                knockout_shots: 20,
                knockout_shots_head: 15
            },
            abilities: [
                { name: "Bite", description: "Devastating bite attack", damage: 100, cooldown: 1.8 },
                { name: "Rage", description: "Berserk mode with increased damage", damage: 150, cooldown: 45 }
            ],
            drops: [
                { item: "Raw Prime Meat", quantity_min: 15, quantity_max: 30, chance: 100 },
                { item: "Beta Giga Trophy", quantity_min: 1, quantity_max: 1, chance: 100 }
            ],
            spawn_locations: ["Island", "Center", "Ragnarok", "Extinction"],
            description: "The Beta Giganotosaurus is a formidable predator with enhanced stats and rage abilities.",
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Beta_Giganotosaurus",
                image_url: "/assets/images/creatures/beta-giga.jpg",
                tags: ["beta", "dinosaur", "carnivore", "tameable", "rideable"]
            }
        },
        {
            id: "gamma-dragon",
            name: "Gamma Dragon",
            slug: "gamma-dragon",
            tier: "Gamma",
            category: "Dragon",
            diet: "Carnivore",
            temperament: "Aggressive",
            group: "Solo",
            tameable: true,
            taming_method: "Quest",
            rideable: true,
            stats: {
                health: { base: 2500, wild_per_level: 500, tamed_per_level: 108, tamed_multiplier: 1.0 },
                stamina: { base: 300, wild_per_level: 30, tamed_per_level: 10, tamed_multiplier: 1.0 },
                oxygen: { base: 150, wild_per_level: 15, tamed_per_level: 10, tamed_multiplier: 1.0 },
                food: { base: 5000, wild_per_level: 500, tamed_per_level: 10, tamed_multiplier: 1.0 },
                weight: { base: 700, wild_per_level: 14, tamed_per_level: 10, tamed_multiplier: 1.0 },
                melee: { base: 150, wild_per_level: 7.5, tamed_per_level: 1, tamed_multiplier: 1.0 },
                movement_speed: { base: 100, wild_per_level: 0, tamed_per_level: 1, tamed_multiplier: 1.0 },
                torpor: { base: 1200, wild_per_level: 120, tamed_per_level: 10, tamed_multiplier: 1.0 }
            },
            taming_data: {
                preferred_food: ["Special Dragon Kibble"],
                preferred_kibble: "Special Dragon Kibble",
                taming_time_base: 240,
                taming_time_effective: 120,
                food_consumption_rate: 20,
                torpor_depletion_rate: 10,
                knockout_weapon: "None",
                knockout_shots: 0,
                knockout_shots_head: 0
            },
            abilities: [
                { name: "Fire Breath", description: "Breathes fire that damages multiple targets", damage: 200, cooldown: 3 },
                { name: "Wing Attack", description: "Powerful wing attack", damage: 120, cooldown: 2 },
                { name: "Flight", description: "Can fly for extended periods", damage: 0, cooldown: 0 }
            ],
            drops: [
                { item: "Dragon Scales", quantity_min: 5, quantity_max: 15, chance: 100 },
                { item: "Gamma Dragon Trophy", quantity_min: 1, quantity_max: 1, chance: 100 }
            ],
            spawn_locations: ["Island", "Ragnarok", "Crystal Isles"],
            description: "The Gamma Dragon is a powerful flying creature with fire abilities and high stats.",
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Gamma_Dragon",
                image_url: "/assets/images/creatures/gamma-dragon.jpg",
                tags: ["gamma", "dragon", "carnivore", "tameable", "rideable", "flying"]
            }
        },
        {
            id: "delta-demon-lord",
            name: "Delta Demon Lord",
            slug: "delta-demon-lord",
            tier: "Delta",
            category: "Demon",
            diet: "Carnivore",
            temperament: "Extremely Aggressive",
            group: "Solo",
            tameable: true,
            taming_method: "Special",
            rideable: true,
            stats: {
                health: { base: 3000, wild_per_level: 600, tamed_per_level: 108, tamed_multiplier: 1.0 },
                stamina: { base: 350, wild_per_level: 35, tamed_per_level: 10, tamed_multiplier: 1.0 },
                oxygen: { base: 150, wild_per_level: 15, tamed_per_level: 10, tamed_multiplier: 1.0 },
                food: { base: 6000, wild_per_level: 600, tamed_per_level: 10, tamed_multiplier: 1.0 },
                weight: { base: 800, wild_per_level: 16, tamed_per_level: 10, tamed_multiplier: 1.0 },
                melee: { base: 180, wild_per_level: 9, tamed_per_level: 1, tamed_multiplier: 1.0 },
                movement_speed: { base: 100, wild_per_level: 0, tamed_per_level: 1, tamed_multiplier: 1.0 },
                torpor: { base: 1500, wild_per_level: 150, tamed_per_level: 10, tamed_multiplier: 1.0 }
            },
            taming_data: {
                preferred_food: ["Demon Heart", "Raw Prime Meat"],
                preferred_kibble: "Demon Kibble",
                taming_time_base: 300,
                taming_time_effective: 150,
                food_consumption_rate: 25,
                torpor_depletion_rate: 12,
                knockout_weapon: "Special Weapon",
                knockout_shots: 25,
                knockout_shots_head: 20
            },
            abilities: [
                { name: "Hellfire", description: "Burns targets with demonic fire", damage: 250, cooldown: 4 },
                { name: "Demon Roar", description: "Terrifying roar that weakens enemies", damage: 100, cooldown: 35 },
                { name: "Teleport", description: "Can teleport short distances", damage: 0, cooldown: 15 }
            ],
            drops: [
                { item: "Demon Heart", quantity_min: 1, quantity_max: 3, chance: 75 },
                { item: "Delta Demon Trophy", quantity_min: 1, quantity_max: 1, chance: 100 }
            ],
            spawn_locations: ["Aberration", "Genesis", "Extinction"],
            description: "The Delta Demon Lord is an extremely powerful demonic creature with fire and teleportation abilities.",
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Delta_Demon_Lord",
                image_url: "/assets/images/creatures/delta-demon-lord.jpg",
                tags: ["delta", "demon", "carnivore", "tameable", "rideable", "special"]
            }
        },
        {
            id: "epsilon-celestial",
            name: "Epsilon Celestial",
            slug: "epsilon-celestial",
            tier: "Epsilon",
            category: "Celestial",
            diet: "Omnivore",
            temperament: "Neutral",
            group: "Solo",
            tameable: true,
            taming_method: "Special",
            rideable: true,
            stats: {
                health: { base: 3500, wild_per_level: 700, tamed_per_level: 108, tamed_multiplier: 1.0 },
                stamina: { base: 400, wild_per_level: 40, tamed_per_level: 10, tamed_multiplier: 1.0 },
                oxygen: { base: 150, wild_per_level: 15, tamed_per_level: 10, tamed_multiplier: 1.0 },
                food: { base: 7000, wild_per_level: 700, tamed_per_level: 10, tamed_multiplier: 1.0 },
                weight: { base: 900, wild_per_level: 18, tamed_per_level: 10, tamed_multiplier: 1.0 },
                melee: { base: 200, wild_per_level: 10, tamed_per_level: 1, tamed_multiplier: 1.0 },
                movement_speed: { base: 100, wild_per_level: 0, tamed_per_level: 1, tamed_multiplier: 1.0 },
                torpor: { base: 1800, wild_per_level: 180, tamed_per_level: 10, tamed_multiplier: 1.0 }
            },
            taming_data: {
                preferred_food: ["Celestial Essence", "Exceptional Kibble"],
                preferred_kibble: "Celestial Kibble",
                taming_time_base: 360,
                taming_time_effective: 180,
                food_consumption_rate: 30,
                torpor_depletion_rate: 15,
                knockout_weapon: "None",
                knockout_shots: 0,
                knockout_shots_head: 0
            },
            abilities: [
                { name: "Cosmic Beam", description: "Powerful cosmic energy beam", damage: 300, cooldown: 5 },
                { name: "Healing Aura", description: "Heals itself and nearby allies", damage: -100, cooldown: 20 },
                { name: "Flight", description: "Can fly with cosmic energy", damage: 0, cooldown: 0 }
            ],
            drops: [
                { item: "Celestial Essence", quantity_min: 3, quantity_max: 8, chance: 100 },
                { item: "Epsilon Celestial Trophy", quantity_min: 1, quantity_max: 1, chance: 100 }
            ],
            spawn_locations: ["Genesis", "Crystal Isles", "Fjordur"],
            description: "The Epsilon Celestial is a divine creature with cosmic powers and healing abilities.",
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Epsilon_Celestial",
                image_url: "/assets/images/creatures/epsilon-celestial.jpg",
                tags: ["epsilon", "celestial", "omnivore", "tameable", "rideable", "healing"]
            }
        }
    ],

    items: [
        {
            id: "alpha-sword",
            name: "Alpha Sword",
            slug: "alpha-sword",
            category: "Weapon",
            subcategory: "Melee",
            tier: "Alpha",
            stack_size: 1,
            weight: 5,
            description: "A powerful sword forged from Alpha creature materials.",
            craftable: true,
            engram: {
                required_level: 50,
                points_cost: 30,
                prerequisites: ["Master Sword"]
            },
            crafting: {
                method: "Player",
                materials: [
                    { item: "Alpha Metal Ingot", quantity: 20 },
                    { item: "Alpha Hide", quantity: 15 },
                    { item: "Crystal", quantity: 10 }
                ],
                crafting_time: 30,
                craft_xp: 500
            },
            stats: {
                damage: 150,
                durability: 500,
                armor: 0
            },
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Alpha_Sword",
                image_url: "/assets/images/items/alpha-sword.jpg",
                tags: ["alpha", "weapon", "melee", "sword"]
            }
        },
        {
            id: "beta-armor",
            name: "Beta Armor Set",
            slug: "beta-armor",
            category: "Armor",
            subcategory: "Full Set",
            tier: "Beta",
            stack_size: 1,
            weight: 25,
            description: "Complete armor set made from Beta creature materials.",
            craftable: true,
            engram: {
                required_level: 60,
                points_cost: 40,
                prerequisites: ["Alpha Armor Set"]
            },
            crafting: {
                method: "Player",
                materials: [
                    { item: "Beta Metal Ingot", quantity: 40 },
                    { item: "Beta Hide", quantity: 30 },
                    { item: "Silica Pearls", quantity: 20 }
                ],
                crafting_time: 45,
                craft_xp: 750
            },
            stats: {
                damage: 0,
                durability: 800,
                armor: 150,
                hypothermal_insulation: 50,
                hyperthermal_insulation: 50
            },
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Beta_Armor_Set",
                image_url: "/assets/images/items/beta-armor.jpg",
                tags: ["beta", "armor", "full-set", "protection"]
            }
        }
    ],

    structures: [
        {
            id: "alpha-foundation",
            name: "Alpha Foundation",
            slug: "alpha-foundation",
            category: "Building",
            tier: "Alpha",
            health: 10000,
            description: "Extremely durable foundation made from Alpha materials.",
            craftable: true,
            engram: {
                required_level: 45,
                points_cost: 25,
                prerequisites: ["Metal Foundation"]
            },
            crafting: {
                method: "Player",
                materials: [
                    { item: "Alpha Metal Ingot", quantity: 15 },
                    { item: "Cementing Paste", quantity: 10 },
                    { item: "Crystal", quantity: 5 }
                ],
                crafting_time: 20,
                craft_xp: 300
            },
            dimensions: {
                width: 1,
                length: 1,
                height: 0.5
            },
            defense: {
                armor_rating: 200,
                damage_resistance: 75
            },
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Alpha_Foundation",
                image_url: "/assets/images/structures/alpha-foundation.jpg",
                tags: ["alpha", "building", "foundation", "structure"]
            }
        }
    ],

    resources: [
        {
            id: "alpha-metal",
            name: "Alpha Metal Ingot",
            slug: "alpha-metal",
            category: "Advanced",
            stack_size: 100,
            weight: 1,
            description: "Refined metal from Alpha creatures, used for high-tier crafting.",
            gathering: {
                methods: ["Smelting", "Drops"],
                tools: ["Refining Forge", "Industrial Forge"],
                creatures: [
                    { name: "Alpha Rex", efficiency: 25 },
                    { name: "Alpha Giga", efficiency: 30 }
                ]
            },
            drop_sources: [
                { source: "Alpha Creatures", quantity_min: 5, quantity_max: 15, chance: 100 },
                { source: "Alpha Bosses", quantity_min: 20, quantity_max: 50, chance: 100 }
            ],
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Alpha_Metal_Ingot",
                image_url: "/assets/images/resources/alpha-metal.jpg",
                tags: ["alpha", "metal", "advanced", "crafting"]
            }
        }
    ],

    bosses: [
        {
            id: "dragon-king",
            name: "Dragon King",
            slug: "dragon-king",
            tier: "Omega",
            category: "Boss",
            difficulty: "Extreme",
            health: 50000,
            description: "The ultimate boss of Primal Fear, requires maximum preparation.",
            requirements: {
                player_level: 150,
                items: [
                    { item: "Omega Trophy", quantity: 1 },
                    { item: "Boss Tribute", quantity: 10 }
                ],
                creatures: [
                    { creature: "Alpha Rex", level: 150, quantity: 1 },
                    { creature: "Beta Giga", level: 140, quantity: 1 }
                ]
            },
            abilities: [
                { name: "Ultimate Fire", description: "Devastating fire attack", damage: 1000, cooldown: 10 },
                { name: "Meteor Storm", description: "Calls down meteors", damage: 500, cooldown: 30 },
                { name: "Regeneration", description: "Heals rapidly", damage: -200, cooldown: 45 }
            ],
            drops: [
                { item: "Dragon King Trophy", quantity_min: 1, quantity_max: 1, chance: 100 },
                { item: "Omega Element", quantity_min: 100, quantity_max: 200, chance: 100 },
                { item: "Unique Blueprint", quantity_min: 1, quantity_max: 3, chance: 50 }
            ],
            location: "Dragon Arena",
            summoning: {
                method: "Tribute Terminal",
                requirements: ["Omega Trophy", "Boss Tribute x10"]
            },
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Dragon_King",
                image_url: "/assets/images/bosses/dragon-king.jpg",
                tags: ["omega", "boss", "dragon", "extreme", "ultimate"]
            }
        }
    ],

    progression: [
        {
            id: "alpha-tier",
            name: "Alpha Tier",
            slug: "alpha-tier",
            tier: "Alpha",
            description: "Entry level for enhanced creatures and items. Requires basic preparation.",
            requirements: {
                previous_tier: null,
                player_level: 40,
                creatures_unlocked: ["Alpha Rex", "Alpha Raptor"],
                items_unlocked: ["Alpha Sword", "Alpha Armor"],
                structures_unlocked: ["Alpha Foundation"]
            },
            features: {
                creatures: ["Alpha Rex", "Alpha Raptor", "Alpha Carno"],
                items: ["Alpha Weapons", "Alpha Armor", "Alpha Tools"],
                structures: ["Alpha Buildings"],
                resources: ["Alpha Metal", "Alpha Hide"],
                bosses: ["Alpha Broodmother"]
            },
            progression_path: ["beta-tier"],
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Alpha_Tier",
                image_url: "/assets/images/progression/alpha-tier.jpg",
                tags: ["alpha", "tier", "progression", "entry-level"]
            }
        },
        {
            id: "beta-tier",
            name: "Beta Tier",
            slug: "beta-tier",
            tier: "Beta",
            description: "Intermediate tier with significantly enhanced stats and abilities.",
            requirements: {
                previous_tier: "alpha-tier",
                player_level: 60,
                creatures_unlocked: ["Beta Giga", "Beta Dragon"],
                items_unlocked: ["Beta Weapons", "Beta Armor"],
                structures_unlocked: ["Beta Buildings"]
            },
            features: {
                creatures: ["Beta Giga", "Beta Dragon", "Beta Demon"],
                items: ["Beta Weapons", "Beta Armor", "Beta Tools"],
                structures: ["Beta Buildings"],
                resources: ["Beta Metal", "Beta Hide"],
                bosses: ["Beta Broodmother", "Beta Megapithecus"]
            },
            progression_path: ["gamma-tier"],
            metadata: {
                last_updated: "2024-01-15T10:00:00Z",
                wiki_url: "https://primalfear.wiki.gg/wiki/Beta_Tier",
                image_url: "/assets/images/progression/beta-tier.jpg",
                tags: ["beta", "tier", "progression", "intermediate"]
            }
        }
    ]
};
