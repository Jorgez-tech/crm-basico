# Usar la imagen oficial de Node.js ligera (Alpine)
FROM node:20-alpine

# Crear el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar los archivos package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias para producción (solo las necesarias, sin devDependencies)
RUN npm ci --only=production

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto que usará la aplicación. Cloud Run usa el puerto 8080 por defecto.
# (Tu código probablemente lee de process.env.PORT, lo cual es perfecto)
EXPOSE 8080

# Definir el comando para iniciar la aplicación (debería ser tu script 'start')
CMD ["npm", "start"]
