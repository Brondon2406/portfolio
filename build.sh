#!/bin/bash

# Configuration
SERVER_DIR="server"
DIST_DIR="$SERVER_DIR/dist"
CLIENT_SRC="client/public"
ADMIN_SRC="admin/public"

# 1. Installer les dépendances
echo "🔨 Installation des dépendances..."
cd $SERVER_DIR
npm install
if [ $? -ne 0 ]; then
  echo "❌ Échec de l'installation des dépendances"
  exit 1
fi

# 2. Compiler TypeScript
echo "⚙️ Compilation TypeScript..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Échec de la compilation TypeScript"
  exit 1
fi
cd ..

# 3. Copier les fichiers statiques
echo "📂 Copie des fichiers statiques..."
mkdir -p $DIST_DIR/client
mkdir -p $DIST_DIR/admin

cp -r $CLIENT_SRC/* $DIST_DIR/client/
cp -r $ADMIN_SRC/* $DIST_DIR/admin/

# 4. Vérification finale
echo "✅ Build terminé avec succès!"
echo "📁 Structure générée:"
find $DIST_DIR -maxdepth 3 -type d | sed 's|[^/]*/|   |g'

exit 0