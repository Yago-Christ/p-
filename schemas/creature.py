from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class CreatureStats(BaseModel):
    health: float
    stamina: float
    oxygen: float
    food: float
    weight: float
    melee: float
    speed: float
    torpor: Optional[float] = None

class CreatureBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., min_length=1, max_length=100)
    tier: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=50)
    tameable: bool = False
    rideable: bool = False
    can_fly: bool = False
    can_swim: bool = False
    can_breed: bool = False
    temperament: Optional[str] = None
    diet: Optional[str] = None
    base_stats: CreatureStats
    taming_method: Optional[str] = None
    preferred_foods: Optional[List[str]] = []
    taming_effectiveness: float = Field(ge=0.0, le=2.0, default=1.0)
    taming_time_base: Optional[int] = None
    description: Optional[str] = None
    wiki_url: Optional[str] = None
    image_url: Optional[str] = None
    
    @validator('temperament')
    def validate_temperament(cls, v):
        if v and v not in ['aggressive', 'neutral', 'passive', 'skittish']:
            raise ValueError('Temperament must be one of: aggressive, neutral, passive, skittish')
        return v
    
    @validator('diet')
    def validate_diet(cls, v):
        if v and v not in ['carnivore', 'herbivore', 'omnivore']:
            raise ValueError('Diet must be one of: carnivore, herbivore, omnivore')
        return v
    
    @validator('taming_method')
    def validate_taming_method(cls, v):
        if v and v not in ['knockout', 'passive', 'non-violent']:
            raise ValueError('Taming method must be one of: knockout, passive, non-violent')
        return v

class CreatureCreate(CreatureBase):
    pass

class CreatureUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    species: Optional[str] = Field(None, min_length=1, max_length=100)
    tier: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    tameable: Optional[bool] = None
    rideable: Optional[bool] = None
    can_fly: Optional[bool] = None
    can_swim: Optional[bool] = None
    can_breed: Optional[bool] = None
    temperament: Optional[str] = None
    diet: Optional[str] = None
    base_stats: Optional[CreatureStats] = None
    taming_method: Optional[str] = None
    preferred_foods: Optional[List[str]] = None
    taming_effectiveness: Optional[float] = Field(None, ge=0.0, le=2.0)
    taming_time_base: Optional[int] = None
    description: Optional[str] = None
    wiki_url: Optional[str] = None
    image_url: Optional[str] = None

class CreatureResponse(CreatureBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool
    
    class Config:
        from_attributes = True

class CreatureListResponse(BaseModel):
    creatures: List[CreatureResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class CreatureFilter(BaseModel):
    tier: Optional[str] = None
    category: Optional[str] = None
    tameable: Optional[bool] = None
    rideable: Optional[bool] = None
    temperament: Optional[str] = None
    diet: Optional[str] = None
    search: Optional[str] = None
