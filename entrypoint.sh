#!/bin/bash
# entrypoint.sh - Script de arranque para SIS-L en Hugging Face Spaces
# Este script:
# 1. Espera a que MySQL esté disponible
# 2. Inicia el servidor Ollama
# 3. Descarga el modelo (neural-chat es más ligero que llama2)
# 4. Inicia la aplicación Node.js

set -e

echo "=== SIS-L Startup ==="

# 1. Esperar a MySQL
echo "⏳ Esperando a que MySQL esté disponible..."
./wait-for-db.sh mysql 3306

# 2. Iniciar Ollama en segundo plano (si está disponible)
if command -v ollama &> /dev/null; then
    echo "🚀 Iniciando Ollama..."
    ollama serve > /tmp/ollama.log 2>&1 &
    OLLAMA_PID=$!
    
    # Esperar a que Ollama esté listo
    sleep 5
    
    echo "📥 Descargando modelo neural-chat..."
    ollama pull neural-chat:latest || echo "⚠️ No se pudo descargar el modelo (probablemente sin conexión)"
else
    echo "⚠️ Ollama no está instalado, continuando sin IA..."
fi

# 3. Iniciar la aplicación Node.js
echo "📱 Iniciando SIS-L en puerto 7860..."
node server.js
