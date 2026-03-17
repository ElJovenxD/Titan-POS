package com.tienda.backend.controller;

import com.tienda.backend.model.Compra;
import com.tienda.backend.model.Producto;
import com.tienda.backend.repository.CompraRepository;
import com.tienda.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
public class CompraController {

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @PostMapping
    public Compra registrarCompra(@RequestBody Compra compra) {
        Producto p = productoRepository.findById(compra.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        p.setStockActual(p.getStockActual() + compra.getCantidad());
        p.setPrecioCompra(compra.getPrecioCompra());
        productoRepository.save(p);

        compra.setFecha(LocalDateTime.now());
        return compraRepository.save(compra);
    }

    @GetMapping("/recientes")
    public List<Compra> obtenerUltimasCompras() {
        return compraRepository.findAll();
    }
}