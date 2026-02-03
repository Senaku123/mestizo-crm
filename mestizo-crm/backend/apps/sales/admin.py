from django.contrib import admin
from .models import Lead, Opportunity, Activity


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'source', 'status', 'created_at')
    list_filter = ('status', 'source', 'created_at')
    search_fields = ('name', 'email', 'phone')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'stage', 'value_estimate', 'assigned_to', 'created_at')
    list_filter = ('stage', 'assigned_to', 'created_at')
    search_fields = ('title', 'customer__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('type', 'notes_short', 'customer', 'opportunity', 'due_at', 'is_done')
    list_filter = ('type', 'assigned_to')
    search_fields = ('notes',)
    readonly_fields = ('created_at',)
    
    def notes_short(self, obj):
        return obj.notes[:50] + '...' if len(obj.notes) > 50 else obj.notes
    notes_short.short_description = 'Notas'
    
    def is_done(self, obj):
        return obj.done_at is not None
    is_done.boolean = True
    is_done.short_description = 'Completada'
