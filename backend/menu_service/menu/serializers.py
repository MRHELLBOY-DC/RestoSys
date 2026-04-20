from rest_framework import serializers
from .models import Category, Product, ProductOption

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'restaurant_id']
        read_only_fields = ['restaurant_id']


class ProductOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOption
        fields = ['id', 'name', 'extra_price', 'product']


class ProductSerializer(serializers.ModelSerializer):
    options = ProductOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image', 'category', 'restaurant_id', 'options']
        read_only_fields = ['restaurant_id']