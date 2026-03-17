package com.tienda.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ventas")
@Data
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_venta")
    private LocalDateTime fechaVenta;

    @Column(name = "total_venta")
    private Double totalVenta;

    // Constructor para poner la fecha automáticamente
    public Venta() {
        this.fechaVenta = LocalDateTime.now();
    }
}