package com.tienda.backend.model;

import com.tienda.backend.repository.ProductoRepository;
import com.tienda.backend.repository.VentaDetalleRepository;
import com.tienda.backend.repository.VentaRepository;
import com.tienda.backend.model.DetalleVentaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private VentaDetalleRepository ventaDetalleRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Registra una venta completa:
     * 1. Crea la cabecera de la venta.
     * 2. Descuenta stock de cada producto.
     * 3. Guarda el detalle individual de cada artículo vendido.
     */
    @PostMapping
    public Venta registrarVenta(@RequestBody List<DetalleVentaDTO> detalles) { // <-- Cambiado de void a Venta
        double totalDeEstaVenta = 0;

        Venta nuevaVenta = new Venta();
        nuevaVenta.setTotalVenta(0.0);
        Venta ventaGuardada = ventaRepository.save(nuevaVenta);

        for (DetalleVentaDTO detalle : detalles) {
            Producto p = productoRepository.findById(detalle.getProductoId()).orElse(null);
            if (p != null) {
                p.setStockActual(p.getStockActual() - detalle.getCantidad());
                productoRepository.save(p);

                VentaDetalle vd = new VentaDetalle();
                vd.setVentaId(ventaGuardada.getId());
                vd.setProductoId(p.getId());
                vd.setProductoNombre(p.getNombre());
                vd.setCantidad(detalle.getCantidad());
                vd.setPrecioUnitario(p.getPrecioVenta());
                ventaDetalleRepository.save(vd);

                totalDeEstaVenta += (p.getPrecioVenta() * detalle.getCantidad());
            }
        }

        ventaGuardada.setTotalVenta(totalDeEstaVenta);
        return ventaRepository.save(ventaGuardada); // <-- Retornamos la venta finalizada
    }

    /**
     * Obtiene el total de dinero vendido en el día actual (Para el Dashboard).
     */
    @GetMapping("/hoy")
    public Map<String, Object> obtenerVentasHoy() {
        LocalDate hoy = LocalDate.now();

        // CORRECCIÓN: detalle_ventas y fecha_venta
        String sql = "SELECT " +
                "COALESCE(SUM(vd.precio_unitario * vd.cantidad), 0) as total_ventas, " +
                "COALESCE(SUM((vd.precio_unitario - p.precio_compra) * vd.cantidad), 0) as total_ganancia " +
                "FROM ventas v " +
                "JOIN detalle_ventas vd ON v.id = vd.venta_id " +
                "JOIN productos p ON vd.producto_id = p.id " +
                "WHERE CAST(v.fecha_venta AS DATE) = ?";

        try {
            return jdbcTemplate.queryForMap(sql, hoy);
        } catch (Exception e) {
            System.out.println("ERROR EN SQL: " + e.getMessage());
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("total_ventas", 0);
            errorMap.put("total_ganancia", 0);
            return errorMap;
        }
    }

    @GetMapping("/semana")
    public List<Map<String, Object>> obtenerVentasSemana() {
        // CORRECCIÓN: detalle_ventas y fecha_venta
        String sql = "SELECT " +
                "CAST(v.fecha_venta AS DATE) as fecha, " +
                "COALESCE(SUM(vd.precio_unitario * vd.cantidad), 0) as total, " +
                "COALESCE(SUM((vd.precio_unitario - p.precio_compra) * vd.cantidad), 0) as ganancia " +
                "FROM ventas v " +
                "JOIN detalle_ventas vd ON v.id = vd.venta_id " +
                "JOIN productos p ON vd.producto_id = p.id " +
                "WHERE v.fecha_venta >= CURRENT_DATE - INTERVAL '7 days' " +
                "GROUP BY CAST(v.fecha_venta AS DATE) " +
                "ORDER BY fecha ASC";

        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            System.out.println("ERROR EN GRAFICA SEMANAL: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Obtiene la lista de todas las ventas para el módulo de Historial.
     */
    @GetMapping("/historial")
    public List<Venta> obtenerHistorial() {
        return ventaRepository.findAll();
    }

    /**
     * Obtiene los productos específicos de una venta (Para el Modal de Detalle).
     */
    @GetMapping("/detalle/{ventaId}")
    public List<VentaDetalle> obtenerDetallesPorVenta(@PathVariable Long ventaId) {
        return ventaDetalleRepository.findByVentaId(ventaId);
    }

    @GetMapping("/corte-diario")
    public Map<String, Object> obtenerCorteDiario() {
        LocalDate hoy = LocalDate.now();

        try {
            // 1. Sumar Ventas (¡CORREGIDO LOS NOMBRES DE COLUMNAS!)
            Double ventasHoy = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(total_venta), 0) FROM ventas WHERE CAST(fecha_venta AS DATE) = ?",
                    Double.class, hoy);

            // 2. Sumar Abonos de Deudores
            Double abonosHoy = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(monto), 0) FROM abonos_deuda WHERE CAST(fecha AS DATE) = ? AND tipo = 'ABONO'",
                    Double.class, hoy);

            // 3. Sumar Compras a Proveedores
            Double comprasHoy = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(cantidad * precio_compra), 0) FROM compras WHERE CAST(fecha AS DATE) = ?",
                    Double.class, hoy);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("ventas", ventasHoy);
            respuesta.put("abonos", abonosHoy);
            respuesta.put("compras", comprasHoy);
            respuesta.put("totalCaja", (ventasHoy + abonosHoy) - comprasHoy);

            return respuesta;

        } catch (Exception e) {
            System.out.println("ERROR EN CORTE DE CAJA: " + e.getMessage());
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("ventas", 0.0);
            errorRes.put("abonos", 0.0);
            errorRes.put("compras", 0.0);
            errorRes.put("totalCaja", 0.0);
            return errorRes;
        }
    }
}