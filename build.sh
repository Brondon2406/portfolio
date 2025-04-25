#!/bin/bash

# Configuration
SERVER_DIR="server"
DIST_DIR="$SERVER_DIR/dist"

echo "🔨 Nettoyage du dossier dist..."
rm -rf $DIST_DIR

echo "🔨 Installation des dépendances..."
cd $SERVER_DIR
npm install --include=dev

echo "⚙️ Compilation TypeScript..."
npm run build

echo "📂 Copie des fichiers statiques..."
mkdir -p $DIST_DIR/public
cp -r ../client/public/* $DIST_DIR/public/
mkdir -p $DIST_DIR/admin
cp -r ../admin/public/* $DIST_DIR/admin/

echo "✅ Build réussi!"
echo "📁 Structure générée:"
find $DIST_DIR -type d | sed -e "s/[^-][^\/]*\// |/g" -e "s/|\([^ ]\)/└── \1/"

exit 0