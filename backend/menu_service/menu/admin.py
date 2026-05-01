from django.contrib import admin
from .infrastructure.models import Category, Product, ProductOption


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'restaurant_id']
    list_filter = ['restaurant_id']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'price', 'category', 'restaurant_id']
    list_filter = ['restaurant_id', 'category']
    search_fields = ['name']


@admin.register(ProductOption)
class ProductOptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'extra_price', 'product']
    list_filter = ['product']
    search_fields = ['name']