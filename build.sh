#!/bin/bash

# Configuration
SERVER_DIR="server"
DIST_DIR="$SERVER_DIR/dist"
CLIENT_DIR="../client/public"
ADMIN_DIR="../admin/public"

# 1. Installation des dépendances
echo "🔨 Installation des dépendances..."
cd $SERVER_DIR
npm install --include=dev
if [ $? -ne 0 ]; then
  echo "❌ Échec de l'installation des dépendances"
  exit 1
fi

# 2. Compilation TypeScript
echo "⚙️ Compilation TypeScript..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Échec de la compilation"
  exit 1
fi

# 3. Copie des fichiers statiques
echo "📂 Copie des fichiers statiques..."
mkdir -p $DIST_DIR/client
mkdir -p $DIST_DIR/admin

cp -r $CLIENT_DIR/* $DIST_DIR/client/
cp -r $ADMIN_DIR/* $DIST_DIR/admin/

# 4. Vérification
echo "✅ Build réussi!"
echo "📁 Structure générée:"
tree -L 3 $DIST_DIR

exit 0