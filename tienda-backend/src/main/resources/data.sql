-- 1. CONFIGURACIÓN INICIAL (Para saltarnos la pantalla del cohete)
INSERT INTO configuracion (nombre_tienda, pin_actual, correo_alertas, password_correo, icono_tienda, tema, color_principal)
VALUES ('Abarrotes El Chido', '1234', 'tu_correo@gmail.com', 'clave123', '🏪', 'oscuro', 'success');

-- 2. PROVEEDORES (10 Registros)
INSERT INTO proveedores (nombre_empresa, contacto_nombre, telefono, dias_visita) VALUES
                                                                                     ('Coca-Cola FEMSA', 'Carlos Slim', '4771112233', 'Lunes y Jueves'),
                                                                                     ('PepsiCo', 'Luis Miguel', '4772223344', 'Martes'),
                                                                                     ('Grupo Bimbo', 'Osito Bimbo', '4773334455', 'Lunes, Miércoles y Viernes'),
                                                                                     ('Sabritas', 'Chester Cheetos', '4774445566', 'Jueves'),
                                                                                     ('Lácteos Lala', 'María Gómez', '4775556677', 'Todos los días'),
                                                                                     ('Alpura', 'Juan Pérez', '4776667788', 'Lunes y Jueves'),
                                                                                     ('Barcel', 'Pepe Nabor', '4777778899', 'Viernes'),
                                                                                     ('Gamesa', 'Emperador', '4778889900', 'Miércoles'),
                                                                                     ('Nestlé', 'Nescafé', '4779990011', 'Martes'),
                                                                                     ('Sigma (FUD)', 'Doña Lucha', '4770001122', 'Sábados');

-- 3. PRODUCTOS (30 Registros)
-- Los 'proveedor_id' coinciden con el orden de los insertados arriba
INSERT INTO productos (codigo_barras, nombre, precio_compra, precio_venta, stock_actual, proveedor_id) VALUES
                                                                                                           ('7501055300077', 'Coca-Cola 600ml No Retornable', 15.00, 18.00, 48, 1),
                                                                                                           ('7501055300084', 'Coca-Cola 3L Retornable', 32.00, 38.00, 24, 1),
                                                                                                           ('7501055300091', 'Sprite 600ml', 14.00, 17.00, 12, 1),
                                                                                                           ('7501055300107', 'Agua Ciel 1L', 10.00, 13.00, 20, 1),
                                                                                                           ('7501011111222', 'Pepsi 600ml', 13.50, 16.00, 24, 2),
                                                                                                           ('7501011111223', 'Mirinda 600ml', 13.00, 15.00, 12, 2),
                                                                                                           ('7501000111111', 'Pan Blanco Bimbo Grande', 38.00, 45.00, 10, 3),
                                                                                                           ('7501000111112', 'Mantecadas Bimbo (6 pz)', 18.00, 24.00, 15, 3),
                                                                                                           ('7501000111113', 'Donas Espolvoreadas Bimbo', 16.00, 22.00, 10, 3),
                                                                                                           ('7501000111114', 'Gansito Marinela', 12.00, 18.00, 30, 3),
                                                                                                           ('7501000111115', 'Pingüinos Marinela', 14.00, 20.00, 20, 3),
                                                                                                           ('7500000000001', 'Sabritas Sal 170g', 35.00, 42.00, 15, 4),
                                                                                                           ('7500000000002', 'Cheetos Torcidos Queso', 12.00, 16.00, 25, 4),
                                                                                                           ('7500000000003', 'Doritos Nacho 150g', 32.00, 38.00, 20, 4),
                                                                                                           ('7500000000004', 'Ruffles Queso', 33.00, 40.00, 15, 4),
                                                                                                           ('7502000200001', 'Leche Lala Entera 1L', 22.00, 26.00, 24, 5),
                                                                                                           ('7502000200002', 'Leche Lala Deslactosada 1L', 24.00, 28.00, 24, 5),
                                                                                                           ('7502000200003', 'Yoghurt Lala Fresa 250g', 10.00, 14.00, 12, 5),
                                                                                                           ('7503000300001', 'Leche Alpura Clásica 1L', 21.50, 25.50, 20, 6),
                                                                                                           ('7504000400001', 'Takis Fuego 62g', 14.00, 18.00, 30, 7),
                                                                                                           ('7504000400002', 'Chips Fuego', 30.00, 36.00, 15, 7),
                                                                                                           ('7505000500001', 'Galletas Emperador Chocolate', 14.00, 19.00, 20, 8),
                                                                                                           ('7505000500002', 'Chokis Clásicas', 15.00, 20.00, 20, 8),
                                                                                                           ('7505000500003', 'Galletas Marías Gamesa', 12.00, 16.00, 25, 8),
                                                                                                           ('7506000600001', 'Nescafé Clásico 120g', 65.00, 85.00, 10, 9),
                                                                                                           ('7506000600002', 'Chocolate Abuelita (Mesa)', 45.00, 55.00, 8, 9),
                                                                                                           ('7507000700001', 'Salchicha Viena FUD 1/2 kg', 35.00, 45.00, 10, 10),
                                                                                                           ('7507000700002', 'Jamón Virginia FUD 250g', 28.00, 38.00, 8, 10),
                                                                                                           ('7507000700003', 'Queso Panela FUD 400g', 42.00, 55.00, 5, 10),
                                                                                                           ('7508000800001', 'Huevos San Juan (Kilo)', 35.00, 42.00, 15, 10);

-- 4. DEUDORES (Fiados - 10 Registros)
INSERT INTO deudores (nombre_cliente, telefono, total_deuda, ultima_actividad) VALUES
                                                                                   ('Don Beto (Taller)', '4771231234', 150.50, CURRENT_TIMESTAMP),
                                                                                   ('Doña Mary (Tortillería)', '4772342345', 45.00, CURRENT_TIMESTAMP),
                                                                                   ('El Chino', '4773453456', 220.00, CURRENT_TIMESTAMP),
                                                                                   ('Familia López', '4774564567', 850.00, CURRENT_TIMESTAMP),
                                                                                   ('Doña Carmen', '4775675678', 35.00, CURRENT_TIMESTAMP),
                                                                                   ('Maestro albañil', '4776786789', 500.00, CURRENT_TIMESTAMP),
                                                                                   ('Paco el del taxi', '4777897890', 120.00, CURRENT_TIMESTAMP),
                                                                                   ('La muchacha estética', '4778908901', 65.50, CURRENT_TIMESTAMP),
                                                                                   ('Señor de los garrafones', '4779019012', 25.00, CURRENT_TIMESTAMP),
                                                                                   ('Primo Lalo', '4770120123', 340.00, CURRENT_TIMESTAMP);

-- 5. UN PAR DE COMPRAS Y VENTAS DE EJEMPLO
INSERT INTO ventas (fecha_venta, total_venta) VALUES
                                                  (CURRENT_TIMESTAMP, 54.00),
                                                  (CURRENT_TIMESTAMP, 36.00);

-- Detalle de las ventas (Los IDs de productos apuntan a las Cocas y Sabritas)
INSERT INTO detalle_ventas (cantidad, precio_unitario, producto_id, producto_nombre, venta_id) VALUES
                                                                                                   (2, 18.00, 1, 'Coca-Cola 600ml No Retornable', 1),
                                                                                                   (1, 18.00, 20, 'Takis Fuego 62g', 1),
                                                                                                   (2, 18.00, 10, 'Gansito Marinela', 2);