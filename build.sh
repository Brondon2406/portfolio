#!/bin/bash

# Configuration
SERVER_DIR="server"
DIST_DIR="server/dist"
CLIENT_SRC="client/public"
ADMIN_SRC="admin/public"

# Installation des dépendances
echo "🔨 Installing server dependencies..."
cd $SERVER_DIR
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Compilation TypeScript
echo "⚙️ Compiling TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
cd ..

# Copie des fichiers statiques
echo "📦 Copying static files..."
mkdir -p $DIST_DIR/client
mkdir -p $DIST_DIR/admin

[ -d "$CLIENT_SRC" ] && cp -r $CLIENT_SRC/* $DIST_DIR/client/
[ -d "$ADMIN_SRC" ] && cp -r $ADMIN_SRC/* $DIST_DIR/admin/

# Vérification
echo "✅ Build completed successfully!"
echo "📁 Final structure:"
tree -L 3 $DIST_DIR || find $DIST_DIR -maxdepth 3 -type d | sed 's|[^/]*/|   |g'

exit 0