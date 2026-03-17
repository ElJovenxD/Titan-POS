package com.tienda.backend.controller;

import com.tienda.backend.model.Proveedor;
import com.tienda.backend.repository.ProveedorRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {
    private final ProveedorRepository repository;

    public ProveedorController(ProveedorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Proveedor> listar() { return repository.findAll(); }

    @PostMapping
    public Proveedor guardar(@RequestBody Proveedor p) { return repository.save(p); }
}