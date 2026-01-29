# Dockerfile para AMROIS System
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para libros con permisos
RUN mkdir -p /app/books /app/logs /app/uploads \
    && chown -R node:node /app

# Cambiar a usuario no-root
USER node

# Exponer puerto
EXPOSE 4123

# Variables de entorno
ENV NODE_ENV=production
ENV BOOKS_PATH=/app/books

# Comando de inicio
CMD ["npm", "start"]