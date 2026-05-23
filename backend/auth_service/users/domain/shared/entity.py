class EntityMixin:
    @property
    def identity(self):
        return self.pk
