import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, django_user_model):
    user = django_user_model.objects.create_user(
        email='test@test.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.mark.django_db
class TestAuthEndpoints:
    def test_token_obtain_requires_credentials(self, api_client):
        response = api_client.post('/api/token/', {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_token_obtain_with_valid_credentials(self, api_client, django_user_model):
        django_user_model.objects.create_user(
            email='user@test.com',
            password='testpass123'
        )
        response = api_client.post('/api/token/', {
            'email': 'user@test.com',
            'password': 'testpass123'
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data


@pytest.mark.django_db
class TestCustomerEndpoints:
    def test_list_customers_requires_auth(self, api_client):
        response = api_client.get('/api/customers/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_customers_authenticated(self, authenticated_client):
        client, user = authenticated_client
        response = client.get('/api/customers/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_create_customer(self, authenticated_client):
        client, user = authenticated_client
        response = client.post('/api/customers/', {
            'name': 'Test Customer',
            'type': 'INDIVIDUAL',
            'email': 'customer@test.com'
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Test Customer'


@pytest.mark.django_db
class TestLeadEndpoints:
    def test_list_leads_authenticated(self, authenticated_client):
        client, user = authenticated_client
        response = client.get('/api/leads/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_create_lead(self, authenticated_client):
        client, user = authenticated_client
        response = client.post('/api/leads/', {
            'name': 'Test Lead',
            'phone': '123456789',
            'source': 'WEB'
        })
        assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
class TestOpportunityEndpoints:
    def test_list_opportunities(self, authenticated_client):
        client, user = authenticated_client
        response = client.get('/api/opportunities/')
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestDashboardEndpoint:
    def test_dashboard_stats(self, authenticated_client):
        client, user = authenticated_client
        response = client.get('/api/dashboard/stats/')
        assert response.status_code == status.HTTP_200_OK
        assert 'leads' in response.data
        assert 'opportunities_by_stage' in response.data


@pytest.mark.django_db
class TestSwaggerEndpoint:
    def test_swagger_ui_accessible(self, api_client):
        response = api_client.get('/api/schema/swagger/')
        assert response.status_code == status.HTTP_200_OK
