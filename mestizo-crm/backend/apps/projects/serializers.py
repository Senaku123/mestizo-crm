from rest_framework import serializers
from .models import Project, ProjectMedia


class ProjectMediaSerializer(serializers.ModelSerializer):
    media_type_display = serializers.CharField(source='get_media_type_display', read_only=True)
    
    class Meta:
        model = ProjectMedia
        fields = ['id', 'project', 'media_type', 'media_type_display', 'url', 'caption', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProjectListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'customer', 'customer_name', 'title', 'status', 'status_display',
            'start_date', 'end_date', 'created_at', 'media_count'
        ]
    
    def get_media_count(self, obj):
        return obj.media.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    quote_number = serializers.SerializerMethodField()
    media = ProjectMediaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'customer', 'customer_name', 'quote', 'quote_number',
            'title', 'status', 'status_display', 'start_date', 'end_date',
            'description', 'created_at', 'updated_at', 'media'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_quote_number(self, obj):
        if obj.quote:
            return f"COT-{obj.quote.id:04d}"
        return None
