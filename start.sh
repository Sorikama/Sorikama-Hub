#!/bin/bash

echo "========================================"
echo "   SORIKAMA HUB - Démarrage"
echo "========================================"
echo ""

# Vérifier si MongoDB est installé
if ! command -v mongod &> /dev/null; then
    echo "[ERREUR] MongoDB n'est pas installé"
    echo ""
    echo "Installez MongoDB:"
    echo "  Mac:   brew install mongodb-community"
    echo "  Linux: sudo apt-get install mongodb"
    exit 1
fi

# Créer le dossier data si nécessaire
if [ ! -d "data/db" ]; then
    echo "[INFO] Création du dossier data/db..."
    mkdir -p data/db
fi

echo "[1/3] Démarrage de MongoDB..."
mongod --dbpath data/db > /dev/null 2>&1 &
sleep 3

echo "[2/3] Démarrage du Backend..."
cd backend && npm run dev > /dev/null 2>&1 &
cd ..
sleep 2

echo "[3/3] Démarrage du Frontend..."
cd frontend && npm run dev > /dev/null 2>&1 &
cd ..

echo ""
echo "========================================"
echo "   Tous les services démarrés !"
echo "========================================"
echo ""
echo "MongoDB:  http://localhost:27017"
echo "Backend:  http://localhost:7000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Connexion: admin@admin.fr / Admin@123"
echo ""
