package com.tienda.backend.controller;

import com.tienda.backend.model.Producto;
import com.tienda.backend.model.VentaDetalle;
import com.tienda.backend.repository.ProductoRepository;
import com.tienda.backend.repository.VentaDetalleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private VentaDetalleRepository ventaDetalleRepository;

    // Obtener todos los productos
    @GetMapping
    public List<Producto> obtenerProductos() {
        return productoRepository.findAll();
    }

    // Guardar un producto nuevo
    @PostMapping
    public Producto guardarProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    // Borrar un producto por ID: http://localhost:8080/api/productos/1
    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoRepository.deleteById(id);
    }

    @GetMapping("/recientes-alzas")
    public List<Map<String, Object>> obtenerProductosConAlza() {
        LocalDateTime hace3Dias = LocalDateTime.now().minusDays(3);
        List<VentaDetalle> detallesRecientes = ventaDetalleRepository.findAll(); // O crear un query específico
        List<Producto> todosLosProductos = productoRepository.findAll();

        List<Map<String, Object>> listaAlzas = new ArrayList<>();

        for (Producto p : todosLosProductos) {
            // Buscamos si hubo ventas de este producto con un precio menor al actual
            boolean subio = detallesRecientes.stream()
                    .anyMatch(d -> d.getProductoId().equals(p.getId()) &&
                            d.getPrecioUnitario() < p.getPrecioVenta());

            if (subio) {
                Map<String, Object> map = new HashMap<>();
                map.put("nombre", p.getNombre());
                map.put("precioActual", p.getPrecioVenta());
                listaAlzas.add(map);
            }
        }
        return listaAlzas;
    }
}