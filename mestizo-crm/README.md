# Mestizo CRM

Sistema de gestión (CRM) para negocios de paisajismo y productos de jardín. Incluye gestión de clientes, pipeline de ventas, cotizaciones, proyectos y catálogo de productos.

<p align="center">
  <img src="https://via.placeholder.com/800x400/2d5a27/fff?text=Mestizo+CRM" alt="Mestizo CRM" />
</p>

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose instalados
- Git

### Instalación con un solo comando

```bash
# Clonar el repositorio
git clone <repo-url> mestizo-crm
cd mestizo-crm

# Copiar archivo de configuración
cp .env.example .env

# Iniciar el sistema
./run.sh        # Linux/Mac
# o
run.bat         # Windows
```

Esto iniciará:
- **Backend API**: http://localhost:8000
- **Frontend Web**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:8000/api/schema/swagger/
- **Admin Django**: http://localhost:8000/admin/

### Credenciales de Demo

```
Email: demo@demo.com
Password: demo1234
```

## 📁 Estructura del Proyecto

```
mestizo-crm/
├── backend/                 # Django REST Framework API
│   ├── apps/               # Aplicaciones Django
│   │   ├── users/         # Usuarios y autenticación
│   │   ├── customers/     # Clientes, contactos, direcciones
│   │   ├── sales/         # Leads, oportunidades, actividades
│   │   ├── quotes/        # Cotizaciones y items
│   │   ├── projects/      # Proyectos y galería de fotos
│   │   └── catalog/       # Catálogo de productos/servicios
│   ├── config/            # Configuración Django
│   ├── tests/             # Tests de la API
│   └── requirements.txt   # Dependencias Python
├── frontend/               # React + Vite + TypeScript
│   └── src/
│       ├── api/           # Cliente API con Axios
│       ├── components/    # Componentes React
│       ├── context/       # Context de autenticación
│       ├── pages/         # Páginas de la aplicación
│       └── types/         # Tipos TypeScript
├── docker/                 # Dockerfiles
├── docker-compose.yml      # Orquestación de servicios
├── .env.example           # Variables de entorno de ejemplo
├── run.sh                 # Script de inicio (Linux/Mac)
└── run.bat                # Script de inicio (Windows)
```

## 🔧 Configuración

### Variables de Entorno (.env)

```bash
# Base de datos
POSTGRES_DB=mestizo_crm
POSTGRES_USER=mestizo
POSTGRES_PASSWORD=your_secure_password

# Django
SECRET_KEY=your_super_secret_key
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1

# Superusuario inicial
DJANGO_SUPERUSER_EMAIL=admin@mestizo.com
DJANGO_SUPERUSER_PASSWORD=admin123

# Datos de prueba
SEED_DATA=true

# Frontend
VITE_API_URL=http://localhost:8000/api
```

## 🛠️ Desarrollo

### Backend (Django)

```bash
# Entrar al contenedor
docker compose exec api bash

# Ejecutar migraciones manualmente
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Cargar datos de prueba
python manage.py seed_data

# Ejecutar tests
pytest
```

### Frontend (React)

```bash
# Entrar al contenedor
docker compose exec web sh

# Instalar dependencias
npm install

# El servidor de desarrollo se inicia automáticamente
```

## 📚 API Endpoints

### Autenticación
- `POST /api/token/` - Obtener tokens JWT
- `POST /api/token/refresh/` - Refrescar token

### Clientes
- `GET/POST /api/customers/` - Listar/crear clientes
- `GET/PUT/DELETE /api/customers/{id}/` - Detalle de cliente
- `POST /api/import/customers/` - Importar CSV

### Pipeline de Ventas
- `GET/POST /api/leads/` - Listar/crear leads
- `POST /api/import/leads/` - Importar CSV
- `GET/POST /api/opportunities/` - Listar/crear oportunidades
- `POST /api/opportunities/{id}/change_stage/` - Cambiar etapa
- `GET /api/dashboard/stats/` - Estadísticas

### Cotizaciones
- `GET/POST /api/quotes/` - Listar/crear cotizaciones
- `POST /api/quotes/{id}/change_status/` - Cambiar estado
- `GET/POST /api/quote-items/` - Items de cotización

### Proyectos
- `GET/POST /api/projects/` - Listar/crear proyectos
- `GET/POST /api/project-media/` - Galería de fotos

### Catálogo
- `GET/POST /api/catalog/` - Productos y servicios

## 📱 Características

- ✅ **Gestión de Clientes**: CRUD completo con contactos y direcciones
- ✅ **Pipeline de Ventas**: Tablero visual con etapas arrastrables
- ✅ **Cotizaciones**: Creación, items con cálculo automático de totales
- ✅ **Proyectos**: Galería antes/durante/después
- ✅ **Catálogo**: Productos y servicios para cotizaciones
- ✅ **Importación CSV**: Carga masiva de clientes y leads
- ✅ **Dashboard**: Estadísticas y métricas clave
- ✅ **Autenticación JWT**: Seguridad con tokens
- ✅ **API REST**: Documentada con Swagger

## 🧪 Tests

```bash
# Ejecutar todos los tests
docker compose exec api pytest

# Con cobertura
docker compose exec api pytest --cov=apps
```

## 📦 Producción

Para desplegar en producción:

1. Configurar variables de entorno seguras
2. Cambiar `DEBUG=false`
3. Configurar `ALLOWED_HOSTS` apropiadamente
4. Usar un servidor web como Nginx como reverse proxy
5. Configurar SSL/HTTPS

## 🤝 Contribución

1. Hacer fork del proyecto
2. Crear una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

Desarrollado con 🌿 para Mestizo
