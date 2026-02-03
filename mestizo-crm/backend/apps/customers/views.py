import csv
import io
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Customer, Contact, Address
from .serializers import (
    CustomerListSerializer, CustomerDetailSerializer,
    ContactSerializer, AddressSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for Customer CRUD operations."""
    queryset = Customer.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        return CustomerDetailSerializer


class ContactViewSet(viewsets.ModelViewSet):
    """ViewSet for Contact CRUD operations."""
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['customer']
    search_fields = ['name', 'email', 'phone']


class AddressViewSet(viewsets.ModelViewSet):
    """ViewSet for Address CRUD operations."""
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['customer']
    search_fields = ['city', 'zone', 'details']


class ImportCustomersView(APIView):
    """Import customers from CSV file."""
    parser_classes = [MultiPartParser]
    
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No se proporcionó archivo'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decoded_file = file.read().decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded_file))
            
            created = 0
            errors = []
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    Customer.objects.create(
                        name=row.get('name', row.get('nombre', '')),
                        type=row.get('type', row.get('tipo', 'INDIVIDUAL')).upper(),
                        phone=row.get('phone', row.get('telefono', '')),
                        email=row.get('email', ''),
                        notes=row.get('notes', row.get('notas', '')),
                        created_by=request.user
                    )
                    created += 1
                except Exception as e:
                    errors.append(f"Fila {row_num}: {str(e)}")
            
            return Response({
                'created': created,
                'errors': errors[:10]  # Limit errors shown
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
