from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from repositories.base import BaseRepository
from models.creature import Creature

class CreatureRepository(BaseRepository[Creature]):
    def __init__(self, db: Session):
        super().__init__(Creature, db)
    
    def get_by_name(self, name: str) -> Optional[Creature]:
        return self.db.query(Creature).filter(
            and_(
                Creature.name == name,
                Creature.is_active == True
            )
        ).first()
    
    def get_by_tier(self, tier: str) -> List[Creature]:
        return self.db.query(Creature).filter(
            and_(
                Creature.tier == tier,
                Creature.is_active == True
            )
        ).all()
    
    def get_by_category(self, category: str) -> List[Creature]:
        return self.db.query(Creature).filter(
            and_(
                Creature.category == category,
                Creature.is_active == True
            )
        ).all()
    
    def get_tameable(self) -> List[Creature]:
        return self.db.query(Creature).filter(
            and_(
                Creature.tameable == True,
                Creature.is_active == True
            )
        ).all()
    
    def get_rideable(self) -> List[Creature]:
        return self.db.query(Creature).filter(
            and_(
                Creature.rideable == True,
                Creature.is_active == True
            )
        ).all()
    
    def filter_creatures(self, filters: Dict[str, Any]) -> List[Creature]:
        query = self.db.query(Creature).filter(Creature.is_active == True)
        
        if filters.get("tier"):
            query = query.filter(Creature.tier == filters["tier"])
        
        if filters.get("category"):
            query = query.filter(Creature.category == filters["category"])
        
        if filters.get("tameable") is not None:
            query = query.filter(Creature.tameable == filters["tameable"])
        
        if filters.get("rideable") is not None:
            query = query.filter(Creature.rideable == filters["rideable"])
        
        if filters.get("temperament"):
            query = query.filter(Creature.temperament == filters["temperament"])
        
        if filters.get("diet"):
            query = query.filter(Creature.diet == filters["diet"])
        
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    Creature.name.ilike(search_term),
                    Creature.species.ilike(search_term),
                    Creature.description.ilike(search_term)
                )
            )
        
        return query.all()
    
    def get_tiers(self) -> List[str]:
        result = self.db.query(Creature.tier).filter(
            Creature.is_active == True
        ).distinct().all()
        return [tier[0] for tier in result]
    
    def get_categories(self) -> List[str]:
        result = self.db.query(Creature.category).filter(
            Creature.is_active == True
        ).distinct().all()
        return [category[0] for category in result]
    
    def get_stats_summary(self) -> Dict[str, Any]:
        total_creatures = self.db.query(Creature).filter(
            Creature.is_active == True
        ).count()
        
        tameable_count = self.db.query(Creature).filter(
            and_(
                Creature.tameable == True,
                Creature.is_active == True
            )
        ).count()
        
        rideable_count = self.db.query(Creature).filter(
            and_(
                Creature.rideable == True,
                Creature.is_active == True
            )
        ).count()
        
        return {
            "total_creatures": total_creatures,
            "tameable_count": tameable_count,
            "rideable_count": rideable_count,
            "tameable_percentage": round((tameable_count / total_creatures * 100) if total_creatures > 0 else 0, 2),
            "rideable_percentage": round((rideable_count / total_creatures * 100) if total_creatures > 0 else 0, 2)
        }
