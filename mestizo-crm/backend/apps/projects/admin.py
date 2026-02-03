from django.contrib import admin
from .models import Project, ProjectMedia


class ProjectMediaInline(admin.TabularInline):
    model = ProjectMedia
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'status', 'start_date', 'end_date', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'customer__name', 'description')
    inlines = [ProjectMediaInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ProjectMedia)
class ProjectMediaAdmin(admin.ModelAdmin):
    list_display = ('project', 'media_type', 'caption', 'created_at')
    list_filter = ('media_type',)
    search_fields = ('caption', 'project__title')
