#!/bin/bash

# Configuration des chemins
CLIENT_SRC="client/public"
ADMIN_SRC="admin/public"
SERVER_DIR="server"
DIST_DIR="server/dist"
CLIENT_DIST="$DIST_DIR/client"
ADMIN_DIST="$DIST_DIR/admin"

# 1. Installation des dépendances du serveur
echo "🔨 Installation des dépendances du serveur..."
cd $SERVER_DIR
npm install
if [ $? -ne 0 ]; then
    echo "❌ Échec de l'installation des dépendances"
    exit 1
fi

# 2. Compilation TypeScript
echo "⚙️  Compilation du serveur TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Échec de la compilation TypeScript"
    exit 1
fi
cd ..

# 3. Création de la structure dist
echo "📂 Préparation de la structure de déploiement..."
mkdir -p $CLIENT_DIST
mkdir -p $ADMIN_DIST

# 4. Copie des fichiers statiques
echo "📦 Copie des fichiers clients..."
if [ -d "$CLIENT_SRC" ]; then
    cp -r $CLIENT_SRC/* $CLIENT_DIST/
else
    echo "⚠️  Avertissement : Dossier client non trouvé à $CLIENT_SRC"
fi

echo "📦 Copie des fichiers admin..."
if [ -d "$ADMIN_SRC" ]; then
    cp -r $ADMIN_SRC/* $ADMIN_DIST/
else
    echo "⚠️  Avertissement : Dossier admin non trouvé à $ADMIN_SRC"
fi

# 5. Vérification finale
echo "✅ Build terminé avec succès !"
echo "📁 Structure générée :"
echo "   ├── dist/"
echo "   │   ├── client/"
echo "   │   │   ├── index.html"
echo "   │   │   ├── assets/"
echo "   │   │   └── ..."
echo "   │   ├── admin/"
echo "   │   │   ├── index.html"
echo "   │   │   ├── assets/"
echo "   │   │   └── ..."
echo "   │   └── index.js"
echo "   └── ..."

# Vérification des fichiers critiques
check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ Fichier manquant : $1"
        exit 1
    fi
}

check_file "$CLIENT_DIST/index.html"
check_file "$ADMIN_DIST/index.html"
check_file "$DIST_DIR/index.js"

exit 0