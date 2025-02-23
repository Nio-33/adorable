# Adorable Project Structure

```
adorable/
├── adorable_frontend/          # React Native application
│   ├── src/
│   │   ├── assets/            # Images, fonts, and other static files
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Shared components like buttons, inputs
│   │   │   ├── layout/        # Layout components like headers, containers
│   │   │   └── features/      # Feature-specific components
│   │   ├── config/           # Configuration files
│   │   │   ├── env.ts        # Environment configuration
│   │   │   └── firebase.ts   # Firebase configuration
│   │   ├── contexts/         # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── navigation/       # Navigation configuration
│   │   │   ├── stacks/       # Stack navigators
│   │   │   └── tabs/         # Tab navigators
│   │   ├── screens/          # Screen components
│   │   │   ├── auth/         # Authentication screens
│   │   │   └── main/         # Main app screens
│   │   ├── services/         # API and third-party service integrations
│   │   ├── store/            # State management
│   │   ├── styles/           # Global styles and themes
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions and helpers
│   ├── .env                  # Environment variables
│   ├── App.tsx              # Root component
│   └── index.js             # Entry point
│
├── adorable_backend/         # Backend application
│   ├── src/
│   │   ├── config/          # Backend configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── tests/               # Backend tests
│
├── docs/                    # Documentation
│   ├── api/                # API documentation
│   ├── frontend/           # Frontend documentation
│   └── backend/            # Backend documentation
│
├── .gitignore
├── README.md
├── docker-compose.yml      # Docker configuration
└── package.json            # Root package.json for development dependencies
```

## Directory Structure Guidelines

### Frontend (`adorable_frontend/`)

- `assets/`: Static files like images, fonts, etc.
- `components/`: Reusable UI components
  - `common/`: Shared components (buttons, inputs)
  - `layout/`: Layout components (headers, containers)
  - `features/`: Feature-specific components
- `config/`: Configuration files
- `contexts/`: React Context providers
- `hooks/`: Custom React hooks
- `navigation/`: Navigation configuration
- `screens/`: Screen components
- `services/`: API and third-party integrations
- `store/`: State management (Redux, MobX, etc.)
- `styles/`: Global styles and themes
- `types/`: TypeScript type definitions
- `utils/`: Utility functions

### Backend (`adorable_backend/`)

- `config/`: Configuration files
- `controllers/`: Request handlers
- `middleware/`: Express middleware
- `models/`: Database models
- `routes/`: API routes
- `services/`: Business logic
- `utils/`: Utility functions
- `tests/`: Backend tests

## Best Practices

1. **Component Organization**
   - Keep components small and focused
   - Use feature-based organization for complex components
   - Maintain consistent naming conventions

2. **State Management**
   - Use React Context for simple state
   - Consider Redux/MobX for complex state
   - Keep state logic separate from UI components

3. **Type Safety**
   - Use TypeScript consistently
   - Define interfaces for all data structures
   - Export types from a central location

4. **Code Style**
   - Follow ESLint and Prettier configurations
   - Use consistent naming conventions
   - Write meaningful comments and documentation

5. **Testing**
   - Write unit tests for utilities and services
   - Write integration tests for API endpoints
   - Use snapshot testing for components

6. **Security**
   - Keep sensitive data in .env files
   - Implement proper authentication
   - Follow security best practices

7. **Performance**
   - Implement proper code splitting
   - Optimize images and assets
   - Use performance monitoring tools 