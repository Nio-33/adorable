#!/bin/bash

# Create main project directory structure
mkdir -p adorable_backend/{apps,core,config,services,utils}

# Create apps directories
mkdir -p adorable_backend/apps/{users,locations,social,storage}/{migrations,templates,static}

# Create service directories
mkdir -p adorable_backend/services/{firebase,mapbox,email,storage}

# Create utility directories
mkdir -p adorable_backend/utils/{decorators,middleware,validators}

# Create core directories
mkdir -p adorable_backend/core/{auth,permissions,pagination}

# Create configuration directory
mkdir -p adorable_backend/config/{settings,urls}

# Create media and static directories
mkdir -p adorable_backend/media/{uploads,profile_pics,place_photos,chat_attachments}
mkdir -p adorable_backend/static/{css,js,img}

# Create necessary __init__.py files
find adorable_backend -type d -exec touch {}/__init__.py \;

# Move existing files to their new locations
mv users/models.py adorable_backend/apps/users/
mv locations/models.py adorable_backend/apps/locations/
mv social/models.py adorable_backend/apps/social/
mv storage/models.py adorable_backend/apps/storage/

mv adorable_backend/services/firebase.py adorable_backend/services/firebase/service.py
mv adorable_backend/services/mapbox.py adorable_backend/services/mapbox/service.py
mv adorable_backend/services/base.py adorable_backend/services/base_service.py

mv adorable_backend/utils/common.py adorable_backend/utils/helpers.py

# Create base configuration files
touch adorable_backend/config/settings/{base.py,local.py,production.py}
touch adorable_backend/config/urls/{base.py,api.py}

# Create Docker-related files
touch adorable_backend/Dockerfile
touch adorable_backend/docker-compose.yml

# Create documentation directory
mkdir -p adorable_backend/docs/{api,deployment,development}
touch adorable_backend/docs/README.md

# Create tests directory structure
mkdir -p adorable_backend/tests/{unit,integration,e2e}
touch adorable_backend/tests/conftest.py

# Set up Git
touch adorable_backend/.gitignore
touch adorable_backend/README.md

echo "Project structure created successfully!" 