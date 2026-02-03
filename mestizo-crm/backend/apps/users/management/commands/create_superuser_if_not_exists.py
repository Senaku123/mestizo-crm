import os
from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = 'Create superuser if it does not exist'
    
    def handle(self, *args, **options):
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@mestizo.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin1234')
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Superuser {email} already exists'))
            return
        
        User.objects.create_superuser(
            email=email,
            password=password,
            first_name='Admin',
            last_name='Mestizo',
            role='ADMIN'
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser {email} created successfully'))
