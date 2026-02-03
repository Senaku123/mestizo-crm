from django.db import models
from django.conf import settings


class Lead(models.Model):
    """Lead model for potential customers."""
    
    SOURCE_CHOICES = [
        ('WEB', 'Página Web'),
        ('IG', 'Instagram'),
        ('WHATSAPP', 'WhatsApp'),
        ('REFERRAL', 'Referido'),
        ('OTHER', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('NEW', 'Nuevo'),
        ('QUALIFIED', 'Calificado'),
        ('DISQUALIFIED', 'Descartado'),
        ('CONVERTED', 'Convertido'),
    ]
    
    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='leads'
    )
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    source = models.CharField(max_length=15, choices=SOURCE_CHOICES, default='OTHER')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='NEW')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_leads'
    )
    
    class Meta:
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_source_display()})"


class Opportunity(models.Model):
    """Opportunity in the sales pipeline."""
    
    STAGE_CHOICES = [
        ('NEW', 'Nuevo'),
        ('CONTACTED', 'Contactado'),
        ('VISIT_SCHEDULED', 'Visita Agendada'),
        ('QUOTE_SENT', 'Cotización Enviada'),
        ('NEGOTIATION', 'En Negociación'),
        ('WON', 'Ganado'),
        ('LOST', 'Perdido'),
    ]
    
    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.CASCADE, related_name='opportunities'
    )
    title = models.CharField(max_length=200)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='NEW')
    value_estimate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    close_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_opportunities'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Oportunidad'
        verbose_name_plural = 'Oportunidades'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.customer.name}"


class Activity(models.Model):
    """Activity/task related to customer or opportunity."""
    
    TYPE_CHOICES = [
        ('CALL', 'Llamada'),
        ('WHATSAPP', 'WhatsApp'),
        ('EMAIL', 'Email'),
        ('VISIT', 'Visita'),
        ('TASK', 'Tarea'),
    ]
    
    type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='TASK')
    notes = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    done_at = models.DateTimeField(null=True, blank=True)
    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.CASCADE,
        null=True, blank=True, related_name='activities'
    )
    opportunity = models.ForeignKey(
        Opportunity, on_delete=models.CASCADE,
        null=True, blank=True, related_name='activities'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_activities'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_activities'
    )
    
    class Meta:
        verbose_name = 'Actividad'
        verbose_name_plural = 'Actividades'
        ordering = ['-due_at', '-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.notes[:50]}"
    
    @property
    def is_done(self):
        return self.done_at is not None
