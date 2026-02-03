from rest_framework import serializers
from .models import CatalogItem


class CatalogItemSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = CatalogItem
        fields = [
            'id', 'type', 'type_display', 'name', 'description',
            'category', 'price_ref', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_price_ref(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio de referencia no puede ser negativo")
        return value
