"""
Base classes for CQRS Commands
"""
from abc import ABC, abstractmethod
from typing import Dict, Type, Any


class Command(ABC):
    """Base class for all commands"""
    pass


class CommandHandler(ABC):
    """Base class for all command handlers"""
    
    @abstractmethod
    def handle(self, command: Command) -> Any:
        """Execute the command and return result"""
        pass


class CommandBus:
    """Bus for registering and executing commands"""
    
    def __init__(self):
        self._handlers: Dict[Type[Command], CommandHandler] = {}
    
    def register(self, command_class: Type[Command], handler: CommandHandler) -> None:
        """Register a handler for a command type"""
        self._handlers[command_class] = handler
    
    def execute(self, command: Command) -> Any:
        """Execute a command by dispatching to its handler"""
        handler = self._handlers.get(type(command))
        if not handler:
            raise ValueError(f"No handler registered for command {type(command).__name__}")
        return handler.handle(command)