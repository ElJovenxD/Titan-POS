
-- Borramos lo anterior para actualizar (Cuidado: esto borra datos si ya habías insertado algo)
DROP TABLE IF EXISTS detalle_compra, compras, productos, proveedores, dias_visita CASCADE;

-- 1. Tabla de Proveedores (Mejorada)
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    contacto_nombre VARCHAR(100),
    telefono VARCHAR(20)
);

-- 2. Nueva tabla para manejar múltiples días por proveedor
CREATE TABLE dias_visita (
    id SERIAL PRIMARY KEY,
    proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE CASCADE,
    dia_semana VARCHAR(15) CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'))
);

-- 3. Tabla de Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    stock_actual INTEGER DEFAULT 0,
    proveedor_id INTEGER REFERENCES proveedores(id)
);

-- 4. TABLA DE VENTAS (La que faltaba)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10,2) DEFAULT 0
);

-- 5. Detalle de Ventas (Para saber qué productos se fueron en cada venta)
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL -- Se guarda el precio al que se vendió en ese momento
);

CREATE TABLE deudores (
    id SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(255) NOT NULL,
    total_deuda DECIMAL(10,2) DEFAULT 0,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    telefono VARCHAR(15)
);

CREATE TABLE abonos_deuda (
    id SERIAL PRIMARY KEY,
    deudor_id INTEGER REFERENCES deudores(id) ON DELETE CASCADE,
    monto DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(20) -- 'COMPRA' o 'ABONO'
);

CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proveedor_id INTEGER REFERENCES proveedores(id)
);

CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    pin_actual VARCHAR(10) NOT NULL,
    correo_alertas VARCHAR(150) NOT NULL
);

-- Insertamos la configuración inicial (Solo habrá 1 fila siempre)
INSERT INTO configuracion (pin_actual, correo_alertas) VALUES ('1234', 'eviljjmz@gmail.com');

ALTER TABLE configuracion ADD COLUMN nombre_tienda VARCHAR(100) DEFAULT 'Los Chilangos';

-- Para asegurarnos de que la fila 1 tenga el nombre correcto:
UPDATE configuracion SET nombre_tienda = 'Los Chilangos' WHERE id = 1;

ALTER TABLE configuracion ADD COLUMN icono_tienda VARCHAR(255) DEFAULT '🏪';
UPDATE configuracion SET icono_tienda = '🏪' WHERE id = 1;

ALTER TABLE configuracion ALTER COLUMN icono_tienda TYPE TEXT;