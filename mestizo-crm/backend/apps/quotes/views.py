from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Quote, QuoteItem
from .serializers import (
    QuoteListSerializer, QuoteDetailSerializer, QuoteStatusSerializer,
    QuoteItemSerializer
)


class QuoteViewSet(viewsets.ModelViewSet):
    """ViewSet for Quote CRUD operations."""
    queryset = Quote.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'customer', 'opportunity']
    search_fields = ['customer__name', 'notes']
    ordering_fields = ['created_at', 'total', 'valid_until']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuoteListSerializer
        return QuoteDetailSerializer
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change the status of a quote."""
        quote = self.get_object()
        serializer = QuoteStatusSerializer(data=request.data)
        
        if serializer.is_valid():
            quote.status = serializer.validated_data['status']
            quote.save()
            return Response(QuoteDetailSerializer(quote).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuoteItemViewSet(viewsets.ModelViewSet):
    """ViewSet for QuoteItem CRUD operations."""
    queryset = QuoteItem.objects.all()
    serializer_class = QuoteItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quote', 'item_type']
