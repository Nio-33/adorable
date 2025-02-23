# Adorable Backend

Backend service for the Adorable location-based social discovery platform.

## Project Structure

```
adorable_backend/
├── apps/                    # Django applications
│   ├── users/              # User management
│   ├── locations/          # Location and places
│   ├── social/             # Social features
│   └── storage/            # File storage
│
├── core/                   # Core functionality
│   ├── auth/              # Authentication
│   ├── permissions/       # Custom permissions
│   └── pagination/        # Pagination classes
│
├── config/                 # Configuration
│   ├── settings/          # Django settings
│   │   ├── base.py       # Base settings
│   │   ├── local.py      # Local development
│   │   └── production.py # Production settings
│   └── urls/             # URL configurations
│
├── services/              # External services
│   ├── firebase/         # Firebase integration
│   ├── mapbox/           # MapBox integration
│   ├── email/            # Email service
│   └── storage/          # Storage service
│
├── utils/                 # Utility modules
│   ├── decorators/       # Custom decorators
│   ├── middleware/       # Custom middleware
│   └── validators/       # Custom validators
│
├── media/                 # User-uploaded files
│   ├── uploads/          # General uploads
│   ├── profile_pics/     # Profile pictures
│   └── place_photos/     # Place photographs
│
├── static/               # Static files
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript
│   └── img/             # Images
│
├── docs/                 # Documentation
│   ├── api/             # API documentation
│   ├── deployment/      # Deployment guides
│   └── development/     # Development guides
│
└── tests/               # Test suite
    ├── unit/           # Unit tests
    ├── integration/    # Integration tests
    └── e2e/            # End-to-end tests
```

## Setup Instructions

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Unix
# or
.\venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize database:
```bash
python manage.py migrate
```

5. Start development server:
```bash
python manage.py runserver
```

## Docker Setup

1. Build and start services:
```bash
docker-compose up --build
```

2. Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

## API Documentation

API documentation is available at:
- Swagger UI: `/swagger/`
- ReDoc: `/redoc/`

## External Services

- **Firebase**: Real-time features and push notifications
- **MapBox**: Location services and mapping
- **PostgreSQL**: Primary database
- **Celery**: Background task processing

## Development Guidelines

1. **Code Style**
   - Follow PEP 8 guidelines
   - Use type hints
   - Write docstrings for all functions/classes

2. **Testing**
   - Write unit tests for all new features
   - Maintain minimum 80% code coverage
   - Run tests before committing

3. **Git Workflow**
   - Create feature branches from `develop`
   - Use meaningful commit messages
   - Submit pull requests for review

## Deployment

Deployment guides are available in `/docs/deployment/`

## License

[License information to be added] 