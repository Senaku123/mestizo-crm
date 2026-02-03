from django.db import models


class Customer(models.Model):
    """Customer model - can be individual or company."""
    
    TYPE_CHOICES = [
        ('INDIVIDUAL', 'Persona'),
        ('COMPANY', 'Empresa'),
    ]
    
    type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='INDIVIDUAL')
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_customers'
    )
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Contact(models.Model):
    """Contact person for a customer."""
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    role_title = models.CharField(max_length=100, blank=True, verbose_name='Cargo')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Contacto'
        verbose_name_plural = 'Contactos'
    
    def __str__(self):
        return f"{self.name} ({self.customer.name})"


class Address(models.Model):
    """Address for a customer."""
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, default='Principal', verbose_name='Etiqueta')
    city = models.CharField(max_length=100, blank=True, verbose_name='Ciudad')
    zone = models.CharField(max_length=100, blank=True, verbose_name='Zona/Barrio')
    details = models.TextField(blank=True, verbose_name='Detalles')
    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Dirección'
        verbose_name_plural = 'Direcciones'
    
    def __str__(self):
        return f"{self.label} - {self.customer.name}"
