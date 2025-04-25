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
mkdir -p $DIST_DIR/public
cp -r $CLIENT_DIR/* $DIST_DIR/public/
mkdir -p $DIST_DIR/admin
cp -r $ADMIN_DIR/* $DIST_DIR/admin/

# 4. Vérification
echo "✅ Build réussi!"
echo "📁 Structure générée:"
find $DIST_DIR -type d | sed -e "s/[^-][^\/]*\// |/g" -e "s/|\([^ ]\)/└── \1/"

exit 0