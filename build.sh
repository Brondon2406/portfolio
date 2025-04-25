#!/bin/bash

# Configuration
SERVER_DIR="server"
DIST_DIR="$SERVER_DIR/dist"

# 1. Installer les dépendances avec les dépendances de développement
echo "🔨 Installation des dépendances..."
cd $SERVER_DIR
npm install --include=dev  # Important pour les @types
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

# 3. Vérification finale
echo "✅ Build serveur terminé avec succès!"
echo "📁 Contenu du dossier dist:"
ls -lh $DIST_DIR

exit 0