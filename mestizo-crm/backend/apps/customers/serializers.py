from rest_framework import serializers
from .models import Customer, Contact, Address


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'customer', 'name', 'phone', 'email', 'role_title', 'created_at']
        read_only_fields = ['id', 'created_at']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'customer', 'label', 'city', 'zone', 'details', 'lat', 'lng', 'created_at']
        read_only_fields = ['id', 'created_at']


class CustomerListSerializer(serializers.ModelSerializer):
    """Serializer for customer list view."""
    contacts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = ['id', 'type', 'name', 'phone', 'email', 'created_at', 'contacts_count']
        read_only_fields = ['id', 'created_at']
    
    def get_contacts_count(self, obj):
        return obj.contacts.count()


class CustomerDetailSerializer(serializers.ModelSerializer):
    """Serializer for customer detail with nested contacts and addresses."""
    contacts = ContactSerializer(many=True, read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'type', 'name', 'phone', 'email', 'notes',
            'created_at', 'updated_at', 'created_by', 'created_by_email',
            'contacts', 'addresses'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)
