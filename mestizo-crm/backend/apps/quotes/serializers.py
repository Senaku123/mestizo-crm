from rest_framework import serializers
from .models import Quote, QuoteItem


class QuoteItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = QuoteItem
        fields = [
            'id', 'quote', 'item_type', 'name', 'description',
            'qty', 'unit_price', 'line_total'
        ]
        read_only_fields = ['id']
    
    def validate_qty(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value
    
    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio unitario no puede ser negativo")
        return value


class QuoteListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quote
        fields = [
            'id', 'customer', 'customer_name', 'status', 'status_display',
            'total', 'valid_until', 'created_at', 'items_count'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()


class QuoteDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items = QuoteItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quote
        fields = [
            'id', 'customer', 'customer_name', 'opportunity', 'opportunity_title',
            'status', 'status_display', 'total', 'valid_until', 'notes',
            'created_at', 'updated_at', 'created_by', 'items'
        ]
        read_only_fields = ['id', 'total', 'created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class QuoteStatusSerializer(serializers.Serializer):
    """Serializer for status change action."""
    status = serializers.ChoiceField(choices=Quote.STATUS_CHOICES)
