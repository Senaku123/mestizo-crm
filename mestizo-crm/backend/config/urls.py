"""
URL configuration for Mestizo CRM project.
"""
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.customers.views import AddressViewSet, ContactViewSet, CustomerViewSet
from apps.sales.views import ActivityViewSet, LeadViewSet, OpportunityViewSet, DashboardStatsView
from apps.quotes.views import QuoteViewSet, QuoteItemViewSet
from apps.projects.views import ProjectViewSet, ProjectMediaViewSet
from apps.catalog.views import CatalogItemViewSet
from apps.customers.views import ImportCustomersView
from apps.sales.views import ImportLeadsView

# API Router
router = DefaultRouter()

# Customers
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'addresses', AddressViewSet, basename='address')

# Sales
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')
router.register(r'activities', ActivityViewSet, basename='activity')

# Quotes
router.register(r'quotes', QuoteViewSet, basename='quote')
router.register(r'quote-items', QuoteItemViewSet, basename='quote-item')

# Projects
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-media', ProjectMediaViewSet, basename='project-media')

# Catalog
router.register(r'catalog', CatalogItemViewSet, basename='catalog')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API
    path('api/', include(router.urls)),
    
    # Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Import endpoints
    path('api/import/customers/', ImportCustomersView.as_view(), name='import-customers'),
    path('api/import/leads/', ImportLeadsView.as_view(), name='import-leads'),
    
    # Dashboard
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # OpenAPI Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
