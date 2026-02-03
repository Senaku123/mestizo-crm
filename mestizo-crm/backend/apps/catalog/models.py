from django.db import models


class CatalogItem(models.Model):
    """Catalog item for products or services."""
    
    TYPE_CHOICES = [
        ('PRODUCT', 'Producto'),
        ('SERVICE', 'Servicio'),
    ]
    
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='PRODUCT')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    price_ref = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name='Precio de Referencia'
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Item de Catálogo'
        verbose_name_plural = 'Items de Catálogo'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
