-- CRM Básico - Configuración Inicial de Base de Datos
-- Ejecuta estos comandos en tu servidor MySQL

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS crm_basico 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE crm_basico;

-- Crear tabla de contactos
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    empresa VARCHAR(255),
    estado ENUM('prospecto', 'cliente', 'inactivo') DEFAULT 'prospecto',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para mejor rendimiento
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_nombre (nombre),
    FULLTEXT INDEX idx_busqueda (nombre, correo, empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo (opcional)
INSERT INTO contactos (nombre, correo, telefono, empresa, estado) VALUES
('Juan Pérez', 'juan.perez@ejemplo.com', '+1 (555) 123-4567', 'Empresa Demo S.A.', 'cliente'),
('María García', 'maria.garcia@ejemplo.com', '+1 (555) 234-5678', 'Tech Solutions', 'prospecto'),
('Carlos López', 'carlos.lopez@ejemplo.com', NULL, 'Freelancer', 'inactivo'),
('Ana Martínez', 'ana.martinez@ejemplo.com', '+1 (555) 345-6789', 'Innovate Corp', 'cliente'),
('Luis Rodríguez', 'luis.rodriguez@ejemplo.com', '+1 (555) 456-7890', NULL, 'prospecto');

-- Verificar que los datos se insertaron correctamente
SELECT * FROM contactos;

-- Mostrar estadísticas iniciales
SELECT 
    COUNT(*) as total_contactos,
    SUM(CASE WHEN estado = 'cliente' THEN 1 ELSE 0 END) as clientes,
    SUM(CASE WHEN estado = 'prospecto' THEN 1 ELSE 0 END) as prospectos,
    SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos
FROM contactos;

-- ================================================
-- TABLAS FUTURAS (comentadas por ahora)
-- ================================================

/*
-- Tabla para notas e interacciones
CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contacto_id INT NOT NULL,
    nota TEXT NOT NULL,
    tipo ENUM('llamada', 'email', 'reunion', 'nota', 'otro') DEFAULT 'nota',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE,
    INDEX idx_contacto_fecha (contacto_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para categorías/etiquetas
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#007bff',
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla relacional contacto-categorías (muchos a muchos)
CREATE TABLE IF NOT EXISTS contacto_categorias (
    contacto_id INT NOT NULL,
    categoria_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (contacto_id, categoria_id),
    FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para usuarios (autenticación futura)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso TIMESTAMP NULL,
    
    INDEX idx_correo (correo),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/
