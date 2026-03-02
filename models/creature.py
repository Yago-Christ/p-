from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from models.base import BaseModel

class Creature(BaseModel):
    __tablename__ = "creatures"
    
    # Basic Information
    name = Column(String(100), nullable=False, index=True)
    species = Column(String(100), nullable=False)
    tier = Column(String(50), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    
    # Characteristics
    tameable = Column(Boolean, default=False)
    rideable = Column(Boolean, default=False)
    can_fly = Column(Boolean, default=False)
    can_swim = Column(Boolean, default=False)
    can_breed = Column(Boolean, default=False)
    
    # Behavior
    temperament = Column(String(50))  # aggressive, neutral, passive
    diet = Column(String(50))  # carnivore, herbivore, omnivore
    
    # Stats (stored as JSON for flexibility)
    base_stats = Column(JSON)  # health, stamina, oxygen, food, weight, melee, speed
    wild_multipliers = Column(JSON)
    tamed_multipliers = Column(JSON)
    
    # Taming Information
    taming_method = Column(String(50))  # knockout, passive, non-violent
    preferred_foods = Column(JSON)  # array of food items
    taming_effectiveness = Column(Float, default=1.0)
    taming_time_base = Column(Integer)  # in minutes
    
    # Drops and Resources
    drops = Column(JSON)  # items dropped on death
    harvestable_resources = Column(JSON)  # resources that can be harvested
    
    # Spawn Information
    spawn_locations = Column(JSON)  # array of spawn points
    spawn_conditions = Column(JSON)  # time, weather, etc.
    
    # Metadata
    description = Column(Text)
    wiki_url = Column(String(500))
    image_url = Column(String(500))
    
    # Game-specific data
    level_requirements = Column(JSON)  # required level to tame/ride
    saddle_blueprint = Column(String(100))
    special_abilities = Column(JSON)
