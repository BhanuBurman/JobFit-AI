from typing import Any, Dict, Optional
from abc import ABC, abstractmethod

class BaseService(ABC):
    """Base service class for common service functionality"""
    
    def __init__(self):
        """Initialize the service"""
        pass
    
    @abstractmethod
    async def process(self, *args, **kwargs) -> Dict[str, Any]:
        """Abstract method that must be implemented by subclasses"""
        pass
    
    @abstractmethod
    async def validate(self, *args, **kwargs) -> bool:
        """Abstract validation method that must be implemented by subclasses"""
        pass
    
    def format_response(self, message: str, data: Any = None, success: bool = True) -> Dict[str, Any]:
        """
        Common response formatting method
        
        Args:
            message: Response message
            data: Response data
            success: Whether the operation was successful
            
        Returns:
            Dict containing formatted response
        """
        response = {
            "message": message,
            "success": success
        }
        
        if data is not None:
            response["data"] = data
            
        return response
    
    def validate_input(self, data: Any) -> bool:
        """
        Common validation method
        
        Args:
            data: Data to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        return data is not None 