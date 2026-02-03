from rest_framework import serializers
from .models import Lead, Opportunity, Activity
from apps.users.serializers import UserSerializer


class LeadSerializer(serializers.ModelSerializer):
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'customer', 'customer_name', 'name', 'phone', 'email',
            'source', 'source_display', 'status', 'status_display',
            'notes', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class OpportunitySerializer(serializers.ModelSerializer):
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'customer', 'customer_name', 'title', 'stage', 'stage_display',
            'value_estimate', 'close_date', 'assigned_to', 'assigned_to_email',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OpportunityStageSerializer(serializers.Serializer):
    """Serializer for stage change action."""
    stage = serializers.ChoiceField(choices=Opportunity.STAGE_CHOICES)


class ActivitySerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'type', 'type_display', 'notes', 'due_at', 'done_at',
            'customer', 'customer_name', 'opportunity', 'opportunity_title',
            'assigned_to', 'created_at', 'created_by', 'is_done'
        ]
        read_only_fields = ['id', 'created_at', 'created_by', 'is_done']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)
