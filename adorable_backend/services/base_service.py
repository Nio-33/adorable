from typing import Any, Dict, List, Optional, Type, TypeVar
from django.db import models, transaction
from django.core.exceptions import ValidationError

T = TypeVar('T', bound=models.Model)

class BaseService:
    """Base service class with common CRUD operations"""
    
    def __init__(self, model: Type[T]):
        self.model = model

    @transaction.atomic
    def create(self, data: Dict[str, Any]) -> T:
        """Create a new instance of the model"""
        instance = self.model(**data)
        instance.full_clean()
        instance.save()
        return instance

    def get(self, **kwargs) -> Optional[T]:
        """Get a single instance of the model"""
        try:
            return self.model.objects.get(**kwargs)
        except self.model.DoesNotExist:
            return None

    def filter(self, **kwargs) -> models.QuerySet:
        """Filter instances of the model"""
        return self.model.objects.filter(**kwargs)

    @transaction.atomic
    def update(self, instance: T, data: Dict[str, Any]) -> T:
        """Update an instance of the model"""
        for key, value in data.items():
            setattr(instance, key, value)
        instance.full_clean()
        instance.save()
        return instance

    @transaction.atomic
    def delete(self, instance: T) -> bool:
        """Delete an instance of the model"""
        try:
            instance.delete()
            return True
        except Exception:
            return False

    def exists(self, **kwargs) -> bool:
        """Check if instances matching the criteria exist"""
        return self.model.objects.filter(**kwargs).exists()

    def count(self, **kwargs) -> int:
        """Count instances matching the criteria"""
        return self.model.objects.filter(**kwargs).count()

    @transaction.atomic
    def bulk_create(self, data_list: List[Dict[str, Any]]) -> List[T]:
        """Bulk create instances of the model"""
        instances = [self.model(**data) for data in data_list]
        for instance in instances:
            instance.full_clean()
        return self.model.objects.bulk_create(instances)

    @transaction.atomic
    def bulk_update(self, instances: List[T], fields: List[str]) -> int:
        """Bulk update instances of the model"""
        for instance in instances:
            instance.full_clean()
        return self.model.objects.bulk_update(instances, fields)

    def get_or_create(self, defaults: Dict[str, Any] = None, **kwargs) -> tuple[T, bool]:
        """Get an existing instance or create a new one"""
        return self.model.objects.get_or_create(defaults=defaults, **kwargs) 