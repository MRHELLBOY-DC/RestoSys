from dataclasses import dataclass
from typing import Any


@dataclass(kw_only=True)
class Entity:
    id: Any = None

    @property
    def identity(self):
        return self.id
