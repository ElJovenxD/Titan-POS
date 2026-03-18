-- 1. Limpiamos TODO para empezar frescos
DROP TABLE IF EXISTS compras, abonos_deuda, deudores, detalle_ventas, ventas, productos, proveedores, dias_visita, configuracion CASCADE;

-- 2. Proveedores (Ya incluye dias_visita como columna de texto)
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    contacto_nombre VARCHAR(100),
    telefono VARCHAR(20),
    dias_visita VARCHAR(100) 
);

-- 3. Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    stock_actual INTEGER DEFAULT 0,
    proveedor_id INTEGER REFERENCES proveedores(id)
);

-- 4. Ventas
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10,2) DEFAULT 0
);

-- 5. Detalle de Ventas (Ya incluye producto_nombre)
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    producto_nombre VARCHAR(100),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- 6. Deudores
CREATE TABLE deudores (
    id SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(255) NOT NULL,
    total_deuda DECIMAL(10,2) DEFAULT 0,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    telefono VARCHAR(15)
);

-- 7. Historial de Fiados
CREATE TABLE abonos_deuda (
    id SERIAL PRIMARY KEY,
    deudor_id INTEGER REFERENCES deudores(id) ON DELETE CASCADE,
    monto DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(20)
);

-- 8. Compras / Entradas
CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proveedor_id INTEGER REFERENCES proveedores(id)
);

-- 9. Configuración del Sistema (Tabla unificada)
CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    pin_actual VARCHAR(10) NOT NULL,
    correo_alertas VARCHAR(150) NOT NULL,
    nombre_tienda VARCHAR(100) DEFAULT 'Los Chilangos',
    icono_tienda TEXT DEFAULT '🏪'
);

-- 10. Forzamos la inserción con el ID 1 para que Java no falle
INSERT INTO configuracion (id, pin_actual, correo_alertas, nombre_tienda, icono_tienda) 
VALUES (1, '1234', 'eviljjmz@gmail.com', 'Los Chilangos', '🏪');