from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Project, ProjectMedia
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer, ProjectMediaSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Project CRUD operations."""
    queryset = Project.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'customer']
    search_fields = ['title', 'customer__name', 'description']
    ordering_fields = ['title', 'created_at', 'start_date', 'end_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectDetailSerializer


class ProjectMediaViewSet(viewsets.ModelViewSet):
    """ViewSet for ProjectMedia CRUD operations."""
    queryset = ProjectMedia.objects.all()
    serializer_class = ProjectMediaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'media_type']
