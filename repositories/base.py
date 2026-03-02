from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import TypeVar, Generic, List, Optional, Dict, Any
from models.base import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def get(self, id: int) -> Optional[ModelType]:
        return self.db.query(self.model).filter(
            self.model.id == id,
            self.model.is_active == True
        ).first()
    
    def get_multi(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        query = self.db.query(self.model).filter(self.model.is_active == True)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    if isinstance(value, str) and "%" in value:
                        query = query.filter(getattr(self.model, key).like(value))
                    else:
                        query = query.filter(getattr(self.model, key) == value)
        
        return query.offset(skip).limit(limit).all()
    
    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def update(self, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: int) -> bool:
        obj = self.get(id)
        if obj:
            obj.is_active = False
            self.db.commit()
            return True
        return False
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        query = self.db.query(self.model).filter(self.model.is_active == True)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    if isinstance(value, str) and "%" in value:
                        query = query.filter(getattr(self.model, key).like(value))
                    else:
                        query = query.filter(getattr(self.model, key) == value)
        
        return query.count()
    
    def search(self, search_term: str, fields: List[str]) -> List[ModelType]:
        search_conditions = []
        for field in fields:
            if hasattr(self.model, field):
                search_conditions.append(
                    getattr(self.model, field).ilike(f"%{search_term}%")
                )
        
        if search_conditions:
            return self.db.query(self.model).filter(
                and_(
                    self.model.is_active == True,
                    or_(*search_conditions)
                )
            ).all()
        
        return []
