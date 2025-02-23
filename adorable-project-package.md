# Adorable Project - Complete Development Package

## Project Overview
Adorable is a location-based social discovery mobile application targeting the Lagos market, enabling users to discover places, connect with nearby users, and explore their city through an interactive map-based interface.

## Brand Identity

### Logo
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="#000080"/>
  <circle cx="70" cy="85" r="8" fill="white" />
  <circle cx="130" cy="85" r="8" fill="white" />
  <path d="M70 130 Q100 160 130 130" stroke="white" strokeWidth="8" fill="none" />
  <path d="M100 40 C60 40, 40 70, 40 100 C40 140, 100 160, 100 180 C100 160, 160 140, 160 100 C160 70, 140 40, 100 40" 
        fill="none" 
        stroke="white" 
        strokeWidth="8"/>
</svg>
```

### Color Palette
```css
/* Primary Colors */
--navy-blue: #000080;         /* Primary Brand Color */
--dark-indigo: #4B0082;       /* Secondary Brand Color */
--white: #FFFFFF;             /* Text on dark backgrounds */
--black: #000000;             /* Map background */

/* Secondary Colors */
--light-blue: #1E90FF;        /* Interactive elements */
--gray-400: #9CA3AF;         /* Secondary text */
--gray-600: #4B5563;         /* Disabled states */

/* UI Colors */
--success: #10B981;          /* Success states */
--error: #EF4444;           /* Error states */
--warning: #F59E0B;         /* Warning states */
--info: #3B82F6;            /* Information states */
```

### Typography
```css
/* Font Family */
--primary-font: 'Poppins', sans-serif;
--secondary-font: 'Inter', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

## Frontend Components (React Native/TypeScript)

### 1. Authentication
- Login Screen
- Sign Up Screen
- OTP Verification
- Profile Setup
- Password Reset

### 2. Main Navigation
- Bottom Tab Navigator
- Stack Navigator
- Drawer Navigator

### 3. Map Components
- Interactive Map View
- Location Markers
- Search Bar
- Category Filter
- Place Cards

### 4. Social Components
- User Profile
- Chat Interface
- User Discovery
- Connection Management
- Activity Feed

### 5. Place Discovery
- Place List
- Place Details
- Reviews & Ratings
- Photo Gallery
- Category Browser

### 6. Common UI Components
- Custom Buttons
- Input Fields
- Loading States
- Modal Windows
- Toast Messages

## Backend Components (Django/Python)

### 1. Authentication Service
```python
# authentication/services.py
class AuthenticationService:
    def user_registration(self)
    def user_login(self)
    def token_management(self)
    def social_auth(self)
```

### 2. User Service
```python
# users/services.py
class UserService:
    def profile_management(self)
    def preferences(self)
    def location_tracking(self)
    def social_connections(self)
```

### 3. Place Service
```python
# places/services.py
class PlaceService:
    def place_management(self)
    def categories(self)
    def reviews(self)
    def photos(self)
```

### 4. Chat Service
```python
# chat/services.py
class ChatService:
    def message_handling(self)
    def real_time_updates(self)
    def media_sharing(self)
```

### 5. Location Service
```python
# location/services.py
class LocationService:
    def geocoding(self)
    def place_search(self)
    def proximity_calculation(self)
```

## Database Schema (PostgreSQL)

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    profile_photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Places
```sql
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category_id INTEGER,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);
```

## API Endpoints

### Authentication
```plaintext
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/reset-password
```

### Users
```plaintext
GET /api/users/profile
PUT /api/users/profile
GET /api/users/nearby
POST /api/users/connect
```

### Places
```plaintext
GET /api/places
GET /api/places/{id}
POST /api/places/search
GET /api/places/categories
```

### Messages
```plaintext
GET /api/messages
POST /api/messages
GET /api/messages/{chat_id}
PUT /api/messages/read
```

## Development Setup

### Prerequisites
```bash
# Required software
node >= 16.0.0
python >= 3.9.0
postgresql >= 14.0
redis >= 6.0
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run start

# Run iOS
npm run ios

# Run Android
npm run android
```

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

## Deployment Configuration

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: adorable
      POSTGRES_USER: adorable_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
  
  redis:
    image: redis:6
```

## Testing Setup

### Frontend Tests
```typescript
// App.test.tsx
import { render, screen } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByTestId('app-container')).toBeTruthy();
  });
});
```

### Backend Tests
```python
# test_views.py
from django.test import TestCase
from rest_framework.test import APIClient

class UserAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_user_registration(self):
        response = self.client.post('/api/auth/register', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 201)
```

## Environment Variables
```plaintext
# .env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
DJANGO_SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://localhost/adorable
REDIS_URL=redis://localhost:6379
```

## Git Configuration
```plaintext
# .gitignore
node_modules/
venv/
*.pyc
.env
.DS_Store
build/
dist/
```

Would you like me to:
1. Add more detailed component specifications?
2. Provide additional configuration files?
3. Include more test examples?
4. Detail any specific aspect further?