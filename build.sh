#!/bin/bash

# Configuration
CLIENT_SRC="client/public"
ADMIN_SRC="admin/public"
SERVER_DIR="server"
DIST_DIR="server/dist"
CLIENT_DIST="$DIST_DIR/client"
ADMIN_DIST="$DIST_DIR/admin"

# Build du serveur
echo "🔨 Building server..."
cd $SERVER_DIR
npm install
npm run build
cd ..

# Copie des fichiers statiques
echo "📂 Copying static files..."
mkdir -p $CLIENT_DIST
mkdir -p $ADMIN_DIST

# Copie récursive en conservant les permissions
cp -rf $CLIENT_SRC/. $CLIENT_DIST/
cp -rf $ADMIN_SRC/. $ADMIN_DIST/

# Vérification
echo "✅ Build completed!"
echo "Structure créée :"
ls -R $DIST_DIR | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'