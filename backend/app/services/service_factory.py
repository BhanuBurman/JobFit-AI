from typing import Dict, Type
from app.services.base_service import BaseService
from app.services.query_service import QueryService
from app.services.user_service import UserService
from app.services.llm_service import OPENAIService

class ServiceFactory:
    """Factory class for creating and managing service instances"""
    
    _services: Dict[str, BaseService] = {}
    
    @classmethod
    def get_service(cls, service_type: str) -> BaseService:
        """
        Get or create a service instance
        
        Args:
            service_type: The type of service to get
            
        Returns:
            BaseService: The service instance
        """
        if service_type not in cls._services:
            cls._services[service_type] = cls._create_service(service_type)
        
        return cls._services[service_type]
    
    @classmethod
    def _create_service(cls, service_type: str) -> BaseService:
        """
        Create a new service instance
        
        Args:
            service_type: The type of service to create
            
        Returns:
            BaseService: The created service instance
        """
        service_map = {
            "query": QueryService,
            "user": UserService,
            "llm": OPENAIService,
            # Add more services here as needed
            # "search": SearchService,
        }
        
        if service_type not in service_map:
            raise ValueError(f"Unknown service type: {service_type}")
        
        return service_map[service_type]()
    
    @classmethod
    def clear_services(cls):
        """Clear all cached service instances"""
        cls._services.clear() 