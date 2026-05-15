# === Imagen Base ===
FROM node:20-alpine

# === Instalar Herramientas ===
RUN apk add --no-cache \
    netcat-openbsd \
    wget \
    curl \
    && rm -rf /var/cache/apk/*

# === Configurar Directorio de Trabajo ===
WORKDIR /app

# === Instalar Dependencias (antes de copiar código) ===
# Esto permite reutilizar la capa si el código cambia
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# === Copiar Código de la Aplicación ===
COPY . .

# === Hacer Script Ejecutable ===
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# === Puerto Requerido por Hugging Face Spaces ===
EXPOSE 7860

# === Health Check ===
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:7860/api/health || exit 1

# === Script de Arranque ===
ENTRYPOINT ["./entrypoint.sh"]