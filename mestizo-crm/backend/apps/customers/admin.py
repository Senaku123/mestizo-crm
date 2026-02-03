from django.contrib import admin
from .models import Customer, Contact, Address


class ContactInline(admin.TabularInline):
    model = Contact
    extra = 1


class AddressInline(admin.TabularInline):
    model = Address
    extra = 1


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'phone', 'email', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('name', 'email', 'phone')
    inlines = [ContactInline, AddressInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'customer', 'phone', 'email', 'role_title')
    list_filter = ('customer',)
    search_fields = ('name', 'email', 'phone')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('label', 'customer', 'city', 'zone')
    list_filter = ('city',)
    search_fields = ('city', 'zone', 'details')
