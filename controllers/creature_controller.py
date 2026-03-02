from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from services.creature_service import CreatureService
from schemas.creature import (
    CreatureResponse, 
    CreatureCreate, 
    CreatureUpdate, 
    CreatureFilter,
    CreatureListResponse
)

router = APIRouter(prefix="/creatures", tags=["creatures"])

def get_creature_service(db: Session = Depends(get_db)) -> CreatureService:
    return CreatureService(db)

@router.get("/", response_model=CreatureListResponse)
async def get_creatures(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    tier: Optional[str] = Query(None, description="Filter by tier"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tameable: Optional[bool] = Query(None, description="Filter by tameable status"),
    rideable: Optional[bool] = Query(None, description="Filter by rideable status"),
    temperament: Optional[str] = Query(None, description="Filter by temperament"),
    diet: Optional[str] = Query(None, description="Filter by diet"),
    search: Optional[str] = Query(None, description="Search term"),
    service: CreatureService = Depends(get_creature_service)
):
    """
    Retrieve creatures with optional filtering and pagination.
    """
    filters = CreatureFilter(
        tier=tier,
        category=category,
        tameable=tameable,
        rideable=rideable,
        temperament=temperament,
        diet=diet,
        search=search
    )
    
    return service.get_creatures(page=page, per_page=per_page, filters=filters)

@router.get("/{creature_id}", response_model=CreatureResponse)
async def get_creature(
    creature_id: int,
    service: CreatureService = Depends(get_creature_service)
):
    """
    Retrieve a specific creature by ID.
    """
    creature = service.get_creature(creature_id)
    if not creature:
        raise HTTPException(status_code=404, detail="Creature not found")
    return creature

@router.get("/name/{name}", response_model=CreatureResponse)
async def get_creature_by_name(
    name: str,
    service: CreatureService = Depends(get_creature_service)
):
    """
    Retrieve a specific creature by name.
    """
    creature = service.get_creature_by_name(name)
    if not creature:
        raise HTTPException(status_code=404, detail="Creature not found")
    return creature

@router.post("/", response_model=CreatureResponse)
async def create_creature(
    creature_data: CreatureCreate,
    service: CreatureService = Depends(get_creature_service)
):
    """
    Create a new creature.
    """
    return service.create_creature(creature_data)

@router.put("/{creature_id}", response_model=CreatureResponse)
async def update_creature(
    creature_id: int,
    creature_data: CreatureUpdate,
    service: CreatureService = Depends(get_creature_service)
):
    """
    Update an existing creature.
    """
    creature = service.update_creature(creature_id, creature_data)
    if not creature:
        raise HTTPException(status_code=404, detail="Creature not found")
    return creature

@router.delete("/{creature_id}")
async def delete_creature(
    creature_id: int,
    service: CreatureService = Depends(get_creature_service)
):
    """
    Delete a creature (soft delete).
    """
    success = service.delete_creature(creature_id)
    if not success:
        raise HTTPException(status_code=404, detail="Creature not found")
    return {"message": "Creature deleted successfully"}

@router.get("/search/{query}", response_model=List[CreatureResponse])
async def search_creatures(
    query: str,
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    service: CreatureService = Depends(get_creature_service)
):
    """
    Search creatures by name, species, or description.
    """
    return service.search_creatures(query, limit)

@router.get("/tiers/list", response_model=List[str])
async def get_tiers(service: CreatureService = Depends(get_creature_service)):
    """
    Get all available creature tiers.
    """
    return service.get_tiers()

@router.get("/categories/list", response_model=List[str])
async def get_categories(service: CreatureService = Depends(get_creature_service)):
    """
    Get all available creature categories.
    """
    return service.get_categories()

@router.get("/tameable/list", response_model=List[CreatureResponse])
async def get_tameable_creatures(service: CreatureService = Depends(get_creature_service)):
    """
    Get all tameable creatures.
    """
    return service.get_tameable_creatures()

@router.get("/rideable/list", response_model=List[CreatureResponse])
async def get_rideable_creatures(service: CreatureService = Depends(get_creature_service)):
    """
    Get all rideable creatures.
    """
    return service.get_rideable_creatures()

@router.get("/tier/{tier}", response_model=List[CreatureResponse])
async def get_creatures_by_tier(
    tier: str,
    service: CreatureService = Depends(get_creature_service)
):
    """
    Get all creatures of a specific tier.
    """
    return service.get_creatures_by_tier(tier)

@router.get("/category/{category}", response_model=List[CreatureResponse])
async def get_creatures_by_category(
    category: str,
    service: CreatureService = Depends(get_creature_service)
):
    """
    Get all creatures of a specific category.
    """
    return service.get_creatures_by_category(category)

@router.get("/stats/summary")
async def get_stats_summary(service: CreatureService = Depends(get_creature_service)):
    """
    Get summary statistics about creatures.
    """
    return service.get_stats_summary()

@router.get("/{creature_id}/taming-calculator")
async def calculate_taming_requirements(
    creature_id: int,
    target_level: int = Query(..., ge=1, le=500, description="Target creature level"),
    service: CreatureService = Depends(get_creature_service)
):
    """
    Calculate taming requirements for a specific creature.
    """
    result = service.calculate_taming_requirements(creature_id, target_level)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
