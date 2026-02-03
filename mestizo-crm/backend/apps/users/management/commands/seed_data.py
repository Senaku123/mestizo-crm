import os
from decimal import Decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.customers.models import Customer, Contact, Address
from apps.sales.models import Lead, Opportunity, Activity
from apps.quotes.models import Quote, QuoteItem
from apps.projects.models import Project, ProjectMedia
from apps.catalog.models import CatalogItem


class Command(BaseCommand):
    help = 'Seed database with demo data'
    
    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create demo user
        demo_email = os.environ.get('DEMO_USER_EMAIL', 'demo@demo.com')
        demo_password = os.environ.get('DEMO_USER_PASSWORD', 'demo1234')
        
        demo_user, created = User.objects.get_or_create(
            email=demo_email,
            defaults={
                'first_name': 'Demo',
                'last_name': 'User',
                'role': 'SALES',
                'is_staff': True,
            }
        )
        if created:
            demo_user.set_password(demo_password)
            demo_user.save()
            self.stdout.write(self.style.SUCCESS(f'Demo user created: {demo_email}'))
        
        # Create sales user
        sales_user, _ = User.objects.get_or_create(
            email='ventas@mestizo.com',
            defaults={
                'first_name': 'Juan',
                'last_name': 'Pérez',
                'role': 'SALES',
            }
        )
        if _:
            sales_user.set_password('ventas123')
            sales_user.save()
        
        # Create catalog items
        catalog_items = [
            ('PRODUCT', 'Palmera Phoenix', 'Plantas', 15000),
            ('PRODUCT', 'Césped Bermuda (m2)', 'Césped', 850),
            ('PRODUCT', 'Piedra Blanca (bolsa)', 'Decoración', 1200),
            ('PRODUCT', 'Maceta Cerámica Grande', 'Macetas', 4500),
            ('PRODUCT', 'Sistema de Riego por Goteo', 'Riego', 8500),
            ('SERVICE', 'Diseño de Jardín', 'Servicios', 25000),
            ('SERVICE', 'Instalación de Riego', 'Servicios', 18000),
            ('SERVICE', 'Mantenimiento Mensual', 'Servicios', 12000),
            ('SERVICE', 'Poda de Árboles', 'Servicios', 8000),
            ('PRODUCT', 'Arbusto Buxus', 'Plantas', 3500),
        ]
        
        for item_type, name, category, price in catalog_items:
            CatalogItem.objects.get_or_create(
                name=name,
                defaults={
                    'type': item_type,
                    'category': category,
                    'price_ref': Decimal(str(price)),
                    'active': True,
                }
            )
        self.stdout.write(self.style.SUCCESS('Catalog items created'))
        
        # Create customers
        customers_data = [
            ('COMPANY', 'Hotel Paradise', '011-4567-8901', 'contacto@hotelparadise.com'),
            ('INDIVIDUAL', 'María García', '011-2345-6789', 'maria.garcia@email.com'),
            ('COMPANY', 'Country Club Norte', '011-3456-7890', 'admin@countrynorte.com'),
            ('INDIVIDUAL', 'Roberto Fernández', '011-4567-8901', 'roberto.f@email.com'),
            ('COMPANY', 'Edificio Torres del Sol', '011-5678-9012', 'consorcio@torressol.com'),
        ]
        
        customers = []
        for ctype, name, phone, email in customers_data:
            customer, _ = Customer.objects.get_or_create(
                name=name,
                defaults={
                    'type': ctype,
                    'phone': phone,
                    'email': email,
                    'created_by': demo_user,
                }
            )
            customers.append(customer)
        self.stdout.write(self.style.SUCCESS('Customers created'))
        
        # Add contacts to company customers
        if customers[0].contacts.count() == 0:
            Contact.objects.create(
                customer=customers[0],
                name='Carlos Manager',
                phone='011-4567-8902',
                email='carlos@hotelparadise.com',
                role_title='Gerente General'
            )
        
        if customers[2].contacts.count() == 0:
            Contact.objects.create(
                customer=customers[2],
                name='Ana Directora',
                phone='011-3456-7891',
                email='ana@countrynorte.com',
                role_title='Directora de Operaciones'
            )
        
        # Add addresses
        if customers[0].addresses.count() == 0:
            Address.objects.create(
                customer=customers[0],
                label='Hotel Principal',
                city='Buenos Aires',
                zone='Palermo',
                details='Av. Santa Fe 1234'
            )
        
        if customers[1].addresses.count() == 0:
            Address.objects.create(
                customer=customers[1],
                label='Casa',
                city='Buenos Aires',
                zone='Belgrano',
                details='Calle Libertador 567'
            )
        
        # Create leads
        leads_data = [
            ('Laura Martínez', '011-6789-0123', 'IG', 'NEW'),
            ('Pedro Sánchez', '011-7890-1234', 'WHATSAPP', 'QUALIFIED'),
            ('Empresa ABC', '011-8901-2345', 'WEB', 'NEW'),
            ('Residencial Los Pinos', '011-9012-3456', 'REFERRAL', 'QUALIFIED'),
        ]
        
        for name, phone, source, status in leads_data:
            Lead.objects.get_or_create(
                name=name,
                defaults={
                    'phone': phone,
                    'source': source,
                    'status': status,
                    'created_by': demo_user,
                }
            )
        self.stdout.write(self.style.SUCCESS('Leads created'))
        
        # Create opportunities
        opportunities_data = [
            (customers[0], 'Rediseño jardines Hotel', 'QUOTE_SENT', 150000),
            (customers[1], 'Jardín residencia familiar', 'CONTACTED', 45000),
            (customers[2], 'Mantenimiento áreas verdes', 'NEGOTIATION', 25000),
            (customers[3], 'Instalación sistema riego', 'VISIT_SCHEDULED', 35000),
            (customers[4], 'Paisajismo terraza', 'NEW', 80000),
        ]
        
        opportunities = []
        for customer, title, stage, value in opportunities_data:
            opp, _ = Opportunity.objects.get_or_create(
                customer=customer,
                title=title,
                defaults={
                    'stage': stage,
                    'value_estimate': Decimal(str(value)),
                    'assigned_to': sales_user,
                    'close_date': date.today() + timedelta(days=30),
                }
            )
            opportunities.append(opp)
        self.stdout.write(self.style.SUCCESS('Opportunities created'))
        
        # Create activities
        if Activity.objects.count() == 0:
            Activity.objects.create(
                type='CALL',
                notes='Llamar para confirmar presupuesto',
                due_at=timezone.now() + timedelta(days=1),
                opportunity=opportunities[0],
                customer=customers[0],
                assigned_to=sales_user,
                created_by=demo_user,
            )
            Activity.objects.create(
                type='VISIT',
                notes='Visita de relevamiento',
                due_at=timezone.now() + timedelta(days=3),
                opportunity=opportunities[3],
                customer=customers[3],
                assigned_to=sales_user,
                created_by=demo_user,
            )
            Activity.objects.create(
                type='WHATSAPP',
                notes='Enviar catálogo de plantas',
                due_at=timezone.now() + timedelta(hours=2),
                customer=customers[1],
                assigned_to=demo_user,
                created_by=demo_user,
            )
        self.stdout.write(self.style.SUCCESS('Activities created'))
        
        # Create quotes
        if Quote.objects.count() == 0:
            quote1 = Quote.objects.create(
                customer=customers[0],
                opportunity=opportunities[0],
                status='SENT',
                valid_until=date.today() + timedelta(days=15),
                notes='Cotización para rediseño completo de jardines',
                created_by=demo_user,
            )
            QuoteItem.objects.create(
                quote=quote1,
                item_type='SERVICE',
                name='Diseño de Jardín',
                qty=1,
                unit_price=Decimal('25000'),
            )
            QuoteItem.objects.create(
                quote=quote1,
                item_type='PRODUCT',
                name='Palmera Phoenix',
                qty=10,
                unit_price=Decimal('15000'),
            )
            QuoteItem.objects.create(
                quote=quote1,
                item_type='PRODUCT',
                name='Césped Bermuda (m2)',
                qty=200,
                unit_price=Decimal('850'),
            )
            
            quote2 = Quote.objects.create(
                customer=customers[1],
                status='DRAFT',
                valid_until=date.today() + timedelta(days=30),
                notes='Presupuesto jardín residencial',
                created_by=demo_user,
            )
            QuoteItem.objects.create(
                quote=quote2,
                item_type='SERVICE',
                name='Diseño de Jardín',
                qty=1,
                unit_price=Decimal('15000'),
            )
            QuoteItem.objects.create(
                quote=quote2,
                item_type='PRODUCT',
                name='Sistema de Riego por Goteo',
                qty=1,
                unit_price=Decimal('8500'),
            )
        self.stdout.write(self.style.SUCCESS('Quotes created'))
        
        # Create projects
        if Project.objects.count() == 0:
            project = Project.objects.create(
                customer=customers[2],
                title='Mantenimiento Country Club Norte',
                status='IN_PROGRESS',
                start_date=date.today() - timedelta(days=30),
                description='Mantenimiento mensual de áreas verdes del country club',
            )
            ProjectMedia.objects.create(
                project=project,
                media_type='BEFORE',
                url='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                caption='Estado inicial del jardín principal'
            )
            ProjectMedia.objects.create(
                project=project,
                media_type='PROGRESS',
                url='https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
                caption='Avance de trabajos - semana 2'
            )
        self.stdout.write(self.style.SUCCESS('Projects created'))
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write(self.style.SUCCESS(f'Demo user: {demo_email} / {demo_password}'))
