#!/bin/bash

# Configuration
CLIENT_DIR="client/public"
ADMIN_DIR="admin/public"
SERVER_DIR="server"
DIST_DIR="server/dist"

# Build du serveur
echo "🔨 Building server..."
cd $SERVER_DIR
npm install
npm run build
cd ..

# Copie des fichiers statiques
echo "📂 Copying static files..."
mkdir -p $DIST_DIR/client
mkdir -p $DIST_DIR/admin

cp -r $CLIENT_DIR/* $DIST_DIR/client/
cp -r $ADMIN_DIR/* $DIST_DIR/admin/

# Correction des chemins pour ES Modules
echo "🛠 Fixing module paths..."
find $DIST_DIR -type f -name "*.js" -exec sed -i 's/\.js"/"/g' {} \;

echo "✅ Build completed!"
echo "Structure créée :"
find $DIST_DIR -maxdepth 3 -type d | sed 's|[^/]*/|   |g'