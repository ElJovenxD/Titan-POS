package com.tienda.backend.repository;

import com.tienda.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Aquí ya tenemos métodos como save(), findAll() y delete() sin escribir SQL
}