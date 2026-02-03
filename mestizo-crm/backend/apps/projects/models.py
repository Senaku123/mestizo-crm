from django.db import models


class Project(models.Model):
    """Landscaping project model."""
    
    STATUS_CHOICES = [
        ('PLANNING', 'Planificación'),
        ('IN_PROGRESS', 'En Progreso'),
        ('DONE', 'Terminado'),
        ('MAINTENANCE', 'Mantenimiento'),
    ]
    
    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.CASCADE, related_name='projects'
    )
    quote = models.ForeignKey(
        'quotes.Quote', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='projects'
    )
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PLANNING')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.customer.name}"


class ProjectMedia(models.Model):
    """Media associated with a project (before/after/progress photos)."""
    
    MEDIA_TYPE_CHOICES = [
        ('BEFORE', 'Antes'),
        ('AFTER', 'Después'),
        ('PROGRESS', 'Progreso'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='PROGRESS')
    url = models.URLField(max_length=500)
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Media de Proyecto'
        verbose_name_plural = 'Media de Proyectos'
        ordering = ['media_type', '-created_at']
    
    def __str__(self):
        return f"{self.get_media_type_display()} - {self.project.title}"
