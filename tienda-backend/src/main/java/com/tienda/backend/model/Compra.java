package com.tienda.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "compras")
@Data
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long productoId;
    private Long proveedorId;
    private Integer cantidad;
    private Double precioCompra;
    private LocalDateTime fecha = LocalDateTime.now();
}
