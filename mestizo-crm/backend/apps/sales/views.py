import csv
import io
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Sum

from .models import Lead, Opportunity, Activity
from .serializers import (
    LeadSerializer, OpportunitySerializer, OpportunityStageSerializer,
    ActivitySerializer
)
from apps.quotes.models import Quote


class LeadViewSet(viewsets.ModelViewSet):
    """ViewSet for Lead CRUD operations."""
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'source', 'customer']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at', 'status']
    ordering = ['-created_at']


class OpportunityViewSet(viewsets.ModelViewSet):
    """ViewSet for Opportunity CRUD operations."""
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['stage', 'customer', 'assigned_to']
    search_fields = ['title', 'customer__name']
    ordering_fields = ['title', 'created_at', 'value_estimate', 'close_date']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def change_stage(self, request, pk=None):
        """Change the stage of an opportunity."""
        opportunity = self.get_object()
        serializer = OpportunityStageSerializer(data=request.data)
        
        if serializer.is_valid():
            opportunity.stage = serializer.validated_data['stage']
            opportunity.save()
            return Response(OpportunitySerializer(opportunity).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivityViewSet(viewsets.ModelViewSet):
    """ViewSet for Activity CRUD operations."""
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'customer', 'opportunity', 'assigned_to']
    search_fields = ['notes']
    ordering_fields = ['due_at', 'created_at', 'done_at']
    ordering = ['-due_at']
    
    @action(detail=True, methods=['post'])
    def mark_done(self, request, pk=None):
        """Mark an activity as done."""
        from django.utils import timezone
        activity = self.get_object()
        activity.done_at = timezone.now()
        activity.save()
        return Response(ActivitySerializer(activity).data)


class ImportLeadsView(APIView):
    """Import leads from CSV file."""
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
                    Lead.objects.create(
                        name=row.get('name', row.get('nombre', '')),
                        phone=row.get('phone', row.get('telefono', '')),
                        email=row.get('email', ''),
                        source=row.get('source', row.get('fuente', 'OTHER')).upper(),
                        notes=row.get('notes', row.get('notas', '')),
                        created_by=request.user
                    )
                    created += 1
                except Exception as e:
                    errors.append(f"Fila {row_num}: {str(e)}")
            
            return Response({
                'created': created,
                'errors': errors[:10]
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    """Dashboard statistics endpoint."""
    
    def get(self, request):
        # Leads count by status
        leads_new = Lead.objects.filter(status='NEW').count()
        leads_qualified = Lead.objects.filter(status='QUALIFIED').count()
        
        # Opportunities by stage
        opportunities_by_stage = {}
        for stage_code, stage_name in Opportunity.STAGE_CHOICES:
            opportunities_by_stage[stage_code] = Opportunity.objects.filter(stage=stage_code).count()
        
        # Total opportunity value
        total_pipeline_value = Opportunity.objects.exclude(
            stage__in=['WON', 'LOST']
        ).aggregate(total=Sum('value_estimate'))['total'] or 0
        
        # Quotes pending
        quotes_draft = Quote.objects.filter(status='DRAFT').count()
        quotes_sent = Quote.objects.filter(status='SENT').count()
        
        # Activities pending
        activities_pending = Activity.objects.filter(done_at__isnull=True).count()
        
        return Response({
            'leads': {
                'new': leads_new,
                'qualified': leads_qualified,
            },
            'opportunities_by_stage': opportunities_by_stage,
            'total_pipeline_value': float(total_pipeline_value),
            'quotes': {
                'draft': quotes_draft,
                'sent': quotes_sent,
            },
            'activities_pending': activities_pending,
        })
