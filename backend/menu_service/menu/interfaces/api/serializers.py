"""
Serializers para la API
"""
from rest_framework import serializers
from decimal import Decimal
from ...domain.entities import Category, Product, ProductOption


class CategorySerializer(serializers.Serializer):
    """Serializer para Category"""
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    restaurant_id = serializers.IntegerField(read_only=True)


class ProductOptionSerializer(serializers.Serializer):
    """Serializer para ProductOption"""
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    extra_price = serializers.DecimalField(max_digits=10, decimal_places=2,coerce_to_string=True)
    product_id = serializers.IntegerField()


class ProductSerializer(serializers.Serializer):
    """Serializer para Product"""
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=True)
    description = serializers.CharField(required=False, allow_blank=True)
    image = serializers.CharField(required=False, allow_blank=True)
    category_id = serializers.IntegerField()
    restaurant_id = serializers.IntegerField(read_only=True)
    options = ProductOptionSerializer(many=True, read_only=True)