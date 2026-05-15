#!/bin/bash
# entrypoint.sh - Script de arranque para SIS-L en Hugging Face Spaces
# Este script simplificado:
# 1. (Opcional) Espera a MySQL si está configurado
# 2. Inicia la aplicación Node.js en puerto 7860

set -e

echo "=== SIS-L Startup en Hugging Face Spaces ==="

# 1. Esperar a MySQL solo si DB_HOST está configurado y no es localhost
if [ ! -z "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ] && [ "$DB_HOST" != "127.0.0.1" ]; then
    echo "⏳ Esperando a que MySQL esté disponible en $DB_HOST:${DB_PORT:-3306}..."
    if [ -f "./wait-for-db.sh" ]; then
        ./wait-for-db.sh "$DB_HOST" "${DB_PORT:-3306}" || echo "⚠️ No se pudo conectar a MySQL, continuando de todas formas..."
    else
        echo "⚠️ wait-for-db.sh no encontrado, saltando validación de BD"
    fi
else
    echo "ℹ️ Sin base de datos configurada, ejecutando en modo offline"
fi

# 2. Mostrar información de inicio
echo "📱 Iniciando SIS-L en puerto 7860..."
echo "ℹ️ NODE_ENV=${NODE_ENV:-development}"
echo "ℹ️ API estará disponible en: http://localhost:7860/api"

# 3. Iniciar la aplicación Node.js
node server.js
