# Dockerfile para AMROIS System
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    && rm -rf /var/cache/apk/*

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero
COPY package*.json ./

# Instalar dependencias y reconstruir módulos nativos
RUN npm ci && npm rebuild better-sqlite3

# Copiar código fuente
COPY . .

# Crear directorios con permisos específicos
RUN mkdir -p /app/books /app/logs /app/uploads \
    && chown node:node /app/logs /app/uploads

# Cambiar a usuario no-root
USER node

# Exponer puerto (estandarizado a 5467)
EXPOSE 5467

# Variables de entorno
ENV NODE_ENV=development
ENV BOOKS_PATH=/app/books

# Comando de inicio
CMD ["npm", "start"]