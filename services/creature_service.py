from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from repositories.creature import CreatureRepository
from schemas.creature import CreatureCreate, CreatureUpdate, CreatureFilter, CreatureListResponse
from models.creature import Creature
import math

class CreatureService:
    def __init__(self, db: Session):
        self.repository = CreatureRepository(db)
    
    def get_creature(self, creature_id: int) -> Optional[Creature]:
        return self.repository.get(creature_id)
    
    def get_creature_by_name(self, name: str) -> Optional[Creature]:
        return self.repository.get_by_name(name)
    
    def get_creatures(
        self, 
        page: int = 1, 
        per_page: int = 20,
        filters: Optional[CreatureFilter] = None
    ) -> CreatureListResponse:
        skip = (page - 1) * per_page
        
        filter_dict = {}
        if filters:
            filter_dict = {
                "tier": filters.tier,
                "category": filters.category,
                "tameable": filters.tameable,
                "rideable": filters.rideable,
                "temperament": filters.temperament,
                "diet": filters.diet,
                "search": filters.search
            }
        
        creatures = self.repository.filter_creatures(filter_dict)
        total = len(creatures)
        
        # Apply pagination
        paginated_creatures = creatures[skip:skip + per_page]
        total_pages = math.ceil(total / per_page)
        
        return CreatureListResponse(
            creatures=paginated_creatures,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
    
    def create_creature(self, creature_data: CreatureCreate) -> Creature:
        creature_dict = creature_data.dict()
        
        # Convert Pydantic models to dicts for JSON storage
        if hasattr(creature_data.base_stats, 'dict'):
            creature_dict['base_stats'] = creature_data.base_stats.dict()
        
        return self.repository.create(creature_dict)
    
    def update_creature(self, creature_id: int, creature_data: CreatureUpdate) -> Optional[Creature]:
        creature = self.repository.get(creature_id)
        if not creature:
            return None
        
        update_dict = creature_data.dict(exclude_unset=True)
        
        # Convert Pydantic models to dicts for JSON storage
        if 'base_stats' in update_dict and hasattr(update_dict['base_stats'], 'dict'):
            update_dict['base_stats'] = update_dict['base_stats'].dict()
        
        return self.repository.update(creature, update_dict)
    
    def delete_creature(self, creature_id: int) -> bool:
        return self.repository.delete(creature_id)
    
    def search_creatures(self, query: str, limit: int = 10) -> List[Creature]:
        search_fields = ['name', 'species', 'description']
        return self.repository.search(query, search_fields)[:limit]
    
    def get_tiers(self) -> List[str]:
        return self.repository.get_tiers()
    
    def get_categories(self) -> List[str]:
        return self.repository.get_categories()
    
    def get_tameable_creatures(self) -> List[Creature]:
        return self.repository.get_tameable()
    
    def get_rideable_creatures(self) -> List[Creature]:
        return self.repository.get_rideable()
    
    def get_stats_summary(self) -> Dict[str, Any]:
        return self.repository.get_stats_summary()
    
    def get_creatures_by_tier(self, tier: str) -> List[Creature]:
        return self.repository.get_by_tier(tier)
    
    def get_creatures_by_category(self, category: str) -> List[Creature]:
        return self.repository.get_by_category(category)
    
    def calculate_taming_requirements(self, creature_id: int, target_level: int) -> Dict[str, Any]:
        creature = self.repository.get(creature_id)
        if not creature or not creature.tameable:
            return {"error": "Creature not found or not tameable"}
        
        # Basic taming calculation (can be expanded based on game mechanics)
        base_time = creature.taming_time_base or 30  # Default 30 minutes
        effectiveness = creature.taming_effectiveness or 1.0
        
        # Calculate total taming time based on level
        total_time = base_time * (1 + (target_level - 1) * 0.1)  # 10% increase per level
        
        # Calculate food requirements (simplified)
        preferred_foods = creature.preferred_foods or []
        food_requirements = {}
        
        for food in preferred_foods:
            # Simplified calculation - can be made more complex
            food_requirements[food] = max(1, int(target_level * effectiveness))
        
        return {
            "creature_name": creature.name,
            "target_level": target_level,
            "taming_method": creature.taming_method,
            "estimated_time_minutes": round(total_time, 1),
            "effectiveness": effectiveness,
            "required_food": food_requirements,
            "preferred_foods": preferred_foods
        }
