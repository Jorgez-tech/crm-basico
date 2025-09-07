-- railway-schema.sql
-- Estructura de base de datos para CRM Básico en Railway
-- Compatible con MySQL 8.x (InnoDB, utf8mb4)

-- Crear base de datos (Railway ya la crea, pero se incluye por trazabilidad)
CREATE DATABASE IF NOT EXISTS crm_basico 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE crm_basico;

-- Tabla principal de contactos
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    empresa VARCHAR(255),
    estado ENUM('prospecto', 'cliente', 'inactivo') DEFAULT 'prospecto',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_nombre (nombre),
    FULLTEXT INDEX idx_busqueda (nombre, correo, empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Puedes agregar aquí los scripts para tablas futuras en bloques separados.
