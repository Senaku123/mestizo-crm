from django.contrib import admin
from .models import Quote, QuoteItem


class QuoteItemInline(admin.TabularInline):
    model = QuoteItem
    extra = 1


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'customer', 'status', 'total', 'valid_until', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer__name', 'notes')
    inlines = [QuoteItemInline]
    readonly_fields = ('total', 'created_at', 'updated_at')


@admin.register(QuoteItem)
class QuoteItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'quote', 'item_type', 'qty', 'unit_price', 'line_total')
    list_filter = ('item_type',)
    search_fields = ('name', 'description')
