# Usamos Node.js versión 20 como base (como instalar Node en una PC nueva)
FROM node:20-alpine

# Instalamos netcat y wget para scripts
RUN apk add --no-cache netcat-openbsd wget

# Creamos una carpeta dentro del contenedor para tu proyecto
WORKDIR /app

# Copiamos primero el package.json para instalar dependencias
COPY package*.json ./

# Instalamos las dependencias (el npm install de siempre)
RUN npm install

# Copiamos el resto de tu código
COPY . .

# Copiar script de entrypoint
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Limpiar caché para reducir tamaño de imagen
RUN apk cache clean

# Le decimos a Docker que tu app usa el puerto 7860 (requerido para HF Spaces)
EXPOSE 7860

# El entrypoint que arranca Ollama, espera MySQL e inicia la app
ENTRYPOINT ["./entrypoint.sh"]