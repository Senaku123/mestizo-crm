from django.contrib import admin
from .models import CatalogItem


@admin.register(CatalogItem)
class CatalogItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'category', 'price_ref', 'active')
    list_filter = ('type', 'category', 'active')
    search_fields = ('name', 'description', 'category')
    list_editable = ('price_ref', 'active')
