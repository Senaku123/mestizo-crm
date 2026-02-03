from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CatalogItem
from .serializers import CatalogItemSerializer


class CatalogItemViewSet(viewsets.ModelViewSet):
    """ViewSet for CatalogItem CRUD operations."""
    queryset = CatalogItem.objects.all()
    serializer_class = CatalogItemSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'category', 'active']
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'price_ref', 'created_at']
    ordering = ['category', 'name']
