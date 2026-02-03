from django.db import models
from django.conf import settings
from decimal import Decimal


class Quote(models.Model):
    """Quote/Quotation model."""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Borrador'),
        ('SENT', 'Enviada'),
        ('ACCEPTED', 'Aceptada'),
        ('REJECTED', 'Rechazada'),
    ]
    
    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.CASCADE, related_name='quotes'
    )
    opportunity = models.ForeignKey(
        'sales.Opportunity', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='quotes'
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valid_until = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_quotes'
    )
    
    class Meta:
        verbose_name = 'Cotización'
        verbose_name_plural = 'Cotizaciones'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"COT-{self.id:04d} - {self.customer.name}"
    
    def recalculate_total(self):
        """Recalculate total from items."""
        total = sum(
            item.qty * item.unit_price for item in self.items.all()
        )
        self.total = total
        self.save(update_fields=['total'])
        return total


class QuoteItem(models.Model):
    """Line item in a quote."""
    
    TYPE_CHOICES = [
        ('PRODUCT', 'Producto'),
        ('SERVICE', 'Servicio'),
    ]
    
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='PRODUCT')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    qty = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = 'Item de Cotización'
        verbose_name_plural = 'Items de Cotización'
    
    def __str__(self):
        return f"{self.name} x {self.qty}"
    
    @property
    def line_total(self):
        return self.qty * self.unit_price
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.quote.recalculate_total()
    
    def delete(self, *args, **kwargs):
        quote = self.quote
        super().delete(*args, **kwargs)
        quote.recalculate_total()
